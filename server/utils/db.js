/* global process */
import path from 'path'
import { open } from 'sqlite'
import sqlite3 from 'sqlite3'

let db

export async function initDatabase() {
  const dbPath = process.env.DB_PATH || path.resolve('data', 'connectly.sqlite')
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS room_members (
      room_id TEXT NOT NULL,
      socket_id TEXT NOT NULL,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      PRIMARY KEY (room_id, socket_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS whiteboard_strokes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id TEXT NOT NULL,
      x REAL,
      y REAL,
      prev_x REAL,
      prev_y REAL,
      color TEXT,
      size REAL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `)

  const roomColumns = await db.all(`PRAGMA table_info(rooms)`)
  if (!roomColumns.some((col) => col.name === 'invite_code')) {
    await db.exec(`ALTER TABLE rooms ADD COLUMN invite_code TEXT`)
  }
  await db.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_invite_code ON rooms(invite_code) WHERE invite_code IS NOT NULL`,
  )
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}
