import fs from 'fs/promises'
import path from 'path'
import { getDb } from '../utils/db.js'

const uploadsDir = path.resolve('data', 'uploads')

export async function recordUploadFile({ filename, userId, roomId, messageId }) {
  if (!filename || !userId || !roomId || !messageId) return
  const db = getDb()
  const now = new Date().toISOString()
  await db.run(
    `INSERT OR REPLACE INTO upload_files (filename, user_id, room_id, message_id, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    filename,
    userId,
    roomId,
    messageId,
    now,
  )
}

/** Deletes disk file, message row, pins, and upload_files. Any signed-in user may delete (no moderator/admin role required). */
export async function deleteUploadedFile({ filename, user, io }) {
  const raw = String(filename || '').trim()
  const safe = path.basename(raw)
  if (!safe || safe === '.' || safe === '..') {
    const err = new Error('Invalid file name')
    err.status = 400
    throw err
  }
  const full = path.join(uploadsDir, safe)
  if (!full.startsWith(uploadsDir)) {
    const err = new Error('Invalid path')
    err.status = 400
    throw err
  }

  const db = getDb()
  const row = await db.get(
    'SELECT filename, user_id as userId, room_id as roomId, message_id as messageId FROM upload_files WHERE filename = ?',
    safe,
  )

  const roomId = row?.roomId
  const messageId = row?.messageId

  if (roomId && messageId && io) {
    io.to(roomId).emit('message-deleted', { messageId })
  }

  if (messageId) {
    await db.run('DELETE FROM messages WHERE id = ?', messageId)
  }

  const needle = `/uploads/${safe}`
  await db.run('DELETE FROM room_pins WHERE instr(url, ?) > 0', needle)

  if (row) {
    await db.run('DELETE FROM upload_files WHERE filename = ?', safe)
  }

  try {
    await fs.unlink(full)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
  }

  return { ok: true }
}
