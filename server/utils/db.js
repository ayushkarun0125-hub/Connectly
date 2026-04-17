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
      account_user_id TEXT,
      joined_at TEXT NOT NULL,
      PRIMARY KEY (room_id, socket_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room_id TEXT,
      conversation_id TEXT,
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
      username TEXT UNIQUE,
      avatar_url TEXT,
      interest TEXT,
      personal_room_id TEXT,
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
  const roomMemberCols = await db.all(`PRAGMA table_info(room_members)`)
  if (!roomMemberCols.some((col) => col.name === 'account_user_id')) {
    await db.exec(`ALTER TABLE room_members ADD COLUMN account_user_id TEXT`)
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
      reporter_user_id TEXT,
      message_id TEXT,
      file_id TEXT,
      target_user_id TEXT,
      reason TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT,
      resolved_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status);
    CREATE INDEX IF NOT EXISTS idx_moderation_reports_target ON moderation_reports(type, target);
    CREATE INDEX IF NOT EXISTS idx_moderation_reports_room ON moderation_reports(room_id);

    CREATE TABLE IF NOT EXISTS room_enforcements (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      target_user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      note TEXT,
      actor_user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS idx_room_enforcements_room_user
      ON room_enforcements(room_id, target_user_id, active);
    CREATE INDEX IF NOT EXISTS idx_room_enforcements_target_active
      ON room_enforcements(target_user_id, active, expires_at);

    CREATE TABLE IF NOT EXISTS room_read_state (
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      last_read_at TEXT NOT NULL,
      last_read_message_id TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (room_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_room_read_state_user ON room_read_state(user_id, updated_at);

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL DEFAULT 'dm',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_conv_parts_user ON conversation_participants(user_id, joined_at);

    CREATE TABLE IF NOT EXISTS room_access (
      room_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      granted_at TEXT NOT NULL,
      source TEXT,
      PRIMARY KEY (room_id, user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_room_access_user ON room_access(user_id, granted_at);
  `)

  const messageCols = await db.all(`PRAGMA table_info(messages)`)
  if (!messageCols.some((col) => col.name === 'conversation_id')) {
    await db.exec(`ALTER TABLE messages ADD COLUMN conversation_id TEXT`)
  }

  const moderationCols = await db.all(`PRAGMA table_info(moderation_reports)`)
  const moderationNames = new Set(moderationCols.map((c) => c.name))
  if (moderationNames.size > 0) {
    if (!moderationNames.has('reporter_user_id')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN reporter_user_id TEXT`)
    }
    if (!moderationNames.has('message_id')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN message_id TEXT`)
    }
    if (!moderationNames.has('file_id')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN file_id TEXT`)
    }
    if (!moderationNames.has('target_user_id')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN target_user_id TEXT`)
    }
    if (!moderationNames.has('note')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN note TEXT`)
    }
    if (!moderationNames.has('updated_at')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN updated_at TEXT`)
    }
    if (!moderationNames.has('resolved_at')) {
      await db.exec(`ALTER TABLE moderation_reports ADD COLUMN resolved_at TEXT`)
    }
  }

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
  if (!userCols.some((col) => col.name === 'username')) {
    await db.exec(`ALTER TABLE users ADD COLUMN username TEXT`)
  }
  if (!userCols.some((col) => col.name === 'avatar_url')) {
    await db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT`)
  }
  if (!userCols.some((col) => col.name === 'interest')) {
    await db.exec(`ALTER TABLE users ADD COLUMN interest TEXT`)
  }
  if (!userCols.some((col) => col.name === 'personal_room_id')) {
    await db.exec(`ALTER TABLE users ADD COLUMN personal_room_id TEXT`)
  }
  await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username) WHERE username IS NOT NULL`)

  await db.exec(`
    INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source)
    SELECT r.id, r.created_by_user_id, COALESCE(r.created_at, datetime('now')), 'owner'
    FROM rooms r
    WHERE r.created_by_user_id IS NOT NULL
  `)

  await db.exec(`
    UPDATE users
    SET personal_room_id = 'room_private_' || substr(replace(id, 'user_', ''), -20)
    WHERE role = 'user' AND profile_completed = 1 AND personal_room_id IS NULL
  `)
  await db.exec(`
    INSERT OR IGNORE INTO rooms (id, name, created_at, archived, created_by_user_id)
    SELECT u.personal_room_id, COALESCE(NULLIF(TRIM(u.display_name), ''), 'My') || ' space',
           COALESCE(u.created_at, datetime('now')), 0, u.id
    FROM users u
    WHERE u.role = 'user' AND u.profile_completed = 1 AND u.personal_room_id IS NOT NULL
  `)
  await db.exec(`
    INSERT OR IGNORE INTO room_access (room_id, user_id, granted_at, source)
    SELECT u.personal_room_id, u.id, COALESCE(u.created_at, datetime('now')), 'personal'
    FROM users u
    WHERE u.role = 'user' AND u.profile_completed = 1 AND u.personal_room_id IS NOT NULL
  `)

  // Deprecated default room: Design is the team default; remove General and related rows.
  try {
    await db.run(`DELETE FROM whiteboard_strokes WHERE room_id = 'room_general'`)
    await db.run(`DELETE FROM upload_files WHERE room_id = 'room_general'`)
    await db.run(`DELETE FROM rooms WHERE id = 'room_general'`)
  } catch {
    /* ignore if tables empty or migration already applied */
  }

  await seedDemoModerationReportsIfEmpty(db)
}

async function seedDemoModerationReportsIfEmpty(database) {
  if (process.env.NODE_ENV === 'production' || process.env.CONNECTLY_NO_DEMO_DATA === '1') return
  const row = await database.get(`SELECT COUNT(*) as n FROM moderation_reports`)
  if (Number(row?.n) > 0) return

  const now = Date.now()
  const iso = (msAgo) => new Date(now - msAgo).toISOString()
  const rows = [
    {
      id: 'rep_seed_demo_1',
      type: 'message',
      target: 'msg_seed_demo_1',
      roomId: null,
      reason: 'Spam — repeated off-topic links in a public channel.',
      status: 'pending',
      createdAt: iso(2 * 60 * 60 * 1000),
    },
    {
      id: 'rep_seed_demo_2',
      type: 'user',
      target: 'usr_seed_demo_1',
      roomId: null,
      reason: 'Harassment — two members submitted similar reports.',
      status: 'reviewing',
      createdAt: iso(5 * 60 * 60 * 1000),
    },
    {
      id: 'rep_seed_demo_3',
      type: 'file',
      target: 'upload_seed_demo_1',
      roomId: null,
      reason: 'Upload may violate workspace acceptable-use policy.',
      status: 'pending',
      createdAt: iso(26 * 60 * 60 * 1000),
    },
  ]

  for (const r of rows) {
    await database.run(
      `INSERT INTO moderation_reports
       (id, type, target, room_id, reporter_user_id, message_id, file_id, target_user_id, reason, note, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, '', ?, ?, ?)`,
      r.id,
      r.type,
      r.target,
      r.roomId,
      r.type === 'message' ? r.target : null,
      r.type === 'file' ? r.target : null,
      r.type === 'user' ? r.target : null,
      r.reason,
      r.status,
      r.createdAt,
      r.createdAt,
    )
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.')
  }
  return db
}

/** Close the SQLite handle (for tests or graceful shutdown). */
export async function closeDatabase() {
  if (!db) return
  await db.close()
  db = undefined
}
