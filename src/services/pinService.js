const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function authHeaders() {
  const t = localStorage.getItem('connectly_jwt')
  return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}

export async function fetchRoomPins(roomId) {
  try {
    const r = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}/pins`)
    if (!r.ok) return []
    const data = await r.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function addRoomPin(roomId, { name, url, messageId, sender }) {
  const r = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}/pins`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, url, messageId: messageId || null, sender: sender || null }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data?.error || 'Could not pin file')
  return data
}

export async function removeRoomPin(roomId, pinId) {
  const r = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}/pins/${encodeURIComponent(pinId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!r.ok) {
    const data = await r.json().catch(() => ({}))
    throw new Error(data?.error || 'Could not remove pin')
  }
}
