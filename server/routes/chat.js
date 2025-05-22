import express from "express";
import ChatMessage from "../models/chatmessage.js"; // Ensure the .js extension

const router = express.Router();

// GET chat history
router.get("/", async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch messages", error: err.message });
  }
});

// POST new message
router.post("/", async (req, res) => {
  try {
    const { sender, text } = req.body;
    const message = await ChatMessage.create({ sender, text });
    res.status(201).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
});

export default router;
