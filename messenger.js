
/* =========================================================
   AYNA BOOK - COMPLETE MESSENGER.JS
   Firebase Realtime Database
   Firebase SDK 13.4.0
   ========================================================= */

import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  set,
  update,
  push,
  onValue,
  onDisconnect,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// =========================================================
// 1. HTML ELEMENTS
// =========================================================

const E = {
  app: document.getElementById("app"),

  chatList: document.getElementById("chatList"),
  chatSearch: document.getElementById("chatSearch"),

  chatName: document.getElementById("chatName"),
  chatStatus: document.getElementById("chatStatus"),
  chatAvatar: document.getElementById("chatAvatar"),

  messages: document.getElementById("messages"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),

  attachBtn: document.getElementById("attachBtn"),
  attachMenu: document.getElementById("attachMenu"),

  imageBtn: document.getElementById("imageBtn"),
  videoBtn: document.getElementById("videoBtn"),
  audioBtn: document.getElementById("audioBtn"),
  documentBtn: document.getElementById("documentBtn"),
  locationBtn: document.getElementById("locationBtn"),

  imageInput: document.getElementById("imageInput"),
  videoInput: document.getElementById("videoInput"),
  audioInput: document.getElementById("audioInput"),
  documentInput: document.getElementById("documentInput"),

  voiceBtn: document.getElementById("voiceBtn"),
  emojiBtn: document.getElementById("emojiBtn"),

  voiceCallBtn: document.getElementById("voiceCallBtn"),
  videoCallBtn: document.getElementById("videoCallBtn"),

  callModal: document.getElementById("callModal"),
  callTitle: document.getElementById("callTitle"),
  callText: document.getElementById("callText"),
  startCallBtn: document.getElementById("startCallBtn"),
  closeCallBtn: document.getElementById("closeCallBtn"),

  newChatBtn: document.getElementById("newChatBtn"),
  newChatModal: document.getElementById("newChatModal"),
  userSearchInput: document.getElementById("userSearchInput"),
  userSearchResults: document.getElementById("userSearchResults"),
  userSearchStatus: document.getElementById("userSearchStatus"),
  closeNewChatBtn: document.getElementById("closeNewChatBtn"),

  mobileBack: document.getElementById("mobileBack"),
  toast: document.getElementById("toast")
};

// =========================================================
// 2. GLOBAL VARIABLES
// =========================================================

let me = null;
let profile = {};

let currentChat = null;
let otherUser = null;

let chatCache = {};
let chatListeners = {};

let indexUnsubscribe = null;
let messageUnsubscribe = null;
let presenceUnsubscribe = null;
let typingUnsubscribe = null;

let searchTimer = null;
let typingTimer = null;

let recorder = null;
let mediaStream = null;
let audioChunks = [];
let isRecording = false;

let selectedCallType = "";

// =========================================================
// 3. COMMON FUNCTIONS
// =========================================================

function toast(message) {
  if (!E.toast) {
    console.log(message);
    return;
  }

  E.toast.textContent = message;
  E.toast.classList.add("show");

  clearTimeout(E.toastTimer);

  E.toastTimer = setTimeout(() => {
    E.toast.classList.remove("show");
  }, 3000);
}

function getPhoto(photo) {
  if (typeof photo === "string" && photo.trim()) {
    return photo;
  }

  return "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
    '<rect width="100%" height="100%" fill="#dbeafe"/>' +
    '<circle cx="50" cy="38" r="20" fill="#64748b"/>' +
    '<path d="M15 100 Q20 65 50 65 Q80 65 85 100" fill="#64748b"/>' +
    '</svg>'
  );
}

function formatTime(timestamp) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function createChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

function getOtherUserId(members) {
  if (!members || !me) return null;

  return Object.keys(members).find(
    uid => uid !== me.uid && members[uid] === true
  ) || null;
}

function scrollToBottom() {
  if (E.messages) {
    E.messages.scrollTop = E.messages.scrollHeight;
  }
}

function showWelcome() {
  if (!E.messages) return;

  E.messages.innerHTML = "";

  const box = document.createElement("div");
  box.className = "empty-state";
  box.textContent = "আপনার কথোপকথন শুরু করুন";

  E.messages.appendChild(box);
}

// =========================================================
// 4. AUTHENTICATION
// =========================================================

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  me = user;

  try {
    await loadProfile();
    await setOnline();
    await loadChatIndex();
  } catch (error) {
    console.error("Messenger startup:", error);
    toast("Messenger চালু করা যায়নি");
  }
});

// =========================================================
// 5. LOAD PROFILE
// =========================================================

async function loadProfile() {
  const snapshot = await get(
    ref(database, "users/" + me.uid)
  );

  profile = snapshot.val() || {};

  profile.fullName =
    profile.fullName ||
    me.displayName ||
    "AYNA User";
}

// =========================================================
// 6. ONLINE / OFFLINE
// =========================================================

async function setOnline() {
  const presenceRef = ref(
    database,
    "presence/" + me.uid
  );

  await onDisconnect(presenceRef).set({
    online: false,
    lastSeen: Date.now()
  });

  await set(presenceRef, {
    online: true,
    lastSeen: Date.now()
  });
}

// =========================================================
// 7. LOAD CHAT INDEX
// =========================================================

async function loadChatIndex() {
  indexUnsubscribe?.();

  indexUnsubscribe = onValue(
    ref(database, "userChats/" + me.uid),

    snapshot => {
      const indexes = snapshot.val() || {};
      const activeIds = new Set(Object.keys(indexes));

      Object.keys(chatListeners).forEach(id => {
        if (!activeIds.has(id)) {
          chatListeners[id]?.();
          delete chatListeners[id];
          delete chatCache[id];
        }
      });

      Object.keys(indexes).forEach(chatId => {
        if (chatListeners[chatId]) return;

        chatListeners[chatId] = onValue(
          ref(database, "chats/" + chatId),

          chatSnapshot => {
            const chat = chatSnapshot.val();

            if (!chat) return;

            const uid = getOtherUserId(chat.members);

            if (!uid) return;

            chatCache[chatId] = {
              id: chatId,
              uid,
              name: chat.users?.[uid]?.name || "AYNA User",
              photo: chat.users?.[uid]?.photo || "",
              lastMessage: chat.lastMessage || "",
              updatedAt: chat.updatedAt || 0
            };

            renderChats();
          },

          error => {
            console.error("Chat listener:", error);
          }
        );
      });

      renderChats();
    },

    error => {
      console.error(error);
      toast("Chat List Permission Error");
    }
  );
}

// =========================================================
// 8. RENDER CHAT LIST
// =========================================================

function renderChats() {
  if (!E.chatList) return;

  E.chatList.innerHTML = "";

  const chats = Object.values(chatCache).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  if (!chats.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "এখনও কোনো Chat নেই";

    E.chatList.appendChild(empty);
    return;
  }

  chats.forEach(chat => {
    const item = document.createElement("div");

    item.className = "chat-item";

    if (currentChat === chat.id) {
      item.classList.add("active");
    }

    item.dataset.chat = chat.id;
    item.dataset.uid = chat.uid;
    item.dataset.name = chat.name;
    item.dataset.photo = chat.photo;

    const avatar = document.createElement("img");
    avatar.src = getPhoto(chat.photo);
    avatar.alt = "Profile";
    avatar.className = "chat-avatar";

    const info = document.createElement("div");
    info.className = "chat-item-info";

    const name = document.createElement("div");
    name.className = "chat-item-name";
    name.textContent = chat.name;

    const last = document.createElement("div");
    last.className = "chat-item-last";
    last.textContent = chat.lastMessage;

    info.append(name, last);
    item.append(avatar, info);

    E.chatList.appendChild(item);
  });

  filterChats();
}

function filterChats() {
  const search = (
    E.chatSearch?.value || ""
  ).toLowerCase();

  E.chatList?.querySelectorAll(".chat-item").forEach(item => {
    item.style.display =
      item.dataset.name.toLowerCase().includes(search)
        ? ""
        : "none";
  });
}

E.chatSearch?.addEventListener("input", filterChats);

// =========================================================
// 9. OPEN CHAT
// =========================================================

E.chatList?.addEventListener("click", event => {
  const item = event.target.closest(".chat-item");

  if (!item) return;

  openChat({
    id: item.dataset.chat,
    uid: item.dataset.uid,
    name: item.dataset.name,
    photo: item.dataset.photo
  });
});

function openChat(user) {
  currentChat = user.id;
  otherUser = user.uid;

  if (E.chatName) {
    E.chatName.textContent = user.name;
  }

  if (E.chatAvatar) {
    E.chatAvatar.src = getPhoto(user.photo);
  }

  E.app?.classList.add("chat-open");

  E.newChatModal?.classList.remove("show");

  renderChats();
  watchPresence();
  watchTyping();
  loadMessages();
}

// =========================================================
// 10. WATCH PRESENCE
// =========================================================

function watchPresence() {
  presenceUnsubscribe?.();
  presenceUnsubscribe = null;

  if (!otherUser) return;

  presenceUnsubscribe = onValue(
    ref(database, "presence/" + otherUser),

    snapshot => {
      const data = snapshot.val();

      if (!E.chatStatus) return;

      E.chatStatus.textContent =
        data?.online ? "● অনলাইন" : "অফলাইন";

      E.chatStatus.style.color =
        data?.online ? "#16a34a" : "";
    }
  );
}

// =========================================================
// 11. TYPING STATUS
// =========================================================

function watchTyping() {
  typingUnsubscribe?.();
  typingUnsubscribe = null;

  if (!currentChat) return;

  typingUnsubscribe = onValue(
    ref(database, "typing/" + currentChat),

    snapshot => {
      const data = snapshot.val() || {};

      const someoneTyping = Object.entries(data).some(
        ([uid, value]) =>
          uid !== me.uid && value === true
      );

      if (someoneTyping && E.chatStatus) {
        E.chatStatus.textContent = "লিখছেন...";
      }
    }
  );
}

async function setTyping(value) {
  if (!me || !currentChat) return;

  try {
    await set(
      ref(database, `typing/${currentChat}/${me.uid}`),
      value
    );
  } catch (error) {
    console.error("Typing:", error);
  }
}

// =========================================================
// 12. LOAD MESSAGES
// =========================================================

function loadMessages() {
  messageUnsubscribe?.();

  if (!E.messages || !currentChat) return;

  E.messages.innerHTML = "";

  const messageQuery = query(
    ref(database, "messages/" + currentChat),
    orderByChild("createdAt"),
    limitToLast(100)
  );

  messageUnsubscribe = onValue(
    messageQuery,

    snapshot => {
      E.messages.innerHTML = "";

      const data = snapshot.val();

      if (!data) {
        showWelcome();
        return;
      }

      Object.entries(data)
        .sort((a, b) =>
          (a[1].createdAt || 0) -
          (b[1].createdAt || 0)
        )
        .forEach(([id, message]) => {
          renderMessage(id, message);
        });

      scrollToBottom();
    },

    error => {
      console.error(error);
      toast("Message Permission Error");
    }
  );
}

// =========================================================
// 13. RENDER MESSAGE
// =========================================================

function renderMessage(id, message) {
  if (!E.messages) return;

  const mine = message.uid === me.uid;

  const bubble = document.createElement("div");

  bubble.className =
    "message " + (mine ? "mine" : "theirs");

  if (message.type === "text") {
    const text = document.createElement("div");

    text.className = "message-text";
    text.textContent = message.text || "";

    bubble.appendChild(text);
  }

  else if (message.type === "image") {
    const img = document.createElement("img");

    img.src = message.data || "";
    img.alt = "Shared image";
    img.loading = "lazy";
    img.style.maxWidth = "100%";

    bubble.appendChild(img);
  }

  else if (message.type === "video") {
    const video = document.createElement("video");

    video.src = message.data || "";
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.style.maxWidth = "100%";

    bubble.appendChild(video);
  }

  else if (message.type === "audio") {
    const audio = document.createElement("audio");

    audio.src = message.data || "";
    audio.controls = true;

    bubble.appendChild(audio);
  }

  else if (message.type === "document") {
    const link = document.createElement("a");

    link.href = message.data || "";
    link.download = message.fileName || "document";
    link.textContent =
      "📄 " + (message.fileName || "Document");

    bubble.appendChild(link);
  }

  else if (message.type === "location") {
    const link = document.createElement("a");

    const coordinates =
      `${message.lat},${message.lon}`;

    link.href =
      "https://www.google.com/maps?q=" +
      encodeURIComponent(coordinates);

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "📍 Google Maps-এ লোকেশন দেখুন";

    bubble.appendChild(link);
  }

  const meta = document.createElement("div");

  meta.className = "message-time";

  meta.textContent =
    formatTime(message.createdAt) +
    (mine ? " ✓✓" : "");

  bubble.appendChild(meta);
  E.messages.appendChild(bubble);
}

// =========================================================
// 14. SEND MESSAGE
// =========================================================

async function sendMessage(data) {
  if (!me || !currentChat) {
    throw new Error("আগে একটি Chat নির্বাচন করুন");
  }

  const messageRef = push(
    ref(database, "messages/" + currentChat)
  );

  const message = {
    ...data,
    uid: me.uid,
    senderName: profile.fullName || "AYNA User",
    createdAt: Date.now()
  };

  await set(messageRef, message);

  const labels = {
    text: message.text,
    image: "🖼️ ছবি",
    video: "🎬 ভিডিও",
    audio: "🎵 অডিও",
    document: "📄 ডকুমেন্ট",
    location: "📍 লোকেশন"
  };

  await update(
    ref(database, "chats/" + currentChat),
    {
      lastMessage: labels[message.type] || "নতুন মেসেজ",
      updatedAt: Date.now()
    }
  );
}

// =========================================================
// 15. TEXT MESSAGE
// =========================================================

async function sendText() {
  const text = E.messageInput?.value.trim();

  if (!text) return;

  try {
    await sendMessage({
      type: "text",
      text
    });

    E.messageInput.value = "";
    E.messageInput.style.height = "auto";

    setTyping(false);

  } catch (error) {
    console.error(error);
    toast(error.message || "মেসেজ পাঠানো যায়নি");
  }
}

E.sendBtn?.addEventListener("click", sendText);

E.messageInput?.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendText();
  }
});

E.messageInput?.addEventListener("input", () => {
  E.messageInput.style.height = "auto";

  E.messageInput.style.height =
    Math.min(E.messageInput.scrollHeight, 120) + "px";

  setTyping(true);

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    setTyping(false);
  }, 1500);
});

// =========================================================
// 16. ATTACHMENT MENU
// =========================================================

E.attachBtn?.addEventListener("click", () => {
  E.attachMenu?.classList.toggle("show");
});

function selectFile(button, input, type) {
  if (!button || !input) return;

  button.addEventListener("click", () => {
    E.attachMenu?.classList.remove("show");
    input.click();
  });

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    input.value = "";

    if (file) {
      await sendMedia(file, type);
    }
  });
}

selectFile(E.imageBtn, E.imageInput, "image");
selectFile(E.videoBtn, E.videoInput, "video");
selectFile(E.audioBtn, E.audioInput, "audio");
selectFile(E.documentBtn, E.documentInput, "document");

// =========================================================
// 17. MEDIA FILE SENDING
// =========================================================

async function sendMedia(file, type) {
  if (!currentChat) {
    toast("আগে Chat নির্বাচন করুন");
    return;
  }

  const MAX_SIZE = 2 * 1024 * 1024;

  if (file.size > MAX_SIZE) {
    toast("সর্বোচ্চ 2MB ফাইল পাঠানো যাবে");
    return;
  }

  if (type === "image" && !file.type.startsWith("image/")) {
    toast("সঠিক ছবি নির্বাচন করুন");
    return;
  }

  if (type === "video" && !file.type.startsWith("video/")) {
    toast("সঠিক ভিডিও নির্বাচন করুন");
    return;
  }

  if (type === "audio" && !file.type.startsWith("audio/")) {
    toast("সঠিক অডিও নির্বাচন করুন");
    return;
  }

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      await sendMessage({
        type,
        data: reader.result,
        fileName: file.name,
        mimeType: file.type,
        size: file.size
      });

      toast("ফাইল পাঠানো হয়েছে");

    } catch (error) {
      console.error(error);
      toast("ফাইল পাঠানো যায়নি");
    }
  };

  reader.onerror = () => {
    toast("ফাইল পড়া যায়নি");
  };

  reader.readAsDataURL(file);
}

// =========================================================
// 18. VOICE RECORDING
// =========================================================

E.voiceBtn?.addEventListener("click", async () => {
  if (isRecording) {
    stopVoiceRecording();
  } else {
    await startVoiceRecording();
  }
});

async function startVoiceRecording() {
  if (!currentChat) {
    toast("আগে Chat নির্বাচন করুন");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    toast("Microphone ব্যবহারে HTTPS প্রয়োজন");
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    audioChunks = [];

    recorder = new MediaRecorder(mediaStream);

    recorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(audioChunks, {
        type: recorder.mimeType || "audio/webm"
      });

      mediaStream?.getTracks().forEach(track => {
        track.stop();
      });

      mediaStream = null;

      if (blob.size > 2 * 1024 * 1024) {
        toast("Voice ফাইল 2MB সীমা ছাড়িয়েছে");
        return;
      }

      const reader = new FileReader();

      reader.onload = async () => {
        try {
          await sendMessage({
            type: "audio",
            data: reader.result,
            fileName: "voice-message.webm",
            mimeType: blob.type,
            size: blob.size
          });

          toast("Voice Message পাঠানো হয়েছে");

        } catch (error) {
          console.error(error);
          toast("Voice পাঠানো যায়নি");
        }
      };

      reader.onerror = () => toast("Voice ফাইল পড়া যায়নি");

      reader.readAsDataURL(blob);
    };

    recorder.start();
    isRecording = true;

    if (E.voiceBtn) E.voiceBtn.textContent = "⏹";

    toast("রেকর্ডিং চলছে");

  } catch (error) {
    console.error(error);
    toast("Microphone Permission দিন");
  }
}

function stopVoiceRecording() {
  if (!recorder || !isRecording) return;

  recorder.stop();
  isRecording = false;

  if (E.voiceBtn) {
    E.voiceBtn.textContent = "🎙";
  }
}

// =========================================================
// 19. EMOJI
// =========================================================

E.emojiBtn?.addEventListener("click", () => {
  if (!E.messageInput) return;

  const emojis = [
    "😀", "😂", "😍", "🥰", "😘",
    "😎", "👍", "❤️", "🔥", "🎉",
    "👏", "🙏", "😊", "😢", "😮",
    "🤣", "💯", "✨", "🌹", "🤝"
  ];

  const emoji = emojis[
    Math.floor(Math.random() * emojis.length)
  ];

  E.messageInput.value += emoji;
  E.messageInput.focus();
});

// =========================================================
// 20. GPS LOCATION
// =========================================================

E.locationBtn?.addEventListener("click", () => {
  E.attachMenu?.classList.remove("show");

  if (!currentChat) {
    toast("আগে Chat নির্বাচন করুন");
    return;
  }

  if (!navigator.geolocation) {
    toast("GPS পাওয়া যায়নি");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        await sendMessage({
          type: "location",
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });

        toast("Location পাঠানো হয়েছে");

      } catch (error) {
        console.error(error);
        toast("Location পাঠানো যায়নি");
      }
    },

    error => {
      console.error(error);
      toast("GPS Permission দিন");

    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
});

// =========================================================
// 21. NEW CHAT MODAL
// =========================================================

E.newChatBtn?.addEventListener("click", () => {
  E.newChatModal?.classList.add("show");

  if (E.userSearchInput) {
    E.userSearchInput.value = "";
    E.userSearchInput.focus();
  }

  if (E.userSearchResults) {
    E.userSearchResults.innerHTML = "";
  }

  if (E.userSearchStatus) {
    E.userSearchStatus.textContent =
      "নাম অথবা AYNA ID দিয়ে খুঁজুন";
  }
});

E.closeNewChatBtn?.addEventListener("click", () => {
  E.newChatModal?.classList.remove("show");
});

// =========================================================
// 22. SEARCH USERS
// =========================================================

E.userSearchInput?.addEventListener("input", () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(searchUsers, 400);
});

async function searchUsers() {
  const term = (
    E.userSearchInput?.value || ""
  ).trim().toLowerCase();

  if (!E.userSearchResults) return;

  E.userSearchResults.innerHTML = "";

  if (term.length < 2) {
    if (E.userSearchStatus) {
      E.userSearchStatus.textContent =
        "কমপক্ষে ২টি অক্ষর লিখুন";
    }
    return;
  }

  if (E.userSearchStatus) {
    E.userSearchStatus.textContent = "খোঁজা হচ্ছে...";
  }

  try {
    const snapshot = await get(
      ref(database, "userDirectory")
    );

    const users = snapshot.val() || {};

    const matches = Object.values(users).filter(user => {
      if (!user.uid || user.uid === me.uid) return false;

      const name = (user.fullName || "").toLowerCase();
      const id = (user.aynaId || "").toLowerCase();
      const country = (user.country || "").toLowerCase();

      return (
        name.includes(term) ||
        id.includes(term) ||
        country.includes(term)
      );
    }).slice(0, 30);

    E.userSearchResults.innerHTML = "";

    if (!matches.length) {
      E.userSearchStatus.textContent =
        "কোনো ব্যবহারকারী পাওয়া যায়নি";
      return;
    }

    E.userSearchStatus.textContent =
      matches.length + " জন ব্যবহারকারী পাওয়া গেছে";

    matches.forEach(user => {
      const item = document.createElement("div");
      item.className = "chat-item";

      const img = document.createElement("img");
      img.className = "chat-avatar";
      img.src = getPhoto(user.photoURL);
      img.alt = "Profile";

      const info = document.createElement("div");
      info.className = "chat-item-info";

      const name = document.createElement("div");
      name.className = "chat-item-name";
      name.textContent = user.fullName || "AYNA User";

      const id = document.createElement("div");
      id.className = "chat-item-last";
      id.textContent = user.aynaId || "";

      info.append(name, id);
      item.append(img, info);

      item.addEventListener("click", () => {
        startNewChat(user);
      });

      E.userSearchResults.appendChild(item);
    });

  } catch (error) {
    console.error(error);

    E.userSearchStatus.textContent =
      "User Search Permission Error";
  }
}

// =========================================================
// 23. CREATE OR OPEN CHAT
// =========================================================

async function startNewChat(user) {
  if (!me || !user.uid || user.uid === me.uid) return;

  const id = createChatId(me.uid, user.uid);
  const chatRef = ref(database, "chats/" + id);

  try {
    const snapshot = await get(chatRef);

    if (!snapshot.exists()) {
      const chat = {
        members: {
          [me.uid]: true,
          [user.uid]: true
        },

        users: {
          [me.uid]: {
            name: profile.fullName || "AYNA User",
            photo: profile.photoURL || ""
          },

          [user.uid]: {
            name: user.fullName || "AYNA User",
            photo: user.photoURL || ""
          }
        },

        lastMessage: "",
        updatedAt: Date.now()
      };

      await set(chatRef, chat);
    }

    await set(
      ref(database, `userChats/${me.uid}/${id}`),
      true
    );

    await set(
      ref(database, `userChats/${user.uid}/${id}`),
      true
    );

    openChat({
      id,
      uid: user.uid,
      name: user.fullName || "AYNA User",
      photo: user.photoURL || ""
    });

  } catch (error) {
    console.error(error);
    toast("Chat তৈরি করা যায়নি");
  }
}

// =========================================================
// 24. CALL REQUEST MODAL
// =========================================================

function openCallModal(type) {
  if (!currentChat || !otherUser) {
    toast("আগে একজন ব্যবহারকারী নির্বাচন করুন");
    return;
  }

  selectedCallType = type;

  if (E.callTitle) {
    E.callTitle.textContent =
      type === "video" ? "ভিডিও কল" : "ভয়েস কল";
  }

  if (E.callText) {
    E.callText.textContent =
      "আপনি কি কলের অনুরোধ পাঠাতে চান?";
  }

  E.callModal?.classList.add("show");
}

E.voiceCallBtn?.addEventListener("click", () => {
  openCallModal("voice");
});

E.videoCallBtn?.addEventListener("click", () => {
  openCallModal("video");
});

E.closeCallBtn?.addEventListener("click", () => {
  E.callModal?.classList.remove("show");
});

// =========================================================
// 25. SEND CALL REQUEST
// =========================================================

E.startCallBtn?.addEventListener("click", async () => {
  if (!me || !currentChat || !otherUser) {
    toast("Chat নির্বাচন করুন");
    return;
  }

  try {
    const callRef = push(ref(database, "calls"));

    await set(callRef, {
      callId: callRef.key,
      chatId: currentChat,
      callerId: me.uid,
      receiverId: otherUser,
      type: selectedCallType,
      status: "ringing",
      createdAt: Date.now()
    });

    E.callModal?.classList.remove("show");

    toast("কলের অনুরোধ পাঠানো হয়েছে");

  } catch (error) {
    console.error(error);
    toast("কলের অনুরোধ পাঠানো যায়নি");
  }
});

// =========================================================
// 26. MOBILE BACK BUTTON
// =========================================================

E.mobileBack?.addEventListener("click", () => {
  E.app?.classList.remove("chat-open");

  currentChat = null;
  otherUser = null;

  messageUnsubscribe?.();
  presenceUnsubscribe?.();
  typingUnsubscribe?.();

  messageUnsubscribe = null;
  presenceUnsubscribe = null;
  typingUnsubscribe = null;

  setTyping(false);
});

// =========================================================
// 27. CLOSE ATTACHMENT MENU
// =========================================================

document.addEventListener("click", event => {
  if (
    E.attachMenu &&
    E.attachBtn &&
    !E.attachMenu.contains(event.target) &&
    !E.attachBtn.contains(event.target)
  ) {
    E.attachMenu.classList.remove("show");
  }
});

// =========================================================
// 28. PAGE CLEANUP
// =========================================================

window.addEventListener("pagehide", () => {
  indexUnsubscribe?.();
  messageUnsubscribe?.();
  presenceUnsubscribe?.();
  typingUnsubscribe?.();

  Object.values(chatListeners).forEach(unsubscribe => {
    unsubscribe?.();
  });

  if (isRecording && recorder) {
    try {
      recorder.stop();
    } catch (error) {
      console.error(error);
    }
  }

  mediaStream?.getTracks().forEach(track => {
    track.stop();
  });
});

// =========================================================
// 29. END OF AYNA MESSENGER.JS
// =========================================================
