// server.js - entrypoint

require('dotenv').config();
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeChatSocket } = require('./socket/chatSocket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const server = http.createServer(app);

// ✅ Connect Database First
connectDB();

// ✅ Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Health Check Route
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ✅ Initialize Socket.io
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// ✅ Initialize Chat Socket (custom socket logic)
initializeChatSocket(io);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
