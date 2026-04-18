# User flows

Step-by-step flows aligned with **`src/routes/AppRouter.jsx`** and auth gates. Socket and REST details live in **SOCKET_EVENTS.md** and **API.md**.

---

## 1. Discovery (public, unauthenticated)

| Flow | Steps |
| :--- | :--- |
| **Land on marketing site** | Open `/` → **Landing**; navigate via header/footer to `/features`, `/pricing`, `/why-connectly`, `/demo`, `/get-started`, `/contact`. |
| **Try login preview** | `/login-preview` — static/UI preview without full app auth. |

---

## 2. Authentication

| Flow | Steps |
| :--- | :--- |
| **Sign up** | `/signup` (or `/sign-up`) → submit email/password → receive JWT + user → if `profileCompleted === false`, next navigation into protected app sends user to **profile setup** (below). |
| **Log in** | `/login` → credentials → JWT stored → redirect into app; invalid or suspended/banned accounts see API errors. |
| **Forgot / reset password** | `/forgot-password`, `/reset-password` — UI flows (verify behavior against current API; may be placeholder). |
| **Session lost** | Visiting `/app/*` without a valid session → **`ProtectedRoute`** redirects to **`/login`**. |

---

## 3. Onboarding (first-time account)

| Flow | Steps |
| :--- | :--- |
| **Complete profile** | After sign-in, if profile incomplete → **`RequireProfileComplete`** redirects to **`/setup-profile`** (`ProfileSetupPage`) → user submits display name, username, bio, etc. → **`PATCH /api/auth/profile`** → `profileCompleted` true → user may enter workspace routes. |
| **Staff bypass** | **`admin`** and **`moderator`** are not blocked by the profile gate on API (see **SECURITY.md**); UI routing still sends incomplete users to setup until fixed in product policy. |

---

## 4. Member workspace (`role === user`)

Applies when the user is **not** redirected by **`AdminPortalGate`**.

| Flow | Steps |
| :--- | :--- |
| **Enter app** | `/app` → **Dashboard** (`AppLayout`: left **AppSidebar**, top **AppTopbar**, main content). While signed in, **`AppLayout`** connects Socket.io and **`join-room`** on the shared **Design** lobby (`room_design`) and the member’s **personal room** so workspace stats and “online” counts stay accurate even on the overview without opening chat. |
| **Browse rooms** | Sidebar or **`/app/room-directory`** → pick room or create room (modal) → navigate **`/app/rooms/:roomId`**. |
| **Join via invite** | **`/app/rooms/join`** (Join room page) → enter code → resolve invite → access granted → open room. |
| **Chat in a room** | **`/app/rooms/:roomId`** → **ChatPage**: join socket room, send messages, see presence/typing, upload files, open pins as designed. |
| **Whiteboard** | From room context → **`/app/rooms/:roomId/whiteboard`** → shared canvas. |
| **Legacy room redirect** | Hitting `room_general` paths redirects to **`room_design`** (marketing default channel). |
| **Direct messages** | **`/app/dm`** → conversation list → **`/app/dm/:conversationId`** → DM thread + history. |
| **Files** | **`/app/files`** — workspace file list / actions per **FilesPage**. |
| **Notes** | **`/app/notes`** — client-side notes experience. |
| **Team** | **`/app/team`** — team directory view. |
| **Profile & settings** | **`/app/profile`**, **`/app/settings`**. |
| **Sign out** | Use shell logout (topbar/sidebar depending on implementation). |

---

## 5. Staff: admin (`role === admin`)

| Flow | Steps |
| :--- | :--- |
| **Land after login / profile** | **`AdminPortalGate`** sends **`admin`** users to **`/app/admin`** instead of the member **`/app`** shell. |
| **Admin areas** | Nested routes: overview, **`system`**, **`users`**, **`rooms`**, **`moderation`**, **`files`**, **`analytics`**, **`logs`**, **`roles`**, **`settings`** — all under **`/app/admin/...`** with **AdminLayout** (staff sidebar + topbar). |
| **Return to member chat** | **`AdminOnlyGate`** only renders **`AdminLayout`** for **`admin`**, so **`showExitToWorkspace`** on **`AdminDashboardSidebar`** is always **false** in practice (the exit control is not shown). Use the browser address bar or a bookmark to **`/app`** or **`/app/rooms/:roomId`** when an admin needs the member shell. **Moderators** use **`ModeratorLayout`**, which has no sidebar “exit” link—same idea: navigate explicitly to **`/app`**. |

---

## 6. Staff: moderator (`role === moderator`)

| Flow | Steps |
| :--- | :--- |
| **Land after login / profile** | **`AdminPortalGate`** → **`/app/moderator`**. |
| **Moderator areas** | Subset of admin pages: overview (variant), **`users`**, **`rooms`**, **`moderation`**, **`files`** — under **`/app/moderator/...`**, **ModeratorLayout**. |
| **Switch to member chat** | No dedicated “exit” control in **`ModeratorSidebar`** today—open **`/app`** or **`/app/dm`** manually to use the member workspace. |

---

## 7. Moderation (member → staff)

| Flow | Steps |
| :--- | :--- |
| **File a report** | From chat or supported UI → **`POST /api/reports`** with type/target/reason → report appears in staff moderation queue; realtime refresh may use Socket events. |
| **Triage (staff)** | Open **`/app/admin/moderation`** or **`/app/moderator/moderation`** → resolve or change status per **API.md**. |

---

## 8. Error and edge flows

| Situation | Behavior |
| :--- | :--- |
| **Unknown route** | **`*`** → redirect **`/`**. |
| **API 403 profile incomplete** | Member calls protected API before profile done → error payload; user should complete **`/setup-profile`**. |
| **Room access denied** | Server returns 403; UI should show access denied or redirect. |

---

## Related docs

- **[WIREFRAMES.md](./WIREFRAMES.md)** — Screen layout map.
- **[UX_DECISIONS.md](./UX_DECISIONS.md)** — Why routing and shell differ for staff vs members.
- **[GLOSSARY.md](./GLOSSARY.md)** — Room vs DM, pins, enforcements.
