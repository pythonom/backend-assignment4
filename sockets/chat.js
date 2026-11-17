const jwt = require("jsonwebtoken");
const User = require("../models/User");

const configureChat = (io) => {
  // Authenticate every Socket.IO connection
  io.use(async (socket, next) => {
    try {
      // Get JWT from connection handshake
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find authenticated user
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user to socket
      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // Handle authenticated connections
  io.on("connection", (socket) => {
    console.log(socket.user.name, "connected to chat");

    // Listen for chat messages
    socket.on("chatMessage", (data) => {
      if (
        !data ||
        typeof data.message !== "string" ||
        !data.message.trim() ||
        data.message.length > 1000
      ) {
        return socket.emit("chatError", {
          message: "Invalid message.",
        });
      }

      const messageData = {
        sender: socket.user.name,
        message: data.message.trim(),
        time: new Date(),
      };

      console.log("New Message:", messageData);

      // Broadcast message to all connected users
      io.emit("receiveMessage", messageData);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(socket.user.name, "disconnected from chat");
    });
  });
};

module.exports = configureChat;
