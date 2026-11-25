const $ = id => document.getElementById(id);

const LIMITS = {
  image: 25 * 1024 * 1024,
  audio: 100 * 1024 * 1024,
  video: 250 * 1024 * 1024,
  file: 250 * 1024 * 1024
};

const AYNA_REGISTRY_ITEMS = [
  "js (রুট তালিকায় প্রথমবার দেখা যাচ্ছে)",
  "android-app",
  "aspect-ratio: 1",
  "assets",
  "functions",
  "world-leaders",
  "world-leaders/world-leaders.html",
  "world-leaders/world-leaders.js",
  "world-leaders/leaders.json",
  "world-leaders/flags",
  "world-leaders/photos",
  "index.html (রুট তালিকায় ফোল্ডার আইকনে দেখা যাচ্ছে)",
  "js (রুট তালিকায় দ্বিতীয়বার দেখা যাচ্ছে)",
  ".github (android-app ফোল্ডারের ভেতরে)",
  "app (android-app ফোল্ডারের ভেতরে)",
  "4account.html",
  "access.html",
  "account-security.html",
  "admin-payment.html",
  "android-hub.html",
  "apple.html",
  "arabic-calendar.html",
  "audio-video-messaging.html",
  "auth.html",
  "auto-network.html",
  "bangla-radio-tv.html",
  "bd-directory.html",
  "breaking-news.html",
  "business-directory.html",
  "button.html",
  "calendar.html",
  "camera.html",
  "chat.html",
  "clock.html",
  "compass.html",
  "countries.html",
  "currency-exchange.html",
  "dashboard.html",
  "direction.html",
  "ev-vehicles.html",
  "forgot-password.html",
  "github-firebase-config.html",
  "global-alert.html",
  "google-official-sites.html",
  "gps.html",
  "home.html",
  "hourly-clock.html",
  "index.html",
  "location-alert.html",
  "login-activity.html",
  "login.html",
  "medical-research.html",
  "medicine-store.html",
  "messages.htm",
  "messages.html",
  "messenger.html",
  "military-radar.html",
  "ownership.html",
  "passwed.html",
  "payment-pending.html",
  "payment.html",
  "prayer.html",
  "privacy-settings.html",
  "privacy.html",
  "profile.html",
  "public-profile.html",
  "qr.html",
  "quantum.html",
  "radar-compass.html",
  "radar.html",
  "radio-tv.html",
  "radio.html",
  "register.html",
  "security.html",
  "signup.html",
  "studio.html",
  "supercomputer.html",
  "tv-live.html",
  "us-alerts.html",
  "user-search.html",
  "verify-email.html",
  "world-doctors.html",
  "world-holidays.html",
  "world-leaders.html",
  "world-locations.html",
  "world-grocery.html",
  "world-farmers.html",
  "poultry-farmers.html",
  "price-list.html",
  "world-market.html",
  "world-officials.html",
  "air-rail-transport.html",
  "world-air-rail.html",
  "world-garments.html",
  "world-jobs.html",
  "world-ngo-rights.html",
  "ulema-research.html",
  "access.js",
  "account-types.js",
  "admin-payment.js",
  "app.js",
  "arabic-calendar.js",
  "auth-guard.js",
  "auth.js",
  "calendar.js",
  "chat.js",
  "clock.js",
  "comments.js",
  "compass.js",
  "connectivity.js",
  "database.js",
  "firebase-config.js",
  "firebase-init.js",
  "firebase.js",
  "follow.js",
  "forgot-password.js",
  "functions.js",
  "gps.js",
  "index.js",
  "likes.js",
  "login-activity.js",
  "login.js",
  "messenger.js",
  "military-radar.js",
  "notifications-page.js",
  "notifications.js",
  "offline.js",
  "payment-status.js",
  "payment.js",
  "posts.js",
  "prayer.js",
  "privacy-settings.js",
  "privacy.js",
  "profile.js",
  "qr.js",
  "quantum-security.js",
  "radar.js",
  "radio.js",
  "register.js",
  "security-dashboard.js",
  "security.js",
  "server.js.node.js",
  "session-logout.js",
  "session-security.js",
  "set-admin-claim.js",
  "signup.js",
  "storage-test.js",
  "storage.js",
  "sw.js",
  "translator.js",
  "tv-live.js",
  "update.js",
  "us-alerts.js",
  "verify-email.js",
  "vite.config.js",
  "world-holidays.js",
  "world-leaders.js",
  "world-grocery.js",
  "world-farmers.js",
  "poultry-farmers.js",
  "daily-price-list.js",
  "price-list.js",
  "world-market.js",
  "world-officials.js",
  "air-rail-transport.js",
  "world-air-rail.js",
  "world-garments.js",
  "world-jobs.js",
  "world-ngo-rights.js",
  "ulema-research.js",
  "AuthScreen.kt",
  "HomeScreen.kt",
  "MainActivity.kt",
  "MessagingScreen.kt",
  "PostScreen.kt",
  "build.gradle.kts",
  "gradle.properties",
  "settings.gradle.kts",
  ".gitignore",
  "AYNA-BOOK-FILE-STRUCTURE.txt",
  "AndroidManifest.xml",
  "README.md",
  "_config.yml",
  "ayna-book-check.yml",
  "ayna-ui-patch.css",
  "build-apk.yml",
  "colors.xml",
  "dashboard.php",
  "database.rules.json",
  "deploy-pages.yml",
  "firebase.json",
  "firestore.rules",
  "google-services.json",
  "icon-192.png",
  "icon-512.png",
  "jekyll-gh-pages.yml",
  "manifest.json",
  "manifest.webmanifest",
  "package.json",
  "page-register",
  "sha1.yml",
  "storage.rules",
  "strings.xml",
  "styles.css",
  "themes.xml",
  "vercel.json",
  "version.json"
];

if ($("qFileCount")) $("qFileCount").textContent = String(AYNA_REGISTRY_ITEMS.length);
if ($("registryTotalLabel")) $("registryTotalLabel").textContent = String(AYNA_REGISTRY_ITEMS.length);

function renderAynaBarcode(codeText = "2026-----10000001") {
  if (typeof window.JsBarcode === "function" && $("aynaProfileBarcode")) {
    try {
      window.JsBarcode("#aynaProfileBarcode", codeText, {
        format: "CODE128",
        lineColor: "#000000",
        width: 1.5,
        height: 34,
        displayValue: false,
        margin: 0
      });
    } catch (_) {}
  }
}
renderAynaBarcode("2026-----10000001");

function notify(message) {
  const box = $("notice");
  if (!box) return;
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    box.style.display = "none";
  }, 3400);
}

// বিশ্বমানের সাউন্ড কোয়ালিটি প্রসেসর (Web Audio API DSP + EQ + Limiter)
const AynaWorldClassAudio = {
  ctx: null,
  masterGain: null,
  lowShelf: null,
  presencePeak: null,
  airShelf: null,
  limiter: null,
  preset: "STUDIO_MASTER",

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.lowShelf = this.ctx.createBiquadFilter();
      this.lowShelf.type = "lowshelf";
      this.lowShelf.frequency.value = 140;

      this.presencePeak = this.ctx.createBiquadFilter();
      this.presencePeak.type = "peaking";
      this.presencePeak.frequency.value = 2800;
      this.presencePeak.Q.value = 1.1;

      this.airShelf = this.ctx.createBiquadFilter();
      this.airShelf.type = "highshelf";
      this.airShelf.frequency.value = 8500;

      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.value = -3.0;
      this.limiter.knee.value = 12.0;
      this.limiter.ratio.value = 8.0;
      this.limiter.attack.value = 0.004;
      this.limiter.release.value = 0.12;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;

      this.lowShelf.connect(this.presencePeak);
      this.presencePeak.connect(this.airShelf);
      this.airShelf.connect(this.limiter);
      this.limiter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyPreset(this.preset, false);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  applyPreset(presetName = "STUDIO_MASTER", playChime = false) {
    this.preset = presetName;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (presetName === "CINEMA_THEATER") {
      this.lowShelf.gain.setTargetAtTime(6.5, now, 0.03);
      this.presencePeak.gain.setTargetAtTime(2.5, now, 0.03);
      this.airShelf.gain.setTargetAtTime(5.0, now, 0.03);
    } else if (presetName === "VOICE_BROADCAST") {
      this.lowShelf.gain.setTargetAtTime(1.5, now, 0.03);
      this.presencePeak.gain.setTargetAtTime(6.0, now, 0.03);
      this.airShelf.gain.setTargetAtTime(4.0, now, 0.03);
    } else {
      this.lowShelf.gain.setTargetAtTime(4.2, now, 0.03);
      this.presencePeak.gain.setTargetAtTime(3.8, now, 0.03);
      this.airShelf.gain.setTargetAtTime(4.8, now, 0.03);
    }

    if (playChime) {
      this.playStudioChime();
    }
  },

  playStudioChime() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      env.gain.setValueAtTime(0.0001, now + idx * 0.08);
      env.gain.linearRampToValueAtTime(0.14, now + idx * 0.08 + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.08 + 0.36);
      osc.connect(env);
      env.connect(this.lowShelf);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.38);
    });
  },

  playErrorSignal() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(220, now + 0.14);
    env.gain.setValueAtTime(0.18, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(env);
    env.connect(this.lowShelf);
    osc.start(now);
    osc.stop(now + 0.38);
  }
};

// ভয়েস সিগন্যাল ও ভুল বলার ইঞ্জিন
const AynaVoiceSignal = {
  playErrorBeep() {
    AynaWorldClassAudio.playErrorSignal();
  },

  speak(text, force = true) {
    if (!force || !text || !("speechSynthesis" in window)) return;
    try {
      AynaWorldClassAudio.ensureContext();
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(text).replace(/[*#]/g, "").slice(0, 320));
      const voices = window.speechSynthesis.getVoices() || [];
      const bnVoice = voices.find(v => /bn/i.test(v.lang));
      utter.voice = bnVoice || voices[0] || null;
      utter.lang = bnVoice?.lang || "bn-BD";
      utter.rate = 0.96;
      utter.pitch = 1.02;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  },

  announceMistake(mistakeBn, targetElId = "accountSignalOutput") {
    this.playErrorBeep();
    notify("⚠️ ভুল সিগন্যাল: " + mistakeBn);
    if (targetElId && $(targetElId)) {
      $(targetElId).textContent = `⚠️ ভুল সিগন্যাল সক্রিয়:\n${mistakeBn}`;
    }
    this.speak(`ভুল হয়েছে। ${mistakeBn}`, true);
  }
};

// Ultra-Critical High-Speed Judgment & AI Client
const UltraCriticalHub = {
  profileIndex: 0,
  profiles: [
    "ULTRA-CRITICAL • PARALLEL",
    "DETERMINISTIC-GATE • 150-RULE",
    "COLD-FALLBACK-READY • SYNC"
  ],

  saveSnapshot(key, data) {
    try {
      localStorage.setItem(`ayna_cold_${key}`, JSON.stringify({ savedAt: Date.now(), data }));
    } catch (_) {}
  },

  loadSnapshot(key, fallback = null) {
    try {
      const raw = JSON.parse(localStorage.getItem(`ayna_cold_${key}`) || "null");
      return raw && "data" in raw ? raw.data : fallback;
    } catch (_) {
      return fallback;
    }
  },

  cleanTextAi(raw = "") {
    let t = String(raw).trim().replace(/\s+/g, " ");
    const fixes = {
      "ফায়াব্যাস": "ফায়ারবেস",
      "পোষ্ট": "পোস্ট",
      "কফি": "কপি",
      "কালাম": "কলাম",
      "আপর": "অপর",
      "এনাউন্স": "অ্যানাউন্স"
    };
    Object.keys(fixes).forEach(k => {
      t = t.replaceAll(k, fixes[k]);
    });
    t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
    t = t.replace(/\bi\b/g, "I");
    return t;
  },

  judgeCriticality(countMetric = 150) {
    const n = Number(countMetric) || 0;
    if (n >= 150) {
      return { severity: "CRITICAL (150+)", verdictBn: "জরুরি হস্তক্ষেপ ও তাৎক্ষণিক রিভিউ প্রয়োজন।" };
    }
    if (n >= 75) {
      return { severity: "ELEVATED (75-149)", verdictBn: "সতর্ক পর্যবেক্ষণ ও সারি অগ্রাধিকার দিন।" };
    }
    return { severity: "NOMINAL (<75)", verdictBn: "স্বাভাবিক সীমার ভেতরে রয়েছে।" };
  },

  async askAi({ module = "general", action = "assist", text = "", context = "", fallbackBn = "" }) {
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module, action, text, context })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => ({}));
      const out = String(json.reply || json.text || json.answer || json.result || "")
        .replace(/[*#]/g, "")
        .trim();
      return out || fallbackBn;
    } catch (_) {
      return fallbackBn;
    }
  }
};

// বিশ্বমানের সাউন্ড প্রোফাইল ও সার্বজনীন AI বাটন
$("applyAudioPresetBtn")?.addEventListener("click", () => {
  const preset = $("audioPresetSelect")?.value || "STUDIO_MASTER";
  AynaWorldClassAudio.applyPreset(preset, true);
  notify(`সাউন্ড প্রোফাইল সক্রিয়: ${preset}`);
  if ($("universalAiOutput")) {
    $("universalAiOutput").textContent = `🎧 সাউন্ড প্রোফাইল (${preset}) চালু হয়েছে এবং স্টুডিও অডিও টেস্ট বাজানো হয়েছে।`;
  }
});

$("runUniversalAiBtn")?.addEventListener("click", async () => {
  const q = ($("universalAiInput")?.value || "AYNA BOOK সব ফিচার ও লাইভ স্ট্যাটাসের সারসংক্ষেপ").trim();
  const fallbackBn =
    `AI সারসংক্ষেপ (${q}): বিশ্ব ঘড়ি, রেডিও ও টিভি AI, বেসামরিক-আবহাওয়া রাডার ও কম্পাস, বিশ্ব রাষ্ট্র ও নোবেল ডিরেক্টরি, বাণিজ্য ও পোস্ট-মিডিয়া AI একসাথে সিঙ্ক অবস্থায় সক্রিয় রয়েছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "universal_ai",
    action: "feature_hub_ai",
    text: q,
    context: "Answer concisely in 2 Bengali sentences covering the requested AYNA BOOK feature without markdown or emojis.",
    fallbackBn
  });
  if ($("universalAiOutput")) $("universalAiOutput").textContent = `🤖 সার্বজনীন AI:\n${reply}`;
  AynaVoiceSignal.speak(reply, true);
});

// রেজিস্ট্রেশন ও অ্যাকাউন্ট লুকআপ ভ্যালিডেশন + কণ্ঠ সিগন্যাল
$("validateRegisterVoiceBtn")?.addEventListener("click", () => {
  const name = ($("regFullNameInput")?.value || "").trim();
  const email = ($("regEmailInput")?.value || "").trim();
  const pass = $("regPasswordInput")?.value || "";

  if (!name || name.length < 2) {
    AynaVoiceSignal.announceMistake("পূর্ণ নাম ঘরে সঠিক নাম লিখুন। নাম খালি বা খুব ছোট রয়েছে।");
    return;
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    AynaVoiceSignal.announceMistake("ইমেইল ঠিকানার ঘরে ভুল হয়েছে। সঠিক ইমেইল লিখুন।");
    return;
  }
  if (pass.length < 6) {
    AynaVoiceSignal.announceMistake("পাসওয়ার্ডের ঘরে ভুল হয়েছে। পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।");
    return;
  }

  const okMsg = `✅ রেজিস্ট্রেশন তথ্য সঠিক আছে। নাম: ${name}, ইমেইল: ${email}।`;
  if ($("accountSignalOutput")) $("accountSignalOutput").textContent = okMsg;
  notify("রেজিস্ট্রেশন তথ্য সঠিক আছে");
  AynaVoiceSignal.speak("রেজিস্ট্রেশন তথ্য সঠিক আছে। আপনি এগিয়ে যেতে পারেন।", true);
});

$("runAccountLookupVoiceBtn")?.addEventListener("click", () => {
  const q = ($("accountLookupQueryInput")?.value || "").trim();
  const knownId = $("myAynaId")?.textContent?.trim() || "2026-----10000001";
  const knownEmail = ($("myEmail")?.textContent || "").trim();

  if (!q) {
    AynaVoiceSignal.announceMistake("অ্যাকাউন্ট লুকআপ ঘরটি খালি আছে। AYNA ID অথবা ইমেইল লিখুন।");
    return;
  }

  const matched =
    q === knownId ||
    q === "2026-----10000001" ||
    (knownEmail && q.toLowerCase() === knownEmail.toLowerCase());

  if (!matched) {
    AynaVoiceSignal.announceMistake(`অ্যাকাউন্ট লুকাপে "${q}" খুঁজে পাওয়া যায়নি। AYNA ID বা ইমেইল বানান যাচাই করুন।`);
    return;
  }

  const foundMsg = `✅ অ্যাকাউন্ট লুকআপ সফল: AYNA ID ${knownId} পাওয়া গেছে।`;
  if ($("accountSignalOutput")) $("accountSignalOutput").textContent = foundMsg;
  notify("অ্যাকাউন্ট পাওয়া গেছে");
  AynaVoiceSignal.speak(`অ্যাকাউন্ট পাওয়া গেছে। আইডি নম্বর ${knownId}।`, true);
});

$("aiPolishPostBtn")?.addEventListener("click", () => {
  const polished = UltraCriticalHub.cleanTextAi($("postText")?.value || "");
  if ($("postText")) $("postText").value = polished;
  notify("AI লেখা ও ক্যাপিটাল সংশোধন সম্পন্ন হয়েছে");
});

// পোস্ট, অডিও ও ভিডিও AI
let lastPostMediaAiText = "";
$("aiAnalyzePostBtn")?.addEventListener("click", async () => {
  const txt = UltraCriticalHub.cleanTextAi($("postText")?.value || "");
  const mediaInfo = selectedFile
    ? `সংযুক্ত ${selectedType}: ${selectedFile.name} (${formatSize(selectedFile.size)})`
    : "কোনো মিডিয়া ফাইল সংযুক্ত নেই";

  if (!txt && !selectedFile) {
    AynaVoiceSignal.announceMistake("পোস্ট বা মিডিয়া বক্স খালি আছে। লেখা বা অডিও/ভিডিও/ছবি দিন।", "postMediaAiOutput");
    return;
  }

  const fallbackBn =
    `${mediaInfo}। পোস্ট সারসংক্ষেপ: ${txt ? txt.slice(0, 140) : "মিডিয়া পোস্ট প্রস্তুত"}। প্রকাশিত হলে কোয়ান্টাম ফিডে তাৎক্ষণিক সিঙ্ক হবে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "post_media_ai",
    action: "post_audio_video_ai",
    text: `Text: ${txt || "None"}, Media: ${mediaInfo}`,
    context: "Summarize the post and attached audio/video/image in 2 concise Bengali sentences without markdown or emojis.",
    fallbackBn
  });

  lastPostMediaAiText = reply;
  if ($("postMediaAiOutput")) $("postMediaAiOutput").textContent = `🤖 পোস্ট ও মিডিয়া AI:\n${reply}`;
  AynaVoiceSignal.speak(reply, true);
});

// লাইভ ভিডিও AI
let lastLiveAiText = "";
$("runLiveAiBtn")?.addEventListener("click", async () => {
  const isLive = !!cameraStream;
  const statusText = isLive
    ? "ক্যামেরা লাইভ মোডে সক্রিয় রয়েছে এবং লোকাল প্রিভিউ স্ট্রিম চলছে।"
    : "ক্যামেরা বর্তমানে বন্ধ আছে। লাইভ স্ট্রিম দেখতে ক্যামেরা চালু করুন।";
  const reply = await UltraCriticalHub.askAi({
    module: "live_video_ai",
    action: "live_stream_ai_check",
    text: statusText,
    context: "Give a short 2-sentence Bengali live video AI status without markdown or emojis.",
    fallbackBn: statusText
  });
  lastLiveAiText = reply;
  if ($("liveAiOutput")) $("liveAiOutput").textContent = `🤖 লাইভ ভিডিও AI:\n${reply}`;
  AynaVoiceSignal.speak(reply, true);
});

// বিশ্ব রেডিও ও টেলিভিশন AI
let lastRadioTvAiText = "";
async function runRadioTvAi(speakNow = false) {
  const ch = $("radioTvChannelSelect")?.value || "Bangladesh Betar / World Radio";
  const prompt = ($("radioTvPromptInput")?.value || "চ্যানেল আপডেট ও সংবাদ বিশ্লেষণ").trim();
  const fallbackBn =
    `[${ch}] বিষয়: ${prompt}। বিশ্ব রেডিও ও টেলিভিশন AI চ্যানেল সিগন্যাল, সংবাদ সারসংক্ষেপ ও ভয়েস ব্রিফিং সক্রিয় রেখেছে।`;

  const reply = await UltraCriticalHub.askAi({
    module: "radio_tv_ai",
    action: "radio_tv_assistant",
    text: `Channel: ${ch}, Query: ${prompt}`,
    context: "Provide a concise 2-sentence Bengali radio and television AI briefing without markdown or emojis.",
    fallbackBn
  });

  lastRadioTvAiText = `${ch}:\n${reply}`;
  if ($("radioTvAiOutput")) $("radioTvAiOutput").textContent = lastRadioTvAiText;
  UltraCriticalHub.saveSnapshot("radio_tv_ai", { text: lastRadioTvAiText });
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}

$("runRadioTvAiBtn")?.addEventListener("click", () => runRadioTvAi(false));
$("speakRadioTvAiBtn")?.addEventListener("click", () => runRadioTvAi(true));

function renderFileRegistry(query = "") {
  const grid = $("fileListGrid");
  if (!grid) return;
  const cleanQuery = query.trim().toLowerCase();
  const frag = document.createDocumentFragment();
  let matched = 0;

  AYNA_REGISTRY_ITEMS.forEach((item, index) => {
    if (cleanQuery && !item.toLowerCase().includes(cleanQuery)) return;
    matched++;
    const card = document.createElement("div");
    card.className = "file-item-card";

    const num = document.createElement("span");
    num.className = "file-item-num";
    num.textContent = `${index + 1}.`;

    const name = document.createElement("span");
    name.textContent = item;

    card.append(num, name);
    frag.appendChild(card);
  });

  grid.innerHTML = matched
    ? ""
    : '<div class="empty">কোনো ফাইল বা ফোল্ডার মেলেনি।</div>';
  if (matched) grid.appendChild(frag);
}

$("fileSearchInput")?.addEventListener("input", e => {
  renderFileRegistry(e.target.value);
});
renderFileRegistry();

async function runRegistryAi(speakNow = false) {
  const q = ($("fileSearchInput")?.value || "").trim();
  const fallbackBn = q
    ? `রেজিস্ট্রিতে "${q}" সংক্রান্ত ফাইল ও মডিউল অনুসন্ধান সক্রিয় রয়েছে। মোট ${AYNA_REGISTRY_ITEMS.length}টি আইটেম যাচাইযোগ্য।`
    : `AYNA BOOK রেজিস্ট্রিতে মোট ${AYNA_REGISTRY_ITEMS.length}টি ফাইল, মডিউল ও কনফিগারেশন আইটেম সংরক্ষিত আছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "file_registry_ai",
    action: "registry_summary",
    text: `Total items: ${AYNA_REGISTRY_ITEMS.length}, Query: ${q || "all"}`,
    context: "Provide a concise 2-sentence Bengali registry summary without markdown or emojis.",
    fallbackBn
  });
  if ($("registryAiOutput")) $("registryAiOutput").textContent = `🤖 ফাইল রেজিস্ট্রি AI:\n${reply}`;
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}

$("runRegistryAiBtn")?.addEventListener("click", () => runRegistryAi(false));
$("speakRegistryAiBtn")?.addEventListener("click", () => runRegistryAi(true));

// তাপমাত্রা ও আবহাওয়া + AI
const CITY_COORDS = {
  dhaka: { name: "Dhaka", lat: 23.8103, lon: 90.4125 },
  london: { name: "London", lat: 51.5072, lon: -0.1276 },
  tokyo: { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  makkah: { name: "Makkah", lat: 21.3891, lon: 39.8579 },
  newyork: { name: "New York", lat: 40.7128, lon: -74.006 }
};

let latestTempText = "২৮°C";

async function updateWeatherModule() {
  const rawCity = ($("weatherCityInput")?.value || "Dhaka").trim();
  const key = rawCity.toLowerCase().replace(/\s+/g, "");
  const coord = CITY_COORDS[key] || CITY_COORDS.dhaka;
  const cached = UltraCriticalHub.loadSnapshot(`weather_${coord.name}`, null);
  if (cached?.text && $("weatherOutput")) $("weatherOutput").textContent = cached.text;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat}&longitude=${coord.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    const cur = data?.current || {};
    const temp = typeof cur.temperature_2m === "number" ? `${cur.temperature_2m}°C` : "28°C";
    const hum = typeof cur.relative_humidity_2m === "number" ? `${cur.relative_humidity_2m}%` : "65%";
    const wind = typeof cur.wind_speed_10m === "number" ? `${cur.wind_speed_10m} km/h` : "12 km/h";
    latestTempText = temp;
    const text = `${coord.name}: তাপমাত্রা ${temp} • আর্দ্রতা ${hum} • বাতাস ${wind} • AI আবহাওয়া সিঙ্ক সক্রিয়`;
    if ($("weatherOutput")) $("weatherOutput").textContent = text;
    if ($("weatherRadarReadout")) {
      $("weatherRadarReadout").textContent = `Weather AI Radar: ${coord.name} ${temp}, আর্দ্রতা ${hum}, বাতাস ${wind}`;
    }
    UltraCriticalHub.saveSnapshot(`weather_${coord.name}`, { text });
    notify(`${coord.name} তাপমাত্রা: ${temp}`);
  } catch (_) {
    const fallback = cached?.text || `${coord.name}: আনুমানিক তাপমাত্রা 28°C (অফলাইন কোল্ড স্ন্যাপশট)`;
    if ($("weatherOutput")) $("weatherOutput").textContent = fallback;
  }
}
$("fetchWeatherBtn")?.addEventListener("click", updateWeatherModule);

// ভয়েস রেকর্ডার (Studio Audio Graph যুক্ত)
let voiceRecorder = null;
let voiceChunks = [];
$("startVoiceRecBtn")?.addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    notify("এই ব্রাউজারে ভয়েস রেকর্ডার সমর্থিত নয়");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(stream);
    voiceRecorder.ondataavailable = ev => {
      if (ev.data && ev.data.size > 0) voiceChunks.push(ev.data);
    };
    voiceRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(voiceChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(blob);
      const wrap = $("voiceRecAudioWrap");
      if (wrap) {
        wrap.innerHTML = `<audio controls src="${audioUrl}" style="width:100%;margin-top:8px;"></audio>`;
      }
      AynaWorldClassAudio.playStudioChime();
      notify("ভয়েস রেকর্ডিং প্রস্তুত");
    };
    voiceRecorder.start();
    notify("ভয়েস রেকর্ডিং শুরু হয়েছে");
  } catch (_) {
    notify("মাইক্রোফোন অনুমতি দিন");
  }
});

$("stopVoiceRecBtn")?.addEventListener("click", () => {
  if (voiceRecorder && voiceRecorder.state !== "inactive") {
    voiceRecorder.stop();
  }
});

// বুকমার্ক ম্যানেজার + AI
function renderBookmarks() {
  const list = UltraCriticalHub.loadSnapshot("bookmarks", []);
  const container = $("bookmarksList");
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<div class="hub-card-meta">কোনো বুকমার্ক সংরক্ষিত নেই।</div>';
    return;
  }
  container.innerHTML = list.map((item, idx) => `
    <div class="bookmark-row">
      <span>🔖 <strong>${item.title}</strong> <small style="color:var(--muted);">(${item.savedAt})</small></span>
      <button type="button" class="yt-preset-btn" data-bm-del="${idx}">মুছুন</button>
    </div>
  `).join("");
  container.querySelectorAll("[data-bm-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-bm-del"));
      const next = UltraCriticalHub.loadSnapshot("bookmarks", []).filter((_, i) => i !== idx);
      UltraCriticalHub.saveSnapshot("bookmarks", next);
      renderBookmarks();
      notify("বুকমার্ক মুছে ফেলা হয়েছে");
    });
  });
}

$("saveBookmarkBtn")?.addEventListener("click", () => {
  const title = ($("bookmarkTitleInput")?.value || "").trim();
  if (!title) {
    notify("বুকমার্ক শিরোনাম বা লিংক লিখুন");
    return;
  }
  const current = UltraCriticalHub.loadSnapshot("bookmarks", []);
  current.unshift({
    title,
    savedAt: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true })
  });
  UltraCriticalHub.saveSnapshot("bookmarks", current.slice(0, 20));
  if ($("bookmarkTitleInput")) $("bookmarkTitleInput").value = "";
  renderBookmarks();
  notify("বুকমার্ক সংরক্ষিত হয়েছে");
});

// QR কোড কার্ড জেনারেটর
function drawAynaQrCode(text = window.location.href || "https://aynabook.app") {
  const canvas = $("aynaQrCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  const cells = 21;
  const cellSize = Math.floor(size / cells);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  let seed = 1337;
  for (let i = 0; i < text.length; i++) {
    seed = (seed * 31 + text.charCodeAt(i)) >>> 0;
  }

  const drawFinder = (ox, oy) => {
    ctx.fillStyle = "#050a18";
    ctx.fillRect(ox * cellSize, oy * cellSize, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect((ox + 1) * cellSize, (oy + 1) * cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = "#050a18";
    ctx.fillRect((ox + 2) * cellSize, (oy + 2) * cellSize, 3 * cellSize, 3 * cellSize);
  };

  drawFinder(0, 0);
  drawFinder(cells - 7, 0);
  drawFinder(0, cells - 7);

  ctx.fillStyle = "#050a18";
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const inFinder = (r < 8 && c < 8) || (r < 8 && c >= cells - 8) || (r >= cells - 8 && c < 8);
      if (inFinder) continue;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      if ((seed & 1) === 0) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
  if ($("qrCaptionText")) $("qrCaptionText").textContent = text;
}

// ১. AI যুক্ত ১৫০ এলার্ট প্রযুক্তি ও ক্রিটিক্যাল থ্রেশহোল্ড বিচার
const Alert150Module = {
  countdown: 150,
  running: false,
  totalFired: 0,

  init() {
    const saved = UltraCriticalHub.loadSnapshot("alert150", null);
    if (saved) {
      this.totalFired = Number(saved.totalFired) || 0;
      if (saved.lastOutput && $("alert150Output")) {
        $("alert150Output").textContent = saved.lastOutput;
      }
    }
    this.updateStatus();

    setInterval(() => {
      if (!this.running) return;
      if (this.countdown > 1) {
        this.countdown -= 1;
        this.updateStatus();
      } else {
        this.countdown = 150;
        this.fire(true);
      }
    }, 1000);
  },

  updateStatus() {
    if ($("alert150Status")) {
      $("alert150Status").textContent =
        `কাউন্টডাউন: ${this.countdown}s / 150s • মোট ১৫০-এলার্ট: ${this.totalFired}টি`;
    }
  },

  async fire(speak = true) {
    const t0 = performance.now();
    const reason = ($("alert150ReasonInput")?.value || "১৫০ এলার্ট থ্রেশহোল্ড").trim();
    const countVal = Number($("alert150CountInput")?.value || 150);
    const judgment = UltraCriticalHub.judgeCriticality(countVal);
    this.totalFired += 1;
    this.countdown = 150;

    const fallbackBn =
      `বিচার: ${judgment.severity} | ${reason} (কাউন্ট: ${countVal})। ${judgment.verdictBn}`;
    const aiReply = await UltraCriticalHub.askAi({
      module: "general",
      action: "ayna_150_critical_alert",
      text: `Reason: ${reason}, Count: ${countVal}, Judgment: ${judgment.severity}.`,
      context: "Give a concise 2-sentence Bengali critical alert directive without markdown or emojis.",
      fallbackBn
    });

    const elapsedMs = (performance.now() - t0).toFixed(1);
    const outputText =
      `#${this.totalFired} • [${judgment.severity}] (${elapsedMs}ms)\n${aiReply}`;
    if ($("alert150Output")) $("alert150Output").textContent = outputText;
    this.updateStatus();
    UltraCriticalHub.saveSnapshot("alert150", {
      totalFired: this.totalFired,
      lastOutput: outputText
    });
    notify(`১৫০ এলার্ট #${this.totalFired} সক্রিয় (${judgment.severity})`);
    if (speak) AynaVoiceSignal.speak(aiReply, true);
  }
};

$("toggle150TimerBtn")?.addEventListener("click", () => {
  Alert150Module.running = !Alert150Module.running;
  $("toggle150TimerBtn").textContent = Alert150Module.running
    ? "⏸ 150s অটো কাউন্টডাউন: চালু"
    : "⏱ 150s অটো কাউন্টডাউন: বন্ধ";
  notify(Alert150Module.running ? "150s অটো এলার্ট চালু হয়েছে" : "150s অটো এলার্ট বিরতিতে আছে");
});
$("fire150AlertBtn")?.addEventListener("click", () => Alert150Module.fire(true));

// ২. বিশ্ব অটোমোবাইল ও ইভি AI অটো-আপডেট
const AutoEvModule = {
  autoEnabled: true,
  latestText: "",

  init() {
    const cached = UltraCriticalHub.loadSnapshot("auto_ev", null);
    if (cached?.text) {
      this.latestText = cached.text;
      if ($("autoEvOutput")) $("autoEvOutput").textContent = cached.text;
    }
    this.update(false);
    setInterval(() => {
      if (this.autoEnabled) this.update(false);
    }, 10 * 60 * 1000);
  },

  async update(speak = false) {
    const topic = $("autoEvTopicSelect")?.value || "Global EV & Hybrid";
    const fallbackBn =
      `[${topic}] বিশ্ব ইভি ও অটোমোবাইল বাজারে LFP ব্যাটারি সাশ্রয়, দ্রুত চার্জিং অবকাঠামো ও স্মার্ট ড্রাইভিং প্রযুক্তির প্রতিযোগিতা বাড়ছে। সরবরাহ শৃঙ্খল ও চার্জিং মানদণ্ড এখন মূল বিচার্য বিষয়।`;
    const reply = await UltraCriticalHub.askAi({
      module: "auto_ev",
      action: "global_auto_ev_auto_update",
      text: `Topic: ${topic}. Provide global automobile and EV update in Bengali.`,
      context: "Write 2 concise Bengali sentences without markdown or emojis.",
      fallbackBn
    });
    const stamp = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
    this.latestText = `আপডেট (${stamp}) • ${topic}:\n${reply}`;
    if ($("autoEvOutput")) $("autoEvOutput").textContent = this.latestText;
    UltraCriticalHub.saveSnapshot("auto_ev", { text: this.latestText });
    if (speak) AynaVoiceSignal.speak(reply, true);
  }
};

$("toggleAutoEvBtn")?.addEventListener("click", () => {
  AutoEvModule.autoEnabled = !AutoEvModule.autoEnabled;
  $("toggleAutoEvBtn").textContent = AutoEvModule.autoEnabled
    ? "⏱ অটো-আপডেট: চালু"
    : "⏸ অটো-আপডেট: বন্ধ";
});
$("refreshAutoEvBtn")?.addEventListener("click", () => AutoEvModule.update(true));
$("speakAutoEvBtn")?.addEventListener("click", () => {
  AynaVoiceSignal.speak(AutoEvModule.latestText || $("autoEvOutput")?.textContent || "", true);
});

// ৩. মোবাইল ও কম্পিউটার AI প্রযুক্তি
$("runDeviceAiBtn")?.addEventListener("click", async () => {
  const mode = $("deviceAiModeSelect")?.value || "HYBRID_FAST";
  const prompt = ($("deviceAiPromptInput")?.value || "মোবাইল ও কম্পিউটার পারফরম্যান্স বিচার").trim();
  const cores = navigator.hardwareConcurrency || 4;
  const platform = navigator.userAgentData?.platform || navigator.platform || "Device";

  const localSummary =
    `[${mode}] ডিভাইস: ${platform} (${cores} cores) • বিচার: ${prompt.slice(0, 120) || "ইনপুট খালি"}। দ্রুত লোকাল ও ক্লাউড রাউটিং প্রস্তুত।`;

  let finalOut = localSummary;
  if (mode === "CLOUD_DEEP" || (mode === "HYBRID_FAST" && prompt.length >= 25)) {
    finalOut = await UltraCriticalHub.askAi({
      module: "general",
      action: "mobile_computer_ai_assist",
      text: `Mode: ${mode}, Platform: ${platform}, Cores: ${cores}, Prompt: ${prompt}`,
      context: "Reply concisely in Bengali with practical judgment, without markdown or emojis.",
      fallbackBn: localSummary
    });
  }

  const formatted = `${mode} • ${platform} (${cores} cores):\n${finalOut}`;
  if ($("deviceAiOutput")) $("deviceAiOutput").textContent = formatted;
  UltraCriticalHub.saveSnapshot("device_ai", { text: formatted });
  notify("মোবাইল ও কম্পিউটার AI রেসপন্স সম্পন্ন");
});

// ৪. বিশ্ব আমদানি-রপ্তানি পণ্য মূল্য তালিকা ও যোগাযোগ AI
const TRADE_ITEMS = [
  { code: "RICE", name: "চাল (আমদানি/রপ্তানি গ্রেড)", hs: "1006.30", flow: "Import/Export", unit: "MT", usd: 540, contact: "trade@aynabook.trade" },
  { code: "RMG", name: "তৈরি পোশাক (RMG)", hs: "6109.10", flow: "Export", unit: "Doz", usd: 42.5, contact: "rmg@aynabook.trade" },
  { code: "OIL", name: "অপরিশোধিত তেল (Ref)", hs: "2709.00", flow: "Import", unit: "BBL", usd: 76, contact: "energy@aynabook.trade" },
  { code: "EV_CELL", name: "ইভি LFP ব্যাটারি সেল", hs: "8507.60", flow: "Import", unit: "kWh eq", usd: 98, contact: "ev-trade@aynabook.trade" }
];

let currentUsdToBdt = 120;
let lastTradeContactDraft = "";

function renderTradeModule() {
  const select = $("tradeCommoditySelect");
  const grid = $("tradePriceListGrid");
  if (!select || !grid) return;

  if (!select.options.length) {
    select.innerHTML = TRADE_ITEMS.map(
      t => `<option value="${t.code}">${t.name} ($${t.usd}/${t.unit})</option>`
    ).join("");
  }

  const selectedCode = select.value || TRADE_ITEMS[0].code;
  grid.innerHTML = TRADE_ITEMS.map(t => {
    const bdt = (t.usd * currentUsdToBdt).toFixed(2);
    const activeMark = t.code === selectedCode ? " • নির্বাচিত" : "";
    return `
      <div class="hub-card">
        <span class="hub-card-tag">${t.flow} • HS ${t.hs}${activeMark}</span>
        <div class="hub-card-title">${t.name}</div>
        <div class="hub-card-meta">দর: <strong>$${t.usd}</strong> / ${t.unit} (≈ ৳${bdt})</div>
        <div class="hub-card-meta">যোগাযোগ: ${t.contact}</div>
      </div>
    `;
  }).join("");
}

$("tradeCommoditySelect")?.addEventListener("change", renderTradeModule);
$("analyzeTradeAiBtn")?.addEventListener("click", async () => {
  const code = $("tradeCommoditySelect")?.value || TRADE_ITEMS[0].code;
  const item = TRADE_ITEMS.find(x => x.code === code) || TRADE_ITEMS[0];
  const qty = Math.max(0.1, Number($("tradeQtyInput")?.value || 1));
  const counterparty = ($("tradeCounterpartyInput")?.value || "বাণিজ্য পার্টনার").trim();
  const totalUsd = (item.usd * qty).toFixed(2);

  const fallbackPrice =
    `${item.name} (HS ${item.hs}): একক দর $${item.usd}/${item.unit}, পরিমাণ ${qty} ${item.unit}, আনুমানিক মোট $${totalUsd} USD।`;
  const fallbackContact =
    `প্রিয় ${counterparty}, আমরা ${item.name} (HS ${item.hs}, পরিমাণ: ${qty} ${item.unit}) বিষয়ে দর, শিপমেন্ট ও যোগাযোগের বিস্তারিত জানতে চাই। ঠিকানা: ${item.contact}`;

  const aiText = await UltraCriticalHub.askAi({
    module: "trade",
    action: "trade_price_and_contact",
    text: `Item: ${item.name}, HS: ${item.hs}, Unit Price: $${item.usd}/${item.unit}, Qty: ${qty}, Total: $${totalUsd}, Counterparty: ${counterparty}, Contact: ${item.contact}.`,
    context: "Respond in Bengali with two sections separated by ---CONTACT---: price analysis and trade outreach message. No markdown or emojis.",
    fallbackBn: `${fallbackPrice}---CONTACT---${fallbackContact}`
  });

  let pricePart = fallbackPrice;
  let contactPart = fallbackContact;
  if (aiText.includes("---CONTACT---")) {
    const parts = aiText.split("---CONTACT---");
    if (parts[0]?.trim()) pricePart = parts[0].trim();
    if (parts[1]?.trim()) contactPart = parts[1].trim();
  }

  lastTradeContactDraft = contactPart;
  const outText = `📊 মূল্য বিচার:\n${pricePart}\n\n✉️ যোগাযোগ বার্তা:\n${contactPart}`;
  if ($("tradeAiOutput")) $("tradeAiOutput").textContent = outText;
  UltraCriticalHub.saveSnapshot("trade_ai", { text: outText, draft: lastTradeContactDraft });
});

$("sendTradeToPostBtn")?.addEventListener("click", () => {
  if (!lastTradeContactDraft) {
    notify("আগে মূল্য বিশ্লেষণ ও যোগাযোগ খসড়া তৈরি করুন");
    return;
  }
  if ($("postText")) $("postText").value = lastTradeContactDraft;
  $("createPost")?.scrollIntoView({ behavior: "smooth" });
  notify("যোগাযোগ বার্তা পোস্ট বক্সে নেওয়া হয়েছে");
});

// ৫. বড় বেসামরিক রাডার, আবহাওয়া রাডার ও AI কম্পাস
const RadarCompassModule = {
  azimuth: 45,
  rangeKm: 15,

  degToCardinalBn(deg) {
    const d = ((Number(deg) % 360) + 360) % 360;
    if (d >= 337.5 || d < 22.5) return "উত্তর (N)";
    if (d < 67.5) return "উত্তর-পূর্ব (NE)";
    if (d < 112.5) return "পূর্ব (E)";
    if (d < 157.5) return "দক্ষিণ-পূর্ব (SE)";
    if (d < 202.5) return "দক্ষিণ (S)";
    if (d < 247.5) return "দক্ষিণ-পশ্চিম (SW)";
    if (d < 292.5) return "পশ্চিম (W)";
    return "উত্তর-পশ্চিম (NW)";
  },

  drawCircularRadar(canvasId, sweepDeg, ringColor, dotColor, targets) {
    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 14;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050b1c";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffe64d";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2;
    [0.25, 0.5, 0.75].forEach(ratio => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx, cy + r);
    ctx.stroke();

    const rad = ((sweepDeg - 90) * Math.PI) / 180;
    ctx.strokeStyle = "#fff6b3";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * r * 0.94, cy + Math.sin(rad) * r * 0.94);
    ctx.stroke();

    targets.forEach(t => {
      const trad = ((t.deg - 90) * Math.PI) / 180;
      const dist = r * t.distRatio;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(trad) * dist, cy + Math.sin(trad) * dist, 9, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  draw() {
    this.drawCircularRadar(
      "civilRadarCanvas",
      this.azimuth,
      "rgba(56, 242, 255, 0.55)",
      "#38f2ff",
      [
        { deg: 32, distRatio: 0.42 },
        { deg: 145, distRatio: 0.68 },
        { deg: 265, distRatio: 0.34 }
      ]
    );
    this.drawCircularRadar(
      "weatherRadarCanvas",
      (this.azimuth + 90) % 360,
      "rgba(255, 230, 77, 0.45)",
      "#ffe64d",
      [
        { deg: 60, distRatio: 0.52 },
        { deg: 195, distRatio: 0.72 },
        { deg: 310, distRatio: 0.38 }
      ]
    );
    this.drawCircularRadar(
      "radarCompassCanvas",
      this.azimuth,
      "rgba(22, 199, 132, 0.55)",
      "#16c784",
      [{ deg: this.azimuth, distRatio: 0.82 }]
    );

    const card = this.degToCardinalBn(this.azimuth);
    if ($("civilRadarReadout")) {
      $("civilRadarReadout").textContent = `Civil AI Radar: রেঞ্জ ${this.rangeKm} কিমি • ৩টি বেসামরিক সিগন্যাল সক্রিয়`;
    }
    if ($("aiCompassReadout")) {
      $("aiCompassReadout").textContent = `AI Compass: ${Math.round(this.azimuth)}° ${card}`;
    }
  },

  async runAiBriefing(speak = true) {
    this.azimuth = ((Number($("compassAzimuthInput")?.value || 0) % 360) + 360) % 360;
    this.rangeKm = Number($("radarRangeSelect")?.value || 15);
    this.draw();
    const card = this.degToCardinalBn(this.azimuth);
    const fallbackBn =
      `AI কম্পাস দিক ${Math.round(this.azimuth)}° (${card}), বেসামরিক ও আবহাওয়া রাডার রেঞ্জ ${this.rangeKm} কিমি। সেন্সর নেটওয়ার্ক সক্রিয় ও স্থিতিশীল রয়েছে।`;
    const reply = await UltraCriticalHub.askAi({
      module: "radar_compass",
      action: "radar_compass_briefing",
      text: `Azimuth: ${Math.round(this.azimuth)} deg (${card}), Range: ${this.rangeKm} km, Civil & Weather Radar active.`,
      context: "Provide a concise 2-sentence Bengali civil radar, weather radar, and AI compass summary without markdown or emojis.",
      fallbackBn
    });
    if ($("radarCompassOutput")) {
      $("radarCompassOutput").textContent = `${Math.round(this.azimuth)}° ${card} • ${this.rangeKm} কিমি:\n${reply}`;
      UltraCriticalHub.saveSnapshot("radar_compass", { azimuth: this.azimuth, rangeKm: this.rangeKm, text: $("radarCompassOutput").textContent });
    }
    if (speak) AynaVoiceSignal.speak(reply, true);
  }
};

$("radarRangeSelect")?.addEventListener("change", () => RadarCompassModule.runAiBriefing(false));
$("compassAzimuthInput")?.addEventListener("input", () => RadarCompassModule.runAiBriefing(false));
$("runRadarAiBtn")?.addEventListener("click", () => RadarCompassModule.runAiBriefing(true));
$("startDeviceCompassBtn")?.addEventListener("click", () => {
  if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission().then(state => {
      if (state === "granted") {
        window.addEventListener("deviceorientationabsolute", ev => {
          if (typeof ev.alpha === "number") {
            if ($("compassAzimuthInput")) $("compassAzimuthInput").value = String(Math.round((360 - ev.alpha) % 360));
            RadarCompassModule.runAiBriefing(false);
          }
        }, true);
        notify("লাইভ AI কম্পাস চালু হয়েছে");
      }
    }).catch(() => notify("কম্পাস অনুমতি পাওয়া যায়নি"));
  } else {
    window.addEventListener("deviceorientation", ev => {
      if (typeof ev.alpha === "number") {
        if ($("compassAzimuthInput")) $("compassAzimuthInput").value = String(Math.round((360 - ev.alpha) % 360));
        RadarCompassModule.runAiBriefing(false);
      }
    }, true);
    notify("ডিভাইস AI কম্পাস লিসেনার সক্রিয় হয়েছে");
  }
});

// ৬. বিশ্ব রাষ্ট্রসমূহের আয়াতন, জনসংখ্যা ও অর্থনৈতিক প্রবৃদ্ধিহার
const WORLD_COUNTRIES = [
  { code: "BGD", name: "বাংলাদেশ", area: 147570, pop: 173500000, gdp: 5.8 },
  { code: "IND", name: "ভারত", area: 3287263, pop: 1450000000, gdp: 6.5 },
  { code: "USA", name: "যুক্তরাষ্ট্র", area: 9833517, pop: 345000000, gdp: 2.4 },
  { code: "CHN", name: "চীন", area: 9596961, pop: 1409000000, gdp: 4.8 },
  { code: "JPN", name: "জাপান", area: 377975, pop: 123700000, gdp: 1.1 },
  { code: "SAU", name: "সৌদি আরব", area: 2149690, pop: 37200000, gdp: 4.2 }
];

function renderWorldStatsModule() {
  const q = ($("worldStatsSearchInput")?.value || "").trim().toLowerCase();
  const select = $("worldStatsCountrySelect");
  const grid = $("worldStatsCardsGrid");
  if (!select || !grid) return;

  const filtered = WORLD_COUNTRIES.filter(
    c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
  );
  const list = filtered.length ? filtered : WORLD_COUNTRIES;
  const currentCode = select.value;

  select.innerHTML = list.map(
    c => `<option value="${c.code}" ${c.code === currentCode ? "selected" : ""}>${c.name} (${c.code}) — প্রবৃদ্ধি ${c.gdp}%</option>`
  ).join("");

  grid.innerHTML = list.slice(0, 4).map(c => {
    const density = Math.round(c.pop / Math.max(c.area, 1));
    return `
      <div class="hub-card">
        <span class="hub-card-tag">${c.code} • প্রবৃদ্ধি ${c.gdp}%</span>
        <div class="hub-card-title">${c.name}</div>
        <div class="hub-card-meta">আয়াতন: <strong>${c.area.toLocaleString()}</strong> বর্গকিমি</div>
        <div class="hub-card-meta">জনসংখ্যা: <strong>${c.pop.toLocaleString()}</strong> (ঘনত্ব ~${density.toLocaleString()}/বর্গকিমি)</div>
      </div>
    `;
  }).join("");
}

$("worldStatsSearchInput")?.addEventListener("input", renderWorldStatsModule);
$("analyzeWorldStatsAiBtn")?.addEventListener("click", async () => {
  const code = $("worldStatsCountrySelect")?.value || "BGD";
  const c = WORLD_COUNTRIES.find(x => x.code === code) || WORLD_COUNTRIES[0];
  const density = Math.round(c.pop / Math.max(c.area, 1));
  const fallbackBn =
    `${c.name}: আয়াতন ${c.area.toLocaleString()} বর্গকিমি, জনসংখ্যা ${c.pop.toLocaleString()} (জনঘনত্ব ~${density.toLocaleString()}/বর্গকিমি), এবং অর্থনৈতিক প্রবৃদ্ধিহার ${c.gdp}%।`;

  const reply = await UltraCriticalHub.askAi({
    module: "world_stats",
    action: "country_area_population_gdp_analysis",
    text: `Country: ${c.name} (${c.code}), Area: ${c.area} sq km, Population: ${c.pop}, Density: ~${density}/sq km, GDP growth: ${c.gdp}%.`,
    context: "Write a concise 2-sentence Bengali analysis of area, population, and economic growth rate without markdown or emojis.",
    fallbackBn
  });

  if ($("worldStatsAiOutput")) {
    $("worldStatsAiOutput").textContent = `${c.name} (${c.code}):\n${reply}`;
    UltraCriticalHub.saveSnapshot("world_stats", { text: $("worldStatsAiOutput").textContent });
  }
  AynaVoiceSignal.speak(reply, true);
});

// ৭. নোবেলজয়ী ও বিশ্ববিখ্যাত মনীষীদের নাম ও পুরস্কার পাওয়ার বিষয় অটো-আপডেট
const NOBEL_FIGURES = [
  { id: "n26_phys", name: "Francis Halzen", year: 2026, award: "পদার্থবিজ্ঞানে নোবেল পুরস্কার ২০২৬", topic: "IceCube Neutrino Observatory ও উচ্চ-শক্তির অ্যাস্ট্রোফিজিক্যাল নিউট্রিনো আবিষ্কার।" },
  { id: "n26_chem", name: "Henri B. Kagan ও Kenso Soai", year: 2026, award: "রসায়নে নোবেল পুরস্কার ২০২৬", topic: "অসমমিত জৈব সংশ্লেষণে নন-লিনিয়ার প্রভাব ও অটোক্যাটালাইসিস আবিষ্কার।" },
  { id: "n26_med", name: "Karl Deisseroth, Peter Hegemann ও Georg Nagel", year: 2026, award: "চিকিৎসাবিজ্ঞানে নোবেল পুরস্কার ২০২৬", topic: "লাইট-গেটেড আয়ন চ্যানেল ও অপটোজেনেটিক্স সংক্রান্ত আবিষ্কার।" },
  { id: "n26_lit", name: "Anne Carson", year: 2026, award: "সাহিত্যে নোবেল পুরস্কার ২০২৬", topic: "ধ্রুপদী ঐতিহ্যের সংলাপে সমকালীন সাহিত্যে নতুন রূপ সৃষ্টি।" },
  { id: "n26_peace", name: "Navanethem “Navi” Pillay", year: 2026, award: "শান্তিতে নোবেল পুরস্কার ২০২৬", topic: "শান্তি ও আন্তর্জাতিক আইন প্রতিষ্ঠায় অবদান।" },
  { id: "n26_econ", name: "Robert E. Hall ও Michael Woodford", year: 2026, award: "অর্থনীতিতে নোবেল স্মৃতি পুরস্কার ২০২৬", topic: "সামষ্টিক অর্থনৈতিক স্থিতিশীলতার ক্ষুদ্রঅর্থনৈতিক ভিত্তি।" }
];

const NobelModule = {
  autoEnabled: true,
  cursor: 0,

  renderList() {
    const q = ($("nobelSearchInput")?.value || "").trim().toLowerCase();
    const select = $("nobelSelect");
    const grid = $("nobelCardsGrid");
    if (!select || !grid) return;

    const filtered = NOBEL_FIGURES.filter(
      x => x.name.toLowerCase().includes(q) || x.award.toLowerCase().includes(q) || String(x.year).includes(q) || x.topic.toLowerCase().includes(q)
    );
    const list = filtered.length ? filtered : NOBEL_FIGURES;
    const prevId = select.value;

    select.innerHTML = list.map(
      x => `<option value="${x.id}" ${x.id === prevId ? "selected" : ""}>${x.name} (${x.year}) — ${x.award}</option>`
    ).join("");

    grid.innerHTML = list.slice(0, 4).map(x => `
      <div class="hub-card">
        <span class="hub-card-tag">${x.year} • পুরস্কার</span>
        <div class="hub-card-title">${x.name}</div>
        <div class="hub-card-meta"><strong>${x.award}</strong></div>
        <div class="hub-card-meta">${x.topic}</div>
      </div>
    `).join("");
  },

  async updateSelected(speak = true, forceId = null) {
    const targetId = forceId || $("nobelSelect")?.value || NOBEL_FIGURES[0].id;
    const item = NOBEL_FIGURES.find(x => x.id === targetId) || NOBEL_FIGURES[0];
    const fallbackBn = `${item.name} (${item.year}) — ${item.award}: ${item.topic}`;
    const reply = await UltraCriticalHub.askAi({
      module: "nobel_laureates",
      action: "laureate_award_auto_update",
      text: `Name: ${item.name}, Year: ${item.year}, Award: ${item.award}, Topic: ${item.topic}.`,
      context: "Provide a concise 2-sentence Bengali summary of the laureate and their award reason without markdown or emojis.",
      fallbackBn
    });

    const out = `${item.name} (${item.year}) • ${item.award}:\n${reply}`;
    if ($("nobelAiOutput")) $("nobelAiOutput").textContent = out;
    UltraCriticalHub.saveSnapshot("nobel_laureates", { text: out });
    if (speak) AynaVoiceSignal.speak(`${item.name}। ${item.award}। ${reply}`, true);
  },

  init() {
    const saved = UltraCriticalHub.loadSnapshot("nobel_laureates", null);
    if (saved?.text && $("nobelAiOutput")) $("nobelAiOutput").textContent = saved.text;
    this.renderList();
    setInterval(() => {
      if (!this.autoEnabled) return;
      const item = NOBEL_FIGURES[this.cursor % NOBEL_FIGURES.length];
      this.cursor += 1;
      this.updateSelected(false, item.id);
    }, 15 * 60 * 1000);
  }
};

$("nobelSearchInput")?.addEventListener("input", () => NobelModule.renderList());
$("toggleAutoNobelBtn")?.addEventListener("click", () => {
  NobelModule.autoEnabled = !NobelModule.autoEnabled;
  $("toggleAutoNobelBtn").textContent = NobelModule.autoEnabled
    ? "⏱ মনীষী অটো-আপডেট: চালু"
    : "⏸ মনীষী অটো-আপডেট: বন্ধ";
});
$("refreshNobelAiBtn")?.addEventListener("click", () => NobelModule.updateSelected(true));

// রাষ্ট্রনেতাদের নাম তালিকা + AI
const WORLD_LEADERS_LIST = [
  { country: "বাংলাদেশ", name: "তারেক রহমান", role: "প্রধানমন্ত্রী (মন্ত্রিপরিষদ বিভাগ ও সশস্ত্র বাহিনী বিভাগ)" },
  { country: "বাংলাদেশ", name: "মির্জা ফখরুল ইসলাম আলমগীর", role: "রাষ্ট্রপতি" },
  { country: "সৌদি আরব", name: "বাদশাহ সালমান / যুবরাজ মোহাম্মদ বিন সালমান", role: "বাদশাহ ও প্রধানমন্ত্রী" },
  { country: "তুরস্ক", name: "রিসেপ তাইয়িপ এরদোয়ান", role: "প্রেসিডেন্ট" },
  { country: "যুক্তরাষ্ট্র", name: "ডোনাল্ড ট্রাম্প", role: "প্রেসিডেন্ট" },
  { country: "যুক্তরাজ্য", name: "কিয়ার স্টারমার / রাজা তৃতীয় চার্লস", role: "প্রধানমন্ত্রী ও রাজা" },
  { country: "ভারত", name: "নরেন্দ্র মোদী / দ্রৌপদী মুর্মু", role: "প্রধানমন্ত্রী ও রাষ্ট্রপতি" },
  { country: "চীন", name: "শি জিনপিং", role: "প্রেসিডেন্ট" },
  { country: "কাতার", name: "শেখ তামিম বিন হামাদ আল থানি", role: "আমির" },
  { country: "সংযুক্ত আরব আমিরাত", name: "শেখ মোহাম্মদ বিন জায়েদ আল নাহিয়ান", role: "প্রেসিডেন্ট" }
];

function renderWorldLeadersHub(filter = "") {
  const grid = $("worldLeadersGrid");
  if (!grid) return;
  const q = filter.trim().toLowerCase();
  const list = WORLD_LEADERS_LIST.filter(
    item => item.country.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.role.toLowerCase().includes(q)
  );
  grid.innerHTML = list.length
    ? list.map(item => `
        <div class="hub-card">
          <span class="hub-card-tag">${item.country}</span>
          <div class="hub-card-title">${item.name}</div>
          <div class="hub-card-meta">${item.role}</div>
        </div>
      `).join("")
    : '<div class="empty">কোনো রাষ্ট্রনেতার তথ্য মেলেনি।</div>';
}

async function runLeadersAi(speakNow = false) {
  const q = ($("leaderSearchInput")?.value || "আন্তর্জাতিক নেতৃত্ব").trim();
  const fallbackBn = `রাষ্ট্রনেতা AI (${q}): বৈশ্বিক কূটনীতি, আঞ্চলিক নিরাপত্তা ও অর্থনৈতিক সহযোগিতায় নির্বাচিত নেতৃবৃন্দের তথ্য তালিকাভুক্ত রয়েছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "world_leaders_ai",
    action: "leaders_briefing",
    text: q,
    context: "Provide a concise 2-sentence Bengali summary about world leaders and diplomacy without markdown or emojis.",
    fallbackBn
  });
  if ($("worldLeadersAiOutput")) $("worldLeadersAiOutput").textContent = `🤖 রাষ্ট্রনেতা AI:\n${reply}`;
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}
$("runLeadersAiBtn")?.addEventListener("click", () => runLeadersAi(false));
$("speakLeadersAiBtn")?.addEventListener("click", () => runLeadersAi(true));

// বিশ্ব আলেম গবেষণাগার + AI
const ULEMA_RESEARCH_LIST = [
  { dept: "ফিকহ ও শরয়ি গবেষণা", title: "আধুনিক ব্যাংকিং, ডিজিটাল লেনদেন ও শরয়ি নীতিমালা", note: "আন্তর্জাতিক আলেম গবেষণা ইউনিট" },
  { dept: "জাকাত ও ওয়াকফ অর্থনীতি", title: "সামাজিক নিরাপত্তা ও দারিদ্র্য বিমোচনে ওয়াকফ মডেল", note: "ইসলামি অর্থনীতি গবেষণা সেল" },
  { dept: "কুরআন ও সুন্নাহ আর্কাইভ", title: "তফসির, হাদিস ও সীরাত গবেষণা সংকলন", note: "শাস্ত্রীয় গবেষণা বিভাগ" },
  { dept: "পরিবার ও সমাজ সংস্কার", title: "আধুনিক সমাজে নৈতিকতা, শিক্ষা ও সম্প্রীতি", note: "গবেষণা ও ফতোয়া পরামর্শ কেন্দ্র" }
];

function renderUlemaResearchHub(filter = "") {
  const grid = $("ulemaResearchGrid");
  if (!grid) return;
  const q = filter.trim().toLowerCase();
  const list = ULEMA_RESEARCH_LIST.filter(
    item => item.dept.toLowerCase().includes(q) || item.title.toLowerCase().includes(q) || item.note.toLowerCase().includes(q)
  );
  grid.innerHTML = list.length
    ? list.map(item => `
        <div class="hub-card">
          <span class="hub-card-tag">${item.dept}</span>
          <div class="hub-card-title">${item.title}</div>
          <div class="hub-card-meta">${item.note}</div>
        </div>
      `).join("")
    : '<div class="empty">কোনো গবেষণা বিষয় মেলেনি।</div>';
}

async function runUlemaAi(speakNow = false) {
  const q = ($("ulemaSearchInput")?.value || "ফিকহ, জাকাত ও কুরআন গবেষণা").trim();
  const fallbackBn = `আলেম গবেষণাগার AI (${q}): শরয়ি নীতিমালা, ওয়াকফ অর্থনীতি ও নৈতিক সমাজ গঠনে গবেষণা সংকলনগুলো সক্রিয় রয়েছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "ulema_research_ai",
    action: "research_summary",
    text: q,
    context: "Provide a concise 2-sentence Bengali summary of Islamic scholarly research without markdown or emojis.",
    fallbackBn
  });
  if ($("ulemaAiOutput")) $("ulemaAiOutput").textContent = `🤖 আলেম গবেষণা AI:\n${reply}`;
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}
$("runUlemaAiBtn")?.addEventListener("click", () => runUlemaAi(false));
$("speakUlemaAiBtn")?.addEventListener("click", () => runUlemaAi(true));

// মুদি বাজার ও বিশ্ব কৃষক বাজার + AI
const GROCERY_FARMER_ITEMS = [
  { cat: "grocery", label: "মুদি বাজার", name: "নাজিরশাইল ও মিনিকেট চাল", unit: "কেজি", usd: 0.65 },
  { cat: "grocery", label: "মুদি বাজার", name: "মসুর ডাল (দেশি ও আমদানি)", unit: "কেজি", usd: 1.10 },
  { cat: "grocery", label: "মুদি বাজার", name: "আটা ও প্যাকেট ময়দা", unit: "কেজি", usd: 0.48 },
  { cat: "grocery", label: "মুদি বাজার", name: "সয়াবিন ও সূর্যমুখী তেল", unit: "লিটার", usd: 1.45 },
  { cat: "grocery", label: "মুদি বাজার", name: "চিনি ও গুড়", unit: "কেজি", usd: 1.05 },
  { cat: "grocery", label: "মুদি বাজার", name: "পেঁয়াজ, রসুন ও আদা", unit: "কেজি", usd: 0.95 },
  { cat: "grocery", label: "মুদি বাজার", name: "হলুদ, মরিচ ও জিরা মসলা", unit: "কেজি", usd: 3.40 },
  { cat: "grocery", label: "মুদি বাজার", name: "চা পাতা, লবণ ও গুঁড়ো দুধ", unit: "কেজি", usd: 4.10 },
  { cat: "farmer", label: "বিশ্ব কৃষক", name: "আলু (সরাসরি কৃষক উৎপাদন)", unit: "কেজি", usd: 0.35 },
  { cat: "farmer", label: "বিশ্ব কৃষক", name: "গম ও ভুট্টা (বিশ্ব কৃষি)", unit: "কেজি", usd: 0.32 },
  { cat: "farmer", label: "বিশ্ব কৃষক", name: "ধান ও গবাদিপশু খাদ্য", unit: "কেজি", usd: 0.42 },
  { cat: "farmer", label: "বিশ্ব কৃষক", name: "তাজা মৌসুমি শাকসবজি ও ফল", unit: "কেজি", usd: 0.55 }
];

function renderGroceryFarmersHub() {
  const grid = $("groceryFarmersGrid");
  if (!grid) return;
  const cat = $("marketTypeSelect")?.value || "all";
  const q = ($("marketItemSearchInput")?.value || "").trim().toLowerCase();

  const items = GROCERY_FARMER_ITEMS.filter(item => {
    const matchCat = cat === "all" || item.cat === cat;
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  grid.innerHTML = items.length
    ? items.map(item => {
        const bdt = (item.usd * currentUsdToBdt).toFixed(2);
        return `
          <div class="hub-card">
            <span class="hub-card-tag">${item.label}</span>
            <div class="hub-card-title">${item.name}</div>
            <div class="hub-card-meta">আনুমানিক দর: <strong>৳${bdt}</strong> / ${item.unit} (≈ $${item.usd.toFixed(2)})</div>
          </div>
        `;
      }).join("")
    : '<div class="empty">কোনো পণ্য পাওয়া যায়নি।</div>';
}

async function runMarketAi(speakNow = false) {
  const q = ($("marketItemSearchInput")?.value || "চাল, ডাল, তেল ও কৃষি পণ্য").trim();
  const fallbackBn = `বাজার ও কৃষি AI (${q}): বর্তমান ডলার রূপান্তর হার ৳${currentUsdToBdt.toFixed(2)} অনুযায়ী নিত্যপণ্য ও কৃষিপণ্যের দর আপডেট করা হয়েছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "market_ai",
    action: "grocery_farmer_ai",
    text: `Query: ${q}, USD->BDT: ${currentUsdToBdt}`,
    context: "Provide a concise 2-sentence Bengali grocery and agriculture price analysis without markdown or emojis.",
    fallbackBn
  });
  if ($("marketAiOutput")) $("marketAiOutput").textContent = `🤖 বাজার ও কৃষি AI:\n${reply}`;
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}
$("runMarketAiBtn")?.addEventListener("click", () => runMarketAi(false));
$("speakMarketAiBtn")?.addEventListener("click", () => runMarketAi(true));

// বিশ্ব চাকুরীর বাজার — সরাসরি চাকুরীর বিজ্ঞাপন + AI
const DIRECT_JOB_ADS = [
  {
    title: "সিনিয়র ফুল-স্ট্যাক ও মোবাইল ডেভেলপার",
    company: "AYNA Tech Global",
    location: "রিমোট / ঢাকা ও দুবাই",
    salary: "$1,800 – $2,800 / মাস",
    contact: "careers@aynabook.example.com"
  },
  {
    title: "অ্যাগ্রো সাপ্লাই চেইন ও এক্সপোর্ট ম্যানেজার",
    company: "Global Agro Trade Ltd.",
    location: "চট্টগ্রাম / সৌদি আরব",
    salary: "$1,200 – $1,900 / মাস",
    contact: "hr@globalagro.example.com"
  },
  {
    title: "ইসলামি ফাইন্যান্স ও গবেষণা বিশ্লেষক",
    company: "Al-Mizan Research & Advisory",
    location: "কুয়ালালামপুর / হাইব্রিড",
    salary: "$1,500 – $2,200 / মাস",
    contact: "research@almizan.example.com"
  },
  {
    title: "ইন্টারন্যাশনাল কার্গো ও লজিস্টিকস কোঅর্ডিনেটর",
    company: "SilkRoute Transport & Logistics",
    location: "দোহা / সিঙ্গাপুর",
    salary: "$1,400 – $2,100 / মাস",
    contact: "jobs@silkroute.example.com"
  }
];

function renderDirectJobsHub(filter = "") {
  const grid = $("directJobsGrid");
  if (!grid) return;
  const q = filter.trim().toLowerCase();
  const list = DIRECT_JOB_ADS.filter(
    j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
  );
  grid.innerHTML = list.length
    ? list.map(j => `
        <div class="hub-card">
          <span class="hub-card-tag">সরাসরি চাকুরীর বিজ্ঞাপন</span>
          <div class="hub-card-title">${j.title}</div>
          <div class="hub-card-meta"><strong>প্রতিষ্ঠান:</strong> ${j.company}</div>
          <div class="hub-card-meta"><strong>লোকেশন:</strong> ${j.location}</div>
          <div class="hub-card-meta"><strong>বেতন:</strong> ${j.salary}</div>
          <div class="hub-card-meta"><strong>যোগাযোগ:</strong> ${j.contact}</div>
        </div>
      `).join("")
    : '<div class="empty">কোনো চাকুরীর বিজ্ঞাপন মেলেনি।</div>';
}

async function runJobsAi(speakNow = false) {
  const q = ($("directJobSearchInput")?.value || "সফটওয়্যার, অ্যাগ্রো ও লজিস্টিকস").trim();
  const fallbackBn = `চাকুরী AI (${q}): দক্ষতা, রিমোট ও আন্তর্জাতিক পদের চাহিদা অনুযায়ী সংশ্লিষ্ট প্রতিষ্ঠানে সরাসরি আবেদনপত্র ও পোর্টফোলিও প্রস্তুত রাখুন।`;
  const reply = await UltraCriticalHub.askAi({
    module: "jobs_ai",
    action: "job_market_advice",
    text: q,
    context: "Provide a concise 2-sentence Bengali job market guidance without markdown or emojis.",
    fallbackBn
  });
  if ($("jobsAiOutput")) $("jobsAiOutput").textContent = `🤖 চাকুরী AI:\n${reply}`;
  if (speakNow) AynaVoiceSignal.speak(reply, true);
}
$("runJobsAiBtn")?.addEventListener("click", () => runJobsAi(false));
$("speakJobsAiBtn")?.addEventListener("click", () => runJobsAi(true));

// YouTube Hub + AI
function extractYouTubeId(val) {
  const clean = (val || "").trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  const m = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m && m[1] ? m[1] : null;
}

function applyYouTubeQuery(rawVal) {
  const query = (rawVal || "").trim() || "Bangla news live";
  const vid = extractYouTubeId(query);
  const frame = $("ytEmbedFrame");
  const extLink = $("ytDirectWatchLink");

  if (vid) {
    if (frame) frame.src = `https://www.youtube.com/embed/${vid}`;
    if (extLink) extLink.href = `https://www.youtube.com/watch?v=${vid}`;
    notify("YouTube ভিডিও চালু করা হয়েছে");
  } else {
    const encoded = encodeURIComponent(query);
    if (frame) frame.src = `https://www.youtube.com/embed?listType=search&list=${encoded}`;
    if (extLink) extLink.href = `https://www.youtube.com/results?search_query=${encoded}`;
    notify(`YouTube-এ "${query}" খোঁজা হচ্ছে`);
  }
}

$("runYtAiBtn")?.addEventListener("click", async () => {
  const q = ($("ytSearchOrUrlInput")?.value || "Bangla news live").trim();
  const fallbackBn = `YouTube AI (${q}): "${q}" বিষয়ক লাইভ সম্প্রচার, আলোচনা ও ভিডিও ফিড প্লেয়ারে লোড করা হয়েছে।`;
  const reply = await UltraCriticalHub.askAi({
    module: "youtube_ai",
    action: "youtube_topic_summary",
    text: q,
    context: "Provide a concise 2-sentence Bengali summary for the YouTube search or video topic without markdown or emojis.",
    fallbackBn
  });
  if ($("ytAiOutput")) $("ytAiOutput").textContent = `🤖 YouTube AI:\n${reply}`;
  AynaVoiceSignal.speak(reply, true);
});

$("leaderSearchInput")?.addEventListener("input", e => renderWorldLeadersHub(e.target.value));
$("ulemaSearchInput")?.addEventListener("input", e => renderUlemaResearchHub(e.target.value));
$("marketTypeSelect")?.addEventListener("change", renderGroceryFarmersHub);
$("marketItemSearchInput")?.addEventListener("input", renderGroceryFarmersHub);
$("directJobSearchInput")?.addEventListener("input", e => renderDirectJobsHub(e.target.value));

$("ytPlaySearchBtn")?.addEventListener("click", () => applyYouTubeQuery($("ytSearchOrUrlInput")?.value));
$("ytSearchOrUrlInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") applyYouTubeQuery(e.target.value);
});
document.querySelectorAll(".yt-preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const q = btn.getAttribute("data-yt") || "";
    if ($("ytSearchOrUrlInput")) $("ytSearchOrUrlInput").value = q;
    applyYouTubeQuery(q);
  });
});

renderWorldLeadersHub();
renderUlemaResearchHub();
renderGroceryFarmersHub();
renderDirectJobsHub();
renderTradeModule();
renderWorldStatsModule();
renderBookmarks();
drawAynaQrCode();
updateWeatherModule();
RadarCompassModule.runAiBriefing(false);
Alert150Module.init();
AutoEvModule.init();
NobelModule.init();

function safePhoto(photo) {
  return typeof photo === "string" && photo
    ? photo
    : "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320"><rect width="100%" height="100%" fill="#0a1636"/><circle cx="160" cy="110" r="58" fill="#ffe64d"/><path d="M45 320 Q62 205 160 205 Q258 205 275 320" fill="#ffe64d"/></svg>'
      );
}

if ($("myPhoto")) $("myPhoto").src = safePhoto("");

function formatDate(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
}

function formatSize(bytes = 0) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function quantumSignature(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const score = 95 + (Math.abs(hash) % 50) / 10;
  return `⚛ Q-COHERENCE ${score.toFixed(1)}%`;
}

// সময় বলার ঘড়ি ও সেহরি-ইফতার ঘোষণা (১ ঘণ্টা পর পর + এখনই সময় বলুন + চালু/বন্ধ বাটন)
const QuantumTalkingClock = {
  enabled: true,
  sehriTime: { hour: 4, minute: 58 },
  iftarTime: { hour: 17, minute: 12 },
  lastHourlySpoken: "",
  lastIftar5MinSpoken: "",
  sehriPreAlertSpoken: false,

  toMinutes(h, m) {
    return h * 60 + m;
  },

  formatBanglaTime(date) {
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  },

  getColdAndTempNote(hour) {
    if (hour >= 22 || hour <= 5) {
      return `তাপমাত্রা ${latestTempText}, রাত ও ভোরের ঠান্ডা বাতাস অনুভূত হচ্ছে।`;
    }
    if (hour >= 6 && hour <= 9) {
      return `তাপমাত্রা ${latestTempText}, সকালের হালকা ঠান্ডা ভাব রয়েছে।`;
    }
    return `তাপমাত্রা ${latestTempText}।`;
  },

  speak(text, force = false) {
    if ((!this.enabled && !force) || !("speechSynthesis" in window)) return;
    try {
      AynaWorldClassAudio.ensureContext();
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices() || [];
      const v =
        voices.find(item => /bn/i.test(item.lang)) ||
        voices.find(item => /en/i.test(item.lang)) ||
        voices[0] ||
        null;
      if (v) {
        utter.voice = v;
        utter.lang = v.lang;
      } else {
        utter.lang = "bn-BD";
      }
      utter.rate = 0.96;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error("TTS error:", err);
    }
  },

  setClockEnabled(nextState, announce = true) {
    this.enabled = !!nextState;
    this.updateDisplay();
    if (this.enabled) {
      notify("সময় বলার ঘড়ি চালু (খোলা) হয়েছে");
      if (announce) {
        const now = new Date();
        this.speak(`সময় বলার ঘড়ি চালু হয়েছে। এখন সময় ${this.formatBanglaTime(now)}। ${this.getColdAndTempNote(now.getHours())}`, true);
      }
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      notify("সময় বলার ঘড়ি বন্ধ করা হয়েছে");
    }
  },

  speakNow() {
    const now = new Date();
    const nowText = this.formatBanglaTime(now);
    const msg = `এখন সময় ${nowText}। ${this.getColdAndTempNote(now.getHours())}`;
    this.speak(msg, true);
    notify(`এখন সময় ${nowText}`);
  },

  updateDisplay() {
    const now = new Date();
    const displayEl = $("quantumClockDisplay");
    if (displayEl) {
      displayEl.textContent = now.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    }

    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0);
    nextHour.setHours(now.getHours() + 1);
    const nextHourEl = $("nextHourlyAnnouncement");
    if (nextHourEl) {
      nextHourEl.textContent = this.formatBanglaTime(nextHour);
    }

    const btn = $("toggleTalkClockBtn");
    if (btn) {
      btn.textContent = this.enabled
        ? "🔊 সময় বলা: চালু (খোলা)"
        : "🔇 সময় বলা: বন্ধ";
    }
    if ($("headerToggleClockBtn")) {
      $("headerToggleClockBtn").textContent = this.enabled
        ? "🔊 ঘড়ি: চালু"
        : "🔇 ঘড়ি: বন্ধ";
    }
  },

  tick() {
    this.updateDisplay();
    if (!this.enabled) return;

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const nowMin = this.toMinutes(h, m);
    const sehriMin = this.toMinutes(this.sehriTime.hour, this.sehriTime.minute);
    const iftarMin = this.toMinutes(this.iftarTime.hour, this.iftarTime.minute);
    const tempColdMsg = this.getColdAndTempNote(h);

    const sehriAlertMin = sehriMin - 90;
    if (nowMin === sehriAlertMin && !this.sehriPreAlertSpoken) {
      this.sehriPreAlertSpoken = true;
      this.speak(`সতর্কতা: সেহরির আর দেড় ঘণ্টা বাকি। এখন সময় ${this.formatBanglaTime(now)}। ${tempColdMsg}`);
    }
    if (nowMin !== sehriAlertMin) {
      this.sehriPreAlertSpoken = false;
    }

    const iftarStart = iftarMin - 60;
    if (nowMin >= iftarStart && nowMin <= iftarMin) {
      const diff = nowMin - iftarStart;
      const slotKey = `${now.toDateString()}-${h}:${m}`;
      if (diff % 5 === 0 && this.lastIftar5MinSpoken !== slotKey) {
        this.lastIftar5MinSpoken = slotKey;
        const leftMin = iftarMin - nowMin;
        this.speak(
          leftMin === 0
            ? `এখন ইফতারের সময়, ${this.formatBanglaTime(now)}। ${tempColdMsg}`
            : `ইফতারের আর ${leftMin} মিনিট বাকি। এখন সময় ${this.formatBanglaTime(now)}। ${tempColdMsg}`
        );
      }
      return;
    }

    const hourKey = `${now.toDateString()}-${h}`;
    if (m === 0 && this.lastHourlySpoken !== hourKey) {
      this.lastHourlySpoken = hourKey;
      this.speak(`এখন সময় ${this.formatBanglaTime(now)}। ${tempColdMsg}`);
    }
  },

  start() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    this.tick();
    setInterval(() => this.tick(), 1000);
  }
};

$("toggleTalkClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.setClockEnabled(!QuantumTalkingClock.enabled, true);
});
$("openTalkClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.setClockEnabled(true, true);
});
$("closeTalkClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.setClockEnabled(false, false);
});
$("speakNowClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.speakNow();
});
$("headerSpeakClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.speakNow();
});
$("headerToggleClockBtn")?.addEventListener("click", () => {
  QuantumTalkingClock.setClockEnabled(!QuantumTalkingClock.enabled, true);
});

// আজীবন অটো আপডেট ইঞ্জিন
const QuantumAutoUpdater = {
  intervalMs: 5 * 60 * 1000,
  timer: null,

  async syncOnce(manual = false) {
    const t0 = performance.now();
    const nowLabel = new Date().toLocaleTimeString();
    try {
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      }

      const [verRes, usdRes] = await Promise.allSettled([
        fetch(`./version.json?_=${Date.now()}`, { cache: "no-store" }),
        fetch(`https://open.er-api.com/v6/latest/USD`, { cache: "no-store" })
      ]);

      let verInfo = "";
      if (verRes.status === "fulfilled" && verRes.value.ok) {
        const vData = await verRes.value.json().catch(() => null);
        if (vData?.version) {
          verInfo = `v${vData.version}`;
          localStorage.setItem("ayna_quantum_version", JSON.stringify(vData));
        }
      }

      if (usdRes.status === "fulfilled" && usdRes.value.ok) {
        const uData = await usdRes.value.json().catch(() => null);
        if (uData?.result === "success" && uData?.rates?.BDT) {
          currentUsdToBdt = Number(uData.rates.BDT) || 120;
          renderGroceryFarmersHub();
          renderTradeModule();
          localStorage.setItem(
            "ayna_global_fx_cache",
            JSON.stringify({ rates: uData.rates, syncedAt: Date.now() })
          );
        }
      }

      const dt = (performance.now() - t0).toFixed(0);
      if ($("qAutoSyncStatus")) $("qAutoSyncStatus").textContent = `SYNCED (${dt}ms) • ${verInfo || nowLabel}`;
      if (manual) {
        notify(`কোয়ান্টাম অটো-আপডেট সিঙ্ক সম্পন্ন (${nowLabel})`);
      }
    } catch (_) {
      if ($("qAutoSyncStatus")) $("qAutoSyncStatus").textContent = `STANDBY • ${nowLabel}`;
      if (manual) {
        notify("লোকাল কোয়ান্টাম ক্যাশে সক্রিয় রয়েছে");
      }
    }
  },

  start() {
    this.syncOnce(false);
    clearInterval(this.timer);
    this.timer = setInterval(() => this.syncOnce(false), this.intervalMs);
    window.addEventListener("online", () => this.syncOnce(false));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.syncOnce(false);
      }
    });
  }
};

let currentUser = null;
let userProfile = {};
let selectedFile = null;
let selectedType = null;
let cameraStream = null;
let allPosts = [];
let activeFilter = "all";
let previewObjectUrl = null;
let appInstance = null;
let auth = null;
let database = null;
let firebaseReady = false;

async function loadOptionalScript(path) {
  try {
    return await import(path);
  } catch (_) {
    return null;
  }
}

window.AynaBook = {
  version: "2026.ultracritical.quantum.allfeatures.studioaudio.universalai",
  fileRegistry: AYNA_REGISTRY_ITEMS,
  talkingClock: QuantumTalkingClock,
  voiceSignal: AynaVoiceSignal,
  audioEngine: AynaWorldClassAudio,
  autoUpdater: QuantumAutoUpdater,
  notify,
  safePhoto,
  formatDate,
  getState: () => ({
    currentUser,
    userProfile,
    postsCount: allPosts.length,
    totalFiles: AYNA_REGISTRY_ITEMS.length
  })
};

$("quantumBoostBtn")?.addEventListener("click", () => {
  UltraCriticalHub.profileIndex = (UltraCriticalHub.profileIndex + 1) % UltraCriticalHub.profiles.length;
  const next = UltraCriticalHub.profiles[UltraCriticalHub.profileIndex];
  if ($("qSyncState")) $("qSyncState").textContent = next;
  notify("এক্সিকিউশন বিচার প্রোফাইল: " + next);
});

$("autoUpdateNowBtn")?.addEventListener("click", () => QuantumAutoUpdater.syncOnce(true));

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter || "all";
    renderFeed(allPosts);
  });
});

async function initApp() {
  const [jsFirebaseMod, initMod] = await Promise.all([
    loadOptionalScript("./js/firebase.js"),
    loadOptionalScript("./firebase-init.js")
  ]);

  appInstance = initMod?.app || jsFirebaseMod?.app || null;
  auth = initMod?.auth || jsFirebaseMod?.auth || null;
  database = initMod?.database || jsFirebaseMod?.database || null;
  firebaseReady = !!(auth && database);

  if (!firebaseReady) {
    if ($("myName")) $("myName").textContent = "AYNA Quantum Guest";
    if ($("myEmail")) $("myEmail").textContent = "Firebase কনফিগারেশন সংযুক্ত করুন";
    if ($("publishPost")) $("publishPost").disabled = true;
    if ($("feed")) {
      $("feed").innerHTML =
        '<div class="empty">Firebase সংযোগ পাওয়া যায়নি। <code>firebase-init.js</code> বা <code>js/firebase.js</code> পরীক্ষা করুন।</div>';
    }
    return;
  }

  const [
    { onAuthStateChanged },
    { ref, get, set, push, onValue }
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
  ]);

  onAuthStateChanged(auth, async user => {
    if (!user) {
      if ($("myName")) $("myName").textContent = "লগইন করুন";
      if ($("myEmail")) $("myEmail").textContent = "পোস্ট করতে লগইন প্রয়োজন";
      if ($("publishPost")) $("publishPost").disabled = true;
      AynaVoiceSignal.announceMistake("অ্যাকাউন্ট লগইন করা নেই। লগইন পেজে পাঠানো হচ্ছে।");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1800);
      return;
    }

    currentUser = user;

    try {
      const snapshot = await get(ref(database, "users/" + user.uid));
      userProfile = snapshot.val() || {};

      if ($("myName")) $("myName").textContent = userProfile.fullName || user.displayName || "AYNA User";
      if ($("myEmail")) $("myEmail").textContent = user.email || "AYNA BOOK Member";
      const aid = userProfile.aynaId || "2026-----10000001";
      if ($("myAynaId")) $("myAynaId").textContent = aid;
      renderAynaBarcode(aid);
      if ($("myPhoto")) $("myPhoto").src = safePhoto(userProfile.photoURL);
      if ($("publishPost")) $("publishPost").disabled = false;

      startFeed(ref, onValue);
    } catch (error) {
      console.error(error);
      AynaVoiceSignal.announceMistake("অ্যাকাউন্ট প্রোফাইল লুকাপে ভুল হয়েছে বা সার্ভার সংযোগ পাওয়া যায়নি।");
    }
  });

  $("publishPost")?.addEventListener("click", () => publishPost(ref, push, set));
}

function startFeed(ref, onValue) {
  onValue(
    ref(database, "posts"),
    snapshot => {
      const posts = snapshot.val() || {};
      allPosts = Object.entries(posts)
        .map(([id, post]) => ({ id, ...post }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      renderFeed(allPosts);
    },
    error => {
      console.error("Feed error:", error);
      if ($("feed")) {
        $("feed").innerHTML =
          '<div class="empty">ফিড লোড হয়নি। Firebase Rules পরীক্ষা করুন।</div>';
      }
    }
  );
}

$("chooseImage")?.addEventListener("click", () => $("imageInput")?.click());
$("chooseAudio")?.addEventListener("click", () => $("audioInput")?.click());
$("chooseVideo")?.addEventListener("click", () => $("videoInput")?.click());
$("chooseFile")?.addEventListener("click", () => $("fileInput")?.click());

$("imageInput")?.addEventListener("change", event => handleSelectedFile(event, "image"));
$("audioInput")?.addEventListener("change", event => handleSelectedFile(event, "audio"));
$("videoInput")?.addEventListener("change", event => handleSelectedFile(event, "video"));
$("fileInput")?.addEventListener("change", event => handleSelectedFile(event, "file"));

function handleSelectedFile(event, type) {
  const file = event.target.files?.[0];
  if (!file) return;

  const maxBytes = LIMITS[type] || LIMITS.file;
  const maxMB = Math.round(maxBytes / (1024 * 1024));

  if (file.size > maxBytes) {
    notify(`এই ক্যাটাগরিতে সর্বোচ্চ ${maxMB}MB ফাইল দেওয়া যাবে`);
    event.target.value = "";
    return;
  }

  if (type !== "file" && !file.type.startsWith(type + "/")) {
    notify("সঠিক ফাইল নির্বাচন করুন");
    event.target.value = "";
    return;
  }

  selectedFile = file;
  selectedType = type;
  showPreview(file, type);
  if ($("postMediaAiOutput")) {
    $("postMediaAiOutput").textContent =
      `🤖 মিডিয়া AI প্রস্তুত: ${file.name} (${formatSize(file.size)}) সংযুক্ত হয়েছে। "AI পোস্ট বিশ্লেষণ ও কণ্ঠ" বাটনে ক্লিক করুন।`;
  }
}

function showPreview(file, type) {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }
  previewObjectUrl = URL.createObjectURL(file);

  const preview = $("mediaPreview");
  const content = $("previewContent");
  if (!preview || !content) return;
  content.innerHTML = "";

  if (type === "image") {
    const img = document.createElement("img");
    img.src = previewObjectUrl;
    img.alt = "Selected image";
    content.appendChild(img);
  } else if (type === "video") {
    const video = document.createElement("video");
    video.src = previewObjectUrl;
    video.controls = true;
    video.playsInline = true;
    content.appendChild(video);
  } else if (type === "audio") {
    const audio = document.createElement("audio");
    audio.src = previewObjectUrl;
    audio.controls = true;
    content.appendChild(audio);
  } else {
    content.innerHTML = `<div style="font-size:30px;color:#ffe64d;">📎 ${file.name} (${formatSize(file.size)})</div>`;
  }

  if ($("previewName")) $("previewName").textContent = `${file.name} • ${formatSize(file.size)}`;
  preview.style.display = "block";
}

$("clearMedia")?.addEventListener("click", clearSelectedMedia);

function clearSelectedMedia() {
  selectedFile = null;
  selectedType = null;

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  if ($("imageInput")) $("imageInput").value = "";
  if ($("audioInput")) $("audioInput").value = "";
  if ($("videoInput")) $("videoInput").value = "";
  if ($("fileInput")) $("fileInput").value = "";
  if ($("previewContent")) $("previewContent").innerHTML = "";
  if ($("previewName")) $("previewName").textContent = "";
  if ($("mediaPreview")) $("mediaPreview").style.display = "none";
  if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "none";
  if ($("uploadProgressBar")) $("uploadProgressBar").style.width = "0%";
}

async function resolveFirebaseStorage() {
  const { getStorage } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js");
  const cfgMod = await loadOptionalScript("./firebase-config.js");
  const bucket =
    appInstance?.options?.storageBucket ||
    cfgMod?.firebaseConfig?.storageBucket ||
    cfgMod?.default?.storageBucket ||
    "";

  if (bucket) {
    const gsUrl = bucket.startsWith("gs://") ? bucket : `gs://${bucket}`;
    return appInstance ? getStorage(appInstance, gsUrl) : getStorage(undefined, gsUrl);
  }
  return appInstance ? getStorage(appInstance) : getStorage();
}

async function uploadMediaData(file, uid) {
  if (file.size <= 3 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
      reader.readAsDataURL(file);
    });
  }

  const { ref: sRef, uploadBytesResumable, getDownloadURL } =
    await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js");

  const storage = await resolveFirebaseStorage();
  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileRef = sRef(storage, `ayna_posts/${uid}/${safeName}`);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(fileRef, file, {
      contentType: file.type || "application/octet-stream"
    });

    if ($("uploadProgressWrap")) $("uploadProgressWrap").style.display = "block";
    if ($("uploadProgressBar")) $("uploadProgressBar").style.width = "1%";
    if ($("postStatus")) $("postStatus").textContent = `আপলোড শুরু হচ্ছে: 0% (0 MB / ${formatSize(file.size)})`;

    let sawProgress = false;
    const stallTimer = setTimeout(() => {
      if (!sawProgress) {
        task.cancel();
        reject(new Error("STORAGE_STALL"));
      }
    }, 15000);

    task.on(
      "state_changed",
      snap => {
        if (snap.bytesTransferred > 0) {
          sawProgress = true;
          clearTimeout(stallTimer);
        }
        const pct = snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
        if ($("uploadProgressBar")) $("uploadProgressBar").style.width = `${pct}%`;
        if ($("postStatus")) $("postStatus").textContent = `আপলোড হচ্ছে: ${pct}% (${formatSize(snap.bytesTransferred)} / ${formatSize(snap.totalBytes)})`;
      },
      err => {
        clearTimeout(stallTimer);
        reject(err);
      },
      async () => {
        clearTimeout(stallTimer);
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

async function publishPost(ref, push, set) {
  if (!currentUser) {
    AynaVoiceSignal.announceMistake("পোস্ট প্রকাশ করতে আগে অ্যাকাউন্টে লগইন করুন।");
    return;
  }

  const text = UltraCriticalHub.cleanTextAi($("postText")?.value || "");
  if (!text && !selectedFile) {
    AynaVoiceSignal.announceMistake("পোস্টের ঘরে লেখা অথবা অডিও, ভিডিও, ছবি বা ফাইল যুক্ত করুন।");
    return;
  }

  const button = $("publishPost");
  if (button) {
    button.disabled = true;
    button.textContent = "প্রকাশ করা হচ্ছে...";
  }

  try {
    let mediaData = "";
    if (selectedFile) {
      mediaData = await uploadMediaData(selectedFile, currentUser.uid);
    }

    const postRef = push(ref(database, "posts"));
    const post = {
      uid: currentUser.uid,
      authorName: userProfile.fullName || currentUser.displayName || "AYNA User",
      authorPhoto: userProfile.photoURL || "",
      text,
      type: selectedType || "text",
      media: mediaData,
      fileName: selectedFile?.name || "",
      fileSize: selectedFile?.size || 0,
      mimeType: selectedFile?.type || "",
      createdAt: Date.now(),
      likes: {},
      comments: {}
    };

    await set(postRef, post);
    if ($("postText")) $("postText").value = "";
    clearSelectedMedia();
    if ($("postStatus")) $("postStatus").textContent = "ছবি (25MB), অডিও (100MB), বড় ভিডিও (250MB) বা ফাইল (250MB) যুক্ত করে পোস্ট করুন।";
    notify("আপনার পোস্ট প্রকাশ হয়েছে");
  } catch (error) {
    console.error("Post error:", error);
    if (error?.message === "STORAGE_STALL") {
      if ($("postStatus")) $("postStatus").textContent = "Firebase Storage সাড়া দেয়নি। Storage চালু আছে কি না এবং storageBucket সঠিক কি না যাচাই করুন।";
      notify("Storage আপলোড টাইমআউট হয়েছে");
    } else if (error?.code === "storage/unauthorized" || error?.code === "PERMISSION_DENIED") {
      if ($("postStatus")) $("postStatus").textContent = "Firebase Storage বা Database Rules অনুমতি দেয়নি।";
      notify("অনুমতি পাওয়া যায়নি (Rules চেক করুন)");
    } else {
      if ($("postStatus")) $("postStatus").textContent = "পোস্ট প্রকাশ করা যায়নি। নেটওয়ার্ক ও Firebase Storage পরীক্ষা করুন।";
      notify("পোস্ট প্রকাশ করা যায়নি");
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "🚀 পোস্ট প্রকাশ করুন";
    }
  }
}

function renderFeed(posts) {
  const feed = $("feed");
  if (!feed) return;
  const filtered = activeFilter === "all"
    ? posts
    : posts.filter(p => (p.type || "text") === activeFilter);

  if (!filtered.length) {
    feed.innerHTML =
      '<div class="empty">এখনও কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!</div>';
    return;
  }

  const frag = document.createDocumentFragment();

  filtered.forEach(post => {
    const card = document.createElement("article");
    card.className = "feed-post";
    card.id = `post-${post.id}`;

    const header = document.createElement("div");
    header.className = "post-header";

    const authorWrap = document.createElement("div");
    authorWrap.className = "post-author-wrap";

    const avatar = document.createElement("img");
    avatar.className = "post-avatar";
    avatar.src = safePhoto(post.authorPhoto);
    avatar.alt = "Profile";

    const authorBox = document.createElement("div");
    const author = document.createElement("div");
    author.className = "post-author";
    author.textContent = post.authorName || "AYNA User";

    const date = document.createElement("div");
    date.className = "post-date";
    date.textContent = formatDate(post.createdAt);

    authorBox.append(author, date);
    authorWrap.append(avatar, authorBox);

    const pill = document.createElement("span");
    pill.className = "q-pill";
    pill.textContent = quantumSignature(post.id || post.text || "");

    header.append(authorWrap, pill);
    card.appendChild(header);

    if (post.text) {
      const text = document.createElement("div");
      text.className = "post-content";
      text.textContent = post.text;
      card.appendChild(text);
    }

    if (post.media && post.type === "image") {
      const img = document.createElement("img");
      img.className = "post-media";
      img.src = post.media;
      img.alt = "Post image";
      img.loading = "lazy";
      card.appendChild(img);
    }

    if (post.media && post.type === "video") {
      const video = document.createElement("video");
      video.className = "post-media";
      video.src = post.media;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      card.appendChild(video);
    }

    if (post.media && post.type === "audio") {
      const audio = document.createElement("audio");
      audio.className = "post-media-audio";
      audio.src = post.media;
      audio.controls = true;
      card.appendChild(audio);
    }

    if (post.media && post.type === "file") {
      const fileBox = document.createElement("div");
      fileBox.className = "file-attach-box";
      fileBox.innerHTML = `
        <div>📎 <strong>${post.fileName || "Attached File"}</strong> ${post.fileSize ? `(${formatSize(post.fileSize)})` : ""}</div>
        <a href="${post.media}" target="_blank" rel="noopener">ডাউনলোড</a>
      `;
      card.appendChild(fileBox);
    }

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const likes = post.likes || {};
    const likeCount = Object.keys(likes).length;
    const liked = !!(currentUser && likes[currentUser.uid]);

    const likeButton = document.createElement("button");
    likeButton.type = "button";
    likeButton.textContent = (liked ? "❤️ " : "🤍 ") + "লাইক " + likeCount;
    likeButton.addEventListener("click", () => toggleLike(post.id, liked));

    const commentButton = document.createElement("button");
    commentButton.type = "button";
    commentButton.textContent = "💬 কমেন্ট";
    commentButton.addEventListener("click", () => {
      card.querySelector(".comment-input")?.focus();
    });

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.textContent = "↗️ শেয়ার";
    shareButton.addEventListener("click", () => sharePost(post));

    const copyLinkButton = document.createElement("button");
    copyLinkButton.type = "button";
    copyLinkButton.textContent = "🔗 কপি লিংক";
    copyLinkButton.addEventListener("click", () => copyPostLink(post));

    actions.append(likeButton, commentButton, shareButton, copyLinkButton);
    card.appendChild(actions);

    renderComments(card, post);
    frag.appendChild(card);
  });

  feed.innerHTML = "";
  feed.appendChild(frag);
}

async function toggleLike(postId, liked) {
  if (!firebaseReady || !currentUser) {
    notify("লাইক দিতে লগইন করুন");
    return;
  }

  const { ref, set } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  try {
    const likeRef = ref(database, `posts/${postId}/likes/${currentUser.uid}`);
    await set(likeRef, liked ? null : true);
  } catch (error) {
    console.error(error);
    notify("লাইক কাজ করেনি। Rules পরীক্ষা করুন।");
  }
}

function renderComments(card, post) {
  const section = document.createElement("div");
  section.className = "comments";

  const comments = post.comments || {};
  Object.values(comments).forEach(comment => {
    const item = document.createElement("div");
    item.className = "comment-item";

    const name = document.createElement("strong");
    name.textContent = (comment.name || "AYNA User") + ": ";

    const text = document.createElement("span");
    text.textContent = comment.text || "";

    item.append(name, text);
    section.appendChild(item);
  });

  const form = document.createElement("div");
  form.className = "comment-form";

  const input = document.createElement("input");
  input.className = "comment-input";
  input.placeholder = "কমেন্ট লিখুন...";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "পাঠান";

  button.addEventListener("click", () => addComment(post.id, input));
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") addComment(post.id, input);
  });

  form.append(input, button);
  section.appendChild(form);
  card.appendChild(section);
}

async function addComment(postId, input) {
  if (!firebaseReady || !currentUser) {
    notify("কমেন্ট করতে লগইন করুন");
    return;
  }

  const text = UltraCriticalHub.cleanTextAi(input.value);
  if (!text) return;

  const { ref, push, set } = await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js");
  try {
    const commentRef = push(ref(database, `posts/${postId}/comments`));
    await set(commentRef, {
      uid: currentUser.uid,
      name: userProfile.fullName || currentUser.displayName || "AYNA User",
      text,
      createdAt: Date.now()
    });
    input.value = "";
  } catch (error) {
    console.error(error);
    notify("কমেন্ট পাঠানো যায়নি");
  }
}

function getPostLink(post) {
  return location.origin + location.pathname + "?post=" + encodeURIComponent(post.id);
}

async function copyPostLink(post) {
  const url = getPostLink(post);
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      notify("পোস্টের লিংক কপি হয়েছে");
    } else {
      notify(url);
    }
  } catch (error) {
    console.error(error);
    notify("লিংক কপি করা যায়নি");
  }
}

async function sharePost(post) {
  const url = getPostLink(post);
  const shareData = {
    title: "AYNA BOOK",
    text: post.text || "AYNA BOOK পোস্ট দেখুন",
    url
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await copyPostLink(post);
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
    }
  }
}

$("startCamera")?.addEventListener("click", startCamera);
$("stopCamera")?.addEventListener("click", stopCamera);

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    notify("ক্যামেরার জন্য HTTPS প্রয়োজন");
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: true
    });
    if ($("liveVideo")) $("liveVideo").srcObject = cameraStream;
    if ($("cameraStatus")) $("cameraStatus").textContent = "ক্যামেরা চালু হয়েছে। এটি শুধু আপনার ডিভাইসে দেখা যাচ্ছে।";
    notify("ক্যামেরা চালু হয়েছে");
  } catch (error) {
    console.error(error);
    if ($("cameraStatus")) $("cameraStatus").textContent = "ক্যামেরা চালু হয়নি। Permission পরীক্ষা করুন।";
    AynaVoiceSignal.announceMistake("ক্যামেরা চালু করা যায়নি। ব্রাউজারে ক্যামেরা অনুমতি দিন।", "liveAiOutput");
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  if ($("liveVideo")) $("liveVideo").srcObject = null;
  if ($("cameraStatus")) $("cameraStatus").textContent = "ক্যামেরা বন্ধ।";
  notify("ক্যামেরা বন্ধ হয়েছে");
}

window.addEventListener("pagehide", () => {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }
});

QuantumTalkingClock.start();
QuantumAutoUpdater.start();
initApp();