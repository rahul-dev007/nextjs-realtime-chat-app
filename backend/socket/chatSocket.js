const Message = require("../models/Message");
let onlineUsers = [];

exports.initializeChatSocket = (io) => {
  io.on("connection", async (socket) => {
    console.log("New client connected:", socket.id);

    // Add user to online list
    onlineUsers.push(socket.id);
    io.emit("onlineUsers", onlineUsers);

    // Load last 50 messages from MongoDB
    const messages = await Message.find().sort({ createdAt: 1 }).limit(50).populate("user", "name");
    socket.emit("loadMessages", messages);

    socket.on("sendMessage", async (data) => {
      const { userId, content } = data;
      const msg = await Message.create({ user: userId, content });
      const populatedMsg = await msg.populate("user", "name");
      io.emit("message", populatedMsg);
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter((id) => id !== socket.id);
      io.emit("onlineUsers", onlineUsers);
      console.log("Client disconnected:", socket.id);
    });
  });
};
