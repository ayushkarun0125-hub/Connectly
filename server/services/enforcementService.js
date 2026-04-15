import crypto from 'node:crypto'
import { getDb } from '../utils/db.js'

function toIsoOrNull(value) {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export async function getUserAccountStatus(userId) {
  if (!userId) return 'active'
  const db = getDb()
  const row = await db.get(`SELECT account_status as accountStatus FROM users WHERE id = ?`, userId)
  return row?.accountStatus || 'active'
}

export async function getActiveRoomEnforcement(roomId, targetUserId) {
  const db = getDb()
  const nowIso = new Date().toISOString()
  const row = await db.get(
    `SELECT id, room_id as roomId, target_user_id as targetUserId, action, reason, note, actor_user_id as actorUserId,
            created_at as createdAt, expires_at as expiresAt, active
     FROM room_enforcements
     WHERE room_id = ? AND target_user_id = ? AND active = 1
     ORDER BY datetime(created_at) DESC
     LIMIT 1`,
    roomId,
    targetUserId,
  )
  if (!row) return null
  if (row.expiresAt && row.expiresAt <= nowIso) {
    await db.run(`UPDATE room_enforcements SET active = 0 WHERE id = ?`, row.id)
    return null
  }
  return row
}

export async function createRoomEnforcement({
  roomId,
  targetUserId,
  actorUserId,
  action,
  reason,
  note = '',
  expiresAt = null,
}) {
  const db = getDb()
  const now = new Date().toISOString()
  await db.run(`UPDATE room_enforcements SET active = 0 WHERE room_id = ? AND target_user_id = ? AND active = 1`, roomId, targetUserId)
  const id = `enf_${crypto.randomBytes(12).toString('hex')}`
  const until = toIsoOrNull(expiresAt)
  await db.run(
    `INSERT INTO room_enforcements
     (id, room_id, target_user_id, action, reason, note, actor_user_id, created_at, expires_at, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    id,
    roomId,
    targetUserId,
    action,
    reason,
    note || null,
    actorUserId,
    now,
    until,
  )
  return {
    id,
    roomId,
    targetUserId,
    action,
    reason,
    note: note || null,
    actorUserId,
    createdAt: now,
    expiresAt: until,
    active: 1,
  }
}

export async function clearRoomEnforcement(roomId, targetUserId) {
  const db = getDb()
  const result = await db.run(
    `UPDATE room_enforcements SET active = 0 WHERE room_id = ? AND target_user_id = ? AND active = 1`,
    roomId,
    targetUserId,
  )
  return result.changes > 0
}

