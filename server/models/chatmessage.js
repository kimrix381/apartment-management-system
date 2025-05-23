// models/chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    sender: String, // house number
    text: String,
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
