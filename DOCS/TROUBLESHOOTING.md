# Troubleshooting

Quick **symptom → likely cause → fix**. When in doubt, confirm the API is up with **`GET /health`** (public, no auth).

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| Server log: **EADDRINUSE** (or port keeps incrementing) | Another process is bound to **`PORT`** (default `3001`). | Stop the other process, or set a free **`PORT`** in `server/.env`. If the server **auto-picks** the next free port, set **`VITE_SERVER_PORT`** or **`VITE_SERVER_URL`** in the **project root** `.env` to that port and restart Vite (see server startup warning). |
| **Blank chat** / no history / REST errors to wrong host | Client is calling the wrong API origin (common after port change or opening the SPA from another machine). | Set **`VITE_SERVER_URL`** to the full API base (no trailing slash), e.g. `http://localhost:3001` or `http://192.168.1.10:3002`. Optionally use **`VITE_SERVER_PORT`** when inferring from the page hostname. Restart the Vite dev server or rebuild after env changes. See `src/config/serverUrl.js`. |
| **SQLite: database is locked** | Two server processes on the same **`DB_PATH`**, or a tool holding the file open while the server writes. | Run only one Node process per database file; close DB browsers/backup tools; retry. For production scale, plan beyond single-writer SQLite (see **LIMITATIONS.md**). |
| **`403`** on **`/api/admin/*`** | Missing/invalid JWT, or user role is **`user`** (needs **`admin`** or **`moderator`** for most routes; some routes need **`admin`** only). | Sign in as an elevated account; send `Authorization: Bearer <token>` (the app stores **`connectly_jwt`**). Promote a user in the DB or use seed admin per README. |
| **`403`** on login or API (non-admin) | **`CLIENT_URL`** / CORS mismatch in production (**`strictCors`**). | Set **`CLIENT_URL`** to the exact browser origin (scheme + host + port). Add **`CORS_ORIGINS`** for extra origins if needed. |
| **WebSocket stuck on `polling`** (never **`websocket`**) | Often normal at first; if it never upgrades: reverse proxy not passing **WebSocket** upgrades, or **mixed content** (HTTPS page → HTTP API). | Put API and SPA behind HTTPS with **`Upgrade`** / **`Connection`** headers; or use **`VITE_SERVER_URL`** to a same-scheme API URL. Client uses `transports: ['polling', 'websocket']` in `src/services/socket.js`. |
| Socket **`connect_error`** / degraded status | API down, wrong **`VITE_SERVER_URL`**, firewall, or auth rejected. | Open **`GET /health`** on the API host. Align **`VITE_SERVER_URL`** with the listening port. Check server logs for JWT/CORS errors. |
| **Dashboard “Online users”** stays **0** or stale | Other users only in rooms you cannot access, or API not restarted after lobby migration; client only refetches on a timer / focus / reconnect. | Restart the **server** once so **`room_design`** **`room_access`** is granted to active users; sign in again. Ensure each client can open Socket (completed profile). Wait ~20s or refocus the tab for a dashboard refresh. |
| Admin UI “System” shows DB issues | SQLite missing, unreadable path, or disk full. | Verify **`DB_PATH`** (default `./data/connectly.sqlite` under `server/` cwd). Fix permissions; check **`GET /api/admin/system`** (requires elevated JWT) for **`database.ok`** / size hints. |

## Health and system probes

- **`GET /health`** — Public. Returns `ok`, `service`, **`port`** (actual listen port), and basic Socket.io client count / allowed transports. Example: `http://localhost:3001/health` (adjust host/port).
- **`GET /api/admin/system`** — Requires a valid JWT with **`admin`** or **`moderator`** role. Richer snapshot (process, database file, etc.) for **System Status** in the app (`/app/admin/system`).

## See also

- **[SETUP.md](./SETUP.md)** — Env layout and LAN notes.
- **[MIGRATIONS.md](./MIGRATIONS.md)** — Resetting SQLite in dev.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Production checklist.
