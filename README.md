# 📡 Connectly — Real-Time Multi-Room Communication Platform

> A distributed real-time system supporting multiple concurrent clients with synchronized shared state, collaborative tooling, and persistent data.

[![Course](https://img.shields.io/badge/Course-CSCI%202020U-blue?style=flat-square)](.)
[![Group](https://img.shields.io/badge/Group-53-purple?style=flat-square)](.)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Socket.io-green?style=flat-square)](.)

---

## 🏷️ Project Charter

| Field | Details |
| :--- | :--- |
| **Course** | CSCI 2020U |
| **Group** | 53 |
| **Product Name** | Connectly |
| **Members** | Dhruv Thakar, Ayush K., Aaryan Kulkarni |

---

## 🚀 Overview

Connectly is a **real-time, multi-room communication platform** designed to handle multiple concurrent clients with synchronized shared state.

Unlike a basic chat application, Connectly is architected as a **distributed real-time system** — featuring a collaborative whiteboard, live user presence, persistent message history, and file sharing. Every design decision emphasizes multi-client consistency, event-driven communication, and scalable room-based architecture.

---

## 🔥 Features

### 💬 Real-Time Multi-Room Chat
- Dynamically join or create chat rooms
- Instant message broadcasting via WebSockets
- Supports many concurrent users across independent rooms

### 🧠 Live Collaborative Whiteboard *(Core Level-Up Feature)*
- Shared drawing canvas synchronized across all users in a room
- Real-time drawing event propagation
- Demonstrates true multi-client shared state consistency

### 💾 Persistent Chat History *(File I/O)*
- Messages written to disk using Node.js `fs` module (JSON format)
- Chat history reloaded when users join a room
- State persists across server restarts

### 👤 User Presence System
- Tracks active users per room in real-time
- Displays online/offline status, typing indicators, and join/leave events
- All presence updates broadcast instantly to every connected client

### 📁 File & Media Sharing
- Upload and share images/files within a room
- File metadata broadcast to all connected users
- Files stored locally with file-based persistence

### 🔐 Private Messaging & Roles *(Optional Enhancement)*
- Direct messaging between users
- Role-based permissions (admin / moderator)
- Moderation tools: kick and ban users

---

## 🧱 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Real-Time Communication** | Socket.io (WebSockets) |
| **Persistence** | Node.js `fs` module (JSON storage) |
| **Audio / UX Enhancements** | Howler.js |

---

## ⚙️ System Architecture

Connectly uses an **event-driven architecture** built around Socket.io:

```
Clients  ←──── WebSocket (Socket.io) ────→  Server
                                               │
                                  ┌────────────┼────────────┐
                                  │            │            │
                             Room Mgmt    Broadcast    State Sync
                                  │
                             File System
                          (JSON — chat history,
                            room metadata)
```

- Clients communicate with the server over persistent WebSocket connections
- The server manages room state, routes messages, and synchronizes drawing events
- File system provides lightweight persistence without a database dependency
- All state mutations propagate in real-time to every connected client in the room

---

## 🔄 Core Concepts Demonstrated

| Concept | Implementation |
| :--- | :--- |
| Concurrent client handling | Multi-room Socket.io server |
| Bidirectional communication | WebSocket event emitters / listeners |
| Shared state synchronization | Whiteboard canvas + presence system |
| Event-driven design | Socket.io event architecture |
| File-based persistence (I/O) | Node.js `fs` module, JSON storage |
| Scalable room architecture | Dynamic room creation and management |

---

## 📂 Project Structure

```
Connectly/
├── client/                  # React frontend
│   ├── components/          # Reusable UI components
│   ├── pages/               # Chat view + Whiteboard view
│   └── services/            # Socket.io client logic
│
├── server/                  # Node.js backend
│   ├── sockets/             # Socket.io event handlers
│   ├── controllers/         # Chat + room business logic
│   ├── data/                # JSON storage (messages, rooms)
│   └── utils/               # File I/O helpers
│
└── README.md
```

---

## 🧪 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/connectly.git
cd connectly
```

### 2. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 3. Start the application

Open two terminal windows:

```bash
# Terminal 1 — Start server
cd server
npm run dev
```

```bash
# Terminal 2 — Start client
cd client
npm run dev
```

### 4. Open in browser

```
http://localhost:5173
```

---

## 📌 Future Improvements

- [ ] **WebRTC** — voice and video chat between users
- [ ] **Database integration** — MongoDB or Firebase for scalable persistence
- [ ] **Authentication** — JWT-based login and session management
- [ ] **Cloud file storage** — AWS S3 or Firebase Storage
- [ ] **Scalable deployment** — Docker containerization + cloud hosting

---

## 👥 Team

| Member | Role | Responsibilities |
| :--- | :--- | :--- |
| **Dhruv Thakar** | Server & Persistence Lead | Multi-threaded server architecture, file I/O persistence, multi-client handling |
| **Ayush K.** | Networking & Documentation Lead | Socket.io networking, README and documentation |
| **Aaryan Kulkarni** | Frontend & UX Lead | React UI, collaborative whiteboard, UX and sound effects |

---

## 🤝 Team Work Contract

| Item | Agreement |
| :--- | :--- |
| **Communication** | Discord |
| **Meeting Schedule** | Every Tuesday after lecture |
| **Conflict Resolution** | If a member does not contribute to assigned tasks, the team will contact the instructor immediately. All members are responsible for enabling others to execute their work (e.g. pushing required code and updates on time). |

---

## 📋 Work Division & Contribution Report

> **Note:** The *Actual Contribution* column must be updated at final submission.

| Task / Module | Assigned Member | Actual Contribution (Final) |
| :--- | :--- | :--- |
| **Multi-threaded Server** | Dhruv Thakar | *[To be completed at submission]* |
| **Socket Networking** | Ayush K. | *[To be completed at submission]* |
| **GUI Implementation** | Aaryan Kulkarni | *[To be completed at submission]* |
| **Persistence (File I/O)** | Dhruv Thakar | *[To be completed at submission]* |
| **UX / Sound Effects** | Aaryan Kulkarni | *[To be completed at submission]* |
| **Documentation / README** | Ayush K. | *[To be completed at submission]* |

---

## 📊 Final Contribution Status

> Tag one at final submission. Graders will use the *Actual Contribution* column above to apply uneven grades if applicable.

- [ ] **(1) EVEN CONTRIBUTION** — All members met expectations from the original charter.
- [ ] **(2) UNEVEN CONTRIBUTION** — One or more members did not meet expectations.
