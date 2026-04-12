/** Rooms users can hide from their sidebar (local only). */
export const HIDDEN_ROOMS_KEY = 'connectly_hidden_room_ids'

export function readHiddenRoomIds() {
  try {
    const raw = localStorage.getItem(HIDDEN_ROOMS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function addHiddenRoomId(roomId) {
  if (!roomId) return
  const prev = readHiddenRoomIds().filter((id) => id !== roomId)
  prev.push(roomId)
  localStorage.setItem(HIDDEN_ROOMS_KEY, JSON.stringify(prev))
}

export function removeHiddenRoomId(roomId) {
  const next = readHiddenRoomIds().filter((id) => id !== roomId)
  localStorage.setItem(HIDDEN_ROOMS_KEY, JSON.stringify(next))
}

/** Built-in rooms that cannot be deleted via the user API. */
export const PROTECTED_ROOM_IDS = ['room_design', 'room_backend']
