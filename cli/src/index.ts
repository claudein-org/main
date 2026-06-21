#!/usr/bin/env node
import { createServer } from 'http'
import { AddressInfo, WebSocketServer } from 'ws'

import { cli, command } from '@versecafe/zcli'
import open from 'open'

const start = command('start')
  .action(async ({ }) => {
    const DEV = process.env.CIN_ENV === 'dev'
    console.log(`Starting ${DEV ? 'development' : 'production'} server...`)
    const server = createServer()
    const wss = new WebSocketServer({ noServer: true })

    server.on('upgrade', (req, socket, head) => {
      // validate JWT, then:
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
    })

    server.listen(0, () => {
      const { port } = server.address() as AddressInfo
      const url = DEV
        ? `https://localhost:3000`
        : 'https://claudein.org'

      open(url)
    })
  })

cli('cin').use(start).run()