export function isChatShellActive(pathname) {
  if (pathname === '/app/room-directory') return false
  if (pathname === '/app/rooms/join') return false
  if (!pathname.match(/^\/app\/rooms\/[^/]+/)) return false
  if (pathname.includes('/whiteboard')) return false
  return true
}
