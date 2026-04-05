# 🤝 Contributing to Connectly

> Internal contribution guide for Group 53 — CSCI 2020U
> Follow these conventions from Day 1 to keep the repo clean across 3 contributors in 12 days.

---

## 🌿 Branch Strategy

We use a simple **feature branch workflow** off `dev`. Nothing goes directly into `main` except the final submission.

```
main
 └── dev
      ├── feature/chat-rooms        ← Dhruv
      ├── feature/whiteboard-sync   ← Aaryan
      └── feature/socket-client     ← Ayush
```

| Branch | Purpose |
| :--- | :--- |
| `main` | Clean, submission-ready code only. Tagged release at end. |
| `dev` | Integration branch. All feature branches merge here. |
| `feature/<name>` | One branch per feature or task. Delete after merging. |
| `fix/<name>` | Bug fix branches. Same rules as feature branches. |

**Rules:**
- Never push directly to `main` or `dev`
- Always branch off the latest `dev`
- Pull from `dev` before starting any new work

```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# When done, push and open a PR into dev
git push origin feature/your-feature-name
```

---

## 💬 Commit Message Format

Use this format for every commit:

```
<type>(<scope>): <short description>

[optional body]
```

**Types:**

| Type | When to use |
| :--- | :--- |
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `chore` | Setup, config, dependency changes |
| `style` | UI/CSS changes, no logic change |
| `refactor` | Code restructure, no behavior change |
| `docs` | Documentation only |
| `test` | Adding or updating tests |

**Scopes:** `server`, `client`, `socket`, `whiteboard`, `presence`, `persistence`, `ui`, `docs`

**Examples:**

```
feat(socket): add join-room and leave-room event handlers
fix(persistence): prevent duplicate messages on reconnect
style(ui): update message feed timestamp formatting
docs(readme): add local setup instructions
chore(server): install and configure Socket.io
refactor(socket): extract room logic into roomController
```

**Rules:**
- Keep the subject line under 72 characters
- Use present tense ("add" not "added")
- No period at the end of the subject line
- Reference issues in the body if applicable

---

## 🔀 Pull Request Process

1. Push your feature branch to GitHub
2. Open a PR from your branch into `dev`
3. Title your PR using the same format as commits: `feat(whiteboard): real-time stroke sync`
4. Fill in what you built and any known issues
5. At least **one other team member** must review before merging
6. Squash merge preferred to keep `dev` history clean
7. Delete the branch after merging

**PR checklist before requesting review:**
- [ ] Code runs locally without errors
- [ ] No console.log statements left in (or mark them `// DEBUG`)
- [ ] No hardcoded ports, IPs, or file paths (use config/env)
- [ ] Relevant docs updated if you changed an interface or event name

---

## 📁 File & Folder Conventions

| Convention | Rule |
| :--- | :--- |
| **File names** | `camelCase.js` for JS files, `PascalCase.jsx` for React components |
| **Folders** | `lowercase` or `kebab-case` only |
| **Event names** | `kebab-case` (e.g. `join-room`, `draw-event`) — never camelCase |
| **JSON keys** | `camelCase` |
| **Constants** | `UPPER_SNAKE_CASE` |
| **Component names** | `PascalCase` (e.g. `MessageFeed`, `WhiteboardCanvas`) |

---

## ⚙️ Environment Variables

Never commit secrets or local config. Use a `.env` file for anything environment-specific.

```bash
# server/.env
PORT=3001
CLIENT_URL=http://localhost:5173
```

```bash
# client/.env
VITE_SERVER_URL=http://localhost:3001
```

Both `.env` files are in `.gitignore`. Copy `server/.env.example` and `client/.env.example` to get started.

---

## 🚫 What Not to Commit

The `.gitignore` covers these, but be aware:

- `node_modules/` — never commit dependencies
- `.env` — never commit environment variables
- `data/messages/` — JSON message files (generated at runtime)
- `client/dist/` — build output
- `.DS_Store`, `Thumbs.db` — OS junk files

---

## 🆘 When You're Blocked

1. Post in Discord with what you're working on and what's broken
2. Don't wait until Tuesday's meeting — 12 days is too tight
3. If a blocker is blocking someone else's work, flag it immediately
4. Assign GitHub issues for anything that needs tracking across days

---

> Last updated: Day 1 setup session.
> Questions? Discord first, then Tuesday meeting.
