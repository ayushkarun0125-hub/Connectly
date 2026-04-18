/* global process */
import 'dotenv/config'
import os from 'node:os'
import { bootstrapServer } from './bootstrapServer.js'

function listLanIpv4() {
  const addrs = []
  const ifs = os.networkInterfaces()
  for (const name of Object.keys(ifs)) {
    for (const net of ifs[name] || []) {
      const fam = net.family
      const isV4 = fam === 'IPv4' || fam === 4
      if (isV4 && !net.internal) addrs.push(net.address)
    }
  }
  return addrs
}

const { server, openPort } = await bootstrapServer()

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error('')
    console.error(`[server] Port ${openPort} is already in use (EADDRINUSE).`)
    console.error('[server] Fix: stop the other process using that port (often another `npm run dev` in server/),')
    console.error('        or set PORT=3002 (or another free port) in server/.env and restart.')
    console.error('[server] Windows: Get-NetTCPConnection -LocalPort ' + openPort + ' | Format-Table OwningProcess')
    console.error('')
    process.exit(1)
  }
  throw err
})

server.listen(openPort, '0.0.0.0', () => {
  console.log(`Connectly server listening on http://127.0.0.1:${openPort} (all interfaces)`)
  const lan = listLanIpv4()
  if (lan.length) {
    console.log('Other devices on your Wi‑Fi/LAN can use:')
    for (const ip of lan) {
      console.log(`  http://${ip}:${openPort}`)
    }
  }
})
