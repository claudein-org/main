#!/usr/bin/env node
import WebSocket, { AddressInfo, WebSocketServer } from 'ws'

import { links, ws, yml } from '@claudein.org/common'
import { cli, command, positional } from '@versecafe/zcli'
import { watch } from 'fs'
import { readFile } from 'fs/promises'
import open from 'open'
import { parse } from 'yaml'
import z from 'zod'

const DOMAIN = process.env.CIN_ENV === 'dev' ? 'localhost:3000' : 'claudein.org'

async function i2i(image: yml.Image): Promise<ws.Image> {
  const data = await readFile(image.src)
  return {
    ...image,
    base64: data.toString('base64'),
  }
}

async function p2p(post: yml.Post): Promise<ws.Post> {
  return {
    ...post,
    image: post.image ? await i2i(post.image) : undefined,
  }
}

export async function ps2ps({ posts }: yml.Posts): Promise<ws.Payload> {
  return {
    posts: await Promise.all(posts.map(p2p))
  }
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
    const data = await readFile(file, 'utf-8')
    const posts = yml.Posts.parse(parse(data))
    const wsPosts = await ps2ps(posts)

    const wss = new WebSocketServer({ port: 0 })
    const cons: WebSocket[] = []

    async function broadcast() {
      const data = await readFile(file, 'utf-8')
      const posts = yml.Posts.parse(parse(data))
      const payload = JSON.stringify(await ps2ps(posts))
      for (const con of cons) con.send(payload)
    }

    watch(file, () => broadcast().catch(console.error))

    wss.on('connection', (ws) => {
      console.log('Client connected')
      cons.push(ws)
      ws.send(JSON.stringify(wsPosts))
      ws.on('close', () => cons.splice(cons.indexOf(ws), 1))
    })

    const { port } = wss.address() as AddressInfo
    open(`https://${DOMAIN}${links.post.port(port)}`)
  })

cli('cin').use(start).run()
