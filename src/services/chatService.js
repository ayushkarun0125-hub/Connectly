import { getServerBaseUrl } from '@/config/serverUrl'
import { fetchRoomPins } from './pinService'

function authHeaders() {
  const t = localStorage.getItem('connectly_jwt')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

const emptyDashboard = {
  rooms: [],
  activeUsers: [],
  sharedFilesCount: 0,
  unreadMessagesTotal: 0,
  recentFiles: [],
  activity: [],
}

export async function fetchDashboard() {
  try {
    const response = await fetch(`${getServerBaseUrl()}/api/workspace/dashboard`, {
      headers: { ...authHeaders() },
    })
    if (response.status === 401) {
      return { ...emptyDashboard }
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || response.statusText || 'Dashboard failed')
    }
    return response.json()
  } catch {
    return { ...emptyDashboard }
  }
}

function roomIdToLabel(roomId) {
  const raw = String(roomId || '').replace(/^room_/, '').replace(/_/g, ' ').trim()
  return raw || roomId || 'Room'
}

/**
 * Room shell for UI labels only. Messages, members, and pins come from Socket.io after join-room.
 */
export async function fetchRoomData(roomId) {
  let room = {
    id: roomId,
    name: roomIdToLabel(roomId),
    inviteCode: null,
  }
  try {
    const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}`)
    if (response.ok) {
      const data = await response.json()
      room = {
        id: data.id,
        name: data.name,
        inviteCode: data.inviteCode ?? null,
        createdByUserId: data.createdByUserId ?? null,
      }
    }
  } catch {
    /* keep derived shell */
  }
  const pins = await fetchRoomPins(roomId)
  const pinnedFiles = pins.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    sender: p.sender || '',
    messageId: p.messageId,
    pinnedAt: p.pinnedAt,
  }))
  return {
    room,
    messages: [],
    members: [],
    pinnedFiles,
  }
}

export async function fetchFiles() {
  return fetchUploadedFiles()
}

export async function fetchUploadedFiles() {
  try {
    const response = await fetch(`${getServerBaseUrl()}/api/uploads`)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

/** @deprecated Prefer fetchUploadedFiles for demo — reads server upload directory */
export async function uploadFileToServer(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
  if (!base64) throw new Error('Empty file')
  const response = await fetch(`${getServerBaseUrl()}/api/uploads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      data: base64,
    }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || response.statusText || 'Upload failed')
  }
  return data
}

/** Deletes a server upload. Requires sign-in; no moderator or admin role needed. */
export async function deleteUploadedFile(fileName) {
  const safe = String(fileName || '').trim()
  if (!safe) throw new Error('File name required')
  const response = await fetch(`${getServerBaseUrl()}/api/uploads/${encodeURIComponent(safe)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || response.statusText || 'Delete failed')
  }
  return data
}

export async function fetchBackendHealth() {
  try {
    const response = await fetch(`${getServerBaseUrl()}/health`)
    if (!response.ok) return { ok: false }
    return response.json()
  } catch {
    return { ok: false }
  }
}
