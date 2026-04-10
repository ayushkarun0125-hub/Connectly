import { getDb } from '../utils/db.js'

export async function addStroke(roomId, stroke) {
  const db = getDb()
  if (stroke.type === 'clear') {
    await db.run('DELETE FROM whiteboard_strokes WHERE room_id = ?', roomId)
    return
  }
  await db.run(
    `
    INSERT INTO whiteboard_strokes (room_id, x, y, prev_x, prev_y, color, size, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    roomId,
    stroke.x ?? null,
    stroke.y ?? null,
    stroke.prevX ?? null,
    stroke.prevY ?? null,
    stroke.color ?? null,
    stroke.size ?? null,
    stroke.type,
    new Date().toISOString(),
  )
}

export async function getWhiteboardState(roomId) {
  const db = getDb()
  const strokes = await db.all(
    `
    SELECT x, y, prev_x as prevX, prev_y as prevY, color, size, type
    FROM whiteboard_strokes
    WHERE room_id = ?
    ORDER BY id ASC
    `,
    roomId,
  )
  return { strokes }
}
