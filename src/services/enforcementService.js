import { getServerBaseUrl } from '@/config/serverUrl'

function authHeaders() {
  const token = localStorage.getItem('connectly_jwt')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function clearRoomEnforcement(roomId, targetUserId) {
  const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}/enforcement/clear`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ targetUserId }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not clear enforcement')
  return data
}

