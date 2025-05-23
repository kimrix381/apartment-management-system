// routes/chat.js
import express from "express";
import Chat from "../models/chatmessage.js";

const router = express.Router();

// Get all chat messages
router.get("/", async (req, res) => {
  try {
    const messages = await Chat.find().sort({ createdAt: 1 }); // oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save a new message
router.post("/", async (req, res) => {
  try {
    const { sender, text } = req.body;
    const chat = await Chat.create({ sender, text });
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
