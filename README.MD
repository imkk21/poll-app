# 🗳️ Real-Time Poll Rooms

A full-stack real-time polling web application where users can create polls, share links, and see live results update instantly across all connected clients.

---

## 🚀 Live Demo

- **Frontend:** https://poll-app-inky.vercel.app  
- **Backend:** https://poll-backend-bxqr.onrender.com  

---

## ✨ Features

### Core Functionality
- Create polls with a question and multiple options
- Shareable poll links (accessible across devices)
- Vote on polls in real time
- Live result updates using WebSockets
- Close polls (instantly disables voting for everyone)
- Persistent data storage using MongoDB

### UI / UX
- Modern responsive UI built with **React + Tailwind CSS**
- Smooth animations using **Framer Motion**
- Toast notifications for feedback (vote recorded, errors, copy link, etc.)
- Optimistic UI for instant vote feedback

---

## 🧠 Fairness & Anti-Abuse Mechanisms

### 1️⃣ One-Vote-Per-User (Client + Server Enforcement)
- Each user is assigned a unique `voterId` stored in `localStorage`
- The backend keeps track of voters per poll
- Any duplicate voting attempts are rejected by the server
- Frontend disables further voting after server confirmation

✔ Prevents repeat voting from the same user  
✔ Works across refreshes and sessions  

---

### 2️⃣ Rate Limiting (IP-Based)
- A backend middleware limits how frequently votes can be submitted from the same IP address
- Prevents vote spamming or automated abuse
- Returns proper error responses when limits are exceeded

✔ Protects against rapid or scripted vote flooding  

---

## 🔄 Real-Time Architecture

- **Socket.IO** is used for real-time communication
- Clients join a poll-specific room
- On every vote or poll closure:
  - Backend updates the database
  - Emits a `poll_update` event
  - All connected clients receive synchronized updates instantly

Optimistic UI updates are used for responsiveness, but **server state always remains the source of truth**.

---

## ⚠️ Edge Cases Handled

- Poll not found (invalid or deleted poll link)
- Voting on a closed poll
- Multiple rapid vote clicks from the same user
- Socket disconnects / reconnects
- Page refresh after voting (vote state persists)
- Directly opening shared poll links (SPA routing handled on deployment)

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- Custom rate-limiting middleware

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

---

## 📂 Project Structure

```
poll-app/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   └── server.js
│   └── .env (ignored)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── components/
│   └── vercel.json
│
└── README.md
```

---

## ▶️ Running Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📌 Notes

- All environment variables are excluded from version control
- No third-party polling libraries were used
- All logic was implemented manually to ensure originality and correctness

---

## 👤 Author

**Kunal Kumar**  
Full-Stack Developer

---
