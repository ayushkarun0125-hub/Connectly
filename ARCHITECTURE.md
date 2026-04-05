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
│   ┌─────────────────┐   ┌──────────────────┐                   │
│   │  messages.json  │   │   rooms.json     │                   │
│   │  (per room)     │   │  (metadata,      │                   │
│   │                 │   │   roles, users)  │                   │
│   └─────────────────┘   └──────────────────┘                   │
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
  │                               │  Written to messages.json
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
├── index.js                  # Express + Socket.io bootstrap
│
├── sockets/
│   ├── chatHandlers.js       # send-message, room-history events
│   ├── roomHandlers.js       # join-room, leave-room, presence
│   ├── whiteboardHandlers.js # draw-event sync
│   └── dmHandlers.js         # Private messaging events
│
├── controllers/
│   ├── roomController.js     # Room creation, user tracking logic
│   ├── messageController.js  # Message validation + persistence
│   └── fileController.js     # File upload handling
│
├── utils/
│   └── fileIO.js             # Read/write helpers for JSON storage
│
└── data/
    ├── messages/
    │   └── {roomId}.json     # One file per room
    └── rooms.json            # Room metadata + role assignments
```

---

## 💾 Persistence Design

Connectly uses the Node.js `fs` module for lightweight file-based persistence. No database is required.

### Message Storage

Each room has its own JSON file:

```
data/messages/{roomId}.json
```

```json
[
  {
    "id": "msg_1714000000000",
    "userId": "user_abc",
    "username": "Dhruv",
    "content": "Hello room!",
    "timestamp": "2024-04-25T10:00:00.000Z",
    "type": "text"
  },
  {
    "id": "msg_1714000001000",
    "userId": "user_xyz",
    "username": "Aaryan",
    "content": "uploads/image_123.png",
    "timestamp": "2024-04-25T10:00:01.000Z",
    "type": "file"
  }
]
```

### Room Metadata Storage

```
data/rooms.json
```

```json
{
  "room_general": {
    "id": "room_general",
    "name": "General",
    "createdAt": "2024-04-25T09:00:00.000Z",
    "users": {
      "user_abc": { "username": "Dhruv", "role": "admin" },
      "user_xyz": { "username": "Aaryan", "role": "member" }
    }
  }
}
```

### Read/Write Strategy

```
On server start   →  Load rooms.json into memory
On join-room      →  Read {roomId}.json, emit history to client
On send-message   →  Append to in-memory array, write array to {roomId}.json
On server restart →  Reload from JSON files (state fully recovered)
```

---

## 🔄 Feature-Level Data Flows

### 1. Multi-Room Chat

```
User types message
    │
    ▼
MessageInput.jsx  ──── socket.emit("send-message", { roomId, content }) ────▶  chatHandlers.js
                                                                                      │
                                                                          Validate + timestamp
                                                                                      │
                                                                          Append to messages array
                                                                                      │
                                                                          Write to {roomId}.json
                                                                                      │
                                                          io.to(roomId).emit("new-message", msg)
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
    ├── socket.emit("draw-event", strokeData) ────▶  whiteboardHandlers.js
    │                                                        │
    │                                        socket.to(roomId).emit("draw-event", strokeData)
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
roomHandlers.js
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

Roles are stored per-user per-room in `rooms.json`. The server validates role permissions before executing privileged socket events.

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
    │                              ├── fs.writeFile() → async, does not block loop
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
| JSON file storage doesn't scale | Replace with MongoDB or Firebase |
| Single Node.js process — no horizontal scaling | Add Redis adapter for Socket.io across multiple processes |
| No authentication — usernames are self-declared | Add JWT auth (login, session tokens) |
| Files stored locally on server | Move to AWS S3 or Firebase Storage |
| No TLS/WSS encryption | Add HTTPS + WSS in production deployment |
| Whiteboard state not persisted | Serialize canvas state to JSON on draw events |

---

> **See also:** [`TIMELINE.md`](./TIMELINE.md) for the week-by-week development plan.
> [`README.md`](./README.md) for setup and feature documentation.
