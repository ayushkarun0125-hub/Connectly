# ADR 0003: JWT for API and socket auth

## Context

The app needs authenticated REST (rooms, DMs, admin) and authenticated realtime actions without server-side session storage for every tab.

## Decision

Issue **JSON Web Tokens** signed with **`JWT_SECRET`** (see **`server/index.js`**), stored client-side (for example `localStorage` as `connectly_jwt`), **7-day expiry**. Middleware verifies the token on protected routes; sockets pass the token for elevated operations.

## Consequences

- **Pros:** Stateless servers, simple LAN demos, works with SPA static hosting.
- **Cons:** No instant server-side revocation without a blocklist or short TTL; XSS on the client could steal tokens—mitigate with CSP, careful deps, and HTTPS in production.
