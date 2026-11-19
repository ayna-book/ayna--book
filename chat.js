
// =========================================================
// AYNA BOOK
// Chat System
// Firebase SDK: 13.4.0
// =========================================================

import { auth, db } from "./firebase-init.js";

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

// বর্তমান লগইন ব্যবহারকারী
let currentUser = null;

// Authentication যাচাই
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (!user) {
    console.log("AYNA BOOK: Login প্রয়োজন।");
  } else {
    console.log("AYNA BOOK Chat User:", user.uid);
  }
});

// মেসেজ পাঠানো
export async function sendMessage(messageText, roomId = "global") {
  try {
    if (!currentUser) {
      throw new Error("আগে লগইন করুন।");
    }

    const text = String(messageText || "").trim();

    if (!text) {
      throw new Error("মেসেজ লিখুন।");
    }

    if (text.length > 5000) {
      throw new Error("মেসেজ সর্বোচ্চ ৫০০০ অক্ষরের হতে পারবে।");
    }

    await addDoc(
      collection(db, "rooms", roomId, "messages"),
      {
        text,
        senderId: currentUser.uid,
        senderEmail: currentUser.email || "",
        createdAt: serverTimestamp()
      }
    );

    return {
      success: true,
      message: "মেসেজ পাঠানো হয়েছে।"
    };

  } catch (error) {
    console.error("AYNA BOOK Send Message Error:", error);

    return {
      success: false,
      message: error.message || "মেসেজ পাঠানো যায়নি।"
    };
  }
}

// রিয়েল-টাইম মেসেজ শোনা
export function listenMessages(callback, roomId = "global") {
  if (!currentUser) {
    console.error("AYNA BOOK: আগে লগইন করুন।");
    return () => {};
  }

  const messagesQuery = query(
    collection(db, "rooms", roomId, "messages"),
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      callback(messages);
    },
    (error) => {
      console.error("AYNA BOOK Listen Messages Error:", error);
      callback([]);
    }
  );

  return unsubscribe;
}

console.log("AYNA BOOK Chat System Loaded.");
