
/* =========================================================
   AYNA BOOK
   Secure Node.js Backend Server
   Express + Socket.IO + Firebase Admin
   ========================================================= */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import admin from "firebase-admin";

const app = express();
const server = http.createServer(app);

// AYNA BOOK Website
const ALLOWED_ORIGIN =
  "https://ayna-book.github.io";

// Firebase Admin initialization
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

// CORS configuration
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ["GET", "POST"]
}));

app.use(express.json({
  limit: "10kb"
}));

// Socket.IO server
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    app: "AYNA BOOK",
    server: "Running",
    version: "1.0.0"
  });
});

// Firebase Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Authentication required.")
      );
    }

    const decodedToken =
      await admin.auth().verifyIdToken(token);

    socket.user = decodedToken;

    next();

  } catch (error) {
    console.error(
      "AYNA BOOK Authentication Error:",
      error.message
    );

    next(
      new Error("Invalid authentication.")
    );
  }
});

// Authenticated connections
io.on("connection", (socket) => {
  const user = socket.user;

  console.log(
    "AYNA BOOK User Connected:",
    user.uid
  );

  socket.join("global");

  let lastMessageTime = 0;

  // Receive and save chat message
  socket.on("send_message", async (data, callback) => {
    const reply =
      typeof callback === "function"
        ? callback
        : () => {};

    try {
      const now = Date.now();

      // Basic rate limit
      if (now - lastMessageTime < 1000) {
        return reply({
          success: false,
          message: "একটু অপেক্ষা করে আবার পাঠান।"
        });
      }

      lastMessageTime = now;

      const text = String(
        data?.text || ""
      ).trim();

      if (!text || text.length > 2000) {
        return reply({
          success: false,
          message: "মেসেজ ১ থেকে ২০০০ অক্ষরের মধ্যে লিখুন।"
        });
      }

      const message = {
        text,
        senderId: user.uid,
        senderEmail: user.email || "",
        createdAt:
          admin.firestore.FieldValue.serverTimestamp()
      };

      const messageRef = await db
        .collection("rooms")
        .doc("global")
        .collection("messages")
        .add(message);

      io.to("global").emit("new_message", {
        id: messageRef.id,
        text,
        senderId: user.uid,
        senderEmail: user.email || "",
        createdAt: new Date().toISOString()
      });

      reply({
        success: true,
        message: "মেসেজ পাঠানো হয়েছে।",
        id: messageRef.id
      });

    } catch (error) {
      console.error(
        "AYNA BOOK Message Error:",
        error
      );

      reply({
        success: false,
        message: "মেসেজ পাঠানো যায়নি।"
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(
      "AYNA BOOK User Disconnected:",
      user.uid
    );
  });
});

// Start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `AYNA BOOK Backend running on port ${PORT}`
  );
});
