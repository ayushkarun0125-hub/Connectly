import { getServerBaseUrl } from '@/config/serverUrl'

function authHeaders() {
  const t = localStorage.getItem('connectly_jwt')
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }
}

export async function fetchWorkspaceMembers() {
  const r = await fetch(`${getServerBaseUrl()}/api/workspace/members`, { headers: authHeaders() })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Failed to load workspace members')
  return data.members || []
}

/** Admin only — creates a new account (same as signup, no auto-login). */
export async function addWorkspaceMember({ email, password, displayName }) {
  const r = await fetch(`${getServerBaseUrl()}/api/workspace/members`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password, displayName }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not add member')
  return data.user
}

/** Admin or moderator — suspends the account (removed from workspace access). */
export async function removeWorkspaceMember(userId) {
  const r = await fetch(`${getServerBaseUrl()}/api/workspace/members/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not remove member')
  return data
}

/** Admin or moderator — restores a suspended account. */
export async function restoreWorkspaceMember(userId) {
  const r = await fetch(`${getServerBaseUrl()}/api/workspace/members/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ accountStatus: 'active' }),
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || 'Could not restore member')
  return data.user
}
