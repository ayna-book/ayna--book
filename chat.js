// =========================================================
// AYNA BOOK
// Chat System
// Firebase SDK: 13.4.0
// =========================================================

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// ---------------------------------------------------------
// Current User
// ---------------------------------------------------------

let currentUser = null;

let authReady = false;

let authWaitPromise;

let resolveAuthReady;

authWaitPromise = new Promise((resolve) => {
  resolveAuthReady = resolve;
});


// ---------------------------------------------------------
// Authentication State
// ---------------------------------------------------------

onAuthStateChanged(auth, (user) => {

  currentUser = user;

  if (!authReady) {
    authReady = true;
    resolveAuthReady(user);
  }

  if (!user) {

    console.log(
      "AYNA BOOK: Login প্রয়োজন।"
    );

  } else {

    console.log(
      "AYNA BOOK Chat User:",
      user.uid
    );

  }

});


// ---------------------------------------------------------
// Wait for Firebase Authentication
// ---------------------------------------------------------

async function waitForAuth() {

  if (authReady) {
    return currentUser;
  }

  return await authWaitPromise;
}


// ---------------------------------------------------------
// Send Message
// ---------------------------------------------------------

export async function sendMessage(
  messageText,
  roomId = "global"
) {

  try {

    const user = await waitForAuth();

    if (!user) {

      throw new Error(
        "আগে AYNA BOOK-এ লগইন করুন।"
      );

    }


    const text =
      String(messageText || "").trim();


    if (!text) {

      throw new Error(
        "মেসেজ লিখুন।"
      );

    }


    if (text.length > 2000) {

      throw new Error(
        "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।"
      );

    }


    const cleanRoomId =
      String(roomId || "global").trim();


    if (!cleanRoomId) {

      throw new Error(
        "Chat room নির্ধারণ করা যায়নি।"
      );

    }


    await addDoc(
      collection(
        db,
        "rooms",
        cleanRoomId,
        "messages"
      ),
      {

        uid: user.uid,

        senderId: user.uid,

        senderEmail:
          user.email || "",

        text,

        createdAt:
          serverTimestamp()

      }
    );


    return {

      success: true,

      message:
        "মেসেজ পাঠানো হয়েছে।"

    };


  } catch (error) {

    console.error(
      "AYNA BOOK Send Message Error:",
      error
    );


    return {

      success: false,

      message:
        error?.message ||
        "মেসেজ পাঠানো যায়নি।"

    };

  }

}


// ---------------------------------------------------------
// Listen to Real-Time Messages
// ---------------------------------------------------------

export function listenMessages(
  callback,
  roomId = "global"
) {

  let unsubscribe = () => {};

  let cancelled = false;


  waitForAuth().then((user) => {

    if (cancelled) {
      return;
    }


    if (!user) {

      console.error(
        "AYNA BOOK: Chat ব্যবহারের জন্য Login প্রয়োজন।"
      );

      callback([]);

      return;

    }


    const cleanRoomId =
      String(roomId || "global").trim();


    if (!cleanRoomId) {

      console.error(
        "AYNA BOOK: Invalid room ID."
      );

      callback([]);

      return;

    }


    const messagesQuery =
      query(

        collection(
          db,
          "rooms",
          cleanRoomId,
          "messages"
        ),

        orderBy(
          "createdAt",
          "asc"
        )

      );


    unsubscribe =
      onSnapshot(

        messagesQuery,

        (snapshot) => {

          const messages =
            snapshot.docs.map(
              (messageDoc) => ({

                id: messageDoc.id,

                ...messageDoc.data()

              })
            );


          callback(messages);

        },


        (error) => {

          console.error(
            "AYNA BOOK Listen Messages Error:",
            error
          );

          callback([]);

        }

      );

  });


  // Listener বন্ধ করার function
  return () => {

    cancelled = true;

    unsubscribe();

  };

}


// ---------------------------------------------------------
// AYNA BOOK Chat Ready
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — Chat System Loaded."
);