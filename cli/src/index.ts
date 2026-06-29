#!/usr/bin/env node
import WebSocket, { AddressInfo, WebSocketServer } from 'ws'

import { A2A, AssetType, links, PlatformSupport, proto, yml } from '@claudein.org/common'
import type { Shell } from '@versecafe/zcli'
import { cli, command, fmt, generateCompletionScript, generateVersion, positional } from '@versecafe/zcli'
import crypto from 'crypto'
import { watch } from 'fs'
import { cp, mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { createRequire } from 'module'
import { atom } from 'nanostores'
import open from 'open'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parse, stringify } from 'yaml'
import z from 'zod'

const { version } = createRequire(import.meta.url)('../package.json') as { version: string }

const DOMAIN = process.env.CIN_ENV === 'dev' ? 'localhost:3000' : 'claudein.org'


const hasher: { [key in AssetType]: (asset: Extract<proto.Asset, { type: key }>) => (string | undefined)[] } = {
  post({ text }) {
    return [text]
  },
  article({ markdown }) {
    return [markdown]
  },
  image({ title, description, base64 }) {
    return [title, description, base64]
  },
  video({ title, description, base64 }) {
    return [title, description, base64]
  }
}

function parts<T extends AssetType>(asset: Extract<proto.Asset, { type: T }>) {
  return hasher[asset.type](asset).filter(Boolean).join('|')
}

export function hash(asset: proto.Asset) {
  return crypto
    .createHash('sha256')
    .update(parts(asset))
    .digest('base64url')
    .substring(0, 16)
}

// A claudein project is a directory: claudein.yml at the root, brand.md for
// the brand description, media (images / video) under media/, and article
// markdown under articles/. The yml references assets by bare filename; these
// helpers resolve them to real paths on disk.
const ROOT = 'claudein'
const FS = {
  CLAUDIN_YML: `${ROOT}/claudein.yml`,
  BRAND_MD: `${ROOT}/brand.md`,
  MEDIA: `${ROOT}/media`,
  ARTICLES: `${ROOT}/articles`,
}



const A2A: A2A = {
  async post(post) { return post },
  async article({ src, ...info }) {
    const markdown = await readFile(src, 'utf-8')
    return { ...info, src, markdown }
  },

  async image({ src, ...info }) {
    const base64 = await readFile(src).then(buf => buf.toString('base64'))
    return { ...info, src, base64 }
  },

  async video({ src, ...info }) {
    const base64 = await readFile(src).then(buf => buf.toString('base64'))
    return { ...info, src, base64 }
  }
}

function a2a<T extends AssetType>(asset: Extract<yml.Asset, { type: T }>): Promise<Extract<proto.Asset, { type: T }>> {
  return A2A[asset.type](asset)
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const EXAMPLE_ARTICLE = 'welcome.md'

const sampleBrand = `# My Brand

A short description of your brand — what it is and who it is for.

## What makes it special

- The first thing that makes your brand stand out
- The second thing that makes your brand stand out
`

const sampleYml: yml.YML = {
  brand: {
    src: 'brand.md',
  },
  assets: [
    {
      type: 'post',
      created: formatter.format(new Date()),
      target: ['LinkedIn'],
      text: "I'm using ClaudeIn to share my thoughts and ideas!"
    },
    {
      type: 'article',
      created: formatter.format(new Date()),
      target: ['DEV.to'],
      src: EXAMPLE_ARTICLE,
    },
  ],
}

const sample = [
  '# yaml-language-server: $schema=https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml',
  stringify(sampleYml)
].join('\n\n')

const exampleArticle = `# Welcome to ClaudeIn

This is an example article. Articles are plain Markdown files that live in the
\`articles/\` folder and are referenced from \`claudein.yml\` by filename.

Edit this file — or ask Claude Code to write one for you — and the browser
preview updates the moment you save.
`

// Scaffold a fresh claudein/ project: claudein.yml + brand.md + empty media/
// and articles/ folders, seeded with a sample post and example article.
async function scaffold() {
  await mkdir(FS.MEDIA, { recursive: true })
  await mkdir(FS.ARTICLES, { recursive: true })

  await writeFile(FS.CLAUDIN_YML, sample, 'utf-8')
  await writeFile(FS.BRAND_MD, sampleBrand, 'utf-8')
  await writeFile(join(FS.ARTICLES, EXAMPLE_ARTICLE), exampleArticle, 'utf-8')

  console.log(`Created ${ROOT} with a sample post and article`)
}

// COMMANDS
const start = command('start')

  .meta({
    description: 'Start the live preview server. Claude Code writes your brand and posts to a claudein/ project (claudein.yml + media/ + articles/), you see the dashboard in the browser in real time, and can click to publish.',
    examples: ['cin start'],
  })

  .action(async ({ inputs: { dir } }) => {

    try {
      await readFile(FS.CLAUDIN_YML, 'utf-8')
    } catch {
      await scaffold()
    }

    const wss = new WebSocketServer({ port: 0 })
    const $bundle = atom<proto.Bundle | null>(null)
    const $info = atom<string>('')

    const watchArray: ReturnType<typeof watch>[] = []

    async function loadBundle() {
      try {

        const data = await readFile(FS.CLAUDIN_YML, 'utf-8')
        const { brand, assets } = yml.YML.parse(parse(data))

        watchArray.forEach(w => w.close())
        watchArray.length = 0

        for (const asset of assets) {
          for (const platform of asset.target) {
            if (!PlatformSupport[platform]?.includes(asset.type)) {
              console.warn(`⚠ ${platform} does not support '${asset.type}' posts (created: ${asset.created})`)
            }
          }
        }

        const Watcher: { [key in AssetType]: (asset: Extract<yml.Asset, { type: key }>) => string[] } = {
          post: () => [],
          article: ({ src }) => [join(FS.ARTICLES, src)],
          image: ({ src }) => [join(FS.MEDIA, src)],
          video: ({ src }) => [join(FS.MEDIA, src)]
        }

        function watcher<T extends AssetType>(asset: Extract<yml.Asset, { type: T }>) {
          return Watcher[asset.type](asset)
        }

        const mediaPaths = [
          join(ROOT, brand.src),
          ...assets.flatMap(watcher)
        ]

        mediaPaths.forEach(src => {
          try {
            watchArray.push(watch(src, loadBundle))
          } catch {
            // asset not present yet — it'll be picked up on the next file edit
          }
        })

        const brandMarkdown = await readFile(FS.BRAND_MD, 'utf-8')
        const protoBrand: proto.Brand = {
          src: brand.src,
          markdown: brandMarkdown,
        }

        const protoAssets = await Promise.all(assets.map(a2a))
        const payloads = protoAssets
          .map<proto.Payload>((asset) => ({ hash: hash(asset), asset }))
          .sort((a, b) => b.asset.created.localeCompare(a.asset.created))

        $bundle.set({ brand: protoBrand, payloads })
      } catch (err) {
        console.error('Failed to load brand:', err)
      }
    }


    wss.on('connection', (ws) => {
      const current = $info.get()
      if (current) ws.send(current)
    })

    $bundle.subscribe((bundle) => {
      if (bundle) $info.set(JSON.stringify(bundle))
    })

    $info.subscribe((info) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(info)
      })
    })

    watch(FS.CLAUDIN_YML, loadBundle)
    await loadBundle()

    const { port } = wss.address() as AddressInfo
    open(`https://${DOMAIN}${links.dash.port(port)}`)
  })

const versionCmd = command('version')
  .meta({ description: 'Print the version number' })
  .action(() => {
    console.log(generateVersion('cin', version))
  })

const skillsInstallCmd = command('install')
  .meta({ description: 'Install claudein skills into ~/.claude/skills/' })
  .action(async () => {
    const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
    const skillsDir = join(pkgRoot, 'skills')
    const targetBase = join(homedir(), '.claude', 'skills')

    await mkdir(targetBase, { recursive: true })

    const entries = await readdir(skillsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const dst = join(targetBase, entry.name)
      await cp(join(skillsDir, entry.name), dst, { recursive: true })
      console.log(fmt.success(`Installed ${entry.name} → ${dst}`))
    }
  })

const skillsCmd = command('skills')
  .meta({ description: 'Manage Claude Code skills' })
  .use(skillsInstallCmd)

let cinRef: ReturnType<typeof cli>

const completionCmd = command('completion')
  .meta({
    description: 'Generate shell completion script',
    examples: ['cin completion bash >> ~/.bashrc', 'cin completion fish > ~/.config/fish/completions/cin.fish'],
  })
  .inputs({
    shell: positional(
      z.enum(['bash', 'zsh', 'fish', 'powershell']).describe('Shell to generate completions for'),
      0
    ),
  })
  .action(({ inputs: { shell } }) => {
    console.log(generateCompletionScript(cinRef._config, shell as Shell))
  })

cinRef = cli('cin', { version })
  .use(start)
  .use(skillsCmd)
  .use(versionCmd)
  .use(completionCmd)

cinRef.run()
