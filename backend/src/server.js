import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import pollRoutes from "./routes/pollRoutes.js";
import { initSocket } from "./sockets/pollSocket.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

// 🔑 make io accessible in routes
app.set("io", io);

app.use(cors());
app.use(express.json());

app.use("/api/polls", pollRoutes);

initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);