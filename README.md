# 📡 Connectly — Real-Time Multi-Room Communication Platform (Group 53)

## 🏷️ Project Charter Snapshot

- **Course:** CSCI 2020U
- **Group:** 53
- **Product Name:** Connectly
- **Project Members:** Dhruv Thakar, Ayush K., Aaryan Kulkarni

## 🚀 Overview

Connectly is a real-time, multi-room communication platform designed to support multiple concurrent clients with synchronized shared state.

Unlike a basic chat application, Connectly extends functionality into a distributed real-time system, enabling collaborative features, persistent data, and advanced user interaction layers.

## 🔥 Key Features (Level-Up)

### 💬 Real-Time Multi-Room Chat
- Join or create chat rooms dynamically
- Instant message broadcasting using WebSockets
- Supports multiple concurrent users across rooms

### 🧠 Live Collaborative Whiteboard (Core Level-Up Feature)
- Shared drawing canvas across all users in a room
- Real-time synchronization of drawing events
- Demonstrates multi-client state consistency

### 💾 Persistent Chat History (File I/O)
- Messages stored using Node.js `fs` module (JSON)
- Chat history loads when users join a room
- Rooms maintain state across server restarts

### 👤 User Presence System
- Tracks active users in each room
- Displays:
  - Online/offline status
  - Typing indicators
  - Real-time updates across all clients

### 📁 File & Media Sharing
- Upload and share images/files within rooms
- Broadcast file metadata to all connected users
- Stored locally using file-based persistence

### 🔐 Private Messaging & Roles (Optional Enhancement)
- Direct messaging between users
- Role-based permissions (admin/moderator)
- Moderation tools (kick/ban users)

## 🧱 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Real-Time Communication | Socket.io (WebSockets) |
| Persistence | Node.js `fs` module (JSON storage) |
| Audio/UX Enhancements | Howler.js |

## ⚙️ System Architecture

Connectly uses an event-driven architecture:

- Clients communicate with the server via Socket.io
- Server handles:
  - Room management
  - Message broadcasting
  - State synchronization
- File system stores:
  - Chat history
  - Room metadata
- All updates are propagated in real-time to connected clients

## 🔄 Core Concepts Demonstrated

This project demonstrates:

- Concurrent client handling
- Real-time bidirectional communication
- Shared state synchronization
- Event-driven system design
- File-based persistence (I/O)
- Scalable room-based architecture

## 📂 Project Structure

```text
Connectly/
├── client/               # React frontend
│   ├── components/       # UI components
│   ├── pages/            # Chat + whiteboard views
│   └── services/         # Socket client logic
│
├── server/               # Node.js backend
│   ├── sockets/          # Socket.io event handlers
│   ├── controllers/      # Chat + room logic
│   ├── data/             # JSON storage (messages, rooms)
│   └── utils/            # File I/O helpers
│
└── README.md
```

## 🧪 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/your-repo/connectly.git
cd connectly
```

### 2. Install dependencies
**Server**
```bash
cd server
npm install
```

**Client**
```bash
cd ../client
npm install
```

### 3. Start the application
**Start server**
```bash
cd server
npm run dev
```

**Start client**
```bash
cd ../client
npm run dev
```

### 4. Open in browser
`http://localhost:5173`

## 📌 Future Improvements

- WebRTC for voice/video chat
- Database integration (MongoDB / Firebase)
- Authentication system (JWT)
- Cloud file storage (AWS S3 / Firebase Storage)
- Scalable deployment (Docker + cloud hosting)

## 👥 Team

- Dhruv Thakar — Server Architecture, Persistence, Multi-client Handling
- Ayush K. — Socket Networking, Documentation
- Aaryan Kulkarni — Frontend UI/UX, Whiteboard, Interaction Features

## 🤝 Team Work Contract

- **Communication Channel:** Discord
- **Meeting Schedule:** Every Tuesday after lecture
- **Conflict Resolution:** If team members do not contribute to assigned tasks, we will contact the instructor immediately. All team members are also responsible to enable other members to execute their contributions (for example, pushing required code and updates).

## 3. Work Division & Contribution Report

*Note: The "Actual Contribution" column should be updated at the time of final submission. You may edit the "Task" column to reflect your own tasks.*

| Task / Module | Assigned Member (Plan) | Actual Contribution (Final) |
| :--- | :--- | :--- |
| **Multi-threaded Server** | Dhruv Thakar | [Summary of work done] |
| **Socket Networking** | Ayush K. | [Summary of work done] |
| **GUI Implementation** | Aaryan Kulkarni | [Summary of work done] |
| **Persistence (File I/O)** | Dhruv Thakar | [Summary of work done] |
| **UX/Sound Effects** | Aaryan Kulkarni | [Summary of work done] |
| **Documentation/README** | Ayush K. | [Summary of work done] |

## 📊 Contribution Statement

Final contribution status will be determined at submission based on actual work completed by each team member.

## 4. Final Contribution Status (Tag one at Final Submission)

At the end of the project, the team must agree on one of the following tags:

* **[ ] (1) EVEN CONTRIBUTION:** All members met expectations from the original charter.
* **[ ] (2) UNEVEN CONTRIBUTION:** One or more members did not meet expectations.

*Note: Graders will use the "Actual Contribution" column above to apply uneven grades if necessary.*

## 💥 Why This README Works

This version:

- Clearly shows "level-up" complexity
- Uses technical language profs look for
- Emphasizes multi-client systems (key requirement)
- Makes your project sound like a distributed system, not a chat app
