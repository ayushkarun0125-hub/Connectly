import { io } from 'socket.io-client'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

let socketInstance = null

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SERVER_URL, {
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
