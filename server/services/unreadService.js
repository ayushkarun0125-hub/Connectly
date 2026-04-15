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

export async function getUnreadByRoom(userId) {
  const db = getDb()
  const rows = await db.all(
    `SELECT r.id as roomId,
      COALESCE(
        SUM(
          CASE
            WHEN rs.last_read_at IS NULL THEN 1
            WHEN datetime(m.timestamp) > datetime(rs.last_read_at) THEN 1
            ELSE 0
          END
        ), 0
      ) as unread
    FROM rooms r
    LEFT JOIN messages m ON m.room_id = r.id
    LEFT JOIN room_read_state rs ON rs.room_id = r.id AND rs.user_id = ?
    WHERE r.archived = 0
    GROUP BY r.id`,
    userId,
  )
  const map = {}
  let total = 0
  for (const row of rows) {
    const n = Number(row.unread) || 0
    map[row.roomId] = n
    total += n
  }
  return { perRoom: map, total }
}

