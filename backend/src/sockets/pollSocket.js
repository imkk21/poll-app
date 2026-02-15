import Poll from "../models/Poll.js";
import { checkVoteRateLimit } from "../middleware/rateLimit.js";

export const initSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("join_poll", (pollId) => {
      socket.join(pollId);
    });

    socket.on("vote", async ({ pollId, optionId, voterId }) => {
      try {
        const poll = await Poll.findById(pollId);

        if (!poll) {
          socket.emit("vote_error", "Poll not found");
          return;
        }

        // 🔒 poll closed → hard block
        if (!poll.isActive) {
          socket.emit("vote_error", "Poll is closed");
          return;
        }

        // 🔒 one vote per voterId
        if (poll.voters.includes(voterId)) {
          socket.emit("vote_error", "You already voted");
          return;
        }

        // 🔒 IP rate limiting (USING rateLimit.js ✅)
        const ip = socket.handshake.address;
        const allowed = checkVoteRateLimit(pollId, ip);

        if (!allowed) {
          socket.emit(
            "vote_error",
            "Too many votes from this IP. Please wait."
          );
          return;
        }

        const option = poll.options.find(o => o.optionId === optionId);
        if (!option) {
          socket.emit("vote_error", "Invalid option");
          return;
        }

        // ✅ apply vote
        option.votes += 1;
        poll.voters.push(voterId);
        await poll.save();

        // 🔔 real-time update
        io.to(pollId).emit("poll_update", poll);

      } catch (err) {
        socket.emit("vote_error", "Server error");
      }
    });
  });
};