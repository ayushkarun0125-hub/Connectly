# Wireframes & screen map

Text-first layout map for onboarding and the app. **High-fidelity mocks** can live in Figma (link below when the team has one).

**Suggested Figma (replace when real):** `https://www.figma.com/file/PLACEHOLDER/connectly-wireframes`

---

## Public site (`PublicLayout`)

Rough regions: **top nav** (logo, links to features/pricing/demo/login), **hero**, **section blocks**, **footer**.

```
┌─────────────────────────────────────────────┐
│  Nav: Logo    Features  Pricing  …  Log in  │
├─────────────────────────────────────────────┤
│                                             │
│              Hero + CTA                     │
│                                             │
├─────────────────────────────────────────────┤
│   Section   │   Section   │   Section       │
└─────────────────────────────────────────────┘
```

**Auth screens (`/login`, `/signup`):** Centered **card** on marketing background; fields + primary button + link to sibling auth route.

---

## Member app shell (`AppLayout`)

Three-column mental model: **narrow sidebar** · **flex main** · optional **drawer on mobile**.

```
┌──────────┬──────────────────────────────────────┐
│ Sidebar  │  Topbar (title, actions, mobile menu) │
│ (nav)    ├──────────────────────────────────────┤
│          │                                      │
│ Dashboard│           Page content               │
│ Rooms    │           (Outlet)                   │
│ DMs      │                                      │
│ …        │                                      │
└──────────┴──────────────────────────────────────┘
```

- **Components:** `AppSidebar`, `AppTopbar`, main `<Outlet />` (`AppLayout.jsx`).
- **Create room:** Modal over shell (`CreateRoomModal`).

---

## Chat room (`ChatPage` — `/app/rooms/:roomId`)

Typical split: **room list / context** (left column or narrow rail) + **message feed** (center) + optional **thread / pins / members** panel.

```
┌─────────────┬─────────────────────────┬───────────┐
│ Room list   │  Messages + composer    │ Presence  │
│ + search    │  (scroll region)        │ / pins    │
│             │                         │ (varies)  │
└─────────────┴─────────────────────────┴───────────┘
```

- Uses **`connectly-scroll`** utility classes for scroll regions (`src/index.css`).
- **Whiteboard** is a separate route: same room id under **`/whiteboard`**.

---

## Whiteboard (`WhiteboardPage`)

Full-width or near full-width **canvas** with **toolbar** (pen, color, clear) above or along edge; room context in topbar/breadcrumb.

---

## Staff dashboards (`AdminLayout` / `ModeratorLayout`)

Dark **shader background** + scrim; **left admin sidebar** (collapsible) + **topbar** + **content card** area.

```
┌──────────┬──────────────────────────────────────┐
│ Admin    │  Topbar (env badge, user, mobile nav) │
│ nav      ├──────────────────────────────────────┤
│ Overview │   ┌────────────────────────────────┐  │
│ System   │   │  Tables / cards / charts       │  │
│ Users    │   └────────────────────────────────┘  │
│ …        │                                      │
└──────────┴──────────────────────────────────────┘
```

---

## Direct messages

- **List:** **`DirectMessagesPage`** — list of conversations; entry to thread.
- **Thread:** **`DirectMessagePage`** — header + scrollable messages + composer (same family as chat).

---

## Mobile

- **Sidebar:** `sidebarOpen` / overlay pattern in **`AppLayout`**; staff layouts use **`mobileOpen`** (or equivalent) for the dashboard sidebar on small screens.

---

## Related docs

- **[FLOWS.md](./FLOWS.md)** — User journeys and routes.
- **[UX_DECISIONS.md](./UX_DECISIONS.md)** — Why the shell and staff visuals differ.
