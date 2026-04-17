# Feature priorities

What counts as **MVP** for the course deliverable vs **already-built stretch** vs **future** (out of scope for this repo unless someone extends it). Aligned with **README**, **LIMITATIONS.md**, and the charter.

---

## P0 — MVP (must work for “done”)

These are the **non-negotiable** behaviors a grader or teammate expects when following **README** / **SETUP**.

| Area | Includes |
| :--- | :--- |
| **Run locally** | Server + Vite client; **`VITE_SERVER_URL`** / port alignment when the API shifts port. |
| **Auth loop** | Sign up, login, JWT on API; **profile completion** gate for normal users. |
| **Rooms & chat** | Create/join room, send/receive messages in real time, load history. |
| **Persistence** | SQLite (or configured **DB_PATH**) survives restart for users/messages/rooms. |
| **Multi-client** | At least **two** concurrent browsers/tabs show consistent chat. |
| **Health** | **`GET /health`** answers so integration is provable. |

---

## P1 — Core product (shipped in scope; “full Connectly”)

Already part of the **intended** course product—not optional extras if the timeline was kept.

| Area | Includes |
| :--- | :--- |
| **Whiteboard** | Draw sync + persistence. |
| **Presence & typing** | Join/leave, typing indicators. |
| **Files** | Upload path, listing, chat integration as designed. |
| **Pins** | Room pins API + UI. |
| **DMs** | Conversations + history for participants. |
| **Staff** | Moderator/admin dashboards, moderation queue, user/room/file management per **API.md**. |
| **Reports & enforcement** | User reports; staff review; room enforcement (kick/ban style) where implemented. |
| **Unread / read** | Mark room read, dashboard unread hints. |
| **Polish** | Responsive UI, landing + app shell, basic sounds if claimed in timeline. |

---

## P2 — Future / not required here

Good for **discussion**, **final report “next steps”**, or a fork—not commitments of the current codebase.

| Idea | Why deferred |
| :--- | :--- |
| **Horizontal scale** | Socket.io today is **single-node**; Redis adapter + sticky sessions needed. |
| **Postgres / managed DB** | SQLite is intentional for simplicity. |
| **Email verification** | Not implemented; see **LIMITATIONS.md**. |
| **Token refresh / revocation list** | JWT is **7-day**, mostly stateless. |
| **Automated moderation / ML** | Manual queue only. |
| **Mobile native apps** | Web-first. |
| **Enterprise SSO / audit export** | Out of course scope. |

---

## Demo vs production

- **MVP for demo day** = P0 + the P1 slices you actually show (pick a path: chat → DM → admin queue).
- **Production deploy** = P0 + P1 + **[DEPLOYMENT.md](./DEPLOYMENT.md)** + **[SECURITY.md](./SECURITY.md)** hardening (no default seeds, strong **JWT_SECRET**, HTTPS/proxy).

---

## See also

- **[PRODUCT.md](./PRODUCT.md)** — Vision and personas.
- **[ROADMAP.md](./ROADMAP.md)** — Week-style schedule.
- **[LIMITATIONS.md](./LIMITATIONS.md)** — Honest bounds of the current system.
