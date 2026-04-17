# Connectly — product overview

High-level vision, who it is for, what it does, and what success means. For technical depth see **[ARCHITECTURE.md](./ARCHITECTURE.md)**; for the course charter see **`PROJECT_CHARTER.md`** at the repo root.

---

## Vision

**Connectly** is a **real-time collaboration workspace**: many clients share **rooms** with synchronized **chat**, **presence**, **typing**, **file sharing**, **pins**, a **collaborative whiteboard**, and **direct messages**—backed by a **single Node API** using **Socket.io** and **SQLite** so state survives restarts. The experience is meant to feel like a small **Slack-style** product (channels + DMs + staff tools), scoped for **CSCI 2020U** as a credible **distributed systems** story: event-driven delivery, persistence, roles, and moderation—not a full SaaS.

---

## Users

| Persona | Needs |
| :--- | :--- |
| **Workspace member** | Sign up, complete profile, see rooms they can access, chat, upload files, use DMs and whiteboard, see unread counts, report content. |
| **Moderator** | Everything a member has, plus **moderation queue**, resolving/updating reports, viewing system health where exposed, helping enforce room rules. |
| **Administrator** | Everything a moderator has, plus **destructive or sensitive actions** (e.g. some deletes, settings, promoting roles per API rules). |
| **Course grader / demo audience** | Clear **README** run path, **health** and **admin system** visibility, stable multi-tab demo, honest **limitations** documented. |

Team (charter): **Dhruv Thakar**, **Ayush K.**, **Aaryan Kulkarni** — Group 53 / Team 18.

---

## Features (product lens)

- **Real-time messaging** — Multi-room chat with history on join; Socket.io delivery.
- **Presence & typing** — Who is in the room; typing indicators.
- **Whiteboard** — Shared strokes per room, persisted.
- **Files & pins** — Uploads with ledger/metadata; room pins (links / references).
- **DMs** — Conversations between registered users.
- **Accounts** — JWT sessions, bcrypt passwords, profile onboarding.
- **Staff surfaces** — Admin and moderator routes for overview, users, rooms, files, moderation, analytics, logs, settings (role-gated).
- **Trust & safety (lightweight)** — User-filed **reports**, room **enforcements** (e.g. kick/ban flows), account status (active / suspended / banned).
- **Shell UX** — Landing, app layout, dashboard, settings, notes/team pages as applicable to the course scope.

---

## Goals

1. **Learning** — Demonstrate client–server real-time design, REST + WebSocket boundaries, persistence, and basic security (JWT, roles, CORS awareness).
2. **Working product** — Two or more browsers can collaborate in the same room with consistent state and recoverable history.
3. **Operability** — Health endpoint, documented env vars, troubleshooting and deployment notes for demos and markers.
4. **Integrity** — Charter alignment, contribution clarity, and documentation that matches behavior (see **API.md**, **SOCKET_EVENTS.md**, **LIMITATIONS.md**).

---

## Related docs

- **[ROADMAP.md](./ROADMAP.md)** — Week-style delivery plan (summary of **Timeline.md**).
- **[FEATURE_PRIORITIES.md](./FEATURE_PRIORITIES.md)** — MVP vs future.
- **[PROJECT_CHARTER.md](../PROJECT_CHARTER.md)** — Team contract and module ownership.
