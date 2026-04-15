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

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
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

  const roomCols2 = await db.all(`PRAGMA table_info(rooms)`)
  if (!roomCols2.some((col) => col.name === 'archived')) {
    await db.exec(`ALTER TABLE rooms ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`)
  }
  const roomCols3 = await db.all(`PRAGMA table_info(rooms)`)
  if (!roomCols3.some((col) => col.name === 'created_by_user_id')) {
    await db.exec(`ALTER TABLE rooms ADD COLUMN created_by_user_id TEXT`)
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS room_pins (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      message_id TEXT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      sender TEXT,
      pinned_at TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_room_pins_room ON room_pins(room_id);

    CREATE TABLE IF NOT EXISTS upload_files (
      filename TEXT PRIMARY KEY,
      user_id TEXT,
      room_id TEXT NOT NULL,
      message_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS moderation_reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target TEXT NOT NULL,
      room_id TEXT,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL,
      resolved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
  `)

  const userCols = await db.all(`PRAGMA table_info(users)`)
  if (!userCols.some((col) => col.name === 'bio')) {
    await db.exec(`ALTER TABLE users ADD COLUMN bio TEXT`)
  }
  if (!userCols.some((col) => col.name === 'profile_completed')) {
    await db.exec(`ALTER TABLE users ADD COLUMN profile_completed INTEGER NOT NULL DEFAULT 1`)
  }
  if (!userCols.some((col) => col.name === 'account_status')) {
    await db.exec(`ALTER TABLE users ADD COLUMN account_status TEXT NOT NULL DEFAULT 'active'`)
  }

  // Deprecated default room: Design is the team default; remove General and related rows.
  try {
    await db.run(`DELETE FROM whiteboard_strokes WHERE room_id = 'room_general'`)
    await db.run(`DELETE FROM upload_files WHERE room_id = 'room_general'`)
    await db.run(`DELETE FROM rooms WHERE id = 'room_general'`)
  } catch {
    /* ignore if tables empty or migration already applied */
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}
