import { createMessage, getRoomHistory, persistMessage } from '../controllers/messageController.js'
import { saveFile } from '../controllers/fileController.js'
import { recordUploadFile } from '../controllers/uploadController.js'
import { addStroke, getWhiteboardState } from '../controllers/whiteboardController.js'
import { getRoomUsers, getUserRoom, joinRoom, leaveRoom } from '../controllers/roomController.js'

export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join-room', async ({ roomId, username }) => {
      if (!roomId || !username) return
      socket.join(roomId)
      const { role } = await joinRoom({ socketId: socket.id, roomId, username })
      const history = await getRoomHistory(roomId)
      socket.emit('room-history', history)
      socket.emit('room-users', await getRoomUsers(roomId))
      socket.emit('whiteboard-state', await getWhiteboardState(roomId))
      socket.to(roomId).emit('user-joined', { userId: socket.id, username, role })
    })

    socket.on('leave-room', async ({ roomId }) => {
      if (!roomId) return
      await leaveRoom({ socketId: socket.id, roomId })
      socket.leave(roomId)
      socket.to(roomId).emit('user-left', { userId: socket.id })
    })

    socket.on('send-message', async ({ roomId, content, type }) => {
      if (!roomId || !content) return
      const currentUsers = await getRoomUsers(roomId)
      const sender = currentUsers.find((user) => user.userId === socket.id)
      const message = await createMessage({
        userId: socket.id,
        username: sender?.username || 'Anonymous',
        content,
        type,
      })
      await persistMessage(roomId, message)
      io.to(roomId).emit('new-message', message)
    })

    socket.on('typing-start', ({ roomId }) => {
      getRoomUsers(roomId).then((users) => {
        const sender = users.find((user) => user.userId === socket.id)
        socket.to(roomId).emit('user-typing', { userId: socket.id, username: sender?.username || 'Anonymous' })
      })
    })

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stopped-typing', { userId: socket.id })
    })

    socket.on('draw-event', async (payload) => {
      const { roomId, ...stroke } = payload || {}
      if (!roomId) return
      await addStroke(roomId, stroke)
      socket.to(roomId).emit('draw-event', stroke)
    })

    socket.on('upload-file', async ({ roomId, filename, mimeType, data }) => {
      if (!roomId || !filename || !data) return
      const savedName = await saveFile({ filename, data })
      const sender = (await getRoomUsers(roomId)).find((user) => user.userId === socket.id)
      const message = await createMessage({
        userId: socket.id,
        username: sender?.username || 'Anonymous',
        content: filename,
        type: 'file',
        extra: {
          filename,
          url: `/uploads/${savedName}`,
          mimeType: mimeType || 'application/octet-stream',
        },
      })
      await persistMessage(roomId, message)
      if (socket.accountUserId) {
        try {
          await recordUploadFile({
            filename: savedName,
            userId: socket.accountUserId,
            roomId,
            messageId: message.id,
          })
        } catch {
          /* upload still on disk; deletion may rely on admin until ledger exists */
        }
      }
      io.to(roomId).emit('new-message', message)
      io.to(roomId).emit('file-shared', message)
    })

    socket.on('disconnect', async () => {
      const roomId = getUserRoom(socket.id)
      if (!roomId) return
      await leaveRoom({ socketId: socket.id, roomId })
      socket.to(roomId).emit('user-left', { userId: socket.id })
    })
  })
}
