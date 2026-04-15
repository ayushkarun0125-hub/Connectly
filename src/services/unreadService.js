import { getServerBaseUrl } from '@/config/serverUrl'

function authHeaders() {
  const token = localStorage.getItem('connectly_jwt')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function fetchUnreadCounts() {
  const response = await fetch(`${getServerBaseUrl()}/api/unread`, { headers: authHeaders() })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not load unread counts')
  return data
}

export async function markRoomRead(roomId) {
  const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}/read`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not mark room read')
  return data
}

