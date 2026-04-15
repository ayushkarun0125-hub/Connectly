import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db.js'

const userRooms = new Map()

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
  userRooms.set(socketId, roomId)
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
  userRooms.set(socketId, roomId)
  return { role }
}

export async function leaveRoom({ socketId, roomId }) {
  const db = getDb()
  await db.run(
    'DELETE FROM room_members WHERE room_id = ? AND socket_id = ?',
    roomId,
    socketId,
  )
  userRooms.delete(socketId)
}

export async function getRoomUsers(roomId) {
  const db = getDb()
  const rows = await db.all(
    'SELECT socket_id, username, role, account_user_id FROM room_members WHERE room_id = ? ORDER BY joined_at ASC',
    roomId,
  )
  return rows.map((row) => ({
    userId: row.socket_id,
    accountUserId: row.account_user_id || null,
    username: row.username,
    role: row.role,
  }))
}

export function getUserRoom(socketId) {
  return userRooms.get(socketId)
}
