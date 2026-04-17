# ADR 0002: Socket.io for realtime

## Context

Connectly is realtime-first: presence, chat, whiteboard strokes, and moderation refresh need low-latency push to browsers. HTTP polling alone would be awkward for collaboration.

## Decision

Use **Socket.io** on the same **Node HTTP server** as Express. Clients connect with a JWT passed for auth where required; handlers live in **`server/sockets/registerSocketHandlers.js`**.

## Consequences

- **Pros:** Mature ecosystem, rooms/namespaces, fallbacks, straightforward React client.
- **Cons:** **Single-node** assumption unless a Redis adapter and sticky sessions are added; event contracts must stay documented (**SOCKET_EVENTS.md**) to avoid drift.
