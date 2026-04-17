# Deployment checklist

Production-oriented steps for Connectly: **Express + Socket.io API** and **Vite-built static SPA**.

## 1. Runtime and environment

- **`NODE_ENV=production`** — Enables stricter CORS behavior unless you explicitly opt into LAN-style origins (see **`LAN_DEV`** in `server/index.js`; avoid on public hosts).
- **`JWT_SECRET`** — Set a long random secret; never use the dev default in production.
- **`CLIENT_URL`** — Exact origin of the SPA (e.g. `https://chat.example.com`) so cookies/CORS align with **`strictCors`**.
- **`CORS_ORIGINS`** — Optional comma-separated extra allowed browser origins if the SPA is served from more than one URL.
- **`PORT`** — API listen port (or rely on your process manager / platform port).

## 2. Database and files

- **`DB_PATH`** — Absolute or `server/`-relative path to **`connectly.sqlite`**. Use a persistent volume or disk the API can read/write.
- **Backups** — Copy **`connectly.sqlite`** and **`server/data/uploads/`** together; uploads reference paths/metadata in the DB.
- **`SEED_ADMIN`** — In production, default admin seeding **does not** run unless **`SEED_ADMIN=1`**. Prefer creating admins deliberately; never expose default passwords on the internet.
- **`CONNECTLY_NO_DEMO_DATA=1`** — Skips demo moderation seed rows on non-production builds that include that path; useful for clean demos or staging.

## 3. Reverse proxy and WebSocket

- Terminate **TLS** at the proxy (or Node) so the browser uses **HTTPS** for both SPA and API if the page is HTTPS (avoids mixed-content blocks).
- For Socket.io, allow **HTTP long-polling** and **WebSocket upgrade** on the same API path the client uses (`VITE_SERVER_URL`).
- Typical nginx-style needs: proxy **`Upgrade`** and **`Connection`** headers for WebSocket upgrade. If clients stay on **`polling`** only, upgrade headers are often misconfigured (see **TROUBLESHOOTING.md**).

## 4. Static frontend vs API host

- **Build:** From the repo root, `npm run build` (or project’s Vite build) produces **`dist/`** static assets.
- **`VITE_SERVER_URL`** — Set at **build time** to the public API origin (e.g. `https://api.example.com`) so bundled REST and Socket.io clients target the API. Without it, the client infers `http(s)://<page-host>:<VITE_SERVER_PORT>`, which is wrong when the API is on another host or path.
- **`VITE_SERVER_PORT`** — Only affects inferred URL when **`VITE_SERVER_URL`** is unset; less relevant when the API is on a separate subdomain.

## 5. Smoke tests after deploy

- **`GET https://<api-host>/health`** — `ok: true` and expected **`port`** / socket summary.
- Sign in, open a room, confirm messages and presence (Socket.io).
- As staff: **`GET https://<api-host>/api/admin/system`** with a moderator/admin JWT (or use in-app **System Status**).

## See also

- **`server/.env.example`** — Variable names referenced by the server.
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — Port mismatch, CORS, WebSocket, SQLite locked.
- **[LIMITATIONS.md](./LIMITATIONS.md)** — Single-node Socket.io and SQLite expectations.
