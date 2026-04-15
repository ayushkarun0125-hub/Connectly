import { io } from 'socket.io-client'
import { getServerBaseUrl } from '@/config/serverUrl'
import { useConnectionStore } from '@/store/useConnectionStore'

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
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 12,
      reconnectionDelay: 800,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.5,
      timeout: 8000,
      auth: { token: readAuthToken() },
    })
    const setStatus = useConnectionStore.getState().setStatus
    const setTransport = useConnectionStore.getState().setTransport
    socketInstance.on('connect', () => {
      setStatus('connected')
      setTransport(socketInstance.io.engine?.transport?.name || 'unknown')
    })
    socketInstance.on('connect_error', () => setStatus('degraded'))
    socketInstance.on('reconnect_attempt', () => setStatus('connecting'))
    socketInstance.on('reconnect_failed', () => setStatus('degraded'))
    socketInstance.on('disconnect', () => setStatus('degraded'))
  }

  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
  useConnectionStore.getState().setStatus('connecting')
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
