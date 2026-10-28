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


/* ==================================
   1. FIREBASE CONFIGURATION
   আপনার নিজের Firebase তথ্য বসাবেন।
================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


/* ==================================
   2. HTML ELEMENTS
================================== */

const statusElement = document.getElementById("status");
const messagesElement = document.getElementById("messages");
const form = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const translateButton = document.getElementById("translate");
const translationResult = document.getElementById("translationResult");


/* ==================================
   3. APP VARIABLES
================================== */

const ROOM_ID = "general";
const MAX_MESSAGES = 100;

let auth = null;
let db = null;
let currentUser = null;
let unsubscribeMessages = null;
let sending = false;


/* ==================================
   4. STATUS MESSAGE
================================== */

function setStatus(message, error = false) {
  statusElement.textContent = message;
  statusElement.style.color = error
    ? "#fca5a5"
    : "#fbbf24";
}


/* ==================================
   5. CHECK CONFIGURATION
================================== */

function configIsReady() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
    firebaseConfig.appId !== "YOUR_APP_ID"
  );
}


/* ==================================
   6. SHOW MESSAGES
================================== */

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

    const sender = document.createElement("small");

    sender.textContent =
      item.uid === currentUser?.uid
        ? "আপনি"
        : "AYNA BOOK ব্যবহারকারী";

    const text = document.createElement("p");

    // ব্যবহারকারীর লেখা HTML হিসেবে চালানো হবে না।
    text.textContent = item.text || "";

    const time = document.createElement("small");

    if (item.createdAt?.toDate) {
      time.textContent = item.createdAt
        .toDate()
        .toLocaleString("bn-BD");
    } else {
      time.textContent = "সময় নির্ধারিত হচ্ছে...";
    }

    bubble.append(sender, text, time);
    messagesElement.appendChild(bubble);
  }

  messagesElement.scrollTop = messagesElement.scrollHeight;
}


/* ==================================
   7. LISTEN FOR LIVE MESSAGES
================================== */

function listenForMessages() {
  if (!db || !currentUser) return;

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  setStatus("মেসেজ লোড হচ্ছে...");

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
        .map(document => ({
          id: document.id,
          ...document.data()
        }))
        .reverse();

      displayMessages(list);

      setStatus("Firebase সংযুক্ত হয়েছে।");
      sendButton.disabled = false;
    },
    error => {
      console.error("Message loading error:", error);

      setStatus(
        "মেসেজ লোড হয়নি। Firestore Database ও Rules পরীক্ষা করুন।",
        true
      );

      sendButton.disabled = true;
    }
  );
}


/* ==================================
   8. SEND MESSAGE
================================== */

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!db || !currentUser) {
    setStatus("Firebase সংযোগ এখনো প্রস্তুত নয়।", true);
    return;
  }

  if (sending) return;

  const text = messageInput.value.trim();

  if (!text) return;

  if (text.length > 2000) {
    setStatus(
      "মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।",
      true
    );
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
    console.error("Message sending error:", error);

    setStatus(
      "মেসেজ পাঠানো যায়নি। Firebase Rules ও সংযোগ পরীক্ষা করুন।",
      true
    );
  } finally {
    sending = false;
    sendButton.disabled = !currentUser;
  }
});


/* ==================================
   9. TRANSLATION BUTTON
   প্রকৃত অনুবাদ সেবা পরে সংযুক্ত হবে।
================================== */

translateButton.addEventListener("click", () => {
  if (!messageInput.value.trim()) {
    translationResult.textContent =
      "প্রথমে অনুবাদের জন্য মেসেজ লিখুন।";
    return;
  }

  translationResult.textContent =
    "স্বয়ংক্রিয় অনুবাদ চালু করতে অনুবাদ API সংযুক্ত করতে হবে।";
});


/* ==================================
   10. START FIREBASE
================================== */

async function startFirebase() {
  if (!configIsReady()) {
    setStatus(
      "Firebase Config এখনো বসানো হয়নি।",
      true
    );

    messagesElement.textContent =
      "অনলাইন মেসেজিং চালু করতে Firebase Config প্রয়োজন।";

    sendButton.disabled = true;
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    db = getFirestore(app);

    setStatus("Firebase সংযোগ করা হচ্ছে...");

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
          console.error("Sign-in error:", error);

          setStatus(
            "লগইন ব্যর্থ। Anonymous Authentication চালু আছে কি না দেখুন।",
            true
          );
        });
      }
    });

  } catch (error) {
    console.error("Firebase startup error:", error);

    setStatus(
      "Firebase চালু হয়নি। Config পরীক্ষা করুন।",
      true
    );
  }
}


/* ==================================
   11. RUN APP
================================== */

startFirebase();