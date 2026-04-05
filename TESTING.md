# 🧪 Connectly — Testing Guide

> Manual testing scenarios for CSCI 2020U — Group 53
> Run through these before every PR merge into `dev` and before final submission.

---

## 🛠️ Test Environment Setup

Before running any scenario, make sure:

1. Server is running on `http://localhost:3001`
2. Client is running on `http://localhost:5173`
3. `data/messages/` and `data/uploads/` directories exist on the server
4. You have **3 browser tabs or windows** open at `http://localhost:5173`
   - Use a normal tab, a private/incognito tab, and a second browser for truly isolated sessions

> Label your tabs mentally as **Client A**, **Client B**, and **Client C** throughout these tests.

---

## ✅ Test Scenarios

---

### 🏠 T01 — Room Creation & Joining

**Tests:** Room creation, join-room event, room list updates

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A enters username `"Dhruv"` and joins room `"General"` | Client A sees the General room chat view |
| 2 | Client B enters username `"Aaryan"` and joins room `"General"` | Client A sees `"Aaryan joined the room"` system message |
| 3 | Client B sees the room user list | Both `Dhruv` and `Aaryan` appear as online |
| 4 | Client C joins a different room `"Dev Talk"` | Client C does not appear in General's user list |

**Pass criteria:** All 4 steps behave as expected.

---

### 💬 T02 — Real-Time Messaging

**Tests:** send-message, new-message broadcast, message ordering

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A sends `"Hello from A"` in General | Message appears in Client A's feed instantly |
| 2 | (No action) | Client B sees `"Hello from A"` appear in their feed without refreshing |
| 3 | Client B sends `"Hello from B"` | Both Client A and Client B see the message |
| 4 | Both clients send messages simultaneously | Messages appear in both feeds in the same order |
| 5 | Check timestamp format on messages | Timestamps are visible and human-readable |

**Pass criteria:** Messages appear on all clients in the room in consistent order.

---

### 💾 T03 — Chat History Persistence

**Tests:** File I/O, room-history on join, state across restarts

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A sends 3 messages in General | Messages appear in the feed |
| 2 | Open `server/data/messages/room_general.json` | File exists and contains the 3 messages as valid JSON |
| 3 | Client C joins General (a new tab) | Client C sees all 3 past messages on load |
| 4 | Restart the server (`Ctrl+C`, `npm run dev`) | Server restarts without errors |
| 5 | Client C refreshes and rejoins General | All 3 messages are still visible — state survived restart |

**Pass criteria:** History loads for new joiners and persists across server restarts.

---

### ✍️ T04 — Typing Indicators

**Tests:** typing-start, typing-stop, debounce

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A starts typing in the message input | Client B sees `"Dhruv is typing..."` indicator appear |
| 2 | Client A stops typing and waits ~2 seconds | Client B's typing indicator disappears |
| 3 | Client A types again | Indicator reappears on Client B |
| 4 | Client A sends the message | Indicator disappears immediately on Client B |
| 5 | Client A checks their own view while typing | Client A does NOT see their own typing indicator |

**Pass criteria:** Indicator appears/disappears correctly; sender never sees their own indicator.

---

### 👤 T05 — User Presence

**Tests:** user-joined, user-left, online/offline status

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A is in General | User list shows `Dhruv` as online |
| 2 | Client B joins General | Client A's user list updates to show `Aaryan` online — no refresh needed |
| 3 | Client B closes their tab | Client A sees `Aaryan` removed from the user list within a few seconds |
| 4 | Client B rejoins | Client A sees `Aaryan` appear again |

**Pass criteria:** Presence list updates in real-time for all clients in the room.

---

### 🎨 T06 — Collaborative Whiteboard

**Tests:** draw-event sync, multi-client canvas state, clear

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A and Client B navigate to the whiteboard in General | Both see a blank canvas |
| 2 | Client A draws a line on the canvas | Client B sees the same line appear in real-time |
| 3 | Client B draws a circle | Client A sees the circle appear in real-time |
| 4 | Client C joins the whiteboard | Client C sees the existing drawings (whiteboard-state event) |
| 5 | Client A clicks "Clear" | All clients' canvases are cleared simultaneously |

**Pass criteria:** All strokes sync across clients; new joiners see current state; clear affects everyone.

---

### 📁 T07 — File Sharing

**Tests:** upload-file, file-shared broadcast, file rendering

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A uploads an image file in General | Upload completes without error |
| 2 | (No action) | Client B sees the image rendered inline in the chat feed |
| 3 | Client C joins General | Client C sees the image in the loaded history |
| 4 | Check `server/data/uploads/` | Image file exists on disk with a timestamped filename |
| 5 | Client A uploads a non-image file (e.g. `.pdf`) | File appears as a downloadable link, not an inline image |

**Pass criteria:** Files render correctly for all clients and are persisted to disk.

---

### 🔐 T08 — Private Messaging

**Tests:** private-message, private-message-received, isolation

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A sends a DM to Client B: `"Hey B"` | Client B receives the message in their DM view |
| 2 | (No action) | Client C does NOT see the message anywhere |
| 3 | Client B replies to Client A | Client A receives the reply |
| 4 | Client A sends a DM to Client C | Client B does NOT receive it |

**Pass criteria:** DMs are strictly delivered to the intended recipient only.

---

### 🛡️ T09 — Moderation (Roles & Kick)

**Tests:** role enforcement, kick-user, permission-denied

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A (admin) kicks Client B from General | Client B is disconnected from the room |
| 2 | (No action) | All remaining clients see `"Aaryan was removed from the room"` |
| 3 | Client B tries to rejoin General | Server checks banned list — rejoin denied |
| 4 | Client B (member) tries to kick Client C | Server returns `permission-denied` to Client B |
| 5 | Client B sees the error | Error message displayed: insufficient role |

**Pass criteria:** Only moderators/admins can kick; banned users cannot rejoin; members get denied cleanly.

---

### 🔇 T10 — Multi-Room Isolation

**Tests:** Room scoping, events don't bleed across rooms

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A is in General, Client B is in Dev Talk | They are in separate rooms |
| 2 | Client A sends a message in General | Client B does NOT see it in Dev Talk |
| 3 | Client B draws on the Dev Talk whiteboard | Client A does NOT see strokes on the General whiteboard |
| 4 | Client A's typing indicator fires in General | Client B does NOT see a typing indicator in Dev Talk |

**Pass criteria:** All events are strictly scoped to the room they originate in.

---

### 🔁 T11 — Reconnection Handling

**Tests:** Disconnect/reconnect, state recovery

| Step | Action | Expected Result |
| :---: | :--- | :--- |
| 1 | Client A is in General | Normal state |
| 2 | Client A's network is interrupted (disable WiFi briefly) | Client B sees `Dhruv` go offline |
| 3 | Client A reconnects | Client A rejoins the room; Client B sees `Dhruv` come back online |
| 4 | Client A sees chat history | History is still visible after reconnect |

**Pass criteria:** Reconnection is handled gracefully without duplicate users or lost state.

---

## 🧾 Test Run Checklist

Use this before submitting. Check off each scenario as it passes.

```
Pre-submission test run — Date: ____________  Tester: ____________

[ ] T01 — Room Creation & Joining
[ ] T02 — Real-Time Messaging
[ ] T03 — Chat History Persistence
[ ] T04 — Typing Indicators
[ ] T05 — User Presence
[ ] T06 — Collaborative Whiteboard
[ ] T07 — File Sharing
[ ] T08 — Private Messaging
[ ] T09 — Moderation (Roles & Kick)
[ ] T10 — Multi-Room Isolation
[ ] T11 — Reconnection Handling

Result: PASS / FAIL
Notes:
```

---

## 🐛 Reporting a Bug

If a test step fails, note it in Discord immediately with:

1. Which test (e.g. T06 — Step 3)
2. What you did
3. What you expected
4. What actually happened
5. Any console errors (browser DevTools → Console, or server terminal output)

---

> **See also:** [`SOCKET_EVENTS.md`](./SOCKET_EVENTS.md) for the event contract being tested.
> [`SETUP.md`](./SETUP.md) for troubleshooting environment issues before testing.
