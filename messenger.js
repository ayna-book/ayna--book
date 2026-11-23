// ============================================================
// AYNA MESSENGER
// messenger.js
// Firebase JS SDK 13.4.0
// ============================================================

import {
  auth,
  database
} from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  push,
  set,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// ELEMENTS
// ============================================================

const app = document.getElementById("app");

const chatList = document.getElementById("chatList");
const chatSearch = document.getElementById("chatSearch");

const chatName = document.getElementById("chatName");
const chatStatus = document.getElementById("chatStatus");
const chatAvatar = document.getElementById("chatAvatar");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const attachBtn = document.getElementById("attachBtn");
const attachMenu = document.getElementById("attachMenu");

const imageBtn = document.getElementById("imageBtn");
const videoBtn = document.getElementById("videoBtn");
const audioBtn = document.getElementById("audioBtn");
const documentBtn = document.getElementById("documentBtn");
const locationBtn = document.getElementById("locationBtn");

const imageInput = document.getElementById("imageInput");
const videoInput = document.getElementById("videoInput");
const audioInput = document.getElementById("audioInput");
const documentInput = document.getElementById("documentInput");

const voiceBtn = document.getElementById("voiceBtn");
const emojiBtn = document.getElementById("emojiBtn");

const voiceCallBtn = document.getElementById("voiceCallBtn");
const videoCallBtn = document.getElementById("videoCallBtn");

const callModal = document.getElementById("callModal");
const callTitle = document.getElementById("callTitle");
const callText = document.getElementById("callText");

const startCallBtn = document.getElementById("startCallBtn");
const closeCallBtn = document.getElementById("closeCallBtn");

const newChatBtn = document.getElementById("newChatBtn");
const searchBtn = document.getElementById("searchBtn");

const mobileBack = document.getElementById("mobileBack");

const toast = document.getElementById("toast");


// ============================================================
// STATE
// ============================================================

let currentUser = null;

let currentChatId = "ayna-system";

let currentChatName = "AYNA Messenger";

let currentChatPhoto =
  "https://ui-avatars.com/api/?name=AYNA+Messenger&background=062b63&color=fff";

let messagesRef = null;

let messagesListener = null;

let mediaRecorder = null;

let audioChunks = [];

let recording = false;

let currentCallType = "";


// ============================================================
// TOAST
// ============================================================

function showToast(text) {

  if (!toast) return;

  toast.textContent = text;

  toast.style.display = "block";

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {

    toast.style.display = "none";

  }, 2500);
}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    showToast("প্রথমে Login করুন");

    setTimeout(() => {

      location.href = "login.html";

    }, 1200);

    return;
  }

  currentUser = user;

  chatStatus.textContent = "অনলাইন";

  chatStatus.style.color = "#159447";

  loadMyChats();

  loadMessages(currentChatId);

});


// ============================================================
// CHAT ID
// ============================================================

function makeChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


// ============================================================
// LOAD CHATS
// ============================================================

function loadMyChats() {

  if (!currentUser) return;

  const chatsRef = ref(
    database,
    "chats"
  );

  onValue(chatsRef, (snapshot) => {

    const data = snapshot.val();

    if (!data) return;

    const chats = [];

    Object.entries(data).forEach(([id, chat]) => {

      if (!chat || !chat.members) return;

      if (
        chat.members[currentUser.uid]
      ) {

        chats.push({
          id,
          ...chat
        });

      }

    });

    renderChatList(chats);

  }, (error) => {

    console.error(error);

    showToast(
      "Chat লোড করা যায়নি: " +
      error.message
    );

  });

}


// ============================================================
// RENDER CHAT LIST
// ============================================================

function renderChatList(chats) {

  const systemChat = `
    <div
      class="chat-item active"
      data-chat="ayna-system"
      data-name="AYNA Messenger"
      data-photo="${currentChatPhoto}"
    >

      <img
        class="avatar"
        src="${currentChatPhoto}"
        alt="AYNA Messenger">

      <div class="chat-info">

        <div class="chat-name">
          AYNA Messenger
        </div>

        <div class="chat-preview">
          AYNA Messenger
        </div>

      </div>

      <div class="chat-time">
        এখন
      </div>

    </div>
  `;

  chatList.innerHTML = systemChat;

  chats.forEach(chat => {

    if (chat.id === "ayna-system") return;

    const members = chat.members || {};

    const otherUid =
      Object.keys(members)
        .find(uid => uid !== currentUser.uid);

    const other =
      chat.users &&
      otherUid &&
      chat.users[otherUid]
        ? chat.users[otherUid]
        : null;

    const name =
      other?.fullName ||
      chat.name ||
      "AYNA User";

    const photo =
      other?.photoURL ||
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(name) +
      "&background=0b63ce&color=fff";

    const preview =
      chat.lastMessage ||
      "নতুন চ্যাট";

    const time =
      chat.updatedAt
        ? formatTime(chat.updatedAt)
        : "";

    const item =
      document.createElement("div");

    item.className = "chat-item";

    item.dataset.chat = chat.id;

    item.dataset.name = name;

    item.dataset.photo = photo;

    item.innerHTML = `

      <img
        class="avatar"
        src="${escapeAttribute(photo)}"
        alt="Profile">

      <div class="chat-info">

        <div class="chat-name">
          ${escapeHTML(name)}
        </div>

        <div class="chat-preview">
          ${escapeHTML(preview)}
        </div>

      </div>

      <div class="chat-time">
        ${escapeHTML(time)}
      </div>

    `;

    chatList.appendChild(item);

  });

}


// ============================================================
// CHAT LIST CLICK
// ============================================================

chatList.addEventListener("click", (event) => {

  const item =
    event.target.closest(".chat-item");

  if (!item) return;

  document
    .querySelectorAll(".chat-item")
    .forEach(el =>
      el.classList.remove("active")
    );

  item.classList.add("active");

  currentChatId =
    item.dataset.chat;

  currentChatName =
    item.dataset.name ||
    "AYNA User";

  currentChatPhoto =
    item.dataset.photo ||
    "https://ui-avatars.com/api/?name=AYNA";

  chatName.textContent =
    currentChatName;

  chatAvatar.src =
    currentChatPhoto;

  chatStatus.textContent =
    currentChatId === "ayna-system"
      ? "অনলাইন"
      : "চ্যাট";

  loadMessages(currentChatId);

  if (window.innerWidth <= 760) {

    app.classList.add("chat-open");

  }

});


// ============================================================
// LOAD MESSAGES
// ============================================================

function loadMessages(chatId) {

  if (!currentUser) return;

  if (messagesRef && messagesListener) {

    off(
      messagesRef,
      "value",
      messagesListener
    );

  }

  messages.innerHTML = "";

  if (chatId === "ayna-system") {

    renderWelcome();

    return;

  }

  messagesRef = query(
    ref(
      database,
      "messages/" + chatId
    ),
    orderByChild("createdAt"),
    limitToLast(100)
  );

  messagesListener =
    onValue(
      messagesRef,
      snapshot => {

        messages.innerHTML = "";

        const data =
          snapshot.val();

        if (!data) {

          renderWelcome();

          return;

        }

        Object.entries(data)
          .forEach(([id, message]) => {

            renderMessage(
              id,
              message
            );

          });

        scrollMessages();

      },
      error => {

        console.error(error);

        showToast(
          "Message permission error"
        );

      }
    );

}


// ============================================================
// WELCOME
// ============================================================

function renderWelcome() {

  messages.innerHTML = `

    <div class="welcome">

      <div class="welcome-icon">
        💬
      </div>

      <h2>
        ${escapeHTML(currentChatName)}
      </h2>

      <p>
        এখানে আপনার Messenger conversation দেখা যাবে।
      </p>

      <p>
        প্রথম মেসেজটি পাঠান।
      </p>

    </div>

  `;

}


// ============================================================
// RENDER MESSAGE
// ============================================================

function renderMessage(id, message) {

  if (!message) return;

  const mine =
    message.uid === currentUser.uid;

  const row =
    document.createElement("div");

  row.className =
    "message-row" +
    (mine ? " mine" : "");

  const bubble =
    document.createElement("div");

  bubble.className = "message";

  let content = "";

  // TEXT
  if (
    message.type === "text" ||
    !message.type
  ) {

    content = `
      <div class="message-text">
        ${escapeHTML(message.text || "")}
      </div>
    `;

  }

  // IMAGE
  else if (message.type === "image") {

    content = `
      <div class="message-text">
        🖼️ ছবি
      </div>

      <div style="margin-top:8px;">
        <img
          src="${escapeAttribute(message.data || "")}"
          style="
            max-width:100%;
            border-radius:12px;
            display:block;
          "
          alt="Image">
      </div>
    `;

  }

  // VIDEO
  else if (message.type === "video") {

    content = `
      <div class="message-text">
        🎬 ভিডিও
      </div>

      <video
        controls
        playsinline
        style="
          max-width:100%;
          border-radius:12px;
          margin-top:8px;
        "
        src="${escapeAttribute(message.data || "")}">
      </video>
    `;

  }

  // AUDIO
  else if (message.type === "audio") {

    content = `
      <div class="message-text">
        🎵 অডিও
      </div>

      <audio
        controls
        style="max-width:100%;margin-top:8px;"
        src="${escapeAttribute(message.data || "")}">
      </audio>
    `;

  }

  // LOCATION
  else if (message.type === "location") {

    content = `
      <div class="message-text">
        📍 Location
      </div>

      <button
        class="location-open"
        data-lat="${escapeAttribute(message.lat)}"
        data-lon="${escapeAttribute(message.lon)}"
        style="
          margin-top:7px;
          border:0;
          padding:8px 12px;
          border-radius:10px;
          cursor:pointer;
        ">
        লোকেশন দেখুন
      </button>
    `;

  }

  // DOCUMENT
  else if (message.type === "document") {

    content = `
      <div class="message-text">
        📄 ${escapeHTML(
          message.fileName || "Document"
        )}
      </div>
    `;

  }

  else {

    content = `
      <div class="message-text">
        ${escapeHTML(message.text || "")}
      </div>
    `;

  }

  bubble.innerHTML =
    content +
    `
      <div class="message-meta">
        ${formatTime(message.createdAt)}
      </div>
    `;

  row.appendChild(bubble);

  messages.appendChild(row);

}


// ============================================================
// SEND TEXT
// ============================================================

async function sendTextMessage() {

  if (!currentUser) {

    showToast("Login করুন");

    return;

  }

  const text =
    messageInput.value.trim();

  if (!text) return;

  // System chat
  if (currentChatId === "ayna-system") {

    showToast(
      "একজন ব্যবহারকারী নির্বাচন করে মেসেজ পাঠান"
    );

    return;

  }

  try {

    await createMessage({

      type: "text",

      text: text

    });

    messageInput.value = "";

    autoResizeTextarea();

  }
  catch (error) {

    console.error(error);

    showToast(
      "Message পাঠানো যায়নি: " +
      error.message
    );

  }

}


// ============================================================
// CREATE MESSAGE
// ============================================================

async function createMessage(messageData) {

  const messageRef =
    push(
      ref(
        database,
        "messages/" + currentChatId
      )
    );

  const message = {

    id: messageRef.key,

    uid: currentUser.uid,

    senderName:
      currentUser.displayName ||
      "AYNA User",

    createdAt:
      Date.now(),

    ...messageData

  };

  await set(
    messageRef,
    message
  );

  await updateChat(message);

}


// ============================================================
// UPDATE CHAT
// ============================================================

async function updateChat(message) {

  if (!currentUser) return;

  const chatRef =
    ref(
      database,
      "chats/" +
      currentChatId
    );

  const updateData = {

    lastMessage:
      message.type === "text"
        ? message.text
        : getMessageTypeName(message.type),

    updatedAt:
      Date.now()

  };

  await set(
    ref(
      database,
      "chats/" +
      currentChatId +
      "/lastMessage"
    ),
    updateData.lastMessage
  );

  await set(
    ref(
      database,
      "chats/" +
      currentChatId +
      "/updatedAt"
    ),
    updateData.updatedAt
  );

}


// ============================================================
// ATTACHMENT MENU
// ============================================================

attachBtn.addEventListener("click", () => {

  attachMenu.classList.toggle("show");

});


// ============================================================
// IMAGE
// ============================================================

imageBtn.addEventListener("click", () => {

  attachMenu.classList.remove("show");

  imageInput.click();

});

imageInput.addEventListener("change", async () => {

  const file =
    imageInput.files[0];

  if (!file) return;

  await sendSmallFile(
    file,
    "image"
  );

  imageInput.value = "";

});


// ============================================================
// VIDEO
// ============================================================

videoBtn.addEventListener("click", () => {

  attachMenu.classList.remove("show");

  videoInput.click();

});

videoInput.addEventListener("change", async () => {

  const file =
    videoInput.files[0];

  if (!file) return;

  await sendSmallFile(
    file,
    "video"
  );

  videoInput.value = "";

});


// ============================================================
// AUDIO
// ============================================================

audioBtn.addEventListener("click", () => {

  attachMenu.classList.remove("show");

  audioInput.click();

});

audioInput.addEventListener("change", async () => {

  const file =
    audioInput.files[0];

  if (!file) return;

  await sendSmallFile(
    file,
    "audio"
  );

  audioInput.value = "";

});


// ============================================================
// DOCUMENT
// ============================================================

documentBtn.addEventListener("click", () => {

  attachMenu.classList.remove("show");

  documentInput.click();

});

documentInput.addEventListener("change", async () => {

  const file =
    documentInput.files[0];

  if (!file) return;

  await sendSmallFile(
    file,
    "document"
  );

  documentInput.value = "";

});


// ============================================================
// SMALL FILE TO DATA URL
// ============================================================
//
// IMPORTANT:
// RTDB-তে বড় 8K video/audio/document Base64 রাখা
// production-এর জন্য উপযুক্ত নয়।
// এই function ছোট test media-এর জন্য।
// ============================================================

async function sendSmallFile(file, type) {

  if (
    currentChatId === "ayna-system"
  ) {

    showToast(
      "আগে একজন user/chat নির্বাচন করুন"
    );

    return;

  }

  const maxSize =
    2 * 1024 * 1024;

  if (file.size > maxSize) {

    showToast(
      "Test Messenger-এ সর্বোচ্চ 2MB ফাইল"
    );

    return;

  }

  showToast("ফাইল প্রস্তুত হচ্ছে...");

  const reader =
    new FileReader();

  reader.onload = async () => {

    try {

      await createMessage({

        type: type,

        data: reader.result,

        fileName: file.name,

        mimeType: file.type,

        size: file.size

      });

      showToast(
        "ফাইল পাঠানো হয়েছে"
      );

    }
    catch (error) {

      console.error(error);

      showToast(
        "ফাইল পাঠানো যায়নি"
      );

    }

  };

  reader.readAsDataURL(file);

}


// ============================================================
// LOCATION
// ============================================================

locationBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    if (!navigator.geolocation) {

      showToast(
        "এই ডিভাইসে GPS পাওয়া যায়নি"
      );

      return;

    }

    showToast(
      "লোকেশন নেওয়া হচ্ছে..."
    );

    navigator.geolocation.getCurrentPosition(

      async position => {

        try {

          await createMessage({

            type: "location",

            lat:
              position.coords.latitude,

            lon:
              position.coords.longitude

          });

          showToast(
            "লোকেশন পাঠানো হয়েছে"
          );

        }
        catch (error) {

          console.error(error);

          showToast(
            "লোকেশন পাঠানো যায়নি"
          );

        }

      },

      error => {

        console.error(error);

        showToast(
          "GPS permission দিন"
        );

      },

      {
        enableHighAccuracy:true,
        timeout:15000,
        maximumAge:0
      }

    );

  }
);


// ============================================================
// LOCATION OPEN
// ============================================================

messages.addEventListener(
  "click",
  event => {

    const btn =
      event.target.closest(
        ".location-open"
      );

    if (!btn) return;

    const lat =
      btn.dataset.lat;

    const lon =
      btn.dataset.lon;

    if (!lat || !lon) return;

    const url =
      "https://www.google.com/maps?q=" +
      encodeURIComponent(
        lat + "," + lon
      );

    window.open(
      url,
      "_blank"
    );

  }
);


// ============================================================
// VOICE RECORDING
// ============================================================

voiceBtn.addEventListener(
  "click",
  async () => {

    if (recording) {

      stopRecording();

    }
    else {

      await startRecording();

    }

  }
);


// ============================================================
// START RECORDING
// ============================================================

async function startRecording() {

  if (
    currentChatId === "ayna-system"
  ) {

    showToast(
      "আগে একটি chat নির্বাচন করুন"
    );

    return;

  }

  if (!navigator.mediaDevices?.getUserMedia) {

    showToast(
      "Microphone supported নয়"
    );

    return;

  }

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:true
      });

    audioChunks = [];

    mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorder.ondataavailable =
      event => {

        if (
          event.data &&
          event.data.size > 0
        ) {

          audioChunks.push(
            event.data
          );

        }

      };

    mediaRecorder.onstop =
      async () => {

        const blob =
          new Blob(
            audioChunks,
            {
              type:
                mediaRecorder.mimeType ||
                "audio/webm"
            }
          );

        stream
          .getTracks()
          .forEach(
            track =>
              track.stop()
          );

        const reader =
          new FileReader();

        reader.onload =
          async () => {

            try {

              await createMessage({

                type:"audio",

                data:
                  reader.result,

                mimeType:
                  blob.type

              });

              showToast(
                "Voice message পাঠানো হয়েছে"
              );

            }
            catch(error){

              console.error(error);

              showToast(
                "Voice message পাঠানো যায়নি"
              );

            }

          };

        reader.readAsDataURL(blob);

      };

    mediaRecorder.start();

    recording = true;

    voiceBtn.textContent = "⏹";

    showToast(
      "রেকর্ডিং চলছে... বন্ধ করতে আবার চাপুন"
    );

  }
  catch(error) {

    console.error(error);

    showToast(
      "Microphone permission দিন"
    );

  }

}


// ============================================================
// STOP RECORDING
// ============================================================

function stopRecording() {

  if (
    mediaRecorder &&
    recording
  ) {

    mediaRecorder.stop();

    recording = false;

    voiceBtn.textContent = "🎙";

  }

}


// ============================================================
// EMOJI
// ============================================================

emojiBtn.addEventListener(
  "click",
  () => {

    const emojis = [
      "😀",
      "😂",
      "😍",
      "🥰",
      "😘",
      "😎",
      "👍",
      "❤️",
      "🔥",
      "🎉",
      "👏",
      "🙏",
      "😊",
      "😢",
      "😮"
    ];

    const emoji =
      emojis[
        Math.floor(
          Math.random() *
          emojis.length
        )
      ];

    messageInput.value += emoji;

    messageInput.focus();

    autoResizeTextarea();

  }
);


// ============================================================
// SEND BUTTON
// ============================================================

sendBtn.addEventListener(
  "click",
  sendTextMessage
);


// ============================================================
// ENTER TO SEND
// ============================================================

messageInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendTextMessage();

    }

  }
);


// ============================================================
// TEXTAREA AUTO RESIZE
// ============================================================

messageInput.addEventListener(
  "input",
  autoResizeTextarea
);

function autoResizeTextarea() {

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    Math.min(
      messageInput.scrollHeight,
      120
    ) + "px";

}


// ============================================================
// SEARCH CHAT
// ============================================================

chatSearch.addEventListener(
  "input",
  () => {

    const search =
      chatSearch.value
        .trim()
        .toLowerCase();

    document
      .querySelectorAll(
        ".chat-item"
      )
      .forEach(item => {

        const name =
          (
            item.dataset.name ||
            ""
          ).toLowerCase();

        item.style.display =
          name.includes(search)
            ? "flex"
            : "none";

      });

  }
);


// ============================================================
// TOP SEARCH
// ============================================================

searchBtn.addEventListener(
  "click",
  () => {

    chatSearch.focus();

    chatSearch.scrollIntoView({
      behavior:"smooth"
    });

  }
);


// ============================================================
// NEW CHAT
// ============================================================

newChatBtn.addEventListener(
  "click",
  () => {

    showToast(
      "নতুন Chat তৈরির জন্য User Search module পরের ধাপে যুক্ত হবে"
    );

  }
);


// ============================================================
// MOBILE BACK
// ============================================================

mobileBack.addEventListener(
  "click",
  () => {

    app.classList.remove(
      "chat-open"
    );

  }
);


// ============================================================
// VOICE CALL
// ============================================================

voiceCallBtn.addEventListener(
  "click",
  () => {

    openCallModal(
      "voice"
    );

  }
);


// ============================================================
// VIDEO CALL
// ============================================================

videoCallBtn.addEventListener(
  "click",
  () => {

    openCallModal(
      "video"
    );

  }
);


// ============================================================
// CALL MODAL
// ============================================================

function openCallModal(type) {

  currentCallType = type;

  callModal.classList.add(
    "show"
  );

  if (type === "voice") {

    callTitle.textContent =
      "📞 AYNA Voice Call";

    callText.textContent =
      currentChatName +
      " কে Voice Call করার জন্য প্রস্তুত।";

  }
  else {

    callTitle.textContent =
      "📹 AYNA Video Call";

    callText.textContent =
      currentChatName +
      " কে Video Call করার জন্য প্রস্তুত।";

  }

}


closeCallBtn.addEventListener(
  "click",
  () => {

    callModal.classList.remove(
      "show"
    );

  }
);


// ============================================================
// START CALL
// ============================================================

startCallBtn.addEventListener(
  "click",
  () => {

    callModal.classList.remove(
      "show"
    );

    showToast(
      currentCallType === "voice"
        ? "Voice Call signaling module প্রস্তুত করতে হবে"
        : "Video Call signaling module প্রস্তুত করতে হবে"
    );

  }
);


// ============================================================
// CLOSE ATTACH MENU OUTSIDE
// ============================================================

document.addEventListener(
  "click",
  event => {

    if (
      !attachMenu.contains(
        event.target
      ) &&
      event.target !== attachBtn
    ) {

      attachMenu.classList.remove(
        "show"
      );

    }

  }
);


// ============================================================
// HELPERS
// ============================================================

function formatTime(timestamp) {

  if (!timestamp) return "";

  const date =
    new Date(timestamp);

  return date.toLocaleTimeString(
    "bn-BD",
    {
      hour:"numeric",
      minute:"2-digit"
    }
  );

}


function getMessageTypeName(type) {

  const names = {

    image:"🖼️ ছবি",

    video:"🎬 ভিডিও",

    audio:"🎵 অডিও",

    document:"📄 ডকুমেন্ট",

    location:"📍 লোকেশন"

  };

  return (
    names[type] ||
    "নতুন মেসেজ"
  );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


function scrollMessages() {

  requestAnimationFrame(() => {

    messages.scrollTop =
      messages.scrollHeight;

  });

}


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

window.addEventListener(
  "error",
  event => {

    console.error(
      "AYNA Messenger Error:",
      event.error
    );

  }
);


// ============================================================
// INITIAL UI
// ============================================================

if (messageInput) {

  autoResizeTextarea();

}

console.log(
  "AYNA Messenger loaded successfully."
);