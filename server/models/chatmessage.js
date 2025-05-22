import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: { type: String },
  text: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

export default ChatMessage;
