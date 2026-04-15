import { getDb } from '../utils/db.js'

export async function getRoomHistory(roomId) {
  const db = getDb()
  return db.all(
    `
    SELECT id, user_id as userId, username, content, type, timestamp
    FROM messages
    WHERE room_id = ?
    ORDER BY timestamp ASC
    `,
    roomId,
  )
}

export async function createMessage({
  userId,
  username,
  content,
  type = 'text',
  extra = {},
}) {
  return {
    id: `msg_${Date.now()}`,
    userId,
    username,
    content,
    type,
    timestamp: new Date().toISOString(),
    ...extra,
  }
}

export async function persistMessage(roomId, message) {
  const db = getDb()
  await db.run(
    `
    INSERT INTO messages (id, room_id, conversation_id, user_id, username, content, type, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    message.id,
    roomId || null,
    message.conversationId || null,
    message.userId,
    message.username,
    message.content,
    message.type,
    message.timestamp,
  )
}
