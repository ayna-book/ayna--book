
"use strict";

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

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

/* =================================
   1. FIREBASE CONFIGURATION
================================= */

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};

/* =================================
   2. HTML ELEMENTS
================================= */

const $ = (id) => document.getElementById(id);

const statusElement = $("status");
const messagesElement = $("messages");
const chatForm = $("chatForm");
const messageInput = $("message");
const sendButton = $("sendButton");
const translateButton = $("translate");
const translationResult = $("translationResult");

const navigation = $("navigation");
const menuButton = $("menuButton");

const postForm = $("postForm");
const postInput = $("postText");
const postsElement = $("posts");

const mediaFile = $("mediaFile");
const mediaPreview = $("mediaPreview");

const locationButton = $("locationButton");
const locationResult = $("locationResult");

/* =================================
   3. APP VARIABLES
================================= */

const ROOM_ID = "general";
const MAX_MESSAGES = 100;

let db = null;
let currentUser = null;
let unsubscribeMessages = null;
let sending = false;
let previewURL = null;

/* =================================
   4. STATUS
================================= */

function setStatus(message, isError = false) {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.style.color = isError ? "#ff7777" : "#00cfd5";
}

/* =================================
   5. NAVIGATION
================================= */

function showScreen(targetId) {
  const target = $(targetId);

  if (!target || !target.classList.contains("screen")) return;

  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden");
  });

  target.classList.remove("hidden");

  if (navigation) {
    navigation.classList.remove("menu-open");
  }

  if (targetId === "messaging" && currentUser) {
    messageInput?.focus();
  }
}

navigation?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-target]");

  if (!button) return;

  showScreen(button.dataset.target);
});

menuButton?.addEventListener("click", () => {
  navigation?.classList.toggle("menu-open");
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href").slice(1);

    if ($(targetId)?.classList.contains("screen")) {
      event.preventDefault();
      showScreen(targetId);
    }
  });
});

/* =================================
   6. FOOTER YEAR
================================= */

const yearElement = $("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =================================
   7. LOCAL DEMO POSTS
   These posts are not shared online.
================================= */

function renderLocalPosts() {
  if (!postsElement) return;

  let savedPosts = [];

  try {
    savedPosts = JSON.parse(
      localStorage.getItem("aynaBookDemoPosts") || "[]"
    );

    if (!Array.isArray(savedPosts)) savedPosts = [];
  } catch (error) {
    savedPosts = [];
  }

  postsElement.replaceChildren();

  if (savedPosts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি লিখুন!";
    postsElement.appendChild(empty);
    return;
  }

  savedPosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "card";

    const heading = document.createElement("strong");
    heading.textContent = "AYNA BOOK ব্যবহারকারী";

    const content = document.createElement("p");
    content.textContent = post.text;

    const time = document.createElement("small");
    time.textContent = post.date;

    card.append(heading, content, time);
    postsElement.appendChild(card);
  });
}

postForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = postInput?.value.trim();

  if (!text) return;

  try {
    const savedPosts = JSON.parse(
      localStorage.getItem("aynaBookDemoPosts") || "[]"
    );

    const posts = Array.isArray(savedPosts) ? savedPosts : [];

    posts.unshift({
      text: text.slice(0, 5000),
      date: new Date().toLocaleString("bn-BD")
    });

    localStorage.setItem(
      "aynaBookDemoPosts",
      JSON.stringify(posts.slice(0, 50))
    );

    postInput.value = "";
    renderLocalPosts();
  } catch (error) {
    alert("পোস্ট সংরক্ষণ করা যায়নি। ব্রাউজারের স্টোরেজ পরীক্ষা করুন।");
  }
});

renderLocalPosts();

/* =================================
   8. MEDIA PREVIEW
   Preview only; no online upload.
================================= */

mediaFile?.addEventListener("change", () => {
  if (!mediaPreview) return;

  if (previewURL) {
    URL.revokeObjectURL(previewURL);
    previewURL = null;
  }

  mediaPreview.replaceChildren();

  const file = mediaFile.files?.[0];

  if (!file) return;

  const allowedType =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/");

  if (!allowedType) {
    mediaPreview.textContent = "এই ফাইলের ধরন সমর্থিত নয়।";
    return;
  }

  const maxSize = 25 * 1024 * 1024;

  if (file.size > maxSize) {
    mediaPreview.textContent =
      "প্রিভিউয়ের জন্য সর্বোচ্চ ২৫ MB ফাইল নির্বাচন করুন।";
    mediaFile.value = "";
    return;
  }

  previewURL = URL.createObjectURL(file);

  let media;

  if (file.type.startsWith("image/")) {
    media = document.createElement("img");
    media.alt = "নির্বাচিত ছবির প্রিভিউ";
    media.style.maxWidth = "100%";
    media.style.height = "auto";
  } else if (file.type.startsWith("video/")) {
    media = document.createElement("video");
    media.controls = true;
    media.style.maxWidth = "100%";
  } else {
    media = document.createElement("audio");
    media.controls = true;
  }

  media.src = previewURL;

  const name = document.createElement("p");
  name.textContent = "ফাইল: " + file.name;

  mediaPreview.append(media, name);
});

/* =================================
   9. LOCATION
================================= */

locationButton?.addEventListener("click", () => {
  if (!locationResult) return;

  if (!navigator.geolocation) {
    locationResult.textContent =
      "আপনার ব্রাউজারে লোকেশন সুবিধা নেই।";
    return;
  }

  locationResult.textContent =
    "আপনার অনুমতি নিয়ে লোকেশন খোঁজা হচ্ছে...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      locationResult.replaceChildren();

      const details = document.createElement("p");
      details.textContent =
        "Latitude: " + lat.toFixed(5) +
        " | Longitude: " + lon.toFixed(5);

      const mapLink = document.createElement("a");
      mapLink.href =
        "https://www.openstreetmap.org/?mlat=" +
        encodeURIComponent(lat) +
        "&mlon=" + encodeURIComponent(lon);

      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      mapLink.textContent = "মানচিত্রে দেখুন";

      locationResult.append(details, mapLink);
    },
    () => {
      locationResult.textContent =
        "লোকেশন পাওয়া যায়নি। অনুমতি ও GPS সেটিংস পরীক্ষা করুন।";
    },
    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000
    }
  );
});

/* =================================
   10. FIREBASE MESSAGE DISPLAY
================================= */

function displayMessages(list) {
  if (!messagesElement) return;

  messagesElement.replaceChildren();

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "এখনো কোনো মেসেজ নেই। প্রথম মেসেজটি পাঠান!";
    messagesElement.appendChild(empty);
    return;
  }

  list.forEach((item) => {
    const bubble = document.createElement("div");

    bubble.className =
      item.uid === currentUser?.uid ? "bubble mine" : "bubble";

    const sender = document.createElement("small");
    sender.textContent =
      item.uid === currentUser?.uid
        ? "আপনি"
        : "AYNA BOOK ব্যবহারকারী";

    const text = document.createElement("p");
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
  });

  messagesElement.scrollTop = messagesElement.scrollHeight;
}

/* =================================
   11. LISTEN FOR MESSAGES
================================= */

function listenForMessages() {
  if (!db || !currentUser) return;

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
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
    (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        .reverse();

      displayMessages(list);
      setStatus("Firebase সংযুক্ত হয়েছে।");

      if (sendButton) {
        sendButton.disabled = false;
      }
    },
    (error) => {
      console.error("Message loading error:", error);

      setStatus(
        "মেসেজ লোড হয়নি। Firebase Database ও Rules পরীক্ষা করুন।",
        true
      );

      if (sendButton) sendButton.disabled = true;
    }
  );
}

/* =================================
   12. SEND MESSAGE
================================= */

chatForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!db || !currentUser) {
    setStatus("Firebase সংযোগ প্রস্তুত নয়।", true);
    return;
  }

  if (sending) return;

  const text = messageInput?.value.trim() || "";

  if (!text) return;

  if (text.length > 2000) {
    setStatus("মেসেজ সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।", true);
    return;
  }

  sending = true;

  if (sendButton) sendButton.disabled = true;

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
      createdAt: serverTimestamp()
    });

    messageInput.value = "";

    if (translationResult) {
      translationResult.textContent = "";
    }

    setStatus("মেসেজ পাঠানো হয়েছে।");
  } catch (error) {
    console.error("Message sending error:", error);

    setStatus(
      "মেসেজ পাঠানো যায়নি। Firebase Rules ও সংযোগ পরীক্ষা করুন।",
      true
    );
  } finally {
    sending = false;

    if (sendButton) {
      sendButton.disabled = !currentUser;
    }
  }
});

/* =================================
   13. TRANSLATION PLACEHOLDER
   A real translation API is not connected.
================================= */

translateButton?.addEventListener("click", () => {
  const text = messageInput?.value.trim() || "";

  if (!translationResult) return;

  translationResult.textContent = text
    ? "স্বয়ংক্রিয় অনুবাদের জন্য Translation API সংযুক্ত করতে হবে।"
    : "প্রথমে অনুবাদের জন্য মেসেজ লিখুন।";
});

/* =================================
   14. START FIREBASE
================================= */

async function startFirebase() {
  try {
    const app = initializeApp(firebaseConfig);

    const auth = getAuth(app);
    db = getFirestore(app);

    setStatus("Firebase সংযোগ করা হচ্ছে...");

    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        listenForMessages();
        return;
      }

      currentUser = null;

      if (sendButton) sendButton.disabled = true;

      if (unsubscribeMessages) {
        unsubscribeMessages();
        unsubscribeMessages = null;
      }

      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in error:", error);

        setStatus(
          "লগইন ব্যর্থ। Firebase Anonymous Authentication চালু আছে কি না দেখুন।",
          true
        );
      });
    });
  } catch (error) {
    console.error("Firebase startup error:", error);

    setStatus(
      "Firebase চালু হয়নি। Config ও সংযোগ পরীক্ষা করুন।",
      true
    );
  }
}

startFirebase();
