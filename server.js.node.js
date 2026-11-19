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


// =========================================================
// BASIC CONFIGURATION
// =========================================================

const app = express();

const server =
  http.createServer(app);


const PORT =
  process.env.PORT || 3000;


// AYNA BOOK GitHub Pages origin
const ALLOWED_ORIGIN =
  "https://ayna-book.github.io";


// =========================================================
// FIREBASE ADMIN INITIALIZATION
// =========================================================

if (!admin.apps.length) {

  try {

    admin.initializeApp({
      credential:
        admin.credential.applicationDefault()
    });

    console.log(
      "AYNA BOOK Firebase Admin initialized."
    );

  } catch (error) {

    console.error(
      "AYNA BOOK Firebase Admin initialization failed:",
      error.message
    );

    process.exit(1);

  }

}


const db =
  admin.firestore();


// =========================================================
// EXPRESS SECURITY / CORS
// =========================================================

app.use(
  cors({

    origin:
      ALLOWED_ORIGIN,

    methods: [
      "GET",
      "POST"
    ]

  })
);


app.use(
  express.json({
    limit: "10kb"
  })
);


// =========================================================
// HEALTH CHECK
// =========================================================

app.get(
  "/",
  (req, res) => {

    res.status(200).json({

      success: true,

      app: "AYNA BOOK",

      server: "Running",

      version: "2.0.0"

    });

  }
);


// =========================================================
// SOCKET.IO
// =========================================================

const io =
  new Server(
    server,
    {

      cors: {

        origin:
          ALLOWED_ORIGIN,

        methods: [
          "GET",
          "POST"
        ]

      },

      maxHttpBufferSize:
        10 * 1024

    }
  );


// =========================================================
// SOCKET.IO FIREBASE AUTHENTICATION
// =========================================================

io.use(
  async (socket, next) => {

    try {

      const token =
        socket.handshake
          ?.auth
          ?.token;


      if (!token) {

        return next(
          new Error(
            "Authentication required."
          )
        );

      }


      const decodedToken =
        await admin
          .auth()
          .verifyIdToken(
            token
          );


      socket.user =
        decodedToken;


      next();


    } catch (error) {

      console.error(
        "AYNA BOOK Authentication Error:",
        error.message
      );


      next(
        new Error(
          "Invalid authentication."
        )
      );

    }

  }
);


// =========================================================
// AUTHENTICATED SOCKET CONNECTION
// =========================================================

io.on(
  "connection",
  (socket) => {

    const user =
      socket.user;


    console.log(
      "AYNA BOOK User Connected:",
      user.uid
    );


    // Global chat room
    socket.join(
      "global"
    );


    // Per-user rate limiting
    let lastMessageTime = 0;


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    socket.on(
      "send_message",
      async (
        data,
        callback
      ) => {

        const reply =
          typeof callback ===
          "function"
            ? callback
            : () => {};


        try {

          // -----------------------------------------------
          // Rate limit
          // -----------------------------------------------

          const now =
            Date.now();


          if (
            now -
              lastMessageTime <
            1000
          ) {

            return reply({

              success: false,

              message:
                "একটু অপেক্ষা করে আবার পাঠান।"

            });

          }


          lastMessageTime =
            now;


          // -----------------------------------------------
          // Validate message
          // -----------------------------------------------

          const text =
            String(
              data?.text || ""
            ).trim();


          if (!text) {

            return reply({

              success: false,

              message:
                "মেসেজ লিখুন।"

            });

          }


          if (
            text.length >
            2000
          ) {

            return reply({

              success: false,

              message:
                "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।"

            });

          }


          // -----------------------------------------------
          // Firestore message
          // -----------------------------------------------

          const message = {

            uid:
              user.uid,

            senderId:
              user.uid,

            senderEmail:
              user.email || "",

            text,

            createdAt:
              admin.firestore
                .FieldValue
                .serverTimestamp()

          };


          const messageRef =
            await db
              .collection(
                "rooms"
              )
              .doc(
                "global"
              )
              .collection(
                "messages"
              )
              .add(
                message
              );


          // -----------------------------------------------
          // Broadcast
          // -----------------------------------------------

          io
            .to("global")
            .emit(
              "new_message",
              {

                id:
                  messageRef.id,

                uid:
                  user.uid,

                senderId:
                  user.uid,

                senderEmail:
                  user.email || "",

                text,

                createdAt:
                  new Date()
                    .toISOString()

              }
            );


          // -----------------------------------------------
          // Success
          // -----------------------------------------------

          reply({

            success: true,

            message:
              "মেসেজ পাঠানো হয়েছে।",

            id:
              messageRef.id

          });


        } catch (error) {

          console.error(
            "AYNA BOOK Message Error:",
            error
          );


          reply({

            success: false,

            message:
              "মেসেজ পাঠানো যায়নি।"

          });

        }

      }
    );


    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on(
      "disconnect",
      (reason) => {

        console.log(
          "AYNA BOOK User Disconnected:",
          user.uid,
          reason
        );

      }
    );

  }
);


// =========================================================
// SERVER ERROR HANDLING
// =========================================================

server.on(
  "error",
  (error) => {

    console.error(
      "AYNA BOOK Server Error:",
      error
    );

  }
);


// =========================================================
// START SERVER
// =========================================================

server.listen(
  PORT,
  () => {

    console.log(
      `AYNA BOOK Backend running on port ${PORT}`
    );

    console.log(
      `Allowed Origin: ${ALLOWED_ORIGIN}`
    );

  }
);