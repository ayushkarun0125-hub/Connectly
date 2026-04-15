import { getDb } from '../utils/db.js'

export function buildDmConversationId(aUserId, bUserId) {
  const pair = [String(aUserId || ''), String(bUserId || '')].sort()
  return `dm_${pair[0]}_${pair[1]}`
}

export async function ensureDmConversation(aUserId, bUserId) {
  if (!aUserId || !bUserId) throw new Error('Both users are required')
  if (String(aUserId) === String(bUserId)) throw new Error('Cannot create DM with yourself')
  const db = getDb()
  const id = buildDmConversationId(aUserId, bUserId)
  const now = new Date().toISOString()
  await db.run(
    `INSERT OR IGNORE INTO conversations (id, kind, created_at, updated_at) VALUES (?, 'dm', ?, ?)`,
    id,
    now,
    now,
  )
  const dmRoomId = `dm:${id}`
  await db.run(
    `INSERT OR IGNORE INTO rooms (id, name, created_at, archived, created_by_user_id)
     VALUES (?, ?, ?, 1, ?)`,
    dmRoomId,
    `DM ${aUserId} ${bUserId}`,
    now,
    aUserId,
  )
  await db.run(`UPDATE rooms SET archived = 1 WHERE id = ?`, dmRoomId)
  await db.run(
    `INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, joined_at) VALUES (?, ?, ?)`,
    id,
    String(aUserId),
    now,
  )
  await db.run(
    `INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, joined_at) VALUES (?, ?, ?)`,
    id,
    String(bUserId),
    now,
  )
  return id
}

export async function getUserConversations(userId) {
  const db = getDb()
  return db.all(
    `SELECT c.id, c.kind, c.updated_at as updatedAt
     FROM conversations c
     JOIN conversation_participants cp ON cp.conversation_id = c.id
     WHERE cp.user_id = ?
     ORDER BY datetime(c.updated_at) DESC`,
    String(userId),
  )
}

export async function isParticipant(conversationId, userId) {
  const db = getDb()
  const row = await db.get(
    `SELECT 1 as ok FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`,
    conversationId,
    String(userId),
  )
  return Boolean(row?.ok)
}

export async function getDmHistory(conversationId) {
  const db = getDb()
  return db.all(
    `SELECT id, conversation_id as conversationId, user_id as userId, username, content, type, timestamp
     FROM messages WHERE conversation_id = ? ORDER BY datetime(timestamp) ASC`,
    conversationId,
  )
}

