import { randomBytes } from 'node:crypto'
import { getDb } from '../utils/db.js'

const userRooms = new Map()

const INVITE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

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

export async function createRoomWithInvite({ name }) {
  const db = getDb()
  const now = new Date().toISOString()
  const displayName = String(name || 'New room').trim() || 'New room'
  const roomId = `room_${randomBytes(12).toString('hex')}`

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const inviteCode = randomInviteCode(6)
    try {
      await db.run(
        'INSERT INTO rooms (id, name, created_at, invite_code) VALUES (?, ?, ?, ?)',
        roomId,
        displayName,
        now,
        inviteCode,
      )
      return { id: roomId, name: displayName, inviteCode }
    } catch (err) {
      const msg = String(err?.message || '')
      if (msg.includes('UNIQUE') || msg.includes('unique')) continue
      throw err
    }
  }
  throw new Error('Could not allocate a unique invite code')
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
    'SELECT id, name, invite_code as inviteCode FROM rooms WHERE id = ?',
    roomId,
  )
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
    INSERT OR REPLACE INTO room_members (room_id, socket_id, username, role, joined_at)
    VALUES (?, ?, ?, ?, ?)
    `,
    roomId,
    socketId,
    username,
    role,
    now,
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
    'SELECT socket_id, username, role FROM room_members WHERE room_id = ? ORDER BY joined_at ASC',
    roomId,
  )
  return rows.map((row) => ({
    userId: row.socket_id,
    username: row.username,
    role: row.role,
  }))
}

export function getUserRoom(socketId) {
  return userRooms.get(socketId)
}
