#!/usr/bin/env node
import { AddressInfo, WebSocketServer } from 'ws'

import { links } from '@claudein.org/common'
import { cli, command } from '@versecafe/zcli'
import open from 'open'

const DOMAIN = process.env.CIN_ENV === 'dev' ? 'localhost:3000' : 'claudein.org'

const start = command('start')
  .action(async ({ }) => {
    const wss = new WebSocketServer({ port: 0 })

    wss.on('connection', (ws) => {
      console.log('Client connected')
      ws.send(JSON.stringify({ message: 'Hello from the WebSocket server!' }))
    })

    const { port } = wss.address() as AddressInfo
    open(`https://${DOMAIN}${links.post.port(port)}`)
  })

cli('cin').use(start).run()
