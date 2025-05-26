import express from "express";
import authenticateToken from "../middleware/authmiddlware.js";
import isAdmin from "../middleware/isadmin.js";
import Rent from "../models/rent.js"; // Make sure you have a Rent model

const router = express.Router();

// POST /api/rent/assign
router.post("/assign", authenticateToken, isAdmin, async (req, res) => {
  const { houseNumber, amount } = req.body;

  if (!houseNumber || !amount) {
    return res
      .status(400)
      .json({ error: "House number and amount are required" });
  }

  try {
    // Optional: Update if it already exists, otherwise create
    const rent = await Rent.findOneAndUpdate(
      { houseNumber },
      { amount },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: "Rent assigned", rent });
  } catch (err) {
    console.error("Error assigning rent:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my", authenticateToken, async (req, res) => {
  try {
    const rent = await Rent.findOne({ houseNumber: req.user.houseNumber });
    if (!rent) {
      return res
        .status(404)
        .json({ error: "Rent not found for your house number" });
    }
    res.json(rent);
  } catch (error) {
    console.error("Error fetching rent:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
