/* global process */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import net from 'net'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'node:crypto'
import os from 'node:os'
import { Server } from 'socket.io'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import registerSocketHandlers from './sockets/registerSocketHandlers.js'
import { ensureDataFiles } from './utils/fileIO.js'
import { getDb, initDatabase } from './utils/db.js'
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
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me'

const extraCorsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

function isPrivateLanHostname(hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
  return /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
}

/** Allow Vite (5173), preview (4173), etc. on localhost + RFC1918 when not in production. */
function isAllowedLanDevOrigin(origin) {
  try {
    const u = new URL(origin)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
    if (!isPrivateLanHostname(u.hostname)) return false
    return true
  } catch {
    return false
  }
}

const strictCors = process.env.NODE_ENV === 'production' && process.env.LAN_DEV !== '1'

function corsOriginCallback(origin, callback) {
  if (!origin) {
    callback(null, true)
    return
  }
  if (origin === clientUrl) {
    callback(null, true)
    return
  }
  if (extraCorsOrigins.includes(origin)) {
    callback(null, true)
    return
  }
  if (!strictCors && isAllowedLanDevOrigin(origin)) {
    callback(null, true)
    return
  }
  callback(null, false)
}

app.use(cors({ origin: corsOriginCallback }))
app.use(express.json({ limit: '8mb' }))
app.use('/uploads', express.static(path.resolve('data', 'uploads')))

function signToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' })
}

function readBearerToken(req) {
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7).trim()
}

function formatUser(row) {
  if (!row) return null
  const raw = row.profileCompleted ?? row.profile_completed
  const profileCompleted = raw === undefined || raw === null ? true : Number(raw) === 1
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName ?? row.display_name ?? '',
    role: row.role,
    bio: row.bio ?? '',
    profileCompleted,
  }
}

async function getAuthUser(req) {
  const token = readBearerToken(req)
  if (!token) return null
  try {
    const payload = jwt.verify(token, jwtSecret)
    const db = getDb()
    const row = await db.get(
      'SELECT id, email, display_name as displayName, role, bio, profile_completed as profileCompleted FROM users WHERE id = ?',
      payload.sub,
    )
    return formatUser(row)
  } catch {
    return null
  }
}

const io = new Server(server, {
  cors: {
    origin: corsOriginCallback,
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

app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    const displayName = String(req.body?.displayName || '').trim() || 'User'
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }
    const db = getDb()
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email)
    if (existing) {
      res.status(409).json({ error: 'Email already in use' })
      return
    }
    const id = `user_${crypto.randomBytes(12).toString('hex')}`
    const now = new Date().toISOString()
    const hash = await bcrypt.hash(password, 10)
    await db.run(
      'INSERT INTO users (id, email, password_hash, display_name, role, created_at, bio, profile_completed) VALUES (?, ?, ?, ?, ?, ?, NULL, 0)',
      id,
      email,
      hash,
      displayName,
      'user',
      now,
    )
    const token = signToken({ sub: id, role: 'user' })
    res.status(201).json({
      token,
      user: {
        id,
        email,
        displayName,
        role: 'user',
        bio: '',
        profileCompleted: false,
      },
    })
  } catch (err) {
    console.error('POST /api/auth/signup', err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }
    const db = getDb()
    const row = await db.get(
      'SELECT id, email, password_hash as passwordHash, display_name as displayName, role, bio, profile_completed as profileCompleted FROM users WHERE email = ?',
      email,
    )
    if (!row) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const ok = await bcrypt.compare(password, row.passwordHash)
    if (!ok) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = signToken({ sub: row.id, role: row.role })
    res.json({
      token,
      user: formatUser(row),
    })
  } catch (err) {
    console.error('POST /api/auth/login', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/auth/me', async (req, res) => {
  const user = await getAuthUser(req)
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json({ user })
})

app.patch('/api/auth/profile', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const rawName = req.body?.displayName
    const rawBio = req.body?.bio
    const displayName =
      typeof rawName === 'string' ? rawName.trim().slice(0, 80) : user.displayName
    const bio = typeof rawBio === 'string' ? rawBio.trim().slice(0, 500) : user.bio || ''
    if (!displayName) {
      res.status(400).json({ error: 'Display name is required' })
      return
    }
    const db = getDb()
    await db.run(
      'UPDATE users SET display_name = ?, bio = ?, profile_completed = 1 WHERE id = ?',
      displayName,
      bio || null,
      user.id,
    )
    const next = { ...user, displayName, bio, profileCompleted: true }
    res.json({ user: next })
  } catch (err) {
    console.error('PATCH /api/auth/profile', err)
    res.status(500).json({ error: 'Update failed' })
  }
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

app.get('/api/rooms/:roomId/pins', async (req, res) => {
  try {
    const db = getDb()
    const rows = await db.all(
      `SELECT id, room_id as roomId, message_id as messageId, name, url, sender, pinned_at as pinnedAt
       FROM room_pins WHERE room_id = ? ORDER BY pinned_at DESC`,
      req.params.roomId,
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /api/rooms/:roomId/pins', err)
    res.status(500).json({ error: 'Failed to list pins' })
  }
})

app.post('/api/rooms/:roomId/pins', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in to pin files' })
      return
    }
    const name = String(req.body?.name || '').trim().slice(0, 240)
    const url = String(req.body?.url || '').trim().slice(0, 2000)
    if (!name || !url) {
      res.status(400).json({ error: 'Name and url are required' })
      return
    }
    const messageId = req.body?.messageId ? String(req.body.messageId).slice(0, 80) : null
    const sender = req.body?.sender ? String(req.body.sender).slice(0, 80) : user.displayName
    const roomId = req.params.roomId
    const db = getDb()
    const id = `pin_${crypto.randomBytes(10).toString('hex')}`
    const pinnedAt = new Date().toISOString()
    await db.run(
      `INSERT INTO room_pins (id, room_id, message_id, name, url, sender, pinned_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      roomId,
      messageId,
      name,
      url,
      sender,
      pinnedAt,
    )
    res.status(201).json({
      id,
      roomId,
      messageId,
      name,
      url,
      sender,
      pinnedAt,
    })
  } catch (err) {
    console.error('POST /api/rooms/:roomId/pins', err)
    res.status(500).json({ error: 'Failed to pin file' })
  }
})

app.delete('/api/rooms/:roomId/pins/:pinId', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const db = getDb()
    const result = await db.run(
      'DELETE FROM room_pins WHERE id = ? AND room_id = ?',
      req.params.pinId,
      req.params.roomId,
    )
    if (result.changes === 0) {
      res.status(404).json({ error: 'Pin not found' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/rooms/:roomId/pins/:pinId', err)
    res.status(500).json({ error: 'Failed to remove pin' })
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

server.listen(openPort, '0.0.0.0', () => {
  console.log(`Connectly server listening on http://localhost:${openPort} (all interfaces)`)
  const lan = listLanIpv4()
  if (lan.length) {
    console.log('Other devices on your Wi‑Fi/LAN can use:')
    for (const ip of lan) {
      console.log(`  http://${ip}:${openPort}`)
    }
  }
})
