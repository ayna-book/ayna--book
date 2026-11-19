// =========================================================
// AYNA BOOK
// Node.js Backend Server
// Express + Socket.IO + Firebase Admin
// =========================================================

"use strict";

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const admin = require("firebase-admin");


// =========================================================
// Firebase Admin Initialization
// =========================================================

try {

  if (!admin.apps.length) {

    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });

  }

  console.log(
    "AYNA BOOK — Firebase Admin initialized."
  );

} catch (error) {

  console.error(
    "AYNA BOOK Firebase Admin Error:",
    error
  );

  process.exit(1);

}


const db = admin.firestore();


// =========================================================
// Express Application
// =========================================================

const app = express();

const server = http.createServer(app);


// =========================================================
// CORS
// =========================================================

const ALLOWED_ORIGINS = [
  "https://ayna-book.github.io"
];

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: [
      "GET",
      "POST",
      "OPTIONS"
    ]
  })
);


app.use(
  express.json({
    limit: "10kb"
  })
);


// =========================================================
// Health Check
// =========================================================

app.get(
  "/",
  (req, res) => {

    res.json({
      success: true,
      name: "AYNA BOOK",
      service: "Backend Server",
      status: "online",
      version: "1.0.0"
    });

  }
);


app.get(
  "/health",
  (req, res) => {

    res.status(200).json({
      success: true,
      status: "healthy"
    });

  }
);


// =========================================================
// Socket.IO
// =========================================================

const io = new Server(
  server,
  {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: [
        "GET",
        "POST"
      ]
    }
  }
);


// =========================================================
// Socket Authentication
// =========================================================

io.use(
  async (socket, next) => {

    try {

      const token =
        socket.handshake.auth?.token;


      if (!token) {

        return next(
          new Error(
            "Authentication token required."
          )
        );

      }


      const decodedToken =
        await admin
          .auth()
          .verifyIdToken(token);


      socket.user = decodedToken;


      next();


    } catch (error) {

      console.error(
        "AYNA BOOK Socket Authentication Error:",
        error
      );


      next(
        new Error(
          "Authentication failed."
        )
      );

    }

  }
);


// =========================================================
// Connected Users
// =========================================================

io.on(
  "connection",
  (socket) => {

    console.log(
      "AYNA BOOK Socket Connected:",
      socket.user.uid
    );


    // -----------------------------------------------------
    // Join Global Chat
    // -----------------------------------------------------

    socket.join("global");


    // -----------------------------------------------------
    // Rate Limit
    // -----------------------------------------------------

    let lastMessageTime = 0;


    // -----------------------------------------------------
    // Receive Message
    // -----------------------------------------------------

    socket.on(
      "send_message",
      async (payload) => {

        try {

          const now =
            Date.now();


          // প্রতি ১ সেকেন্ডে সর্বোচ্চ ১টি message
          if (
            now - lastMessageTime < 1000
          ) {

            socket.emit(
              "server_error",
              {
                message:
                  "খুব দ্রুত message পাঠানো হচ্ছে। একটু অপেক্ষা করুন।"
              }
            );

            return;

          }


          lastMessageTime = now;


          const text =
            String(
              payload?.text || ""
            ).trim();


          if (!text) {

            socket.emit(
              "server_error",
              {
                message:
                  "Message লিখুন।"
              }
            );

            return;

          }


          if (text.length > 2000) {

            socket.emit(
              "server_error",
              {
                message:
                  "Message সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।"
              }
            );

            return;

          }


          const roomId =
            String(
              payload?.roomId || "global"
            ).trim();


          if (!roomId) {

            socket.emit(
              "server_error",
              {
                message:
                  "Chat room নির্ধারণ করা যায়নি।"
              }
            );

            return;

          }


          // ------------------------------------------------
          // Firestore
          // ------------------------------------------------

          const messageData = {

            uid:
              socket.user.uid,

            senderId:
              socket.user.uid,

            senderEmail:
              socket.user.email || "",

            text,

            roomId,

            createdAt:
              admin.firestore.FieldValue.serverTimestamp()

          };


          const messageRef =
            await db
              .collection("rooms")
              .doc(roomId)
              .collection("messages")
              .add(messageData);


          // ------------------------------------------------
          // Broadcast
          // ------------------------------------------------

          io.to(roomId).emit(
            "new_message",
            {
              id:
                messageRef.id,

              ...messageData,

              createdAt:
                new Date().toISOString()

            }
          );


        } catch (error) {

          console.error(
            "AYNA BOOK Send Message Error:",
            error
          );


          socket.emit(
            "server_error",
            {
              message:
                "Message পাঠানো যায়নি।"
            }
          );

        }

      }
    );


    // -----------------------------------------------------
    // Disconnect
    // -----------------------------------------------------

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          "AYNA BOOK Socket Disconnected:",
          socket.user.uid,
          reason
        );

      }
    );

  }
);


// =========================================================
// Server Error
// =========================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "AYNA BOOK Server Error:",
      error
    );


    res.status(500).json({
      success: false,
      message:
        "Server-এ একটি সমস্যা হয়েছে।"
    });

  }
);


// =========================================================
// Start Server
// =========================================================

const PORT =
  Number(
    process.env.PORT
  ) || 3000;


server.listen(
  PORT,
  () => {

    console.log(
      `AYNA BOOK Server running on port ${PORT}`
    );

  }
);