import { getServerBaseUrl } from '@/config/serverUrl'
import { mockFiles, mockRooms, mockUsers } from '../mock/data'
import { wait } from '../lib/utils'
import { fetchRoomPins } from './pinService'

export async function fetchDashboard() {
  await wait(400)
  return {
    rooms: mockRooms.map((room, i) => ({
      ...room,
      unread: [2, 0, 1][i] ?? 0,
      onlineInRoom: Math.max(1, Math.min(room.members, Math.round(room.members * 0.55) + 1)),
    })),
    activeUsers: mockUsers,
    sharedFilesCount: mockFiles.length,
    unreadMessagesTotal: 5,
    recentFiles: mockFiles,
    activity: [
      { id: 'a1', type: 'join', actor: 'Ayush', action: 'joined', target: 'General', time: '3 min ago' },
      { id: 'a2', type: 'message', actor: 'Aaryan', action: 'sent a message in', target: 'Design', time: '12 min ago' },
      { id: 'a3', type: 'file', actor: 'Dhruv', action: 'uploaded', target: 'sprint-notes.pdf', time: '24 min ago' },
      { id: 'a4', type: 'join', actor: 'Aaryan', action: 'started whiteboard in', target: 'Backend', time: '1 hr ago' },
    ],
  }
}

/**
 * Room shell for UI labels only. Messages, members, and pins come from Socket.io after join-room.
 */
export async function fetchRoomData(roomId) {
  await wait(80)
  const shell =
    mockRooms.find((item) => item.id === roomId) || {
      id: roomId,
      name: roomId.replace(/^room_/, '').replace(/_/g, ' ') || roomId,
    }
  let room = { ...shell, inviteCode: null }
  try {
    const response = await fetch(`${getServerBaseUrl()}/api/rooms/${encodeURIComponent(roomId)}`)
    if (response.ok) {
      const data = await response.json()
      room = {
        id: data.id,
        name: data.name,
        inviteCode: data.inviteCode ?? null,
      }
    }
  } catch {
    /* keep mock shell */
  }
  const pins = await fetchRoomPins(roomId)
  const pinnedFiles = pins.map((p) => ({
    id: p.id,
    name: p.name,
    url: p.url,
    sender: p.sender || '',
    messageId: p.messageId,
    pinnedAt: p.pinnedAt,
  }))
  return {
    room,
    messages: [],
    members: [],
    pinnedFiles,
  }
}

/** @deprecated Prefer fetchUploadedFiles for demo — reads server upload directory */
export async function fetchFiles() {
  await wait(300)
  return mockFiles
}

export async function fetchUploadedFiles() {
  try {
    const response = await fetch(`${getServerBaseUrl()}/api/uploads`)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function fetchBackendHealth() {
  try {
    const response = await fetch(`${getServerBaseUrl()}/health`)
    if (!response.ok) return { ok: false }
    return response.json()
  } catch {
    return { ok: false }
  }
}
