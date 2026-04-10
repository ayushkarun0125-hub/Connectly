import { mockFiles, mockRooms, mockUsers } from '../mock/data'
import { wait } from '../lib/utils'

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

export async function fetchDashboard() {
  await wait(600)
  return {
    rooms: mockRooms,
    activeUsers: mockUsers,
    notifications: [
      { id: 'n1', text: 'Ayush joined room_general' },
      { id: 'n2', text: 'New file uploaded in room_design' },
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
    const response = await fetch(`${API_BASE}/api/rooms/${encodeURIComponent(roomId)}`)
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
  return {
    room,
    messages: [],
    members: [],
    pinnedFiles: [],
  }
}

/** @deprecated Prefer fetchUploadedFiles for demo — reads server upload directory */
export async function fetchFiles() {
  await wait(300)
  return mockFiles
}

export async function fetchUploadedFiles() {
  try {
    const response = await fetch(`${API_BASE}/api/uploads`)
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

export async function fetchBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`)
    if (!response.ok) return { ok: false }
    return response.json()
  } catch {
    return { ok: false }
  }
}
