
import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref, get, set, push, onValue, update, onDisconnect
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// =====================================================
// AYNA BOOK REAL MESSENGER
// Firebase RTDB + WebRTC
// =====================================================

const $ = id => document.getElementById(id);

const ui = {
  main: $("main"),
  chatList: $("chatList"),
  chatSearch: $("chatSearch"),
  chatPanel: $("chatPanel"),
  chatName: $("chatName"),
  chatStatus: $("chatStatus"),
  messages: $("messages"),
  messageInput: $("messageInput"),
  sendBtn: $("sendBtn"),

  newChatBtn: $("newChatBtn"),
  newChatModal: $("newChatModal"),
  userSearch: $("userSearch"),
  searchStatus: $("searchStatus"),
  searchResults: $("searchResults"),
  closeSearch: $("closeSearch"),

  fileBtn: $("fileBtn"),
  fileInput: $("fileInput"),
  recordBtn: $("recordBtn"),
  emojiBtn: $("emojiBtn"),

  audioCallBtn: $("audioCallBtn"),
  videoCallBtn: $("videoCallBtn"),

  incomingModal: $("incomingModal"),
  incomingTitle: $("incomingTitle"),
  incomingText: $("incomingText"),
  acceptCall: $("acceptCall"),
  rejectCall: $("rejectCall"),

  callModal: $("callModal"),
  callTitle: $("callTitle"),
  callStatus: $("callStatus"),
  localVideo: $("localVideo"),
  remoteVideo: $("remoteVideo"),
  muteBtn: $("muteBtn"),
  cameraBtn: $("cameraBtn"),
  endCallBtn: $("endCallBtn"),

  backBtn: $("backBtn"),
  toast: $("toast")
};

let me = null;
let currentChat = null;
let currentOther = null;

let chatIndex = {};
let chatObjects = {};

let chatListStop = null;
let messageStop = null;
let typingStop = null;
let incomingStop = null;
let callStop = null;
let remoteCandidateStop = null;
let presenceStop = null;

let peer = null;
let localStream = null;
let remoteStream = null;

let activeCallId = null;
let activeCallRole = null;
let pendingIncomingCall = null;

let recorder = null;
let recorderStream = null;
let recordingParts = [];
let isRecording = false;

let candidateQueue = [];
let remoteDescriptionReady = false;

const MAX_FILE_SIZE = 180 * 1024;

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    },
    {
      urls: "stun:stun1.l.google.com:19302"
    }
  ]
};

// =====================================================
// HELPERS
// =====================================================

function toast(message) {
  if (!ui.toast) {
    alert(message);
    return;
  }

  ui.toast.textContent = message;
  ui.toast.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    ui.toast.classList.remove("show");
  }, 3000);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function userName(user) {
  return user?.fullName || user?.displayName || "AYNA User";
}

function userPhoto(user) {
  return user?.photoURL || "";
}

function db(path) {
  return ref(database, path);
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function showModal(element, show = true) {
  if (element) element.hidden = !show;
}

// =====================================================
// AUTH
// =====================================================

onAuthStateChanged(auth, async user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  me = user;

  await setMyDirectory();
  await setupPresence();
  await loadChatIndex();
  listenForIncomingCalls();

  toast("AYNA Messenger সংযুক্ত হয়েছে");
});

// =====================================================
// PUBLIC USER DIRECTORY
// =====================================================

async function setMyDirectory() {
  try {
    const profileSnap = await get(db(`users/${me.uid}`));
    const profile = profileSnap.val() || {};

    await set(db(`userDirectory/${me.uid}`), {
      uid: me.uid,
      fullName: profile.fullName || me.displayName || "AYNA User",
      photoURL: profile.photoURL || me.photoURL || "",
      aynaId: profile.aynaId || ""
    });
  } catch (error) {
    console.error("Directory:", error);
  }
}

// =====================================================
// PRESENCE
// =====================================================

async function setupPresence() {
  const presenceRef = db(`presence/${me.uid}`);

  try {
    await onDisconnect(presenceRef).set({
      online: false,
      lastSeen: Date.now()
    });

    await set(presenceRef, {
      online: true,
      lastSeen: Date.now()
    });
  } catch (error) {
    console.error("Presence:", error);
  }

  document.addEventListener("visibilitychange", async () => {
    try {
      await set(presenceRef, {
        online: !document.hidden,
        lastSeen: Date.now()
      });
    } catch (error) {
      console.error(error);
    }
  });
}

// =====================================================
// CHAT INDEX
// =====================================================

async function loadChatIndex() {
  chatListStop?.();

  chatListStop = onValue(
    db(`userChats/${me.uid}`),
    async snapshot => {
      chatIndex = snapshot.val() || {};
      chatObjects = {};

      await Promise.all(
        Object.keys(chatIndex).map(async chatId => {
          try {
            const snap = await get(db(`chats/${chatId}`));
            if (snap.exists()) {
              const chat = snap.val();

              if (chat.members?.[me.uid] === true) {
                chatObjects[chatId] = chat;
              }
            }
          } catch (error) {
            console.error(error);
          }
        })
      );

      renderChatList();
    }
  );
}

// =====================================================
// RENDER CHAT LIST
// =====================================================

function renderChatList() {
  if (!ui.chatList) return;

  ui.chatList.innerHTML = "";

  const filter = (ui.chatSearch?.value || "").toLowerCase();

  const entries = Object.entries(chatObjects).filter(([, chat]) => {
    const otherUid = Object.keys(chat.members || {})
      .find(uid => uid !== me.uid);

    const other = chat.users?.[otherUid] || {};

    return userName(other).toLowerCase().includes(filter);
  });

  if (!entries.length) {
    ui.chatList.textContent = "কোনো চ্যাট নেই। নতুন চ্যাট শুরু করুন।";
    return;
  }

  entries.forEach(([chatId, chat]) => {
    const otherUid = Object.keys(chat.members || {})
      .find(uid => uid !== me.uid);

    if (!otherUid) return;

    const other = chat.users?.[otherUid] || {};

    const button = document.createElement("button");
    button.className = "chat-item" +
      (currentChat === chatId ? " active" : "");

    button.innerHTML = `
      <strong>${esc(userName(other))}</strong>
      <small>চ্যাট খুলতে চাপ দিন</small>
    `;

    button.addEventListener("click", () => {
      openChat(chatId, otherUid, other);
    });

    ui.chatList.appendChild(button);
  });
}

ui.chatSearch?.addEventListener("input", renderChatList);

// =====================================================
// OPEN CHAT
// =====================================================

async function openChat(chatId, otherUid, otherUser) {
  try {
    const snap = await get(db(`chats/${chatId}`));

    if (!snap.exists()) {
      toast("চ্যাট পাওয়া যায়নি");
      return;
    }

    const chat = snap.val();

    if (
      chat.members?.[me.uid] !== true ||
      chat.members?.[otherUid] !== true
    ) {
      toast("চ্যাটে প্রবেশের অনুমতি নেই");
      return;
    }

    currentChat = chatId;
    currentOther = {
      uid: otherUid,
      ...otherUser
    };

    ui.chatName.textContent = userName(currentOther);
    ui.chatStatus.textContent = "সংযুক্ত";

    ui.chatPanel.classList.add("open");
    ui.main.classList.add("chatting");

    watchMessages(chatId);
    watchTyping(chatId);
    watchOtherPresence(otherUid);

    renderChatList();

  } catch (error) {
    console.error(error);
    toast("চ্যাট খুলতে সমস্যা হয়েছে");
  }
}

// =====================================================
// MESSAGES
// =====================================================

function watchMessages(chatId) {
  messageStop?.();

  messageStop = onValue(
    db(`messages/${chatId}`),
    snapshot => {
      ui.messages.innerHTML = "";

      const messages = snapshot.val() || {};

      Object.entries(messages)
        .sort((a, b) =>
          (a[1].createdAt || 0) - (b[1].createdAt || 0)
        )
        .forEach(([id, message]) => {
          renderMessage(id, message);
        });

      ui.messages.scrollTop = ui.messages.scrollHeight;
    },
    error => {
      console.error(error);
      toast("মেসেজ পড়া যাচ্ছে না");
    }
  );
}

function renderMessage(id, message) {
  const mine = message.uid === me.uid;

  const item = document.createElement("div");
  item.className = "msg " + (mine ? "mine" : "other");

  let content = "";

  if (message.type === "text") {
    content = `<div>${esc(message.text || "")}</div>`;
  } else if (message.type === "image") {
    content = `<img src="${esc(message.media)}" alt="ছবি">`;
  } else if (message.type === "video") {
    content = `<video controls playsinline src="${esc(message.media)}"></video>`;
  } else if (message.type === "audio") {
    content = `<audio controls src="${esc(message.media)}"></audio>`;
  } else if (message.type === "document") {
    content = `<a href="${esc(message.media)}" download="${esc(message.fileName || "file")}">${esc(message.fileName || "ডকুমেন্ট ডাউনলোড")}</a>`;
  }

  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString()
    : "";

  item.innerHTML = `${content}<small>${esc(time)}</small>`;

  ui.messages.appendChild(item);
}

async function sendMessage(type, data = {}) {
  if (!currentChat) {
    toast("প্রথমে চ্যাট নির্বাচন করুন");
    return;
  }

  const message = {
    uid: me.uid,
    type,
    createdAt: Date.now(),
    ...data
  };

  try {
    const newRef = push(db(`messages/${currentChat}`));
    await set(newRef, message);

    await set(db(`typing/${currentChat}/${me.uid}`), false);
  } catch (error) {
    console.error(error);
    toast("মেসেজ পাঠানো যায়নি: " + error.message);
  }
}

async function sendText() {
  const text = ui.messageInput.value.trim();

  if (!text) return;

  await sendMessage("text", { text });

  ui.messageInput.value = "";
  ui.messageInput.focus();
}

ui.sendBtn.addEventListener("click", sendText);

ui.messageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendText();
  }
});

// =====================================================
// TYPING
// =====================================================

let typingTimer;

ui.messageInput.addEventListener("input", () => {
  if (!currentChat) return;

  set(db(`typing/${currentChat}/${me.uid}`), true)
    .catch(console.error);

  clearTimeout(typingTimer);

  typingTimer = setTimeout(() => {
    if (currentChat) {
      set(db(`typing/${currentChat}/${me.uid}`), false)
        .catch(console.error);
    }
  }, 1500);
});

function watchTyping(chatId) {
  typingStop?.();

  typingStop = onValue(
    db(`typing/${chatId}`),
    snapshot => {
      const data = snapshot.val() || {};

      const someone = Object.entries(data).some(
        ([uid, value]) => uid !== me.uid && value === true
      );

      if (someone) {
        ui.chatStatus.textContent = "লিখছেন...";
      }
    }
  );
}

function watchOtherPresence(uid) {
  onValue(db(`presence/${uid}`), snapshot => {
    if (currentOther?.uid !== uid) return;

    const data = snapshot.val() || {};

    ui.chatStatus.textContent = data.online
      ? "অনলাইন"
      : "অফলাইন";
  });
}

// =====================================================
// USER SEARCH
// =====================================================

ui.newChatBtn.addEventListener("click", () => {
  showModal(ui.newChatModal);
  ui.userSearch.value = "";
  ui.searchResults.innerHTML = "";
  ui.searchStatus.textContent = "নাম অথবা AYNA ID লিখুন";
});

ui.closeSearch.addEventListener("click", () => {
  showModal(ui.newChatModal, false);
});

let searchTimer;

ui.userSearch.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(searchUsers, 400);
});

async function searchUsers() {
  const term = ui.userSearch.value.trim().toLowerCase();

  ui.searchResults.innerHTML = "";

  if (term.length < 2) {
    ui.searchStatus.textContent = "কমপক্ষে ২টি অক্ষর লিখুন";
    return;
  }

  ui.searchStatus.textContent = "খোঁজা হচ্ছে...";

  try {
    const snap = await get(db("userDirectory"));
    const users = snap.val() || {};

    const matches = Object.entries(users)
      .filter(([uid, user]) =>
        uid !== me.uid &&
        (
          userName(user).toLowerCase().includes(term) ||
          String(user.aynaId || "").toLowerCase().includes(term)
        )
      )
      .slice(0, 25);

    ui.searchStatus.textContent =
      matches.length + " জন পাওয়া গেছে";

    matches.forEach(([uid, user]) => {
      const button = document.createElement("button");
      button.className = "user-result";
      button.textContent = userName(user);

      button.addEventListener("click", () => {
        createOrOpenChat(uid, user);
      });

      ui.searchResults.appendChild(button);
    });

  } catch (error) {
    console.error(error);
    ui.searchStatus.textContent = "ব্যবহারকারী খোঁজা যায়নি";
  }
}

// =====================================================
// CREATE OR OPEN CHAT
// =====================================================

async function createOrOpenChat(otherUid, otherUser) {
  if (!otherUid || otherUid === me.uid) return;

  try {
    const snap = await get(db(`userChats/${me.uid}`));
    const existing = snap.val() || {};

    for (const chatId of Object.keys(existing)) {
      const chatSnap = await get(db(`chats/${chatId}`));

      if (!chatSnap.exists()) continue;

      const chat = chatSnap.val();

      if (
        chat.members?.[me.uid] === true &&
        chat.members?.[otherUid] === true
      ) {
        showModal(ui.newChatModal, false);
        await openChat(chatId, otherUid, otherUser);
        return;
      }
    }

    const chatRef = push(db("chats"));
    const chatId = chatRef.key;
    const now = Date.now();

    await set(chatRef, {
      createdBy: me.uid,
      otherUid,
      members: {
        [me.uid]: true,
        [otherUid]: true
      },
      createdAt: now
    });

    await Promise.all([
      set(db(`userChats/${me.uid}/${chatId}`), true),
      set(db(`userChats/${otherUid}/${chatId}`), true)
    ]);

    showModal(ui.newChatModal, false);

    await openChat(chatId, otherUid, otherUser);

  } catch (error) {
    console.error(error);
    toast("চ্যাট তৈরি হয়নি: " + error.message);
  }
}

// =====================================================
// SMALL FILE SHARING
// =====================================================

ui.fileBtn.addEventListener("click", () => {
  if (!currentChat) {
    toast("আগে চ্যাট নির্বাচন করুন");
    return;
  }

  ui.fileInput.click();
});

ui.fileInput.addEventListener("change", async () => {
  const file = ui.fileInput.files?.[0];

  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    toast("Free RTDB সংস্করণে ফাইল ১৮০ KB-এর মধ্যে রাখুন");
    ui.fileInput.value = "";
    return;
  }

  let type;

  if (file.type.startsWith("image/")) type = "image";
  else if (file.type.startsWith("video/")) type = "video";
  else if (file.type.startsWith("audio/")) type = "audio";
  else type = "document";

  try {
    const media = await fileToDataURL(file);

    await sendMessage(type, {
      media,
      fileName: file.name,
      mimeType: file.type
    });

  } catch (error) {
    console.error(error);
    toast("ফাইল পাঠানো যায়নি");
  }

  ui.fileInput.value = "";
});

// =====================================================
// EMOJI
// =====================================================

ui.emojiBtn.addEventListener("click", () => {
  const emoji = prompt("ইমোজি লিখুন", "😊");

  if (emoji) {
    ui.messageInput.value += emoji;
    ui.messageInput.focus();
  }
});

// =====================================================
// VOICE MESSAGE RECORDING
// =====================================================

ui.recordBtn.addEventListener("click", async () => {
  if (!currentChat) {
    toast("আগে চ্যাট নির্বাচন করুন");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    toast("এই ব্রাউজারে রেকর্ডিং সমর্থিত নয়");
    return;
  }

  if (isRecording) {
    recorder.stop();
    return;
  }

  try {
    recorderStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    recordingParts = [];
    recorder = new MediaRecorder(recorderStream);

    recorder.ondataavailable = event => {
      if (event.data.size) recordingParts.push(event.data);
    };

    recorder.onstop = async () => {
      recorderStream.getTracks().forEach(track => track.stop());
      isRecording = false;
      ui.recordBtn.textContent = "🎤";

      const blob = new Blob(recordingParts, {
        type: recorder.mimeType || "audio/webm"
      });

      if (blob.size > MAX_FILE_SIZE) {
        toast("ভয়েস রেকর্ডিং ১৮০ KB-এর বেশি হয়েছে");
        return;
      }

      const file = new File([blob], "voice-message.webm", {
        type: blob.type
      });

      const media = await fileToDataURL(file);
      await sendMessage("audio", {
        media,
        fileName: file.name,
        mimeType: file.type
      });
    };

    recorder.start();
    isRecording = true;
    ui.recordBtn.textContent = "⏹";

    toast("রেকর্ডিং চলছে। বন্ধ করতে আবার চাপ দিন।");

  } catch (error) {
    console.error(error);
    toast("মাইক্রোফোন অনুমতি পাওয়া যায়নি");
  }
});

// =====================================================
// WEBRTC CALL ENGINE
// =====================================================

async function getLocalMedia(type) {
  const constraints = {
    audio: true,
    video: type === "video"
      ? { facingMode: "user" }
      : false
  };

  localStream = await navigator.mediaDevices.getUserMedia(constraints);

  ui.localVideo.srcObject = localStream;
  ui.localVideo.style.display = type === "video" ? "block" : "none";

  remoteStream = new MediaStream();
  ui.remoteVideo.srcObject = remoteStream;
}

function createPeerConnection(callId) {
  peer = new RTCPeerConnection(ICE_SERVERS);

  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  peer.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      if (!remoteStream.getTracks().some(t => t.id === track.id)) {
        remoteStream.addTrack(track);
      }
    });
  };

  peer.onicecandidate = async event => {
    if (!event.candidate) return;

    try {
      const candidate = event.candidate.toJSON();

      await set(
        push(db(`calls/${callId}/candidates/${me.uid}`)),
        {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid || "",
          sdpMLineIndex: candidate.sdpMLineIndex ?? 0
        }
      );
    } catch (error) {
      console.error("ICE candidate write:", error);
    }
  };

  peer.onconnectionstatechange = () => {
    ui.callStatus.textContent = peer.connectionState;

    if (peer.connectionState === "connected") {
      ui.callStatus.textContent = "কল সংযুক্ত হয়েছে";
    }

    if (
      peer.connectionState === "failed" ||
      peer.connectionState === "disconnected"
    ) {
      ui.callStatus.textContent =
        "নেটওয়ার্ক সংযোগ সমস্যা। আবার চেষ্টা করুন।";
    }
  };

  return peer;
}

async function listenRemoteCandidates(callId, otherUid) {
  remoteDescriptionReady = false;
  candidateQueue = [];

  remoteCandidateStop?.();

  remoteCandidateStop = onValue(
    db(`calls/${callId}/candidates/${otherUid}`),
    async snapshot => {
      const candidates = snapshot.val() || {};

      for (const [id, item] of Object.entries(candidates)) {
        if (peer?.__seenCandidates?.has(id)) continue;

        if (!peer) return;

        peer.__seenCandidates ||= new Set();
        peer.__seenCandidates.add(id);

        const candidate = new RTCIceCandidate({
          candidate: item.candidate,
          sdpMid: item.sdpMid || null,
          sdpMLineIndex: item.sdpMLineIndex
        });

        if (remoteDescriptionReady) {
          try {
            await peer.addIceCandidate(candidate);
          } catch (error) {
            console.error("Add ICE:", error);
          }
        } else {
          candidateQueue.push(candidate);
        }
      }
    }
  );
}

async function applyRemoteDescription(description) {
  await peer.setRemoteDescription(
    new RTCSessionDescription(description)
  );

  remoteDescriptionReady = true;

  for (const candidate of candidateQueue) {
    try {
      await peer.addIceCandidate(candidate);
    } catch (error) {
      console.error(error);
    }
  }

  candidateQueue = [];
}

// =====================================================
// START OUTGOING CALL
// =====================================================

async function startCall(type) {
  if (!currentOther?.uid) {
    toast("প্রথমে একজন ব্যবহারকারীর চ্যাট খুলুন");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    toast("ক্যামেরা/মাইক্রোফোনের জন্য HTTPS প্রয়োজন");
    return;
  }

  try {
    await getLocalMedia(type);

    const callRef = push(db("calls"));
    activeCallId = callRef.key;
    activeCallRole = "caller";

    createPeerConnection(activeCallId);

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    await set(callRef, {
      from: me.uid,
      to: currentOther.uid,
      type,
      status: "ringing",
      createdAt: Date.now(),
      offer: {
        type: offer.type,
        sdp: offer.sdp
      }
    });

    await set(
      db(`incomingCalls/${currentOther.uid}/${activeCallId}`),
      true
    );

    listenRemoteCandidates(activeCallId, currentOther.uid);

    showModal(ui.callModal);
    ui.callTitle.textContent = type === "video"
      ? "ভিডিও কল"
      : "অডিও কল";

    ui.callStatus.textContent = "কল করা হচ্ছে...";

    listenToOutgoingCall(activeCallId);

  } catch (error) {
    console.error("Start call:", error);
    toast("কল শুরু করা যায়নি: " + error.message);
    await cleanupCall();
  }
}

ui.audioCallBtn.addEventListener("click", () => startCall("audio"));
ui.videoCallBtn.addEventListener("click", () => startCall("video"));

// =====================================================
// OUTGOING CALL LISTENER
// =====================================================

function listenToOutgoingCall(callId) {
  callStop?.();

  callStop = onValue(
    db(`calls/${callId}`),
    async snapshot => {
      const call = snapshot.val();

      if (!call) return;

      if (call.status === "rejected") {
        toast("কল প্রত্যাখ্যান করা হয়েছে");
        await cleanupCall();
        return;
      }

      if (call.status === "ended") {
        toast("কল শেষ হয়েছে");
        await cleanupCall();
        return;
      }

      if (call.answer && peer && !peer.currentRemoteDescription) {
        try {
          await applyRemoteDescription(call.answer);
          ui.callStatus.textContent = "উত্তর পাওয়া গেছে। সংযোগ হচ্ছে...";
        } catch (error) {
          console.error("Set answer:", error);
        }
      }
    }
  );
}

// =====================================================
// INCOMING CALL LISTENER
// =====================================================

function listenForIncomingCalls() {
  incomingStop?.();

  incomingStop = onValue(
    db(`incomingCalls/${me.uid}`),
    async snapshot => {
      const calls = snapshot.val() || {};

      for (const callId of Object.keys(calls)) {
        if (activeCallId === callId) continue;

        try {
          const callSnap = await get(db(`calls/${callId}`));

          if (!callSnap.exists()) continue;

          const call = callSnap.val();

          if (
            call.to === me.uid &&
            call.status === "ringing" &&
            !pendingIncomingCall
          ) {
            pendingIncomingCall = {
              id: callId,
              ...call
            };

            ui.incomingTitle.textContent =
              call.type === "video" ? "📹 ভিডিও কল" : "📞 অডিও কল";

            ui.incomingText.textContent =
              "আপনাকে একটি কল করা হচ্ছে।";

            showModal(ui.incomingModal);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  );
}

// =====================================================
// ACCEPT INCOMING CALL
// =====================================================

ui.acceptCall.addEventListener("click", async () => {
  const call = pendingIncomingCall;

  if (!call) return;

  try {
    await getLocalMedia(call.type);

    activeCallId = call.id;
    activeCallRole = "receiver";

    createPeerConnection(call.id);

    await applyRemoteDescription(call.offer);

    listenRemoteCandidates(call.id, call.from);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    await update(db(`calls/${call.id}`), {
      answer: {
        type: answer.type,
        sdp: answer.sdp
      },
      status: "accepted"
    });

    showModal(ui.incomingModal, false);
    showModal(ui.callModal);

    ui.callTitle.textContent =
      call.type === "video" ? "ভিডিও কল" : "অডিও কল";

    ui.callStatus.textContent = "কল সংযুক্ত হচ্ছে...";

    callStop?.();

    callStop = onValue(
      db(`calls/${call.id}/status`),
      async snapshot => {
        if (snapshot.val() === "ended") {
          toast("অপর ব্যবহারকারী কল শেষ করেছেন");
          await cleanupCall();
        }
      }
    );

    pendingIncomingCall = null;

  } catch (error) {
    console.error("Accept call:", error);
    toast("কল গ্রহণ করা যায়নি: " + error.message);
    await cleanupCall();
  }
});

// =====================================================
// REJECT INCOMING CALL
// =====================================================

ui.rejectCall.addEventListener("click", async () => {
  if (!pendingIncomingCall) return;

  try {
    await update(
      db(`calls/${pendingIncomingCall.id}`),
      { status: "rejected" }
    );

    await remove(
      db(`incomingCalls/${me.uid}/${pendingIncomingCall.id}`)
    );

  } catch (error) {
    console.error(error);
  }

  pendingIncomingCall = null;
  showModal(ui.incomingModal, false);
});

// =====================================================
// MUTE / CAMERA
// =====================================================

ui.muteBtn.addEventListener("click", () => {
  const track = localStream?.getAudioTracks()[0];

  if (!track) return;

  track.enabled = !track.enabled;

  ui.muteBtn.textContent = track.enabled
    ? "🎙️ মাইক"
    : "🔇 মাইক বন্ধ";
});

ui.cameraBtn.addEventListener("click", () => {
  const track = localStream?.getVideoTracks()[0];

  if (!track) {
    toast("এই অডিও কলে ভিডিও নেই");
    return;
  }

  track.enabled = !track.enabled;

  ui.cameraBtn.textContent = track.enabled
    ? "📷 ক্যামেরা"
    : "🚫 ক্যামেরা বন্ধ";
});

// =====================================================
// END CALL
// =====================================================

ui.endCallBtn.addEventListener("click", async () => {
  if (activeCallId) {
    try {
      await update(
        db(`calls/${activeCallId}`),
        { status: "ended" }
      );
    } catch (error) {
      console.error(error);
    }
  }

  await cleanupCall();
});

async function cleanupCall() {
  callStop?.();
  callStop = null;

  remoteCandidateStop?.();
  remoteCandidateStop = null;

  if (peer) {
    peer.ontrack = null;
    peer.onicecandidate = null;
    peer.close();
    peer = null;
  }

  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
    remoteStream = null;
  }

  if (ui.localVideo) ui.localVideo.srcObject = null;
  if (ui.remoteVideo) ui.remoteVideo.srcObject = null;

  if (activeCallId && me) {
    try {
      await remove(
        db(`incomingCalls/${me.uid}/${activeCallId}`)
      );
    } catch (error) {
      console.error(error);
    }
  }

  activeCallId = null;
  activeCallRole = null;
  remoteDescriptionReady = false;
  candidateQueue = [];

  showModal(ui.callModal, false);
}

// =====================================================
// BACK TO CHAT LIST
// =====================================================

ui.backBtn.addEventListener("click", async () => {
  if (currentChat) {
    try {
      await set(db(`typing/${currentChat}/${me.uid}`), false);
    } catch (error) {
      console.error(error);
    }
  }

  messageStop?.();
  typingStop?.();

  currentChat = null;
  currentOther = null;

  ui.chatPanel.classList.remove("open");
  ui.main.classList.remove("chatting");
});

// =====================================================
// CLEANUP
// =====================================================

window.addEventListener("beforeunload", () => {
  chatListStop?.();
  messageStop?.();
  typingStop?.();
  incomingStop?.();
  callStop?.();
  remoteCandidateStop?.();

  peer?.close();

  localStream?.getTracks().forEach(track => track.stop());
  recorderStream?.getTracks().forEach(track => track.stop());
});

// =====================================================
// END
// =====================================================
