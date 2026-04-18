import { createMessage, getRoomHistory, persistMessage } from '../controllers/messageController.js'
import { saveFile } from '../controllers/fileController.js'
import { recordUploadFile } from '../controllers/uploadController.js'
import { addStroke, getWhiteboardState } from '../controllers/whiteboardController.js'
import {
  getRoomUsers,
  getUserRooms,
  joinRoomWithAccount,
  leaveRoom,
  resolveRoomUsername,
  userCanAccessRoom,
} from '../controllers/roomController.js'
import { createRoomEnforcement, getActiveRoomEnforcement } from '../services/enforcementService.js'
import { ensureDmConversation, getDmHistory, isParticipant } from '../services/dmService.js'

export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    async function denyRoomJoin(roomId, enforcement) {
      socket.emit('room-join-denied', {
        roomId,
        reason: enforcement?.reason || 'You cannot join this room right now.',
        until: enforcement?.expiresAt || null,
      })
    }

    socket.on('join-room', async ({ roomId, username }) => {
      if (!roomId || !username) return
      if (!socket.accountUserId) {
        await denyRoomJoin(roomId, { reason: 'Sign in required.' })
        return
      }
      if (socket.accountStatus && socket.accountStatus !== 'active') {
        await denyRoomJoin(roomId, { reason: 'Your account does not have active access.' })
        return
      }
      const canAccess = await userCanAccessRoom({
        user: { id: socket.accountUserId, role: socket.accountRole || 'user' },
        roomId,
      })
      if (!canAccess) {
        await denyRoomJoin(roomId, { reason: 'You do not have access to this room.' })
        return
      }
      if (socket.accountUserId) {
        const enforcement = await getActiveRoomEnforcement(roomId, socket.accountUserId)
        if (enforcement) {
          await denyRoomJoin(roomId, enforcement)
          return
        }
      }
      socket.join(roomId)
      const { role } = await joinRoomWithAccount({
        socketId: socket.id,
        roomId,
        username,
        accountUserId: socket.accountUserId || null,
      })
      const history = await getRoomHistory(roomId)
      const usersList = await getRoomUsers(roomId)
      socket.emit('room-history', history)
      socket.emit('whiteboard-state', await getWhiteboardState(roomId))
      io.to(roomId).emit('room-users', usersList)
      socket.to(roomId).emit('user-joined', { userId: socket.id, username, role })
    })

    socket.on('leave-room', async ({ roomId }) => {
      if (!roomId) return
      await leaveRoom({ socketId: socket.id, roomId })
      socket.leave(roomId)
      socket.to(roomId).emit('user-left', { userId: socket.id })
      try {
        io.to(roomId).emit('room-users', await getRoomUsers(roomId))
      } catch {
        /* room may be empty */
      }
    })

    socket.on('send-message', async ({ roomId, content, type }) => {
      if (!roomId || !content) return
      const username = await resolveRoomUsername(roomId, socket)
      const message = await createMessage({
        userId: socket.accountUserId || socket.id,
        username,
        content,
        type,
      })
      await persistMessage(roomId, message)
      io.to(roomId).emit('new-message', message)
      io.to(roomId).emit('room-unread-updated', { roomId })
    })

    socket.on('typing-start', ({ roomId }) => {
      resolveRoomUsername(roomId, socket).then((username) => {
        socket.to(roomId).emit('user-typing', { userId: socket.id, username })
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
      const username = await resolveRoomUsername(roomId, socket)
      const message = await createMessage({
        userId: socket.accountUserId || socket.id,
        username,
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
      io.to(roomId).emit('room-unread-updated', { roomId })
    })

    socket.on('kick-user', async ({ roomId, targetUserId, reason, note, durationMs }, ack) => {
      const actorRole = socket.accountRole || 'user'
      if (!['admin', 'moderator'].includes(actorRole)) {
        ack?.({ ok: false, error: 'Not allowed' })
        return
      }
      if (!roomId || !targetUserId || !socket.accountUserId) {
        ack?.({ ok: false, error: 'Invalid payload' })
        return
      }
      if (targetUserId === socket.accountUserId) {
        ack?.({ ok: false, error: 'Cannot kick yourself' })
        return
      }
      const until =
        Number.isFinite(Number(durationMs)) && Number(durationMs) > 0
          ? new Date(Date.now() + Number(durationMs)).toISOString()
          : new Date(Date.now() + 5 * 60 * 1000).toISOString()
      await createRoomEnforcement({
        roomId,
        targetUserId,
        actorUserId: socket.accountUserId,
        action: 'kick',
        reason: String(reason || 'Removed by moderator').slice(0, 120),
        note: String(note || '').slice(0, 500),
        expiresAt: until,
      })
      for (const [, client] of io.of('/').sockets) {
        if (client.accountUserId === targetUserId) {
          await leaveRoom({ socketId: client.id, roomId })
          client.leave(roomId)
          client.emit('room-removed', {
            roomId,
            reason: String(reason || 'You were removed from this room'),
            until,
            actor: socket.accountUserId,
          })
        }
      }
      io.to(roomId).emit('room-users', await getRoomUsers(roomId))
      ack?.({ ok: true, roomId, targetUserId, until })
    })

    socket.on('ban-user', async ({ roomId, targetUserId, reason, note }, ack) => {
      const actorRole = socket.accountRole || 'user'
      if (!['admin', 'moderator'].includes(actorRole)) {
        ack?.({ ok: false, error: 'Not allowed' })
        return
      }
      if (!roomId || !targetUserId || !socket.accountUserId) {
        ack?.({ ok: false, error: 'Invalid payload' })
        return
      }
      if (targetUserId === socket.accountUserId) {
        ack?.({ ok: false, error: 'Cannot ban yourself' })
        return
      }
      await createRoomEnforcement({
        roomId,
        targetUserId,
        actorUserId: socket.accountUserId,
        action: 'ban',
        reason: String(reason || 'Banned from room').slice(0, 120),
        note: String(note || '').slice(0, 500),
        expiresAt: null,
      })
      for (const [, client] of io.of('/').sockets) {
        if (client.accountUserId === targetUserId) {
          await leaveRoom({ socketId: client.id, roomId })
          client.leave(roomId)
          client.emit('room-removed', {
            roomId,
            reason: String(reason || 'You were banned from this room'),
            until: null,
            actor: socket.accountUserId,
          })
        }
      }
      io.to(roomId).emit('room-users', await getRoomUsers(roomId))
      ack?.({ ok: true, roomId, targetUserId })
    })

    socket.on('join-dm', async ({ peerUserId, conversationId }, ack) => {
      if (!socket.accountUserId) {
        ack?.({ ok: false, error: 'Sign in required' })
        return
      }
      let cid = conversationId
      if (!cid) {
        if (!peerUserId) {
          ack?.({ ok: false, error: 'Missing peer' })
          return
        }
        cid = await ensureDmConversation(socket.accountUserId, peerUserId)
      }
      const member = await isParticipant(cid, socket.accountUserId)
      if (!member) {
        ack?.({ ok: false, error: 'Access denied' })
        return
      }
      const room = `dm:${cid}`
      socket.join(room)
      const history = await getDmHistory(cid)
      socket.emit('dm-history', { conversationId: cid, messages: history })
      ack?.({ ok: true, conversationId: cid })
    })

    socket.on('send-message-dm', async ({ conversationId, content, type }, ack) => {
      if (!socket.accountUserId || !conversationId || !content) {
        ack?.({ ok: false, error: 'Invalid payload' })
        return
      }
      const member = await isParticipant(conversationId, socket.accountUserId)
      if (!member) {
        ack?.({ ok: false, error: 'Access denied' })
        return
      }
      const message = await createMessage({
        userId: socket.accountUserId,
        username: socket.accountDisplayName || 'User',
        content,
        type: type || 'text',
        extra: { conversationId },
      })
      await persistMessage(`dm:${conversationId}`, message)
      io.to(`dm:${conversationId}`).emit('new-message-dm', message)
      ack?.({ ok: true, message })
    })

    socket.on('disconnect', async () => {
      const roomIds = getUserRooms(socket.id)
      for (const roomId of roomIds) {
        await leaveRoom({ socketId: socket.id, roomId })
        socket.to(roomId).emit('user-left', { userId: socket.id })
        try {
          io.to(roomId).emit('room-users', await getRoomUsers(roomId))
        } catch {
          /* ignore */
        }
      }
    })
  })
}
