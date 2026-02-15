import express from "express";
import { v4 as uuidv4 } from "uuid";
import Poll from "../models/Poll.js";

const router = express.Router();

// Create poll
router.post("/", async (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ message: "Invalid poll data" });
  }

  const formattedOptions = options.map(text => ({
    optionId: uuidv4(),
    text,
    votes: 0
  }));

  const poll = await Poll.create({
    question,
    options: formattedOptions,
    voters: []
  });

  res.status(201).json(poll);
});

// Get poll
router.get("/:id", async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Poll not found" });
  res.json(poll);
});

// ✅ Close poll + emit socket update
router.post("/:id/close", async (req, res) => {
  const poll = await Poll.findById(req.params.id);
  if (!poll) return res.status(404).json({ message: "Poll not found" });

  poll.isActive = false;
  await poll.save();

  // 🔔 notify all connected clients instantly
  const io = req.app.get("io");
  io.to(poll._id.toString()).emit("poll_update", poll);

  res.json({ message: "Poll closed" });
});

export default router;