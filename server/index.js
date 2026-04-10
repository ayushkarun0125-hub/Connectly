/* global process */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import net from 'net'
import path from 'path'
import fs from 'fs/promises'
import { Server } from 'socket.io'
import registerSocketHandlers from './sockets/registerSocketHandlers.js'
import { ensureDataFiles } from './utils/fileIO.js'
import { initDatabase } from './utils/db.js'
import {
  createRoomWithInvite,
  getRoomById,
  resolveInviteCode,
  updateRoomName,
} from './controllers/roomController.js'

const app = express()
const server = http.createServer(app)

const port = Number(process.env.PORT || 3001)
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: clientUrl }))
app.use(express.json({ limit: '8mb' }))
app.use('/uploads', express.static(path.resolve('data', 'uploads')))

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
  },
})

registerSocketHandlers(io)

await ensureDataFiles()
await initDatabase()

function isPortFree(portToCheck) {
  return new Promise((resolve) => {
    const tester = net.createServer()
    tester
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true))
      })
      .listen(portToCheck)
  })
}

async function findOpenPort(startPort) {
  let nextPort = startPort
  while (!(await isPortFree(nextPort))) {
    console.warn(`Port ${nextPort} in use, trying ${nextPort + 1}...`)
    nextPort += 1
  }
  return nextPort
}

const openPort = await findOpenPort(port)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'connectly-server', port: openPort })
})

app.post('/api/rooms', async (req, res) => {
  try {
    const rawName = req.body?.name
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    const room = await createRoomWithInvite({ name: name || 'New room' })
    res.status(201).json(room)
  } catch (err) {
    console.error('POST /api/rooms', err)
    res.status(500).json({ error: 'Failed to create room' })
  }
})

app.get('/api/rooms/resolve/:code', async (req, res) => {
  try {
    const room = await resolveInviteCode(req.params.code)
    if (!room) {
      res.status(404).json({ error: 'No room matches that code' })
      return
    }
    res.json(room)
  } catch (err) {
    console.error('GET /api/rooms/resolve', err)
    res.status(500).json({ error: 'Lookup failed' })
  }
})

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const row = await getRoomById(req.params.roomId)
    if (!row) {
      res.status(404).json({ error: 'Room not found' })
      return
    }
    res.json(row)
  } catch (err) {
    console.error('GET /api/rooms/:roomId', err)
    res.status(500).json({ error: 'Lookup failed' })
  }
})

app.patch('/api/rooms/:roomId', async (req, res) => {
  try {
    const rawName = req.body?.name
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    if (!name) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    const row = await updateRoomName(req.params.roomId, name)
    if (!row) {
      res.status(404).json({ error: 'Room not found' })
      return
    }
    res.json(row)
  } catch (err) {
    console.error('PATCH /api/rooms/:roomId', err)
    res.status(500).json({ error: 'Update failed' })
  }
})

app.get('/api/uploads', async (_req, res) => {
  try {
    const dir = path.resolve('data', 'uploads')
    await fs.mkdir(dir, { recursive: true })
    const names = await fs.readdir(dir)
    const items = await Promise.all(
      names.map(async (name) => {
        const full = path.join(dir, name)
        const stat = await fs.stat(full)
        if (!stat.isFile()) return null
        return {
          id: name,
          name,
          url: `/uploads/${name}`,
          size: stat.size,
          uploadedAt: stat.mtime.toISOString(),
        }
      }),
    )
    const list = items.filter(Boolean).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    res.json(list)
  } catch {
    res.status(500).json({ error: 'Failed to list uploads' })
  }
})

server.listen(openPort, () => {
  console.log(`Connectly server listening on http://localhost:${openPort}`)
})
