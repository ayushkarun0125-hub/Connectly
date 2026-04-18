# 🔌 Connectly — Socket Event Reference

> Complete Socket.io event contract for CSCI 2020U — Group 53
> This is the source of truth for all client ↔ server communication.
> If you add, rename, or remove an event — update this file in the same commit.

---

## 📖 How to Read This Document

- **C → S** = Client emits, Server listens
- **S → C** = Server emits, Client listens
- **C ↔ S** = Both directions (same event name, same payload)
- `roomId` is always a string identifier for the target room
- `userId` is the socket ID assigned by Socket.io on connection (`socket.id`)
- All timestamps are ISO 8601 strings: `"2024-04-25T10:00:00.000Z"`

---

## 🔗 Connection Events

### `connect`
**Direction:** S → C (automatic on Socket.io handshake)

Fired automatically when the client successfully connects to the server. No payload.

```javascript
// Client
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});
```

---

### `disconnect`
**Direction:** C → S (automatic on tab close / network drop)

Fired automatically when a client disconnects. The server removes **`room_members`** rows for **every** room that socket had joined, emits **`user-left`** per room, and refreshes **`room-users`** where applicable (see **`getUserRooms`** / **`leaveRoom`** in **`server/controllers/roomController.js`**).

```javascript
// Server (conceptual)
socket.on("disconnect", async () => {
  for (const roomId of getUserRooms(socket.id)) {
    await leaveRoom({ socketId: socket.id, roomId })
    // emit user-left + room-users to roomId
  }
})
```

---

## 🏠 Room Events

### `join-room`
**Direction:** C → S

Client requests to join a room. Server adds the socket to the Socket.io room, loads history, and broadcasts presence.

**Payload:**
```json
{
  "roomId": "room_design",
  "username": "Dhruv"
}
```

**Notes:** Requires a valid JWT in the handshake (`auth.token`) so the server attaches **`socket.accountUserId`**; otherwise authenticated joins are denied. The client **`AppLayout`** emits **`join-room`** for **`room_design`** and the user’s personal room on connect so REST-backed workspace stats stay aligned with live presence.

**Server response — emits back to this client only:**
- `room-history` with past messages
- `room-users` with current online users

**Server broadcast — emits to all others in the room:**
- `user-joined`

---

### `leave-room`
**Direction:** C → S

Client explicitly leaves a room (navigates away).

**Payload:**
```json
{
  "roomId": "room_general"
}
```

**Server broadcast — emits to all others in the room:**
- `user-left`

---

### `room-history`
**Direction:** S → C

Sent to a joining client only. Contains past messages for the room loaded from `data/messages/{roomId}.json`.

**Payload:**
```json
[
  {
    "id": "msg_1714000000000",
    "userId": "abc123",
    "username": "Dhruv",
    "content": "Hello room!",
    "timestamp": "2024-04-25T10:00:00.000Z",
    "type": "text"
  }
]
```

---

### `room-users`
**Direction:** S → C

Sent to a joining client only. Contains the list of currently online users in the room.

**Payload:**
```json
[
  { "userId": "abc123", "username": "Dhruv", "role": "admin" },
  { "userId": "xyz789", "username": "Aaryan", "role": "member" }
]
```

---

## 💬 Chat Events

### `send-message`
**Direction:** C → S

Client sends a new chat message.

**Payload:**
```json
{
  "roomId": "room_general",
  "content": "Hello everyone!",
  "type": "text"
}
```

**`type` values:** `"text"` | `"file"` | `"image"`

**Server response:**
- Validates and timestamps the message
- Appends to `data/messages/{roomId}.json`
- Broadcasts `new-message` to **all clients in the room** (including sender)

---

### `new-message`
**Direction:** S → C

Broadcast to all clients in a room when a new message is sent.

**Payload:**
```json
{
  "id": "msg_1714000000000",
  "userId": "abc123",
  "username": "Dhruv",
  "content": "Hello everyone!",
  "timestamp": "2024-04-25T10:00:00.000Z",
  "type": "text"
}
```

---

## ✍️ Typing Indicator Events

### `typing-start`
**Direction:** C → S

Emitted when the user starts typing. Should be debounced on the client — emit once when typing begins, not on every keystroke.

**Payload:**
```json
{
  "roomId": "room_general"
}
```

**Server broadcast — emits to all others in the room (NOT the sender):**
- `user-typing`

---

### `typing-stop`
**Direction:** C → S

Emitted when the user stops typing (debounced ~1.5s after last keystroke).

**Payload:**
```json
{
  "roomId": "room_general"
}
```

**Server broadcast — emits to all others in the room:**
- `user-stopped-typing`

---

### `user-typing`
**Direction:** S → C

Broadcast to all clients in the room except the sender.

**Payload:**
```json
{
  "userId": "abc123",
  "username": "Dhruv"
}
```

---

### `user-stopped-typing`
**Direction:** S → C

Broadcast to all clients in the room except the sender.

**Payload:**
```json
{
  "userId": "abc123",
  "username": "Dhruv"
}
```

---

## 👤 Presence Events

### `user-joined`
**Direction:** S → C

Broadcast to all clients already in the room when a new user joins.

**Payload:**
```json
{
  "userId": "abc123",
  "username": "Dhruv",
  "role": "member"
}
```

---

### `user-left`
**Direction:** S → C

Broadcast to all clients in the room when a user disconnects or leaves.

**Payload:**
```json
{
  "userId": "abc123",
  "username": "Dhruv"
}
```

---

## 🎨 Whiteboard Events

### `draw-event`
**Direction:** C ↔ S

The core whiteboard sync event. Client emits on every pointer move while drawing. Server rebroadcasts to all other clients in the room (NOT the sender — sender renders locally for zero latency).

**Payload:**
```json
{
  "roomId": "room_general",
  "x": 245.5,
  "y": 132.0,
  "prevX": 243.0,
  "prevY": 130.5,
  "color": "#4f9cf9",
  "size": 4,
  "type": "draw"
}
```

**`type` values:**

| Value | Description |
| :--- | :--- |
| `"draw"` | Active stroke segment |
| `"start"` | Pen/pointer down — begins a new stroke |
| `"end"` | Pen/pointer up — ends current stroke |
| `"clear"` | Clear the entire canvas |

---

### `whiteboard-state`
**Direction:** S → C

Sent to a joining client only. Contains the current canvas state so late joiners see existing drawings.

**Payload:**
```json
{
  "strokes": [
    {
      "x": 100, "y": 200, "prevX": 98, "prevY": 198,
      "color": "#ffffff", "size": 3, "type": "draw"
    }
  ]
}
```

> **Note:** The server must buffer draw events per room to build this state.

---

## 📁 File Sharing Events

### `upload-file`
**Direction:** C → S

Client uploads a file. The file data is sent as a base64-encoded string.

**Payload:**
```json
{
  "roomId": "room_general",
  "filename": "screenshot.png",
  "mimeType": "image/png",
  "data": "<base64 encoded string>"
}
```

**Server response:**
- Saves file to `data/uploads/{filename}`
- Broadcasts `file-shared` to all clients in the room

---

### `file-shared`
**Direction:** S → C

Broadcast to all clients in the room when a file is successfully uploaded.

**Payload:**
```json
{
  "id": "msg_1714000002000",
  "userId": "abc123",
  "username": "Dhruv",
  "filename": "screenshot.png",
  "url": "/uploads/screenshot.png",
  "mimeType": "image/png",
  "timestamp": "2024-04-25T10:05:00.000Z",
  "type": "file"
}
```

---

## 🔐 Private Messaging Events

### `private-message`
**Direction:** C → S

Client sends a direct message to a specific user.

**Payload:**
```json
{
  "toUserId": "xyz789",
  "content": "Hey, can you review my code?"
}
```

**Server response — emits to the target user only:**
- `private-message-received`

---

### `private-message-received`
**Direction:** S → C

Delivered to the target user only via their socket ID.

**Payload:**
```json
{
  "fromUserId": "abc123",
  "fromUsername": "Dhruv",
  "content": "Hey, can you review my code?",
  "timestamp": "2024-04-25T10:10:00.000Z"
}
```

---

## 🛡️ Moderation Events

### `kick-user`
**Direction:** C → S

Emitted by a moderator or admin to remove a user from a room.

**Payload:**
```json
{
  "roomId": "room_general",
  "targetUserId": "xyz789"
}
```

**Server validation:** Checks that the emitting socket has `role >= moderator` in this room. If not, emits `permission-denied` back to the requester.

**On success — server:**
- Disconnects the target socket from the room
- Broadcasts `user-kicked` to all clients in the room

---

### `user-kicked`
**Direction:** S → C

Broadcast to all clients in the room when a user is kicked.

**Payload:**
```json
{
  "userId": "xyz789",
  "username": "Aaryan",
  "kickedBy": "Dhruv"
}
```

---

### `permission-denied`
**Direction:** S → C

Emitted back to the requester only when they attempt a privileged action without the required role.

**Payload:**
```json
{
  "action": "kick-user",
  "reason": "Insufficient role. Required: moderator. Current: member."
}
```

---

## ⚠️ Error Events

### `error`
**Direction:** S → C

Emitted when a server-side error occurs processing a client event.

**Payload:**
```json
{
  "event": "send-message",
  "message": "Room not found."
}
```

---

## 📋 Quick Reference Table

| Event | Direction | Scope | Description |
| :--- | :---: | :--- | :--- |
| `connect` | S → C | This client | Socket connection established |
| `disconnect` | C → S | Server | Client disconnected |
| `join-room` | C → S | Server | Join a room |
| `leave-room` | C → S | Server | Leave a room |
| `room-history` | S → C | This client | Past messages on join |
| `room-users` | S → C | This client | Online users on join |
| `send-message` | C → S | Server | Send a chat message |
| `new-message` | S → C | Room | New message broadcast |
| `typing-start` | C → S | Server | User started typing |
| `typing-stop` | C → S | Server | User stopped typing |
| `user-typing` | S → C | Room (excl. sender) | Typing indicator on |
| `user-stopped-typing` | S → C | Room (excl. sender) | Typing indicator off |
| `user-joined` | S → C | Room | User joined the room |
| `user-left` | S → C | Room | User left the room |
| `draw-event` | C ↔ S | Room (excl. sender) | Whiteboard stroke data |
| `whiteboard-state` | S → C | This client | Canvas state on join |
| `upload-file` | C → S | Server | File upload |
| `file-shared` | S → C | Room | File available broadcast |
| `private-message` | C → S | Server | Send a DM |
| `private-message-received` | S → C | Target user only | DM delivered |
| `kick-user` | C → S | Server | Moderator kick action |
| `user-kicked` | S → C | Room | User removed broadcast |
| `permission-denied` | S → C | This client | Insufficient role |
| `error` | S → C | This client | Server-side error |

---

> **See also:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) for system design context.
> If you change an event name or payload shape, update this file in the same commit.
