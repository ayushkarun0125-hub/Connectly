import { io } from 'socket.io-client'
import { getServerBaseUrl } from '@/config/serverUrl'

let socketInstance = null
let socketInstanceUrl = null

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
      transports: ['websocket'],
    })
  }

  return socketInstance
}

export function connectSocket() {
  const socket = getSocket()
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
