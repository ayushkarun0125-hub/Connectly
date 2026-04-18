import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db.js'

/** Shared lobby: everyone gets `room_access` so workspace-wide presence / dashboard counts work. */
export const WORKSPACE_LOBBY_ROOM_ID = 'room_design'

const userRooms = new Map()

function trackSocketRoom(socketId, roomId) {
  if (!socketId || !roomId) return
  let set = userRooms.get(socketId)
  if (!set) {
    set = new Set()
    userRooms.set(socketId, set)
  }
  set.add(roomId)
}

const INVITE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function buildPersonalRoomId(userId) {
  return `room_private_${String(userId).replace(/[^a-zA-Z0-9_-]/g, '').slice(-20)}`
}

function randomInviteCode(length = 6) {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += INVITE_CHARS[bytes[i] % INVITE_CHARS.length]
  }
  return out
}

export function normalizeInviteCode(code) {
  return String(code || '')
    .replace(/[\s-]/g, '')
    .toUpperCase()
}

/** Built-in rooms that normal users cannot delete from the API. */
export const PROTECTED_ROOM_IDS = new Set(['room_design', 'room_backend'])

export async function createRoomWithInvite({ name, createdByUserId = null }) {
  const db = getDb()
  const now = new Date().toISOString()
  const displayName = String(name || 'New room').trim() || 'New room'
  const roomId = `room_${randomBytes(12).toString('hex')}`

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const inviteCode = randomInviteCode(6)
    try {
      await db.run(
        'INSERT INTO rooms (id, name, created_at, invite_code, created_by_user_id) VALUES (?, ?, ?, ?, ?)',
        roomId,
        displayName,
        now,
        inviteCode,
        createdByUserId,
      )
      if (createdByUserId) {
        await db.run(
          'INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source) VALUES (?, ?, ?, ?)',
          roomId,
          String(createdByUserId),
          now,
          'owner',
        )
      }
      return { id: roomId, name: displayName, inviteCode, createdByUserId }
    } catch (err) {
      const msg = String(err?.message || '')
      if (msg.includes('UNIQUE') || msg.includes('unique')) continue
      throw err
    }
  }
  throw new Error('Could not allocate a unique invite code')
}

export async function ensurePersonalRoomForUser({ userId, displayName }) {
  const db = getDb()
  const now = new Date().toISOString()
  const roomId = buildPersonalRoomId(userId)
  const roomName = `${String(displayName || 'My').trim() || 'My'} space`
  await db.run(
    `INSERT OR IGNORE INTO rooms (id, name, created_at, archived, created_by_user_id)
     VALUES (?, ?, ?, 0, ?)`,
    roomId,
    roomName,
    now,
    String(userId),
  )
  await db.run(
    `INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source)
     VALUES (?, ?, ?, 'personal')`,
    roomId,
    String(userId),
    now,
  )
  await db.run('UPDATE users SET personal_room_id = COALESCE(personal_room_id, ?) WHERE id = ?', roomId, String(userId))
  return roomId
}

export async function grantRoomAccess({ roomId, userId, source = 'invite' }) {
  if (!roomId || !userId) return
  const db = getDb()
  await db.run(
    'INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source) VALUES (?, ?, ?, ?)',
    String(roomId),
    String(userId),
    new Date().toISOString(),
    String(source),
  )
}

/** Ensures the team lobby room exists and every active account can enter it (for shared presence). */
export async function ensureWorkspaceLobbyForAllUsers() {
  const db = getDb()
  const now = new Date().toISOString()
  await db.run(
    `INSERT OR IGNORE INTO rooms (id, name, created_at, archived, created_by_user_id)
     VALUES (?, 'Design', ?, 0, NULL)`,
    WORKSPACE_LOBBY_ROOM_ID,
    now,
  )
  await db.run(
    `INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source)
     SELECT ?, u.id, ?, 'workspace'
     FROM users u
     WHERE COALESCE(u.account_status, 'active') = 'active'`,
    WORKSPACE_LOBBY_ROOM_ID,
    now,
  )
}

export async function userCanAccessRoom({ user, roomId }) {
  if (!user || !roomId) return false
  if (user.role === 'admin' || user.role === 'moderator') return true
  const db = getDb()
  const row = await db.get(
    `SELECT 1 as ok FROM room_access WHERE room_id = ? AND user_id = ?`,
    String(roomId),
    String(user.id),
  )
  return Boolean(row?.ok)
}

export async function resolveInviteCode(code) {
  const normalized = normalizeInviteCode(code)
  if (normalized.length < 4) return null
  const db = getDb()
  const row = await db.get(
    'SELECT id, name, invite_code as inviteCode FROM rooms WHERE UPPER(invite_code) = ?',
    normalized,
  )
  return row || null
}

export async function getRoomById(roomId) {
  const db = getDb()
  return db.get(
    'SELECT id, name, invite_code as inviteCode, created_by_user_id as createdByUserId FROM rooms WHERE id = ?',
    roomId,
  )
}

export async function deleteRoomCascade(roomId) {
  const db = getDb()
  await db.run('DELETE FROM room_pins WHERE room_id = ?', roomId)
  await db.run('DELETE FROM messages WHERE room_id = ?', roomId)
  await db.run('DELETE FROM whiteboard_strokes WHERE room_id = ?', roomId)
  await db.run('DELETE FROM room_members WHERE room_id = ?', roomId)
  const r = await db.run('DELETE FROM rooms WHERE id = ?', roomId)
  return r.changes > 0
}

export async function updateRoomName(roomId, name) {
  const displayName = String(name || '').trim()
  if (!displayName) return null
  const db = getDb()
  const result = await db.run('UPDATE rooms SET name = ? WHERE id = ?', displayName, roomId)
  if (!result.changes) return null
  return getRoomById(roomId)
}

export async function joinRoom({ socketId, roomId, username }) {
  const db = getDb()
  const now = new Date().toISOString()
  await db.run(
    'INSERT OR IGNORE INTO rooms (id, name, created_at) VALUES (?, ?, ?)',
    roomId,
    roomId,
    now,
  )

  const row = await db.get(
    'SELECT COUNT(*) as count FROM room_members WHERE room_id = ?',
    roomId,
  )
  const role = row.count === 0 ? 'admin' : 'member'

  await db.run(
    `
    INSERT OR REPLACE INTO room_members (room_id, socket_id, username, role, joined_at, account_user_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    roomId,
    socketId,
    username,
    role,
    now,
    null,
  )
  trackSocketRoom(socketId, roomId)
  return { role }
}

export async function joinRoomWithAccount({ socketId, roomId, username, accountUserId }) {
  const db = getDb()
  const now = new Date().toISOString()
  await db.run(
    'INSERT OR IGNORE INTO rooms (id, name, created_at) VALUES (?, ?, ?)',
    roomId,
    roomId,
    now,
  )
  if (accountUserId) {
    const un = String(username || '').trim()
    if (un) {
      await db.run(
        `DELETE FROM room_members WHERE room_id = ?
         AND (account_user_id IS NULL OR TRIM(account_user_id) = '')
         AND LOWER(TRIM(username)) = LOWER(?)`,
        roomId,
        un,
      )
    }
  }
  const row = await db.get('SELECT COUNT(*) as count FROM room_members WHERE room_id = ?', roomId)
  const role = row.count === 0 ? 'admin' : 'member'
  await db.run(
    `
    INSERT OR REPLACE INTO room_members (room_id, socket_id, username, role, joined_at, account_user_id)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    roomId,
    socketId,
    username,
    role,
    now,
    accountUserId || null,
  )
  trackSocketRoom(socketId, roomId)
  return { role }
}

export async function leaveRoom({ socketId, roomId }) {
  const db = getDb()
  await db.run(
    'DELETE FROM room_members WHERE room_id = ? AND socket_id = ?',
    roomId,
    socketId,
  )
  const set = userRooms.get(socketId)
  if (set) {
    set.delete(roomId)
    if (set.size === 0) userRooms.delete(socketId)
  }
}

function normalizePresenceName(username) {
  return String(username || '')
    .trim()
    .toLowerCase()
}

function hasAccountId(u) {
  return u.accountUserId != null && String(u.accountUserId).trim() !== ''
}

export async function getRoomUsers(roomId) {
  const db = getDb()
  const rows = await db.all(
    'SELECT socket_id, username, role, account_user_id, joined_at FROM room_members WHERE room_id = ? ORDER BY datetime(joined_at) DESC',
    roomId,
  )
  /** One presence row per logged-in account (multi-tab = one user). Guests keyed by socket. */
  const seen = new Set()
  const out = []
  for (const row of rows) {
    const acct = row.account_user_id != null && String(row.account_user_id).trim() !== '' ? String(row.account_user_id).trim() : ''
    const key = acct ? `a:${acct}` : `s:${row.socket_id}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      userId: row.socket_id,
      accountUserId: acct || null,
      username: row.username,
      role: row.role,
    })
  }

  /** Drop stale rows: same display name as a logged-in user but missing account_user_id (old sessions). */
  const namesWithAccounts = new Set()
  for (const u of out) {
    const n = normalizePresenceName(u.username)
    if (n && hasAccountId(u)) namesWithAccounts.add(n)
  }
  const merged = out.filter((u) => {
    const n = normalizePresenceName(u.username)
    if (!n) return true
    if (hasAccountId(u)) return true
    return !namesWithAccounts.has(n)
  })

  const accountIds = [...new Set(merged.map((u) => u.accountUserId).filter(Boolean))]
  const roleById = {}
  if (accountIds.length) {
    const placeholders = accountIds.map(() => '?').join(',')
    const urows = await db.all(`SELECT id, role FROM users WHERE id IN (${placeholders})`, ...accountIds)
    for (const r of urows) {
      roleById[r.id] = r.role
    }
  }

  const withAppRole = merged.map((u) => {
    const app = u.accountUserId ? roleById[u.accountUserId] : null
    let displayRole = u.role
    if (app) {
      displayRole = app === 'user' ? 'member' : app
    }
    return {
      userId: u.userId,
      accountUserId: u.accountUserId,
      username: u.username,
      role: displayRole,
    }
  })

  withAppRole.sort((a, b) => String(a.username).localeCompare(String(b.username), undefined, { sensitivity: 'base' }))
  return withAppRole
}

/**
 * Display name for this socket in a room after presence dedupe (another tab may own the listed row).
 */
export async function resolveRoomUsername(roomId, socket) {
  const users = await getRoomUsers(roomId)
  const sid = socket.id
  const acct = socket.accountUserId != null ? String(socket.accountUserId) : ''
  let row = users.find((u) => u.userId === sid)
  if (!row && acct) {
    row = users.find((u) => u.accountUserId === acct)
  }
  return row?.username || socket.accountDisplayName || 'Anonymous'
}

/** @returns {string[]} room ids this socket has joined (DB presence rows may still exist if tracking desynced). */
export function getUserRooms(socketId) {
  const set = userRooms.get(socketId)
  return set ? [...set] : []
}
