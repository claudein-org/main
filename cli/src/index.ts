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
import { stableHash } from 'stable-hash'
import { fileURLToPath } from 'url'
import { parse, stringify } from 'yaml'
import z from 'zod'

const { version } = createRequire(import.meta.url)('../package.json') as { version: string }

const DOMAIN = process.env.CIN_ENV === 'dev' ? 'localhost:3000' : 'claudein.org'

export function hash(post: proto.Post) {
  return crypto
    .createHash('sha256')
    .update(stableHash(post))
    .digest('base64url')
    .substring(0, 16)
}


const P2P: { [key in PostType]: (post: Extract<yml.Post, { type: key }>) => Promise<Extract<proto.Post, { type: key }>> } = {
  async text(post) {
    return post
  },

  async media({ media, ...info }) {
    const base64 = await readFile(media.src).then((buf) => buf.toString('base64'))
    return {
      ...info,
      media: {
        ...media,
        base64,
      }
    }
  }
}

function p2p<T extends PostType>(post: Extract<yml.Post, { type: T }>): Promise<Extract<proto.Post, { type: T }>> {
  return P2P[post.type](post)
}

function ps2ps(posts: yml.Posts): Promise<proto.Post[]> {
  return Promise.all(posts.posts.map((post) => p2p(post)))
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

const posts: yml.Posts = {
  posts: [{
    type: 'text',
    created: formatter.format(new Date()),
    text: "I'm using ClaudeIn to share my thoughts and ideas!"
  }]
}

const sample = [
  '# yaml-language-server: $schema=https://raw.githubusercontent.com/claudein-org/main/refs/heads/main/claudein.schema.yml',
  stringify(posts)
].join('\n\n')

// COMMANDS
const start = command('start')

  .meta({
    description: 'Start the live preview server. Claude Code writes posts to a .yml file, you see them in the browser in real time, and can click to post to LinkedIn.',
    examples: ['cin start', 'cin start my-posts.yml'],
  })

  .inputs({
    file: positional(z
      .string()
      .describe('Path to a .yml posts file'), 0)
      .default('posts.yml'),
  })

  .action(async ({ inputs: { file } }) => {

    try {
      await readFile(file)
    } catch {
      await writeFile(file, sample, 'utf-8')
      console.log(`Created ${file} with a sample post`)
    }

    const wss = new WebSocketServer({ port: 0 })
    const $payloads = atom<proto.Payload[]>([])
    const $info = atom<string>('')

    const mediaWatchers: ReturnType<typeof watch>[] = []

    async function loadPosts() {
      try {

        const data = await readFile(file, 'utf-8')
        const posts = yml.Posts.parse(parse(data))

        mediaWatchers.forEach(w => w.close())
        mediaWatchers.length = 0
        posts.posts.forEach(post => {
          if (post.type === 'media') {
            mediaWatchers.push(watch(post.media.src, loadPosts))
          }
        })

        const protoPosts = await ps2ps(posts)
        const payloads = protoPosts
          .map((post) => ({ hash: hash(post), post }))
          .sort((a, b) => b.post.created.localeCompare(a.post.created))

        $payloads.set(payloads)
      } catch (err) {
        console.error('Failed to load posts:', err)
      }
    }


    wss.on('connection', (ws) => {
      const current = $info.get()
      if (current) ws.send(current)
    })

    $payloads.subscribe((payloads) => {
      $info.set(JSON.stringify(payloads))
    })

    $info.subscribe((info) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) client.send(info)
      })
    })

    watch(file, loadPosts)
    await loadPosts()

    const { port } = wss.address() as AddressInfo
    open(`https://${DOMAIN}${links.post.port(port)}`)
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
