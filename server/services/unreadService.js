import { getDb } from '../utils/db.js'

export async function markRoomRead({ roomId, userId }) {
  const db = getDb()
  const latest = await db.get(
    `SELECT id, timestamp FROM messages WHERE room_id = ? ORDER BY datetime(timestamp) DESC LIMIT 1`,
    roomId,
  )
  const at = latest?.timestamp || new Date().toISOString()
  const messageId = latest?.id || null
  await db.run(
    `INSERT INTO room_read_state (room_id, user_id, last_read_at, last_read_message_id, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(room_id, user_id) DO UPDATE SET
       last_read_at = excluded.last_read_at,
       last_read_message_id = excluded.last_read_message_id,
       updated_at = excluded.updated_at`,
    roomId,
    userId,
    at,
    messageId,
    new Date().toISOString(),
  )
  return { roomId, userId, lastReadAt: at, lastReadMessageId: messageId }
}

/**
 * Unread counts per room for this user.
 * - Non-staff: only rooms in `room_access` (no stray totals from other workspaces).
 * - Counts messages newer than `room_read_state.last_read_at`, or all messages if never marked read.
 */
export async function getUnreadByRoom(userId, isStaff = false) {
  const db = getDb()
  const uid = String(userId)

  const unreadExpr = `(
    SELECT COUNT(*) FROM messages m
    WHERE m.room_id = r.id
    AND (
      NOT EXISTS (SELECT 1 FROM room_read_state rs WHERE rs.room_id = r.id AND rs.user_id = ?)
      OR datetime(m.timestamp) > datetime((
        SELECT rs2.last_read_at FROM room_read_state rs2
        WHERE rs2.room_id = r.id AND rs2.user_id = ? LIMIT 1
      ))
    )
  )`

  const sql = isStaff
    ? `SELECT r.id AS roomId, ${unreadExpr} AS unread
       FROM rooms r
       WHERE r.archived = 0`
    : `SELECT r.id AS roomId, ${unreadExpr} AS unread
       FROM rooms r
       INNER JOIN room_access ra ON ra.room_id = r.id AND ra.user_id = ?
       WHERE r.archived = 0`

  const params = isStaff ? [uid, uid] : [uid, uid, uid]
  const rows = await db.all(sql, ...params)

  const map = {}
  let total = 0
  for (const row of rows) {
    const n = Number(row.unread) || 0
    map[row.roomId] = n
    total += n
  }
  return { perRoom: map, total }
}
