import fs from 'fs/promises'
import path from 'path'

const dataDir = path.resolve('data')
const messagesDir = path.join(dataDir, 'messages')
const roomsPath = path.join(dataDir, 'rooms.json')

export async function ensureDataFiles() {
  await fs.mkdir(messagesDir, { recursive: true })
  try {
    await fs.access(roomsPath)
  } catch {
    await fs.writeFile(roomsPath, '{}', 'utf-8')
  }
}

export async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export async function writeJson(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8')
}

export async function readRooms() {
  return readJson(roomsPath, {})
}

export async function writeRooms(rooms) {
  return writeJson(roomsPath, rooms)
}

export async function readRoomMessages(roomId) {
  const filePath = path.join(messagesDir, `${roomId}.json`)
  return readJson(filePath, [])
}

export async function writeRoomMessages(roomId, messages) {
  const filePath = path.join(messagesDir, `${roomId}.json`)
  return writeJson(filePath, messages)
}
