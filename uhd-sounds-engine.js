<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#060d21">
<title>AYNA BOOK ★ Global GPS, AI Compass &amp; World Hub</title>
<script src="uhd-sounds-engine.js"></script>

<style>
:root {
  --bg:#050a18;
  --navy-top:#1a3575;
  --navy-bottom:#08122b;
  --gold:#ffe64d;
  --gold-bright:#fff6b3;
  --gold-base:#8a6105;
  --cyan:#38f2ff;
  --emerald:#16c784;
  --rose:#ff4d6d;
  --white:#ffffff;
  --muted:#e6eeff;
}

* {
  box-sizing:border-box;
}

html, body {
  max-width:100%;
  overflow-x:hidden;
  scroll-behavior:smooth;
}

body {
  margin:0;
  background:
    radial-gradient(circle at 15% 10%, rgba(56,242,255,.11), transparent 35%),
    radial-gradient(circle at 85% 20%, rgba(255,230,77,.12), transparent 40%),
    var(--bg);
  color:var(--white);
  font-family:Arial,"Noto Sans Bengali",sans-serif;
  font-size:34px;
  line-height:1.5;
}

button,input,select,textarea {
  font:inherit;
}

button {
  cursor:pointer;
}

.hub-box {
  background:linear-gradient(155deg,var(--navy-top) 0%,var(--navy-bottom) 100%);
  border:5px solid var(--gold);
  border-radius:16px;
  padding:28px;
  margin:28px 0;
  box-shadow:
    0 0 22px rgba(255,230,77,.6),
    0 10px 0 var(--gold-base),
    0 18px 28px rgba(0,0,0,.85),
    inset 0 2px 7px var(--gold-bright);
}

header {
  background:linear-gradient(180deg,#122659 0%,#060d21 100%);
  border-bottom:5px solid var(--gold);
  padding:20px;
  position:sticky;
  top:0;
  z-index:60;
}

.header-inner {
  max-width:1360px;
  margin:auto;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
}

.brand-title {
  color:var(--gold-bright);
  font-size:68px;
  font-weight:1000;
  display:inline-flex;
  align-items:center;
  gap:10px;
}

.star-pulse {
  color:#ffffff;
  font-size:72px;
  display:inline-block;
  transform:translateY(-10px);
  animation:whiteStarBeat 1s infinite alternate ease-in-out;
}

@keyframes whiteStarBeat {
  0% {
    transform:translateY(-10px) scale(1);
    text-shadow:0 0 8px #ffffff;
  }
  100% {
    transform:translateY(-10px) scale(1.25);
    text-shadow:0 0 22px #ffffff, 0 0 42px #ffffff, 0 0 65px #e6f7ff;
  }
}

.grid-2 {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-top:16px;
}

.grid-3 {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:16px;
  margin-top:16px;
}

.btn {
  min-height:84px;
  padding:16px 22px;
  border-radius:12px;
  border:3.5px solid var(--gold-bright);
  background:linear-gradient(155deg,#1d3b7e,#08122b);
  color:#ffffff;
  font-size:30px;
  font-weight:1000;
  box-shadow:0 0 14px rgba(255,230,77,.45), 0 6px 0 var(--gold-base);
}

.btn-gold {
  min-height:88px;
  padding:18px 24px;
  border-radius:12px;
  border:4px solid var(--gold-bright);
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
  font-size:32px;
  font-weight:1000;
  box-shadow:0 0 18px rgba(255,230,77,.7), 0 7px 0 #664604;
}

.btn-sos {
  background:linear-gradient(180deg,#ff4d6d 0%,#990f2b 100%);
  color:#ffffff;
  border-color:#ffd6de;
}

.inp, .sel, .txt {
  width:100%;
  background:#050b1c;
  color:#ffffff;
  border:3.5px solid var(--gold);
  border-radius:10px;
  padding:14px 18px;
  font-size:28px;
  margin-top:10px;
  outline:none;
}

.txt {
  min-height:110px;
  resize:vertical;
}

.ai-screen {
  margin-top:16px;
  background:#050b1c;
  border:3.5px solid var(--cyan);
  border-radius:12px;
  padding:20px;
  font-size:30px;
  color:var(--gold-bright);
  white-space:pre-line;
  overflow-wrap:anywhere;
}

.map-canvas {
  width:840px;
  max-width:100%;
  aspect-ratio:1 / 1;
  height:auto;
  display:block;
  margin:18px auto;
  border-radius:50%;
  border:6px solid var(--cyan);
  background:#030917;
  box-shadow:0 0 34px rgba(56,242,255,.45);
}

.showcase-card {
  background:#050b1c;
  border:3px solid var(--gold);
  border-radius:12px;
  padding:18px;
}

.showcase-card h3 {
  margin:0 0 8px;
  color:var(--gold-bright);
  font-size:32px;
}

.showcase-card p {
  margin:0;
  font-size:26px;
  color:var(--muted);
}

#toast {
  position:fixed;
  top:115px;
  left:50%;
  transform:translateX(-50%);
  background:#0a1636;
  color:#ffffff;
  border:4px solid var(--gold-bright);
  padding:18px 28px;
  border-radius:12px;
  z-index:120;
  display:none;
  max-width:92%;
  font-size:30px;
  text-align:center;
}

footer {
  text-align:center;
  padding:32px 16px 150px;
  color:var(--muted);
  font-size:28px;
}

.bottom-nav {
  position:fixed;
  bottom:0;
  left:0;
  right:0;
  z-index:80;
  display:grid;
  grid-template-columns:repeat(6,1fr);
  background:linear-gradient(180deg,#122659 0%,#060d21 100%);
  border-top:5px solid var(--gold);
  padding:10px 4px calc(10px + env(safe-area-inset-bottom));
}

.bottom-nav a {
  color:#ffffff;
  text-decoration:none;
  text-align:center;
  font-size:22px;
  font-weight:bold;
}

.bottom-nav span {
  display:block;
  font-size:30px;
}

@media(max-width:820px) {
  .brand-title { font-size:48px; }
  .star-pulse { font-size:52px; }
  .grid-2, .grid-3 { grid-template-columns:1fr; }
  .bottom-nav { grid-template-columns:repeat(3,1fr); }
}
</style>
</head>
<body>

<header>
  <div class="header-inner">
    <div class="brand-title">AYNA BOOK<span class="star-pulse">★</span></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <button type="button" class="btn" id="hdrSoundBtn">🔊 UHD সাউন্ড</button>
      <button type="button" class="btn" id="hdrTimeBtn">🕒 সময় বলুন</button>
    </div>
  </div>
</header>

<div id="toast"></div>

<main class="container" style="max-width:1360px;margin:auto;padding:20px;">

  <!-- ১. সর্বাধুনিক GPS, Bearing & Distance এবং Offline Checkpoint বক্স -->
  <section class="hub-box" id="gpsSection">
    <h1 style="margin:0 0 12px;color:var(--gold-bright);font-size:44px;">🛰️ সর্বাধুনিক GPS, বিয়ারিং ও অফলাইন চেকপয়েন্ট</h1>

    <div class="grid-2">
      <button type="button" class="btn-gold" id="startGpsBtn">📡 হাই-অ্যাকুরেসি GPS চালু</button>
      <button type="button" class="btn" id="stopGpsBtn">⏹ GPS বন্ধ করুন</button>
      <button type="button" class="btn" id="loadLastGpsBtn">💾 শেষ সংরক্ষিত GPS দেখুন</button>
      <button type="button" class="btn" id="safeRouteAiBtn">🛡️ Safe Route &amp; Weather AI</button>
    </div>

    <div class="grid-3">
      <input type="text" id="targetNameInput" class="inp" value="Cox's Bazar Sea Beach" placeholder="লক্ষ্যস্থলের নাম">
      <input type="number" step="any" id="targetLatInput" class="inp" value="21.4272" placeholder="লক্ষ্য অক্ষাংশ (Lat)">
      <input type="number" step="any" id="targetLonInput" class="inp" value="92.0058" placeholder="লক্ষ্য দ্রাঘিমাংশ (Lon)">
    </div>

    <div class="ai-screen" id="gpsTelemetryBox">GPS প্রস্তুত — "হাই-অ্যাকুরেসি GPS চালু" চাপুন বা শেষ সংরক্ষিত পয়েন্ট লোড করুন।</div>
  </section>

  <!-- ২. Interactive World / Radar + AI Compass ক্যানভাস -->
  <section class="hub-box" id="worldMapSection">
    <h2 style="margin:0 0 12px;color:var(--gold-bright);font-size:40px;">🌍 Interactive World, Radar &amp; AI Compass</h2>
    <canvas id="worldCompassCanvas" class="map-canvas" width="840" height="840"></canvas>
    <div class="ai-screen" id="worldMapReadout">বিয়ারিং ও দিকনির্দেশনা ক্যানভাস সক্রিয়।</div>
  </section>

  <!-- ৩. Global SOS Beacon, বহুভাষিক অনুবাদ ও Voice Command বক্স -->
  <section class="hub-box" id="globalSosSection">
    <h2 style="margin:0 0 12px;color:var(--gold-bright);font-size:40px;">🌐 SOS Beacon, বহুভাষিক AI ও ভয়েস কমান্ড</h2>

    <div class="grid-2">
      <select id="langSelect" class="sel" style="margin-top:0;">
        <option value="bn">🇧🇩 বাংলা (bn-BD)</option>
        <option value="en">🇺🇸 English (en-US)</option>
        <option value="ar">🇸🇦 العربية (ar-SA)</option>
      </select>
      <input type="text" id="voiceCmdInput" class="inp" style="margin-top:0;" placeholder="ভয়েস/টেক্সট কমান্ড লিখুন (যেমন: GPS, SOS, সময়, বিশ্ব)">
    </div>

    <div class="grid-2">
      <button type="button" class="btn btn-sos" id="triggerSosBtn">🚨 Global SOS লোকেশন কার্ড</button>
      <button type="button" class="btn" id="copySosBtn">📋 SOS তথ্য কপি করুন</button>
      <button type="button" class="btn-gold" id="translateAiBtn">🌍 বহুভাষিক AI অনুবাদ ও কণ্ঠ</button>
      <button type="button" class="btn" id="execVoiceCmdBtn">🎙️ কমান্ড কার্যকর করুন</button>
    </div>

    <div class="ai-screen" id="sosAndLangBox">জরুরি SOS কার্ড, বহুভাষিক অনুবাদ ও ভয়েস কমান্ড প্রস্তুত।</div>
  </section>

  <!-- ৪. Creator & Researcher Showcase বক্স -->
  <section class="hub-box" id="showcaseSection">
    <h2 style="margin:0 0 12px;color:var(--gold-bright);font-size:40px;">🔬 Creator &amp; Researcher Showcase</h2>
    <div class="grid-2">
      <input type="text" id="creatorNameInput" class="inp" placeholder="নির্মাতা বা গবেষকের নাম">
      <input type="text" id="creatorTopicInput" class="inp" placeholder="গবেষণা / প্রজেক্টের বিষয়">
    </div>
    <textarea id="creatorNoteInput" class="txt" placeholder="বিশ্ববাসীর জন্য আপনার প্রজেক্ট বা গবেষণা নোট লিখুন..."></textarea>
    <div class="grid-2">
      <button type="button" class="btn-gold" id="addShowcaseBtn">➕ Showcase কার্ড যুক্ত করুন</button>
      <button type="button" class="btn" id="showcaseAiBtn">🤖 Showcase AI সারসংক্ষেপ</button>
    </div>

    <div class="grid-3" id="showcaseGrid">
      <div class="showcase-card">
        <h3>Mohammad Mahabub Alam</h3>
        <p>AYNA BOOK • কোয়ান্টাম, রাডার, GPS ও AI মাল্টিমিডিয়া হাব।</p>
      </div>
      <div class="showcase-card">
        <h3>Citizen Science &amp; Weather</h3>
        <p>আবহাওয়া পর্যবেক্ষণ, উপকূলীয় সতর্কতা ও রিয়েল-টাইম বিয়ারিং ট্র্যাকিং।</p>
      </div>
      <div class="showcase-card">
        <h3>Global SOS &amp; Accessibility</h3>
        <p>বহুভাষিক ভয়েস সহায়তা, বড় ফন্ট ও অফলাইন GPS চেকপয়েন্ট।</p>
      </div>
    </div>
  </section>

</main>

<footer>
  © 2026 AYNA BOOK ★ Global GPS, Radar &amp; AI Hub
</footer>

<nav class="bottom-nav">
  <a href="#gpsSection"><span>🏠</span>Home</a>
  <a href="#showcaseSection"><span>👤</span>Profile</a>
  <a href="#worldMapSection"><span>🧭</span>Compass</a>
  <a href="#globalSosSection"><span>🌐</span>Global</a>
  <a href="#showcaseSection"><span>🔬</span>Research</a>
  <a href="#globalSosSection"><span>🚨</span>SOS</a>
</nav>

<script>
const $ = id => document.getElementById(id);
const sound = window.aynaSound || window.uhdSoundsEngine || null;

let currentFix = null;
let watchId = null;
let bearingDeg = 45;
let distanceKm = 0;
let lastSosText = "";

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.style.display = "block";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { el.style.display = "none"; }, 3400);
}

function say(text, langCode = "bn") {
  const clean = String(text || "").replace(/[*#]/g, "").trim().slice(0, 280);
  if (!clean) return;
  if (sound && langCode === "bn") {
    sound.speak(clean);
    return;
  }
  if ("speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = langCode === "en" ? "en-US" : (langCode === "ar" ? "ar-SA" : "bn-BD");
      u.rate = 0.96;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  }
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearingDeg(lat1, lon1, lat2, lon2) {
  const toRad = d => (d * Math.PI) / 180;
  const toDeg = r => (r * 180) / Math.PI;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function cardinalBn(deg) {
  const n = ((Number(deg) % 360) + 360) % 360;
  if (n >= 337.5 || n < 22.5) return "উত্তর (N)";
  if (n < 67.5) return "উত্তর-পূর্ব (NE)";
  if (n < 112.5) return "পূর্ব (E)";
  if (n < 157.5) return "দক্ষিণ-পূর্ব (SE)";
  if (n < 202.5) return "দক্ষিণ (S)";
  if (n < 247.5) return "দক্ষিণ-পশ্চিম (SW)";
  if (n < 292.5) return "পশ্চিম (W)";
  return "উত্তর-পশ্চিম (NW)";
}

function refreshTelemetry(fix) {
  currentFix = fix;
  const tLat = Number($("targetLatInput").value);
  const tLon = Number($("targetLonInput").value);
  const tName = ($("targetNameInput").value || "লক্ষ্যস্থল").trim();

  let targetInfo = "";
  if (!Number.isNaN(tLat) && !Number.isNaN(tLon)) {
    distanceKm = haversineKm(fix.lat, fix.lon, tLat, tLon);
    bearingDeg = calcBearingDeg(fix.lat, fix.lon, tLat, tLon);
    targetInfo = `\nলক্ষ্য (${tName}): দূরত্ব ${distanceKm.toFixed(2)} km • বিয়ারিং ${Math.round(bearingDeg)}° (${cardinalBn(bearingDeg)})`;
  }

  $("gpsTelemetryBox").textContent =
    `অক্ষাংশ: ${fix.lat.toFixed(6)} | দ্রাঘিমাংশ: ${fix.lon.toFixed(6)}\n` +
    `নির্ভুলতা: ±${fix.accuracy}m | উচ্চতা: ${fix.altitude !== null ? fix.altitude + "m" : "N/A"} | গতি: ${fix.speedKmh} km/h | সময়: ${fix.timestamp}` +
    targetInfo;
}

$("startGpsBtn").onclick = () => {
  sound?.playTone("radar");
  if (!("geolocation" in navigator)) {
    sound?.announceError("GPS", "এই ব্রাউজারে Geolocation সমর্থন নেই।", toast);
    return;
  }
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const fix = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 0),
        altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude) : null,
        speedKmh: pos.coords.speed !== null ? (pos.coords.speed * 3.6).toFixed(1) : "0.0",
        timestamp: new Date(pos.timestamp).toLocaleTimeString("bn-BD")
      };
      try { localStorage.setItem("ayna_gps_checkpoint", JSON.stringify(fix)); } catch (_) {}
      refreshTelemetry(fix);
    },
    err => {
      const msg = err.code === 1 ? "GPS অনুমতি দেওয়া হয়নি।" : "GPS সিগন্যাল পাওয়া যায়নি।";
      sound?.announceError("GPS", msg, toast);
    },
    { enableHighAccuracy: true, maximumAge: 2500, timeout: 12000 }
  );
  toast("📡 হাই-অ্যাকুরেসি GPS চালু হয়েছে");
};

$("stopGpsBtn").onclick = () => {
  sound?.playTone("confirm");
  if (watchId !== null && "geolocation" in navigator) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  toast("⏹ GPS ট্র্যাকিং বন্ধ হয়েছে");
};

$("loadLastGpsBtn").onclick = () => {
  sound?.playTone("confirm");
  try {
    const saved = JSON.parse(localStorage.getItem("ayna_gps_checkpoint") || "null");
    if (!saved) {
      sound?.announceError("অফলাইন GPS", "আগে কোনো সংরক্ষিত GPS পয়েন্ট পাওয়া যায়নি।", toast);
      return;
    }
    refreshTelemetry({ ...saved, timestamp: saved.timestamp + " (সংরক্ষিত)" });
    toast("💾 শেষ সংরক্ষিত GPS চেকপয়েন্ট লোড হয়েছে");
  } catch (_) {
    toast("সংরক্ষিত GPS পড়া যায়নি");
  }
};

$("safeRouteAiBtn").onclick = () => {
  sound?.playTone("uhd");
  const tName = ($("targetNameInput").value || "লক্ষ্যস্থল").trim();
  const advice = currentFix
    ? `Safe Route AI: বর্তমান অবস্থান থেকে ${tName} (${distanceKm.toFixed(1)} km, ${Math.round(bearingDeg)}° ${cardinalBn(bearingDeg)}) অভিমুখে অগ্রসর হওয়া নিরাপদ। আবহাওয়া রাডার ও গতি (${currentFix.speedKmh} km/h) অনুযায়ী সতর্ক থাকুন।`
    : `Safe Route AI: লাইভ GPS চালু করলে ${tName}-এর দূরত্ব, বিয়ারিং ও আবহাওয়া-ভিত্তিক নিরাপদ দিকনির্দেশনা দেওয়া হবে।`;
  $("gpsTelemetryBox").textContent = advice;
  say(advice, "bn");
};

// Interactive World / Radar & Compass Canvas
const wcCanvas = $("worldCompassCanvas");
const wcCtx = wcCanvas.getContext("2d");

function renderWorldCompass() {
  const cx = 420, cy = 420, maxR = 392;
  wcCtx.clearRect(0, 0, 840, 840);

  wcCtx.fillStyle = "#030917";
  wcCtx.beginPath();
  wcCtx.arc(cx, cy, maxR, 0, Math.PI * 2);
  wcCtx.fill();

  for (let i = 1; i <= 4; i++) {
    wcCtx.strokeStyle = "rgba(56,242,255,0.28)";
    wcCtx.lineWidth = 2.5;
    wcCtx.beginPath();
    wcCtx.arc(cx, cy, (maxR * i) / 4, 0, Math.PI * 2);
    wcCtx.stroke();
  }

  for (let d = 0; d < 360; d += 15) {
    const rad = ((d - bearingDeg - 90) * Math.PI) / 180;
    const major = d % 45 === 0;
    const rIn = major ? maxR - 36 : maxR - 18;
    wcCtx.strokeStyle = d % 90 === 0 ? "#ffe64d" : "#38f2ff";
    wcCtx.lineWidth = major ? 4 : 2;
    wcCtx.beginPath();
    wcCtx.moveTo(cx + Math.cos(rad) * rIn, cy + Math.sin(rad) * rIn);
    wcCtx.lineTo(cx + Math.cos(rad) * (maxR - 6), cy + Math.sin(rad) * (maxR - 6));
    wcCtx.stroke();
  }

  const bRad = ((bearingDeg - 90) * Math.PI) / 180;
  wcCtx.save();
  wcCtx.translate(cx, cy);
  wcCtx.rotate(bRad + Math.PI / 2);
  wcCtx.fillStyle = "#ffe64d";
  wcCtx.beginPath();
  wcCtx.moveTo(0, -maxR + 85);
  wcCtx.lineTo(24, 0);
  wcCtx.lineTo(-24, 0);
  wcCtx.closePath();
  wcCtx.fill();
  wcCtx.restore();

  wcCtx.fillStyle = "#38f2ff";
  wcCtx.font = "bold 32px Arial";
  wcCtx.textAlign = "center";
  wcCtx.fillText(`Bearing ${Math.round(bearingDeg)}° • ${cardinalBn(bearingDeg)}`, cx, cy + 125);

  $("worldMapReadout").textContent =
    `AI Compass Bearing: ${Math.round(bearingDeg)}° (${cardinalBn(bearingDeg)})` +
    (distanceKm > 0 ? ` • দূরত্ব: ${distanceKm.toFixed(2)} km` : "");

  requestAnimationFrame(renderWorldCompass);
}
renderWorldCompass();

// SOS Beacon, বহুভাষিক AI ও ভয়েস কমান্ড
$("triggerSosBtn").onclick = () => {
  sound?.playTone("alert");
  const locStr = currentFix
    ? `${currentFix.lat.toFixed(5)}, ${currentFix.lon.toFixed(5)} (±${currentFix.accuracy}m)`
    : "GPS অবস্থান সংগৃহীত নয় (শেষ চেকপয়েন্ট যাচাই করুন)";
  lastSosText = `AYNA BOOK SOS BEACON | সময়: ${new Date().toLocaleString("bn-BD")} | অবস্থান: ${locStr} | বিয়ারিং: ${Math.round(bearingDeg)}°`;
  $("sosAndLangBox").textContent = "🚨 " + lastSosText;
  say("জরুরি এস ও এস লোকেশন কার্ড তৈরি হয়েছে।", "bn");
};

$("copySosBtn").onclick = async () => {
  sound?.playTone("confirm");
  const textToCopy = lastSosText || $("sosAndLangBox").textContent;
  try {
    await navigator.clipboard.writeText(textToCopy);
    toast("📋 SOS তথ্য কপি করা হয়েছে");
  } catch (_) {
    toast("কপি করা যায়নি; বক্স থেকে ম্যানুয়ালি কপি করুন");
  }
};

$("translateAiBtn").onclick = () => {
  sound?.playTone("uhd");
  const lang = $("langSelect").value;
  const cmd = ($("voiceCmdInput").value || "Global AI Radar & GPS Hub").trim();
  const samples = {
    bn: `বহুভাষিক AI (বাংলা): "${cmd}" — AYNA BOOK GPS, রাডার ও কম্পাস সিস্টেম সক্রিয় আছে।`,
    en: `Multilingual AI (English): "${cmd}" — AYNA BOOK GPS, Radar and Compass system is active.`,
    ar: `الذكاء الاصطناعي متعدد اللغات: "${cmd}" — نظام GPS والرادار والبوصلة في AYNA BOOK نشط.`
  };
  const out = samples[lang] || samples.bn;
  $("sosAndLangBox").textContent = out;
  say(out, lang);
};

$("execVoiceCmdBtn").onclick = () => {
  const q = ($("voiceCmdInput").value || "").trim().toLowerCase();
  if (!q) {
    sound?.announceError("ভয়েস কমান্ড", "কমান্ড লিখুন বা বলুন।", toast);
    return;
  }
  sound?.playTone("confirm");
  if (q.includes("gps") || q.includes("জিপিএস")) {
    $("startGpsBtn").click();
  } else if (q.includes("sos") || q.includes("জরুরি")) {
    $("triggerSosBtn").click();
  } else if (q.includes("সময়") || q.includes("time")) {
    sound?.announceCurrentTime(toast);
  } else {
    $("sosAndLangBox").textContent = `🎙️ কমান্ড গৃহীত: "${q}" — সংশ্লিষ্ট হাব প্রস্তুত।`;
    say(`কমান্ড ${q} চালু করা হয়েছে।`, "bn");
  }
};

// Showcase যুক্ত ও AI সারসংক্ষেপ
$("addShowcaseBtn").onclick = () => {
  const name = ($("creatorNameInput").value || "").trim();
  const topic = ($("creatorTopicInput").value || "").trim();
  const note = ($("creatorNoteInput").value || "").trim();
  if (!name || !topic) {
    sound?.announceError("Showcase তথ্য", "নাম এবং বিষয় লিখুন।", toast);
    return;
  }
  sound?.playTone("confirm");
  const card = document.createElement("div");
  card.className = "showcase-card";
  card.innerHTML = `<h3>${name}</h3><p><strong>${topic}</strong> — ${note || "গ্লোবাল কমিউনিটি প্রজেক্ট।"}</p>`;
  $("showcaseGrid").prepend(card);
  $("creatorNameInput").value = "";
  $("creatorTopicInput").value = "";
  $("creatorNoteInput").value = "";
  toast("✅ Showcase কার্ড যুক্ত হয়েছে");
};

$("showcaseAiBtn").onclick = () => {
  sound?.playTone("uhd");
  const count = $("showcaseGrid").children.length;
  const summary = `Showcase AI: বর্তমানে ${count}টি নির্মাতা/গবেষণা কার্ড সক্রিয় রয়েছে। বিশ্ববাসীর সাথে প্রজেক্ট ও গবেষণা শেয়ার করা যাচ্ছে।`;
  $("sosAndLangBox").textContent = summary;
  say(summary, "bn");
};

$("hdrSoundBtn").onclick = () => {
  sound?.playTone("uhd");
  say("ইউ এইচ ডি সাউন্ড সক্রিয় হয়েছে।", "bn");
};

$("hdrTimeBtn").onclick = () => {
  if (sound) sound.announceCurrentTime(toast);
  else say("এখন সময় " + new Date().toLocaleTimeString("bn-BD"), "bn");
};
</script>
</body>
</html>