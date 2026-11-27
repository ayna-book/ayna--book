// ============================================================
// AYNA BOOK — COMMUNITY MESSAGES
// File: js/messages.js
// Firebase Web SDK 13.4.0
//
// Works with:
// messenger.html
// firebase-init.js
// auth-guard.js
//
// RTDB PATH:
// /communityMessages/{messageId}
// ============================================================

import { auth, database } from "../firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  push,
  set,
  query,
  orderByChild,
  limitToLast,
  onChildAdded,
  off,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// CONFIGURATION
// ============================================================

const MESSAGES_PATH = "communityMessages";

const MAX_MESSAGE_LENGTH = 2000;

const MAX_MESSAGES_TO_LOAD = 100;


// ============================================================
// DOM ELEMENTS
// ============================================================

const messagesBox = document.getElementById("messages");

const chatForm = document.getElementById("chatForm");

const messageInput = document.getElementById("message");

const sendButton = document.getElementById("sendButton");

const chatStatus = document.getElementById("chatStatus");

const currentUserBox =
  document.getElementById("currentUserBox");


// ============================================================
// STATE
// ============================================================

let currentUser = null;

let messagesQuery = null;

let messagesListenerActive = false;

let knownMessageIds = new Set();


// ============================================================
// BASIC HELPERS
// ============================================================

function setStatus(text, type = "normal") {

  if (!chatStatus) return;

  chatStatus.textContent = text;

  if (type === "error") {
    chatStatus.style.color = "#ff8080";
  } else if (type === "success") {
    chatStatus.style.color = "#7dffb2";
  } else if (type === "warning") {
    chatStatus.style.color = "#ffd84d";
  } else {
    chatStatus.style.color = "#ffffff";
  }
}


// ============================================================
// HTML ESCAPE
// Prevents HTML / XSS injection
// ============================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ============================================================
// DATE / TIME
// ============================================================

function formatTime(timestamp) {

  if (!timestamp) {
    return "সময় পাওয়া যায়নি";
  }

  const date = new Date(Number(timestamp));

  if (Number.isNaN(date.getTime())) {
    return "সময় পাওয়া যায়নি";
  }

  return date.toLocaleString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// ============================================================
// USER DISPLAY NAME
// ============================================================

function getUserDisplayName(user) {

  if (!user) {
    return "AYNA User";
  }

  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "AYNA User";
}


// ============================================================
// CLEAR MESSAGE BOX
// ============================================================

function clearMessages() {

  if (!messagesBox) return;

  messagesBox.innerHTML = "";
}


// ============================================================
// SHOW EMPTY MESSAGE
// ============================================================

function showEmptyMessage() {

  if (!messagesBox) return;

  if (knownMessageIds.size > 0) {
    return;
  }

  messagesBox.innerHTML = `
    <p style="
      text-align:center;
      color:#aaa;
      padding:30px 10px;
      font-size:18px;
    ">
      💬 এখনো কোনো মেসেজ নেই।<br>
      প্রথম মেসেজটি আপনিই পাঠান।
    </p>
  `;
}


// ============================================================
// SCROLL TO BOTTOM
// ============================================================

function scrollMessagesToBottom() {

  if (!messagesBox) return;

  requestAnimationFrame(() => {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });
}


// ============================================================
// CREATE MESSAGE BUBBLE
// ============================================================

function renderMessage(messageId, data) {

  if (!messagesBox || !data) {
    return;
  }

  if (knownMessageIds.has(messageId)) {
    return;
  }

  knownMessageIds.add(messageId);

  const senderUid = String(data.uid || "");

  const isMine =
    currentUser &&
    senderUid === currentUser.uid;

  const senderName =
    data.displayName ||
    data.name ||
    data.email?.split("@")[0] ||
    "AYNA User";

  const text =
    typeof data.text === "string"
      ? data.text
      : "";

  if (!text.trim()) {
    return;
  }

  const bubble = document.createElement("div");

  bubble.className =
    isMine
      ? "bubble mine"
      : "bubble";

  bubble.dataset.messageId = messageId;

  const safeName = escapeHTML(senderName);

  const safeText = escapeHTML(text);

  const time = escapeHTML(
    formatTime(data.createdAt)
  );

  bubble.innerHTML = `
    <div style="
      font-size:14px;
      font-weight:700;
      color:#ffd84d;
      margin-bottom:6px;
    ">
      ${isMine ? "আপনি" : safeName}
    </div>

    <p>${safeText}</p>

    <small>
      ${time}
    </small>
  `;

  messagesBox.appendChild(bubble);

  scrollMessagesToBottom();
}


// ============================================================
// LOAD REAL-TIME MESSAGES
// ============================================================

function startMessagesListener() {

  if (!database) {
    setStatus(
      "❌ Firebase Database পাওয়া যাচ্ছে না।",
      "error"
    );

    return;
  }

  if (messagesListenerActive) {
    return;
  }

  try {

    const messagesRef =
      ref(database, MESSAGES_PATH);

    messagesQuery = query(
      messagesRef,
      orderByChild("createdAt"),
      limitToLast(MAX_MESSAGES_TO_LOAD)
    );

    messagesListenerActive = true;

    onChildAdded(
      messagesQuery,
      (snapshot) => {

        const data = snapshot.val();

        if (!data) {
          return;
        }

        // Remove temporary empty state
        const emptyText =
          messagesBox?.querySelector(
            '[data-empty-message="true"]'
          );

        if (emptyText) {
          emptyText.remove();
        }

        renderMessage(
          snapshot.key,
          data
        );

        setStatus(
          "🟢 Real-time chat connected",
          "success"
        );
      },
      (error) => {

        console.error(
          "AYNA BOOK message listener error:",
          error
        );

        setStatus(
          getFirebaseErrorMessage(error),
          "error"
        );
      }
    );

  } catch (error) {

    console.error(
      "Could not start message listener:",
      error
    );

    setStatus(
      getFirebaseErrorMessage(error),
      "error"
    );
  }
}


// ============================================================
// STOP MESSAGE LISTENER
// ============================================================

function stopMessagesListener() {

  if (
    messagesQuery &&
    messagesListenerActive
  ) {

    off(messagesQuery);

    messagesQuery = null;

    messagesListenerActive = false;
  }
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

  if (!currentUser) {

    setStatus(
      "🔐 মেসেজ পাঠাতে আগে লগইন করুন।",
      "warning"
    );

    return;
  }

  if (!database) {

    setStatus(
      "❌ Firebase Database সংযোগ পাওয়া যায়নি।",
      "error"
    );

    return;
  }

  const text =
    messageInput?.value?.trim() || "";

  if (!text) {

    setStatus(
      "⚠️ মেসেজ খালি রাখা যাবে না।",
      "warning"
    );

    messageInput?.focus();

    return;
  }

  if (text.length > MAX_MESSAGE_LENGTH) {

    setStatus(
      `⚠️ সর্বোচ্চ ${MAX_MESSAGE_LENGTH} অক্ষর লেখা যাবে।`,
      "warning"
    );

    return;
  }

  try {

    sendButton.disabled = true;

    sendButton.textContent =
      "⏳ Sending...";

    setStatus(
      "📤 মেসেজ পাঠানো হচ্ছে..."
    );

    const messagesRef =
      ref(database, MESSAGES_PATH);

    const newMessageRef =
      push(messagesRef);

    const messageData = {

      uid: currentUser.uid,

      displayName:
        getUserDisplayName(currentUser),

      email:
        currentUser.email || "",

      text: text,

      createdAt:
        serverTimestamp()

    };

    await set(
      newMessageRef,
      messageData
    );

    if (messageInput) {
      messageInput.value = "";
    }

    setStatus(
      "✅ মেসেজ পাঠানো হয়েছে।",
      "success"
    );

    messageInput?.focus();

  } catch (error) {

    console.error(
      "AYNA BOOK send message error:",
      error
    );

    setStatus(
      getFirebaseErrorMessage(error),
      "error"
    );

  } finally {

    if (sendButton) {

      sendButton.disabled = false;

      sendButton.textContent =
        "🚀 Send Message";
    }
  }
}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

  const code =
    error?.code || "";

  switch (code) {

    case "PERMISSION_DENIED":
    case "PERMISSION_DENIED: Permission denied":
      return "❌ Firebase Database permission denied। RTDB Rules পরীক্ষা করুন।";

    case "NETWORK_ERROR":
      return "🌐 ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    case "auth/network-request-failed":
      return "🌐 Firebase Auth network error।";

    case "database/permission-denied":
      return "🔒 Database permission denied।";

    default:

      return (
        "❌ Firebase error: " +
        (
          error?.message ||
          "অজানা সমস্যা"
        )
      );
  }
}


// ============================================================
// SHOW CURRENT USER
// ============================================================

function showCurrentUser(user) {

  if (!currentUserBox || !user) {
    return;
  }

  const name =
    escapeHTML(
      getUserDisplayName(user)
    );

  const email =
    escapeHTML(
      user.email || ""
    );

  currentUserBox.innerHTML = `
    👤 <strong>${name}</strong><br>
    <span style="color:#ccc;">
      ${email}
    </span>
  `;

  currentUserBox.style.display =
    "block";
}


// ============================================================
// ENABLE CHAT
// ============================================================

function enableChat() {

  if (sendButton) {
    sendButton.disabled = false;
  }

  if (messageInput) {
    messageInput.disabled = false;
  }
}


// ============================================================
// DISABLE CHAT
// ============================================================

function disableChat() {

  if (sendButton) {
    sendButton.disabled = true;
  }

  if (messageInput) {
    messageInput.disabled = true;
  }
}


// ============================================================
// FORM EVENT
// ============================================================

function setupForm() {

  if (!chatForm) {

    console.error(
      "AYNA BOOK: #chatForm not found."
    );

    return;
  }

  chatForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      await sendMessage();
    }
  );
}


// ============================================================
// TEXTAREA KEYBOARD
// Enter = Send
// Shift + Enter = New Line
// ============================================================

function setupKeyboard() {

  if (!messageInput) {
    return;
  }

  messageInput.addEventListener(
    "keydown",
    async (event) => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        if (
          !sendButton?.disabled
        ) {

          await sendMessage();
        }
      }
    }
  );
}


// ============================================================
// AUTH STATE
// ============================================================

function startAuth() {

  if (!auth) {

    setStatus(
      "❌ Firebase Auth পাওয়া যায়নি।",
      "error"
    );

    disableChat();

    return;
  }

  onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {

        currentUser = null;

        disableChat();

        setStatus(
          "🔐 Login প্রয়োজন।",
          "warning"
        );

        return;
      }

      currentUser = user;

      showCurrentUser(user);

      enableChat();

      setStatus(
        "🟢 Firebase connected",
        "success"
      );

      clearMessages();

      knownMessageIds.clear();

      startMessagesListener();
    },

    (error) => {

      console.error(
        "AYNA BOOK auth state error:",
        error
      );

      disableChat();

      setStatus(
        getFirebaseErrorMessage(error),
        "error"
      );
    }
  );
}


// ============================================================
// INITIALIZE
// ============================================================

function initMessages() {

  console.log(
    "🚀 AYNA BOOK messages.js started"
  );

  if (!messagesBox) {

    console.error(
      "AYNA BOOK: #messages element not found."
    );

    return;
  }

  if (!chatForm) {

    console.error(
      "AYNA BOOK: #chatForm element not found."
    );

    return;
  }

  if (!messageInput) {

    console.error(
      "AYNA BOOK: #message element not found."
    );

    return;
  }

  setupForm();

  setupKeyboard();

  disableChat();

  clearMessages();

  showEmptyMessage();

  startAuth();
}


// ============================================================
// START
// ============================================================

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initMessages,
    {
      once: true
    }
  );

} else {

  initMessages();
}


// ============================================================
// OPTIONAL GLOBAL API
// Useful for future AYNA BOOK Messenger features
// ============================================================

window.AYNA_MESSAGES = {

  sendMessage,

  startMessagesListener,

  stopMessagesListener,

  getCurrentUser: () => currentUser

};