# 📅 Connectly — Project Timeline

> Development roadmap for CSCI 2020U — Group 53
> Total Duration: **12 Days**

---

## 🗓️ Overview

```
Day 1-2         Day 3-4         Day 5-6         Day 7-8         Day 9-10        Day 11-12
   │               │               │               │               │               │
   ▼               ▼               ▼               ▼               ▼               ▼
Setup &        Core Server     Real-Time       Frontend        Advanced        Polish &
Planning       + Sockets       Features         UI/UX          Features        Submission
```

---

## 📌 Days 1–2 — Project Setup & Planning

**Goal:** Establish the foundation. Everyone aligned and running locally before any features are built.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| Define project scope and finalize feature list | All | Confirmed charter |
| Set up GitHub repo with `main` + `dev` branches | Dhruv | Repo live, all members have access |
| Initialize Node.js + Express server | Dhruv | `npm run dev` running on server |
| Initialize React + Vite + Tailwind client | Aaryan | `npm run dev` running on client |
| Set up Discord + confirm meeting cadence | All | Communication channel active |
| Write initial README draft | Ayush | `README.md` committed to repo |

**Milestone:** Project skeleton running locally on all three machines.

---

## 📌 Days 3–4 — Core Server & Socket Infrastructure

**Goal:** Get the WebSocket backbone working. Rooms, connections, and basic message routing.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| Integrate Socket.io into Express server | Dhruv | Server accepts WebSocket connections |
| Implement room creation and joining logic | Dhruv | `join-room` and `leave-room` events working |
| Build basic message broadcasting | Ayush | Messages broadcast to all users in a room |
| Implement Socket.io client service layer | Ayush | `services/socket.js` on client side |
| Wire client ↔ server connection | Ayush | Client connects, sends, and receives events |
| Set up JSON file persistence for messages | Dhruv | Messages written to `data/messages/{roomId}.json` |

**Milestone:** Two browser tabs join the same room and exchange messages in real-time.

---

## 📌 Days 5–6 — Real-Time Features

**Goal:** Build the features that make Connectly a distributed real-time *system*, not just a chat app.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| User presence tracking (join/leave events) | Dhruv | Active user list updates across all clients |
| Typing indicators | Ayush | `typing-start/stop` events broadcast + received |
| Online/offline status display | Aaryan | Status badges visible in user list |
| Load chat history on room join | Dhruv | Past messages load when entering a room |
| File upload + metadata broadcast | Dhruv + Aaryan | Files shareable within a room |
| Collaborative whiteboard — canvas setup | Aaryan | Canvas renders on the whiteboard page |
| Whiteboard draw event emission | Aaryan | Draw strokes emitted via Socket.io |
| Whiteboard draw event sync (server → clients) | Ayush | Remote strokes render on all connected canvases |

**Milestone:** Whiteboard strokes sync across two clients in real-time. Chat history loads on room join.

---

## 📌 Days 7–8 — Frontend UI/UX

**Goal:** Make Connectly look and feel like a real product.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| Chat room layout and message feed | Aaryan | Styled message thread with timestamps |
| Room list sidebar | Aaryan | Sidebar showing active rooms and user counts |
| User presence panel | Aaryan | Online users displayed per room |
| Typing indicator UI component | Aaryan | Animated `...` indicator in chat |
| File/image rendering in chat | Aaryan | Uploaded files render inline in the feed |
| Whiteboard toolbar (pen, color, clear) | Aaryan | Functional drawing controls |
| Sound effects integration (Howler.js) | Aaryan | Notification sounds on message receive |
| Responsive layout pass | Aaryan | UI works across different screen sizes |

**Milestone:** Full UI walkthrough — chat, whiteboard, and presence all visually complete and connected to live data.

---

## 📌 Days 9–10 — Advanced Features & Integration

**Goal:** Layer in optional enhancements and verify everything works end-to-end with multiple clients.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| Private messaging (DM) between users | Ayush | Direct socket room per user pair |
| Role system — admin and moderator | Dhruv | Roles stored server-side and enforced per event |
| Kick/ban moderation tools | Dhruv | Admins can remove users from rooms |
| Room metadata persistence | Dhruv | Room state (roles, users) saved to `rooms.json` |
| End-to-end integration testing (3+ clients) | All | Full feature walkthrough confirmed working |
| Bug fixes from integration pass | All | All critical issues resolved |
| Code cleanup and refactor | All | Dead code removed, file structure consistent |

**Milestone:** All core and optional features working together with 3 concurrent clients.

---

## 📌 Days 11–12 — Polish, Documentation & Submission

**Goal:** Ship it. Docs complete, demo ready, contribution report filled in.

| Task | Owner | Deliverable |
| :--- | :--- | :--- |
| Final README polish | Ayush | `README.md` finalized |
| Architecture documentation | Ayush | `ARCHITECTURE.md` committed |
| Timeline documentation | Ayush | `TIMELINE.md` committed |
| Fill in Actual Contribution column | All | Contribution table complete and honest |
| Tag final contribution status | All | Even/Uneven checkbox marked |
| Final demo run (3 clients, all features) | All | Demo recording or live walkthrough |
| Final submission push to GitHub | All | Tagged release on `main` |

**Milestone:** ✅ Project submitted.

---

## 📊 Timeline at a Glance

| Days | Focus | Key Milestone |
| :---: | :--- | :--- |
| 1–2 | Setup & Planning | Local dev running on all machines |
| 3–4 | Server & Socket Infrastructure | Real-time messaging between two clients |
| 5–6 | Real-Time Features | Whiteboard sync + chat history working |
| 7–8 | Frontend UI/UX | Full visual pass on all views |
| 9–10 | Advanced Features & Integration | All features verified with 3+ clients |
| 11–12 | Polish, Docs & Submission | Final submission tagged on GitHub |

---

## 👥 Responsibility Breakdown by Phase

| Days | Dhruv Thakar | Ayush K. | Aaryan Kulkarni |
| :---: | :--- | :--- | :--- |
| 1–2 | Server init, GitHub setup | README draft, socket scaffold | Client init, Tailwind setup |
| 3–4 | Room logic, JSON persistence | Socket.io client service, broadcasting | Client-server wiring |
| 5–6 | Presence, file I/O, history | Typing events, whiteboard sync | Canvas, draw events, status UI |
| 7–8 | Support + review | Support + review | Full UI build, Howler.js |
| 9–10 | Roles, kick/ban, room metadata | Private messaging, integration testing | Bug fixes, UI polish |
| 11–12 | Code cleanup | All documentation | Final demo, submission |

---

> **Meeting cadence:** Every Tuesday after lecture (Discord).
> Raise blockers on Discord same-day — with only 12 days, there's no buffer to wait.
