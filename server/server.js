import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import maintenanceRoutes from "./routes/maintenances.js";
import noticeRoutes from "./routes/notices.js";
import chatRoutes from "./routes/chat.js";
import axios from "axios";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
// const API = import.meta.env.VITE_SERVER_URL;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("new_chat", (msg) => io.emit("new_chat", msg));
});

// socket.on("new_notice", (notice) => io.emit("new_notice", notice));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
