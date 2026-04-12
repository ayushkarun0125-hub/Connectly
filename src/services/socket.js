import { io } from 'socket.io-client'
import { getServerBaseUrl } from '@/config/serverUrl'

let socketInstance = null
let socketInstanceUrl = null

function readAuthToken() {
  try {
    return localStorage.getItem('connectly_jwt') || ''
  } catch {
    return ''
  }
}

export function getSocket() {
  const url = getServerBaseUrl()
  if (socketInstance && socketInstanceUrl !== url) {
    socketInstance.disconnect()
    socketInstance = null
    socketInstanceUrl = null
  }
  if (!socketInstance) {
    socketInstanceUrl = url
    socketInstance = io(url, {
      autoConnect: false,
      // Polling first avoids failures when pure WebSocket upgrade is blocked (proxy, some browsers).
      transports: ['polling', 'websocket'],
      auth: { token: readAuthToken() },
    })
  }

  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
  try {
    const t = readAuthToken()
    socket.auth = { ...socket.auth, token: t }
  } catch {
    /* ignore */
  }
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export function disconnectSocket() {
  if (socketInstance?.connected) {
    socketInstance.disconnect()
  }
}
