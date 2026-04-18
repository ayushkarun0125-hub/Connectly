<!-- Glass-style hero + animated assets render on github.com; paths are relative to repo root. -->

<p align="center">
  <img src="assets/github-readme/hero-glass.svg" width="92%" alt="Connectly — glassmorphism-style project banner with course and stack summary" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&duration=3800&pause=900&color=38BDF8&center=true&vCenter=true&width=680&lines=Real-time+multi-room+collaboration;Socket.io+%2B+React+%2B+Express+%2B+SQLite;Chat+%C2%B7+Whiteboard+%C2%B7+Admin+%2F+moderation;CSCI+2020U+%C2%B7+Group+53+%2F+Team+18" alt="Animated typing subtitle" />
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=soft&color=0:0f172a,40:1e1b4b,100:0c4a6e&height=36&section=header&fontSize=1&animation=twinkling&stroke=38bdf8" width="92%" alt="Animated gradient divider" />
</p>

<p align="center">
  <a href="."><img src="https://img.shields.io/badge/Course-CSCI%202020U-0ea5e9?style=for-the-badge" alt="Course badge" /></a>
  <a href="."><img src="https://img.shields.io/badge/Group-53%20%7C%20Team-18-6366f1?style=for-the-badge" alt="Group / team badge" /></a>
  <a href="."><img src="https://img.shields.io/badge/Real--time-Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io badge" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=20232a" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-data-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
</p>

<p align="center">
  <a href="https://github.com/search?q=w26-csci2020u-finalproject-w26-team-18&type=repositories"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="Find repository on GitHub" /></a>
</p>

<p align="center"><sub>After you publish the repo, replace the link above and optionally add live badges: <code>https://img.shields.io/github/stars/&lt;OWNER&gt;/&lt;REPO&gt;</code> (stars, contributors, last commit).</sub></p>

# Connectly — Real-Time Multi-Room Communication Platform

> A distributed real-time system supporting multiple concurrent clients with synchronized shared state, collaborative tooling, and persistent data.

---
## Project Charter

| Field | Details |
| :--- | :--- |
| **Course** | CSCI 2020U |
| **Group (charter)** | 53 |
| **Course repo (folder)** | Team 18 — `w26-csci2020u-finalproject-w26-team-18` |
| **Product Name** | Connectly |
| **Members** | Dhruv Thakar, Ayush K., Aaryan Kulkarni |

---

## Overview

Connectly is a **real-time, multi-room communication platform** for many concurrent clients with synchronized shared state.

Beyond basic chat, it includes **direct messages**, a **collaborative whiteboard**, **live presence**, **persistent messages and room data**, **file uploads**, **room pins**, and **JWT-based accounts**. **Staff dashboards** (`/app/admin`, `/app/moderator`) provide overview stats, system health probes, moderation queues, and user/room/file management for elevated roles. Traffic is **event-driven** over **Socket.io**, with **Express** for REST and **SQLite** for structured persistence (users, rooms, messages, whiteboard strokes, moderation reports, pins, and more). Uploads land on disk under the server data directory; optional JSON helpers may exist for legacy paths.

---

## Features

### Real-time multi-room chat

- Join or create rooms; messages broadcast over WebSockets to room members.
- History loaded from the server when joining a room.

### Live collaborative whiteboard

- Shared canvas; drawing events synchronized per room.
- Strokes persisted in SQLite for reload.

### Persistence

- **SQLite** — default file is `server/data/connectly.sqlite` when `DB_PATH=./data/connectly.sqlite` in `server/.env` (paths are relative to the `server/` working directory). Override with **`DB_PATH`** for custom locations.
- **Uploads** — stored under the server data tree and served via static routes (see `server` upload configuration).

### Presence and typing

- Active users per room, join/leave, typing indicators (via Socket.io).
- **Workspace overview** (`GET /api/workspace/dashboard`) reports **`onlineInWorkspace`** and per-room **online** counts from **`room_members`** scoped to rooms you can access. Everyone gets **`room_access`** to the shared **Design** lobby (`room_design`); while signed in, **`AppLayout`** joins that lobby (and your personal room) so phones on the dashboard still count as online without opening a chat tab first.

### Files and pins

- Upload images/files in chat; metadata and links shared in real time.
- Pin attachments per room (API + UI).

### Authentication and roles

- **Sign up / login** with **bcrypt** password hashing and **JWT** sessions.
- **App roles** (`admin` / `moderator` / `user`) stored on the user record; **Admin** and **moderator** portals are gated in the router (`/app/admin`, `/app/moderator`).
- **Room roles**: first member in a room may be treated as room admin for that space (see server room logic).
- **Dev admin seed** (non-production): on first server start, if no user exists with the configured email, the API creates an **admin** account. Defaults: **`admin@connectly.local`** / **`ConnectlyAdmin2026!`** (override with **`ADMIN_EMAIL`** and **`ADMIN_PASSWORD`** in `server/.env`). Set **`SEED_ADMIN=0`** to disable. In **production**, seeding runs only if **`SEED_ADMIN=1`** (avoid on public servers). If that email is already registered, the seed step does nothing; promote manually if needed:  
  `UPDATE users SET role = 'admin' WHERE email = 'you@example.com';`  
  Then sign in again so the JWT includes the new role.

### Landing and app shell

- Marketing-style **landing** with sections and navigation; authenticated **app** area with workspace dashboard, chat, DMs, whiteboard, files, team, notes, settings, and staff tools for elevated roles.

### Moderation and reporting

- Users can file **moderation reports** (messages, files, users); staff review them in the **moderation** views and via Socket-driven queue refresh.
- **Non-production** dev databases may auto-seed sample reports when the reports table is empty (unless **`CONNECTLY_NO_DEMO_DATA=1`**). See `server/utils/db.js` and course notes for demo behaviour.

---

## Showcase *(GIF layout)*

<p align="center">
  <strong>Drop screen recordings into <code>DOCS/readme-gifs/</code> and swap the <code>src</code> below, or keep the animated glass placeholders.</strong>
</p>

<table align="center">
  <tr>
    <td width="50%" align="center">
      <p><strong>Chat &amp; presence</strong></p>
      <img src="assets/github-readme/panel-chat.svg" width="95%" alt="Animated placeholder — replace with chat-demo.gif" />
      <p><sub>GIF: <code>DOCS/readme-gifs/chat-demo.gif</code></sub></p>
    </td>
    <td width="50%" align="center">
      <p><strong>Whiteboard sync</strong></p>
      <img src="assets/github-readme/panel-whiteboard.svg" width="95%" alt="Animated placeholder — replace with whiteboard-demo.gif" />
      <p><sub>GIF: <code>DOCS/readme-gifs/whiteboard-demo.gif</code></sub></p>
    </td>
  </tr>
</table>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:1e3a8a&height=100&section=footer&text=Thanks%20for%20visiting%20%E2%80%94%20Connectly&fontSize=24&fontColor=e2e8f0&animation=twinkling&fontAlignY=32" width="100%" alt="Animated footer wave" />
</p>

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Framer Motion, Zustand |
| **Backend** | Node.js, Express 5, Socket.io 4 |
| **Persistence** | SQLite (`sqlite` / `sqlite3`), local upload storage |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` |

---

## System Architecture

```
Browsers  ←—— Socket.io (WebSocket) ——→  Node server (Express + Socket.io)
       ←—— REST (JSON) ——→                    │
                                              ├── SQLite (rooms, messages, users, …)
                                              └── disk (uploads, optional JSON helpers)
```

- **REST** handles auth, room CRUD, uploads listing, health check, and related endpoints.
- **Socket.io** handles chat, presence, typing, whiteboard sync, and real-time room events.
- The **Vite dev server** proxies nothing by default: the client calls the API using `src/config/serverUrl.js` (see **Environment** and **LAN access** below).

---

## Project structure

```
repo root/
├── assets/github-readme/    # README hero + animated SVG panels (glass theme)
├── DOCS/readme-gifs/        # Optional demo GIFs (see DOCS/readme-gifs/README.md)
├── src/                     # React app (Vite)
│   ├── components/          # UI + Connectly-specific components
│   ├── pages/               # Routes (chat, whiteboard, landing, auth, …)
│   ├── services/            # Socket client, API helpers
│   ├── contexts/            # Auth provider
│   ├── routes/              # Router, protected routes, role gates
│   ├── config/              # API base URL resolution (LAN-aware)
│   └── …
├── server/
│   ├── index.js             # Entry: LAN hints, listen, EADDRINUSE handling
│   ├── bootstrapServer.js   # Express + Socket.io routes and middleware
│   ├── sockets/             # Socket.io handlers
│   ├── controllers/         # Room, file, whiteboard logic
│   ├── utils/               # DB init, file I/O
│   └── data/                # SQLite DB, uploads, optional JSON
├── public/
├── DOCS/                    # Architecture, testing, socket events, …
├── package.json             # Client scripts (root)
└── README.md
```

---

## Running locally

### Prerequisites

- **Node.js** (LTS recommended) and **npm**.

### 1. Clone and install

```bash
git clone <your-repo-url>
cd w26-csci2020u-finalproject-w26-team-18

npm install
cd server && npm install && cd ..
```

### 2. Environment (optional)

- Copy **`server/.env.example`** to **`server/.env`** and adjust `PORT`, `CLIENT_URL`, `JWT_SECRET`, `DB_PATH` as needed.
- For the client, copy **`.env.example`** to **`.env`** if you want to override API URL or port (see next section).

### 3. Start server and client

Use **two terminals** from the **repository root**:

```bash
# Terminal 1 — API + Socket.io (default port 3001; may auto-increment if busy)
cd server
npm run dev
```

```bash
# Terminal 2 — Vite (default http://localhost:5173, listens on all interfaces)
npm run dev
```

### 4. Open the app

- **This machine:** [http://localhost:5173](http://localhost:5173)
- **Health check:** [http://localhost:3001/health](http://localhost:3001/health) (replace port if the server printed a different one)

### Production build (client)

```bash
npm run build
npm run preview
```

Serve the `dist/` output behind your hosting of choice; set **`VITE_SERVER_URL`** at build time if the API lives on another origin.

---

## Environment variables

| Variable | Where | Purpose |
| :--- | :--- | :--- |
| `VITE_SERVER_URL` | Client `.env` | Full API origin (e.g. `https://api.example.com`). Overrides automatic hostname logic. |
| `VITE_SERVER_PORT` | Client `.env` | API port when inferring URL from the page hostname (default `3001`). |
| `PORT` | `server/.env` | HTTP/Socket.io port (default `3001`). |
| `CLIENT_URL` | `server/.env` | Primary browser origin for CORS (default `http://localhost:5173`). |
| `CORS_ORIGINS` | `server/.env` | Comma-separated extra allowed origins. |
| `JWT_SECRET` | `server/.env` | Secret for signing tokens (change in any shared deployment). |
| `DB_PATH` | `server/.env` | SQLite file path (default `./data/connectly.sqlite` under `server/`). |
| `LAN_DEV` | `server/.env` | Set to `1` with `NODE_ENV=production` only if you intentionally need relaxed LAN CORS (avoid on public servers). |
| `SEED_ADMIN` | `server/.env` | `0` disables default admin/moderator seed; `1` allows seeding in production (use with care). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `server/.env` | Default admin account when seeding runs. |
| `MODERATOR_EMAIL` / `MODERATOR_PASSWORD` | `server/.env` | Default moderator account when seeding runs. |
| `SEED_MODERATOR` | `server/.env` | Set to `0` to skip moderator seed only (when supported by server). |
| `CONNECTLY_NO_DEMO_DATA` | `server/.env` | `1` skips non-production demo moderation rows if your server build includes that seed path. |

See **`server/.env.example`** and **`.env.example`** at the repo root for templates.

---

## LAN access (multiple laptops on the same Wi‑Fi)

1. Run the **server** and **`npm run dev`** on **one** computer (the host).
2. On the host, note the **LAN IPv4** address (e.g. `192.168.1.42` from `ipconfig` / `ifconfig`).
3. Other devices open **`http://<LAN-IP>:5173`** (not `localhost` on their machine).
4. The client defaults to **`http://<same-hostname-as-page>:<VITE_SERVER_PORT>`** for REST and Socket.io, so remote laptops hit the host API without editing code.
5. Allow **inbound** rules on the host firewall for the Vite port (**5173**) and API port (**3001** or the port shown in the server console).
6. The server listens on **all interfaces** (`0.0.0.0`) and logs suggested LAN URLs on startup.

If the API picks a **different port** (busy port), set **`VITE_SERVER_PORT`** in the root `.env` or set **`VITE_SERVER_URL`** to the full API URL and restart Vite.

---

## Documentation

| Document | Contents |
| :--- | :--- |
| [**DOCS/SETUP.md**](DOCS/SETUP.md) | Extended setup, branches, troubleshooting hooks |
| [**DOCS/ARCHITECTURE.md**](DOCS/ARCHITECTURE.md) | System design, layers, communication model |
| [**DOCS/DATA_SCHEMA.md**](DOCS/DATA_SCHEMA.md) | Tables and fields (SQLite) |
| [**DOCS/SOCKET_EVENTS.md**](DOCS/SOCKET_EVENTS.md) | Socket.io event reference |
| [**DOCS/TESTING.md**](DOCS/TESTING.md) | Manual / automated testing notes |
| [**DOCS/DEMO_PREP.md**](DOCS/DEMO_PREP.md) | Demo checklist |
| [**DOCS/CONTRIBUTING.md**](DOCS/CONTRIBUTING.md) | Branching and PR conventions |
| [**DOCS/CHANGELOG.md**](DOCS/CHANGELOG.md) | Day-by-day dev log template |
| [**DOCS/Timeline.md**](DOCS/Timeline.md) | Milestone timeline |
| [**PROJECT_CHARTER.md**](PROJECT_CHARTER.md) | Charter & work contract (source copy) |
| [**File_Structure.md**](File_Structure.md) | Generated tree snapshot |

**Health & ops:** `GET /health` (public) and `GET /api/admin/system` (JWT + elevated role) expose liveness and basic process/db metrics for dashboards.

---

## Future improvements

- [ ] **WebRTC** — voice and video between users.
- [ ] **Hosted database** — Postgres or managed DB for multi-instance deployments.
- [ ] **Cloud object storage** — S3-compatible storage for uploads.
- [ ] **Container deployment** — Docker Compose for repeatable local/prod setups.
- [ ] **Deeper moderation** — richer audit trails, automated rules, and stricter production hardening beyond the current queue and staff tools.

---

## Team

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| **Dhruv Thakar** | Server & Persistence Lead | Server architecture, persistence, multi-client handling |
| **Ayush K.** | Networking & Documentation Lead | Socket.io networking, README and documentation |
| **Aaryan Kulkarni** | Frontend & UX Lead | React UI, collaborative whiteboard, UX and sound effects |

---

## Team work contract

| Item | Agreement |
| :--- | :--- |
| **Communication** | Discord |
| **Meeting schedule** | Every Tuesday after lecture |
| **Conflict resolution** | If a member does not contribute to assigned tasks, the team will contact the instructor immediately. All members are responsible for enabling others to execute their work (for example pushing required code and updates on time). |

---

## Work division and contribution report

> **Note:** The *Actual Contribution* column must be updated at final submission.

| Task / Module | Assigned Member | Actual Contribution (Final) |
| :--- | :--- | :--- |
| **Multi-threaded Server** | Dhruv Thakar | *[To be completed at submission]* |
| **Socket Networking** | Ayush K. | *[To be completed at submission]* |
| **GUI Implementation** | Aaryan Kulkarni | *[To be completed at submission]* |
| **Persistence (File I/O)** | Dhruv Thakar | *[To be completed at submission]* |
| **UX / Sound Effects** | Aaryan Kulkarni | *[To be completed at submission]* |
| **Documentation / README** | Ayush K. | *[To be completed at submission]* |

---

## Final contribution status

> Tag one at final submission. Graders will use the *Actual Contribution* column above to apply uneven grades if applicable.

- [ ] **(1) EVEN CONTRIBUTION** — All members met expectations from the original charter.
- [ ] **(2) UNEVEN CONTRIBUTION** — One or more members did not meet expectations.
