
import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = (id) => document.getElementById(id);

const chatForm = $("chatForm");
const messageInput = $("message");
const messagesContainer = $("messages");
const statusElement = $("chatStatus");
const sendButton = $("sendButton");

const ROOM_ID = "general";
const MAX_MESSAGES = 100;

let currentUser = null;
let unsubscribeMessages = null;
let sending = false;

function showStatus(message) {
  statusElement.textContent = message;
}

// Display messages safely
function displayMessages(snapshot) {
  messagesContainer.replaceChildren();

  if (snapshot.empty) {
    const empty = document.createElement("p");
    empty.textContent = "এখনো কোনো মেসেজ নেই। প্রথম মেসেজটি পাঠান!";
    messagesContainer.appendChild(empty);
    return;
  }

  snapshot.forEach((documentSnapshot) => {
    const data = documentSnapshot.data();

    const bubble = document.createElement("div");

    bubble.className =
      data.uid === currentUser?.uid
        ? "bubble mine"
        : "bubble";

    const sender = document.createElement("small");

    sender.textContent =
      data.uid === currentUser?.uid
        ? "আপনি"
        : data.authorName || "AYNA BOOK User";

    const message = document.createElement("p");
    message.textContent = data.text || "";

    const time = document.createElement("small");

    time.textContent = data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString()
      : "সময় নির্ধারিত হচ্ছে...";

    bubble.append(sender, message, time);
    messagesContainer.appendChild(bubble);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Listen for community messages
function listenForMessages() {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }

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

  showStatus("মেসেজ লোড হচ্ছে...");

  unsubscribeMessages = onSnapshot(
    messagesQuery,
    (snapshot) => {
      displayMessages(snapshot);
      showStatus("✅ AYNA BOOK কমিউনিটি চ্যাট সংযুক্ত হয়েছে।");
      sendButton.disabled = false;
    },
    (error) => {
      console.error("Message loading error:", error);

      showStatus(
        "মেসেজ লোড হয়নি। Firestore Database ও Rules পরীক্ষা করুন।"
      );

      sendButton.disabled = true;
    }
  );
}

// Send a message
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentUser) {
    showStatus("মেসেজ পাঠাতে প্রথমে লগইন করুন।");
    return;
  }

  if (sending) return;

  const text = messageInput.value.trim();

  if (!text) {
    showStatus("মেসেজ লিখুন।");
    return;
  }

  if (text.length > 2000) {
    showStatus("মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।");
    return;
  }

  sending = true;
  sendButton.disabled = true;

  showStatus("মেসেজ পাঠানো হচ্ছে...");

  try {
    const messagesRef = collection(
      db,
      "rooms",
      ROOM_ID,
      "messages"
    );

    await addDoc(messagesRef, {
      text,
      uid: currentUser.uid,
      authorName: currentUser.displayName || "AYNA BOOK User",
      createdAt: serverTimestamp()
    });

    messageInput.value = "";
    showStatus("✅ আপনার মেসেজ পাঠানো হয়েছে!");

  } catch (error) {
    console.error("Message sending error:", error);

    showStatus(
      "মেসেজ পাঠানো যায়নি। ইন্টারনেট ও Firestore Rules পরীক্ষা করুন।"
    );

  } finally {
    sending = false;
    sendButton.disabled = !currentUser;
  }
});

// Check login status
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    listenForMessages();
  } else {
    if (unsubscribeMessages) {
      unsubscribeMessages();
      unsubscribeMessages = null;
    }

    messagesContainer.replaceChildren();

    const notice = document.createElement("p");
    notice.textContent = "চ্যাট ব্যবহার করতে লগইন করুন।";
    messagesContainer.appendChild(notice);

    sendButton.disabled = true;
    showStatus("লগইন করা নেই।");

    window.location.replace("./login.html");
  }
});

// Clean up listener when leaving the page
window.addEventListener("pagehide", () => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
});
