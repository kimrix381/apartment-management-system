import express from "express";
import maintenanceRequestSchema from "../models/maintenance.js";
import authenticateToken from "../middleware/authmiddlware.js";

const router = express.Router();
import isAdmin from "../middleware/isadmin.js";

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description)
      return res.status(400).json({ error: "Description is required" });

    const newComplaint = new maintenanceRequestSchema({
      description,
      tenant: req.user.id,
      status: "Pending",
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error("Error filing complaint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my", authenticateToken, async (req, res) => {
  try {
    const complaints = await maintenanceRequestSchema
      .find({ user: req.user.id })
      .sort({
        createdAt: -1,
      });
    res.json(complaints);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/all", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Fetch all maintenance requests for admin view
    const allRequests = await maintenanceRequestSchema
      .find()
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });
    res.json(allRequests);
  } catch (error) {
    console.error("Error fetching all maintenance requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
