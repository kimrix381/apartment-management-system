import express from "express";
import Notice from "../models/notice.js";
import authenticateToken from "../middleware/authmiddlware.js";
import isAdmin from "../middleware/isadmin.js";

const router = express.Router();

// POST - Admin posts a new notice
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const newNotice = new Notice({
      message,
      postedBy: req.user.id,
    });

    const savedNotice = await newNotice.save();
    res.status(201).json(savedNotice);
  } catch (error) {
    console.error("Error posting notice:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET - All users see all notices
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
