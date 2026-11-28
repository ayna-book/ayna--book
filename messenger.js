
/* =========================================================
   AYNA BOOK — MESSENGER
   File: messenger.js
   Firebase SDK: 13.4.0
   Storage: Firebase Storage required for cloud file uploads
   Database: Firebase Realtime Database
========================================================= */

const MAX_LARGE_FILE_BYTES = 250 * 1024 * 1024;
const LOCAL_STORAGE_KEY = "ayna_messenger_messages_v1";

const $ = id => document.getElementById(id);

async function loadOptionalScript(path) {
  try {
    return await import(path);
  } catch (error) {
    console.warn("Optional Firebase module unavailable:", path, error);
    return null;
  }
}

const initMod = await loadOptionalScript("./firebase-init.js");
const jsFirebaseMod = initMod ? null : await loadOptionalScript("./js/firebase.js");

const appInstance = initMod?.app || jsFirebaseMod?.app || null;
const auth = initMod?.auth || jsFirebaseMod?.auth || null;
const database = initMod?.database || jsFirebaseMod?.database || null;
const authReady = initMod?.authReady || Promise.resolve();

const firebaseReady = !!(auth && database);

let currentUser = null;
let selectedBigFile = null;

let mediaStream = null;
let audioCtx = null;
let analyser = null;
let freqAnimId = null;

let mediaRecorder = null;
let recordedChunks = [];

let unsubscribeChat = null;
let authUnsubscribe = null;
let sending = false;

/* =========================================================
   STATUS AND HELPERS
========================================================= */

function setStatus(message) {
  const element = $("msgStatus");
  if (element) element.textContent = message;
}

function formatSize(bytes = 0) {
  if (!bytes) return "";

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";

  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getRoomName() {
  const room = $("roomSelect")?.value || "quantum_global";

  // Prevent arbitrary RTDB path injection.
  if (!/^[a-zA-Z0-9_-]{1,60}$/.test(room)) {
    return "quantum_global";
  }

  return room;
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function setProgress(percent, message = "") {
  const wrap = $("msgProgressWrap");
  const bar = $("msgProgressBar");

  if (wrap) wrap.style.display = "block";
  if (bar) bar.style.width = `${percent}%`;

  if (message) setStatus(message);
}

/* =========================================================
   LOCAL MESSAGES
   Local messages are only available on this device.
========================================================= */

function readLocalMessages(room) {
  try {
    const all = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
    );

    return Array.isArray(all[room]) ? all[room] : [];
  } catch {
    return [];
  }
}

function writeLocalMessage(room, message) {
  try {
    const all = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY) || "{}"
    );

    if (!Array.isArray(all[room])) {
      all[room] = [];
    }

    all[room].push(message);

    if (all[room].length > 80) {
      all[room] = all[room].slice(-80);
    }

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(all)
    );

    return true;
  } catch (error) {
    console.error("Local message storage failed:", error);
    return false;
  }
}

/* =========================================================
   MESSAGE RENDERING
========================================================= */

function renderMessages(messages) {
  const box = $("chatBox");

  if (!box) return;

  box.replaceChildren();

  if (!messages.length) {
    const empty = document.createElement("div");

    empty.className = "msg-empty";
    empty.textContent =
      "এই রুমে এখনো কোনো মেসেজ বা ফাইল নেই।";

    box.appendChild(empty);
    return;
  }

  messages.forEach(message => {
    const item = document.createElement("div");
    item.className = "msg-item";

    const meta = document.createElement("div");
    meta.className = "msg-meta";

    const sender = document.createElement("strong");
    sender.textContent = message.sender || "AYNA User";

    const time = document.createElement("span");
    time.textContent = formatTime(message.createdAt);

    meta.append(sender, time);
    item.appendChild(meta);

    if (message.text) {
      const textElement = document.createElement("div");

      textElement.className = "msg-text";
      textElement.textContent = message.text;

      item.appendChild(textElement);
    }

    if (message.fileUrl) {
      const url = safeHttpUrl(message.fileUrl);

      if (url) {
        const mime = (message.mimeType || "").toLowerCase();

        if (mime.startsWith("image/")) {
          const image = document.createElement("img");

          image.className = "msg-media";
          image.src = url;
          image.alt = message.fileName || "Image";
          image.loading = "lazy";

          item.appendChild(image);

        } else if (mime.startsWith("video/")) {
          const video = document.createElement("video");

          video.className = "msg-media";
          video.src = url;
          video.controls = true;
          video.playsInline = true;
          video.preload = "metadata";

          item.appendChild(video);

        } else if (mime.startsWith("audio/")) {
          const audio = document.createElement("audio");

          audio.className = "msg-media";
          audio.src = url;
          audio.controls = true;
          audio.preload = "metadata";

          item.appendChild(audio);
        }

        const link = document.createElement("a");

        link.className = "msg-file-link";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        link.textContent =
          `📥 ${message.fileName || "File"} ` +
          (message.fileSize
            ? `(${formatSize(message.fileSize)})`
            : "");

        item.appendChild(link);
      }
    }

    box.appendChild(item);
  });

  box.scrollTop = box.scrollHeight;
}

/* =========================================================
   FIREBASE ROOM SUBSCRIPTION
========================================================= */

async function subscribeRoomMessages() {
  const room = getRoomName();

  if (typeof unsubscribeChat === "function") {
    unsubscribeChat();
    unsubscribeChat = null;
  }

  if (!firebaseReady) {
    renderMessages(readLocalMessages(room));

    setStatus(
      "Local mode: এই ডিভাইসেই মেসেজ সংরক্ষিত হবে।"
    );

    return;
  }

  if (!currentUser) {
    renderMessages([]);
    setStatus("Messenger ব্যবহার করতে আগে লগইন করুন।");
    return;
  }

  try {
    const { ref, onValue } = await import(
      "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js"
    );

    const chatRef = ref(
      database,
      `messenger_rooms/${room}`
    );

    unsubscribeChat = onValue(
      chatRef,
      snapshot => {
        const value = snapshot.val() || {};

        const messages = Object.entries(value)
          .map(([id, item]) => ({
            id,
            ...item
          }))
          .sort(
            (a, b) =>
              (a.createdAt || 0) -
              (b.createdAt || 0)
          );

        renderMessages(messages);
        setStatus("AYNA Messenger সংযুক্ত।");
      },
      error => {
        console.error(error);
        setStatus(
          "মেসেজ পড়া যাচ্ছে না। Database Rules পরীক্ষা করুন।"
        );
      }
    );

  } catch (error) {
    console.error(error);
    setStatus("Messenger সংযোগে সমস্যা হয়েছে।");
  }
}

/* =========================================================
   FILE UPLOAD
========================================================= */

async function uploadMessageFile(file) {
  if (!file) return "";

  if (file.size > MAX_LARGE_FILE_BYTES) {
    throw new Error("ফাইলের সর্বোচ্চ সীমা 250MB।");
  }

  if (!firebaseReady || !currentUser) {
    throw new Error(
      "Cloud file পাঠাতে Firebase লগইন প্রয়োজন।"
    );
  }

  const {
    getStorage,
    ref: storageRef,
    uploadBytesResumable,
    getDownloadURL
  } = await import(
    "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js"
  );

  const storage = appInstance
    ? getStorage(appInstance)
    : getStorage();

  const safeName = file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const target = storageRef(
    storage,
    `ayna_messenger/${getRoomName()}/${currentUser.uid}/${Date.now()}_${safeName}`
  );

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(
      target,
      file,
      {
        contentType:
          file.type || "application/octet-stream"
      }
    );

    task.on(
      "state_changed",

      snapshot => {
        const percentage = snapshot.totalBytes
          ? Math.round(
              snapshot.bytesTransferred /
              snapshot.totalBytes * 100
            )
          : 0;

        setProgress(
          percentage,
          `ফাইল আপলোড হচ্ছে: ${percentage}%`
        );
      },

      error => reject(error),

      async () => {
        try {
          const downloadURL = await getDownloadURL(
            task.snapshot.ref
          );

          resolve(downloadURL);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessagePayload({
  text = "",
  file = null
} = {}) {
  if (sending) return;

  const cleanText = String(text).trim();

  if (!cleanText && !file) {
    setStatus(
      "মেসেজ লিখুন অথবা একটি ফাইল নির্বাচন করুন।"
    );
    return;
  }

  if (firebaseReady && !currentUser) {
    setStatus(
      "মেসেজ পাঠাতে আগে AYNA BOOK-এ লগইন করুন।"
    );
    return;
  }

  const sendButton = $("sendMsgBtn");

  sending = true;

  if (sendButton) {
    sendButton.disabled = true;
  }

  try {
    let fileUrl = "";

    if (file) {
      fileUrl = await uploadMessageFile(file);
    }

    const message = {
      sender:
        currentUser?.displayName || "AYNA Member",

      uid:
        currentUser?.uid || "local-user",

      text: cleanText,

      fileName: file?.name || "",

      fileSize: file?.size || 0,

      mimeType: file?.type || "",

      fileUrl,

      createdAt: Date.now()
    };

    const room = getRoomName();

    if (firebaseReady) {
      const {
        ref,
        push,
        set
      } = await import(
        "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js"
      );

      const newMessageRef = push(
        ref(database, `messenger_rooms/${room}`)
      );

      await set(newMessageRef, message);

    } else {
      const saved = writeLocalMessage(room, message);

      if (!saved) {
        throw new Error(
          "Local storage পূর্ণ অথবা unavailable।"
        );
      }

      renderMessages(readLocalMessages(room));
    }

    if ($("msgInput")) {
      $("msgInput").value = "";
    }

    selectedBigFile = null;

    if ($("bigFileInput")) {
      $("bigFileInput").value = "";
    }

    if ($("pickedFileInfo")) {
      $("pickedFileInfo").textContent =
        "কোনো ফাইল নির্বাচিত নয়";
    }

    if ($("msgProgressWrap")) {
      $("msgProgressWrap").style.display = "none";
    }

    if ($("msgProgressBar")) {
      $("msgProgressBar").style.width = "0%";
    }

    setStatus("মেসেজ পাঠানো হয়েছে!");

  } catch (error) {
    console.error("Send message error:", error);

    setStatus(
      error.message ||
      "মেসেজ পাঠানো যায়নি। Firebase Rules/Storage পরীক্ষা করুন।"
    );

  } finally {
    sending = false;

    if (sendButton) {
      sendButton.disabled = false;
    }
  }
}

/* =========================================================
   AUDIO FREQUENCY VISUALIZER
========================================================= */

function drawFrequencyWave() {
  const canvas = $("freqCanvas");

  if (!canvas || !analyser) return;

  const context = canvas.getContext("2d");

  if (!context) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  if (freqAnimId) {
    cancelAnimationFrame(freqAnimId);
  }

  function renderFrame() {
    if (!analyser || !canvas.isConnected) return;

    freqAnimId = requestAnimationFrame(renderFrame);

    analyser.getByteFrequencyData(dataArray);

    context.fillStyle = "#030712";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const barWidth =
      (canvas.width / bufferLength) * 2.4;

    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight =
        (dataArray[i] / 255) *
        (canvas.height - 8);

      context.fillStyle =
        i % 2 === 0 ? "#ffe64d" : "#38f2ff";

      context.fillRect(
        x,
        canvas.height - barHeight,
        Math.max(2, barWidth - 1),
        barHeight
      );

      x += barWidth;
    }
  }

  renderFrame();
}

/* =========================================================
   MICROPHONE
========================================================= */

async function startHighQualityMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus(
      "মাইক্রোফোনের জন্য HTTPS এবং অনুমতি প্রয়োজন।"
    );
    return null;
  }

  if (mediaStream) {
    return mediaStream;
  }

  const mode =
    $("audioQualitySelect")?.value || "high";

  const sampleRate =
    mode === "high" ? 48000 : 44100;

  try {
    mediaStream =
      await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    audioCtx = new AudioContextClass({
      sampleRate
    });

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    const source =
      audioCtx.createMediaStreamSource(mediaStream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    drawFrequencyWave();

    setStatus(
      `মাইক্রোফোন সক্রিয় (${sampleRate}Hz)।`
    );

    return mediaStream;

  } catch (error) {
    console.error(error);

    setStatus(
      "মাইক্রোফোন চালু করা যায়নি। অনুমতি পরীক্ষা করুন।"
    );

    return null;
  }
}

/* =========================================================
   STOP AUDIO / VIDEO
========================================================= */

function stopAudioAndVideo() {
  if (freqAnimId) {
    cancelAnimationFrame(freqAnimId);
    freqAnimId = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      track.stop();
    });

    mediaStream = null;
  }

  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }

  analyser = null;

  const video = $("callVideo");

  if (video) {
    video.srcObject = null;
  }
}

/* =========================================================
   VOICE RECORDING
========================================================= */

async function startVoiceRecording() {
  if (!window.MediaRecorder) {
    setStatus(
      "এই ব্রাউজারে MediaRecorder সমর্থিত নয়।"
    );
    return;
  }

  const stream =
    mediaStream || await startHighQualityMic();

  if (!stream) return;

  const quality =
    $("audioQualitySelect")?.value || "high";

  const bitsPerSecond =
    quality === "high" ? 192000 : 128000;

  recordedChunks = [];

  try {
    mediaRecorder = new MediaRecorder(
      stream,
      {
        audioBitsPerSecond: bitsPerSecond
      }
    );

    mediaRecorder.ondataavailable = event => {
      if (event.data?.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onerror = event => {
      console.error(event);
      setStatus("ভয়েস রেকর্ডিংয়ে সমস্যা হয়েছে।");
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(
        recordedChunks,
        {
          type:
            mediaRecorder.mimeType ||
            "audio/webm"
        }
      );

      if (!blob.size) {
        setStatus("কোনো অডিও রেকর্ড হয়নি।");
        return;
      }

      const voiceFile = new File(
        [blob],
        `ayna_voice_${Date.now()}.webm`,
        {
          type: blob.type
        }
      );

      await sendMessagePayload({
        text: "🎙️ ভয়েস মেসেজ",
        file: voiceFile
      });
    };

    mediaRecorder.start();

    setStatus(
      `ভয়েস রেকর্ড চলছে (${bitsPerSecond / 1000}kbps)। Stop চাপুন।`
    );

  } catch (error) {
    console.error(error);
    setStatus("ভয়েস রেকর্ডিং শুরু করা যায়নি।");
  }
}

/* =========================================================
   CAMERA PREVIEW
========================================================= */

async function startVideoStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus(
      "ভিডিওর জন্য HTTPS এবং ক্যামেরা অনুমতি প্রয়োজন।"
    );
    return;
  }

  try {
    stopAudioAndVideo();

    mediaStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: true
      });

    const video = $("callVideo");

    if (video) {
      video.srcObject = mediaStream;
      video.muted = true;
      video.playsInline = true;

      await video.play().catch(() => {});
    }

    setStatus(
      "ক্যামেরা প্রিভিউ চালু হয়েছে। এটি এখনো অন্য ব্যবহারকারীর কাছে যাচ্ছে না।"
    );

  } catch (error) {
    console.error(error);
    setStatus("ক্যামেরা চালু করা যায়নি।");
  }
}

/* =========================================================
   EVENT LISTENERS
========================================================= */

function bindClick(id, callback) {
  const element = $(id);

  if (!element) {
    console.warn(`Missing HTML element: #${id}`);
    return;
  }

  element.addEventListener("click", callback);
}

bindClick("startMicFreqBtn", () => {
  startHighQualityMic();
});

bindClick("recordVoiceBtn", () => {
  startVoiceRecording();
});

bindClick("stopVoiceBtn", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  stopAudioAndVideo();
  setStatus("অডিও/রেকর্ডিং বন্ধ হয়েছে।");
});

bindClick("startVideoStreamBtn", () => {
  startVideoStream();
});

bindClick("stopVideoStreamBtn", () => {
  stopAudioAndVideo();
  setStatus("ভিডিও প্রিভিউ বন্ধ হয়েছে।");
});

bindClick("pickBigFileBtn", () => {
  $("bigFileInput")?.click();
});

bindClick("sendMsgBtn", () => {
  sendMessagePayload({
    text: $("msgInput")?.value || "",
    file: selectedBigFile
  });
});

/* =========================================================
   FILE SELECTION
========================================================= */

$("bigFileInput")?.addEventListener("change", event => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (file.size > MAX_LARGE_FILE_BYTES) {
    setStatus(
      "সর্বোচ্চ 250MB পর্যন্ত ফাইল নির্বাচন করা যাবে।"
    );

    event.target.value = "";
    selectedBigFile = null;
    return;
  }

  selectedBigFile = file;

  if ($("pickedFileInfo")) {
    $("pickedFileInfo").textContent =
      `📎 ${file.name} (${formatSize(file.size)})`;
  }

  setStatus("ফাইল প্রস্তুত। পাঠান বাটনে চাপ দিন।");
});

/* =========================================================
   ENTER TO SEND
========================================================= */

$("msgInput")?.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {
    event.preventDefault();

    sendMessagePayload({
      text: $("msgInput").value,
      file: selectedBigFile
    });
  }
});

/* =========================================================
   ROOM CHANGE
========================================================= */

$("roomSelect")?.addEventListener(
  "change",
  subscribeRoomMessages
);

/* =========================================================
   FIREBASE AUTH
========================================================= */

async function initializeMessenger() {
  if (!firebaseReady) {
    setStatus(
      "Firebase পাওয়া যায়নি। Local mode চালু আছে।"
    );

    await subscribeRoomMessages();
    return;
  }

  try {
    await authReady;

    const { onAuthStateChanged } =
      await import(
        "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"
      );

    authUnsubscribe = onAuthStateChanged(
      auth,
      async user => {
        currentUser = user || null;

        if (!currentUser) {
          if (typeof unsubscribeChat === "function") {
            unsubscribeChat();
            unsubscribeChat = null;
          }

          renderMessages([]);

          setStatus(
            "মেসেজ দেখতে ও পাঠাতে লগইন করুন।"
          );

          return;
        }

        await subscribeRoomMessages();
      }
    );

  } catch (error) {
    console.error(error);

    setStatus(
      "Firebase Auth চালু করা যায়নি।"
    );
  }
}

/* =========================================================
   PAGE CLEANUP
========================================================= */

window.addEventListener("beforeunload", () => {
  if (typeof unsubscribeChat === "function") {
    unsubscribeChat();
  }

  if (typeof authUnsubscribe === "function") {
    authUnsubscribe();
  }

  stopAudioAndVideo();
});

/* =========================================================
   START
========================================================= */

initializeMessenger();

window.AYNA_MESSENGER = {
  sendMessagePayload,
  subscribeRoomMessages,
  startHighQualityMic,
  startVoiceRecording,
  startVideoStream,
  stopAudioAndVideo
};

console.log("AYNA BOOK Messenger initialized.");
