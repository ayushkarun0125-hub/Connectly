# Security notes

Operational and threat-model context for Connectly. This is **not** a formal penetration-test report.

---

## Authentication: JWT

- **Issuance:** On **signup** and **login**, the API returns a JWT signed with **`JWT_SECRET`** (`server/index.js`, `signToken`).
- **Lifetime:** **`expiresIn: '7d'`** — no refresh token and no server-side session store; when the token expires, the user must log in again.
- **Transport:** Send **`Authorization: Bearer <token>`** on REST. Socket.io passes the same token in **`handshake.auth.token`** (`server/index.js` / `src/services/socket.js`).
- **Client storage:** The SPA stores the token in **`localStorage`** (`connectly_jwt`). That is convenient for demos but **XSS-sanitized dependencies and CSP** matter: any script on the page can read `localStorage`. Prefer **HTTPS** in production and avoid embedding untrusted HTML.
- **Verification:** REST uses `getAuthUser` (verify JWT, load user from SQLite). Invalid/expired tokens behave like **no user** → **401** on protected `/api/*` routes.
- **Do not ship** the default **`JWT_SECRET=dev_jwt_secret_change_me`** (or any short guessable secret) on a public host.

---

## Passwords: bcrypt

- **Signup / workspace member create:** Passwords are hashed with **`bcrypt.hash(..., 10)`** before insert (`server/index.js`).
- **Login:** **`bcrypt.compare`** against `password_hash`.
- **Policy:** Minimum length **6** characters at signup/login/member-create; there is **no** breached-password list or complexity rules beyond that.

---

## Roles

Stored on **`users.role`** in SQLite:

| Role | Typical REST / UI |
| :--- | :--- |
| **`user`** | Normal app; subject to room access and profile gate |
| **`moderator`** | Staff dashboards, moderation queue, most **`/api/admin/*`** routes; some actions restricted vs admin |
| **`admin`** | Full staff access; only admins can assign **`admin`**, delete admin-only resources, **`PUT /api/admin/settings`**, some deletes |

**`account_status`:** **`active`**, **`suspended`**, or **`banned`** — non-active users are blocked at login (**403**) and can be limited elsewhere.

**Profile gate:** Incomplete profiles cannot use most APIs until **`PATCH /api/auth/profile`**; **`admin`** and **`moderator`** bypass (`canBypassProfileGate` in `server/index.js`).

---

## CORS and browser origin

- **`CLIENT_URL`** — Primary allowed origin for CORS in production-style mode (`strictCors` when **`NODE_ENV=production`** and **`LAN_DEV`** is not used for LAN relaxation).
- **`CORS_ORIGINS`** — Optional comma-separated extra origins.
- Misconfigured **`CLIENT_URL`** causes browser **CORS errors** (not always obvious as HTTP status on the wire).

See **`server/index.js`** (`corsOriginCallback`, `strictCors`).

---

## Uploads and body size

- **JSON body limit:** **`express.json({ limit: '8mb' })`** — base64 file posts must fit under this (decoded file is smaller than base64, but large images can still hit the cap).
- **Admin settings** include **`uploadLimitMB`** (default **8**) in **`server/routes/adminApi.js`** — that value is part of the **settings document** for operators; enforcement of every upload path is not a separate server-side byte check beyond Express JSON limits and practical `saveFile` behavior.
- **Filenames:** Upload handler prefixes stored names with a timestamp (`server/controllers/fileController.js`); admin file delete uses **`path.basename`** to reduce path traversal risk.

---

## Moderation and reporting

- **Create report:** Authenticated users **`POST /api/reports`** with `type` **`message`**, **`file`**, or **`user`**, a **`reason`**, and the appropriate target id field (`server/services/reportService.js`). Duplicate **open** reports (`pending` / `reviewing`) for the same reporter + target are rejected.
- **Staff workflow:** **`/api/admin/moderation`** lists the queue; resolve/status endpoints update **`moderation_reports`**. Socket event **`moderation-report-created`** notifies clients (`server/index.js`).
- **Enforcement:** Room-level kick/ban style data lives in **`room_enforcements`**; clearing/listing uses staff-only REST (`server/index.js`).

This is a **manual review** model — no automated content classification.

---

## What not to do in production

1. **Default admin / moderator seed** — With **`NODE_ENV=production`**, seeding runs only if **`SEED_ADMIN=1`**. Do **not** enable that on the public internet with default passwords from **`server/.env.example`** / README.
2. **Demo moderation rows** — Dev-only seed in **`server/utils/db.js`**; set **`CONNECTLY_NO_DEMO_DATA=1`** when you want a clean non-prod database without fabricated reports.
3. **Weak JWT secret or committed `.env`** — Treat secrets like production credentials.
4. **Trusting client-only checks** — All authorization for destructive actions must remain on the server (already the pattern for admin routes and room access).
5. **Exposing SQLite + uploads** — Back up and permission **`DB_PATH`** and **`server/data/uploads/`**; they contain message content and files.

---

## Related documentation

- **[API.md](./API.md)** — REST paths and auth matrix.
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** — Env checklist and TLS/proxy.
- **[LIMITATIONS.md](./LIMITATIONS.md)** — Email verification, scale, and maturity bounds.
