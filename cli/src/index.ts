import { createServer } from 'http'
import { AddressInfo, WebSocketServer } from 'ws'

import { cli, command } from '@versecafe/zcli'

const start = command('start')
  .action(async ({ }) => {
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
      console.log(`Listening on port ${port}`)
    })
  })

cli('cin').use(start).run()