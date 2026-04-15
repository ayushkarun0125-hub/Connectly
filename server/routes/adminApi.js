/* global process */
import path from 'node:path'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { getDb } from '../utils/db.js'

const SETTINGS_PATH = path.resolve('data', 'admin-settings.json')

const defaultSettings = {
  uploadLimitMB: 8,
  allowedFileTypes: 'images, pdf, documents',
  roomRules: 'Be respectful. No illegal content.',
  moderationDefaultAction: 'flag',
  notifyAdminsOnReport: true,
  maintenanceMode: false,
  permissions: {
    user: { createRoom: true, uploadFiles: true, directMessage: true, whiteboard: true },
    moderator: { moderateContent: true, suspendUsers: false, deleteRooms: false, viewAnalytics: true },
    admin: { fullAccess: true, deleteRooms: true, manageRoles: true, systemSettings: true },
  },
}

function mapReportRow(row) {
  if (!row) return null
  return {
    id: row.id,
    type: row.type,
    target: row.target,
    roomId: row.room_id || undefined,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at || undefined,
  }
}

async function listModerationReports(db, { limit = 100, status = null } = {}) {
  if (status) {
    return db.all(
      `SELECT id, type, target, room_id, reason, status, created_at, resolved_at
       FROM moderation_reports WHERE status = ? ORDER BY datetime(created_at) DESC LIMIT ?`,
      status,
      limit,
    )
  }
  return db.all(
    `SELECT id, type, target, room_id, reason, status, created_at, resolved_at
     FROM moderation_reports ORDER BY datetime(created_at) DESC LIMIT ?`,
    limit,
  )
}

async function countOpenReports(db) {
  const row = await db.get(`SELECT COUNT(*) as n FROM moderation_reports WHERE status IN ('pending', 'reviewing')`)
  return Number(row?.n) || 0
}

const activityRing = []
const MAX_ACTIVITY = 200

function pushActivity(entry) {
  activityRing.push({ ...entry, id: crypto.randomBytes(6).toString('hex'), at: new Date().toISOString() })
  while (activityRing.length > MAX_ACTIVITY) activityRing.shift()
}

export function registerAdminRoutes(app, { getAuthUser, io, listenPort, serverBootAt }) {
  async function requireElevated(req, res, next) {
    const user = await getAuthUser(req)
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      res.status(403).json({ error: 'Admin or moderator access required' })
      return
    }
    req.elevatedUser = user
    next()
  }

  async function requireAdmin(req, res, next) {
    const user = await getAuthUser(req)
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Administrator role required' })
      return
    }
    req.elevatedUser = user
    next()
  }

  async function readSettings() {
    try {
      const raw = await fs.readFile(SETTINGS_PATH, 'utf8')
      return { ...defaultSettings, ...JSON.parse(raw) }
    } catch {
      return { ...defaultSettings }
    }
  }

  async function writeSettings(data) {
    await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true })
    await fs.writeFile(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8')
  }

  app.get('/api/admin/overview', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      const totalUsers = (await db.get('SELECT COUNT(*) as n FROM users')).n
      const activeUsers = (await db.get(`SELECT COUNT(*) as n FROM users WHERE account_status = 'active'`)).n
      const totalRooms = (await db.get('SELECT COUNT(*) as n FROM rooms WHERE archived = 0')).n
      const totalMessages = (await db.get('SELECT COUNT(*) as n FROM messages')).n
      const reportedOpen = await countOpenReports(db)
      const previewRows = await listModerationReports(db, { limit: 4, status: 'pending' })

      const recentUsers = await db.all(
        `SELECT id, email, display_name as displayName, role, created_at as createdAt FROM users ORDER BY created_at DESC LIMIT 5`,
      )

      res.json({
        stats: {
          totalUsers,
          activeUsers,
          activeRooms: totalRooms,
          reportedItems: reportedOpen,
          totalMessages,
        },
        recentSignups: recentUsers,
        moderationPreview: previewRows.map((r) => ({
          id: r.id,
          type: r.type,
          reason: r.reason,
          roomId: r.room_id || undefined,
        })),
        activitySample: activityRing.slice(-12).reverse(),
      })
    } catch (err) {
      console.error('GET /api/admin/overview', err)
      res.status(500).json({ error: 'Overview failed' })
    }
  })

  app.get('/api/admin/system', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      await db.get('SELECT 1')
      const uploadsDir = path.resolve('data', 'uploads')
      let storageBytes = 0
      try {
        const names = await fs.readdir(uploadsDir)
        for (const name of names) {
          const st = await fs.stat(path.join(uploadsDir, name)).catch(() => null)
          if (st?.isFile()) storageBytes += st.size
        }
      } catch {
        /* empty */
      }
      const dbPath = process.env.DB_PATH || path.resolve('data', 'connectly.sqlite')
      let dbSize = 0
      try {
        const st = await fs.stat(dbPath)
        dbSize = st.size
      } catch {
        /* */
      }

      res.json({
        api: { ok: true, port: listenPort },
        socket: {
          ok: true,
          connectedClients: io.engine.clientsCount ?? 0,
        },
        database: { ok: true, sqliteBytes: dbSize },
        uptimeSeconds: Math.floor((Date.now() - serverBootAt) / 1000),
        latencyMs: null,
        errorRatePercent: 0,
        storage: { uploadsBytes: storageBytes, databaseBytes: dbSize },
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      })
    } catch (err) {
      console.error('GET /api/admin/system', err)
      res.status(500).json({ error: 'System status failed' })
    }
  })

  app.get('/api/admin/users', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      const rows = await db.all(
        `SELECT id, email, display_name as displayName, role, created_at as createdAt,
                account_status as accountStatus, profile_completed as profileCompleted
         FROM users ORDER BY created_at DESC`,
      )
      res.json(
        rows.map((r) => ({
          ...r,
          lastActive: r.createdAt,
          status: r.accountStatus === 'active' ? 'active' : r.accountStatus,
        })),
      )
    } catch (err) {
      console.error('GET /api/admin/users', err)
      res.status(500).json({ error: 'List users failed' })
    }
  })

  app.patch('/api/admin/users/:userId', requireElevated, async (req, res) => {
    try {
      const actor = req.elevatedUser
      const { userId } = req.params
      const nextRole = req.body?.role
      const nextStatus = req.body?.accountStatus

      if (nextRole != null) {
        const allowed = ['user', 'moderator', 'admin']
        if (!allowed.includes(nextRole)) {
          res.status(400).json({ error: 'Invalid role' })
          return
        }
        if (nextRole === 'admin' && actor.role !== 'admin') {
          res.status(403).json({ error: 'Only administrators can assign admin role' })
          return
        }
      }

      if (nextStatus != null && !['active', 'suspended', 'banned'].includes(nextStatus)) {
        res.status(400).json({ error: 'Invalid account status' })
        return
      }

      if (userId === actor.id && (nextRole === 'user' || nextStatus === 'suspended' || nextStatus === 'banned')) {
        res.status(400).json({ error: 'You cannot demote or suspend yourself' })
        return
      }

      const db = getDb()
      const target = await db.get('SELECT id, role FROM users WHERE id = ?', userId)
      if (!target) {
        res.status(404).json({ error: 'User not found' })
        return
      }
      if (target.role === 'admin' && actor.role !== 'admin') {
        res.status(403).json({ error: 'Cannot modify administrator accounts' })
        return
      }

      const sets = []
      const vals = []
      if (nextRole != null) {
        sets.push('role = ?')
        vals.push(nextRole)
      }
      if (nextStatus != null) {
        sets.push('account_status = ?')
        vals.push(nextStatus)
      }
      if (!sets.length) {
        res.status(400).json({ error: 'No updates' })
        return
      }
      vals.push(userId)
      await db.run(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, ...vals)
      pushActivity({
        type: 'admin',
        message: `User ${userId} updated by ${actor.email}`,
        meta: { nextRole, nextStatus },
      })
      const row = await db.get(
        `SELECT id, email, display_name as displayName, role, created_at as createdAt, account_status as accountStatus FROM users WHERE id = ?`,
        userId,
      )
      res.json(row)
    } catch (err) {
      console.error('PATCH /api/admin/users/:userId', err)
      res.status(500).json({ error: 'Update user failed' })
    }
  })

  app.get('/api/admin/rooms', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      const rows = await db.all(`
        SELECT r.id, r.name, r.created_at as createdAt, r.archived,
          (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id) as messageCount,
          (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as liveMemberCount,
          (SELECT MAX(timestamp) FROM messages m2 WHERE m2.room_id = r.id) as lastMessageAt
        FROM rooms r
        ORDER BY r.created_at DESC
      `)
      res.json(rows)
    } catch (err) {
      console.error('GET /api/admin/rooms', err)
      res.status(500).json({ error: 'List rooms failed' })
    }
  })

  app.patch('/api/admin/rooms/:roomId', requireElevated, async (req, res) => {
    try {
      const { name, archived } = req.body || {}
      const db = getDb()
      const roomId = req.params.roomId
      const room = await db.get('SELECT id FROM rooms WHERE id = ?', roomId)
      if (!room) {
        res.status(404).json({ error: 'Room not found' })
        return
      }
      if (typeof name === 'string' && name.trim()) {
        await db.run('UPDATE rooms SET name = ? WHERE id = ?', name.trim(), roomId)
      }
      if (typeof archived === 'boolean') {
        await db.run('UPDATE rooms SET archived = ? WHERE id = ?', archived ? 1 : 0, roomId)
      }
      const row = await db.get(
        `SELECT id, name, created_at as createdAt, archived FROM rooms WHERE id = ?`,
        roomId,
      )
      pushActivity({ type: 'room', message: `Room ${roomId} updated`, meta: req.body })
      res.json(row)
    } catch (err) {
      console.error('PATCH /api/admin/rooms/:roomId', err)
      res.status(500).json({ error: 'Update room failed' })
    }
  })

  app.delete('/api/admin/rooms/:roomId', requireAdmin, async (req, res) => {
    try {
      const db = getDb()
      const roomId = req.params.roomId
      await db.run('DELETE FROM room_pins WHERE room_id = ?', roomId)
      await db.run('DELETE FROM messages WHERE room_id = ?', roomId)
      await db.run('DELETE FROM whiteboard_strokes WHERE room_id = ?', roomId)
      await db.run('DELETE FROM room_members WHERE room_id = ?', roomId)
      const r = await db.run('DELETE FROM rooms WHERE id = ?', roomId)
      if (!r.changes) {
        res.status(404).json({ error: 'Room not found' })
        return
      }
      pushActivity({ type: 'room', message: `Room ${roomId} deleted` })
      res.json({ ok: true })
    } catch (err) {
      console.error('DELETE /api/admin/rooms/:roomId', err)
      res.status(500).json({ error: 'Delete room failed' })
    }
  })

  app.get('/api/admin/files', requireElevated, async (_req, res) => {
    try {
      const dir = path.resolve('data', 'uploads')
      await fs.mkdir(dir, { recursive: true })
      const names = await fs.readdir(dir)
      const items = await Promise.all(
        names.map(async (name) => {
          const full = path.join(dir, name)
          const stat = await fs.stat(full).catch(() => null)
          if (!stat?.isFile()) return null
          const ext = path.extname(name).slice(1).toLowerCase() || 'file'
          return {
            id: name,
            name,
            url: `/uploads/${name}`,
            size: stat.size,
            uploadedAt: stat.mtime.toISOString(),
            type: ext,
            flagged: false,
            uploader: '—',
            room: '—',
          }
        }),
      )
      res.json(items.filter(Boolean).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)))
    } catch (err) {
      console.error('GET /api/admin/files', err)
      res.status(500).json({ error: 'List files failed' })
    }
  })

  app.delete('/api/admin/files/:fileId', requireAdmin, async (req, res) => {
    try {
      const safe = path.basename(req.params.fileId)
      const full = path.resolve('data', 'uploads', safe)
      if (!full.startsWith(path.resolve('data', 'uploads'))) {
        res.status(400).json({ error: 'Invalid path' })
        return
      }
      await fs.unlink(full)
      pushActivity({ type: 'file', message: `File removed: ${safe}` })
      res.json({ ok: true })
    } catch (err) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ error: 'Not found' })
        return
      }
      console.error('DELETE /api/admin/files/:fileId', err)
      res.status(500).json({ error: 'Delete failed' })
    }
  })

  app.get('/api/admin/moderation', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      const rows = await listModerationReports(db, { limit: 200 })
      res.json({ queue: rows.map((r) => mapReportRow(r)).filter(Boolean) })
    } catch (err) {
      console.error('GET /api/admin/moderation', err)
      res.status(500).json({ error: 'List moderation failed' })
    }
  })

  app.post('/api/admin/moderation/:reportId/resolve', requireElevated, async (req, res) => {
    try {
      const db = getDb()
      const id = req.params.reportId
      const now = new Date().toISOString()
      const result = await db.run(
        `UPDATE moderation_reports SET status = 'resolved', resolved_at = ?, updated_at = ? WHERE id = ? AND status IN ('pending', 'reviewing')`,
        now,
        now,
        id,
      )
      if (!result.changes) {
        res.status(404).json({ error: 'Report not found' })
        return
      }
      const row = await db.get(
        `SELECT id, type, target, room_id, reason, status, created_at, resolved_at FROM moderation_reports WHERE id = ?`,
        id,
      )
      pushActivity({ type: 'moderation', message: `Report ${id} resolved` })
      res.json(mapReportRow(row))
    } catch (err) {
      console.error('POST /api/admin/moderation/:reportId/resolve', err)
      res.status(500).json({ error: 'Resolve failed' })
    }
  })

  app.patch('/api/admin/moderation/:reportId/status', requireElevated, async (req, res) => {
    try {
      const nextStatus = String(req.body?.status || '').trim().toLowerCase()
      if (!['reviewing', 'resolved', 'dismissed'].includes(nextStatus)) {
        res.status(400).json({ error: 'Invalid moderation status' })
        return
      }
      const db = getDb()
      const now = new Date().toISOString()
      const result = await db.run(
        `UPDATE moderation_reports
         SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? IN ('resolved', 'dismissed') THEN ? ELSE resolved_at END
         WHERE id = ?`,
        nextStatus,
        now,
        nextStatus,
        now,
        req.params.reportId,
      )
      if (!result.changes) {
        res.status(404).json({ error: 'Report not found' })
        return
      }
      const row = await db.get(
        `SELECT id, type, target, room_id, reason, status, created_at, resolved_at FROM moderation_reports WHERE id = ?`,
        req.params.reportId,
      )
      pushActivity({ type: 'moderation', message: `Report ${req.params.reportId} moved to ${nextStatus}` })
      res.json(mapReportRow(row))
    } catch (err) {
      console.error('PATCH /api/admin/moderation/:reportId/status', err)
      res.status(500).json({ error: 'Status update failed' })
    }
  })

  app.get('/api/admin/analytics', requireElevated, async (_req, res) => {
    try {
      const db = getDb()
      const byDay = await db.all(`
        SELECT date(timestamp) as day, COUNT(*) as messages
        FROM messages
        GROUP BY date(timestamp)
        ORDER BY day DESC
        LIMIT 14
      `)
      const topRooms = await db.all(`
        SELECT room_id as roomId, COUNT(*) as count
        FROM messages
        GROUP BY room_id
        ORDER BY count DESC
        LIMIT 8
      `)
      const topUsers = await db.all(`
        SELECT user_id as userId, username, COUNT(*) as count
        FROM messages
        GROUP BY user_id
        ORDER BY count DESC
        LIMIT 8
      `)
      const uploadsDir = path.resolve('data', 'uploads')
      let uploadCount = 0
      try {
        const names = await fs.readdir(uploadsDir)
        uploadCount = names.length
      } catch {
        /* */
      }
      const dauEstimate = (await db.get(`SELECT COUNT(DISTINCT user_id) as n FROM messages WHERE date(timestamp) = date('now')`))
        .n

      res.json({
        messagesByDay: byDay.reverse(),
        topRooms,
        topUsers,
        uploadCount,
        dauEstimate,
      })
    } catch (err) {
      console.error('GET /api/admin/analytics', err)
      res.status(500).json({ error: 'Analytics failed' })
    }
  })

  app.get('/api/admin/logs', requireElevated, async (_req, res) => {
    res.json({ entries: [...activityRing].reverse() })
  })

  app.get('/api/admin/settings', requireElevated, async (_req, res) => {
    const s = await readSettings()
    res.json(s)
  })

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    const cur = await readSettings()
    const next = { ...cur, ...req.body }
    await writeSettings(next)
    pushActivity({ type: 'settings', message: 'Platform settings updated' })
    res.json(next)
  })
}
