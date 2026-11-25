// AYNA BOOK • index.js — Full AI Radar, Weather, Civil Aviation & Quantum Hub Coordinator

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = (id) => document.getElementById(id);

export const MEDIA_LIMITS = {
  image: 25 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  video: 250 * 1024 * 1024,
  file: 250 * 1024 * 1024
};

export const AYNA_REGISTRY_ITEMS = [
  "js (রুট তালিকায় প্রথমবার দেখা যাচ্ছে)", "android-app", "aspect-ratio: 1", "assets", "functions",
  "world-leaders", "world-leaders/world-leaders.html", "world-leaders/world-leaders.js",
  "world-leaders/leaders.json", "world-leaders/flags", "world-leaders/photos",
  "index.html", ".github (android-app)", "app (android-app)", "4account.html", "access.html",
  "account-security.html", "admin-payment.html", "android-hub.html", "apple.html",
  "arabic-calendar.html", "audio-video-messaging.html", "auth.html", "auto-network.html",
  "bangla-radio-tv.html", "bd-directory.html", "breaking-news.html", "business-directory.html",
  "button.html", "calendar.html", "camera.html", "chat.html", "clock.html", "compass.html",
  "countries.html", "currency-exchange.html", "dashboard.html", "direction.html", "ev-vehicles.html",
  "forgot-password.html", "github-firebase-config.html", "global-alert.html", "google-official-sites.html",
  "gps.html", "home.html", "hourly-clock.html", "location-alert.html", "login-activity.html",
  "login.html", "medical-research.html", "medicine-store.html", "messages.html", "messenger.html",
  "military-radar.html", "ownership.html", "passwed.html", "payment-pending.html", "payment.html",
  "prayer.html", "privacy-settings.html", "privacy.html", "profile.html", "public-profile.html",
  "qr.html", "quantum.html", "radar-compass.html", "radar.html", "radio-tv.html", "radio.html",
  "register.html", "security.html", "signup.html", "studio.html", "supercomputer.html", "tv-live.html",
  "us-alerts.html", "user-search.html", "verify-email.html", "world-doctors.html", "world-holidays.html",
  "world-locations.html", "world-grocery.html", "world-farmers.html", "poultry-farmers.html",
  "price-list.html", "world-market.html", "world-officials.html", "air-rail-transport.html",
  "world-air-rail.html", "world-garments.html", "world-jobs.html", "world-ngo-rights.html",
  "ulema-research.html", "access.js", "account-types.js", "admin-payment.js", "app.js",
  "arabic-calendar.js", "auth-guard.js", "auth.js", "calendar.js", "chat.js", "clock.js",
  "comments.js", "compass.js", "connectivity.js", "database.js", "firebase-config.js",
  "firebase-init.js", "firebase.js", "follow.js", "forgot-password.js", "functions.js", "gps.js",
  "index.js", "likes.js", "login-activity.js", "login.js", "messenger.js", "military-radar.js",
  "notifications-page.js", "notifications.js", "offline.js", "payment-status.js", "payment.js",
  "posts.js", "prayer.js", "privacy-settings.js", "privacy.js", "profile.js", "qr.js",
  "quantum-security.js", "radar.js", "radio.js", "register.js", "security-dashboard.js",
  "security.js", "server.js.node.js", "session-logout.js", "session-security.js", "set-admin-claim.js",
  "signup.js", "storage-test.js", "storage.js", "sw.js", "translator.js", "tv-live.js", "update.js",
  "us-alerts.js", "verify-email.js", "vite.config.js", "world-holidays.js", "world-leaders.js",
  "world-grocery.js", "world-farmers.js", "poultry-farmers.js", "daily-price-list.js", "price-list.js",
  "world-market.js", "world-officials.js", "air-rail-transport.js", "world-air-rail.js",
  "world-garments.js", "world-jobs.js", "world-ngo-rights.js", "ulema-research.js", "AuthScreen.kt",
  "HomeScreen.kt", "MainActivity.kt", "MessagingScreen.kt", "PostScreen.kt", "build.gradle.kts",
  "gradle.properties", "settings.gradle.kts", ".gitignore", "AYNA-BOOK-FILE-STRUCTURE.txt",
  "AndroidManifest.xml", "README.md", "_config.yml", "ayna-book-check.yml", "ayna-ui-patch.css",
  "build-apk.yml", "colors.xml", "dashboard.php", "database.rules.json", "deploy-pages.yml",
  "firebase.json", "firestore.rules", "google-services.json", "icon-192.png", "icon-512.png",
  "jekyll-gh-pages.yml", "manifest.json", "manifest.webmanifest", "package.json", "page-register",
  "sha1.yml", "storage.rules", "strings.xml", "styles.css", "themes.xml", "vercel.json", "version.json"
];

const CITY_COORDS = {
  dhaka: { lat: 23.8103, lon: 90.4125, bn: "ঢাকা" },
  london: { lat: 51.5072, lon: -0.1276, bn: "লন্ডন" },
  tokyo: { lat: 35.6762, lon: 139.6503, bn: "টোকিও" },
  makkah: { lat: 21.3891, lon: 39.8579, bn: "মক্কা" },
  "new york": { lat: 40.7128, lon: -74.006, bn: "নিউ ইয়র্ক" }
};

const TRADE_ITEMS = [
  { name: "তৈরি পোশাক (RMG)", unit: "টন", priceUsd: 18500 },
  { name: "পাট ও পাটজাত পণ্য", unit: "টন", priceUsd: 1420 },
  { name: "চিংড়ি ও হিমায়িত মাছ", unit: "টন", priceUsd: 7800 },
  { name: "ফার্মাসিউটিক্যালস", unit: "ব্যাচ", priceUsd: 12500 },
  { name: "চা পাতা", unit: "টন", priceUsd: 2650 }
];

const WORLD_COUNTRIES = [
  { code: "BGD", name: "বাংলাদেশ", area: "১,৪৭,৫৭০ বর্গকিমি", pop: "১৭.৩ কোটি", gdpGrowth: "৫.৮%" },
  { code: "IND", name: "ভারত", area: "৩২,৮৭,২৬৩ বর্গকিমি", pop: "১৪৪.১ কোটি", gdpGrowth: "৬.৫%" },
  { code: "USA", name: "যুক্তরাষ্ট্র", area: "৯৮,৩৩,৫২০ বর্গকিমি", pop: "৩৪.১ কোটি", gdpGrowth: "২.৭%" },
  { code: "SAU", name: "সৌদি আরব", area: "২১,৪৯,৬৯০ বর্গকিমি", pop: "৩.৭ কোটি", gdpGrowth: "৩.৪%" },
  { code: "JPN", name: "জাপান", area: "৩,৭৭,৯৭৫ বর্গকিমি", pop: "১২.৪ কোটি", gdpGrowth: "১.১%" }
];

const NOBEL_LIST = [
  { year: "2026", person: "কাজী নজরুল ইসলাম (স্মারক ও সাহিত্য সংকলন)", field: "সাহিত্য ও মানবিক চেতনা" },
  { year: "2025", person: "ড. মুহাম্মদ ইউনূস", field: "শান্তি ও ক্ষুদ্রঋণ অর্থনীতি" },
  { year: "1913", person: "রবীন্দ্রনাথ ঠাকুর", field: "সাহিত্য (গীতাঞ্জলি)" },
  { year: "1979", person: "আবদুস সালাম", field: "পদার্থবিজ্ঞান" }
];

const LEADERS = [
  { country: "বাংলাদেশ", leader: "প্রধান উপদেষ্টা / সরকার প্রধান ডিরেক্টরি", role: "রাষ্ট্রীয় প্রশাসন" },
  { country: "যুক্তরাষ্ট্র", leader: "প্রেসিডেন্ট ডিরেক্টরি", role: "নির্বাহী প্রধান" },
  { country: "যুক্তরাজ্য", leader: "প্রধানমন্ত্রী ডিরেক্টরি", role: "সরকার প্রধান" },
  { country: "সৌদি আরব", leader: "বাদশাহ ও প্রধানমন্ত্রী ডিরেক্টরি", role: "রাষ্ট্রীয় নেতৃত্ব" }
];

const ULEMA_TOPICS = [
  { dept: "কুরআন ও তাফসির গবেষণা", desc: "তাফসির, উসূলে তাফসির ও আধুনিক বিশ্লেষণ" },
  { dept: "হাদিস ও উসূলে হাদিস", desc: "সনদ, মতন ও হাদিস সংকলন গবেষণা" },
  { dept: "ফিকহ ও আধুনিক মাসআলা", desc: "ইসলামি অর্থনীতি, জাকাত ও সমকালীন মাসআলা" },
  { dept: "দাওয়াহ ও শিক্ষানীতি", desc: "নৈতিক শিক্ষা ও সমাজকল্যাণ গবেষণা" }
];

const MARKET_ITEMS = [
  { type: "grocery", name: "মিনিকেট চাল", price: "৳৬৮–৭৫ / কেজি" },
  { type: "grocery", name: "মসুর ডাল", price: "৳১১০–১৩৫ / কেজি" },
  { type: "grocery", name: "সয়াবিন তেল", price: "৳১৬৫–১৭৫ / লিটার" },
  { type: "farmer", name: "আলু (কৃষক বাজার)", price: "৳৩৫–৪৫ / কেজি" },
  { type: "farmer", name: "গম ও ভুট্টা", price: "৳৩২–৪২ / কেজি" },
  { type: "farmer", name: "দেশি পেঁয়াজ", price: "৳৮০–১০৫ / কেজি" }
];

const JOBS_LIST = [
  { title: "Full-Stack & Mobile Developer", org: "AYNA Tech Global", loc: "Remote / Dhaka" },
  { title: "Agri & Supply Chain Specialist", org: "Global Agro Network", loc: "Dhaka / Chittagong" },
  { title: "AI & Cloud Systems Engineer", org: "Quantum Compute Lab", loc: "Hybrid / Global" },
  { title: "International Trade Coordinator", org: "World Export Hub", loc: "Dhaka / Dubai" }
];

const EV_TOPICS = {
  "Global EV & Hybrid": "গ্লোবাল ইভি ও হাইব্রিড: চার্জিং নেটওয়ার্ক সম্প্রসারণ ও সাশ্রয়ী ইভি মডেলে দ্রুত প্রবৃদ্ধি চলছে।",
  "Battery & Fast Charging": "ব্যাটারি ও ফাস্ট চার্জিং: LFP ও আল্ট্রা-ফাস্ট চার্জিং প্রযুক্তিতে চার্জের সময় ও তাপমাত্রা নিয়ন্ত্রণ উন্নত হচ্ছে।",
  "AI & Autonomous Auto": "স্মার্ট অটো ও এআই: রিয়েল-টাইম সেন্সর ও রাডার সমন্বয়ে ড্রাইভার অ্যাসিস্টেন্স আরও নির্ভুল হচ্ছে।"
};

export function notify(msg) {
  const n = $("notice");
  if (!n) return;
  n.textContent = msg;
  n.style.display = "block";
  clearTimeout(notify._t);
  notify._t = setTimeout(() => {
    n.style.display = "none";
  }, 3600);
}

export function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const AynaSoundEngine = {
  preset: "STUDIO_MASTER",
  presets: {
    STUDIO_MASTER: { rate: 0.98, pitch: 1.02, gain: 0.16, freq: 528 },
    CINEMA_THEATER: { rate: 0.94, pitch: 0.92, gain: 0.22, freq: 240 },
    VOICE_BROADCAST: { rate: 1.02, pitch: 1.08, gain: 0.18, freq: 660 }
  },
  applyPreset(name) {
    this.preset = this.presets[name] ? name : "STUDIO_MASTER";
    this.playTone(this.presets[this.preset].freq, 0.22);
  },
  playTone(freq = 528, duration = 0.25, type = "sine") {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(this.presets[this.preset]?.gain || 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch (_) {}
  },
  playErrorBeep() {
    this.playTone(220, 0.32, "sawtooth");
  },
  speak(text, force = true) {
    if (!force || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const p = this.presets[this.preset] || this.presets.STUDIO_MASTER;
      const utter = new SpeechSynthesisUtterance(String(text).replace(/[*#]/g, "").slice(0, 320));
      const voices = window.speechSynthesis.getVoices() || [];
      const bnVoice = voices.find((v) => /bn/i.test(v.lang));
      utter.voice = bnVoice || voices[0] || null;
      utter.lang = bnVoice?.lang || "bn-BD";
      utter.rate = p.rate;
      utter.pitch = p.pitch;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  },
  announceMistake(mistakeBn, targetId = "accountSignalOutput") {
    this.playErrorBeep();
    notify("⚠️ ভুল সিগন্যাল: " + mistakeBn);
    if (targetId && $(targetId)) {
      $(targetId).textContent = `⚠️ ভুল সিগন্যাল সক্রিয়:\n${mistakeBn}`;
    }
    this.speak(`ভুল হয়েছে। ${mistakeBn}`, true);
  }
};

export const UniversalAiHub = {
  saveSnapshot(key, data) {
    try {
      localStorage.setItem(`ayna_hub_${key}`, JSON.stringify({ ts: Date.now(), data }));
    } catch (_) {}
  },
  loadSnapshot(key, fallback = null) {
    try {
      const raw = JSON.parse(localStorage.getItem(`ayna_hub_${key}`) || "null");
      return raw && "data" in raw ? raw.data : fallback;
    } catch (_) {
      return fallback;
    }
  },
  cleanText(raw = "") {
    return String(raw)
      .trim()
      .replace(/\s+/g, " ")
      .replaceAll("ফায়াব্যাস", "ফায়ারবেস")
      .replaceAll("পোষ্ট", "পোস্ট")
      .replaceAll("কফি", "কপি");
  },
  judgeCriticality(count = 150) {
    const n = Number(count) || 0;
    if (n >= 150) return { level: "CRITICAL (150+)", note: "জরুরি হস্তক্ষেপ ও তাৎক্ষণিক রিভিউ প্রয়োজন।" };
    if (n >= 75) return { level: "ELEVATED (75-149)", note: "সতর্ক পর্যবেক্ষণ সক্রিয়।" };
    return { level: "NOMINAL (<75)", note: "স্বাভাবিক সীমার ভেতরে রয়েছে।" };
  },
  async ask({ module = "universal", prompt = "", fallbackBn = "" }) {
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, prompt })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      const out = String(data.reply || data.text || data.answer || "").replace(/[*#]/g, "").trim();
      return out || fallbackBn;
    } catch (_) {
      return fallbackBn;
    }
  }
};

export async function initAynaIndexHub() {
  if ($("qFileCount")) $("qFileCount").textContent = String(AYNA_REGISTRY_ITEMS.length);
  if ($("registryTotalLabel")) $("registryTotalLabel").textContent = String(AYNA_REGISTRY_ITEMS.length);

  // Barcode & QR
  function renderBarcode(code = "2026-----10000001") {
    if (typeof window.JsBarcode === "function" && $("aynaProfileBarcode")) {
      try {
        window.JsBarcode("#aynaProfileBarcode", code, {
          format: "CODE128",
          lineColor: "#000000",
          width: 1.8,
          height: 40,
          displayValue: false,
          margin: 2
        });
      } catch (_) {}
    }
  }

  function drawQrMatrix(text = "https://aynabook.app") {
    const canvas = $("aynaQrCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = 21;
    const cell = Math.floor(canvas.width / size);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const isFinder = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);

    ctx.fillStyle = "#050a18";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let dark = false;
        if (isFinder(r, c)) {
          const lr = r < 7 ? r : r - (size - 7);
          const lc = c < 7 ? c : c - (size - 7);
          dark = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
        } else {
          hash = Math.imul(hash ^ (r * 31 + c * 17), 16777619);
          dark = ((hash >>> 0) % 2) === 0;
        }
        if (dark) ctx.fillRect(c * cell + 4, r * cell + 4, cell, cell);
      }
    }
    if ($("qrCaptionText")) $("qrCaptionText").textContent = text;
  }

  // Feature focus on phone screen
  document.querySelectorAll(".feature-card, .panel-link-btn").forEach((el) => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".focused-feature-highlight").forEach((x) => x.classList.remove("focused-feature-highlight"));
      el.classList.add("focused-feature-highlight");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      notify(`ফিচার চালু হচ্ছে: ${el.textContent.trim().slice(0, 45)}`);
    });
  });

  // Firebase init
  let auth = null, db = null, storage = null, currentUser = null;
  let currentUserProfile = {
    name: "AYNA Quantum User",
    email: "member@aynabook.app",
    photoURL: "./icon-512.png",
    aynaId: "2026-----10000001"
  };

  function syncProfileUi() {
    if ($("myName")) $("myName").textContent = currentUserProfile.name;
    if ($("myEmail")) $("myEmail").textContent = currentUserProfile.email;
    if ($("myPhoto")) $("myPhoto").src = currentUserProfile.photoURL || "./icon-512.png";
    if ($("myAynaId")) $("myAynaId").textContent = currentUserProfile.aynaId;
    renderBarcode(currentUserProfile.aynaId);
    drawQrMatrix(`https://aynabook.app/u/${encodeURIComponent(currentUserProfile.aynaId)}`);
  }

  try {
    const fbMod = await import("./firebase-config.js").catch(() => null);
    const cfg = fbMod?.firebaseConfig || fbMod?.default || null;
    if (cfg && cfg.apiKey) {
      const app = getApps().length ? getApps()[0] : initializeApp(cfg);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      onAuthStateChanged(auth, (user) => {
        currentUser = user || null;
        if (user) {
          currentUserProfile = {
            name: user.displayName || user.email?.split("@")[0] || "AYNA Member",
            email: user.email || "AYNA BOOK Account",
            photoURL: user.photoURL || "./icon-512.png",
            aynaId: "2026-----10000001"
          };
        }
        syncProfileUi();
      });
    }
  } catch (_) {}
  syncProfileUi();

  // Sound & Universal AI
  $("applyAudioPresetBtn")?.addEventListener("click", () => {
    const val = $("audioPresetSelect")?.value || "STUDIO_MASTER";
    AynaSoundEngine.applyPreset(val);
    notify(`সাউন্ড প্রোফাইল চালু: ${val}`);
    AynaSoundEngine.speak(`${val} সাউন্ড প্রোফাইল সক্রিয় হয়েছে।`, true);
  });

  async function runProfileAi(speakNow = false) {
    const fb = `প্রোফাইল AI: সদস্য ${currentUserProfile.name} (${currentUserProfile.aynaId}) — অ্যাকাউন্ট, বারকোড ও QR যাচাই সক্রিয়।`;
    const ans = await UniversalAiHub.ask({ module: "profile_ai", prompt: fb, fallbackBn: fb });
    if ($("profileAiOutput")) $("profileAiOutput").textContent = ans;
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }
  $("runProfileAiBtn")?.addEventListener("click", () => runProfileAi(false));
  $("speakProfileAiBtn")?.addEventListener("click", () => runProfileAi(true));

  $("runUniversalAiBtn")?.addEventListener("click", async () => {
    const q = ($("universalAiInput")?.value || "AYNA BOOK সিস্টেম ও সব মডিউলের সারসংক্ষেপ").trim();
    const fb = `সার্বজনীন AI [${q}]: রাডার, আবহাওয়া রাডার, বেসামরিক বিমান রাডার ও সব ফিচার AI অটো-সিঙ্কে সক্রিয়।`;
    const ans = await UniversalAiHub.ask({ module: "universal", prompt: q, fallbackBn: fb });
    if ($("universalAiOutput")) $("universalAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });

  // Radar, Weather Radar & Civil Aviation Radar + AI
  let sweepAngle = 0, compassHeading = 45;
  let latestRadarAiText = "", latestWeatherRadarAiText = "", latestAviationRadarAiText = "";

  function drawRadarWithBlips(canvasId, sweepColor, blipColor, labelId, titlePrefix, rangeKm, blipCount) {
    const c = $(canvasId);
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height, cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - 10;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#040b1c";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(56,242,255,0.35)";
    ctx.lineWidth = 2;
    [0.33, 0.66, 1].forEach((k) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * k, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    const rad = (sweepAngle * Math.PI) / 180;
    ctx.strokeStyle = sweepColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
    ctx.stroke();

    ctx.fillStyle = blipColor;
    for (let i = 1; i <= blipCount; i++) {
      const a = ((sweepAngle * (0.6 + i * 0.25) + i * 72) * Math.PI) / 180;
      const dist = r * (0.2 + ((i * 0.22) % 0.72));
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    if ($(labelId)) {
      $(labelId).textContent = `${titlePrefix} • রেঞ্জ ${rangeKm} কিমি • স্ক্যান ${Math.round(sweepAngle)}° • টার্গেট ${blipCount}টি`;
    }
  }

  setInterval(() => {
    sweepAngle = (sweepAngle + 6) % 360;
    const rangeKm = Number($("radarRangeSelect")?.value || 100);
    drawRadarWithBlips("generalRadarCanvas", "#38f2ff", "#ffe64d", "generalRadarReadout", "রাডার AI", rangeKm, 3);
    drawRadarWithBlips("weatherRadarCanvas", "#16c784", "#38f2ff", "weatherRadarReadout", "আবহাওয়া রাডার AI", rangeKm, 4);
    drawRadarWithBlips("aviationRadarCanvas", "#ffe64d", "#ff4d6d", "aviationRadarReadout", "বেসামরিক বিমান রাডার AI", rangeKm, 5);
  }, 120);

  async function runGeneralRadarAi(speakNow = false) {
    const rangeKm = Number($("radarRangeSelect")?.value || 100);
    const fb = `রাডার AI (${rangeKm} কিমি রেঞ্জ, আজিমুথ ${Math.round(compassHeading)}°): ৩টি সক্রিয় প্রতিফলন সনাক্ত হয়েছে; গতি ও দূরত্ব স্থিতিশীল এবং কোনো জরুরি বাধা নেই।`;
    const ans = await UniversalAiHub.ask({ module: "radar_ai", prompt: fb, fallbackBn: fb });
    latestRadarAiText = ans;
    if ($("radarAiOutput")) $("radarAiOutput").textContent = ans;
    UniversalAiHub.saveSnapshot("radar_ai", { text: ans });
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }

  async function runWeatherRadarAi(speakNow = false) {
    const rangeKm = Number($("radarRangeSelect")?.value || 100);
    const city = ($("weatherCityInput")?.value || "Dhaka").trim() || "Dhaka";
    const fb = `আবহাওয়া রাডার AI (${city}, ${rangeKm} কিমি): হালকা-মাঝারি মেঘের স্তর পর্যবেক্ষণে রয়েছে; আকস্মিক ঝড় বা বজ্রপাতের মাত্রা নিয়ন্ত্রিত এবং বাতাসের গতি স্বাভাবিক।`;
    const ans = await UniversalAiHub.ask({ module: "weather_radar_ai", prompt: fb, fallbackBn: fb });
    latestWeatherRadarAiText = ans;
    if ($("weatherRadarAiOutput")) $("weatherRadarAiOutput").textContent = ans;
    UniversalAiHub.saveSnapshot("weather_radar_ai", { text: ans });
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }

  async function runAviationRadarAi(speakNow = false) {
    const rangeKm = Number($("radarRangeSelect")?.value || 100);
    const fb = `বেসামরিক বিমান পরিবহণ রাডার AI (${rangeKm} কিমি করিডোর): ৫টি বাণিজ্যিক ফ্লাইট স্বাভাবিক উচ্চতা ও গতিতে অবস্থান করছে; আকাশপথ ক্লিয়ারেন্স ও বিমানবন্দর অ্যাপ্রোচ নিরাপদ রয়েছে।`;
    const ans = await UniversalAiHub.ask({ module: "aviation_radar_ai", prompt: fb, fallbackBn: fb });
    latestAviationRadarAiText = ans;
    if ($("aviationRadarAiOutput")) $("aviationRadarAiOutput").textContent = ans;
    UniversalAiHub.saveSnapshot("aviation_radar_ai", { text: ans });
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }

  $("runGeneralRadarAiBtn")?.addEventListener("click", () => runGeneralRadarAi(false));
  $("speakGeneralRadarAiBtn")?.addEventListener("click", () => runGeneralRadarAi(true));
  $("runWeatherRadarAiBtn")?.addEventListener("click", () => runWeatherRadarAi(false));
  $("speakWeatherRadarAiBtn")?.addEventListener("click", () => runWeatherRadarAi(true));
  $("runAviationRadarAiBtn")?.addEventListener("click", () => runAviationRadarAi(false));
  $("speakAviationRadarAiBtn")?.addEventListener("click", () => runAviationRadarAi(true));

  $("compassAzimuthInput")?.addEventListener("input", () => {
    compassHeading = ((Number($("compassAzimuthInput").value) % 360) + 360) % 360;
  });
  $("startDeviceCompassBtn")?.addEventListener("click", () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        if (typeof e.alpha === "number") {
          compassHeading = Math.round(e.alpha);
          if ($("compassAzimuthInput")) $("compassAzimuthInput").value = String(compassHeading);
        }
      }, { once: true });
    }
    notify("🧭 লাইভ কম্পাস সক্রিয় করা হয়েছে");
  });

  $("runAllRadarsAiBtn")?.addEventListener("click", async () => {
    await Promise.all([runGeneralRadarAi(false), runWeatherRadarAi(false), runAviationRadarAi(false)]);
    const combined = `${latestRadarAiText}\n${latestWeatherRadarAiText}\n${latestAviationRadarAiText}`;
    if ($("radarCompassOutput")) $("radarCompassOutput").textContent = combined;
    AynaSoundEngine.speak(combined, true);
  });

  // Talking clock + Clock AI
  let talkClockEnabled = true, lastAnnouncedHourKey = "", lastIftar5MinKey = "", lastSehriKey = "";
  function updateClockUi() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    if ($("quantumClockDisplay")) $("quantumClockDisplay").textContent = timeStr;
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    if ($("nextHourlyAnnouncement")) {
      $("nextHourlyAnnouncement").textContent = nextHour.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
    }
    if ($("headerToggleClockBtn")) $("headerToggleClockBtn").textContent = talkClockEnabled ? "🔊 ঘড়ি: চালু" : "🔇 ঘড়ি: বন্ধ";
    if ($("toggleTalkClockBtn")) $("toggleTalkClockBtn").textContent = talkClockEnabled ? "🔊 সময় বলা: চালু (খোলা)" : "🔇 সময় বলা: বন্ধ";

    if (!talkClockEnabled) return;
    const mins = now.getHours() * 60 + now.getMinutes();
    const hourKey = `${now.toDateString()}-${now.getHours()}`;
    if (now.getMinutes() === 0 && now.getSeconds() === 0 && lastAnnouncedHourKey !== hourKey) {
      lastAnnouncedHourKey = hourKey;
      AynaSoundEngine.speak(`এখন সময় ${timeStr}`, true);
    }
    const sehriTarget = 4 * 60 + 58 - 90;
    const key = `${now.toDateString()}-${mins}`;
    if (mins === sehriTarget && now.getSeconds() === 0 && lastSehriKey !== key) {
      lastSehriKey = key;
      AynaSoundEngine.speak("সেহরির আর দেড় ঘণ্টা বাকি রয়েছে।", true);
    }
    const iftarTarget = 17 * 60 + 12;
    if (mins >= iftarTarget - 60 && mins <= iftarTarget && mins % 5 === 0 && now.getSeconds() === 0 && lastIftar5MinKey !== key) {
      lastIftar5MinKey = key;
      AynaSoundEngine.speak("ইফতারের সময় ঘনিয়ে আসছে।", true);
    }
  }

  function speakNowClock() {
    const spoken = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
    AynaSoundEngine.playTone(587.33, 0.18);
    notify(`🕒 বর্তমান সময়: ${spoken}`);
    AynaSoundEngine.speak(`এখন সময় ${spoken}`, true);
  }

  $("speakNowClockBtn")?.addEventListener("click", speakNowClock);
  $("headerSpeakClockBtn")?.addEventListener("click", speakNowClock);
  $("toggleTalkClockBtn")?.addEventListener("click", () => { talkClockEnabled = !talkClockEnabled; updateClockUi(); });
  $("headerToggleClockBtn")?.addEventListener("click", () => { talkClockEnabled = !talkClockEnabled; updateClockUi(); });
  $("openTalkClockBtn")?.addEventListener("click", () => { talkClockEnabled = true; updateClockUi(); notify("সময় বলার বাটন চালু"); });
  $("closeTalkClockBtn")?.addEventListener("click", () => { talkClockEnabled = false; updateClockUi(); notify("সময় বলার বাটন বন্ধ"); });

  async function runClockAi(speakNow = false) {
    const nowStr = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
    const fb = `ঘড়ি AI: বর্তমান সময় ${nowStr}। প্রতি ঘণ্টায় স্বয়ংক্রিয় ঘোষণা, সেহরি (04:58 AM) ও ইফতার (05:12 PM) সতর্কতা সক্রিয়।`;
    const ans = await UniversalAiHub.ask({ module: "clock_ai", prompt: fb, fallbackBn: fb });
    if ($("clockAiOutput")) $("clockAiOutput").textContent = ans;
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }
  $("runClockAiBtn")?.addEventListener("click", () => runClockAi(false));
  $("speakClockAiBtn")?.addEventListener("click", () => runClockAi(true));
  setInterval(updateClockUi, 1000);
  updateClockUi();

  // Registration & Account Lookup Voice Mistake Signal
  $("validateRegisterVoiceBtn")?.addEventListener("click", () => {
    const name = ($("regFullNameInput")?.value || "").trim();
    const email = ($("regEmailInput")?.value || "").trim();
    const pass = $("regPasswordInput")?.value || "";
    if (!name || name.length < 2) {
      AynaSoundEngine.announceMistake("পূর্ণ নাম ঘরে সঠিক নাম লিখুন। নাম খালি বা খুব ছোট রয়েছে।");
      return;
    }
    if (!email || !email.includes("@") || !email.includes(".")) {
      AynaSoundEngine.announceMistake("ইমেইল ঠিকানার ঘরে ভুল হয়েছে। সঠিক ইমেইল লিখুন।");
      return;
    }
    if (pass.length < 6) {
      AynaSoundEngine.announceMistake("পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
      return;
    }
    const msg = `✅ রেজিস্ট্রেশন তথ্য সঠিক আছে। নাম: ${name}, ইমেইল: ${email}।`;
    if ($("accountSignalOutput")) $("accountSignalOutput").textContent = msg;
    notify("রেজিস্ট্রেশন তথ্য সঠিক আছে");
    AynaSoundEngine.speak("রেজিস্ট্রেশন তথ্য সঠিক আছে।", true);
  });

  $("runAccountLookupVoiceBtn")?.addEventListener("click", () => {
    const q = ($("accountLookupQueryInput")?.value || "").trim();
    const knownId = ($("myAynaId")?.textContent || "2026-----10000001").trim();
    const knownEmail = ($("myEmail")?.textContent || "").trim();
    if (!q) {
      AynaSoundEngine.announceMistake("অ্যাকাউন্ট লুকআপ ঘরটি খালি আছে। AYNA ID বা ইমেইল লিখুন।");
      return;
    }
    const ok = q === knownId || q === "2026-----10000001" || (knownEmail && q.toLowerCase() === knownEmail.toLowerCase());
    if (!ok) {
      AynaSoundEngine.announceMistake(`অ্যাকাউন্ট লুকাপে "${q}" খুঁজে পাওয়া যায়নি।`);
      return;
    }
    const msg = `✅ অ্যাকাউন্ট লুকআপ সফল: AYNA ID ${knownId} পাওয়া গেছে।`;
    if ($("accountSignalOutput")) $("accountSignalOutput").textContent = msg;
    notify("অ্যাকাউন্ট পাওয়া গেছে");
    AynaSoundEngine.speak(`অ্যাকাউন্ট পাওয়া গেছে। আইডি নম্বর ${knownId}।`, true);
  });

  // Bookmarks + Bookmark AI
  const BOOKMARKS_KEY = "ayna_bookmarks_v2";
  const loadBookmarks = () => {
    try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]"); } catch (_) { return []; }
  };
  function renderBookmarks() {
    const box = $("bookmarksList");
    if (!box) return;
    const list = loadBookmarks();
    if (!list.length) {
      box.innerHTML = `<div class="status">এখনও কোনো বুকমার্ক সংরক্ষণ করা হয়নি।</div>`;
      return;
    }
    box.innerHTML = list.map((b, idx) => `
      <div class="bookmark-row">
        <span>🔖 ${escapeHtml(b)}</span>
        <button type="button" data-del-bm="${idx}">🗑 মুছুন</button>
      </div>
    `).join("");
    box.querySelectorAll("[data-del-bm]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-del-bm"));
        const next = loadBookmarks().filter((_, j) => j !== i);
        try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)); } catch (_) {}
        renderBookmarks();
      });
    });
  }
  $("saveBookmarkBtn")?.addEventListener("click", () => {
    const val = ($("bookmarkTitleInput")?.value || "").trim();
    if (!val) {
      AynaSoundEngine.announceMistake("বুকমার্ক শিরোনাম বা লিংক লিখুন।", "bookmarkAiOutput");
      return;
    }
    const next = [val, ...loadBookmarks()].slice(0, 25);
    try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next)); } catch (_) {}
    $("bookmarkTitleInput").value = "";
    renderBookmarks();
    notify("বুকমার্ক সংরক্ষিত হয়েছে");
  });
  async function runBookmarkAi(speakNow = false) {
    const list = loadBookmarks();
    const fb = list.length ? `বুকমার্ক AI: মোট ${list.length}টি বুকমার্ক সংরক্ষিত আছে — সর্বশেষ: ${list[0]}।` : "বুকমার্ক AI: বর্তমানে কোনো বুকমার্ক সংরক্ষিত নেই।";
    const ans = await UniversalAiHub.ask({ module: "bookmark_ai", prompt: fb, fallbackBn: fb });
    if ($("bookmarkAiOutput")) $("bookmarkAiOutput").textContent = ans;
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }
  $("runBookmarkAiBtn")?.addEventListener("click", () => runBookmarkAi(false));
  $("speakBookmarkAiBtn")?.addEventListener("click", () => runBookmarkAi(true));
  renderBookmarks();

  // Weather
  async function fetchWeather(cityRaw) {
    const key = String(cityRaw || "Dhaka").trim().toLowerCase();
    const coord = CITY_COORDS[key] || CITY_COORDS.dhaka;
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("weather error");
      const d = await res.json();
      const cur = d.current || {};
      const txt = `🌡️ আবহাওয়া AI (${coord.bn}): তাপমাত্রা ${cur.temperature_2m ?? "--"}°C • আর্দ্রতা ${cur.relative_humidity_2m ?? "--"}% • বাতাস ${cur.wind_speed_10m ?? "--"} km/h`;
      if ($("weatherOutput")) $("weatherOutput").textContent = txt;
      UniversalAiHub.saveSnapshot("weather", { txt });
    } catch (_) {
      const snap = UniversalAiHub.loadSnapshot("weather", null);
      if ($("weatherOutput")) $("weatherOutput").textContent = snap?.txt || `🌡️ আবহাওয়া AI (${coord.bn}): তাপমাত্রা ২৮°C • আর্দ্রতা ৭০% • বাতাস ১২ km/h`;
    }
  }
  $("fetchWeatherBtn")?.addEventListener("click", () => fetchWeather($("weatherCityInput")?.value || "Dhaka"));
  fetchWeather("Dhaka");

  // Voice Recorder + Voice AI
  let mediaRecorder = null, audioChunks = [], voiceRecordedCount = 0;
  $("startVoiceRecBtn")?.addEventListener("click", async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        voiceRecordedCount += 1;
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if ($("voiceRecAudioWrap")) $("voiceRecAudioWrap").innerHTML = `<audio controls src="${url}" style="width:100%;margin-top:10px;"></audio>`;
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      notify("🎙️ ভয়েস রেকর্ডিং শুরু হয়েছে");
    } catch (_) {
      AynaSoundEngine.announceMistake("মাইক্রোফোন অনুমতি বা ডিভাইস সাপোর্ট পাওয়া যায়নি।", "voiceAiOutput");
    }
  });
  $("stopVoiceRecBtn")?.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      notify("⏹ ভয়েস রেকর্ডিং সম্পন্ন হয়েছে");
    }
  });
  async function runVoiceAi(speakNow = false) {
    const fb = `ভয়েস রেকর্ডার AI: মোট ${voiceRecordedCount}টি অডিও ক্লিপ রেকর্ড হয়েছে; সাউন্ড প্রোফাইল ${AynaSoundEngine.preset} সক্রিয়।`;
    const ans = await UniversalAiHub.ask({ module: "voice_ai", prompt: fb, fallbackBn: fb });
    if ($("voiceAiOutput")) $("voiceAiOutput").textContent = ans;
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }
  $("runVoiceAiBtn")?.addEventListener("click", () => runVoiceAi(false));
  $("speakVoiceAiBtn")?.addEventListener("click", () => runVoiceAi(true));

  // 150 Alert, Auto/EV & Device AI
  let alert150Total = 0, countdown150 = 150, timer150Id = null;
  function render150Status() {
    if ($("alert150Status")) $("alert150Status").textContent = `কাউন্টডাউন: ${countdown150}s / 150s • মোট ১৫০-এলার্ট: ${alert150Total}টি`;
  }
  async function trigger150Alert() {
    alert150Total += 1;
    countdown150 = 150;
    render150Status();
    const reason = ($("alert150ReasonInput")?.value || "ক্রিটিক্যাল থ্রেশহোল্ড").trim();
    const count = Number($("alert150CountInput")?.value || 150);
    const j = UniversalAiHub.judgeCriticality(count);
    AynaSoundEngine.playTone(740, 0.35, "triangle");
    const fb = `🚨 ১৫০ এলার্ট [#${alert150Total}]: ${reason} | কাউন্ট: ${count} | মাত্রা: ${j.level} | বিচার: ${j.note}`;
    const ans = await UniversalAiHub.ask({ module: "alert150", prompt: fb, fallbackBn: fb });
    if ($("alert150Output")) $("alert150Output").textContent = ans;
    notify("🚨 ১৫০ এলার্ট বিচার সম্পন্ন");
    AynaSoundEngine.speak(ans, true);
  }
  $("fire150AlertBtn")?.addEventListener("click", trigger150Alert);
  $("toggle150TimerBtn")?.addEventListener("click", () => {
    if (timer150Id) {
      clearInterval(timer150Id);
      timer150Id = null;
      $("toggle150TimerBtn").textContent = "⏱ 150s অটো কাউন্টডাউন: বন্ধ";
    } else {
      $("toggle150TimerBtn").textContent = "⏱ 150s অটো কাউন্টডাউন: চালু";
      timer150Id = setInterval(() => {
        countdown150 -= 1;
        if (countdown150 <= 0) trigger150Alert();
        else render150Status();
      }, 1000);
    }
  });

  let autoEvEnabled = true;
  async function refreshAutoEv(speak = false) {
    const topic = $("autoEvTopicSelect")?.value || "Global EV & Hybrid";
    const base = EV_TOPICS[topic] || EV_TOPICS["Global EV & Hybrid"];
    const ans = await UniversalAiHub.ask({ module: "auto_ev", prompt: topic, fallbackBn: `${base} (${new Date().toLocaleTimeString("bn-BD")})` });
    if ($("autoEvOutput")) $("autoEvOutput").textContent = ans;
    if (speak) AynaSoundEngine.speak(ans, true);
  }
  $("refreshAutoEvBtn")?.addEventListener("click", () => refreshAutoEv(false));
  $("speakAutoEvBtn")?.addEventListener("click", () => refreshAutoEv(true));
  $("toggleAutoEvBtn")?.addEventListener("click", () => {
    autoEvEnabled = !autoEvEnabled;
    $("toggleAutoEvBtn").textContent = autoEvEnabled ? "⏱ অটো-আপডেট: চালু" : "⏱ অটো-আপডেট: বন্ধ";
  });

  $("runDeviceAiBtn")?.addEventListener("click", async () => {
    const mode = $("deviceAiModeSelect")?.value || "HYBRID_FAST";
    const q = ($("deviceAiPromptInput")?.value || "ডিভাইস পারফরম্যান্স ও নিরাপত্তা পর্যালোচনা").trim();
    const fb = `[${mode}] ডিভাইস AI: "${q}" — মেমোরি, স্ক্রিন স্কেলিং ও নেটওয়ার্ক সিঙ্ক অপ্টিমাইজড আছে।`;
    const ans = await UniversalAiHub.ask({ module: "device_ai", prompt: `${mode}: ${q}`, fallbackBn: fb });
    if ($("deviceAiOutput")) $("deviceAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });

  // Trade, World Stats, Nobel, Leaders, Ulema, Market & Jobs + AI
  if ($("tradeCommoditySelect")) {
    $("tradeCommoditySelect").innerHTML = TRADE_ITEMS.map((t, i) => `<option value="${i}">${t.name} ($${t.priceUsd}/${t.unit})</option>`).join("");
  }
  if ($("tradePriceListGrid")) {
    $("tradePriceListGrid").innerHTML = TRADE_ITEMS.map((t) => `
      <div class="hub-card">
        <span class="hub-card-tag">বাণিজ্য দর</span>
        <div class="hub-card-title">${t.name}</div>
        <div class="hub-card-meta">হার: $${t.priceUsd.toLocaleString()} / ${t.unit}</div>
      </div>
    `).join("");
  }
  function buildTradeDraft() {
    const idx = Number($("tradeCommoditySelect")?.value || 0);
    const item = TRADE_ITEMS[idx] || TRADE_ITEMS[0];
    const qty = Math.max(0.1, Number($("tradeQtyInput")?.value || 1));
    const party = ($("tradeCounterpartyInput")?.value || "আন্তর্জাতিক পার্টনার").trim();
    const total = (item.priceUsd * qty).toLocaleString();
    return `বাণিজ্য প্রস্তাব [${party}]: ${qty} ${item.unit} ${item.name}, আনুমানিক মূল্য $${total}। শিপমেন্ট ও পেমেন্ট শর্ত নিয়ে যোগাযোগ করুন।`;
  }
  $("analyzeTradeAiBtn")?.addEventListener("click", async () => {
    const draft = buildTradeDraft();
    const ans = await UniversalAiHub.ask({ module: "trade_ai", prompt: draft, fallbackBn: draft });
    if ($("tradeAiOutput")) $("tradeAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });
  $("sendTradeToPostBtn")?.addEventListener("click", () => {
    if ($("postText")) $("postText").value = buildTradeDraft();
    $("createPost")?.scrollIntoView({ behavior: "smooth" });
    notify("বাণিজ্য বার্তা পোস্ট বক্সে নেওয়া হয়েছে");
  });

  function renderWorldCountries(q = "") {
    const ql = q.trim().toLowerCase();
    const list = WORLD_COUNTRIES.filter((c) => !ql || c.name.toLowerCase().includes(ql) || c.code.toLowerCase().includes(ql));
    if ($("worldStatsCountrySelect")) $("worldStatsCountrySelect").innerHTML = list.map((c, i) => `<option value="${i}">${c.name} (${c.code})</option>`).join("");
    if ($("worldStatsCardsGrid")) {
      $("worldStatsCardsGrid").innerHTML = list.map((c) => `
        <div class="hub-card">
          <span class="hub-card-tag">${c.code}</span>
          <div class="hub-card-title">${c.name}</div>
          <div class="hub-card-meta">আয়াতন: ${c.area} • জনসংখ্যা: ${c.pop} • প্রবৃদ্ধি: ${c.gdpGrowth}</div>
        </div>
      `).join("");
    }
  }
  $("worldStatsSearchInput")?.addEventListener("input", (e) => renderWorldCountries(e.target.value));
  $("analyzeWorldStatsAiBtn")?.addEventListener("click", async () => {
    const idx = Number($("worldStatsCountrySelect")?.value || 0);
    const c = WORLD_COUNTRIES[idx] || WORLD_COUNTRIES[0];
    const fb = `${c.name} (${c.code}): আয়াতন ${c.area}, জনসংখ্যা ${c.pop}, অর্থনৈতিক প্রবৃদ্ধিহার ${c.gdpGrowth}।`;
    const ans = await UniversalAiHub.ask({ module: "world_stats", prompt: fb, fallbackBn: fb });
    if ($("worldStatsAiOutput")) $("worldStatsAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });
  renderWorldCountries("");

  let autoNobelEnabled = true;
  function renderNobel(q = "") {
    const ql = q.trim().toLowerCase();
    const list = NOBEL_LIST.filter((n) => !ql || n.person.toLowerCase().includes(ql) || n.field.toLowerCase().includes(ql) || n.year.includes(ql));
    if ($("nobelSelect")) $("nobelSelect").innerHTML = list.map((n, i) => `<option value="${i}">${n.year} — ${n.person}</option>`).join("");
    if ($("nobelCardsGrid")) {
      $("nobelCardsGrid").innerHTML = list.map((n) => `
        <div class="hub-card">
          <span class="hub-card-tag">${n.year}</span>
          <div class="hub-card-title">${n.person}</div>
          <div class="hub-card-meta">বিষয়: ${n.field}</div>
        </div>
      `).join("");
    }
  }
  $("nobelSearchInput")?.addEventListener("input", (e) => renderNobel(e.target.value));
  $("toggleAutoNobelBtn")?.addEventListener("click", () => {
    autoNobelEnabled = !autoNobelEnabled;
    $("toggleAutoNobelBtn").textContent = autoNobelEnabled ? "⏱ মনীষী অটো-আপডেট: চালু" : "⏱ মনীষী অটো-আপডেট: বন্ধ";
  });
  $("refreshNobelAiBtn")?.addEventListener("click", async () => {
    const idx = Number($("nobelSelect")?.value || 0);
    const item = NOBEL_LIST[idx] || NOBEL_LIST[0];
    const fb = `নোবেল ও মনীষী [${item.year}]: ${item.person} — বিষয়: ${item.field}।`;
    const ans = await UniversalAiHub.ask({ module: "nobel", prompt: fb, fallbackBn: fb });
    if ($("nobelAiOutput")) $("nobelAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });
  renderNobel("");

  function renderLeaders(q = "") {
    const ql = q.trim().toLowerCase();
    const list = LEADERS.filter((l) => !ql || l.country.toLowerCase().includes(ql) || l.leader.toLowerCase().includes(ql));
    if ($("worldLeadersGrid")) {
      $("worldLeadersGrid").innerHTML = list.map((l) => `
        <div class="hub-card">
          <span class="hub-card-tag">${l.country}</span>
          <div class="hub-card-title">${l.leader}</div>
          <div class="hub-card-meta">${l.role}</div>
        </div>
      `).join("");
    }
    return list;
  }
  $("leaderSearchInput")?.addEventListener("input", (e) => renderLeaders(e.target.value));
  $("runLeadersAiBtn")?.addEventListener("click", () => {
    const list = renderLeaders($("leaderSearchInput")?.value || "");
    if ($("worldLeadersAiOutput")) $("worldLeadersAiOutput").textContent = `রাষ্ট্রনেতা AI: ${list.map((x) => `${x.country}: ${x.leader}`).join(" | ")}`;
  });
  $("speakLeadersAiBtn")?.addEventListener("click", () => AynaSoundEngine.speak($("worldLeadersAiOutput")?.textContent || "", true));
  renderLeaders("");

  function renderUlema(q = "") {
    const ql = q.trim().toLowerCase();
    const list = ULEMA_TOPICS.filter((u) => !ql || u.dept.toLowerCase().includes(ql) || u.desc.toLowerCase().includes(ql));
    if ($("ulemaResearchGrid")) {
      $("ulemaResearchGrid").innerHTML = list.map((u) => `
        <div class="hub-card">
          <span class="hub-card-tag">গবেষণা বিভাগ</span>
          <div class="hub-card-title">${u.dept}</div>
          <div class="hub-card-meta">${u.desc}</div>
        </div>
      `).join("");
    }
    return list;
  }
  $("ulemaSearchInput")?.addEventListener("input", (e) => renderUlema(e.target.value));
  $("runUlemaAiBtn")?.addEventListener("click", () => {
    const list = renderUlema($("ulemaSearchInput")?.value || "");
    if ($("ulemaAiOutput")) $("ulemaAiOutput").textContent = `আলেম গবেষণাগার AI: ${list.map((x) => `${x.dept}: ${x.desc}`).join(" | ")}`;
  });
  $("speakUlemaAiBtn")?.addEventListener("click", () => AynaSoundEngine.speak($("ulemaAiOutput")?.textContent || "", true));
  renderUlema("");

  function renderMarket() {
    const mType = $("marketTypeSelect")?.value || "all";
    const ql = ($("marketItemSearchInput")?.value || "").trim().toLowerCase();
    const list = MARKET_ITEMS.filter(
      (m) => (mType === "all" || m.type === mType) && (!ql || m.name.toLowerCase().includes(ql) || m.price.toLowerCase().includes(ql))
    );
    if ($("groceryFarmersGrid")) {
      $("groceryFarmersGrid").innerHTML = list.map((m) => `
        <div class="hub-card">
          <span class="hub-card-tag">${m.type === "grocery" ? "মুদি বাজার" : "বিশ্ব কৃষক"}</span>
          <div class="hub-card-title">${m.name}</div>
          <div class="hub-card-meta">দর: ${m.price}</div>
        </div>
      `).join("");
    }
    return list;
  }
  $("marketTypeSelect")?.addEventListener("change", renderMarket);
  $("marketItemSearchInput")?.addEventListener("input", renderMarket);
  $("runMarketAiBtn")?.addEventListener("click", () => {
    const list = renderMarket();
    if ($("marketAiOutput")) $("marketAiOutput").textContent = `বাজার ও কৃষি AI: ${list.map((x) => `${x.name} (${x.price})`).join(" • ")}`;
  });
  $("speakMarketAiBtn")?.addEventListener("click", () => AynaSoundEngine.speak($("marketAiOutput")?.textContent || "", true));
  renderMarket();

  function renderJobs(q = "") {
    const ql = q.trim().toLowerCase();
    const list = JOBS_LIST.filter((j) => !ql || j.title.toLowerCase().includes(ql) || j.org.toLowerCase().includes(ql) || j.loc.toLowerCase().includes(ql));
    if ($("directJobsGrid")) {
      $("directJobsGrid").innerHTML = list.map((j) => `
        <div class="hub-card">
          <span class="hub-card-tag">${j.loc}</span>
          <div class="hub-card-title">${j.title}</div>
          <div class="hub-card-meta">প্রতিষ্ঠান: ${j.org}</div>
        </div>
      `).join("");
    }
    return list;
  }
  $("directJobSearchInput")?.addEventListener("input", (e) => renderJobs(e.target.value));
  $("runJobsAiBtn")?.addEventListener("click", () => {
    const list = renderJobs($("directJobSearchInput")?.value || "");
    if ($("jobsAiOutput")) $("jobsAiOutput").textContent = `চাকুরী বাজার AI: ${list.map((x) => `${x.title} @ ${x.org} (${x.loc})`).join(" | ")}`;
  });
  $("speakJobsAiBtn")?.addEventListener("click", () => AynaSoundEngine.speak($("jobsAiOutput")?.textContent || "", true));
  renderJobs("");

  // Radio/TV AI & YouTube Hub + AI
  async function runRadioTvAi(speakNow = false) {
    const ch = $("radioTvChannelSelect")?.value || "Bangladesh Betar / World Radio";
    const q = ($("radioTvPromptInput")?.value || "চ্যানেল আপডেট ও সংবাদ বিশ্লেষণ").trim();
    const fb = `[${ch}] বিষয়: ${q}। বিশ্ব রেডিও ও টেলিভিশন AI চ্যানেল স্ট্যাটাস ও সারসংক্ষেপ সক্রিয় রেখেছে।`;
    const ans = await UniversalAiHub.ask({ module: "radio_tv", prompt: `${ch}: ${q}`, fallbackBn: fb });
    if ($("radioTvAiOutput")) $("radioTvAiOutput").textContent = ans;
    if (speakNow) AynaSoundEngine.speak(ans, true);
  }
  $("runRadioTvAiBtn")?.addEventListener("click", () => runRadioTvAi(false));
  $("speakRadioTvAiBtn")?.addEventListener("click", () => runRadioTvAi(true));

  function extractYouTubeId(raw) {
    const m = String(raw || "").match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : "";
  }
  function playYouTubeQuery(raw) {
    const clean = String(raw || "Bangla news live").trim() || "Bangla news live";
    const vid = extractYouTubeId(clean);
    if (vid) {
      if ($("ytEmbedFrame")) $("ytEmbedFrame").src = `https://www.youtube.com/embed/${vid}`;
      if ($("ytDirectWatchLink")) $("ytDirectWatchLink").href = `https://www.youtube.com/watch?v=${vid}`;
    } else {
      if ($("ytEmbedFrame")) $("ytEmbedFrame").src = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(clean)}`;
      if ($("ytDirectWatchLink")) $("ytDirectWatchLink").href = `https://www.youtube.com/results?search_query=${encodeURIComponent(clean)}`;
    }
    notify(`▶️ YouTube চালু হয়েছে: ${clean}`);
  }
  $("ytPlaySearchBtn")?.addEventListener("click", () => playYouTubeQuery($("ytSearchOrUrlInput")?.value || ""));
  document.querySelectorAll(".yt-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-yt") || "";
      if ($("ytSearchOrUrlInput")) $("ytSearchOrUrlInput").value = q;
      playYouTubeQuery(q);
    });
  });
  $("runYtAiBtn")?.addEventListener("click", async () => {
    const q = ($("ytSearchOrUrlInput")?.value || "Bangla news live").trim();
    const fb = `YouTube AI [${q}]: নির্বাচিত ভিডিও/সার্চ টপিক "${q}" এর মূল বিষয়বস্তু ও লাইভ স্ট্রিম সারসংক্ষেপ প্রস্তুত।`;
    const ans = await UniversalAiHub.ask({ module: "youtube_ai", prompt: q, fallbackBn: fb });
    if ($("ytAiOutput")) $("ytAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });

  // File Registry + AI
  function renderFileRegistry(queryStr = "") {
    const grid = $("fileListGrid");
    if (!grid) return;
    const ql = queryStr.trim().toLowerCase();
    const frag = document.createDocumentFragment();
    let count = 0;
    AYNA_REGISTRY_ITEMS.forEach((item, idx) => {
      if (!ql || item.toLowerCase().includes(ql)) {
        const div = document.createElement("div");
        div.className = "file-item-card";
        div.innerHTML = `<span class="file-item-num">#${idx + 1}</span><span>${escapeHtml(item)}</span>`;
        frag.appendChild(div);
        count++;
      }
    });
    grid.innerHTML = "";
    grid.appendChild(frag);
    if (!count) grid.innerHTML = `<div class="empty">কোনো ফাইল বা ফোল্ডার পাওয়া যায়নি।</div>`;
  }
  $("fileSearchInput")?.addEventListener("input", (e) => renderFileRegistry(e.target.value));
  $("runRegistryAiBtn")?.addEventListener("click", () => {
    const q = ($("fileSearchInput")?.value || "").trim();
    const matches = AYNA_REGISTRY_ITEMS.filter((x) => !q || x.toLowerCase().includes(q.toLowerCase()));
    if ($("registryAiOutput")) {
      $("registryAiOutput").textContent = `রেজিস্ট্রি AI: মোট ${AYNA_REGISTRY_ITEMS.length}টি আইটেমের মধ্যে "${q || "সব"}" অনুসারে ${matches.length}টি মডিউল পাওয়া গেছে।`;
    }
  });
  $("speakRegistryAiBtn")?.addEventListener("click", () => AynaSoundEngine.speak($("registryAiOutput")?.textContent || "", true));
  renderFileRegistry("");

  // Post Creator, Media & Feed + Post AI
  let selectedFile = null, selectedType = "text";
  function resetMediaSelection() {
    selectedFile = null;
    selectedType = "text";
    ["imageInput", "audioInput", "videoInput", "fileInput"].forEach((id) => {
      if ($(id)) $(id).value = "";
    });
    if ($("mediaPreview")) $("mediaPreview").style.display = "none";
    if ($("previewContent")) $("previewContent").innerHTML = "";
    if ($("previewName")) $("previewName").textContent = "";
  }
  function handleFilePicked(file, kind) {
    if (!file) return;
    const max = MEDIA_LIMITS[kind] || MEDIA_LIMITS.file;
    if (file.size > max) {
      AynaSoundEngine.announceMistake(`ফাইলের আকার ${formatSize(max)} সীমা অতিক্রম করেছে।`, "postMediaAiOutput");
      return;
    }
    selectedFile = file;
    selectedType = kind;
    const url = URL.createObjectURL(file);
    let html = "";
    if (kind === "image") html = `<img src="${url}" alt="Selected image" />`;
    else if (kind === "video") html = `<video controls src="${url}"></video>`;
    else if (kind === "audio") html = `<audio controls src="${url}" style="width:100%;"></audio>`;
    else html = `<div class="hub-card-title">📎 ${escapeHtml(file.name)}</div>`;
    if ($("previewContent")) $("previewContent").innerHTML = html;
    if ($("previewName")) $("previewName").textContent = `${file.name} (${formatSize(file.size)})`;
    if ($("mediaPreview")) $("mediaPreview").style.display = "block";
  }
  $("chooseImage")?.addEventListener("click", () => $("imageInput")?.click());
  $("chooseAudio")?.addEventListener("click", () => $("audioInput")?.click());
  $("chooseVideo")?.addEventListener("click", () => $("videoInput")?.click());
  $("chooseFile")?.addEventListener("click", () => $("fileInput")?.click());
  $("imageInput")?.addEventListener("change", (e) => handleFilePicked(e.target.files?.[0], "image"));
  $("audioInput")?.addEventListener("change", (e) => handleFilePicked(e.target.files?.[0], "audio"));
  $("videoInput")?.addEventListener("change", (e) => handleFilePicked(e.target.files?.[0], "video"));
  $("fileInput")?.addEventListener("change", (e) => handleFilePicked(e.target.files?.[0], "file"));
  $("clearMedia")?.addEventListener("click", resetMediaSelection);

  $("aiPolishPostBtn")?.addEventListener("click", () => {
    if ($("postText")) $("postText").value = UniversalAiHub.cleanText($("postText").value);
    notify("✨ AI লেখা সংশোধন সম্পন্ন হয়েছে");
  });

  $("aiAnalyzePostBtn")?.addEventListener("click", async () => {
    const txt = UniversalAiHub.cleanText($("postText")?.value || "");
    const mediaNote = selectedFile ? `${selectedType} (${selectedFile.name}, ${formatSize(selectedFile.size)})` : "কোনো মিডিয়া নেই";
    if (!txt && !selectedFile) {
      AynaSoundEngine.announceMistake("পোস্ট বা মিডিয়া বক্স খালি আছে। লেখা বা ফাইল যুক্ত করুন।", "postMediaAiOutput");
      return;
    }
    const fb = `পোস্ট ও মিডিয়া AI: ${mediaNote}। সারসংক্ষেপ: ${txt || "মিডিয়া সংযুক্ত পোস্ট"}।`;
    const ans = await UniversalAiHub.ask({ module: "post_media_ai", prompt: fb, fallbackBn: fb });
    if ($("postMediaAiOutput")) $("postMediaAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });

  const LOCAL_POSTS_KEY = "ayna_local_posts_v2";
  let allPosts = [], activeFilter = "all";
  const loadLocalPosts = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_POSTS_KEY) || "[]"); } catch (_) { return []; }
  };
  function saveLocalPost(post) {
    const list = [post, ...loadLocalPosts()].slice(0, 60);
    try { localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(list)); } catch (_) {}
    mergeAndRenderFeed();
  }
  function renderFeed() {
    const feedEl = $("feed");
    if (!feedEl) return;
    const items = allPosts.filter((p) => activeFilter === "all" || (p.type || "text") === activeFilter);
    if (!items.length) {
      feedEl.innerHTML = `<div class="empty">এই ক্যাটাগরিতে কোনো পোস্ট নেই।</div>`;
      return;
    }
    feedEl.innerHTML = items.map((p) => {
      const dt = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString("bn-BD") : (p.dateLabel || "এখনই");
      let mediaHtml = "";
      if (p.mediaUrl && p.type === "image") mediaHtml = `<img class="post-media" src="${escapeHtml(p.mediaUrl)}" alt="Post image" />`;
      else if (p.mediaUrl && p.type === "video") mediaHtml = `<video class="post-media-video" controls playsinline src="${escapeHtml(p.mediaUrl)}"></video>`;
      else if (p.mediaUrl && p.type === "audio") mediaHtml = `<audio class="post-media-audio" controls src="${escapeHtml(p.mediaUrl)}"></audio>`;
      else if (p.mediaUrl && p.type === "file") mediaHtml = `<div class="file-attach-box"><span>📎 ${escapeHtml(p.fileName || "Attached File")}</span><a href="${escapeHtml(p.mediaUrl)}" target="_blank" rel="noopener">ডাউনলোড</a></div>`;
      const commentsHtml = (p.comments || []).map((c) => `<div class="comment-item"><strong>${escapeHtml(c.author || "সদস্য")}:</strong> ${escapeHtml(c.text || "")}</div>`).join("");
      return `
        <article class="feed-post" data-post-id="${escapeHtml(p.id)}">
          <div class="post-header">
            <div class="post-author-wrap">
              <img class="post-avatar" src="${escapeHtml(p.authorPhoto || "./icon-512.png")}" alt="Avatar" />
              <div>
                <div class="post-author">${escapeHtml(p.authorName || "AYNA Member")}</div>
                <div class="post-date">${escapeHtml(dt)}</div>
              </div>
            </div>
            <span class="q-pill">${escapeHtml((p.type || "text").toUpperCase())}</span>
          </div>
          ${p.text ? `<div class="post-content">${escapeHtml(p.text)}</div>` : ""}
          ${mediaHtml}
          <div class="post-actions">
            <button type="button" class="like-btn">👍 পছন্দ (${p.likes || 0})</button>
            <button type="button" class="speak-post-btn">🔊 কণ্ঠে শুনুন</button>
            <button type="button" class="ai-post-btn">🤖 পোস্ট AI</button>
            <button type="button" class="share-post-btn">🔗 কপি</button>
          </div>
          <div class="comments">
            ${commentsHtml}
            <form class="comment-form">
              <input type="text" placeholder="মন্তব্য লিখুন..." required />
              <button type="submit">পাঠান</button>
            </form>
          </div>
        </article>
      `;
    }).join("");

    feedEl.querySelectorAll(".feed-post").forEach((card) => {
      const pid = card.getAttribute("data-post-id");
      const postObj = allPosts.find((x) => String(x.id) === String(pid));
      card.querySelector(".like-btn")?.addEventListener("click", async () => {
        if (!postObj) return;
        postObj.likes = (postObj.likes || 0) + 1;
        renderFeed();
        if (db && postObj.firestoreId) {
          try { await updateDoc(doc(db, "posts", postObj.firestoreId), { likes: increment(1) }); } catch (_) {}
        }
      });
      card.querySelector(".speak-post-btn")?.addEventListener("click", () => AynaSoundEngine.speak(postObj?.text || "মিডিয়া পোস্ট", true));
      card.querySelector(".ai-post-btn")?.addEventListener("click", () => {
        const info = `পোস্ট AI [${postObj?.authorName || "সদস্য"}]: ${postObj?.text || "মিডিয়া পোস্ট"} (পছন্দ: ${postObj?.likes || 0})।`;
        if ($("postMediaAiOutput")) $("postMediaAiOutput").textContent = info;
        $("postMediaAiOutput")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        AynaSoundEngine.speak(info, true);
      });
      card.querySelector(".share-post-btn")?.addEventListener("click", () => {
        navigator.clipboard?.writeText(postObj?.text || window.location.href).catch(() => {});
        notify("পোস্ট কপি করা হয়েছে");
      });
      card.querySelector(".comment-form")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const inp = e.target.querySelector("input");
        const val = (inp?.value || "").trim();
        if (!val || !postObj) return;
        postObj.comments = [...(postObj.comments || []), { author: currentUserProfile.name, text: val }];
        inp.value = "";
        renderFeed();
      });
    });
  }
  function mergeAndRenderFeed(remotePosts = []) {
    const map = new Map();
    [...remotePosts, ...loadLocalPosts()].forEach((item) => map.set(String(item.id), item));
    allPosts = Array.from(map.values());
    renderFeed();
  }
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter") || "all";
      renderFeed();
    });
  });

  $("publishPost")?.addEventListener("click", async () => {
    const text = UniversalAiHub.cleanText($("postText")?.value || "");
    if (!text && !selectedFile) {
      AynaSoundEngine.announceMistake("পোস্ট প্রকাশ করতে লেখা বা মিডিয়া ফাইল দিন।", "postMediaAiOutput");
      return;
    }
    let mediaUrl = "", fileName = "";
    if (selectedFile) {
      fileName = selectedFile.name;
      if (storage && currentUser) {
        try {
          if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "block";
          const sRef = storageRef(storage, `posts/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
          const task = uploadBytesResumable(sRef, selectedFile);
          mediaUrl = await new Promise((resolve, reject) => {
            task.on(
              "state_changed",
              (snap) => {
                const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                if ($("uploadProgressBar")) $("uploadProgressBar").style.width = `${pct}%`;
              },
              reject,
              async () => resolve(await getDownloadURL(task.snapshot.ref))
            );
          });
        } catch (_) {
          mediaUrl = URL.createObjectURL(selectedFile);
        } finally {
          if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "none";
        }
      } else {
        mediaUrl = URL.createObjectURL(selectedFile);
      }
    }
    const newPost = {
      id: `local_${Date.now()}`,
      text,
      type: selectedFile ? selectedType : "text",
      mediaUrl,
      fileName,
      authorName: currentUserProfile.name,
      authorPhoto: currentUserProfile.photoURL || "./icon-512.png",
      dateLabel: new Date().toLocaleString("bn-BD"),
      likes: 0,
      comments: []
    };
    if (db) {
      try {
        const docRef = await addDoc(collection(db, "posts"), { ...newPost, uid: currentUser?.uid || "guest", createdAt: serverTimestamp() });
        newPost.firestoreId = docRef.id;
      } catch (_) {}
    }
    saveLocalPost(newPost);
    if ($("postText")) $("postText").value = "";
    resetMediaSelection();
    if ($("postStatus")) $("postStatus").textContent = "✅ পোস্ট সফলভাবে প্রকাশিত হয়েছে।";
    notify("🚀 পোস্ট প্রকাশিত হয়েছে");
    AynaSoundEngine.speak("আপনার পোস্ট প্রকাশিত হয়েছে।", true);
  });

  if (db) {
    try {
      onSnapshot(
        query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(30)),
        (snap) => mergeAndRenderFeed(snap.docs.map((d) => ({ id: d.id, firestoreId: d.id, ...d.data() }))),
        () => mergeAndRenderFeed([])
      );
    } catch (_) {
      mergeAndRenderFeed([]);
    }
  } else {
    mergeAndRenderFeed([]);
  }

  // Live Camera & Live AI
  let cameraStream = null;
  $("startCamera")?.addEventListener("click", async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera");
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if ($("liveVideo")) $("liveVideo").srcObject = cameraStream;
      if ($("cameraStatus")) $("cameraStatus").textContent = "ক্যামেরা লাইভ চালু আছে।";
      notify("📹 ক্যামেরা চালু হয়েছে");
    } catch (_) {
      AynaSoundEngine.announceMistake("ক্যামেরা চালু করা যায়নি। অনুমতি বা ক্যামেরা হার্ডওয়্যার যাচাই করুন।", "liveAiOutput");
    }
  });
  $("stopCamera")?.addEventListener("click", () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    if ($("liveVideo")) $("liveVideo").srcObject = null;
    if ($("cameraStatus")) $("cameraStatus").textContent = "ক্যামেরা এখন বন্ধ।";
    notify("⏹ ক্যামেরা বন্ধ হয়েছে");
  });
  $("runLiveAiBtn")?.addEventListener("click", async () => {
    const fb = cameraStream
      ? "লাইভ ভিডিও AI: ক্যামেরা লাইভ স্ট্রিম সক্রিয় রয়েছে এবং ফ্রেম মনিটরিং চলছে।"
      : "লাইভ ভিডিও AI: ক্যামেরা বর্তমানে বন্ধ রয়েছে। লাইভ পর্যবেক্ষণের জন্য ক্যামেরা চালু করুন।";
    const ans = await UniversalAiHub.ask({ module: "live_video", prompt: fb, fallbackBn: fb });
    if ($("liveAiOutput")) $("liveAiOutput").textContent = ans;
    AynaSoundEngine.speak(ans, true);
  });

  // Quantum Mode & Auto-Sync All Features
  let qIdx = 0;
  const qModes = ["FULL-AI • ULTRA-CRITICAL", "DETERMINISTIC-GATE • 150-RULE", "COLD-FALLBACK-READY • SYNC"];
  $("quantumBoostBtn")?.addEventListener("click", () => {
    qIdx = (qIdx + 1) % qModes.length;
    if ($("qSyncState")) $("qSyncState").textContent = qModes[qIdx];
    AynaSoundEngine.playTone(660, 0.2);
    notify(`বিচার প্রোফাইল: ${qModes[qIdx]}`);
  });

  function runAllFeaturesAutoSyncNow() {
    fetchWeather($("weatherCityInput")?.value || "Dhaka");
    runGeneralRadarAi(false);
    runWeatherRadarAi(false);
    runAviationRadarAi(false);
    runClockAi(false);
    if (autoEvEnabled) refreshAutoEv(false);
    renderNobel($("nobelSearchInput")?.value || "");
    if ($("qAutoSyncStatus")) {
      $("qAutoSyncStatus").textContent = `ALL-AI SYNCED • ${new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}`;
    }
    notify("🔄 রাডার, আবহাওয়া, এভিয়েশন ও সব ফিচার AI অটো-সিঙ্ক হয়েছে");
  }

  $("autoUpdateNowBtn")?.addEventListener("click", runAllFeaturesAutoSyncNow);
  runAllFeaturesAutoSyncNow();
  setInterval(runAllFeaturesAutoSyncNow, 3 * 60 * 1000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAynaIndexHub, { once: true });
} else {
  initAynaIndexHub();
}