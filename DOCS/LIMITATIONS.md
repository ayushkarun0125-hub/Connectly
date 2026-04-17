# Known limitations

Honest bounds of the current system—useful for course demos, reviews, and production expectations.

## Realtime and scale

- **Single Node Socket.io** — One server process owns in-memory presence and room fan-out. No Redis adapter or horizontal scale; multiple instances would duplicate or miss events unless the architecture is extended.
- **No guaranteed delivery** — Message ordering is best-effort per room; clients should tolerate reconnects and history reloads.

## Data and concurrency

- **SQLite** — One writer at a time; fine for demos and modest load. Heavy concurrent writes (many rooms, large attachments metadata) can contend; production at scale often moves chat to a client/server database with clearer replication story.
- **File uploads** — Stored on local disk under `server/data/uploads`; backup and HA are not built in.

## Security and product maturity

- **Email verification** — Registration does not prove email ownership; passwords are the main gate.
- **JWT secret** — Must be set via **`JWT_SECRET`** in production; default dev secret is insecure if exposed.
- **CORS and LAN** — Development allows flexible LAN origins when not in strict production mode; production should use explicit **`CLIENT_URL`** / **`CORS_ORIGINS`**.
- **Admin seed** — Default admin creation is convenient for class demos; lock down with **`SEED_ADMIN`**, strong passwords, and no public exposure.

## Features

- **Search / compliance** — No full-text enterprise search, legal hold, or long-term audit export beyond what SQLite and admin APIs expose.
- **Moderation automation** — Queues are staff-driven; no ML or rule engine for auto-actions.

## Documentation drift

- **SOCKET_EVENTS.md** / parts of **DATA_SCHEMA.md** may describe older file-based message paths; runtime persistence for chat is **SQLite**—verify **`server/utils/db.js`** and handlers when in doubt.

If you extend the system, consider updating this file so reviewers see what improved.
