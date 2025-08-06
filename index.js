const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const { createServer } = require("http");
const { Server } = require("socket.io");

// --- Route Imports ---
const userRoute = require('./routes/user.route');
const gigRoute = require('./routes/gig.route');
const orderRoute = require('./routes/order.route');
const conversationRoute = require('./routes/conversion.route');
const messageRoute = require('./routes/message.route');
const reviewRoute = require('./routes/review.route');
const authRoute = require('./routes/auth.route');

const PORT = process.env.PORT || 4000;
const app = express();

// --- Express App Setup ---
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: [
    "https://freelance-hub-frontend-ten.vercel.app", 
  ],
  credentials: true // if you are using cookies or auth
}));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(error => console.error("MongoDB connection error:", error));

// --- API Routes ---
app.use('/api/auths', authRoute);
app.use('/api/users', userRoute);
app.use('/api/gigs', gigRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.get('/read', (req,res)=>{
  res.send("Hello ")
})
// --- Socket.IO Integration ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://freelance-hub-frontend-ten.vercel.app",
  },
});


let onlineUsers = [];

const addUser = (userId, socketId) => {
  if (userId && !onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
    console.log(`[Socket.IO] User added: ${userId}. Total online: ${onlineUsers.length}`);
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  console.log(`[Socket.IO] User disconnected. Total online: ${onlineUsers.length}`);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

// Listen for new connections from clients
io.on("connection", (socket) => {
  // A user connects and sends their ID
  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  // A user sends a message, and we forward it to the receiver
  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log(`[Socket.IO] sendMessage event received. Attempting to send to receiver: ${receiverId}`);
    const receiver = getUser(receiverId);
    
    if (receiver) {
      console.log(`[Socket.IO] SUCCESS: Receiver found. Emitting 'getMessage' to socket ${receiver.socketId}`);
      io.to(receiver.socketId).emit("getMessage", data);
    } else {
      console.log(`[Socket.IO] FAILED: Receiver ${receiverId} is not online or not found.`);
    }
  });

  // A user disconnects
  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  const errStatus = err.status || 500;
  const errMessage = err.message || "Something went wrong!";
  return res.status(errStatus).send(errMessage);
});

// --- Start Server ---
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});