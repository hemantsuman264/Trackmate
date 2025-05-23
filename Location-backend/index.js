import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import mongoose from "mongoose";
import User from "./models/user.js"

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origin
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// 🔥 Online users tracking
const onlineUsers = new Map();

// SOCKET.IO 👇
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendLocation", ({ coords, userId, username }) => {
    // Add or update user in onlineUsers map
    onlineUsers.set(userId, { userId, username, socketId: socket.id });

    // Broadcast location to other users
    socket.broadcast.emit("receiveLocation", { coords, userId, username });

    // Broadcast the full list of online users to everyone
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });

  // Handle SOS alert
  socket.on("sosAlert", ({ userId }) => {
    console.log(`SOS from ${userId}`);
    socket.broadcast.emit("receiveSOS", { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Remove user from onlineUsers map
    for (let [userId, user] of onlineUsers.entries()) {
      if (user.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    // Broadcast updated online users list
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });
});

app.get("/", (req, res) => {
  res.send("Location backend is running!");
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
