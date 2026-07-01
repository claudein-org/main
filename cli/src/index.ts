#!/usr/bin/env node
import WebSocket, { AddressInfo, WebSocketServer } from 'ws'

import { A2A, AssetType, links, PlatformSupport, proto, yml } from '@claudein.org/common'
import type { Shell } from '@versecafe/zcli'
import { cli, command, fmt, generateCompletionScript, generateVersion, positional } from '@versecafe/zcli'
import crypto from 'crypto'
import { watch } from 'fs'
import { mkdir, readdir, readFile, writeFile } from 'fs/promises'
import { createRequire } from 'module'
import { atom } from 'nanostores'
import open from 'open'
import { homedir } from 'os'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { parse, stringify } from 'yaml'
import z from 'zod'
import { MISSING_IMAGE_BASE64, MISSING_VIDEO_BASE64 } from './error'

const { version } = createRequire(import.meta.url)('../package.json') as { version: string }

const DOMAIN = process.env.CIN_ENV === 'dev' ? 'localhost:3000' : 'claudein.org'


export interface Folder {
  type: 'folder'
  name: string
  description: string
  children?: Array<Folder | File>
}

export interface File {
  type: 'file'
  name: string
  description: string
}

export type FSNode = Folder | File
export const claudein = {
  type: 'folder',
  name: 'claudein',
  description: 'ClaudeIn root folder',
  children: [
    {
      type: 'file',
      name: 'claudein.yml',
      description: 'The main data file for claudein contains all the posts, articles, etc... with reference to the content files (media, articles .md files, etc...)',
    },
    {
      type: 'folder',
      name: 'media',
      description: 'Media files for claudein. This folder contains soft links to relevant media files in the project and actual media files that was created especially for claudein.',
    },
    {
      type: 'folder',
      name: 'articles',
      description: 'A folder that contains .md files, each .md file is a full, self contained short article to be published on supported platforms.',
    },
  ]
} as const satisfies Folder

type Join<Prefix extends string, Name extends string> =
  Prefix extends '' ? Name : `${Prefix}/${Name}`

type PathsOf<T extends FSNode, Prefix extends string = ''> =
  T extends { name: infer N extends string }
  ? T extends { type: 'file' }
  ? Join<Prefix, N>
  : T extends { type: 'folder'; children?: infer C }
  ? C extends readonly FSNode[]
  ? Join<Prefix, N> | PathsFromChildren<C, Join<Prefix, N>>
  : Join<Prefix, N>
  : never
  : never

type PathsFromChildren<T extends readonly FSNode[], Prefix extends string> =
  T extends readonly [infer Head extends FSNode, ...infer Tail extends FSNode[]]
  ? PathsOf<Head, Prefix> | PathsFromChildren<Tail, Prefix>
  : never

type Path = PathsOf<typeof claudein>

const FS = {
  root: 'claudein',
  claudein_yml: 'claudein/claudein.yml',
  articles: 'claudein/articles',
  media: 'claudein/media',
} as const satisfies Record<string, Path>


export type WithPath = (File | Folder) & { path: string[] }

// Flatten f and all its descendants into a list of entries, each annotated
// with its path (as name segments) from root down to that entry.
export function tree(f: Folder, root: string[] = []): WithPath[] {
  const path = [...root, f.name]
  const children = (f.children ?? []).flatMap<WithPath>(child =>
    child.type === 'folder'
      ? tree(child, path)
      : [{ ...child, path: [...path, child.name] }]
  )
  return [{ ...f, path }, ...children]
}

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

// A claudein project is a directory: claudein.yml at the root, media (images
// / video) under media/, and article markdown under articles/. The yml
// references assets by bare filename; these helpers resolve them to real
// paths on disk.



const A2A: A2A = {
  async post(post) { return post },
  async article({ src, ...info }) {
    const path = join(FS.articles, src)
    let markdown: string
    try {
      markdown = await readFile(path, 'utf-8')
    } catch {
      console.warn(`⚠ Article not found: ${path}`)
      markdown = `> **Article not found:** \`${src}\` — create this file at \`${path}\` to fill in the content.`
    }
    return { ...info, src, markdown }
  },

  async image({ src, ...info }) {
    const path = join(FS.media, src)
    let base64: string
    try {
      base64 = await readFile(path).then(buf => buf.toString('base64'))
    } catch {
      console.warn(`⚠ Image not found: ${path}, using placeholder`)
      base64 = MISSING_IMAGE_BASE64
    }
    return { ...info, src, base64 }
  },

  async video({ src, ...info }) {
    const path = join(FS.media, src)
    let base64: string
    try {
      base64 = await readFile(path).then(buf => buf.toString('base64'))
    } catch {
      console.warn(`⚠ Video not found: ${path}, using placeholder`)
      base64 = MISSING_VIDEO_BASE64
    }
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

const sampleYml: yml.YML = {
  assets: [
    {
      type: 'post',
      created: formatter.format(new Date()),
      schedule: formatter.format(new Date()),
      target: ['LinkedIn'],
      text: "I'm using ClaudeIn to share my thoughts and ideas!"
    },
    {
      type: 'article',
      created: formatter.format(new Date()),
      schedule: formatter.format(new Date()),
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

// Create f and all its subfolders on disk under root, and touch (create if
// missing, never overwrite) every file in the tree.

type FSType = FSNode['type']
const Toucher: { [key in FSType]: (child: Extract<FSNode, { type: key }>, path: string) => Promise<void> } = {
  folder: (child, path) => touch(child, path),
  file: async (child, path) => {
    try {
      await writeFile(join(path, child.name), '', { flag: 'wx' })
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err
    }
  }
}

function toucher<T extends FSType>(child: Extract<FSNode, { type: T }>, path: string) {
  return Toucher[child.type](child, path)
}

async function touch(f: Folder, root: string = '.') {
  const path = join(root, f.name)
  await mkdir(path, { recursive: true })

  for (const child of f.children ?? []) {
    await toucher(child, path)
  }
}

// Scaffold a fresh claudein/ project: claudein.yml + empty media/ and
// articles/ folders, seeded with a sample post and example article.
async function scaffold() {
  await touch(claudein)

  await writeFile(FS.claudein_yml, sample, 'utf-8')

  await writeFile(join(FS.articles, EXAMPLE_ARTICLE), exampleArticle, 'utf-8')

  console.log(`Created ${FS.root} with a sample post and article`)
}

// COMMANDS
const start = command('start')

  .meta({
    description: 'Start the live preview server. Claude Code writes posts to a claudein/ project (claudein.yml + media/ + articles/), you see the dashboard in the browser in real time, and can click to publish.',
    examples: ['cin start'],
  })

  .action(async ({ inputs: { dir } }) => {

    try {
      await readFile(FS.claudein_yml, 'utf-8')
    } catch {
      await scaffold()
    }

    const wss = new WebSocketServer({ port: 0 })
    const $bundle = atom<proto.Bundle | null>(null)
    const $info = atom<string>('')

    const watchArray: ReturnType<typeof watch>[] = []

    async function loadBundle() {
      try {

        const data = await readFile(FS.claudein_yml, 'utf-8')

        let parsed: yml.YML
        try {
          parsed = yml.YML.parse(parse(data))
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.error(`❌ Failed to parse claudein.yml: ${msg}`)
          return
        }
        const { assets } = parsed

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
          article: ({ src }) => [join(FS.articles, src)],
          image: ({ src }) => [join(FS.media, src)],
          video: ({ src }) => [join(FS.media, src)]
        }

        function watcher<T extends AssetType>(asset: Extract<yml.Asset, { type: T }>) {
          return Watcher[asset.type](asset)
        }

        const mediaPaths = [
          ...assets.flatMap(watcher)
        ]

        mediaPaths.forEach(src => {
          try {
            watchArray.push(watch(src, loadBundle))
          } catch {
            // asset not present yet — it'll be picked up on the next file edit
          }
        })

        const protoAssets = await Promise.all(assets.map(a2a))
        const payloads = protoAssets
          .map<proto.Payload>((asset) => ({ hash: hash(asset), asset }))
          .sort((a, b) => b.asset.created.localeCompare(a.asset.created))

        $bundle.set({ payloads })
      } catch (err) {
        console.error('Failed to load bundle:', err)
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

    watch(FS.claudein_yml, loadBundle)
    await loadBundle()

    const { port } = wss.address() as AddressInfo
    const url = `https://${DOMAIN}${links.dash.port(port)}`
    console.log(fmt.success(`✅ Live preview server running at ${url}`))
    open(url)
  })

const versionCmd = command('version')
  .meta({ description: 'Print the version number' })
  .action(() => {
    console.log(generateVersion('cin', version))
  })

// Render a tree() listing as indented, commented text for embedding in a
// Claude Code command file, e.g.:
//   claudein/                # ClaudeIn root folder
//     claudein.yml            # The main data file for claudein ...
function renderTree(entries: WithPath[]) {
  return entries
    .map(({ name, type, description, path }) => {
      const indent = '  '.repeat(path.length - 1)
      const label = type === 'folder' ? `${name}/` : name
      return `${indent}${label} — ${description}`
    })
    .join('\n')
}

const initCmd = command('init')
  .meta({
    description: 'Scaffold a claudein/ project and install the claudein-init / claudein-update Claude Code commands into ~/.claude/commands/',
    examples: ['cin init'],
  })
  .action(async () => {
    await touch(claudein)
    console.log(fmt.success(`Created ${FS.root}/ project structure`))

    const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
    const commandsDir = join(pkgRoot, 'commands')
    const targetBase = join(homedir(), '.claude', 'commands')

    await mkdir(targetBase, { recursive: true })

    const treeText = renderTree(tree(claudein))

    const entries = await readdir(commandsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const raw = await readFile(join(commandsDir, entry.name), 'utf-8')
      const dst = join(targetBase, entry.name)
      await writeFile(dst, raw.replaceAll('{{TREE}}', treeText), 'utf-8')
      console.log(fmt.success(`Installed ${entry.name} → ${dst}`))
    }

    console.log(fmt.success(`✅ ClaudeIn project initialized. Reload Claude Code for the new commands to take effect.`))
  })

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
  .use(initCmd)
  .use(versionCmd)
  .use(completionCmd)

cinRef.run()
