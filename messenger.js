// ============================================================
// AYNA MESSENGER - ADVANCED VERSION
// ============================================================

import {
  auth,
  database
} from "./firebase-init.js";

import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  push,
  set,
  update,
  get,
  onValue,
  onDisconnect,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp
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

let currentProfile = null;

let currentChatId = "ayna-system";

let currentChatName = "AYNA Messenger";

let currentChatPhoto =
  "https://ui-avatars.com/api/?name=AYNA+Messenger&background=062b63&color=fff";

let currentOtherUid = null;

let messagesListener = null;

let messagesQuery = null;

let typingTimer = null;

let isTyping = false;

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

  }, 2800);

}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(auth, async user => {

  if (!user) {

    location.href = "login.html";

    return;

  }

  currentUser = user;

  await loadMyProfile();

  await setOnline();

  loadMyChats();

  loadMessages("ayna-system");

});


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadMyProfile() {

  try {

    const snap = await get(
      ref(
        database,
        "users/" + currentUser.uid
      )
    );

    if (snap.exists()) {

      currentProfile =
        snap.val();

    }

  }
  catch (error) {

    console.error(error);

  }

}


// ============================================================
// ONLINE STATUS
// ============================================================

async function setOnline() {

  const statusRef =
    ref(
      database,
      "presence/" +
      currentUser.uid
    );

  await set(statusRef, {

    online: true,

    lastSeen: Date.now()

  });

  onDisconnect(statusRef)
    .set({

      online: false,

      lastSeen: serverTimestamp()

    });

}


// ============================================================
// LOAD CHATS
// ============================================================

function loadMyChats() {

  const chatsRef =
    ref(database, "chats");

  onValue(
    chatsRef,
    snapshot => {

      const data =
        snapshot.val();

      const chats = [];

      if (data) {

        Object.entries(data)
          .forEach(([id, chat]) => {

            if (
              chat &&
              chat.members &&
              chat.members[currentUser.uid]
            ) {

              chats.push({
                id,
                ...chat
              });

            }

          });

      }

      renderChats(chats);

    },
    error => {

      console.error(error);

      showToast(
        "Chat লোড হয়নি"
      );

    }
  );

}


// ============================================================
// RENDER CHATS
// ============================================================

function renderChats(chats) {

  chatList.innerHTML = "";

  // AYNA system
  const system =
    document.createElement("div");

  system.className =
    "chat-item active";

  system.dataset.chat =
    "ayna-system";

  system.dataset.name =
    "AYNA Messenger";

  system.dataset.photo =
    currentChatPhoto;

  system.innerHTML = `

    <img
      class="avatar"
      src="${escapeAttr(currentChatPhoto)}">

    <div class="chat-info">

      <div
        class="chat-name"
        style="font-size:18px;">
        AYNA Messenger
      </div>

      <div
        class="chat-preview"
        style="font-size:14px;">
        Messenger
      </div>

    </div>

    <div class="chat-time">
      এখন
    </div>
  `;

  chatList.appendChild(system);


  // Real chats
  chats.forEach(chat => {

    if (
      chat.id === "ayna-system"
    ) return;

    const members =
      chat.members || {};

    const otherUid =
      Object.keys(members)
        .find(
          uid =>
            uid !== currentUser.uid
        );

    const other =
      chat.users &&
      otherUid &&
      chat.users[otherUid]
        ? chat.users[otherUid]
        : null;

    const name =
      other?.fullName ||
      "AYNA User";

    const photo =
      other?.photoURL ||
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(name) +
      "&background=0864ce&color=fff";

    const item =
      document.createElement("div");

    item.className =
      "chat-item";

    item.dataset.chat =
      chat.id;

    item.dataset.name =
      name;

    item.dataset.photo =
      photo;

    item.dataset.uid =
      otherUid || "";

    item.innerHTML = `

      <img
        class="avatar"
        src="${escapeAttr(photo)}">

      <div class="chat-info">

        <div
          class="chat-name"
          style="font-size:18px;">
          ${escapeHTML(name)}
        </div>

        <div
          class="chat-preview"
          style="font-size:14px;">
          ${escapeHTML(
            chat.lastMessage ||
            "নতুন মেসেজ"
          )}
        </div>

      </div>

      <div class="chat-time">
        ${formatTime(chat.updatedAt)}
      </div>

    `;

    chatList.appendChild(item);

  });

}


// ============================================================
// CHAT SELECT
// ============================================================

chatList.addEventListener(
  "click",
  event => {

    const item =
      event.target.closest(
        ".chat-item"
      );

    if (!item) return;

    document
      .querySelectorAll(
        ".chat-item"
      )
      .forEach(el =>
        el.classList.remove(
          "active"
        )
      );

    item.classList.add("active");

    currentChatId =
      item.dataset.chat;

    currentChatName =
      item.dataset.name ||
      "AYNA User";

    currentChatPhoto =
      item.dataset.photo ||
      currentChatPhoto;

    currentOtherUid =
      item.dataset.uid ||
      null;

    chatName.textContent =
      currentChatName;

    chatAvatar.src =
      currentChatPhoto;

    if (
      currentOtherUid
    ) {

      watchOtherUser();

    }
    else {

      chatStatus.textContent =
        "অনলাইন";

    }

    loadMessages(
      currentChatId
    );

    if (
      window.innerWidth <= 760
    ) {

      app.classList.add(
        "chat-open"
      );

    }

  }
);


// ============================================================
// WATCH OTHER USER
// ============================================================

function watchOtherUser() {

  if (!currentOtherUid)
    return;

  const presenceRef =
    ref(
      database,
      "presence/" +
      currentOtherUid
    );

  onValue(
    presenceRef,
    snapshot => {

      const data =
        snapshot.val();

      if (
        data &&
        data.online === true
      ) {

        chatStatus.textContent =
          "● অনলাইন";

        chatStatus.style.color =
          "#159447";

      }
      else {

        chatStatus.textContent =
          "শেষ দেখা: " +
          formatTime(
            data?.lastSeen
          );

        chatStatus.style.color =
          "#778899";

      }

    }
  );

}


// ============================================================
// LOAD MESSAGES
// ============================================================

function loadMessages(chatId) {

  if (
    messagesListener &&
    messagesQuery
  ) {

    messagesQuery.off?.();

  }

  messages.innerHTML = "";

  if (
    chatId === "ayna-system"
  ) {

    renderWelcome();

    return;

  }

  messagesQuery =
    query(
      ref(
        database,
        "messages/" +
        chatId
      ),
      orderByChild(
        "createdAt"
      ),
      limitToLast(100)
    );

  messagesListener =
    onValue(
      messagesQuery,
      snapshot => {

        messages.innerHTML = "";

        const data =
          snapshot.val();

        if (!data) {

          renderWelcome();

          return;

        }

        Object.entries(data)
          .forEach(
            ([id, message]) => {

              renderMessage(
                id,
                message
              );

            }
          );

        scrollMessages();

      },
      error => {

        console.error(error);

        showToast(
          "Message Permission Error"
        );

      }
    );

}


// ============================================================
// WELCOME
// ============================================================

function renderWelcome() {

  messages.innerHTML = `

    <div
      class="welcome"
      style="font-size:17px;">

      <div
        class="welcome-icon"
        style="font-size:70px;">
        💬
      </div>

      <h2
        style="font-size:25px;">
        ${escapeHTML(
          currentChatName
        )}
      </h2>

      <p>
        AYNA Messenger-এ স্বাগতম।
      </p>

      <p>
        নিচে মেসেজ লিখে শুরু করুন।
      </p>

    </div>

  `;

}


// ============================================================
// RENDER MESSAGE
// ============================================================

function renderMessage(
  id,
  message
) {

  if (!message) return;

  const mine =
    message.uid ===
    currentUser.uid;

  const row =
    document.createElement(
      "div"
    );

  row.className =
    "message-row" +
    (
      mine
        ? " mine"
        : ""
    );

  const bubble =
    document.createElement(
      "div"
    );

  bubble.className =
    "message";

  let html = "";

  // TEXT
  if (
    message.type === "text"
  ) {

    html = `

      <div
        class="message-text"
        style="font-size:17px;">
        ${escapeHTML(
          message.text || ""
        )}
      </div>

    `;

  }

  // IMAGE
  else if (
    message.type === "image"
  ) {

    html = `

      <div
        style="
          font-size:15px;
          font-weight:bold;
          margin-bottom:7px;">
        🖼️ ছবি
      </div>

      <img
        src="${escapeAttr(
          message.data || ""
        )}"
        style="
          width:100%;
          max-width:500px;
          max-height:500px;
          object-fit:contain;
          border-radius:14px;
          display:block;"
        alt="Image">

    `;

  }

  // VIDEO
  else if (
    message.type === "video"
  ) {

    html = `

      <div
        style="
          font-size:15px;
          font-weight:bold;
          margin-bottom:7px;">
        🎬 ভিডিও
      </div>

      <video
        controls
        playsinline
        preload="metadata"
        style="
          width:100%;
          max-width:600px;
          max-height:500px;
          border-radius:14px;
          display:block;
          background:#000;"
        src="${escapeAttr(
          message.data || ""
        )}">
      </video>

    `;

  }

  // AUDIO
  else if (
    message.type === "audio"
  ) {

    html = `

      <div
        style="
          font-size:15px;
          font-weight:bold;
          margin-bottom:7px;">
        🎵 অডিও
      </div>

      <audio
        controls
        preload="metadata"
        style="
          width:100%;
          min-width:240px;"
        src="${escapeAttr(
          message.data || ""
        )}">
      </audio>

    `;

  }

  // DOCUMENT
  else if (
    message.type === "document"
  ) {

    html = `

      <div
        style="font-size:16px;">
        📄
        ${escapeHTML(
          message.fileName ||
          "Document"
        )}
      </div>

    `;

  }

  // LOCATION
  else if (
    message.type === "location"
  ) {

    html = `

      <div
        style="
          font-size:17px;
          font-weight:bold;">
        📍 লোকেশন
      </div>

      <button
        class="location-open"
        data-lat="${escapeAttr(
          message.lat
        )}"
        data-lon="${escapeAttr(
          message.lon
        )}"
        style="
          margin-top:8px;
          border:0;
          padding:11px 16px;
          border-radius:12px;
          font-size:15px;
          cursor:pointer;">
        Google Maps-এ খুলুন
      </button>

    `;

  }

  bubble.innerHTML =
    html +
    `

      <div
        class="message-meta"
        style="font-size:11px;">
        ${formatTime(
          message.createdAt
        )}
        ${mine ? " ✓✓" : ""}
      </div>

    `;

  row.appendChild(
    bubble
  );

  messages.appendChild(
    row
  );

}


// ============================================================
// SEND TEXT
// ============================================================

async function sendTextMessage() {

  if (!currentUser)
    return;

  const text =
    messageInput.value.trim();

  if (!text)
    return;

  if (
    currentChatId ===
    "ayna-system"
  ) {

    showToast(
      "আগে একজন User নির্বাচন করুন"
    );

    return;

  }

  try {

    await createMessage({

      type: "text",

      text: text

    });

    messageInput.value = "";

    autoResize();

    setTyping(false);

  }
  catch(error) {

    console.error(error);

    showToast(
      "Message পাঠানো যায়নি"
    );

  }

}


// ============================================================
// CREATE MESSAGE
// ============================================================

async function createMessage(
  data
) {

  const messageRef =
    push(
      ref(
        database,
        "messages/" +
        currentChatId
      )
    );

  const message = {

    uid:
      currentUser.uid,

    senderName:
      currentProfile?.fullName ||
      currentUser.displayName ||
      "AYNA User",

    type:
      data.type,

    createdAt:
      Date.now(),

    ...data

  };

  await set(
    messageRef,
    message
  );

  await update(
    ref(
      database,
      "chats/" +
      currentChatId
    ),
    {

      lastMessage:
        getLastMessageText(
          message
        ),

      updatedAt:
        Date.now()

    }
  );

}


// ============================================================
// LAST MESSAGE
// ============================================================

function getLastMessageText(
  message
) {

  if (
    message.type === "text"
  )
    return message.text;

  if (
    message.type === "image"
  )
    return "🖼️ ছবি";

  if (
    message.type === "video"
  )
    return "🎬 ভিডিও";

  if (
    message.type === "audio"
  )
    return "🎵 অডিও";

  if (
    message.type === "document"
  )
    return "📄 ডকুমেন্ট";

  if (
    message.type === "location"
  )
    return "📍 লোকেশন";

  return "নতুন মেসেজ";

}


// ============================================================
// SEND BUTTON
// ============================================================

sendBtn.addEventListener(
  "click",
  sendTextMessage
);


// ============================================================
// ENTER
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
// TYPING
// ============================================================

messageInput.addEventListener(
  "input",
  () => {

    autoResize();

    if (
      currentChatId ===
      "ayna-system"
    )
      return;

    setTyping(true);

    clearTimeout(
      typingTimer
    );

    typingTimer =
      setTimeout(
        () => {
          setTyping(false);
        },
        1500
      );

  }
);


async function setTyping(value) {

  if (
    !currentUser ||
    currentChatId ===
    "ayna-system"
  )
    return;

  try {

    await set(
      ref(
        database,
        "typing/" +
        currentChatId +
        "/" +
        currentUser.uid
      ),
      value
    );

  }
  catch(error) {

    console.error(
      "Typing:",
      error
    );

  }

}


// ============================================================
// ATTACH MENU
// ============================================================

attachBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.toggle(
      "show"
    );

  }
);


// ============================================================
// IMAGE
// ============================================================

imageBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    imageInput.click();

  }
);

imageInput.addEventListener(
  "change",
  () => {

    const file =
      imageInput.files[0];

    if (file)
      sendMedia(
        file,
        "image"
      );

    imageInput.value = "";

  }
);


// ============================================================
// VIDEO
// ============================================================

videoBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    videoInput.click();

  }
);

videoInput.addEventListener(
  "change",
  () => {

    const file =
      videoInput.files[0];

    if (file)
      sendMedia(
        file,
        "video"
      );

    videoInput.value = "";

  }
);


// ============================================================
// AUDIO
// ============================================================

audioBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    audioInput.click();

  }
);

audioInput.addEventListener(
  "change",
  () => {

    const file =
      audioInput.files[0];

    if (file)
      sendMedia(
        file,
        "audio"
      );

    audioInput.value = "";

  }
);


// ============================================================
// DOCUMENT
// ============================================================

documentBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    documentInput.click();

  }
);

documentInput.addEventListener(
  "change",
  () => {

    const file =
      documentInput.files[0];

    if (file)
      sendMedia(
        file,
        "document"
      );

    documentInput.value = "";

  }
);


// ============================================================
// SEND MEDIA
// ============================================================

function sendMedia(
  file,
  type
) {

  if (
    currentChatId ===
    "ayna-system"
  ) {

    showToast(
      "আগে একটি Chat নির্বাচন করুন"
    );

    return;

  }

  // RTDB Base64 test limit
  const MAX =
    2 * 1024 * 1024;

  if (
    file.size > MAX
  ) {

    showToast(
      "Test mode: সর্বোচ্চ 2MB"
    );

    return;

  }

  showToast(
    "Media প্রস্তুত হচ্ছে..."
  );

  const reader =
    new FileReader();

  reader.onload = async () => {

    try {

      await createMessage({

        type,

        data:
          reader.result,

        fileName:
          file.name,

        mimeType:
          file.type,

        size:
          file.size

      });

      showToast(
        "Media পাঠানো হয়েছে"
      );

    }
    catch(error) {

      console.error(error);

      showToast(
        "Media পাঠানো যায়নি"
      );

    }

  };

  reader.readAsDataURL(file);

}


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


async function startRecording() {

  if (
    currentChatId ===
    "ayna-system"
  ) {

    showToast(
      "আগে একটি Chat নির্বাচন করুন"
    );

    return;

  }

  try {

    const stream =
      await navigator
        .mediaDevices
        .getUserMedia({
          audio:true
        });

    audioChunks = [];

    mediaRecorder =
      new MediaRecorder(
        stream
      );

    mediaRecorder.ondataavailable =
      event => {

        if (
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
            catch(error) {

              console.error(error);

              showToast(
                "Voice message পাঠানো যায়নি"
              );

            }

          };

        reader.readAsDataURL(
          blob
        );

      };

    mediaRecorder.start();

    recording = true;

    voiceBtn.textContent =
      "⏹";

    showToast(
      "🎙️ রেকর্ডিং চলছে..."
    );

  }
  catch(error) {

    console.error(error);

    showToast(
      "Microphone Permission দিন"
    );

  }

}


function stopRecording() {

  if (
    mediaRecorder &&
    recording
  ) {

    mediaRecorder.stop();

    recording = false;

    voiceBtn.textContent =
      "🎙️";

  }

}


// ============================================================
// EMOJI
// ============================================================

emojiBtn.addEventListener(
  "click",
  () => {

    const list = [
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
      "😮",
      "🤣",
      "💯",
      "✨",
      "🌹",
      "🤝"
    ];

    const emoji =
      list[
        Math.floor(
          Math.random() *
          list.length
        )
      ];

    messageInput.value +=
      emoji;

    messageInput.focus();

    autoResize();

  }
);


// ============================================================
// LOCATION
// ============================================================

locationBtn.addEventListener(
  "click",
  () => {

    attachMenu.classList.remove(
      "show"
    );

    if (
      !navigator.geolocation
    ) {

      showToast(
        "GPS পাওয়া যায়নি"
      );

      return;

    }

    showToast(
      "📍 Location নেওয়া হচ্ছে..."
    );

    navigator.geolocation.getCurrentPosition(

      async position => {

        try {

          await createMessage({

            type:
              "location",

            lat:
              position.coords.latitude,

            lon:
              position.coords.longitude

          });

          showToast(
            "Location পাঠানো হয়েছে"
          );

        }
        catch(error) {

          console.error(error);

          showToast(
            "Location পাঠানো যায়নি"
          );

        }

      },

      error => {

        console.error(error);

        showToast(
          "GPS Permission দিন"
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

    const button =
      event.target.closest(
        ".location-open"
      );

    if (!button)
      return;

    const lat =
      button.dataset.lat;

    const lon =
      button.dataset.lon;

    if (!lat || !lon)
      return;

    window.open(
      "https://www.google.com/maps?q=" +
      encodeURIComponent(
        lat + "," + lon
      ),
      "_blank"
    );

  }
);


// ============================================================
// CHAT SEARCH
// ============================================================

chatSearch.addEventListener(
  "input",
  () => {

    const value =
      chatSearch.value
        .toLowerCase()
        .trim();

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
          name.includes(value)
            ? "flex"
            : "none";

      });

  }
);


// ============================================================
// SEARCH BUTTON
// ============================================================

searchBtn.addEventListener(
  "click",
  () => {

    chatSearch.focus();

  }
);


// ============================================================
// NEW CHAT
// ============================================================

newChatBtn.addEventListener(
  "click",
  () => {

    showToast(
      "পরের ধাপে User Search + New Chat যুক্ত হবে"
    );

  }
);


// ============================================================
// CALL BUTTONS
// ============================================================

voiceCallBtn.addEventListener(
  "click",
  () => {

    openCall(
      "voice"
    );

  }
);

videoCallBtn.addEventListener(
  "click",
  () => {

    openCall(
      "video"
    );

  }
);


function openCall(type) {

  currentCallType =
    type;

  callModal.classList.add(
    "show"
  );

  if (
    type === "voice"
  ) {

    callTitle.textContent =
      "☎️ AYNA Voice Call";

    callText.textContent =
      currentChatName +
      " কে Voice Call";

  }
  else {

    callTitle.textContent =
      "📹 AYNA Video Call";

    callText.textContent =
      currentChatName +
      " কে Video Call";

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
  async () => {

    callModal.classList.remove(
      "show"
    );

    if (
      !currentOtherUid
    ) {

      showToast(
        "একজন User নির্বাচন করুন"
      );

      return;

    }

    const callRef =
      push(
        ref(
          database,
          "calls"
        )
      );

    await set(
      callRef,
      {

        callerId:
          currentUser.uid,

        receiverId:
          currentOtherUid,

        type:
          currentCallType,

        status:
          "calling",

        createdAt:
          Date.now()

      }
    );

    showToast(
      currentCallType === "voice"
        ? "☎️ Voice Call শুরু হচ্ছে..."
        : "📹 Video Call শুরু হচ্ছে..."
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
// CLOSE ATTACH MENU
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
// AUTO RESIZE
// ============================================================

function autoResize() {

  messageInput.style.height =
    "auto";

  messageInput.style.height =
    Math.min(
      messageInput.scrollHeight,
      120
    ) + "px";

}


// ============================================================
// SCROLL
// ============================================================

function scrollMessages() {

  requestAnimationFrame(
    () => {

      messages.scrollTop =
        messages.scrollHeight;

    }
  );

}


// ============================================================
// TIME
// ============================================================

function formatTime(timestamp) {

  if (!timestamp)
    return "";

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


// ============================================================
// HTML SECURITY
// ============================================================

function escapeHTML(value) {

  return String(
    value ?? ""
  )
  .replaceAll(
    "&",
    "&amp;"
  )
  .replaceAll(
    "<",
    "&lt;"
  )
  .replaceAll(
    ">",
    "&gt;"
  )
  .replaceAll(
    '"',
    "&quot;"
  )
  .replaceAll(
    "'",
    "&#039;"
  );

}


function escapeAttr(value) {

  return escapeHTML(
    value
  );

}


// ============================================================
// START
// ============================================================

console.log(
  "AYNA Messenger Advanced JS loaded."
);