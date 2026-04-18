# UX decisions

Rationale for navigation, layout, and visual patterns—so future contributors do not “undo” intent by accident.

---

## Marketing vs app chrome

- **Public pages** use **`PublicLayout`** with a glassy, campaign-style presentation (hero, sections) to sell the **Connectly** story for demos and course reviewers.
- **Authenticated app** uses **`AppLayout`** with a **dense, tool-first** sidebar + topbar (`shellBg`, Tailwind tokens) optimized for **repeat use** (many rooms, quick navigation), not the same look as the landing page.

**Why:** Separating marketing from product reduces cognitive load in the workspace and matches common SaaS patterns (Slack, Discord, etc.).

---

## Profile gate before workspace

- New users must complete **`/setup-profile`** before **`RequireProfileComplete`** allows **`/app/**`** routes (except the setup route itself).
- **API** also blocks incomplete profiles on most endpoints (**SECURITY.md**).

**Why:** Ensures display names and usernames exist for mentions, DMs, and moderation; avoids anonymous-looking traffic in a classroom setting.

---

## Staff land on admin/moderator portals first

- **`AdminPortalGate`** redirects **`admin`** → **`/app/admin`** and **`moderator`** → **`/app/moderator`** instead of the member dashboard.
- **`AdminDashboardSidebar`** supports **`showExitToWorkspace`**, but **`AdminOnlyGate`** admits only **`admin`** users into **`AdminLayout`**, so that flag is **always false** and the exit button does not render today. **Moderators** use **`ModeratorSidebar`**, which also has no exit link—both roles rely on **explicit navigation** to **`/app`** when they need the member UI.

**Why:** Course emphasis on **moderation and operations**; staff land on portals first. A future tweak could add a visible “Open workspace” link for admins and moderators without changing the gate logic.

---

## Default room redirect (`room_general` → `room_design`)

- Legacy **`room_general`** URLs redirect to **`room_design`** in the router.

**Why:** Product default channel renamed; deep links and bookmarks keep working.

---

## Shared lobby for workspace-wide presence (`room_design`)

- On API startup, the server ensures **`room_design`** exists and grants **`room_access`** to it for every **active** account (and again on **login** / **profile complete** for eligible users).
- **`AppLayout`** keeps the socket joined to **`room_design`** and the user’s **personal room** (when present) for as long as they are signed in.
- Leaving **Chat** or **Whiteboard** does not **`leave-room`** those shell rooms, so the overview does not “lose” you when you navigate.

**Why:** Dashboard **`onlineInWorkspace`** and per-room counts are derived from **`room_members`** intersected with **`room_access`**. Without a room everyone shares, members would only appear online in private personal rooms others cannot see—counts would look empty. The lobby is the shared visibility surface; personal room membership stays for your own channel.

---

## Socket + REST split

- **Realtime** presence, messages, typing, whiteboard: **Socket.io** (`src/services/socket.js`).
- **Durable** fetches (profile, dashboard, pins, DMs): **REST** with JWT.

**Why:** Clear boundary for what must be “live” vs what can be refetched; easier to document (**SOCKET_EVENTS.md**, **API.md**) and test.

---

## Scroll regions (`connectly-scroll`)

- Long lists (sidebar rooms, message feeds) use a shared scrollbar style class for **consistent** thumb/track styling in dark and light themes.

**Why:** Avoids default browser scrollbars clashing with the glass/slate aesthetic.

---

## Mobile sidebar drawers

- **App** and **admin** layouts tuck navigation behind a **hamburger / overlay** on small viewports.

**Why:** Preserves horizontal space for chat and tables without dropping features on phones/tablets.

---

## Staff visual treatment (dark shader shell)

- **AdminLayout** uses **`ShaderBackground`**, navy scrim, and cyan-tinted gradients behind cards.

**Why:** Visually distinct from the member app so operators immediately know they are in an **elevated** context; improves contrast for dense tables.

---

## Optional Figma / design handoff

- High-fidelity frames (spacing, typography scale) should live in **Figma** (see **WIREFRAMES.md** link placeholder). Code remains source of truth for shipped behavior.

---

## Related docs

- **[WIREFRAMES.md](./WIREFRAMES.md)** — ASCII layout map + Figma placeholder.
- **[FLOWS.md](./FLOWS.md)** — End-to-end user journeys.
- **[PRODUCT.md](./PRODUCT.md)** — Vision and personas.
