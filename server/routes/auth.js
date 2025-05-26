import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Use .js extension for local imports
import authenticateToken from "../middleware/authmiddlware.js";
import isAdmin from "../middleware/isadmin.js"; // Use .js extension for local imports

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, houseNumber } = req.body;

    if (role === "tenant") {
      if (!houseNumber) {
        return res
          .status(400)
          .json({ message: "House number is required for tenants" });
      }

      const existingTenant = await User.findOne({ houseNumber });
      if (existingTenant) {
        return res
          .status(400)
          .json({ message: "House number already assigned" });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      houseNumber,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        houseNumber: user.houseNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "User created", token });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        houseNumber: user.houseNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        houseNumber: user.houseNumber,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

router.get("/tenants", authenticateToken, async (req, res) => {
  try {
    const tenants = await User.find({ role: "tenant" });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete tenant by ID
router.delete("/tenants/:id", authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Tenant deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

router.post("/assign", authenticateToken, isAdmin, async (req, res) => {
  const { houseNumber, amount } = req.body;
  if (!houseNumber || !amount)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const tenant = await User.findOne({ houseNumber });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    tenant.rent = amount;
    await tenant.save();
    res.json({ message: "Rent assigned successfully" });
  } catch (err) {
    console.error("Error assigning rent:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/tenants
router.get("/tenants", authenticateToken, isAdmin, async (req, res) => {
  try {
    const tenants = await User.find({ role: "tenant" }).select("houseNumber");
    res.json(tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ error: "Server error" });
  }
});
