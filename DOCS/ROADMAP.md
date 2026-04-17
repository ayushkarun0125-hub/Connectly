# Roadmap (week-by-week)

This file is a **calendar-friendly** view of the **12-day** plan in **[Timeline.md](./Timeline.md)**. Treat **Timeline.md** as the detailed day-by-day checklist with owners; update either file when dates slip.

Assumption: **~2 calendar weeks** of focused work maps to the 12-day phases below (some days are parallel work across members).

---

## Week 1 — Foundation and real-time core

**Maps to Timeline: Days 1–6** (Setup & planning → Core server & sockets → Real-time features).

| Focus | Outcomes |
| :--- | :--- |
| **Setup** | Repo (`main` / `dev`), Discord cadence, local **client + server** dev running for everyone. |
| **Socket backbone** | Socket.io on Express; **join-room** / **leave-room**; message broadcast; client `socket` service. |
| **Persistence path** | Messages and room-related state durable (today: **SQLite** + uploads on disk; Timeline still mentions legacy JSON in places). |
| **Distributed “feel”** | Presence, typing, history on join, uploads in-room, whiteboard canvas + stroke sync. |

**Milestone:** Two tabs in one room: chat + whiteboard stay in sync; history reloads after refresh.

---

## Week 2 — Product UI, staff tools, and ship

**Maps to Timeline: Days 7–12** (Frontend UI/UX → Advanced integration → Polish & submission).

| Focus | Outcomes |
| :--- | :--- |
| **UI/UX** | Chat layout, sidebar, presence panel, typing UI, file rendering in feed, whiteboard toolbar, responsive pass, optional sound. |
| **Advanced integration** | DMs, **admin/moderator** roles, kick/ban / enforcement flows, multi-client (3+) test pass, bug fixes. |
| **Polish & submission** | README, architecture + API/security/troubleshooting docs as required, contribution table, final demo, tag/push **main**. |

**Milestone:** Full walkthrough for course demo; docs and charter artifacts complete.

---

## Ongoing (any week)

- Keep **SOCKET_EVENTS.md** and **API.md** aligned with code changes.
- Run **health** checks before demos (`GET /health`).
- Capture **limitations** honestly (**LIMITATIONS.md**) as scope decisions, not bugs.

---

## See also

- **[Timeline.md](./Timeline.md)** — Day-level tasks and owners.
- **[FEATURE_PRIORITIES.md](./FEATURE_PRIORITIES.md)** — What must work vs nice-to-have.
- **[DEMO_PREP.md](./DEMO_PREP.md)** — Demo-day checklist.
