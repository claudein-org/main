#!/usr/bin/env node
import { AddressInfo, WebSocketServer } from 'ws'

import { cli, command } from '@versecafe/zcli'
import open from 'open'

const start = command('start')
  .action(async ({ }) => {
    const DEV = process.env.CIN_ENV === 'dev'
    const wss = new WebSocketServer({ port: 0 })

    wss.on('connection', (ws) => {
      console.log('Client connected')
      ws.send(JSON.stringify({ message: 'Hello from the WebSocket server!' }))
    })

    const { port } = wss.address() as AddressInfo
    const host = DEV
      ? `localhost:3000`
      : 'claudein.org'

    open(`https://${host}/dash/${port}`)
  })

cli('cin').use(start).run()