import { io } from "socket.io-client";

export const socket = io("https://poll-backend-bxqr.onrender.com", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});