import { getServerBaseUrl } from '@/config/serverUrl'

function authHeaders() {
  const token = localStorage.getItem('connectly_jwt')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function ensureDmConversation(peerUserId) {
  const response = await fetch(`${getServerBaseUrl()}/api/dm/conversations`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ peerUserId }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not open DM')
  return data
}

export async function fetchDmConversations() {
  const response = await fetch(`${getServerBaseUrl()}/api/dm/conversations`, { headers: authHeaders() })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not load DMs')
  return data.conversations || []
}

export async function fetchDmMessages(conversationId) {
  const response = await fetch(`${getServerBaseUrl()}/api/dm/conversations/${encodeURIComponent(conversationId)}/messages`, {
    headers: authHeaders(),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not load DM messages')
  return data.messages || []
}

