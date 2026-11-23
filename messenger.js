
// ============================================================
// AYNA BOOK - MESSENGER
// Firebase Realtime Database Rules Compatible
// Firebase SDK 13.4.0
// ============================================================

import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  set,
  push,
  onValue,
  update,
  remove,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// ============================================================
// DOM ELEMENTS
// ============================================================

const $ = id => document.getElementById(id);

const E = {
  chatList: $("chatList"),
  chatSearch: $("chatSearch"),
  newChatBtn: $("newChatBtn"),

  chatPanel: $("chatPanel"),
  chatAvatar: $("chatAvatar"),
  chatName: $("chatName"),
  chatStatus: $("chatStatus"),

  messages: $("messages"),
  messageInput: $("messageInput"),
  sendBtn: $("sendBtn"),

  attachBtn: $("attachBtn"),
  emojiBtn: $("emojiBtn"),
  voiceBtn: $("voiceBtn"),

  imageBtn: $("imageBtn"),
  videoBtn: $("videoBtn"),
  audioBtn: $("audioBtn"),
  documentBtn: $("documentBtn"),
  locationBtn: $("locationBtn"),

  imageInput: $("imageInput"),
  videoInput: $("videoInput"),
  audioInput: $("audioInput"),
  documentInput: $("documentInput"),

  newChatModal: $("newChatModal"),
  userSearchInput: $("userSearchInput"),
  userSearchStatus: $("userSearchStatus"),
  userSearchResults: $("userSearchResults"),
  closeNewChatBtn: $("closeNewChatBtn"),

  callModal: $("callModal"),
  callTitle: $("callTitle"),
  callText: $("callText"),
  startCallBtn: $("startCallBtn"),
  closeCallBtn: $("closeCallBtn"),

  voiceCallBtn: $("voiceCallBtn"),
  videoCallBtn: $("videoCallBtn"),

  toast: $("toast")
};

// ============================================================
// STATE
// ============================================================

let me = null;
let currentChat = null;
let currentOtherUser = null;

let chatIndex = {};
let chatData = {};

let chatListUnsubscribe = null;
let messageUnsubscribe = null;
let typingUnsubscribe = null;
let presenceUnsubscribe = null;

let mediaRecorder = null;
let recordedChunks = [];
let recording = false;

let selectedCallType = "audio";
let pendingCallId = null;

const MAX_FILE_SIZE = 2 * 1024 * 1024;

// ============================================================
// HELPERS
// ============================================================

function toast(message) {
  if (!E.toast) {
    alert(message);
    return;
  }

  E.toast.textContent = message;
  E.toast.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    E.toast.classList.remove("show");
  }, 3000);
}

function safeText(value) {
  return String(value ?? "");
}

function escapeHTML(value) {
  return safeText(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function getInitial(name) {
  return safeText(name).trim().charAt(0).toUpperCase() || "?";
}

function makeAvatar(photo, name) {
  if (photo) {
    return `<img src="${escapeHTML(photo)}" alt="" class="ayna-avatar-image">`;
  }

  return `<span class="ayna-avatar-letter">${escapeHTML(getInitial(name))}</span>`;
}

function chatRef(chatId) {
  return ref(database, `chats/${chatId}`);
}

function messagesRef(chatId) {
  return ref(database, `messages/${chatId}`);
}

function isValidUid(uid) {
  return typeof uid === "string" && uid.length > 0 && uid !== me?.uid;
}

// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  me = user;

  await updateMyPresence();
  await loadMyProfile();
  await loadChatIndex();

  setupPresenceListener();

  if (E.chatName) {
    E.chatName.textContent = "একটি চ্যাট নির্বাচন করুন";
  }

  if (E.chatStatus) {
    E.chatStatus.textContent = "AYNA MESSENGER";
  }
});

// ============================================================
// USER PROFILE
// ============================================================

async function loadMyProfile() {
  try {
    const snapshot = await get(ref(database, `users/${me.uid}`));

    if (snapshot.exists()) {
      const profile = snapshot.val();

      if (profile.fullName && !me.displayName) {
        await updateProfile(me, {
          displayName: profile.fullName
        });
      }
    }
  } catch (error) {
    console.error("Profile error:", error);
  }
}

// ============================================================
// ONLINE PRESENCE
// ============================================================

async function updateMyPresence() {
  if (!me) return;

  const myPresenceRef = ref(database, `presence/${me.uid}`);

  try {
    await onDisconnect(myPresenceRef).set({
      online: false,
      lastSeen: Date.now()
    });

    await set(myPresenceRef, {
      online: true,
      lastSeen: Date.now()
    });
  } catch (error) {
    console.error("Presence error:", error);
  }
}

function setupPresenceListener() {
  if (!me) return;

  presenceUnsubscribe?.();

  presenceUnsubscribe = onValue(
    ref(database, `presence/${me.uid}`),
    snapshot => {
      if (snapshot.exists()) {
        updateMyPresence();
      }
    }
  );
}

// ============================================================
// LOAD CHAT INDEX
// ============================================================

async function loadChatIndex() {
  if (!me) return;

  chatListUnsubscribe?.();

  chatListUnsubscribe = onValue(
    ref(database, `userChats/${me.uid}`),

    async snapshot => {
      chatIndex = snapshot.val() || {};
      chatData = {};

      const chatIds = Object.keys(chatIndex);

      if (!chatIds.length) {
        renderChatList();
        return;
      }

      await Promise.all(
        chatIds.map(async chatId => {
          try {
            const chatSnapshot = await get(chatRef(chatId));

            if (chatSnapshot.exists()) {
              const data = chatSnapshot.val();

              if (data.members?.[me.uid] === true) {
                chatData[chatId] = data;
              }
            }
          } catch (error) {
            console.error("Chat load error:", error);
          }
        })
      );

      renderChatList();
    }
  );
}

// ============================================================
// RENDER CHAT LIST
// ============================================================

function renderChatList(filter = "") {
  if (!E.chatList) return;

  E.chatList.innerHTML = "";

  const search = filter.toLowerCase();

  const entries = Object.entries(chatData).filter(([chatId, chat]) => {
    const otherUid = Object.keys(chat.members || {})
      .find(uid => uid !== me.uid);

    const user = chat.users?.[otherUid] || {};

    const name = user.fullName || chat.otherName || "";

    return name.toLowerCase().includes(search);
  });

  entries.sort((a, b) => {
    return (b[1].updatedAt || b[1].createdAt || 0) -
           (a[1].updatedAt || a[1].createdAt || 0);
  });

  if (!entries.length) {
    E.chatList.innerHTML =
      '<div class="empty-chat-list">কোনো চ্যাট পাওয়া যায়নি</div>';
    return;
  }

  entries.forEach(([chatId, chat]) => {
    const otherUid = Object.keys(chat.members || {})
      .find(uid => uid !== me.uid);

    if (!otherUid) return;

    const user = chat.users?.[otherUid] || {};

    const name = user.fullName || chat.otherName || "AYNA User";
    const photo = user.photoURL || "";

    const item = document.createElement("button");

    item.type = "button";
    item.className =
      "chat-list-item" + (currentChat === chatId ? " active" : "");

    item.innerHTML = `
      <div class="chat-list-avatar">
        ${makeAvatar(photo, name)}
      </div>

      <div class="chat-list-info">
        <strong>${escapeHTML(name)}</strong>
        <small>চ্যাট খুলতে চাপ দিন</small>
      </div>
    `;

    item.addEventListener("click", () => {
      openChat(chatId, otherUid, user);
    });

    E.chatList.appendChild(item);
  });
}

// ============================================================
// OPEN CHAT
// ============================================================

async function openChat(chatId, otherUid, user = {}) {
  if (!me || !chatId || !otherUid) return;

  try {
    const snapshot = await get(chatRef(chatId));

    if (!snapshot.exists()) {
      toast("চ্যাট পাওয়া যায়নি");
      return;
    }

    const chat = snapshot.val();

    if (
      chat.members?.[me.uid] !== true ||
      chat.members?.[otherUid] !== true
    ) {
      toast("এই চ্যাটে প্রবেশের অনুমতি নেই");
      return;
    }

    currentChat = chatId;
    currentOtherUser = {
      uid: otherUid,
      ...user
    };

    if (E.chatName) {
      E.chatName.textContent =
        currentOtherUser.fullName || "AYNA User";
    }

    if (E.chatAvatar) {
      E.chatAvatar.innerHTML = makeAvatar(
        currentOtherUser.photoURL,
        currentOtherUser.fullName
      );
    }

    if (E.chatStatus) {
      E.chatStatus.textContent = "চ্যাট সংযুক্ত";
    }

    if (E.chatPanel) {
      E.chatPanel.classList.add("chat-open");
    }

    renderChatList(E.chatSearch?.value || "");
    watchMessages(chatId);
    watchTyping(chatId);
    watchOtherPresence(otherUid);

  } catch (error) {
    console.error(error);
    toast("চ্যাট খুলতে সমস্যা হয়েছে");
  }
}

// ============================================================
// LOAD MESSAGES
// ============================================================

function watchMessages(chatId) {
  messageUnsubscribe?.();

  if (E.messages) {
    E.messages.innerHTML = "";
  }

  messageUnsubscribe = onValue(
    messagesRef(chatId),

    snapshot => {
      if (!E.messages) return;

      E.messages.innerHTML = "";

      const messages = snapshot.val() || {};

      const entries = Object.entries(messages)
        .sort((a, b) =>
          (a[1].createdAt || 0) - (b[1].createdAt || 0)
        );

      entries.forEach(([messageId, message]) => {
        renderMessage(messageId, message);
      });

      E.messages.scrollTop = E.messages.scrollHeight;
    },

    error => {
      console.error("Message read error:", error);
      toast("মেসেজ লোড করা যাচ্ছে না");
    }
  );
}

// ============================================================
// RENDER MESSAGE
// ============================================================

function renderMessage(messageId, message) {
  if (!E.messages) return;

  const mine = message.uid === me.uid;

  const item = document.createElement("div");

  item.className = mine
    ? "message-item message-mine"
    : "message-item message-other";

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "";

  let content = "";

  if (message.type === "text") {
    content = `<div class="message-text">${escapeHTML(message.text || "")}</div>`;
  }

  else if (message.type === "image") {
    content = `
      <img
        src="${escapeHTML(message.media || "")}"
        alt="ছবি"
        class="message-media"
        loading="lazy"
      >
    `;
  }

  else if (message.type === "video") {
    content = `
      <video class="message-media" controls playsinline preload="metadata">
        <source src="${escapeHTML(message.media || "")}">
      </video>
    `;
  }

  else if (message.type === "audio") {
    content = `
      <audio controls preload="metadata">
        <source src="${escapeHTML(message.media || "")}">
      </audio>
    `;
  }

  else if (message.type === "document") {
    content = `
      <a href="${escapeHTML(message.media || "")}"
         download="${escapeHTML(message.fileName || "document")}">
        📄 ${escapeHTML(message.fileName || "ডকুমেন্ট")}
      </a>
    `;
  }

  else if (message.type === "location") {
    const lat = Number(message.latitude);
    const lng = Number(message.longitude);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const mapUrl =
        `https://www.google.com/maps?q=${lat},${lng}`;

      content = `
        <a href="${mapUrl}" target="_blank" rel="noopener">
          📍 লোকেশন দেখুন
        </a>
      `;
    }
  }

  item.innerHTML = `
    <div class="message-bubble">
      ${content}
      <small class="message-time">${escapeHTML(time)}</small>
    </div>
  `;

  E.messages.appendChild(item);
}

// ============================================================
// SEND MESSAGE - RULES COMPATIBLE
// ============================================================

async function sendMessage(type, extra = {}) {
  if (!me || !currentChat) {
    toast("প্রথমে একটি চ্যাট নির্বাচন করুন");
    return;
  }

  const message = {
    uid: me.uid,
    type,
    createdAt: Date.now(),
    ...extra
  };

  try {
    const newMessageRef = push(messagesRef(currentChat));

    await set(newMessageRef, message);

    await update(chatRef(currentChat), {
      updatedAt: Date.now(),
      lastMessage: type === "text"
        ? safeText(extra.text).slice(0, 100)
        : type
    });

    await set(
      ref(database, `typing/${currentChat}/${me.uid}`),
      false
    );

  } catch (error) {
    console.error("Send message error:", error);
    toast("মেসেজ পাঠানো যায়নি: " + error.message);
  }
}

// ============================================================
// SEND TEXT
// ============================================================

async function sendTextMessage() {
  const text = E.messageInput?.value.trim();

  if (!text) return;

  await sendMessage("text", { text });

  if (E.messageInput) {
    E.messageInput.value = "";
    E.messageInput.focus();
  }
}

E.sendBtn?.addEventListener("click", sendTextMessage);

E.messageInput?.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendTextMessage();
  }
});

// ============================================================
// TYPING STATUS
// ============================================================

function watchTyping(chatId) {
  typingUnsubscribe?.();

  typingUnsubscribe = onValue(
    ref(database, `typing/${chatId}`),

    snapshot => {
      const typingData = snapshot.val() || {};

      const someoneTyping = Object.entries(typingData).some(
        ([uid, value]) => uid !== me.uid && value === true
      );

      if (E.chatStatus) {
        E.chatStatus.textContent = someoneTyping
          ? "লিখছেন..."
          : "চ্যাট সংযুক্ত";
      }
    }
  );
}

async function setTyping(value) {
  if (!me || !currentChat) return;

  try {
    await set(
      ref(database, `typing/${currentChat}/${me.uid}`),
      Boolean(value)
    );
  } catch (error) {
    console.error("Typing error:", error);
  }
}

E.messageInput?.addEventListener("input", () => {
  setTyping(Boolean(E.messageInput.value.trim()));
});

// ============================================================
// OTHER USER ONLINE STATUS
// ============================================================

function watchOtherPresence(uid) {
  if (!uid) return;

  onValue(
    ref(database, `presence/${uid}`),

    snapshot => {
      const presence = snapshot.val() || {};

      if (E.chatStatus && currentOtherUser?.uid === uid) {
        E.chatStatus.textContent = presence.online
          ? "অনলাইন"
          : "অফলাইন";
      }
    }
  );
}

// ============================================================
// FILE TO DATA URL
// NOTE: RTDB IS NOT SUITABLE FOR LARGE MEDIA FILES.
// ============================================================

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

async function sendFile(file, type) {
  if (!file) return;

  if (!currentChat) {
    toast("প্রথমে একটি চ্যাট নির্বাচন করুন");
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast("ফাইল সর্বোচ্চ ২ MB হতে পারবে");
    return;
  }

  try {
    toast("ফাইল প্রস্তুত হচ্ছে...");

    const dataURL = await fileToDataURL(file);

    await sendMessage(type, {
      media: dataURL,
      fileName: file.name,
      mimeType: file.type
    });

    toast("ফাইল পাঠানো হয়েছে");

  } catch (error) {
    console.error(error);
    toast("ফাইল পাঠানো যায়নি");
  }
}

// ============================================================
// ATTACHMENT BUTTONS
// ============================================================

E.attachBtn?.addEventListener("click", () => {
  const menu = $("attachmentMenu");

  if (menu) {
    menu.hidden = !menu.hidden;
  } else {
    toast("ছবি, ভিডিও বা অডিও নির্বাচন করুন");
  }
});

E.imageBtn?.addEventListener("click", () => E.imageInput?.click());
E.videoBtn?.addEventListener("click", () => E.videoInput?.click());
E.audioBtn?.addEventListener("click", () => E.audioInput?.click());
E.documentBtn?.addEventListener("click", () => E.documentInput?.click());

E.imageInput?.addEventListener("change", event => {
  sendFile(event.target.files[0], "image");
  event.target.value = "";
});

E.videoInput?.addEventListener("change", event => {
  sendFile(event.target.files[0], "video");
  event.target.value = "";
});

E.audioInput?.addEventListener("change", event => {
  sendFile(event.target.files[0], "audio");
  event.target.value = "";
});

E.documentInput?.addEventListener("change", event => {
  sendFile(event.target.files[0], "document");
  event.target.value = "";
});

// ============================================================
// EMOJI
// ============================================================

E.emojiBtn?.addEventListener("click", () => {
  if (!E.messageInput) return;

  const emojis = ["😀", "😂", "😍", "❤️", "👍", "🙏", "🔥", "🎉"];

  const selected = prompt(
    "ইমোজি নির্বাচন করুন:\n" + emojis.join(" ")
  );

  if (selected) {
    E.messageInput.value += selected;
    E.messageInput.focus();
  }
});

// ============================================================
// LOCATION SHARING
// ============================================================

E.locationBtn?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    toast("আপনার ফোনে GPS পাওয়া যাচ্ছে না");
    return;
  }

  if (!currentChat) {
    toast("প্রথমে একটি চ্যাট নির্বাচন করুন");
    return;
  }

  toast("লোকেশন নেওয়া হচ্ছে...");

  navigator.geolocation.getCurrentPosition(
    async position => {
      await sendMessage("location", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      toast("লোকেশন পাঠানো হয়েছে");
    },

    error => {
      toast("লোকেশন পাওয়া যায়নি: " + error.message);
    },

    {
      enableHighAccuracy: true,
      timeout: 15000
    }
  );
});

// ============================================================
// VOICE RECORDING
// ============================================================

E.voiceBtn?.addEventListener("click", async () => {
  if (!currentChat) {
    toast("প্রথমে একটি চ্যাট নির্বাচন করুন");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    toast("এই ব্রাউজারে ভয়েস রেকর্ডিং সমর্থিত নয়");
    return;
  }

  if (recording) {
    mediaRecorder?.stop();
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, {
        type: mediaRecorder.mimeType || "audio/webm"
      });

      stream.getTracks().forEach(track => track.stop());

      recording = false;

      if (E.voiceBtn) {
        E.voiceBtn.textContent = "🎤";
      }

      if (blob.size > MAX_FILE_SIZE) {
        toast("রেকর্ডিং ২ MB-এর বেশি হয়েছে");
        return;
      }

      const file = new File(
        [blob],
        "ayna-voice-message.webm",
        { type: blob.type }
      );

      await sendFile(file, "audio");
    };

    mediaRecorder.start();
    recording = true;

    if (E.voiceBtn) {
      E.voiceBtn.textContent = "⏹";
    }

    toast("রেকর্ডিং চলছে। বন্ধ করতে আবার চাপ দিন।");

  } catch (error) {
    console.error(error);
    toast("মাইক্রোফোন ব্যবহারের অনুমতি দিন");
  }
});

// ============================================================
// USER SEARCH
// ============================================================

async function searchUsers(keyword) {
  if (!me || !E.userSearchResults) return;

  const search = keyword.trim().toLowerCase();

  E.userSearchResults.innerHTML = "";

  if (search.length < 2) {
    if (E.userSearchStatus) {
      E.userSearchStatus.textContent = "কমপক্ষে ২টি অক্ষর লিখুন";
    }
    return;
  }

  if (E.userSearchStatus) {
    E.userSearchStatus.textContent = "খোঁজা হচ্ছে...";
  }

  try {
    const snapshot = await get(ref(database, "userDirectory"));

    const directory = snapshot.val() || {};

    const results = Object.entries(directory)
      .filter(([uid, user]) => {
        if (uid === me.uid) return false;

        const name = safeText(user.fullName).toLowerCase();
        const aynaId = safeText(user.aynaId).toLowerCase();

        return name.includes(search) || aynaId.includes(search);
      })
      .slice(0, 30);

    E.userSearchResults.innerHTML = "";

    if (!results.length) {
      E.userSearchStatus.textContent = "কোনো ব্যবহারকারী পাওয়া যায়নি";
      return;
    }

    E.userSearchStatus.textContent =
      `${results.length} জন ব্যবহারকারী পাওয়া গেছে`;

    results.forEach(([uid, user]) => {
      const item = document.createElement("button");

      item.type = "button";
      item.className = "user-search-item";

      item.innerHTML = `
        <span class="user-search-avatar">
          ${makeAvatar(user.photoURL, user.fullName)}
        </span>

        <span class="user-search-info">
          <strong>${escapeHTML(user.fullName || "AYNA User")}</strong>
          <small>${escapeHTML(user.aynaId || "")}</small>
        </span>

        <span>চ্যাট</span>
      `;

      item.addEventListener("click", () => {
        startNewChat(uid, user);
      });

      E.userSearchResults.appendChild(item);
    });

  } catch (error) {
    console.error("User search error:", error);

    if (E.userSearchStatus) {
      E.userSearchStatus.textContent =
        "ব্যবহারকারী খুঁজতে সমস্যা হয়েছে";
    }
  }
}

let searchTimer = null;

E.userSearchInput?.addEventListener("input", () => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    searchUsers(E.userSearchInput.value);
  }, 350);
});

// ============================================================
// CREATE CHAT - DATABASE RULES COMPATIBLE
// ============================================================

async function startNewChat(otherUid, otherUser) {
  if (!me || !isValidUid(otherUid)) {
    toast("ব্যবহারকারী সঠিক নয়");
    return;
  }

  try {
    const myChatsSnapshot = await get(
      ref(database, `userChats/${me.uid}`)
    );

    const myChats = myChatsSnapshot.val() || {};

    // Check existing conversation
    for (const chatId of Object.keys(myChats)) {
      const snapshot = await get(chatRef(chatId));

      if (!snapshot.exists()) continue;

      const chat = snapshot.val();

      if (
        chat.members?.[me.uid] === true &&
        chat.members?.[otherUid] === true
      ) {
        closeNewChatModal();

        await openChat(chatId, otherUid, otherUser);

        return;
      }
    }

    // Create new chat
    const newChatRef = push(ref(database, "chats"));
    const chatId = newChatRef.key;

    const now = Date.now();

    const chatObject = {
      createdBy: me.uid,
      otherUid: otherUid,

      members: {
        [me.uid]: true,
        [otherUid]: true
      },

      users: {
        [me.uid]: {
          fullName: me.displayName || "AYNA User",
          photoURL: me.photoURL || ""
        },

        [otherUid]: {
          fullName: otherUser.fullName || "AYNA User",
          photoURL: otherUser.photoURL || ""
        }
      },

      createdAt: now,
      updatedAt: now
    };

    await set(newChatRef, chatObject);

    // Create both users' chat indexes
    await Promise.all([
      set(
        ref(database, `userChats/${me.uid}/${chatId}`),
        true
      ),

      set(
        ref(database, `userChats/${otherUid}/${chatId}`),
        true
      )
    ]);

    closeNewChatModal();

    await openChat(chatId, otherUid, otherUser);

    toast("নতুন চ্যাট তৈরি হয়েছে");

  } catch (error) {
    console.error("Create chat error:", error);

    toast("চ্যাট তৈরি হয়নি: " + error.message);
  }
}

// ============================================================
// NEW CHAT MODAL
// ============================================================

E.newChatBtn?.addEventListener("click", () => {
  if (E.newChatModal) {
    E.newChatModal.hidden = false;
  }

  if (E.userSearchInput) {
    E.userSearchInput.value = "";
    E.userSearchInput.focus();
  }

  if (E.userSearchResults) {
    E.userSearchResults.innerHTML = "";
  }

  if (E.userSearchStatus) {
    E.userSearchStatus.textContent =
      "নাম অথবা AYNA ID লিখুন";
  }
});

function closeNewChatModal() {
  if (E.newChatModal) {
    E.newChatModal.hidden = true;
  }
}

E.closeNewChatBtn?.addEventListener("click", closeNewChatModal);

// ============================================================
// CHAT SEARCH
// ============================================================

E.chatSearch?.addEventListener("input", () => {
  renderChatList(E.chatSearch.value);
});

// ============================================================
// AUDIO / VIDEO CALL REQUEST
// IMPORTANT: This is only a call request.
// It does NOT establish a real WebRTC call.
// ============================================================

async function createCallRequest(type) {
  if (!me || !currentOtherUser?.uid) {
    toast("প্রথমে একটি চ্যাট নির্বাচন করুন");
    return;
  }

  try {
    const callRef = push(ref(database, "calls"));

    const callObject = {
      from: me.uid,
      to: currentOtherUser.uid,
      type,
      status: "ringing",
      createdAt: Date.now()
    };

    await set(callRef, callObject);

    pendingCallId = callRef.key;
    selectedCallType = type;

    if (E.callModal) {
      E.callModal.hidden = false;
    }

    if (E.callTitle) {
      E.callTitle.textContent =
        type === "video" ? "ভিডিও কল" : "অডিও কল";
    }

    if (E.callText) {
      E.callText.textContent =
        "কল রিকোয়েস্ট পাঠানো হয়েছে। অপর ব্যবহারকারীর উত্তর অপেক্ষা করুন।";
    }

    if (E.startCallBtn) {
      E.startCallBtn.textContent = "কল রিকোয়েস্ট পাঠানো হয়েছে";
      E.startCallBtn.disabled = true;
    }

  } catch (error) {
    console.error("Call request error:", error);
    toast("কল রিকোয়েস্ট পাঠানো যায়নি: " + error.message);
  }
}

E.voiceCallBtn?.addEventListener("click", () => {
  createCallRequest("audio");
});

E.videoCallBtn?.addEventListener("click", () => {
  createCallRequest("video");
});

E.closeCallBtn?.addEventListener("click", () => {
  if (E.callModal) {
    E.callModal.hidden = true;
  }

  if (E.startCallBtn) {
    E.startCallBtn.disabled = false;
    E.startCallBtn.textContent = "কল শুরু করুন";
  }
});

// ============================================================
// MOBILE BACK BUTTON
// ============================================================

const backButton = $("backToChatsBtn");

backButton?.addEventListener("click", async () => {
  const oldChatId = currentChat;

  if (oldChatId && me) {
    try {
      await set(
        ref(database, `typing/${oldChatId}/${me.uid}`),
        false
      );
    } catch (error) {
      console.error(error);
    }
  }

  messageUnsubscribe?.();
  messageUnsubscribe = null;

  typingUnsubscribe?.();
  typingUnsubscribe = null;

  currentChat = null;
  currentOtherUser = null;

  if (E.chatPanel) {
    E.chatPanel.classList.remove("chat-open");
  }
});

// ============================================================
// CLEANUP
// ============================================================

window.addEventListener("beforeunload", () => {
  chatListUnsubscribe?.();
  messageUnsubscribe?.();
  typingUnsubscribe?.();
  presenceUnsubscribe?.();

  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
});

// ============================================================
// END OF AYNA MESSENGER
// ============================================================
