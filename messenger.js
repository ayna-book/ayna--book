const MAX_LARGE_FILE_BYTES = 250 * 1024 * 1024;
const LOCAL_STORAGE_KEY = "ayna_messenger_messages_v1";

const $ = id => document.getElementById(id);

async function loadOptionalScript(path) {
  try {
    return await import(path);
  } catch (_) {
    return null;
  }
}

const jsFirebaseMod = await loadOptionalScript("./js/firebase.js");
const initMod = await loadOptionalScript("./firebase-init.js");

const appInstance = initMod?.app || jsFirebaseMod?.app || null;
const auth = initMod?.auth || jsFirebaseMod?.auth || null;
const database = initMod?.database || jsFirebaseMod?.database || null;
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

function setStatus(msg) {
  if ($("msgStatus")) $("msgStatus").textContent = msg;
}

function formatSize(bytes = 0) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString();
}

function getRoomName() {
  return $("roomSelect")?.value || "quantum_global";
}

function readLocalMessages(room) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    return Array.isArray(all[room]) ? all[room] : [];
  } catch (_) {
    return [];
  }
}

function writeLocalMessage(room, msgObj) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    if (!Array.isArray(all[room])) all[room] = [];
    all[room].push(msgObj);
    if (all[room].length > 80) all[room] = all[room].slice(-80);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
  } catch (_) {
    // বড় Base64 স্টোরেজ সীমা ছাড়ালে এড়িয়ে যাওয়া হবে
  }
}

function renderMessages(messages) {
  const box = $("chatBox");
  if (!box) return;

  if (!messages.length) {
    box.innerHTML = '<div style="text-align:center;color:#dce6fa;">এই রুমে এখনো কোনো মেসেজ বা ফাইল নেই।</div>';
    return;
  }

  box.innerHTML = "";

  messages.forEach(m => {
    const item = document.createElement("div");
    item.className = "msg-item";

    const meta = document.createElement("div");
    meta.className = "msg-meta";
    meta.innerHTML = `<strong>${m.sender || "AYNA User"}</strong><span>${formatTime(m.createdAt)}</span>`;
    item.appendChild(meta);

    if (m.text) {
      const textEl = document.createElement("div");
      textEl.className = "msg-text";
      textEl.textContent = m.text;
      item.appendChild(textEl);
    }

    if (m.fileUrl) {
      const mime = (m.mimeType || "").toLowerCase();
      if (mime.startsWith("image/")) {
        const img = document.createElement("img");
        img.className = "msg-media";
        img.src = m.fileUrl;
        img.alt = m.fileName || "Image";
        item.appendChild(img);
      } else if (mime.startsWith("video/")) {
        const vid = document.createElement("video");
        vid.className = "msg-media";
        vid.src = m.fileUrl;
        vid.controls = true;
        vid.playsInline = true;
        item.appendChild(vid);
      } else if (mime.startsWith("audio/")) {
        const aud = document.createElement("audio");
        aud.className = "msg-media";
        aud.src = m.fileUrl;
        aud.controls = true;
        item.appendChild(aud);
      }

      const link = document.createElement("a");
      link.className = "msg-file-link";
      link.href = m.fileUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = `📥 ${m.fileName || "File"} ${m.fileSize ? `(${formatSize(m.fileSize)})` : ""}`;
      item.appendChild(link);
    }

    box.appendChild(item);
  });

  box.scrollTop = box.scrollHeight;
}

async function subscribeRoomMessages() {
  const room = getRoomName();
  if (typeof unsubscribeChat === "function") {
    unsubscribeChat();
    unsubscribeChat = null;
  }

  renderMessages(readLocalMessages(room));

  if (!firebaseReady) return;

  const { ref, onValue } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  const chatRef = ref(database, `messenger_rooms/${room}`);
  unsubscribeChat = onValue(chatRef, snap => {
    const val = snap.val() || {};
    const list = Object.entries(val)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    renderMessages(list);
  });
}

async function uploadMessageFile(file) {
  if (file.size <= 3 * 1024 * 1024 && !firebaseReady) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
      reader.readAsDataURL(file);
    });
  }

  if (firebaseReady) {
    const { getStorage, ref: sRef, uploadBytesResumable, getDownloadURL } =
      await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js");

    const storage = appInstance ? getStorage(appInstance) : getStorage();
    const uid = currentUser?.uid || "guest";
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const targetRef = sRef(storage, `ayna_messenger/${getRoomName()}/${uid}/${safeName}`);

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(targetRef, file, {
        contentType: file.type || "application/octet-stream"
      });
      $("msgProgressWrap").style.display = "block";

      task.on(
        "state_changed",
        snap => {
          const pct = snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
          $("msgProgressBar").style.width = `${pct}%`;
          setStatus(`বড় ফাইল আপলোড হচ্ছে: ${pct}% (${formatSize(snap.bytesTransferred)} / ${formatSize(snap.totalBytes)})`);
        },
        err => reject(err),
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        }
      );
    });
  }

  return URL.createObjectURL(file);
}

async function sendMessagePayload({ text = "", file = null }) {
  const cleanText = text.trim();
  if (!cleanText && !file) {
    setStatus("মেসেজ লিখুন অথবা একটি ফাইল/অডিও/ভিডিও নির্বাচন করুন।");
    return;
  }

  $("sendMsgBtn").disabled = true;

  try {
    let fileUrl = "";
    if (file) {
      fileUrl = await uploadMessageFile(file);
    }

    const msgObj = {
      sender: currentUser?.displayName || currentUser?.email || "AYNA Member",
      uid: currentUser?.uid || "guest",
      text: cleanText,
      fileName: file?.name || "",
      fileSize: file?.size || 0,
      mimeType: file?.type || "",
      fileUrl,
      createdAt: Date.now()
    };

    const room = getRoomName();

    if (firebaseReady) {
      const { ref, push, set } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
      const newRef = push(ref(database, `messenger_rooms/${room}`));
      await set(newRef, msgObj);
    } else {
      writeLocalMessage(room, msgObj);
      renderMessages(readLocalMessages(room));
    }

    $("msgInput").value = "";
    selectedBigFile = null;
    $("bigFileInput").value = "";
    $("pickedFileInfo").textContent = "কোনো ফাইল নির্বাচিত নয়";
    $("msgProgressWrap").style.display = "none";
    $("msgProgressBar").style.width = "0%";
    setStatus("মেসেজ / ফাইল পাঠানো হয়েছে!");
  } catch (err) {
    console.error(err);
    setStatus("পাঠাতে সমস্যা হয়েছে (Firebase Storage/Database অনুমোদন পরীক্ষা করুন)।");
  } finally {
    $("sendMsgBtn").disabled = false;
  }
}

function drawFrequencyWave() {
  const canvas = $("freqCanvas");
  if (!canvas || !analyser) return;
  const ctx = canvas.getContext("2d");
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function renderFrame() {
    freqAnimId = requestAnimationFrame(renderFrame);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#030712";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.4;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * (canvas.height - 8);
      ctx.fillStyle = i % 2 === 0 ? "#ffe64d" : "#38f2ff";
      ctx.fillRect(x, canvas.height - barHeight, Math.max(2, barWidth - 1), barHeight);
      x += barWidth;
    }
  }

  renderFrame();
}

async function startHighQualityMic() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("মাইক্রোফোনের জন্য HTTPS বা অনুমতি প্রয়োজন।");
    return;
  }

  const mode = $("audioQualitySelect")?.value || "high";
  const sampleRate = mode === "high" ? 48000 : 44100;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate,
        channelCount: 2,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    mediaStream = stream;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass({ sampleRate });
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    drawFrequencyWave();
    setStatus(`হাই-কোয়ালিটি অডিও ফ্রিকোয়েন্সি সক্রিয় (${sampleRate}Hz)।`);
    return stream;
  } catch (err) {
    console.error(err);
    setStatus("মাইক্রোফোন চালু করা যায়নি।");
    return null;
  }
}

function stopAudioAndVideo() {
  if (freqAnimId) {
    cancelAnimationFrame(freqAnimId);
    freqAnimId = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
  if ($("callVideo")) {
    $("callVideo").srcObject = null;
  }
}

$("startMicFreqBtn").addEventListener("click", () => startHighQualityMic());

$("recordVoiceBtn").addEventListener("click", async () => {
  const stream = mediaStream || (await startHighQualityMic());
  if (!stream) return;

  const bitsPerSecond = $("audioQualitySelect")?.value === "high" ? 192000 : 128000;
  recordedChunks = [];

  try {
    mediaRecorder = new MediaRecorder(stream, { audioBitsPerSecond: bitsPerSecond });
    mediaRecorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      const voiceFile = new File([blob], `ayna_voice_${Date.now()}.webm`, { type: blob.type });
      await sendMessagePayload({ text: "🎙️ হাই-কোয়ালিটি ভয়েস মেসেজ", file: voiceFile });
    };
    mediaRecorder.start();
    setStatus(`ভয়েস রেকর্ড চলছে (${bitsPerSecond / 1000}kbps)... শেষ হলে স্টপ চাপুন।`);
  } catch (err) {
    console.error(err);
    setStatus("ভয়েস রেকর্ডিং শুরু করা যায়নি।");
  }
});

$("stopVoiceBtn").addEventListener("click", () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  stopAudioAndVideo();
  setStatus("অডিও/রেকর্ডিং বন্ধ করা হয়েছে।");
});

$("startVideoStreamBtn").addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    setStatus("ভিডিও স্ট্রিমের জন্য HTTPS প্রয়োজন।");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      audio: true
    });
    mediaStream = stream;
    $("callVideo").srcObject = stream;
    setStatus("হাই-কোয়ালিটি লাইভ ভিডিও স্ট্রিম চালু হয়েছে।");
  } catch (err) {
    console.error(err);
    setStatus("ভিডিও স্ট্রিম চালু করা যায়নি।");
  }
});

$("stopVideoStreamBtn").addEventListener("click", () => {
  stopAudioAndVideo();
  setStatus("ভিডিও স্ট্রিম বন্ধ করা হয়েছে।");
});

$("pickBigFileBtn").addEventListener("click", () => $("bigFileInput").click());

$("bigFileInput").addEventListener("change", e => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > MAX_LARGE_FILE_BYTES) {
    setStatus("সর্বোচ্চ 250MB পর্যন্ত বড় ফাইল পাঠানো যাবে।");
    e.target.value = "";
    return;
  }

  selectedBigFile = file;
  $("pickedFileInfo").textContent = `📎 ${file.name} (${formatSize(file.size)})`;
  setStatus("ফাইল প্রস্তুত — পাঠান বাটনে চাপ দিন।");
});

$("sendMsgBtn").addEventListener("click", () => {
  sendMessagePayload({ text: $("msgInput").value, file: selectedBigFile });
});

$("msgInput").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessagePayload({ text: $("msgInput").value, file: selectedBigFile });
  }
});

$("roomSelect").addEventListener("change", subscribeRoomMessages);

if (firebaseReady && auth) {
  import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js").then(({ onAuthStateChanged }) => {
    onAuthStateChanged(auth, user => {
      currentUser = user || null;
    });
  });
}

subscribeRoomMessages();