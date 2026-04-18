# 📋 Connectly — Changelog

> Running development log for CSCI 2020U — Group 53
> Update this file at the end of each day with what was built, fixed, or changed.
> This makes the final contribution report trivial to fill in.

---

## How to Add an Entry

Add new entries at the **top** of the file under today's date. Keep it short — one line per item. Use the tags below to classify changes.

**Tags:**
- `[feat]` — new feature or functionality
- `[fix]` — bug fix
- `[refactor]` — code restructure, no behavior change
- `[style]` — UI/CSS change
- `[docs]` — documentation update
- `[chore]` — setup, config, dependency, tooling

**Format:**
```
## Day X — YYYY-MM-DD
- [tag] Description of change (Owner)
```

---

## 2026-04-17

- [feat] Workspace lobby **`room_design`**: all active users receive **`room_access`** on server boot and on login / profile complete; **`ensureWorkspaceLobbyForAllUsers()`** keeps the room row present (`server/controllers/roomController.js`, `server/bootstrapServer.js`).
- [feat] **`AppLayout`** joins **`room_design`** and the user’s **personal room** over Socket.io so dashboard and overview counts see signed-in clients without opening chat first (`src/layouts/AppLayout.jsx`).
- [fix] Socket **disconnect** removes **`room_members`** for **every** room the client had joined (multi-room tracking); **`leave-room`** updates per-room set correctly (`server/controllers/roomController.js`, `server/sockets/registerSocketHandlers.js`).
- [fix] **Chat / whiteboard** unmount skips **`leave-room`** for shell presence rooms (**`room_design`** + personal) so overview presence is not dropped when navigating away (`src/pages/ChatPage.jsx`, `src/pages/WhiteboardPage.jsx`).
- [feat] **Dashboard** refetches workspace stats on interval, window focus, and socket reconnect; API includes **`onlineInWorkspace`** and per-room **`onlineInRoom`** (`src/pages/DashboardPage.jsx`, `GET /api/workspace/dashboard`).
- [fix] **Logout** calls **`disconnectSocket()`** so sessions end cleanly (`src/contexts/AuthContext.jsx`).
- [docs] README, **API**, **FLOWS**, **UX_DECISIONS**, **GLOSSARY**, **SOCKET_EVENTS**, **DEMO_PREP** aligned with presence and lobby behaviour.

---

## Day 1 — YYYY-MM-DD

- [chore] Initialized GitHub repo with `main` and `dev` branches (Dhruv)
- [chore] Set up Node.js + Express server scaffold (Dhruv)
- [chore] Initialized React + Vite + Tailwind CSS client (Aaryan)
- [docs] Created initial README.md draft (Ayush)
- [chore] Created Discord server and confirmed meeting cadence (All)

---

## Day 2 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 3 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 4 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 5 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 6 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 7 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 8 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 9 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 10 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 11 — YYYY-MM-DD

*(Fill in at end of day)*

---

## Day 12 — YYYY-MM-DD

*(Fill in at end of day)*

---

> **Tip:** Keep entries short. One sentence per item is enough.
> The goal is a paper trail — not a novel.
