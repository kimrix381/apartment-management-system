import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Use .js extension for local imports

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role });
    res.status(201).json({ message: "User created" });
    //   } catch (err) {
    //     res
    //       .status(500)
    //       .json({ message: "Registration failed", error: err.message });
    //   }
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
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

export default router;
