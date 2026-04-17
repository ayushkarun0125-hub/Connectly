# File Tree: w26-csci2020u-finalproject-w26-team-18

**Generated:** 4/17/2026  
**Root Path:** `w26-csci2020u-finalproject-w26-team-18` (repo root)

```
├── 📁 DOCS
│   ├── 📁 adr
│   │   ├── 📝 0001-sqlite.md
│   │   ├── 📝 0002-socket-io.md
│   │   └── 📝 0003-jwt-sessions.md
│   ├── 📁 readme-gifs
│   │   ├── 📝 README.md
│   │   └── ⚙️ .gitkeep
│   ├── 📝 API.md
│   ├── 📝 ARCHITECTURE.md
│   ├── 📝 CHANGELOG.md
│   ├── 📝 CONTRIBUTING.md
│   ├── 📝 DATA_SCHEMA.md
│   ├── 📝 DEMO_PREP.md
│   ├── 📝 DEPLOYMENT.md
│   ├── 📝 FEATURE_PRIORITIES.md
│   ├── 📝 FLOWS.md
│   ├── 📝 GLOSSARY.md
│   ├── 📝 LICENSE.md
│   ├── 📝 LIMITATIONS.md
│   ├── 📝 MIGRATIONS.md
│   ├── 📝 PRODUCT.md
│   ├── 📝 ROADMAP.md
│   ├── 📝 SECURITY.md
│   ├── 📝 SETUP.md
│   ├── 📝 SOCKET_EVENTS.md
│   ├── 📝 TESTING.md
│   ├── 📝 Timeline.md
│   ├── 📝 TROUBLESHOOTING.md
│   ├── 📝 UX_DECISIONS.md
│   └── 📝 WIREFRAMES.md
├── 📁 TESTS
│   ├── 📁 helpers
│   │   └── 📄 testServer.js
│   ├── 📁 integration
│   │   ├── 📄 dm-service.test.js
│   │   ├── 📄 http-auth.test.js
│   │   └── 📄 http-health.test.js
│   ├── 📁 system
│   │   └── 📄 live-server.test.js
│   ├── 📁 unit
│   │   ├── 📄 cn.test.ts
│   │   ├── 📄 dm-conversation-id.test.js
│   │   └── 📄 file-io.test.js
│   └── 📝 Readme.md
├── 📁 assets
│   └── 📁 github-readme
│       ├── 🖼️ hero-glass.svg
│       ├── 🖼️ panel-chat.svg
│       └── 🖼️ panel-whiteboard.svg
├── 📁 data
│   └── ⚙️ rooms.json
├── 📁 public
│   ├── 📁 sounds
│   │   └── ⚙️ .gitkeep
│   ├── 🖼️ favicon.svg
│   └── 🖼️ icons.svg
├── 📁 server
│   ├── 📁 controllers
│   │   ├── 📄 fileController.js
│   │   ├── 📄 messageController.js
│   │   ├── 📄 roomController.js
│   │   ├── 📄 uploadController.js
│   │   └── 📄 whiteboardController.js
│   ├── 📁 data
│   │   ├── 📁 messages
│   │   ├── 📁 uploads
│   │   ├── 📄 connectly.sqlite
│   │   └── ⚙️ rooms.json
│   ├── 📁 routes
│   │   └── 📄 adminApi.js
│   ├── 📁 services
│   │   ├── 📄 dmService.js
│   │   ├── 📄 enforcementService.js
│   │   ├── 📄 reportService.js
│   │   └── 📄 unreadService.js
│   ├── 📁 sockets
│   │   └── 📄 registerSocketHandlers.js
│   ├── 📁 utils
│   │   ├── 📄 db.js
│   │   ├── 📄 fileIO.js
│   │   └── 📄 seedAdmin.js
│   ├── ⚙️ .env.example
│   ├── 📄 bootstrapServer.js
│   ├── 📄 index.js
│   ├── ⚙️ package-lock.json
│   └── ⚙️ package.json
├── 📁 src
│   ├── 📁 assets
│   ├── 📁 components
│   │   ├── 📁 admin
│   │   ├── 📁 connectly
│   │   └── 📁 ui
│   ├── 📁 config
│   ├── 📁 contexts
│   ├── 📁 hooks
│   ├── 📁 layouts
│   ├── 📁 lib
│   ├── 📁 pages
│   │   └── 📁 admin
│   ├── 📁 routes
│   ├── 📁 services
│   ├── 📁 store
│   ├── 📁 ui-sounds
│   ├── 🎨 App.css
│   ├── 📄 App.jsx
│   ├── 🎨 index.css
│   └── 📄 main.jsx
├── ⚙️ .env.example
├── ⚙️ .gitignore
├── 📝 File_Structure.md
├── 📝 PROJECT_CHARTER.md
├── 📝 README.md
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ jsconfig.json
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 tailwind.config.js
├── ⚙️ tsconfig.json
├── 📄 vite.config.js
└── 📄 vitest.config.js
```

### Notes

- **`server/bootstrapServer.js`** — Express app, Socket.io, routes, and DB init; **`server/index.js`** loads it and calls `server.listen(...)`.
- **`TESTS/`** — Vitest suites: `unit/`, `integration/` (HTTP + SQLite via `helpers/testServer.js`), `system/` (optional live server; see `TESTS/Readme.md` and root `package.json` scripts).
- **`src/`** — Many `.jsx` / `.tsx` page and component files live under the folders above; the tree shows structure only. Run `Get-ChildItem -Recurse src` (or your IDE tree) for a full file list.
- **`server/data/`** and **`data/`** — Runtime SQLite, messages, uploads, and `rooms.json`; upload filenames change over time and are not listed here.

---
*Maintained for the course repo; align with `README.md` and `DOCS/SETUP.md` for run instructions.*
