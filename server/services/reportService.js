import crypto from 'node:crypto'
import { getDb } from '../utils/db.js'

const OPEN_REPORT_STATES = new Set(['pending', 'reviewing'])

function normalizeReportTarget({ type, messageId, fileId, targetUserId }) {
  if (type === 'message') return messageId || null
  if (type === 'file') return fileId || null
  if (type === 'user') return targetUserId || null
  return null
}

export async function createModerationReport({
  reporterUserId,
  type,
  roomId = null,
  reason,
  note = '',
  messageId = null,
  fileId = null,
  targetUserId = null,
}) {
  const cleanType = String(type || '').trim().toLowerCase()
  if (!['message', 'file', 'user'].includes(cleanType)) throw new Error('Invalid report type')
  const target = normalizeReportTarget({ type: cleanType, messageId, fileId, targetUserId })
  if (!target) throw new Error('Missing report target')
  const cleanReason = String(reason || '').trim().slice(0, 120)
  if (!cleanReason) throw new Error('Reason is required')
  const cleanNote = String(note || '').trim().slice(0, 500)
  const db = getDb()
  const existing = await db.get(
    `SELECT id FROM moderation_reports
     WHERE reporter_user_id = ? AND type = ? AND target = ? AND status IN ('pending', 'reviewing')
     ORDER BY datetime(created_at) DESC LIMIT 1`,
    reporterUserId,
    cleanType,
    target,
  )
  if (existing) throw new Error('You already reported this item')

  const id = `rep_${crypto.randomBytes(12).toString('hex')}`
  const now = new Date().toISOString()
  await db.run(
    `INSERT INTO moderation_reports
     (id, type, target, room_id, reporter_user_id, message_id, file_id, target_user_id, reason, note, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    id,
    cleanType,
    target,
    roomId || null,
    reporterUserId,
    messageId || null,
    fileId || null,
    targetUserId || null,
    cleanReason,
    cleanNote || null,
    now,
    now,
  )
  return {
    id,
    type: cleanType,
    target,
    roomId: roomId || null,
    reporterUserId,
    messageId: messageId || null,
    fileId: fileId || null,
    targetUserId: targetUserId || null,
    reason: cleanReason,
    note: cleanNote || null,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateModerationReportStatus(reportId, status) {
  const nextStatus = String(status || '').trim().toLowerCase()
  if (!['reviewing', 'resolved', 'dismissed'].includes(nextStatus)) {
    throw new Error('Invalid moderation status')
  }
  const db = getDb()
  const now = new Date().toISOString()
  const result = await db.run(
    `UPDATE moderation_reports
     SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? IN ('resolved', 'dismissed') THEN ? ELSE resolved_at END
     WHERE id = ?`,
    nextStatus,
    now,
    nextStatus,
    now,
    reportId,
  )
  if (!result.changes) return null
  const row = await db.get(
    `SELECT id, type, target, room_id as roomId, reporter_user_id as reporterUserId, message_id as messageId,
            file_id as fileId, target_user_id as targetUserId, reason, note, status, created_at as createdAt,
            updated_at as updatedAt, resolved_at as resolvedAt
     FROM moderation_reports WHERE id = ?`,
    reportId,
  )
  return row
}

export function isOpenReportStatus(status) {
  return OPEN_REPORT_STATES.has(String(status || '').toLowerCase())
}

