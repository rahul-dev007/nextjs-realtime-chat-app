// socket/socketServer.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"], // frontend URL
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.user.name);

    // User joins room by ID
    socket.join(socket.user._id.toString());

    // Receive message event
    socket.on("sendMessage", ({ to, message }) => {
      io.to(to).emit("receiveMessage", {
        from: socket.user._id,
        message,
        senderName: socket.user.name,
        createdAt: new Date(),
      });
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.user.name);
    });
  });
};

module.exports = { initSocket };
