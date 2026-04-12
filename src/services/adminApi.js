import { getServerBaseUrl } from '@/config/serverUrl'

const TOKEN_KEY = 'connectly_jwt'

function authHeaders() {
  const t = localStorage.getItem(TOKEN_KEY)
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  }
}

export async function adminFetch(path, options = {}) {
  const url = `${getServerBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed')
  }
  return data
}

export const adminApi = {
  overview: () => adminFetch('/api/admin/overview'),
  system: () => adminFetch('/api/admin/system'),
  users: () => adminFetch('/api/admin/users'),
  updateUser: (userId, body) =>
    adminFetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  rooms: () => adminFetch('/api/admin/rooms'),
  updateRoom: (roomId, body) =>
    adminFetch(`/api/admin/rooms/${encodeURIComponent(roomId)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteRoom: (roomId) =>
    adminFetch(`/api/admin/rooms/${encodeURIComponent(roomId)}`, { method: 'DELETE' }),
  files: () => adminFetch('/api/admin/files'),
  deleteFile: (fileId) =>
    adminFetch(`/api/admin/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' }),
  moderation: () => adminFetch('/api/admin/moderation'),
  resolveReport: (reportId) =>
    adminFetch(`/api/admin/moderation/${encodeURIComponent(reportId)}/resolve`, { method: 'POST' }),
  analytics: () => adminFetch('/api/admin/analytics'),
  logs: () => adminFetch('/api/admin/logs'),
  getSettings: () => adminFetch('/api/admin/settings'),
  putSettings: (body) => adminFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
}
