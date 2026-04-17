# 🏗️ Connectly — System Architecture

> Technical architecture reference for CSCI 2020U — Group 53

---

## 🧭 Architectural Style

Connectly is built as an **event-driven, stateful real-time system** using a client-server model over persistent WebSocket connections.

The core design principle is **shared mutable state via event propagation** — rather than polling, every state change (message, drawing stroke, presence update) is emitted as an event and broadcast to all relevant connected clients immediately.

---

## 🗺️ High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│   │   Browser A  │   │   Browser B  │   │   Browser C  │       │
│   │  React + Vite│   │  React + Vite│   │  React + Vite│       │
│   │  Tailwind CSS│   │  Tailwind CSS│   │  Tailwind CSS│       │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│          │                  │                  │                │
│     Socket.io          Socket.io          Socket.io             │
│     Client             Client             Client                │
└──────────┼──────────────────┼──────────────────┼───────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │  WebSocket (persistent, full-duplex)
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                   SERVER LAYER                                  │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │  Express + Node │                          │
│                    │   HTTP Server   │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │   Socket.io     │                          │
│                    │   Server Layer  │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
│          ┌──────────────────┼──────────────────┐               │
│          │                  │                  │               │
│   ┌──────▼──────┐   ┌───────▼──────┐  ┌───────▼──────┐        │
│   │    Room     │   │   Message    │  │  Whiteboard  │        │
│   │  Controller │   │  Controller  │  │  Controller  │        │
│   └──────┬──────┘   └───────┬──────┘  └───────┬──────┘        │
│          │                  │                  │               │
│          └──────────────────┼──────────────────┘               │
│                             │                                   │
│                    ┌────────▼────────┐                          │
│                    │   File I/O      │                          │
│                    │   (fs module)   │                          │
│                    └────────┬────────┘                          │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                  PERSISTENCE LAYER                              │
│                                                                 │
│   ┌───────────────────────────────┐   ┌───────────────────────────────┐                   │
│   │  SQLite — primary store     │   │  Filesystem + legacy JSON   │                   │
│   │  (connectly.sqlite)         │   │  uploads; fileIO seeds only │                   │
│   └───────────────────────────────┘   └───────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Communication Architecture

### WebSocket Event Model

All real-time communication runs over a single persistent WebSocket connection per client, managed by Socket.io.

```
Client                          Server
  │                               │
  │──── connect ─────────────────▶│  Socket registered
  │                               │
  │──── join-room ───────────────▶│  Client added to Socket.io room
  │◀─── room-history ─────────────│  Past messages sent to this client
  │◀─── user-joined ──────────────│  Broadcast to all in room
  │                               │
  │──── send-message ────────────▶│  Message received
  │◀─── new-message ──────────────│  Broadcast to all in room
  │                               │  createMessage + persistMessage → SQLite
  │                               │
  │──── typing-start ────────────▶│
  │◀─── user-typing ──────────────│  Broadcast to others in room
  │                               │
  │──── draw-event ──────────────▶│  Canvas stroke data received
  │◀─── draw-event ───────────────│  Broadcast to all others in room
  │                               │
  │──── disconnect ──────────────▶│  Client removed from room
  │◀─── user-left ────────────────│  Broadcast to all in room
```

### Socket.io Room Model

Socket.io's built-in room abstraction is used to isolate event broadcasting:

```
io.to(roomId).emit("new-message", data)    // All users in room
socket.to(roomId).emit("user-typing", ...)  // All users EXCEPT sender
socket.emit("room-history", messages)        // Only this client
io.to(userId).emit("private-message", ...)  // Specific user only
```

---

## 🧩 Component Architecture

### Client Side

```
client/
├── pages/
│   ├── ChatPage.jsx          # Main chat interface
│   └── WhiteboardPage.jsx    # Collaborative canvas
│
├── components/
│   ├── MessageFeed.jsx       # Scrollable message list
│   ├── MessageInput.jsx      # Text input + file upload
│   ├── RoomSidebar.jsx       # Room list + navigation
│   ├── UserPresencePanel.jsx # Online users + status badges
│   ├── TypingIndicator.jsx   # Animated "..." display
│   ├── WhiteboardCanvas.jsx  # HTML5 Canvas + toolbar
│   └── FileMessage.jsx       # Inline file/image renderer
│
└── services/
    └── socket.js             # Socket.io client instance + event helpers
```

**Data flow on the client:**

```
User Action
    │
    ▼
React Component  ──── socket.emit() ────▶  Server
    ▲
    │
socket.on()  ◀──── Server broadcast
    │
    ▼
State Update (useState / props)
    │
    ▼
Re-render
```

### Server Side

```
server/
├── index.js # Express + HTTP routes + Socket.io listen
├── sockets/
│   └── registerSocketHandlers.js # Chat, rooms, DMs, whiteboard, presence, …
├── controllers/                  # room, message, whiteboard, file, upload
├── routes/
│   └── adminApi.js               # Elevated REST: overview, users, moderation, …
├── services/                     # reports, DMs, enforcement, unread, …
├── utils/
│   ├── db.js                     # SQLite schema, migrations, init
│   ├── fileIO.js                 # Legacy JSON helpers + ensureDataFiles()
│   └── seedAdmin.js              # Optional dev admin/moderator seed
└── data/
    ├── connectly.sqlite          # Primary database (see DB_PATH)
    ├── uploads/                  # Uploaded binaries
    ├── admin-settings.json       # Written by admin API (if used)
    └── rooms.json, messages/     # Initialized by fileIO; not the live source of truth
```

---

## 💾 Persistence Design

**Primary store:** **SQLite** via `server/utils/db.js`. Default database file: `server/data/connectly.sqlite` when `DB_PATH=./data/connectly.sqlite`. Durable **users, rooms, messages, membership, DMs, whiteboard strokes, moderation, pins, read state**, etc. live in SQL tables — see **[DATA_SCHEMA.md](./DATA_SCHEMA.md)**.

### On-disk files besides SQLite

| Location | Purpose |
| :--- | :--- |
| `server/data/uploads/` | Uploaded binaries |
| `server/data/admin-settings.json` | Platform settings from admin API |
| `server/data/rooms.json`, `server/data/messages/*.json` | Created by `fileIO.ensureDataFiles()`; **not** the live read/write path for chat (SQLite is) |

### Read / write strategy (conceptual)

```
On server start     →  initDatabase(): migrations + schema
On join-room        →  SELECT messages → emit room-history
On send-message     →  INSERT into messages → broadcast new-message
On restart          →  Recover from SQLite + uploads
```

---

## 🔄 Feature-Level Data Flows

### 1. Multi-Room Chat

```
User types message
    │
    ▼
MessageInput.jsx  ──── socket.emit("send-message", { roomId, content }) ────▶  registerSocketHandlers.js
                                                                                      │
                                                                          createMessage + persistMessage
                                                                                      │
                                                                          INSERT into SQLite (messages)
                                                                                      │
                                                          io.to(roomId).emit("new-message", message)
                                                                                      │
                                                                    ┌─────────────────┘
                                                                    │
                                                              All clients in room
                                                              update MessageFeed
```

### 2. Collaborative Whiteboard

```
User draws on canvas
    │
    ▼
WhiteboardCanvas.jsx
    │  onMouseMove → collect {x, y, color, size, type}
    │
    ├── socket.emit("draw-event", strokeData) ────▶  registerSocketHandlers.js
    │                                                        │
    │                                        addStroke → SQLite; socket.to(roomId).emit("draw-event", stroke)
    │                                                        │
    │                                               All OTHER clients
    │                                               render stroke on their canvas
    │
    └── Render stroke locally immediately (no round-trip for own strokes)
```

### 3. User Presence

```
Client connects + joins room
    │
    ▼
registerSocketHandlers (room / presence)
    │  Add user to in-memory room map
    │  io.to(roomId).emit("user-joined", { userId, username })
    │
    ▼
All clients update UserPresencePanel

Client disconnects (tab close / network drop)
    │
    ▼
socket.on("disconnect")
    │  Remove user from room map
    │  io.to(roomId).emit("user-left", { userId })
    │
    ▼
All clients update UserPresencePanel
```

### 4. Typing Indicators

```
User starts typing
    │
    ▼
socket.emit("typing-start", { roomId })  ────▶  socket.to(roomId).emit("user-typing", { username })
                                                        │
                                                 Other clients show TypingIndicator

User stops typing (debounced 1.5s)
    │
    ▼
socket.emit("typing-stop", { roomId })   ────▶  socket.to(roomId).emit("user-stopped-typing", { username })
                                                        │
                                                 TypingIndicator hidden
```

---

## 🔐 Role & Permission System

```
Roles:  member  →  moderator  →  admin
           │            │           │
           │            │           └── kick, ban, promote/demote, delete any message
           │            └────────────── kick users, delete messages
           └─────────────────────────── send messages, draw, share files
```

Room membership and roles are persisted in **SQLite** (e.g. `room_members` and related tables — see **DATA_SCHEMA.md**). The server validates permissions before privileged actions (kick, enforcement, etc.).

```
Client emits "kick-user"
    │
    ▼
Server checks: does emitting socket's userId have role >= moderator in this room?
    │
    ├── YES → disconnect target socket, broadcast "user-kicked"
    └── NO  → emit "permission-denied" back to requester only
```

---

## 🗂️ Socket Event Reference

| Event | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `join-room` | C → S | `{ roomId, username }` | Join a room |
| `leave-room` | C → S | `{ roomId }` | Leave a room |
| `send-message` | C → S | `{ roomId, content, type }` | Send a chat message |
| `new-message` | S → C | `{ id, username, content, timestamp, type }` | Broadcast new message |
| `room-history` | S → C | `Message[]` | Past messages on join |
| `typing-start` | C → S | `{ roomId }` | User started typing |
| `typing-stop` | C → S | `{ roomId }` | User stopped typing |
| `user-typing` | S → C | `{ username }` | Broadcast typing status |
| `user-stopped-typing` | S → C | `{ username }` | Broadcast stopped typing |
| `draw-event` | C ↔ S | `{ x, y, color, size, type }` | Whiteboard stroke data |
| `user-joined` | S → C | `{ userId, username }` | User entered the room |
| `user-left` | S → C | `{ userId, username }` | User left the room |
| `upload-file` | C → S | `{ roomId, filename, data }` | File upload |
| `file-shared` | S → C | `{ filename, url, username }` | Broadcast file metadata |
| `private-message` | C → S | `{ toUserId, content }` | Send a DM |
| `kick-user` | C → S | `{ roomId, targetUserId }` | Moderator kick action |
| `user-kicked` | S → C | `{ username }` | Broadcast kick event |

---

## ⚡ Concurrency Model

Node.js is single-threaded, but handles high concurrency through its **non-blocking event loop**. Connectly takes advantage of this model:

```
Event Loop
    │
    ├── Socket event received  →  Handler runs (non-blocking)
    │                              │
    │                              ├── SQLite queries (async) → do not block the loop
    │                              └── io.to(room).emit() → synchronous, fast
    │
    ├── Next socket event handled immediately
    └── ... (thousands of concurrent clients supported)
```

There is no multi-threading — Node.js and Socket.io together handle concurrency through async I/O and the event loop, which is the correct model for a I/O-bound real-time application.

---

## 🔭 Architecture Limitations & Future Improvements

| Current Limitation | Future Solution |
| :--- | :--- |
| SQLite file DB — single-writer limits | Move to managed Postgres/MySQL or replicate read replicas for scale |
| Single Node.js process — no horizontal scaling | Add Redis adapter for Socket.io across multiple processes |
| JWT sessions — no built-in refresh / revocation UX | Short-lived access tokens, refresh flow, or server-side session store |
| Files stored locally on server | Move to object storage (e.g. S3) for multi-instance deploys |
| No TLS/WSS encryption | Add HTTPS + WSS in production deployment |
| Large canvas histories can grow the DB | Stroke pruning, snapshots, or TTL policies per room |

---

> **See also:** [`TIMELINE.md`](./TIMELINE.md) for the week-by-week development plan.
> [`README.md`](./README.md) for setup and feature documentation.
