# Database migrations and dev data

Connectly does **not** use a separate migration runner (no Flyway-style version table). All schema setup runs inside **`server/utils/db.js`** → **`initDatabase()`**, which the server calls at startup after opening SQLite.

## How schema changes are applied

1. **`CREATE TABLE IF NOT EXISTS`** — Defines new tables idempotently (rooms, messages, users, moderation, DMs, pins, enforcements, read state, etc.).
2. **`PRAGMA table_info(...)` + `ALTER TABLE ... ADD COLUMN`** — Adds columns to existing installs when a column name is missing. SQLite cannot drop or rename columns in older patterns; new nullable columns or defaults are used.
3. **`CREATE INDEX IF NOT EXISTS` / partial unique indexes** — Indexes are (re)created safely across boots.
4. **Data backfills** — `INSERT OR IGNORE` / `UPDATE` statements align derived rows (for example `room_access` from room owners, `personal_room_id` and personal rooms for completed profiles).
5. **Workspace lobby** — After **`initDatabase()`**, **`ensureWorkspaceLobbyForAllUsers()`** in **`server/controllers/roomController.js`** (called from **`server/bootstrapServer.js`**) ensures **`room_design`** exists and inserts **`room_access`** with source **`workspace`** for every active user. Login and profile completion also **`grantRoomAccess`** for the lobby so existing DBs pick up access without a full reset.
6. **One-off cleanups** — Best-effort `DELETE` for deprecated rows (for example legacy `room_general`) wrapped in try/catch so reruns do not fail.

Any new column or table should follow the same pattern: check with `PRAGMA`, then `ALTER` or `CREATE IF NOT EXISTS`, so pulling `main` and restarting the server upgrades an existing file in place.

## Seeds (not SQL migration files)

- **Demo moderation reports** — `seedDemoModerationReportsIfEmpty()` inserts a few sample rows only when:
  - `NODE_ENV !== 'production'`, and
  - `CONNECTLY_NO_DEMO_DATA !== '1'`, and
  - the `moderation_reports` table is empty.
- **Default admin / moderator** — Handled in **`server/utils/seedAdmin.js`**, invoked from **`server/bootstrapServer.js`** after DB init (env-gated; see root **README** for `SEED_ADMIN`, `ADMIN_EMAIL`, production behavior).

These are **bootstrap helpers**, not versioned migrations.

## Resetting the dev database safely

1. **Stop the server** (so the SQLite file is not locked).
2. **Delete the database file** — Default path: `server/data/connectly.sqlite` when the process cwd is `server/` and `DB_PATH` is unset. If you set **`DB_PATH`** in `server/.env`, delete that path instead.
3. **Optional:** Remove `server/data/uploads/*` if you want a clean file-attachment story; keep the folder.
4. **Start the server** — `initDatabase()` creates a fresh schema, runs additive `ALTER`s (no-ops on new file), backfills, optional demo moderation seed, and `seedAdmin` / moderator logic per env.

To avoid demo moderation rows on a fresh dev DB, set `CONNECTLY_NO_DEMO_DATA=1` in `server/.env`.

## `connectly.sqlite` and `.gitignore`

- The app opens **`DB_PATH`** or, by default, **`path.resolve('data', 'connectly.sqlite')`** relative to the server’s working directory (typically **`server/data/connectly.sqlite`**).
- The **repository root `.gitignore`** in this project does **not** currently list `*.sqlite`. The database file is a **local runtime artifact**; it may contain passwords (hashed), messages, and uploads metadata. **Do not commit production or personal databases.** Teams usually add `server/data/connectly.sqlite` or `*.sqlite` to `.gitignore` and commit only `server/.env.example` without secrets.
- **`server/utils/fileIO.js`** still ensures `server/data/rooms.json` and `messages/` exist for legacy layout; primary chat and account state live in **SQLite** (see **ARCHITECTURE.md**).

## See also

- **[DATA_SCHEMA.md](./DATA_SCHEMA.md)** — Field-oriented reference (note the banner on SQLite vs legacy JSON sections).
- **`server/utils/db.js`** — Source of truth for tables and `ALTER` list.
