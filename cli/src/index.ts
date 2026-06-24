#!/usr/bin/env node
import WebSocket, { AddressInfo, WebSocketServer } from 'ws'

import { links, PostType, proto, yml } from '@claudein.org/common'
import { cli, command, positional } from '@versecafe/zcli'
import crypto from 'crypto'
import { watch } from 'fs'
import { readFile } from 'fs/promises'
import { atom } from 'nanostores'
import open from 'open'
import { stableHash } from 'stable-hash'
import { parse } from 'yaml'
import z from 'zod'

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

  async image({ image, ...info }) {
    return {
      ...info,
      image: {
        ...image,
        base64: await readFile(image.src)
          .then((data) => data.toString('base64'))
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

const start = command('start')

  .meta({
    description: 'Start the client server and open a preview of a posts .yml file in the browser',
    examples: ['cin start my-posts.yml'],
  })

  .inputs({
    file: positional(z.string().describe('Path to a .yml posts file'), 0),
  })

  .action(async ({ inputs: { file } }) => {

    const wss = new WebSocketServer({ port: 0 })
    const $payloads = atom<proto.Payload[]>([])
    const $info = atom<string>('')

    async function loadPosts() {
      const data = await readFile(file, 'utf-8')
      const posts = yml.Posts.parse(parse(data))
      const protoPosts = await ps2ps(posts)
      const payloads = protoPosts
        .map((post) => ({ hash: hash(post), post }))
        .sort((a, b) => a.post.created.localeCompare(b.post.created))

      $payloads.set(payloads)
    }


    wss.on('connection', (ws) => {
      console.log('Client connected')
      const unsub = $info.subscribe((info) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(info)
      })

      ws.on('close', unsub)
    })

    $payloads.subscribe((payloads) => {
      $info.set(JSON.stringify(payloads))
    })

    watch(file, loadPosts)
    await loadPosts()

    const { port } = wss.address() as AddressInfo
    open(`https://${DOMAIN}${links.post.port(port)}`)
  })

cli('cin').use(start).run()
