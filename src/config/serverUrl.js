/**
 * Base URL for REST + Socket.io. Priority:
 * 1. VITE_SERVER_URL — full override (build-time or .env)
 * 2. Same hostname as the page + VITE_SERVER_PORT (default 3001) — LAN-friendly dev
 * 3. localhost + port — SSR / tests
 */
function serverPort() {
  return String(import.meta.env.VITE_SERVER_PORT || '3001').replace(/\/$/, '')
}

export function getServerBaseUrl() {
  const explicit = import.meta.env.VITE_SERVER_URL
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).trim().replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const p = serverPort()
    const httpProto = protocol === 'https:' ? 'https:' : 'http:'
    return `${httpProto}//${hostname}:${p}`
  }

  return `http://localhost:${serverPort()}`
}
