// =====================================================
// AYNA BOOK — VOICE CLOCK
// =====================================================

const clockEl = document.getElementById("clock");
const dateTextEl = document.getElementById("dateText");
const ampmEl = document.getElementById("ampm");

const statusEl = document.getElementById("status");

const speakNowBtn = document.getElementById("speakNowBtn");
const voiceToggleBtn = document.getElementById("voiceToggleBtn");
const hourToggleBtn = document.getElementById("hourToggleBtn");

const backBtn = document.getElementById("backBtn");


// =====================================================
// SETTINGS
// =====================================================

let voiceEnabled = true;
let hourlyEnabled = true;

let lastAnnouncedHour = null;


// =====================================================
// STORAGE
// =====================================================

try {
  const savedVoice = localStorage.getItem("ayna_voice_enabled");
  const savedHourly = localStorage.getItem("ayna_hourly_enabled");

  if (savedVoice !== null) {
    voiceEnabled = savedVoice === "true";
  }

  if (savedHourly !== null) {
    hourlyEnabled = savedHourly === "true";
  }
} catch (error) {
  console.log("LocalStorage unavailable:", error);
}


// =====================================================
// BANGLA NUMBER
// =====================================================

const banglaNumbers = [
  "শূন্য",
  "এক",
  "দুই",
  "তিন",
  "চার",
  "পাঁচ",
  "ছয়",
  "সাত",
  "আট",
  "নয়",
  "দশ",
  "এগারো",
  "বারো",
  "তেরো",
  "চৌদ্দ",
  "পনেরো",
  "ষোল",
  "সতেরো",
  "আঠারো",
  "উনিশ",
  "বিশ",
  "একুশ",
  "বাইশ",
  "তেইশ",
  "চব্বিশ",
  "পঁচিশ",
  "ছাব্বিশ",
  "সাতাশ",
  "আঠাশ",
  "উনত্রিশ",
  "ত্রিশ",
  "একত্রিশ",
  "বত্রিশ",
  "তেত্রিশ",
  "চৌত্রিশ",
  "পঁয়ত্রিশ",
  "ছত্রিশ",
  "সাঁইত্রিশ",
  "আটত্রিশ",
  "উনচল্লিশ",
  "চল্লিশ",
  "একচল্লিশ",
  "বিয়াল্লিশ",
  "তেতাল্লিশ",
  "চুয়াল্লিশ",
  "পঁয়তাল্লিশ",
  "ছেচল্লিশ",
  "সাতচল্লিশ",
  "আটচল্লিশ",
  "উনপঞ্চাশ",
  "পঞ্চাশ",
  "একান্ন",
  "বাহান্ন",
  "তিপ্পান্ন",
  "চুয়ান্ন",
  "পঞ্চান্ন",
  "ছাপ্পান্ন",
  "সাতান্ন",
  "আটান্ন",
  "উনষাট",
  "ষাট"
];


// =====================================================
// GET BANGLA NUMBER
// =====================================================

function bnNumber(number) {

  number = Number(number);

  if (
    number >= 0 &&
    number < banglaNumbers.length
  ) {
    return banglaNumbers[number];
  }

  return String(number);
}


// =====================================================
// GET TIME
// =====================================================

function getTimeInfo() {

  const now = new Date();

  let hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  const ampm = hour >= 12 ? "PM" : "AM";

  let hour12 = hour % 12;

  if (hour12 === 0) {
    hour12 = 12;
  }

  return {
    now,
    hour,
    hour12,
    minute,
    second,
    ampm
  };
}


// =====================================================
// UPDATE CLOCK
// =====================================================

function updateClock() {

  const time = getTimeInfo();

  let hour = String(time.hour12).padStart(2, "0");
  let minute = String(time.minute).padStart(2, "0");
  let second = String(time.second).padStart(2, "0");

  clockEl.textContent =
    `${hour}:${minute}:${second}`;

  ampmEl.textContent = time.ampm;

  updateDate(time.now);

  checkHourlyAnnouncement(time);
}


// =====================================================
// UPDATE DATE
// =====================================================

function updateDate(date) {

  const days = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার"
  ];

  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর"
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  dateTextEl.textContent =
    `${dayName}, ${day} ${month} ${year}`;
}


// =====================================================
// VOICE
// =====================================================

function speak(text) {

  if (!voiceEnabled) {
    return;
  }

  if (!("speechSynthesis" in window)) {

    statusEl.textContent =
      "এই ডিভাইসে Voice Speech সমর্থিত নয়";

    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.lang = "bn-BD";

  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  utterance.volume = 1.0;


  // =================================================
  // TRY TO FIND BANGLA FEMALE VOICE
  // =================================================

  const voices =
    window.speechSynthesis.getVoices();

  let selectedVoice = null;


  // First priority:
  // Bangla + female
  selectedVoice = voices.find(v =>
    v.lang.toLowerCase().startsWith("bn") &&
    /female|woman|girl|female/i.test(v.name)
  );


  // Second priority:
  // Any Bangla voice
  if (!selectedVoice) {

    selectedVoice = voices.find(v =>
      v.lang.toLowerCase().startsWith("bn")
    );

  }


  // Third priority:
  // Bengali / Bangladesh voice
  if (!selectedVoice) {

    selectedVoice = voices.find(v =>
      v.name.toLowerCase().includes("bengali") ||
      v.name.toLowerCase().includes("bangla") ||
      v.lang.toLowerCase().includes("bn-bd")
    );

  }


  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }


  utterance.onstart = () => {

    statusEl.textContent =
      "🔊 সময় বলা হচ্ছে...";

  };


  utterance.onend = () => {

    statusEl.textContent =
      hourlyEnabled
        ? "🕐 প্রতি ঘণ্টার ঘোষণা চালু"
        : "🕐 প্রতি ঘণ্টার ঘোষণা বন্ধ";

  };


  utterance.onerror = (event) => {

    console.log(
      "Speech error:",
      event.error
    );

    statusEl.textContent =
      "Voice চালু করা যায়নি";

  };


  window.speechSynthesis.speak(
    utterance
  );
}


// =====================================================
// CREATE TIME SPEECH
// =====================================================

function createTimeSpeech() {

  const time = getTimeInfo();

  let hourText =
    bnNumber(time.hour12);

  let minuteText =
    bnNumber(time.minute);

  let periodText =
    time.ampm === "AM"
      ? "এ এম"
      : "পি এম";


  if (time.minute === 0) {

    return `
      এখন সময় ${hourText}টা।
      ${periodText}।
    `;

  }


  return `
    এখন সময় ${hourText}টা
    ${minuteText} মিনিট।
    ${periodText}।
  `;
}


// =====================================================
// SPEAK CURRENT TIME
// =====================================================

function speakCurrentTime() {

  if (!voiceEnabled) {

    statusEl.textContent =
      "Voice বন্ধ আছে";

    return;
  }

  const speech =
    createTimeSpeech();

  speak(speech);
}


// =====================================================
// HOURLY ANNOUNCEMENT
// =====================================================

function checkHourlyAnnouncement(time) {

  if (!hourlyEnabled) {
    return;
  }

  // Only announce at minute 00
  if (time.minute !== 0) {
    return;
  }

  // Prevent repeating every second
  if (lastAnnouncedHour === time.hour) {
    return;
  }

  lastAnnouncedHour = time.hour;

  speakCurrentTime();
}


// =====================================================
// VOICE BUTTON
// =====================================================

voiceToggleBtn.addEventListener(
  "click",
  () => {

    voiceEnabled = !voiceEnabled;

    try {
      localStorage.setItem(
        "ayna_voice_enabled",
        String(voiceEnabled)
      );
    } catch (error) {}

    updateButtons();

    if (!voiceEnabled) {

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      statusEl.textContent =
        "🔇 Voice বন্ধ";

    } else {

      statusEl.textContent =
        "🔊 Voice চালু";

    }
  }
);


// =====================================================
// HOURLY BUTTON
// =====================================================

hourToggleBtn.addEventListener(
  "click",
  () => {

    hourlyEnabled = !hourlyEnabled;

    try {
      localStorage.setItem(
        "ayna_hourly_enabled",
        String(hourlyEnabled)
      );
    } catch (error) {}

    updateButtons();

    statusEl.textContent =
      hourlyEnabled
        ? "🕐 প্রতি ঘণ্টার ঘোষণা চালু"
        : "🕐 প্রতি ঘণ্টার ঘোষণা বন্ধ";
  }
);


// =====================================================
// SPEAK NOW BUTTON
// =====================================================

speakNowBtn.addEventListener(
  "click",
  () => {

    speakCurrentTime();

  }
);


// =====================================================
// BUTTON UI
// =====================================================

function updateButtons() {

  if (voiceEnabled) {

    voiceToggleBtn.textContent =
      "🔊 Voice: ON";

    voiceToggleBtn.className =
      "voice-on";

  } else {

    voiceToggleBtn.textContent =
      "🔇 Voice: OFF";

    voiceToggleBtn.className =
      "voice-off";

  }


  if (hourlyEnabled) {

    hourToggleBtn.textContent =
      "🕐 প্রতি ঘণ্টায় বলা: ON";

    hourToggleBtn.className =
      "hour-on";

  } else {

    hourToggleBtn.textContent =
      "🔕 প্রতি ঘণ্টায় বলা: OFF";

    hourToggleBtn.className =
      "hour-off";

  }
}


// =====================================================
// BACK BUTTON
// =====================================================

backBtn.addEventListener(
  "click",
  () => {

    if (document.referrer) {

      history.back();

    } else {

      window.location.href =
        "./index.html";

    }
  }
);


// =====================================================
// LOAD VOICES
// =====================================================

if ("speechSynthesis" in window) {

  window.speechSynthesis.onvoiceschanged =
    () => {

      console.log(
        "Available voices:",
        window.speechSynthesis.getVoices()
      );

    };
}


// =====================================================
// START
// =====================================================

updateButtons();

updateClock();

setInterval(
  updateClock,
  1000
);


// =====================================================
// PREVENT SCREEN SLEEP WHILE PAGE IS ACTIVE
// =====================================================

let wakeLock = null;

async function requestWakeLock() {

  try {

    if (
      "wakeLock" in navigator &&
      document.visibilityState === "visible"
    ) {

      wakeLock =
        await navigator.wakeLock.request("screen");

      console.log(
        "Screen Wake Lock enabled"
      );

    }

  } catch (error) {

    console.log(
      "Wake Lock unavailable:",
      error
    );

  }
}


document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState === "visible"
    ) {

      requestWakeLock();

    }

  }
);


requestWakeLock();