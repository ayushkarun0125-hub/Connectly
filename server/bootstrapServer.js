/* global process */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import net from 'net'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'node:crypto'
import { Server } from 'socket.io'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import registerSocketHandlers from './sockets/registerSocketHandlers.js'
import { createMessage, persistMessage } from './controllers/messageController.js'
import { saveFile } from './controllers/fileController.js'
import { deleteUploadedFile, recordUploadFile } from './controllers/uploadController.js'
import { ensureDataFiles } from './utils/fileIO.js'
import { getDb, initDatabase } from './utils/db.js'
import { seedDefaultAdmin, seedDefaultModerator } from './utils/seedAdmin.js'
import {
  PROTECTED_ROOM_IDS,
  WORKSPACE_LOBBY_ROOM_ID,
  ensurePersonalRoomForUser,
  ensureWorkspaceLobbyForAllUsers,
  createRoomWithInvite,
  deleteRoomCascade,
  grantRoomAccess,
  getRoomById,
  resolveInviteCode,
  updateRoomName,
  userCanAccessRoom,
} from './controllers/roomController.js'
import { registerAdminRoutes } from './routes/adminApi.js'
import { clearRoomEnforcement, getActiveRoomEnforcement, getUserAccountStatus } from './services/enforcementService.js'
import { createModerationReport } from './services/reportService.js'
import { ensureDmConversation, getDmHistory, getUserConversations, isParticipant } from './services/dmService.js'
import { getUnreadByRoom, markRoomRead } from './services/unreadService.js'

export async function bootstrapServer() {
const SERVER_BOOT_AT = Date.now()

const app = express()
const server = http.createServer(app)

const port = Number(process.env.PORT || 3001)
const clientUrl = process.env.CLIENT_URL || 'http://127.0.0.1:5173'
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
app.use((req, _res, next) => {
  const origin = req.headers.origin || '-'
  console.log(`[api] ${req.method} ${req.originalUrl} from=${req.ip} origin=${origin}`)
  next()
})
app.use('/uploads', express.static(path.resolve('data', 'uploads')))

function shouldSkipApiAuth(reqPath) {
  return reqPath === '/auth/login' || reqPath === '/auth/signup'
}

function canBypassProfileGate(user) {
  return user?.role === 'admin' || user?.role === 'moderator'
}

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
    username: row.username ?? '',
    avatarUrl: row.avatarUrl ?? row.avatar_url ?? '',
    interest: row.interest ?? '',
    role: row.role,
    bio: row.bio ?? '',
    profileCompleted,
    personalRoomId: row.personalRoomId ?? row.personal_room_id ?? null,
    accountStatus: row.accountStatus ?? row.account_status ?? 'active',
  }
}

async function getAuthUser(req) {
  const token = readBearerToken(req)
  if (!token) return null
  try {
    const payload = jwt.verify(token, jwtSecret)
    const db = getDb()
    const row = await db.get(
      `SELECT id, email, display_name as displayName, username, avatar_url as avatarUrl, interest,
       role, bio, profile_completed as profileCompleted, personal_room_id as personalRoomId,
       account_status as accountStatus FROM users WHERE id = ?`,
      payload.sub,
    )
    return formatUser(row)
  } catch {
    return null
  }
}

app.use('/api', async (req, res, next) => {
  try {
    if (shouldSkipApiAuth(req.path)) {
      next()
      return
    }
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    req.authUser = user
    const profileRoute = req.path === '/auth/profile' || req.path === '/auth/me'
    if (!profileRoute && !canBypassProfileGate(user) && user.profileCompleted === false) {
      res.status(403).json({ error: 'Complete your profile setup first', code: 'PROFILE_INCOMPLETE' })
      return
    }
    next()
  } catch (err) {
    console.error('API auth middleware', err)
    res.status(500).json({ error: 'Auth middleware failed' })
  }
})

const io = new Server(server, {
  cors: {
    origin: corsOriginCallback,
    methods: ['GET', 'POST'],
  },
})

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      socket.accountUserId = null
      socket.accountStatus = 'active'
      socket.accountRole = 'user'
      socket.accountDisplayName = 'Guest'
      next()
      return
    }
    const payload = jwt.verify(token, jwtSecret)
    const uid = String(payload.sub)
    const db = getDb()
    const row = await db.get(
      `SELECT role, account_status as accountStatus, profile_completed as profileCompleted,
       COALESCE(NULLIF(TRIM(display_name), ''), email, 'User') as displayName
       FROM users WHERE id = ?`,
      uid,
    )
    const acct = row?.accountStatus || (await getUserAccountStatus(uid))
    if (acct !== 'active') {
      next(new Error('Account suspended or banned'))
      return
    }
    if (!canBypassProfileGate({ role: row?.role }) && Number(row?.profileCompleted ?? 1) !== 1) {
      next(new Error('Complete profile setup before connecting'))
      return
    }
    socket.accountUserId = uid
    socket.accountStatus = acct
    socket.accountRole = row?.role || 'user'
    socket.accountDisplayName = row?.displayName || 'User'
    next()
  } catch {
    socket.accountUserId = null
    socket.accountStatus = 'active'
    socket.accountRole = 'user'
    socket.accountDisplayName = 'Guest'
    next()
  }
})

registerSocketHandlers(io)

await ensureDataFiles()
await initDatabase()
await ensureWorkspaceLobbyForAllUsers()
await seedDefaultAdmin()
await seedDefaultModerator()

function isPortFree(portToCheck) {
  return new Promise((resolve) => {
    const tester = net.createServer()
    tester
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.close(() => resolve(true))
      })
      // Match `server.listen(..., '0.0.0.0')` so IPv4 bind conflicts are detected reliably on Windows.
      .listen(portToCheck, '0.0.0.0')
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

registerAdminRoutes(app, {
  getAuthUser,
  io,
  listenPort: openPort,
  serverBootAt: SERVER_BOOT_AT,
})

if (openPort !== port) {
  console.warn('')
  console.warn('┌─────────────────────────────────────────────────────────────────┐')
  console.warn('│ API bound to a different port than PORT — Socket.io will fail     │')
  console.warn('│ unless the client matches. Add to the project root .env:          │')
  console.warn(`│   VITE_SERVER_PORT=${openPort}`)
  console.warn('│ Or set VITE_SERVER_URL=http://<host-ip>:' + openPort)
  console.warn('│ (Restart Vite after changing .env.)                                │')
  console.warn('└─────────────────────────────────────────────────────────────────┘')
  console.warn('')
}

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'connectly-server', message: 'Server is running', port: openPort })
})

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'connectly-server',
    port: openPort,
    socket: {
      connectedClients: io.engine.clientsCount ?? 0,
      transports: ['polling', 'websocket'],
    },
  })
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
      `SELECT id, email, password_hash as passwordHash, display_name as displayName, username,
       avatar_url as avatarUrl, interest, role, bio, profile_completed as profileCompleted,
       personal_room_id as personalRoomId, account_status as accountStatus
       FROM users WHERE email = ?`,
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
    const acct = row.accountStatus ?? 'active'
    if (acct !== 'active') {
      res.status(403).json({ error: 'Account is suspended or banned' })
      return
    }
    const staff = row.role === 'admin' || row.role === 'moderator'
    if (staff || Number(row.profileCompleted ?? 0) === 1) {
      await grantRoomAccess({ roomId: WORKSPACE_LOBBY_ROOM_ID, userId: row.id, source: 'workspace' })
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
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const rawName = req.body?.displayName
    const rawBio = req.body?.bio
    const rawUsername = req.body?.username
    const rawInterest = req.body?.interest
    const avatarData = typeof req.body?.avatarData === 'string' ? req.body.avatarData : ''
    const avatarMimeType = typeof req.body?.avatarMimeType === 'string' ? req.body.avatarMimeType : 'image/png'
    const displayName =
      typeof rawName === 'string' ? rawName.trim().slice(0, 80) : user.displayName
    const bio = typeof rawBio === 'string' ? rawBio.trim().slice(0, 500) : user.bio || ''
    const username =
      rawUsername === undefined ? String(user.username || '') : normalizeUsername(rawUsername)
    const interest = typeof rawInterest === 'string' ? rawInterest.trim().slice(0, 80) : user.interest || ''
    if (!displayName) {
      res.status(400).json({ error: 'Display name is required' })
      return
    }
    if (!username || username.length < 3) {
      res.status(400).json({ error: 'Username must be at least 3 characters (letters, numbers, ., _, -).' })
      return
    }
    let avatarUrl = String(user.avatarUrl || '')
    if (avatarData) {
      try {
        const saved = await saveFile({
          filename: `avatar_${user.id}.png`,
          data: avatarData,
          mimeType: avatarMimeType,
        })
        avatarUrl = `/uploads/${saved}`
      } catch {
        res.status(400).json({ error: 'Avatar upload failed. Please try a smaller image.' })
        return
      }
    }
    const db = getDb()
    const duplicate = await db.get('SELECT id FROM users WHERE username = ? AND id <> ?', username, user.id)
    if (duplicate) {
      res.status(409).json({ error: 'That username is already taken' })
      return
    }
    await db.run(
      `UPDATE users
       SET display_name = ?, bio = ?, username = ?, avatar_url = ?, interest = ?, profile_completed = 1
       WHERE id = ?`,
      displayName,
      bio || null,
      username,
      avatarUrl || null,
      interest || null,
      user.id,
    )
    const personalRoomId = await ensurePersonalRoomForUser({ userId: user.id, displayName })
    await grantRoomAccess({ roomId: WORKSPACE_LOBBY_ROOM_ID, userId: user.id, source: 'workspace' })
    const next = {
      ...user,
      displayName,
      bio,
      username,
      avatarUrl,
      interest,
      profileCompleted: true,
      personalRoomId,
    }
    res.json({ user: next })
  } catch (err) {
    console.error('PATCH /api/auth/profile', err)
    res.status(500).json({ error: 'Update failed' })
  }
})

function formatRelativeTime(iso) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 45) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hr ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`
  return new Date(iso).toLocaleDateString()
}

function normalizeUsername(input) {
  const value = String(input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
  return value.slice(0, 32)
}

app.get('/api/workspace/dashboard', async (req, res) => {
  try {
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const db = getDb()
    const staff = user.role === 'admin' || user.role === 'moderator'
    const distinctLiveSql = `(
            SELECT COUNT(DISTINCT COALESCE(NULLIF(TRIM(COALESCE(rm.account_user_id, '')), ''), rm.socket_id))
            FROM room_members rm WHERE rm.room_id = r.id
          )`
    const roomRows = staff
      ? await db.all(`
          SELECT r.id, r.name,
            (SELECT m.content FROM messages m WHERE m.room_id = r.id ORDER BY datetime(m.timestamp) DESC LIMIT 1) AS lastMsg,
            (SELECT COUNT(DISTINCT m.user_id) FROM messages m WHERE m.room_id = r.id) AS chatterCount,
            ${distinctLiveSql} AS liveCount
          FROM rooms r
          WHERE r.archived = 0
          ORDER BY r.created_at ASC
        `)
      : await db.all(
          `SELECT r.id, r.name,
            (SELECT m.content FROM messages m WHERE m.room_id = r.id ORDER BY datetime(m.timestamp) DESC LIMIT 1) AS lastMsg,
            (SELECT COUNT(DISTINCT m.user_id) FROM messages m WHERE m.room_id = r.id) AS chatterCount,
            ${distinctLiveSql} AS liveCount
           FROM rooms r
           JOIN room_access ra ON ra.room_id = r.id
           WHERE r.archived = 0 AND ra.user_id = ?
           ORDER BY r.created_at ASC`,
          user.id,
        )
    const unreadState = await getUnreadByRoom(user.id, staff)
    const onlineRow = staff
      ? await db.get(`
          SELECT COUNT(DISTINCT COALESCE(NULLIF(TRIM(COALESCE(account_user_id, '')), ''), socket_id)) AS n
          FROM room_members
        `)
      : await db.get(
          `
          SELECT COUNT(DISTINCT COALESCE(NULLIF(TRIM(COALESCE(rm.account_user_id, '')), ''), rm.socket_id)) AS n
          FROM room_members rm
          INNER JOIN room_access ra ON ra.room_id = rm.room_id AND ra.user_id = ?
        `,
          user.id,
        )
    const onlineInWorkspace = Number(onlineRow?.n) || 0
    const rooms = roomRows.map((row) => {
      const last = row.lastMsg ? String(row.lastMsg).trim() : ''
      const lastMessage = last ? (last.length > 100 ? `${last.slice(0, 97)}…` : last) : 'No messages yet'
      const chatter = Number(row.chatterCount) || 0
      const live = Number(row.liveCount) || 0
      return {
        id: row.id,
        name: row.name,
        unread: unreadState.perRoom[row.id] || 0,
        lastMessage,
        members: Math.max(chatter, live),
        onlineInRoom: live,
      }
    })

    const memberRows = staff
      ? await db.all(
          `SELECT id, email, display_name as displayName, role
           FROM users WHERE account_status = 'active'
           ORDER BY display_name COLLATE NOCASE ASC`,
        )
      : await db.all(
          `SELECT id, email, display_name as displayName, role
           FROM users WHERE id = ? AND account_status = 'active'`,
          user.id,
        )
    const activeUsers = memberRows.map((r) => ({
      id: r.id,
      name: r.displayName || r.email || 'Member',
      email: r.email,
      role: r.role,
    }))

    const fileCountRow = staff
      ? await db.get('SELECT COUNT(*) as n FROM upload_files')
      : await db.get('SELECT COUNT(*) as n FROM upload_files WHERE user_id = ?', String(user.id))
    const sharedFilesCount = Number(fileCountRow?.n) || 0

    const uploadRows = staff
      ? await db.all(`
          SELECT uf.filename AS name, uf.room_id AS roomId, uf.created_at AS uploadedAt,
            COALESCE(NULLIF(TRIM(u.display_name), ''), u.email, 'Member') AS sender,
            COALESCE(r.name, uf.room_id) AS roomLabel
          FROM upload_files uf
          LEFT JOIN users u ON u.id = uf.user_id
          LEFT JOIN rooms r ON r.id = uf.room_id
          ORDER BY datetime(uf.created_at) DESC
          LIMIT 8
        `)
      : await db.all(
          `SELECT uf.filename AS name, uf.room_id AS roomId, uf.created_at AS uploadedAt,
            COALESCE(NULLIF(TRIM(u.display_name), ''), u.email, 'Member') AS sender,
            COALESCE(r.name, uf.room_id) AS roomLabel
           FROM upload_files uf
           LEFT JOIN users u ON u.id = uf.user_id
           LEFT JOIN rooms r ON r.id = uf.room_id
           WHERE uf.user_id = ?
           ORDER BY datetime(uf.created_at) DESC
           LIMIT 8`,
          String(user.id),
        )
    const recentFiles = uploadRows.map((f) => ({
      id: f.name,
      name: f.name,
      sender: f.sender,
      roomId: f.roomLabel,
    }))

    const msgRows = staff
      ? await db.all(`
          SELECT m.id, m.username, m.content, m.type, m.timestamp, m.room_id AS roomId,
            COALESCE(r.name, m.room_id) AS roomName
          FROM messages m
          LEFT JOIN rooms r ON r.id = m.room_id
          ORDER BY datetime(m.timestamp) DESC
          LIMIT 12
        `)
      : await db.all(
          `SELECT m.id, m.username, m.content, m.type, m.timestamp, m.room_id AS roomId,
            COALESCE(r.name, m.room_id) AS roomName
           FROM messages m
           JOIN room_access ra ON ra.room_id = m.room_id
           LEFT JOIN rooms r ON r.id = m.room_id
           WHERE ra.user_id = ? AND m.user_id = ?
           ORDER BY datetime(m.timestamp) DESC
           LIMIT 12`,
          String(user.id),
          String(user.id),
        )
    const activity = msgRows.map((m) => {
      const isFile = m.type === 'file'
      const target = m.roomName || m.roomId
      return {
        id: m.id,
        type: isFile ? 'file' : 'message',
        actor: m.username || 'Someone',
        action: isFile ? 'shared a file in' : 'sent a message in',
        target,
        time: formatRelativeTime(m.timestamp),
      }
    })

    res.json({
      rooms,
      activeUsers,
      onlineInWorkspace,
      sharedFilesCount,
      unreadMessagesTotal: unreadState.total,
      recentFiles,
      activity,
    })
  } catch (err) {
    console.error('GET /api/workspace/dashboard', err)
    res.status(500).json({ error: 'Dashboard failed' })
  }
})

app.get('/api/unread', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const staffUnread = user.role === 'admin' || user.role === 'moderator'
    const unread = await getUnreadByRoom(user.id, staffUnread)
    res.json(unread)
  } catch (err) {
    console.error('GET /api/unread', err)
    res.status(500).json({ error: 'Unread lookup failed' })
  }
})

app.post('/api/rooms/:roomId/read', async (req, res) => {
  try {
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
      return
    }
    const state = await markRoomRead({ roomId: req.params.roomId, userId: user.id })
    res.json(state)
  } catch (err) {
    console.error('POST /api/rooms/:roomId/read', err)
    res.status(500).json({ error: 'Could not mark room read' })
  }
})

app.post('/api/reports', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const report = await createModerationReport({
      reporterUserId: user.id,
      type: req.body?.type,
      roomId: req.body?.roomId ? String(req.body.roomId) : null,
      reason: req.body?.reason,
      note: req.body?.note,
      messageId: req.body?.messageId ? String(req.body.messageId) : null,
      fileId: req.body?.fileId ? String(req.body.fileId) : null,
      targetUserId: req.body?.targetUserId ? String(req.body.targetUserId) : null,
    })
    io.emit('moderation-report-created', report)
    res.status(201).json(report)
  } catch (err) {
    const message = err?.message || 'Report could not be created'
    const status = /already reported|Invalid report type|Missing report target|Reason is required/.test(message)
      ? 400
      : 500
    if (status === 500) console.error('POST /api/reports', err)
    res.status(status).json({ error: message })
  }
})

app.get('/api/rooms/:roomId/enforcement/:userId', async (req, res) => {
  try {
    const actor = await getAuthUser(req)
    if (!actor || !['admin', 'moderator'].includes(actor.role)) {
      res.status(403).json({ error: 'Admin or moderator access required' })
      return
    }
    const enforcement = await getActiveRoomEnforcement(req.params.roomId, req.params.userId)
    res.json({ enforcement })
  } catch (err) {
    console.error('GET /api/rooms/:roomId/enforcement/:userId', err)
    res.status(500).json({ error: 'Could not load enforcement' })
  }
})

app.post('/api/rooms/:roomId/enforcement/clear', async (req, res) => {
  try {
    const actor = await getAuthUser(req)
    if (!actor || !['admin', 'moderator'].includes(actor.role)) {
      res.status(403).json({ error: 'Admin or moderator access required' })
      return
    }
    const targetUserId = String(req.body?.targetUserId || '').trim()
    if (!targetUserId) {
      res.status(400).json({ error: 'targetUserId is required' })
      return
    }
    const ok = await clearRoomEnforcement(req.params.roomId, targetUserId)
    res.json({ ok })
  } catch (err) {
    console.error('POST /api/rooms/:roomId/enforcement/clear', err)
    res.status(500).json({ error: 'Could not clear enforcement' })
  }
})

app.get('/api/workspace/members', async (req, res) => {
  try {
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const db = getDb()
    const isStaff = user.role === 'admin' || user.role === 'moderator'
    const rows = isStaff
      ? await db.all(
          `SELECT id, email, display_name as displayName, role, created_at as createdAt, account_status as accountStatus
           FROM users ORDER BY display_name COLLATE NOCASE ASC`,
        )
      : await db.all(
          `SELECT id, email, display_name as displayName, role, created_at as createdAt, account_status as accountStatus
           FROM users WHERE id = ?`,
          user.id,
        )
    res.json({
      members: rows.map((r) => ({
        id: r.id,
        email: r.email,
        displayName: r.displayName,
        role: r.role,
        createdAt: r.createdAt,
        accountStatus: r.accountStatus ?? 'active',
      })),
    })
  } catch (err) {
    console.error('GET /api/workspace/members', err)
    res.status(500).json({ error: 'Failed to list members' })
  }
})

app.post('/api/workspace/members', async (req, res) => {
  try {
    const actor = await getAuthUser(req)
    if (!actor || actor.role !== 'admin') {
      res.status(403).json({ error: 'Administrator access is required to add workspace members' })
      return
    }
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
      'INSERT INTO users (id, email, password_hash, display_name, role, created_at, bio, profile_completed, account_status) VALUES (?, ?, ?, ?, ?, ?, NULL, 0, ?)',
      id,
      email,
      hash,
      displayName,
      'user',
      now,
      'active',
    )
    const row = await db.get(
      'SELECT id, email, display_name as displayName, role, bio, profile_completed as profileCompleted, account_status as accountStatus FROM users WHERE id = ?',
      id,
    )
    res.status(201).json({ user: formatUser(row) })
  } catch (err) {
    console.error('POST /api/workspace/members', err)
    res.status(500).json({ error: 'Could not add member' })
  }
})

app.delete('/api/workspace/members/:userId', async (req, res) => {
  try {
    const actor = await getAuthUser(req)
    if (!actor || !['admin', 'moderator'].includes(actor.role)) {
      res.status(403).json({ error: 'Admin or moderator access required' })
      return
    }
    const userId = req.params.userId
    if (userId === actor.id) {
      res.status(400).json({ error: 'You cannot remove yourself from the workspace' })
      return
    }
    const db = getDb()
    const target = await db.get('SELECT id, role FROM users WHERE id = ?', userId)
    if (!target) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    if (target.role === 'admin' && actor.role !== 'admin') {
      res.status(403).json({ error: 'Only an administrator can remove another administrator' })
      return
    }
    await db.run(`UPDATE users SET account_status = 'suspended' WHERE id = ?`, userId)
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/workspace/members/:userId', err)
    res.status(500).json({ error: 'Could not remove member' })
  }
})

app.patch('/api/workspace/members/:userId', async (req, res) => {
  try {
    const actor = await getAuthUser(req)
    if (!actor || !['admin', 'moderator'].includes(actor.role)) {
      res.status(403).json({ error: 'Admin or moderator access required' })
      return
    }
    const userId = req.params.userId
    const nextStatus = req.body?.accountStatus
    if (nextStatus !== 'active') {
      res.status(400).json({ error: 'Only accountStatus "active" is supported' })
      return
    }
    const db = getDb()
    const target = await db.get('SELECT id, role FROM users WHERE id = ?', userId)
    if (!target) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    if (target.role === 'admin' && actor.role !== 'admin') {
      res.status(403).json({ error: 'Only an administrator can restore an administrator' })
      return
    }
    await db.run(`UPDATE users SET account_status = 'active' WHERE id = ?`, userId)
    const row = await db.get(
      'SELECT id, email, display_name as displayName, role, bio, profile_completed as profileCompleted, account_status as accountStatus FROM users WHERE id = ?',
      userId,
    )
    res.json({ user: formatUser(row) })
  } catch (err) {
    console.error('PATCH /api/workspace/members/:userId', err)
    res.status(500).json({ error: 'Could not update member' })
  }
})

app.post('/api/rooms', async (req, res) => {
  try {
    const rawName = req.body?.name
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    const creator = req.authUser || (await getAuthUser(req))
    if (!creator) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const room = await createRoomWithInvite({
      name: name || 'New room',
      createdByUserId: creator?.id ?? null,
    })
    res.status(201).json(room)
  } catch (err) {
    console.error('POST /api/rooms', err)
    res.status(500).json({ error: 'Failed to create room' })
  }
})

app.delete('/api/rooms/:roomId', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in to delete rooms' })
      return
    }
    const roomId = req.params.roomId
    const room = await getRoomById(roomId)
    if (!room) {
      res.status(404).json({ error: 'Room not found' })
      return
    }
    if (PROTECTED_ROOM_IDS.has(roomId)) {
      res.status(403).json({ error: 'This built-in room cannot be deleted' })
      return
    }
    const elevated = user.role === 'admin' || user.role === 'moderator'
    const owner = room.createdByUserId && room.createdByUserId === user.id
    if (!owner && !elevated) {
      res.status(403).json({ error: 'Only the room creator or a moderator can delete this room' })
      return
    }
    const ok = await deleteRoomCascade(roomId)
    if (!ok) {
      res.status(404).json({ error: 'Room not found' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/rooms/:roomId', err)
    res.status(500).json({ error: 'Failed to delete room' })
  }
})

app.get('/api/rooms/resolve/:code', async (req, res) => {
  try {
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const room = await resolveInviteCode(req.params.code)
    if (!room) {
      res.status(404).json({ error: 'No room matches that code' })
      return
    }
    await grantRoomAccess({ roomId: room.id, userId: user.id, source: 'invite' })
    res.json(room)
  } catch (err) {
    console.error('GET /api/rooms/resolve', err)
    res.status(500).json({ error: 'Lookup failed' })
  }
})

app.post('/api/dm/conversations', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const peerUserId = String(req.body?.peerUserId || '').trim()
    if (!peerUserId) {
      res.status(400).json({ error: 'peerUserId is required' })
      return
    }
    const conversationId = await ensureDmConversation(user.id, peerUserId)
    res.status(201).json({ conversationId })
  } catch (err) {
    const msg = err?.message || 'Could not create conversation'
    const status = /yourself|required/.test(msg) ? 400 : 500
    if (status === 500) console.error('POST /api/dm/conversations', err)
    res.status(status).json({ error: msg })
  }
})

app.get('/api/dm/conversations', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const rows = await getUserConversations(user.id)
    res.json({ conversations: rows })
  } catch (err) {
    console.error('GET /api/dm/conversations', err)
    res.status(500).json({ error: 'Could not list conversations' })
  }
})

app.get('/api/dm/conversations/:id/messages', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const cid = req.params.id
    const member = await isParticipant(cid, user.id)
    if (!member) {
      res.status(403).json({ error: 'Access denied' })
      return
    }
    const messages = await getDmHistory(cid)
    res.json({ messages })
  } catch (err) {
    console.error('GET /api/dm/conversations/:id/messages', err)
    res.status(500).json({ error: 'Could not load conversation history' })
  }
})

app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
      return
    }
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
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
      return
    }
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
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
      return
    }
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
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Sign in to pin files' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
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
    const user = req.authUser || (await getAuthUser(req))
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const allowed = await userCanAccessRoom({ user, roomId: req.params.roomId })
    if (!allowed) {
      res.status(403).json({ error: 'Access denied for this room' })
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

const UPLOADS_DEFAULT_ROOM = 'room_design'

app.post('/api/uploads', async (req, res) => {
  try {
    const rawName = req.body?.filename
    const filename = typeof rawName === 'string' ? rawName.trim() : ''
    const data = req.body?.data
    const mimeType =
      typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'application/octet-stream'
    if (!filename || typeof data !== 'string' || !data) {
      res.status(400).json({ error: 'filename and base64 data are required' })
      return
    }
    const user = await getAuthUser(req)
    const savedName = await saveFile({ filename, data })
    const displayName = user?.displayName || user?.email || 'Someone'
    const userId = user?.id ? `account:${user.id}` : `anon:${crypto.randomBytes(8).toString('hex')}`
    const message = await createMessage({
      userId,
      username: displayName,
      content: filename,
      type: 'file',
      extra: {
        filename,
        url: `/uploads/${savedName}`,
        mimeType,
      },
    })
    await persistMessage(UPLOADS_DEFAULT_ROOM, message)
    if (user?.id) {
      try {
        await recordUploadFile({
          filename: savedName,
          userId: String(user.id),
          roomId: UPLOADS_DEFAULT_ROOM,
          messageId: message.id,
        })
      } catch {
        /* ledger optional */
      }
    }
    io.to(UPLOADS_DEFAULT_ROOM).emit('new-message', message)
    io.to(UPLOADS_DEFAULT_ROOM).emit('file-shared', message)
    res.status(201).json({
      id: savedName,
      name: savedName,
      url: `/uploads/${savedName}`,
      messageId: message.id,
    })
  } catch (err) {
    console.error('POST /api/uploads', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

app.get('/api/uploads', async (_req, res) => {
  try {
    const user = _req.authUser || (await getAuthUser(_req))
    if (!user) {
      res.status(401).json({ error: 'Sign in required' })
      return
    }
    const isStaff = user.role === 'admin' || user.role === 'moderator'
    const db = getDb()
    const uploadRows = isStaff
      ? await db.all(
          `SELECT uf.filename as id, uf.filename as name, '/uploads/' || uf.filename as url, uf.created_at as uploadedAt
           FROM upload_files uf ORDER BY datetime(uf.created_at) DESC`,
        )
      : await db.all(
          `SELECT uf.filename as id, uf.filename as name, '/uploads/' || uf.filename as url, uf.created_at as uploadedAt
           FROM upload_files uf WHERE uf.user_id = ? ORDER BY datetime(uf.created_at) DESC`,
          String(user.id),
        )
    if (uploadRows.length) {
      res.json(uploadRows)
      return
    }
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

app.delete('/api/uploads/:fileName', async (req, res) => {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      res.status(401).json({ error: 'Sign in to remove files' })
      return
    }
    await deleteUploadedFile({ filename: req.params.fileName, user, io })
    res.json({ ok: true })
  } catch (err) {
    const status = err.status || 500
    if (status === 403) {
      res.status(403).json({ error: err.message || 'Forbidden' })
      return
    }
    if (status === 400) {
      res.status(400).json({ error: err.message || 'Bad request' })
      return
    }
    console.error('DELETE /api/uploads/:fileName', err)
    res.status(500).json({ error: 'Failed to remove file' })
  }
})

  return { app, server, io, openPort, jwtSecret, serverBootAt: SERVER_BOOT_AT }
}
