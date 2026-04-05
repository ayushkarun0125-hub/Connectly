# ⚙️ Connectly — Setup Guide

> Detailed local development setup for CSCI 2020U — Group 53
> For the quick version, see the [README](./README.md).

---

## ✅ Prerequisites

Make sure you have the following installed before starting:

| Tool | Minimum Version | Check |
| :--- | :--- | :--- |
| Node.js | v18.0.0+ | `node --version` |
| npm | v9.0.0+ | `npm --version` |
| Git | Any recent version | `git --version` |

> **Recommended:** Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.
> Run `nvm use 18` if you have multiple Node versions installed.

---

## 📥 1. Clone the Repository

```bash
git clone https://github.com/your-repo/connectly.git
cd connectly
```

Switch to the `dev` branch for active development:

```bash
git checkout dev
```

---

## 🔧 2. Environment Variables

Both the server and client require a `.env` file. Example files are provided — copy them before running anything.

**Server:**

```bash
cd server
cp .env.example .env
```

Default contents of `server/.env`:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
```

**Client:**

```bash
cd ../client
cp .env.example .env
```

Default contents of `client/.env`:

```env
VITE_SERVER_URL=http://localhost:3001
```

> If you change the server port, update both `.env` files to match.

---

## 📦 3. Install Dependencies

Install dependencies for the server and client separately.

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

---

## 📂 4. Create Data Directories

The server writes JSON files to disk. Create the required directories before first run:

```bash
cd server
mkdir -p data/messages
mkdir -p data/uploads
```

> These folders are in `.gitignore` — you need to create them manually on each new machine.

---

## 🚀 5. Start the Application

You need **two terminal windows** running simultaneously.

**Terminal 1 — Server:**

```bash
cd server
npm run dev
```

Expected output:
```
[server] Listening on port 3001
[socket] Socket.io initialized
```

**Terminal 2 — Client:**

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🌐 6. Open in Browser

```
http://localhost:5173
```

To test multi-client behavior, open the same URL in **two or three separate browser tabs** (or use a private/incognito window for a truly isolated client).

---

## 🗂️ Project Structure Reference

```
Connectly/
├── client/
│   ├── .env                  ← Copy from .env.example
│   ├── .env.example
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
├── server/
│   ├── .env                  ← Copy from .env.example
│   ├── .env.example
│   ├── data/
│   │   ├── messages/         ← Created manually (mkdir -p)
│   │   └── uploads/          ← Created manually (mkdir -p)
│   ├── sockets/
│   ├── controllers/
│   ├── utils/
│   └── package.json
│
└── README.md
```

---

## 🛠️ Available Scripts

### Server (`cd server`)

| Script | Command | Description |
| :--- | :--- | :--- |
| Development | `npm run dev` | Starts server with nodemon (auto-restarts on changes) |
| Production | `npm start` | Starts server without nodemon |

### Client (`cd client`)

| Script | Command | Description |
| :--- | :--- | :--- |
| Development | `npm run dev` | Starts Vite dev server with HMR |
| Build | `npm run build` | Compiles production bundle to `dist/` |
| Preview | `npm run preview` | Previews the production build locally |

---

## 🐛 Troubleshooting

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::3001
```

Find and kill the process using the port:

```bash
# macOS / Linux
lsof -ti:3001 | xargs kill

# Windows (PowerShell)
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

Or change the port in `server/.env` and update `client/.env` to match.

---

### Client can't connect to server (CORS error)

Check that `CLIENT_URL` in `server/.env` exactly matches the URL shown in your Vite output (including the port):

```env
# server/.env
CLIENT_URL=http://localhost:5173
```

If you're accessing from another device on the same network, replace `localhost` with your machine's local IP (e.g. `192.168.x.x`).

---

### Socket.io connection refused

Ensure the server is running before starting the client. Check `VITE_SERVER_URL` in `client/.env` matches the server port:

```env
# client/.env
VITE_SERVER_URL=http://localhost:3001
```

---

### `data/messages/` or `data/uploads/` missing

```
Error: ENOENT: no such file or directory, open 'data/messages/room_general.json'
```

Run the directory setup step again:

```bash
cd server
mkdir -p data/messages data/uploads
```

---

### `node_modules` missing or corrupted

Delete and reinstall:

```bash
# Server
cd server
rm -rf node_modules package-lock.json
npm install

# Client
cd ../client
rm -rf node_modules package-lock.json
npm install
```

---

### Vite HMR not updating

Hard refresh the browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows/Linux) or restart the Vite dev server.

---

## 🔗 Useful Links

- [Socket.io Docs](https://socket.io/docs/v4/)
- [Vite Docs](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Howler.js Docs](https://howlerjs.com/)
- [Node.js fs module](https://nodejs.org/api/fs.html)

---

> See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch strategy and commit conventions.
