"use strict";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


/* =====================================
   1. FIREBASE CONFIGURATION
   Firebase Console থেকে সঠিক তথ্য বসান।
===================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


/* =====================================
   2. HTML ELEMENTS
===================================== */

const statusElement = document.getElementById("status");
const messagesElement = document.getElementById("messages");
const form = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const translateButton = document.getElementById("translate");
const translationResult = document.getElementById("translationResult");


/* =====================================
   3. CONNECTION VARIABLES
===================================== */

let auth = null;
let db = null;
let currentUser = null;
let unsubscribeMessages = null;
let sending = false;

const ROOM_ID = "general";
const MAX_MESSAGES = 100;


/* =====================================
   4. STATUS
===================================== */

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.style.color = isError
    ? "#fca5a5"
    : "#fbbf24";
}


/* =====================================
   5. CHECK CONFIGURATION
===================================== */

function configIsReady() {
  return (
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.appId !== "YOUR_APP_ID" &&
    firebaseConfig.apiKey.length > 0 &&
    firebaseConfig.projectId.length > 0 &&
    firebaseConfig.appId.length > 0
  );
}


/* =====================================
   6. DISPLAY MESSAGES SAFELY
===================================== */

function displayMessages(list) {
  messagesElement.replaceChildren();

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.textContent =
      "এখনো কোনো মেসেজ নেই। প্রথম মেসেজটি পাঠান!";

    messagesElement.appendChild(empty);
    return;
  }

  for (const item of list) {
    const bubble = document.createElement("div");

    bubble.className =
      item.uid === currentUser?.uid
        ? "bubble mine"
        : "bubble";

    const text = document.createElement("p");
    text.textContent = item.text || "";

    const sender = document.createElement("small");
    sender.textContent =
      item.uid === currentUser?.uid
        ? "আপনি"
        : "AYNA BOOK ব্যবহারকারী";

    const time = document.createElement("small");

    let dateText = "সময় পাওয়া যায়নি";

    if (item.createdAt?.toDate) {
      dateText = item.createdAt
        .toDate()
        .toLocaleString("bn-BD");
    }

    time.textContent = dateText;

    bubble.append(sender, text, time);
    messagesElement.appendChild(bubble);
  }

  messagesElement.scrollTop =
    messagesElement.scrollHeight;
}


/* =====================================
   7. LISTEN TO REAL-TIME MESSAGES
===================================== */

function listenForMessages() {
  if (!db || !currentUser) return;

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  setStatus("অনলাইন মেসেজ লোড হচ্ছে...");

  const messagesRef = collection(
    db,
    "rooms",
    ROOM_ID,
    "messages"
  );

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "desc"),
    limit(MAX_MESSAGES)
  );

  unsubscribeMessages = onSnapshot(
    messagesQuery,
    snapshot => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .reverse();

      displayMessages(list);

      setStatus("Firebase সংযুক্ত — মেসেজিং প্রস্তুত");
      sendButton.disabled = false;
    },
    error => {
      console.error("Message listener error:", error);

      setStatus(
        "মেসেজ লোড হয়নি। Firestore Rules ও Database পরীক্ষা করুন।",
        true
      );

      sendButton.disabled = true;
    }
  );
}


/* =====================================
   8. SEND MESSAGE
===================================== */

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!db || !currentUser) {
    setStatus("আগে Firebase সংযোগ সম্পন্ন করুন।", true);
    return;
  }

  if (sending) return;

  const text = messageInput.value.trim();

  if (!text) return;

  if (text.length > 2000) {
    setStatus("মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।", true);
    return;
  }

  sending = true;
  sendButton.disabled = true;

  try {
    const messagesRef = collection(
      db,
      "rooms",
      ROOM_ID,
      "messages"
    );

    await addDoc(messagesRef, {
      text: text,
      uid: currentUser.uid,
      createdAt: serverTimestamp()
    });

    messageInput.value = "";
    translationResult.textContent = "";

    setStatus("মেসেজ পাঠানো হয়েছে।");
  } catch (error) {
    console.error("Send message error:", error);

    setStatus(
      "মেসেজ পাঠানো যায়নি। Firebase Rules ও ইন্টারনেট পরীক্ষা করুন।",
      true
    );
  } finally {
    sending = false;
    sendButton.disabled = !currentUser;
  }
});


/* =====================================
   9. TRANSLATION BUTTON
   প্রকৃত অনুবাদ API এখনো সংযুক্ত নয়।
===================================== */

translateButton.addEventListener("click", () => {
  if (!messageInput.value.trim()) {
    translationResult.textContent =
      "প্রথমে অনুবাদের জন্য একটি মেসেজ লিখুন।";
    return;
  }

  translationResult.textContent =
    "স্বয়ংক্রিয় অনুবাদ চালু করতে একটি অনুবাদ API সংযুক্ত করতে হবে।";
});


/* =====================================
   10. START FIREBASE
===================================== */

async function startFirebase() {
  if (!configIsReady()) {
    setStatus(
      "Firebase চালু হয়নি। প্রথমে firebaseConfig-এর তথ্য বসান।",
      true
    );

    messagesElement.textContent =
      "Firebase কনফিগারেশন যোগ করার পর অনলাইন মেসেজ দেখা যাবে।";

    sendButton.disabled = true;
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    db = getFirestore(app);

    setStatus("Firebase-এ নিরাপদে সংযোগের চেষ্টা চলছে...");

    onAuthStateChanged(auth, user => {
      if (user) {
        currentUser = user;
        listenForMessages();
      } else {
        currentUser = null;
        sendButton.disabled = true;

        if (unsubscribeMessages) {
          unsubscribeMessages();
          unsubscribeMessages = null;
        }

        signInAnonymously(auth).catch(error => {
          console.error("Authentication error:", error);

          setStatus(
            "লগইন হয়নি। Firebase Anonymous Authentication চালু করুন।",
            true
          );
        });
      }
    });

  } catch (error) {
    console.error("Firebase initialization error:", error);

    setStatus(
      "Firebase সংযোগ ব্যর্থ। কনফিগারেশন পরীক্ষা করুন।",
      true
    );
  }
}


/* =====================================
   11. RUN
===================================== */

startFirebase();