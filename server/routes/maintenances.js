import express from "express";
import MaintenanceRequest from "../models/maintenance.js";
import authenticateToken from "../middleware/authmiddlware.js";

const router = express.Router();
import isAdmin from "../middleware/isadmin.js";

router.post("/", authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    const houseNumber = req.user.houseNumber;
    if (!description)
      return res.status(400).json({ error: "Description is required" });

    const newComplaint = new MaintenanceRequest({
      description,
      tenant: req.user.id,
      status: "Pending",
      houseNumber,
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
    const complaints = await MaintenanceRequest.find({
      user: req.user.id,
    }).sort({
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
    const allRequests = await MaintenanceRequest.find()
      .populate("tenant", "name email")
      .sort({ createdAt: -1 });
    res.json(allRequests);
  } catch (error) {
    console.error("Error fetching all maintenance requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

router.get("/:houseNumber", authenticateToken, async (req, res) => {
  try {
    const houseNumber = req.params.houseNumber;
    const maintenanceRequests = await MaintenanceRequest.find({ houseNumber });
    res.json(maintenanceRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {
    const maintenanceRequests = await MaintenanceRequest.find({
      houseNumber: req.user.houseNumber, // ✅ only this tenant's
    });

    res.json(maintenanceRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const deleted = await MaintenanceRequest.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting request:", err);
    res.status(500).json({ error: "Server error" });
  }
});
