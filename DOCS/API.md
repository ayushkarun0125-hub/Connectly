# REST API reference

Single index for HTTP endpoints. **Source of truth:** route handlers in **`server/index.js`** (main API) and **`server/routes/adminApi.js`** (admin/moderator). When code and this doc disagree, trust the server files.

Base URL is the API origin (for example `http://localhost:3001`). JSON bodies use **`Content-Type: application/json`** unless noted.

---

## Conventions

### Authentication

- **Public (no JWT):** `GET /`, `GET /health`, `POST /api/auth/signup`, `POST /api/auth/login`.
- **JWT:** All other **`/api/*`** routes expect **`Authorization: Bearer <token>`** (same JWT as Socket.io `auth.token`).
- **Profile gate:** Users with **`profileCompleted === false`** receive **`403`** with `{ "error": "Complete your profile setup first", "code": "PROFILE_INCOMPLETE" }` on every `/api/*` path except **`GET /api/auth/me`** and **`PATCH /api/auth/profile`**. **`admin`** and **`moderator`** bypass this gate.

### Common errors

| HTTP | Typical `error` / shape |
| :--- | :--- |
| **401** | `"Unauthorized"`, `"Sign in required"`, `"Invalid credentials"` |
| **403** | Room/workspace access, suspended/banned account, wrong role for admin routes, profile incomplete |
| **404** | Missing room, user, report, pin, file |
| **409** | Email/username conflict |
| **500** | Generic server failure; message varies |

---

## Public

| Method | Path | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | None | — | `{ ok, service, message, port }` |
| GET | `/health` | None | — | `{ ok, service, port, socket: { connectedClients, transports } }` |

---

## Auth (`server/index.js`)

| Method | Path | Auth | Request body | Response |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | None | `email`, `password`, optional `displayName` | **201** `{ token, user }` — user has `profileCompleted: false` until profile PATCH |
| POST | `/api/auth/login` | None | `email`, `password` | **200** `{ token, user }` |
| GET | `/api/auth/me` | JWT | — | **200** `{ user }` |
| PATCH | `/api/auth/profile` | JWT | `displayName`, `username` (≥3 chars, normalized), optional `bio`, `interest`, `avatarData` (base64), `avatarMimeType` | **200** `{ user }` with `profileCompleted: true` |

Signup/login errors include **400** (validation), **401** (login), **403** (suspended/banned), **409** (email in use on signup), **500**.

---

## Workspace, unread, reports (`server/index.js`)

| Method | Path | Auth | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/api/workspace/dashboard` | JWT | **200** `{ rooms, activeUsers, sharedFilesCount, unreadMessagesTotal, recentFiles, activity }` — staff see all rooms/users; members see scoped data |
| GET | `/api/unread` | JWT | **200** unread object from `unreadService` |
| POST | `/api/rooms/:roomId/read` | JWT | Room access required. **200** read state |
| POST | `/api/reports` | JWT | Body: `type` (`message` \| `file` \| `user`), `reason`, optional `roomId`, `note`, `messageId` / `fileId` / `targetUserId` per type. **201** report object; **400** validation / duplicate open report |

---

## Enforcement (staff) (`server/index.js`)

| Method | Path | Auth | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/api/rooms/:roomId/enforcement/:userId` | JWT **admin** or **moderator** | **200** `{ enforcement }` |
| POST | `/api/rooms/:roomId/enforcement/clear` | JWT **admin** or **moderator** | Body: `{ targetUserId }`. **200** `{ ok }` |

---

## Workspace members (`server/index.js`)

| Method | Path | Auth | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/api/workspace/members` | JWT | Staff: all users; others: self only |
| POST | `/api/workspace/members` | JWT **admin** only | Body: `email`, `password`, `displayName`. **201** `{ user }` |
| DELETE | `/api/workspace/members/:userId` | JWT **admin** or **moderator** | Sets `account_status` to **suspended**; cannot remove self; moderators cannot remove admins |
| PATCH | `/api/workspace/members/:userId` | JWT **admin** or **moderator** | Body: `{ accountStatus: "active" }` only — restore suspended user; admin rules apply for admin targets |

---

## Rooms, invites, DMs, pins (`server/index.js`)

| Method | Path | Auth | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/api/rooms` | JWT | Body: optional `name`. **201** room object (with invite metadata from controller) |
| DELETE | `/api/rooms/:roomId` | JWT | Creator or **admin**/**moderator**; protected built-in rooms **403** |
| GET | `/api/rooms/resolve/:code` | JWT | Invite resolve + grant access. **200** room |
| GET | `/api/rooms/:roomId` | JWT | Must have **room access**. **200** room row |
| PATCH | `/api/rooms/:roomId` | JWT | Body: `{ name }`. **200** updated room |
| GET | `/api/rooms/:roomId/pins` | JWT + room access | **200** array of pin rows |
| POST | `/api/rooms/:roomId/pins` | JWT + room access | Body: `name`, `url`, optional `messageId`, `sender`. **201** pin |
| DELETE | `/api/rooms/:roomId/pins/:pinId` | JWT + room access | **200** `{ ok: true }` |
| POST | `/api/dm/conversations` | JWT | Body: `{ peerUserId }`. **201** `{ conversationId }` |
| GET | `/api/dm/conversations` | JWT | **200** `{ conversations: [...] }` |
| GET | `/api/dm/conversations/:id/messages` | JWT | Participant only. **200** `{ messages: [...] }` |

---

## Uploads (`server/index.js`)

JSON body size limit: **`express.json({ limit: '8mb' })`** — large base64 uploads fail at parser level.

| Method | Path | Auth | Request | Response |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/uploads` | JWT | `filename`, `data` (base64 string), optional `mimeType` | **201** `{ id, name, url, messageId }` — also emits Socket events to default uploads room |
| GET | `/api/uploads` | JWT | — | **200** array of file metadata (staff: all; user: own) |
| DELETE | `/api/uploads/:fileName` | JWT | — | **200** `{ ok: true }` or **403**/**400** from `deleteUploadedFile` |

Static files: **`GET /uploads/<file>`** via `express.static` under `data/uploads` (no JWT on static route).

---

## Admin / moderator API (`server/routes/adminApi.js`)

All paths require JWT and **`admin`** or **`moderator`** unless noted. **`requireAdmin`** means **`admin`** only.

| Method | Path | Role | Response / body (summary) |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/overview` | Elevated | Stats, recent signups, moderation preview, activity sample |
| GET | `/api/admin/system` | Elevated | `api`, `socket`, `database`, uptime, latency, `storage`, `environment` |
| GET | `/api/admin/users` | Elevated | Array of users |
| PATCH | `/api/admin/users/:userId` | Elevated | Body: optional `role` (`user` \| `moderator` \| `admin`), `accountStatus` (`active` \| `suspended` \| `banned`). Only **admin** can assign **admin** or modify admin accounts |
| GET | `/api/admin/rooms` | Elevated | Room list with counts |
| PATCH | `/api/admin/rooms/:roomId` | Elevated | Body: optional `name`, `archived` (boolean) |
| DELETE | `/api/admin/rooms/:roomId` | **Admin** | Hard-delete room-related rows (see handler) |
| GET | `/api/admin/files` | Elevated | Files on disk under uploads |
| DELETE | `/api/admin/files/:fileId` | **Admin** | Deletes file from `data/uploads` |
| GET | `/api/admin/moderation` | Elevated | `{ queue: [...] }` |
| POST | `/api/admin/moderation/:reportId/resolve` | Elevated | Sets status **resolved** if pending/reviewing |
| PATCH | `/api/admin/moderation/:reportId/status` | Elevated | Body: `{ status }` — `reviewing` \| `resolved` \| `dismissed` |
| GET | `/api/admin/analytics` | Elevated | Messages by day, top rooms/users, upload count, DAU estimate |
| GET | `/api/admin/logs` | Elevated | `{ entries: [...] }` in-memory activity ring |
| GET | `/api/admin/settings` | Elevated | JSON settings object (defaults include `uploadLimitMB: 8`, room rules, permissions map) |
| PUT | `/api/admin/settings` | **Admin** | Merges **`req.body`** into settings file |

Elevated routes return **403** `{ "error": "Admin or moderator access required" }` when `user.role` is `user`. Admin-only routes return **403** `{ "error": "Administrator role required" }`.

---

## See also

- **[SECURITY.md](./SECURITY.md)** — JWT, roles, CORS, uploads, moderation.
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — `/health`, `/api/admin/system`, common failures.
- **[SOCKET_EVENTS.md](./SOCKET_EVENTS.md)** — Realtime contract (not REST).
