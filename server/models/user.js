import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "tenant"], default: "tenant" },
  houseNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple nulls (important if admin doesn't have a house)
  },
});

const User = mongoose.model("User", userSchema);

export default User;
