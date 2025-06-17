// import { Server } from "socket.io";
// import http from "http";
// import express from "express";

// const app = express();
// const server = http.createServer(app);


// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://chatapp-frontend-new.netlify.app"
//     ],
//     credentials: true, 
//   },
// });

// // Used to store online users
// const userSocketMap = {}; // {userId: socketId}

// // ✅ Function to get receiver's socket id
// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

// io.on("connection", (socket) => {
//   console.log("A user connected", socket.id);

//   const userId = socket.handshake.query.userId;
//   if (userId) userSocketMap[userId] = socket.id;

//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("A user disconnected", socket.id);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { io, app, server };

import { Server } from "socket.io";
import http from "http";
import express from "express";
import cookie from "cookie";
import jwt from "jsonwebtoken";

// Create express app and server
const app = express();
const server = http.createServer(app);

// Create a map to track online users
const userSocketMap = {}; // { userId: socketId }

// ✅ Utility function to get socket ID of a receiver
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// ✅ Socket.IO instance with CORS and credentials enabled
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chatapp-frontend-new.netlify.app"
    ],
    credentials: true,
  },
});

// ✅ Middleware to authenticate socket connection using JWT in cookies
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;

    if (!token) {
      return next(new Error("Unauthorized: No token"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    return next(new Error("Unauthorized"));
  }
});

// ✅ Handle WebSocket connection
io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`✅ User connected: ${userId} (${socket.id})`);

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // ✅ Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId} (${socket.id})`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };

