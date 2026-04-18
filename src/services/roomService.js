import { getServerBaseUrl } from '@/config/serverUrl'

const ROOM_LABELS_KEY = 'connectly_room_labels'

export function readRoomLabelsFromStorage() {
  try {
    const raw = localStorage.getItem(ROOM_LABELS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

export function persistRoomLabelToStorage(roomId, name) {
  if (!roomId || !name) return
  try {
    const map = readRoomLabelsFromStorage()
    map[roomId] = name
    localStorage.setItem(ROOM_LABELS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function removeRoomLabelFromStorage(roomId) {
  if (!roomId) return
  try {
    const map = readRoomLabelsFromStorage()
    delete map[roomId]
    localStorage.setItem(ROOM_LABELS_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

function authHeaders() {
  const t = localStorage.getItem('connectly_jwt')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function createRoomApi(name) {
  const response = await fetch(`${getServerBaseUrl()}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json()
}

export async function resolveInviteCodeApi(code) {
  const trimmed = String(code || '').trim()
  if (!trimmed) return null
  const response = await fetch(
    `${getServerBaseUrl()}/api/rooms/resolve/${encodeURIComponent(trimmed)}`,
    { headers: { ...authHeaders() } },
  )
  if (!response.ok) return null
  return response.json()
}

export async function updateRoomNameApi(roomId, name) {
  const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json()
}

export async function deleteRoomApi(roomId) {
  const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || response.statusText || 'Delete failed')
  }
  return data
}
