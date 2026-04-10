const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

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

export async function createRoomApi(name) {
  const response = await fetch(`${API_BASE}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    `${API_BASE}/api/rooms/resolve/${encodeURIComponent(trimmed)}`,
  )
  if (!response.ok) return null
  return response.json()
}

export async function updateRoomNameApi(roomId, name) {
  const response = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || response.statusText)
  }
  return response.json()
}
