# ADR 0001: SQLite for primary persistence

## Context

The course project needs durable users, rooms, messages, moderation, and related relations without operating a separate database server. Team skills and demo simplicity favor a file-backed SQL store.

## Decision

Use **SQLite** (via `sqlite` + `sqlite3` in Node) as the single source of truth. Schema is created and evolved in **`server/utils/db.js`** at startup using `CREATE IF NOT EXISTS` and conditional `ALTER TABLE`.

## Consequences

- **Pros:** Zero external DB service, easy local reset, relational model fits rooms/DMs/reports, one file to back up in dev.
- **Cons:** Write concurrency and multi-instance deployment are limited; advanced ops (online resharding, read replicas) are out of scope unless migrating to a network database later.
