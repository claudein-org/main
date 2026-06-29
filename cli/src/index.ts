#!/usr/bin/env node
import WebSocket, { AddressInfo, WebSocketServer } from 'ws'

import { links, PostType, proto, yml } from '@claudein.org/common'
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


const hasher: { [key in PostType]: (post: Extract<proto.Post, { type: key }>) => (string | undefined)[] } = {
  text({ text }) {
    return [text]
  },
  article({ markdown }) {
    return [markdown]
  },
  media({ text, media: { title, description, base64 } }) {
    return [text, title, description, base64]
  }
}

function parts<T extends PostType>(post: Extract<proto.Post, { type: T }>) {
  return hasher[post.type](post).filter(Boolean).join('|')
}

export function hash(post: proto.Post) {
  return crypto
    .createHash('sha256')
    .update(parts(post))
    .digest('base64url')
    .substring(0, 16)
}

// A claudein project is a directory: claudein.yml at the root, brand.md for
// the brand description, media (images / video) under media/, and article
// markdown under articles/. The yml references assets by bare filename; these
// helpers resolve them to real paths on disk.
const YML_FILE = 'claudein.yml'
const BRAND_FILE = 'brand.md'

function mediaPath(dir: string, src: string) {
  return join(dir, 'media', src)
}

function articlePath(dir: string, src: string) {
  return join(dir, 'articles', src)
}

const P2P: { [key in PostType]: (post: Extract<yml.Post, { type: key }>, dir: string) => Promise<Extract<proto.Post, { type: key }>> } = {
  async text(post) {
    return post
  },

  async article(post, dir) {
    const markdown = await readFile(articlePath(dir, post.src), 'utf-8')
    return { ...post, markdown }
  },

  async media({ media, ...info }, dir) {
    const base64 = await readFile(mediaPath(dir, media.src)).then(buf => buf.toString('base64'))
    return {
      ...info,
      media: {
        ...media,
        base64,
      }
    }
  }
}

function p2p<T extends PostType>(post: Extract<yml.Post, { type: T }>, dir: string): Promise<Extract<proto.Post, { type: T }>> {
  return P2P[post.type](post, dir)
}

function ps2ps(posts: yml.Post[], dir: string): Promise<proto.Post[]> {
  return Promise.all(posts.map((post) => p2p(post, dir)))
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
  posts: [
    {
      type: 'text',
      created: formatter.format(new Date()),
      platforms: ['LinkedIn'],
      text: "I'm using ClaudeIn to share my thoughts and ideas!"
    },
    {
      type: 'article',
      created: formatter.format(new Date()),
      platforms: ['LinkedIn'],
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
async function scaffold(dir: string) {
  await mkdir(join(dir, 'media'), { recursive: true })
  await mkdir(join(dir, 'articles'), { recursive: true })
  await writeFile(join(dir, YML_FILE), sample, 'utf-8')
  await writeFile(join(dir, BRAND_FILE), sampleBrand, 'utf-8')
  await writeFile(articlePath(dir, EXAMPLE_ARTICLE), exampleArticle, 'utf-8')
  console.log(`Created ${join(dir, YML_FILE)} with a sample post and article`)
}

// COMMANDS
const start = command('start')

  .meta({
    description: 'Start the live preview server. Claude Code writes your brand and posts to a claudein/ project (claudein.yml + media/ + articles/), you see the dashboard in the browser in real time, and can click to publish.',
    examples: ['cin start', 'cin start my-brand'],
  })

  .inputs({
    dir: positional(z
      .string()
      .describe('Path to a claudein project directory'), 0)
      .default('claudein'),
  })

  .action(async ({ inputs: { dir } }) => {

    const file = join(dir, YML_FILE)

    try {
      await readFile(file)
    } catch {
      await scaffold(dir)
    }

    const wss = new WebSocketServer({ port: 0 })
    const $bundle = atom<proto.Bundle | null>(null)
    const $info = atom<string>('')

    const mediaWatchers: ReturnType<typeof watch>[] = []

    async function loadBundle() {
      try {

        const data = await readFile(file, 'utf-8')
        const { brand, posts } = yml.YML.parse(parse(data))

        mediaWatchers.forEach(w => w.close())
        mediaWatchers.length = 0
        const mediaPaths = [
          join(dir, brand.src),
          ...posts.flatMap(post => post.type === 'media' ? [mediaPath(dir, post.media.src)] : []),
          ...posts.flatMap(post => post.type === 'article' ? [articlePath(dir, post.src)] : []),
        ]
        mediaPaths.forEach(src => {
          try {
            mediaWatchers.push(watch(src, loadBundle))
          } catch {
            // asset not present yet — it'll be picked up on the next file edit
          }
        })

        const brandMarkdown = await readFile(join(dir, brand.src), 'utf-8')
        const protoBrand: proto.Brand = {
          src: brand.src,
          markdown: brandMarkdown,
        }

        const protoPosts = await ps2ps(posts, dir)
        const payloads = protoPosts
          .map((post) => ({ hash: hash(post), post }))
          .sort((a, b) => b.post.created.localeCompare(a.post.created))

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

    watch(file, loadBundle)
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
