
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
   1. AYNA BOOK FIREBASE CONFIGURATION
===================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};


/* =====================================
   2. INITIALIZE FIREBASE
===================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* =====================================
   3. HTML ELEMENTS
===================================== */

const statusElement = document.getElementById("status");
const messagesElement = document.getElementById("messages");
const form = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const translateButton = document.getElementById("translate");
const translationResult = document.getElementById("translationResult");


/* =====================================
   4. CHAT SETTINGS
===================================== */

const ROOM_ID = "general";
const MAX_MESSAGES = 100;

let currentUser = null;
let unsubscribeMessages = null;
let sending = false;
let signingIn = false;


/* =====================================
   5. STATUS DISPLAY
===================================== */

function setStatus(message, error = false) {
  statusElement.textContent = message;
  statusElement.style.color = error
    ? "#fca5a5"
    : "#fbbf24";
}


/* =====================================
   6. DISPLAY MESSAGES
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

    const sender = document.createElement("small");

    sender.textContent =
      item.uid === currentUser?.uid
        ? "আপনি"
        : "AYNA BOOK ব্যবহারকারী";

    const text = document.createElement("p");

    // নিরাপদভাবে লেখা দেখানো হচ্ছে।
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


/* =====================================
   7. LISTEN FOR LIVE MESSAGES
===================================== */

function listenForMessages() {
  if (!db || !currentUser) {
    return;
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

  setStatus("মেসেজ লোড হচ্ছে...");

  sendButton.disabled = true;

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


/* =====================================
   8. SEND A MESSAGE
===================================== */

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser) {
    setStatus(
      "লগইন প্রস্তুত নয়। কিছুক্ষণ অপেক্ষা করুন।",
      true
    );
    return;
  }

  if (sending) {
    return;
  }

  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

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


/* =====================================
   9. TRANSLATION BUTTON
===================================== */

translateButton.addEventListener("click", () => {
  const text = messageInput.value.trim();

  if (!text) {
    translationResult.textContent =
      "প্রথমে অনুবাদের জন্য মেসেজ লিখুন।";
    return;
  }

  translationResult.textContent =
    "স্বয়ংক্রিয় অনুবাদ চালু করতে নিরাপদ Translation API যুক্ত করতে হবে।";
});


/* =====================================
   10. FIREBASE AUTHENTICATION
===================================== */

onAuthStateChanged(
  auth,

  user => {
    if (user) {
      currentUser = user;
      signingIn = false;
      listenForMessages();
      return;
    }

    currentUser = null;
    sendButton.disabled = true;

    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }

    if (signingIn) {
      return;
    }

    signingIn = true;

    setStatus("ব্যবহারকারী সংযোগ তৈরি হচ্ছে...");

    signInAnonymously(auth)
      .catch(error => {
        console.error("Authentication error:", error);

        setStatus(
          "লগইন ব্যর্থ। Firebase Authentication-এ Anonymous চালু করুন।",
          true
        );
      })
      .finally(() => {
        signingIn = false;
      });
  },

  error => {
    console.error("Authentication state error:", error);

    setStatus(
      "Authentication পরীক্ষা করা যাচ্ছে না।",
      true
    );
  }
);