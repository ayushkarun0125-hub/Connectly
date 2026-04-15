import { getServerBaseUrl } from '@/config/serverUrl'

function authHeaders() {
  const token = localStorage.getItem('connectly_jwt')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

export async function createReport(payload) {
  const response = await fetch(`${getServerBaseUrl()}/api/reports`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Could not create report')
  return data
}

