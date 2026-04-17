# 🗄️ Connectly — Data Schema

> File-based persistence reference for CSCI 2020U — Group 53
> Documents all JSON structures written to disk by the server.

---

## Database evolution (SQLite)

Schema is applied on **every server start** inside **`initDatabase()`** in **`server/utils/db.js`**: `CREATE TABLE IF NOT EXISTS`, **`PRAGMA table_info` + `ALTER TABLE ... ADD COLUMN`** for older DB files, indexes, SQL backfills (for example `room_access`, personal rooms), optional **demo moderation** inserts when non-production and `CONNECTLY_NO_DEMO_DATA` is unset, and cleanup of deprecated rows (for example legacy `room_general`). Admin/moderator account seeding is separate (`server/utils/seedAdmin.js`).

**Reset dev safely:** stop the server → delete **`DB_PATH`** or default **`server/data/connectly.sqlite`** → start again. **`connectly.sqlite`** is not listed in the repo root **`.gitignore`** today; treat it as a local secret-bearing artifact and do not commit real data.

See **[MIGRATIONS.md](./MIGRATIONS.md)** for narrative and operational detail.

> **SQLite (live):** Users, rooms, messages, DMs, moderation, pins, enforcements, and read state live in **`server/utils/db.js`** / **`connectly.sqlite`**.

## Design Philosophy (legacy JSON reference)

This document still describes **legacy JSON/file** shapes (`rooms.json`, `messages/*.json`). The running server persists chat primarily in SQLite; `fileIO` may still create empty JSON paths. The bullets below reflect the original file-first rationale:

- **Simple to reason about** — files are human-readable and inspectable
- **No external dependencies** — no database server to install or configure
- **Sufficient for course scope** — a real-time system with file I/O demonstrates the core concepts
- **Transparent state** — you can open any `.json` file and see exactly what the server has stored

All data is stored in the `server/data/` directory.

---

## 📁 Directory Structure

```
server/data/
├── rooms.json                ← Room metadata, user roles, active state
├── messages/
│   ├── room_general.json     ← Message history for "General" room
│   ├── room_abc123.json      ← Message history for a dynamic room
│   └── ...                   ← One file per room
└── uploads/
    ├── img_1714000000000.png ← Uploaded files, timestamped filenames
    └── ...
```

---

## 🏠 `rooms.json`

Stores metadata for all rooms that have been created, including current user roles.

**Location:** `server/data/rooms.json`

**Written:** On room creation, when a user joins for the first time, when roles change, when a user is kicked/banned.

**Read:** On server startup (loaded into memory), when a user joins a room.

### Schema

```json
{
  "<roomId>": {
    "id": "string",
    "name": "string",
    "createdAt": "ISO 8601 timestamp",
    "createdBy": "userId string",
    "users": {
      "<userId>": {
        "username": "string",
        "role": "admin | moderator | member",
        "joinedAt": "ISO 8601 timestamp"
      }
    },
    "banned": ["userId", "userId"]
  }
}
```

### Full Example

```json
{
  "room_general": {
    "id": "room_general",
    "name": "General",
    "createdAt": "2024-04-25T09:00:00.000Z",
    "createdBy": "socket_abc123",
    "users": {
      "socket_abc123": {
        "username": "Dhruv",
        "role": "admin",
        "joinedAt": "2024-04-25T09:00:00.000Z"
      },
      "socket_xyz789": {
        "username": "Aaryan",
        "role": "member",
        "joinedAt": "2024-04-25T09:05:00.000Z"
      }
    },
    "banned": []
  },
  "room_dev": {
    "id": "room_dev",
    "name": "Dev Talk",
    "createdAt": "2024-04-25T09:30:00.000Z",
    "createdBy": "socket_xyz789",
    "users": {
      "socket_xyz789": {
        "username": "Aaryan",
        "role": "admin",
        "joinedAt": "2024-04-25T09:30:00.000Z"
      }
    },
    "banned": ["socket_bad_actor"]
  }
}
```

### Field Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique room identifier. Format: `room_<name>` or `room_<uuid>` |
| `name` | `string` | Human-readable display name |
| `createdAt` | `string` | ISO 8601 timestamp of room creation |
| `createdBy` | `string` | Socket ID of the user who created the room |
| `users` | `object` | Map of `userId → UserRecord` for all users who have ever joined |
| `users[id].username` | `string` | Display name of the user |
| `users[id].role` | `string` | `"admin"`, `"moderator"`, or `"member"` |
| `users[id].joinedAt` | `string` | ISO 8601 timestamp of first join |
| `banned` | `string[]` | Array of socket IDs that are banned from this room |

### Role Permissions

| Action | `member` | `moderator` | `admin` |
| :--- | :---: | :---: | :---: |
| Send messages | ✅ | ✅ | ✅ |
| Draw on whiteboard | ✅ | ✅ | ✅ |
| Share files | ✅ | ✅ | ✅ |
| Kick users | ❌ | ✅ | ✅ |
| Ban users | ❌ | ✅ | ✅ |
| Delete any message | ❌ | ✅ | ✅ |
| Promote/demote roles | ❌ | ❌ | ✅ |

---

## 💬 `messages/{roomId}.json`

Stores the full message history for a single room.

**Location:** `server/data/messages/{roomId}.json`

**Written:** Appended on every `send-message` event.

**Read:** When a user joins a room (`room-history` event).

### Schema

```json
[
  {
    "id": "string",
    "userId": "string",
    "username": "string",
    "content": "string",
    "timestamp": "ISO 8601 timestamp",
    "type": "text | file | image | system"
  }
]
```

### Full Example

```json
[
  {
    "id": "msg_1714000000000",
    "userId": "socket_abc123",
    "username": "Dhruv",
    "content": "Hey everyone, welcome to General!",
    "timestamp": "2024-04-25T10:00:00.000Z",
    "type": "text"
  },
  {
    "id": "msg_1714000001000",
    "userId": "socket_xyz789",
    "username": "Aaryan",
    "content": "/uploads/img_1714000001000.png",
    "timestamp": "2024-04-25T10:00:01.000Z",
    "type": "image"
  },
  {
    "id": "msg_1714000002000",
    "userId": "system",
    "username": "system",
    "content": "Ayush joined the room.",
    "timestamp": "2024-04-25T10:00:02.000Z",
    "type": "system"
  }
]
```

### Field Reference

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique message ID. Format: `msg_<Date.now()>` |
| `userId` | `string` | Socket ID of the sender. `"system"` for system messages |
| `username` | `string` | Display name of the sender |
| `content` | `string` | Message text, or file path for `file`/`image` types |
| `timestamp` | `string` | ISO 8601 timestamp set by the server on receipt |
| `type` | `string` | `"text"`, `"file"`, `"image"`, or `"system"` |

### Message Types

| Type | `content` value | Rendered as |
| :--- | :--- | :--- |
| `text` | Plain text string | Chat bubble |
| `image` | `/uploads/<filename>` path | Inline image |
| `file` | `/uploads/<filename>` path | Downloadable file link |
| `system` | Human-readable event string | Muted system notice |

---

## 📤 `uploads/` Directory

Stores files uploaded by users via the `upload-file` socket event.

**Location:** `server/data/uploads/`

**Filename format:** `<originalName>_<timestamp>.<ext>`

Example: `screenshot_1714000000000.png`

> Files are served statically by Express at `/uploads/<filename>`.
> The path stored in `messages.json` maps directly to this static route.

---

## 🔄 Read/Write Lifecycle

```
Server starts
    │
    ▼
Load rooms.json into memory (roomStore object)
    │
    ▼
User joins room "room_general"
    │
    ├── Read data/messages/room_general.json
    │   └── Emit room-history to this client
    │
    └── Add user to roomStore["room_general"].users
        └── Write updated roomStore to rooms.json

User sends a message
    │
    ├── Append message to in-memory messages array
    └── Write full array to data/messages/room_general.json

Server restarts
    │
    └── Reload rooms.json → all room state recovered
        (message files read on demand when users join)
```

---

## ⚠️ Limitations

| Limitation | Impact | Future Fix |
| :--- | :--- | :--- |
| No atomic writes | Crash mid-write could corrupt JSON | Write to `.tmp` then rename |
| Full array rewrite on each message | Slow for large history | Append-only log format or database |
| `userId` is socket ID | Changes on reconnect — user appears as new | Persistent auth tokens (JWT) |
| No message deletion from disk | Deleted messages persist in JSON | Soft-delete flag + filter on read |
| Single-server only | File system not shared across processes | Replace with MongoDB or Redis |

---

> **See also:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the system design that uses this schema.
> [`SOCKET_EVENTS.md`](./SOCKET_EVENTS.md) for the events that trigger reads and writes.
