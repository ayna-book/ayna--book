
import { auth, db } from "./firebase-config.js";

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

const $ = id => document.getElementById(id);

const status = $("status");
const messages = $("messages");
const form = $("chatForm");
const input = $("message");
const sendButton = $("sendButton");

const ROOM_ID = "general";
const MAX_MESSAGES = 100;

let currentUser = null;
let unsubscribe = null;
let sending = false;

function showStatus(message) {
  if (status) status.textContent = message;
}

function showMessages(snapshot) {
  messages.replaceChildren();

  if (snapshot.empty) {
    messages.textContent = "এখনো কোনো মেসেজ নেই।";
    return;
  }

  snapshot.docs.reverse().forEach(item => {
    const data = item.data();

    const bubble = document.createElement("div");
    bubble.style.padding = "12px";
    bubble.style.margin = "8px 0";
    bubble.style.borderRadius = "10px";
    bubble.style.background = "#10285a";

    const name = document.createElement("strong");
    name.textContent =
      data.uid === currentUser?.uid
        ? "আপনি"
        : (data.authorName || "AYNA BOOK User");

    const text = document.createElement("p");
    text.textContent = data.text || "";

    const time = document.createElement("small");
    time.textContent = data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString("bn-BD")
      : "সময় নির্ধারিত হচ্ছে...";

    bubble.append(name, text, time);
    messages.appendChild(bubble);
  });

  messages.scrollTop = messages.scrollHeight;
}

function listenForMessages() {
  if (unsubscribe) unsubscribe();

  const messagesRef = collection(
    db, "rooms", ROOM_ID, "messages"
  );

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "desc"),
    limit(MAX_MESSAGES)
  );

  showStatus("মেসেজ লোড হচ্ছে...");

  unsubscribe = onSnapshot(
    messagesQuery,
    snapshot => {
      showMessages(snapshot);
      showStatus("AYNA BOOK মেসেঞ্জার সংযুক্ত হয়েছে।");
      sendButton.disabled = false;
    },
    error => {
      console.error(error);
      showStatus("মেসেজ লোড হয়নি: " + error.code);
      sendButton.disabled = true;
    }
  );
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser) {
    showStatus("প্রথমে লগইন করুন।");
    return;
  }

  if (sending) return;

  const message = input.value.trim();

  if (!message) {
    showStatus("মেসেজ লিখুন।");
    return;
  }

  if (message.length > 2000) {
    showStatus("মেসেজ ২০০০ অক্ষরের মধ্যে লিখুন।");
    return;
  }

  sending = true;
  sendButton.disabled = true;

  try {
    await addDoc(
      collection(db, "rooms", ROOM_ID, "messages"),
      {
        text: message,
        uid: currentUser.uid,
        authorName: currentUser.displayName || "AYNA BOOK User",
        createdAt: serverTimestamp()
      }
    );

    input.value = "";
    showStatus("মেসেজ পাঠানো হয়েছে।");

  } catch (error) {
    console.error(error);
    showStatus("মেসেজ পাঠানো যায়নি: " + error.code);

  } finally {
    sending = false;
    sendButton.disabled = !currentUser;
  }
});

onAuthStateChanged(auth, user => {
  currentUser = user;

  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  if (user && !user.isAnonymous) {
    listenForMessages();
  } else {
    messages.replaceChildren();
    messages.textContent = "মেসেঞ্জার ব্যবহার করতে লগইন করুন।";
    sendButton.disabled = true;
    showStatus("লগইন করা নেই।");
  }
});

window.addEventListener("pagehide", () => {
  if (unsubscribe) unsubscribe();
});
