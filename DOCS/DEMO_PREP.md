# Connectly — Demo & grading prep

Official Clerk + React quickstart (auth): [Clerk React getting started](https://clerk.com/docs/react/getting-started/quickstart)

---

## 1. Weak points that could break a live demo

| Risk | Why it hurts |
|------|----------------|
| **Backend not running** | Chat, uploads, whiteboard sync, Files page, dashboard “Connected” all fail. |
| **`VITE_SERVER_URL` ≠ server port** | Socket.io and `/health` / `/api/uploads` hit the wrong host → silent failure or toasts. |
| **`CLIENT_URL` mismatch** | CORS blocks REST; Socket.io handshake can fail. |
| **Clerk env missing** | App errors or blank auth; cannot enter `/app`. |
| **Clerk allowed origins** | Production/demo URL must be in Clerk Dashboard → Domains. |
| **Two browsers, one kills port** | Stale `node` holding 3001 → server won’t start or picks another port. |
| **Large file upload** | Base64 in JSON can be slow; very large files may timeout (course demo: use small images). |
| **Admin expectations** | Kick/Ban are **disabled** + labeled prototype — saying they “work” loses credibility. |
| **Private messaging** | Not implemented — do not demo as live. |
| **Wi‑Fi blocks WebSockets** | Rare; app uses `transports: ['websocket']` only — no polling fallback. |

---

## 2. Fix priority (demo risk)

### Must fix (before demo)
1. One terminal: `server` running; note **exact URL/port** in the console.
2. Root `.env` / `.env.local`: `VITE_SERVER_URL` matches that URL **exactly**.
3. `server/.env`: `CLIENT_URL` = your Vite URL (e.g. `http://localhost:5173`).
4. Clerk publishable key set; allowed origins include your dev URL.

### Should fix (already applied in repo where noted)
- Chat history from SQLite, not mock overlap (**`room-history` always applied**; `fetchRoomData` returns empty messages).
- Dashboard shows **real backend health** + honest labels for mock sections.
- Files page lists **real uploads** via `GET /api/uploads`.
- Toasts on **socket `connect_error`** and **send when disconnected**.
- Admin: **banner + disabled** actions.

### Optional / future
- Server-side Clerk JWT verification for sockets.
- Dynamic room CRUD.
- Private messaging, real moderation APIs.
- WebSocket + polling fallback.

---

## 3. Code-level strategies (reference)

### Chat history from SQLite
- **Server:** unchanged — `join-room` → `getRoomHistory` → `room-history` emit.
- **Client:** `setMessages(Array.isArray(history) ? history : [])` on every `room-history` (no “keep mock if non-empty”).
- **Bootstrap:** `fetchRoomData` returns `messages: []` so the UI does not flash fake threads.

### Remove / isolate mock data
- Keep **mock rooms** only as **labels + dashboard shortcuts**; clarify in UI copy.
- **Dashboard notifications / avatar strip:** labeled “Sample” / “Demo” so they are not mistaken for live data.

### Reliable Socket.io across clients
- Same `roomId`, both clients **joined** (`join-room` after `connect`).
- Same server instance; avoid starting **two servers** on different ports by mistake.
- After changing `.env`, **restart Vite** (`npm run dev`).

### Prevent crashes / rough edges
- `connect_error` → toast (user-visible).
- `send-message` / `upload-file` guard: `socket.connected` + toast if false.
- `fetchUploadedFiles` / `fetchBackendHealth`: `try/catch` → empty array or `{ ok: false }`.
- File read errors in upload → toast.

**Small snippet — health-aware client:**

```javascript
// chatService.js
export async function fetchBackendHealth() {
  try {
    const r = await fetch(`${API_BASE}/health`)
    if (!r.ok) return { ok: false }
    return r.json() // { ok, port }
  } catch {
    return { ok: false }
  }
}
```

---

## 4. What to demo vs hide vs “future work”

### Fully demo (happy path)
1. **Clerk** sign-in / sign-up / `UserButton` / sign-out.
2. **Dashboard** — backend status green → **Open live chat**.
3. **Chat** — two browsers or incognito + normal: same room, **messages persist** after refresh (SQLite).
4. **Typing** + **presence** list updates.
5. **File upload** in chat → appears in thread → **Files** page lists it with download link.
6. **Whiteboard** — draw in one window, appears in the other.
7. **Notes** — type, **Save as PDF**.

### Show briefly / honest framing
- **Dashboard** sample rooms/notifications — “layout placeholder; real data is in chat.”
- **Admin** — “UI prototype; actions disabled until backend moderation ships.”

### Do not claim as done
- Private DMs, server-verified Clerk on sockets, kick/ban, dynamic room creation API.

---

## 5. Architecture (light touch)

- **REST:** `GET /health`, `GET /api/uploads` for demo visibility and files list.
- **Realtime:** Socket.io remains source of truth for chat, presence, typing, draws, uploads broadcast.
- **SQLite:** messages, members, whiteboard strokes — already aligned; chat UI now trusts `room-history`.

---

## 6. UI/UX polish for grading

- **Connected / Offline** pill on dashboard (implemented).
- **Toast** on connection failure (implemented).
- **Empty states** on Files and chat (already present; keep).
- **Loading** text on profile when `useUser` not ready.
- **Two-window demo:** pre-open second browser on login screen before you speak.

---

## 7. Pre-demo checklist (run in order)

- [ ] `cd server && npm install && npm run dev` — copy **printed URL** (note `port` if not 3001).
- [ ] `cd` repo root && `npm install && npm run dev`.
- [ ] `.env.local`: `VITE_CLERK_PUBLISHABLE_KEY` + `VITE_SERVER_URL` = server URL above.
- [ ] `server/.env`: `CLIENT_URL=http://localhost:5173` (or your Vite port).
- [ ] Browser: open `http://localhost:5173` → sign in.
- [ ] Dashboard: **Connected** green.
- [ ] Chat: send message → refresh → **history still there**.
- [ ] Second profile/incognito: same room → **see message in real time**.
- [ ] Upload small PNG → **Files** page shows it.
- [ ] Whiteboard: stroke syncs.
- [ ] Notes → PDF downloads.
- [ ] Admin: show banner, **do not click** disabled buttons as “live.”

---

## 8. 24 hours before demo — action plan

**Evening before (2–3 h)**  
1. Pull latest; run checklist once on your laptop.  
2. Fix any port/env mismatches; document your **exact** two commands in a sticky note.  
3. Clear SQLite or seed 1–2 harmless messages if you want a clean story (optional: backup `server/data/connectly.sqlite`).  
4. In Clerk, confirm **dev** instance URLs and test one fresh sign-up.  

**Morning of**  
5. Reboot terminal; kill stray `node` on 3001/5173 if needed.  
6. Run server → then client; verify dashboard **Connected**.  
7. Open **two** windows side-by-side for chat + whiteboard.  
8. Charge laptop; disable sleep during presentation.  

**15 minutes before**  
9. Close heavy apps; one rehearsal: login → chat → upload → files → whiteboard → notes PDF.  

---

## 9. Suggested demo script (5–8 minutes)

1. **Problem** — teams need chat + whiteboard + files in one place.  
2. **Auth** — Clerk, protected `/app`.  
3. **Dashboard** — “Our API is up” (green); open **live chat**.  
4. **Chat** — send message; **second browser** shows it; mention **SQLite persistence** (refresh).  
5. **Typing + presence** — type in one window.  
6. **File** — upload; open **Files** page; download.  
7. **Whiteboard** — collaborative stroke.  
8. **Notes** — export PDF.  
9. **Honest close** — admin UI and DMs are **future work**; core realtime + persistence are what you built.  

---

## 10. Environment reference

**Client (Vite)** — `.env.local` preferred:

```env
VITE_SERVER_URL=http://localhost:3001
VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

**Server** — `server/.env`:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
DB_PATH=./data/connectly.sqlite
```

If the server prints a different port, update **`VITE_SERVER_URL`** to match and restart Vite.
