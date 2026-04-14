export function getServerBaseUrl() {
  const explicit = import.meta.env.VITE_SERVER_URL
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).trim().replace(/\/$/, '')
  }

  const p = String(import.meta.env.VITE_SERVER_PORT || '3001').replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    const httpProto = protocol === 'https:' ? 'https:' : 'http:'
    return `${httpProto}//${hostname}:${p}`
  }

  return `http://0.0.0.0:${p}`
}
