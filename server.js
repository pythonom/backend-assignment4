require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const noteRoutes = require("./routes/noteRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import Socket.IO chat
const configureChat = require("./sockets/chat");

const app = express();

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Secure Connect Server is Running");
});

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO to HTTP server
const io = new Server(server);

// Configure chat functionality
configureChat(io);

// Server port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Socket.IO is ready");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

startServer();
