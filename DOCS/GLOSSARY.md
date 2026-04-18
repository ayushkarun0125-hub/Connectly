# Glossary

Short definitions for terms used across **SOCKET_EVENTS.md**, the chat UI, and admin/moderator dashboards.

## Rooms and conversations

- **Room** — A shared channel stored in SQLite (`rooms`). Has an id (for example `room_…`), name, optional invite code, archive flag, and optional `created_by_user_id`. Messages can reference `room_id`. This is the usual “channel” or “space” in the sidebar.
- **DM conversation** — A **direct message** thread between registered users, stored as a row in `conversations` (typically `kind = 'dm'`) with participants in `conversation_participants`. Messages use **`conversation_id`** (and usually a null `room_id`), not the same shape as a public room id.
- **Personal room / “My space”** — A per-user room derived from `users.personal_room_id`, created when a user completes onboarding. Used like a private workspace room; see **`room_access`** for grants.
- **Design / workspace lobby (`room_design`)** — Built-in shared channel; all **active** users receive **`room_access`** with source **`workspace`** (on server boot and on login / profile completion). Used for team-wide chat and as the **common presence surface** so the workspace dashboard can count distinct online users across the org.
- **Socket.io room** — A server-side channel used to target emits (for example everyone subscribed to a `roomId`). Not the same as a Connectly **Room** row, though names often align when clients join a chat room.

## Pins

- **Pin** — A bookmark row in **`room_pins`**: label (`name`), `url`, optional `message_id`, `room_id`, `pinned_at`. Shown in room UI as quick links or references; distinct from “pinning” a message in the Slack sense unless tied via `message_id`.

## Enforcement

- **Room enforcement** — A row in **`room_enforcements`**: staff action against a **`target_user_id`** in a specific **`room_id`** (`action` such as kick or ban, `reason`, optional `note`, `actor_user_id`, optional `expires_at`, `active`). Used to block or remove participation in that room while the row is active and not expired.
- **Account status** — On **`users.account_status`**: workspace-wide **`active`**, **`suspended`**, or **`banned`** (admin API), separate from a single-room enforcement.

## Moderation reports

- **Moderation report** — Row in **`moderation_reports`**: `type` (for example message, user, file), `target` id, optional `room_id`, `reason`, `status`, timestamps. Staff triage in moderator/admin UIs; Socket events may refresh queues.
- **Open report** — In code and APIs, **open** usually means **`status` in `pending` or `reviewing`** — still needs action (see `adminApi.js` queue queries). Not “open” as in public visibility.
- **Resolved / dismissed** — Terminal outcomes: **`resolved`** (addressed) or **`dismissed`** (closed without the same meaning as resolved); both stop being “open” for queue counts.

## Identity

- **`account_user_id`** — Registered user id (`users.id`), used in DB and REST. **`SOCKET_EVENTS.md`** sometimes uses **`userId` as socket id** in older examples; live handlers often resolve JWT/account id for bans and DMs—check the handler or payload comments in **`server/sockets/registerSocketHandlers.js`**.

## Related docs

- **[SOCKET_EVENTS.md](./SOCKET_EVENTS.md)** — Event names and payloads.
- **[DATA_SCHEMA.md](./DATA_SCHEMA.md)** — Storage layout (SQLite + legacy JSON notes).
- **[MIGRATIONS.md](./MIGRATIONS.md)** — How tables evolve at startup.
