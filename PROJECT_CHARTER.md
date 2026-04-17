# CSCI 2020U Project Charter & Work Contract

**Last updated:** April 17, 2026 (final submission)

## 1. Project Overview

* **Project members:** Dhruv Thakar, Ayush K., Aaryan Kulkarni
* **Product Name:** Connectly
* **Project Description:** Connectly is a real-time collaboration platform that combines multi-room chat, collaborative whiteboard, live presence, file sharing, direct messaging, moderation tooling, and a premium web UX (dark theme, glassmorphism marketing site, onboarding/profile flows). “Level up” aspects include Socket.io real-time delivery, unread/read tracking, enforcement (kick/ban), and polished responsive UI with motion and clear hierarchy.
* **Tech Stack:** React (Vite), TypeScript/JavaScript, Tailwind CSS, Node.js, Express, SQLite (`sqlite`/`sqlite3`), Socket.io (WebSockets + polling), JWT authentication, bcrypt for passwords.

## 2. Team Work Contract

* **Communication Channel:** Discord
* **Meeting Schedule:** Every Tuesday after lecture
* **Conflict Resolution:** If team members do not contribute to assigned tasks, we will contact the instructor immediately. All team members are also responsible to enable other members to execute their contributions (i.e., push the code needed, etc.).

## 3. Work Division & Contribution Report

*The “Actual Contribution” column reflects what each member delivered for the final codebase and documentation.*

| Task / Module | Assigned Member (Plan) | Actual Contribution (Final) |
| :--- | :--- | :--- |
| **Multi-threaded Server** | Dhruv Thakar | Express 5 HTTP stack (`server/bootstrapServer.js`, `server/index.js`): shared `http.Server` with Socket.io, REST API (auth, rooms, DMs, uploads, workspace, moderation-related HTTP), JWT/bcrypt auth middleware, CORS, static uploads, admin route wiring. |
| **Socket Networking** | Ayush K. | Socket.io server (`server/sockets/registerSocketHandlers.js`) and client real-time layer (`src/services/socket.js`, chat services): join/leave room, messaging, typing, presence, whiteboard sync, and alignment with account/JWT handshake patterns. |
| **GUI Implementation** | Aaryan Kulkarni | React 19 + Vite client: app shell, chat/DM/whiteboard/files/settings flows, landing and marketing pages, **admin** and **moderator** portals (dashboards, users, rooms, moderation, analytics), routing and role gates (`ProtectedRoute`, `AdminOnlyGate`, etc.). |
| **Persistence (File I/O)** | Dhruv Thakar | SQLite schema and lifecycle (`server/utils/db.js`), controllers (messages, rooms, files, uploads, whiteboard), `server/utils/fileIO.js` for data directories, seed admin/moderator helpers, DM and unread services integration with the DB. |
| **UX/Sound Effects** | Aaryan Kulkarni | Tailwind 4 styling, motion and layout polish, glass/marketing UI, reusable UI components, `src/ui-sounds/` for optional UI audio feedback, profile and onboarding UX. |
| **Documentation/README** | Ayush K. | Root `README.md` (setup, features, stack), `DOCS/` (architecture, API, security, testing scenarios, setup, ADRs, changelog, etc.), `CONTRIBUTING.md`, `File_Structure.md`, and test run instructions where documented. |
| **Automated testing** | Dhruv Thakar (lead) | `TESTS/` Vitest suites (unit, integration with Supertest + isolated DB workspace, optional system/live checks), `TESTS/helpers/testServer.js`, root `vitest.config.js` and `package.json` test scripts. |

## 4. Final Contribution Status (Tag one at Final Submission)

At the end of the project, the team must agree on one of the following tags:

* **[x] (1) EVEN CONTRIBUTION:** All members met expectations from the original charter.
* **[ ] (2) UNEVEN CONTRIBUTION:** One or more members did not meet expectations.

*Rationale:* Each member shipped their planned areas (server/persistence/tests, sockets and docs, GUI/UX). Commit counts differ by role (integration and server work naturally centralize more commits), but workload and outcomes met the team’s agreed expectations.

*Note: Graders will use the "Actual Contribution" column above to apply uneven grades if necessary.*
