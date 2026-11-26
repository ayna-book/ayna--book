
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#060d21">
<title>AYNA BOOK — Quantum Multimedia Social</title>

<style>
:root {
  --bg:#050a18;
  --navy-top:#1a3575;
  --navy-bottom:#08122b;
  --panel:#0b1633;
  --panel2:#13254d;
  --gold:#ffe64d;
  --gold-bright:#fff6b3;
  --gold-base:#8a6105;
  --quantum-cyan:#38f2ff;
  --quantum-violet:#a855f7;
  --white:#ffffff;
  --muted:#e6eeff;
  --green:#16c784;
  --border:#ffe64d;
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
    radial-gradient(circle at 15% 10%, rgba(56,242,255,.09), transparent 35%),
    radial-gradient(circle at 85% 20%, rgba(255,230,77,.10), transparent 40%),
    var(--bg);
  color:var(--white);
  font-family:Arial,"Noto Sans Bengali",sans-serif;
  font-size:36px;
  line-height:1.5;
}

button,input,textarea,select {
  font:inherit;
}

button {
  cursor:pointer;
}

.gold-3d-box,
.hero,
.profile-bar,
.feature-card,
.panel,
.feed-post,
.quantum-bar {
  background:linear-gradient(155deg,var(--navy-top) 0%,var(--navy-bottom) 100%) !important;
  border:4px solid var(--gold) !important;
  border-radius:10px !important;
  box-shadow:
    0 0 18px rgba(255,230,77,.65),
    0 9px 0 var(--gold-base),
    0 16px 26px rgba(0,0,0,.85),
    inset 0 2px 5px var(--gold-bright) !important;
}

.feature-card:active,
.primary-button:active,
.tool-button:active,
.media-buttons button:active,
.header-actions a:active,
.header-actions button:active,
.filter-btn:active {
  transform:translateY(4px) !important;
  box-shadow:
    0 0 12px rgba(255,230,77,.55),
    0 3px 0 var(--gold-base),
    0 6px 12px rgba(0,0,0,.85),
    inset 0 2px 4px var(--gold-bright) !important;
}

header {
  background:linear-gradient(180deg,#122659 0%,#060d21 100%);
  border-bottom:4px solid var(--gold);
  padding:20px;
  position:sticky;
  top:0;
  z-index:50;
  box-shadow:0 0 20px rgba(255,230,77,.45), 0 6px 18px rgba(0,0,0,.9);
}

.header-inner {
  max-width:1360px;
  margin:auto;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  flex-wrap:wrap;
}

.logo {
  color:var(--gold-bright);
  font-size:48px;
  font-weight:1000;
  letter-spacing:1px;
  display:inline-flex;
  align-items:center;
  gap:12px;
  text-shadow:0 0 14px rgba(255,230,77,.85), 0 3px 8px rgba(0,0,0,.95);
}

.quantum-badge {
  font-size:20px;
  font-weight:900;
  letter-spacing:1.1px;
  padding:6px 14px;
  border-radius:6px;
  color:var(--quantum-cyan);
  background:rgba(5,10,24,.9);
  border:2px solid var(--quantum-cyan);
}

.star-1s {
  color:#ffffff;
  font-size:48px;
  display:inline-block;
  animation:starFlash1s 1s infinite alternate ease-in-out;
}

@keyframes starFlash1s {
  0% {
    transform:scale(0.95) rotate(0deg);
    color:#fff099;
    text-shadow:0 0 8px #ffd700;
  }
  100% {
    transform:scale(1.35) rotate(18deg);
    color:#ffffff;
    text-shadow:
      0 0 14px #ffffff,
      0 0 26px #ffffff,
      0 0 42px #ffe64d,
      0 0 60px #ff9900;
  }
}

.header-actions {
  display:flex;
  gap:14px;
  flex-wrap:wrap;
}

.header-actions a,
.header-actions button {
  text-decoration:none;
  color:white;
  background:linear-gradient(155deg,#1d3b7e,#08122b);
  border:3px solid var(--gold);
  padding:14px 20px;
  border-radius:8px;
  font-weight:bold;
  font-size:28px;
  box-shadow:0 0 12px rgba(255,230,77,.45), 0 5px 0 var(--gold-base);
}

.container {
  max-width:1360px;
  margin:auto;
  padding:20px;
}

.hero {
  padding:36px 24px;
  margin-bottom:28px;
  text-align:center;
}

.hero h1 {
  font-size:56px;
  margin:0 0 14px;
  color:var(--gold-bright);
  font-weight:1000;
  text-shadow:0 0 16px rgba(255,230,77,.65);
}

.hero p {
  font-size:38px;
  line-height:1.6;
  margin:0;
  color:var(--white);
  font-weight:600;
}

.quantum-bar {
  padding:22px;
  margin-bottom:28px;
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:18px;
}

.q-stat {
  background:rgba(5,11,28,.8);
  border:2.5px solid var(--gold);
  border-radius:8px;
  padding:16px 20px;
}

.q-stat-label {
  font-size:24px;
  color:var(--muted);
  display:block;
}

.q-stat-value {
  font-size:32px;
  font-weight:1000;
  color:var(--quantum-cyan);
  margin-top:6px;
  display:block;
  overflow-wrap:anywhere;
}

.section-title {
  font-size:46px;
  font-weight:1000;
  margin:36px 0 22px;
  color:var(--gold-bright);
  text-shadow:0 0 14px rgba(255,230,77,.6), 0 3px 8px rgba(0,0,0,.9);
}

.profile-bar {
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:24px;
  padding:24px;
  margin-bottom:28px;
}

.profile-bar img {
  width:320px;
  height:320px;
  object-fit:cover;
  object-position:top center;
  border-radius:10px;
  border:5px solid var(--gold-bright);
  background:#0a1636;
  box-shadow:0 0 24px rgba(255,230,77,.8), 0 7px 0 var(--gold-base);
  flex-shrink:0;
}

.profile-info {
  flex:1;
  min-width:260px;
}

.profile-info strong {
  font-size:48px;
  font-weight:1000;
  color:var(--white);
  display:block;
}

.profile-info small {
  display:block;
  color:var(--muted);
  font-size:32px;
  margin-top:8px;
  word-break:break-word;
}

.feature-grid-8 {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:22px;
}

.feature-grid-more {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:22px;
  margin-top:24px;
}

.feature-card {
  min-height:360px;
  padding:28px 18px;
  color:white;
  text-decoration:none;
  display:flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  text-align:center;
  transition:.12s;
  will-change:transform;
}

.feature-icon {
  font-size:86px;
  margin-bottom:16px;
  filter:drop-shadow(0 4px 10px rgba(0,0,0,.8));
}

.feature-name {
  font-size:42px;
  line-height:1.3;
  font-weight:1000;
  color:var(--white);
  min-height:2.6em;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.feature-desc {
  color:var(--muted);
  font-size:30px;
  font-weight:600;
  margin-top:12px;
  line-height:1.35;
}

.panel {
  padding:26px;
  margin:28px 0;
}

.panel h2 {
  margin:0 0 20px;
  font-size:44px;
  font-weight:1000;
  color:var(--gold-bright);
}

.panel-head-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
  margin-bottom:18px;
}

.panel-head-row h2 {
  margin:0;
}

.panel-link-btn {
  text-decoration:none;
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
  border:3px solid var(--gold-bright);
  border-radius:8px;
  padding:12px 20px;
  font-size:28px;
  font-weight:1000;
  box-shadow:0 5px 0 #664604;
}

.hub-search-input,
.hub-select {
  width:100%;
  background:#050b1c;
  color:white;
  border:3px solid var(--gold);
  border-radius:8px;
  padding:16px 20px;
  font-size:32px;
  outline:none;
}

.hub-controls-row {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-bottom:18px;
}

.hub-cards-grid {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:18px;
  margin-top:18px;
}

.hub-card {
  background:#050b1c;
  border:3px solid var(--gold);
  border-radius:8px;
  padding:20px;
  font-size:30px;
}

.hub-card-tag {
  display:inline-block;
  background:var(--gold);
  color:#050a18;
  font-size:22px;
  font-weight:1000;
  padding:4px 12px;
  border-radius:6px;
  margin-bottom:10px;
}

.hub-card-title {
  font-size:34px;
  font-weight:1000;
  color:var(--gold-bright);
  margin-bottom:8px;
}

.hub-card-meta {
  font-size:28px;
  color:var(--muted);
  margin-top:6px;
  overflow-wrap:anywhere;
}

.yt-input-row {
  display:grid;
  grid-template-columns:1fr auto;
  gap:14px;
  margin-bottom:16px;
}

.yt-go-btn {
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
  border:3px solid var(--gold-bright);
  border-radius:8px;
  padding:0 26px;
  min-height:76px;
  font-size:32px;
  font-weight:1000;
  box-shadow:0 5px 0 #664604;
}

.yt-preset-row {
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  margin-bottom:18px;
}

.yt-preset-btn {
  background:#0a1636;
  color:var(--gold-bright);
  border:2.5px solid var(--gold);
  border-radius:8px;
  padding:12px 18px;
  font-size:28px;
  font-weight:bold;
}

.yt-player-frame {
  width:100%;
  height:540px;
  border:3.5px solid var(--gold);
  border-radius:8px;
  background:#000;
}

.yt-ext-link {
  display:inline-block;
  margin-top:16px;
  text-decoration:none;
  background:linear-gradient(155deg,#1d3b7e,#08122b);
  color:var(--gold-bright);
  border:3px solid var(--gold);
  border-radius:8px;
  padding:14px 22px;
  font-size:30px;
  font-weight:bold;
}

.clock-live-box {
  background:#050b1c;
  border:3px solid var(--gold);
  border-radius:8px;
  padding:20px;
  margin-bottom:18px;
  text-align:center;
}

.clock-live-time {
  font-size:52px;
  font-weight:1000;
  color:var(--quantum-cyan);
  display:block;
}

.clock-rules-text {
  font-size:28px;
  color:var(--muted);
  margin-top:12px;
  line-height:1.55;
}

.post-textarea {
  width:100%;
  min-height:200px;
  resize:vertical;
  background:#050b1c;
  border:3.5px solid var(--gold);
  color:white;
  border-radius:8px;
  padding:20px;
  font-size:36px;
  line-height:1.6;
  outline:none;
}

.post-textarea:focus,
input:focus {
  border-color:#ffffff;
}

.post-tools {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:18px;
  margin-top:20px;
}

.tool-button {
  min-height:96px;
  padding:16px;
  border-radius:8px;
  border:3px solid var(--gold);
  background:linear-gradient(155deg,#1d3b7e,#08122b);
  color:white;
  font-size:32px;
  font-weight:bold;
  box-shadow:0 0 12px rgba(255,230,77,.45), 0 6px 0 var(--gold-base);
}

.primary-button {
  width:100%;
  min-height:104px;
  margin-top:20px;
  border:3.5px solid var(--gold-bright);
  border-radius:8px;
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
  font-size:40px;
  font-weight:1000;
  box-shadow:0 0 18px rgba(255,230,77,.65), 0 7px 0 #664604;
}

.progress-wrap {
  display:none;
  margin-top:16px;
  background:#050b1c;
  border:3px solid var(--gold);
  border-radius:8px;
  height:34px;
  overflow:hidden;
}

.progress-bar {
  height:100%;
  width:0%;
  background:linear-gradient(90deg,var(--quantum-cyan),var(--gold));
  transition:width .2s ease;
}

.preview {
  display:none;
  margin-top:20px;
  background:#050b1c;
  border:3.5px solid var(--gold);
  padding:18px;
  border-radius:8px;
  text-align:center;
}

.preview img {
  max-width:100%;
  max-height:640px;
  object-fit:contain;
  object-position:top center;
  border-radius:8px;
  border:3px solid var(--gold);
}

.preview video {
  max-width:100%;
  max-height:640px;
  border-radius:8px;
}

.preview audio {
  width:100%;
}

.preview-name {
  font-size:28px;
  color:var(--muted);
  margin-top:12px;
  overflow-wrap:anywhere;
}

.feed-filters {
  display:flex;
  gap:14px;
  flex-wrap:wrap;
  margin-bottom:22px;
}

.filter-btn {
  background:#0a1636;
  color:var(--white);
  border:3px solid var(--gold);
  border-radius:8px;
  padding:14px 24px;
  font-size:30px;
  font-weight:bold;
  box-shadow:0 0 10px rgba(255,230,77,.4), 0 5px 0 var(--gold-base);
}

.filter-btn.active {
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
}

.feed-post {
  padding:26px;
  margin-bottom:26px;
}

.post-header {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin-bottom:18px;
  flex-wrap:wrap;
}

.post-author-wrap {
  display:flex;
  align-items:center;
  gap:20px;
}

.post-avatar {
  width:150px;
  height:150px;
  border-radius:8px;
  border:4px solid var(--gold-bright);
  object-fit:cover;
  object-position:top center;
  background:#0a1636;
  box-shadow:0 0 16px rgba(255,230,77,.65), 0 5px 0 var(--gold-base);
  flex-shrink:0;
}

.post-author {
  font-size:40px;
  font-weight:1000;
  color:var(--white);
}

.post-date {
  font-size:28px;
  color:var(--muted);
  margin-top:6px;
}

.q-pill {
  font-size:22px;
  font-weight:bold;
  color:var(--quantum-cyan);
  background:rgba(5,11,28,.9);
  border:2px solid var(--quantum-cyan);
  padding:8px 14px;
  border-radius:6px;
}

.post-content {
  font-size:40px;
  line-height:1.6;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  margin:18px 0;
  color:var(--white);
}

.post-media {
  width:100%;
  max-height:780px;
  object-fit:contain;
  object-position:top center;
  background:#050a12;
  border:3.5px solid var(--gold);
  border-radius:8px;
  margin-top:14px;
}

.post-media-audio {
  width:100%;
  margin-top:16px;
}

.file-attach-box {
  margin-top:16px;
  padding:18px;
  border-radius:8px;
  background:#050b1c;
  border:2.5px solid var(--gold);
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:14px;
  flex-wrap:wrap;
  font-size:30px;
}

.file-attach-box a {
  background:linear-gradient(180deg,#ffe64d 0%,#c99314 100%);
  color:#050a18;
  text-decoration:none;
  font-weight:1000;
  padding:12px 20px;
  border-radius:8px;
  font-size:28px;
}

.post-actions {
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
  border-top:2.5px solid var(--gold);
  padding-top:18px;
  margin-top:18px;
}

.post-actions button {
  background:#0a1636;
  color:white;
  border:2.5px solid var(--gold);
  border-radius:8px;
  min-height:80px;
  padding:10px;
  font-weight:bold;
  font-size:30px;
  box-shadow:0 0 10px rgba(255,230,77,.4), 0 5px 0 var(--gold-base);
}

.comments {
  margin-top:18px;
  border-top:2px solid rgba(255,230,77,.65);
  padding-top:16px;
}

.comment-item {
  background:#050b1c;
  border:2px solid var(--gold);
  padding:16px;
  border-radius:8px;
  margin:12px 0;
  font-size:32px;
  overflow-wrap:anywhere;
}

.comment-form {
  display:flex;
  gap:14px;
  margin-top:16px;
  flex-wrap:wrap;
}

.comment-form input {
  flex:1;
  min-width:240px;
  background:#050b1c;
  color:white;
  border:3px solid var(--gold);
  border-radius:8px;
  padding:16px;
  font-size:32px;
}

.comment-form button {
  background:var(--gold);
  color:#050a18;
  border:2px solid var(--gold-bright);
  border-radius:8px;
  padding:0 28px;
  min-height:72px;
  font-weight:1000;
  font-size:32px;
  box-shadow:0 5px 0 #664604;
}

.media-box {
  text-align:center;
}

.media-box video {
  width:100%;
  max-height:720px;
  object-fit:cover;
  object-position:top center;
  background:#000;
  border:3.5px solid var(--gold);
  border-radius:8px;
}

.media-buttons {
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-top:18px;
}

.media-buttons button {
  min-height:92px;
  border:3px solid var(--gold);
  border-radius:8px;
  background:linear-gradient(155deg,#1d3b7e,#08122b);
  color:white;
  font-weight:bold;
  font-size:34px;
  box-shadow:0 0 12px rgba(255,230,77,.45), 0 6px 0 var(--gold-base);
}

.status {
  font-size:30px;
  color:var(--muted);
  margin-top:14px;
  overflow-wrap:anywhere;
}

.file-search-input {
  width:100%;
  background:#050b1c;
  color:white;
  border:3px solid var(--gold);
  border-radius:8px;
  padding:16px 20px;
  font-size:32px;
  margin-bottom:18px;
  outline:none;
}

.file-list-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
  gap:12px;
  max-height:680px;
  overflow-y:auto;
  padding:8px;
  background:#050b1c;
  border:2.5px solid var(--gold);
  border-radius:8px;
}

.file-item-card {
  background:#0b1633;
  border:2px solid var(--gold);
  border-radius:6px;
  padding:12px 16px;
  font-size:26px;
  word-break:break-word;
  color:var(--white);
}

.file-item-num {
  color:var(--gold-bright);
  font-weight:1000;
  margin-right:8px;
}

.empty {
  text-align:center;
  color:var(--muted);
  padding:42px 16px;
  font-size:36px;
}

footer {
  text-align:center;
  padding:32px 16px 140px;
  color:var(--muted);
  font-size:30px;
}

.bottom-nav {
  position:fixed;
  bottom:0;
  left:0;
  right:0;
  z-index:60;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  background:linear-gradient(180deg,#122659 0%,#060d21 100%);
  border-top:4px solid var(--gold);
  padding:12px 6px calc(12px + env(safe-area-inset-bottom));
  box-shadow:0 0 20px rgba(255,230,77,.45), 0 -5px 18px rgba(0,0,0,.9);
}

.bottom-nav a {
  color:white;
  text-decoration:none;
  text-align:center;
  font-size:26px;
  font-weight:bold;
}

.bottom-nav span {
  display:block;
  font-size:38px;
  margin-bottom:4px;
}

#notice {
  position:fixed;
  top:110px;
  left:50%;
  transform:translateX(-50%);
  background:#0a1636;
  color:white;
  border:3.5px solid var(--gold-bright);
  padding:20px 28px;
  border-radius:8px;
  box-shadow:0 0 20px rgba(255,230,77,.8), 0 7px 0 var(--gold-base);
  z-index:100;
  display:none;
  max-width:92%;
  font-size:34px;
  text-align:center;
}

@media(max-width:1024px) {
  .feature-grid-8,
  .feature-grid-more {
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
  .post-actions {
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}

@media(max-width:600px) {
  .feature-grid-8,
  .feature-grid-more,
  .post-tools,
  .media-buttons,
  .hub-controls-row,
  .hub-cards-grid,
  .yt-input-row {
    grid-template-columns:1fr;
  }
  .profile-bar img {
    width:240px;
    height:240px;
  }
  .logo {
    font-size:36px;
  }
  .hero h1 {
    font-size:40px;
  }
  .clock-live-time {
    font-size:38px;
  }
  .yt-player-frame {
    height:340px;
  }
}
</style>
</head>

<body>

<header>
  <div class="header-inner">
    <div class="logo">
      AYNA BOOK <span class="star-1s">★</span>
      <span class="quantum-badge">⚛ QUANTUM SUPER-SPEED</span>
    </div>

    <div class="header-actions">
      <button type="button" id="quantumBoostBtn">⚡ Quantum Boost</button>
      <button type="button" id="autoUpdateNowBtn">🔄 Auto Sync</button>
      <a href="notifications.html">🔔</a>
      <a href="messenger.html">💬 Messenger</a>
    </div>
  </div>
</header>

<div id="notice"></div>

<main class="container">

  <section class="hero">
    <h1>WELCOME TO AYNA BOOK QUANTUM</h1>
    <p>
      আপনার বিশ্ব, আপনার বন্ধু, আপনার গল্প — কোয়ান্টাম সুপার স্পিড মাল্টিমিডিয়া সোশাল নেটওয়ার্কে আজীবন অটো-আপডেটসহ যুক্ত থাকুন।
    </p>
  </section>

  <section class="quantum-bar" aria-label="Quantum Telemetry">
    <div class="q-stat">
      <span class="q-stat-label">Quantum Sync State</span>
      <span class="q-stat-value" id="qSyncState">ENTANGLED • 99.9%</span>
    </div>
    <div class="q-stat">
      <span class="q-stat-label">Lifelong Auto-Update</span>
      <span class="q-stat-value" id="qAutoSyncStatus">ACTIVE • LIVE</span>
    </div>
    <div class="q-stat">
      <span class="q-stat-label">Total Registry Items</span>
      <span class="q-stat-value" id="qFileCount">192</span>
    </div>
  </section>

  <!-- সময় বলার ঘড়ি প্যানেল (১ ঘণ্টা পর পর স্বয়ংক্রিয় ঘোষণা) -->
  <section class="panel" id="talkingClockSection">
    <h2>🕒 রিয়েল-টাইম কথা বলার ঘড়ি ও সেহরি-ইফতার ঘোষণা</h2>
    <div class="clock-live-box">
      <span class="clock-live-time" id="quantumClockDisplay">লোড হচ্ছে...</span>
      <div class="clock-rules-text">
        • প্রতি ১ ঘণ্টা পর পর স্বয়ংক্রিয়ভাবে রিয়েল-টাইম সময় ঘোষণা (পরবর্তী ঘণ্টা: <strong id="nextHourlyAnnouncement">--</strong>)<br>
        • সেহরির ১.৫ ঘণ্টা আগে ঘোষণা (ভিত্তি: 04:58 AM)<br>
        • ইফতারের ১ ঘণ্টা আগে থেকে প্রতি ৫ মিনিটে ঘোষণা (ভিত্তি: 05:12 PM)
      </div>
    </div>
    <div class="media-buttons">
      <button type="button" id="toggleTalkClockBtn">🔊 ১ ঘণ্টা পর পর অটো সময়: চালু</button>
      <button type="button" id="speakNowClockBtn">🎙️ এখনই সময় বলুন</button>
    </div>
  </section>

  <section class="profile-bar">
    <img id="myPhoto" alt="Profile photo">
    <div class="profile-info">
      <strong id="myName">লোড হচ্ছে...</strong>
      <small id="myEmail">আপনার AYNA BOOK অ্যাকাউন্ট</small>
    </div>
    <a href="profile.html" style="color:#fff6b3;text-decoration:none;font-weight:bold;font-size:34px;">
      প্রোফাইল
    </a>
  </section>

  <h2 class="section-title">🌍 AYNA BOOK MAIN FEATURES (২ সারি — ৮টি)</h2>

  <section class="feature-grid-8">
    <a class="feature-card" href="profile.html">
      <span class="feature-icon">👤</span>
      <span class="feature-name">আমার প্রোফাইল</span>
      <span class="feature-desc">ব্যক্তিগত অ্যাকাউন্ট</span>
    </a>

    <a class="feature-card" href="messenger.html">
      <span class="feature-icon">💬</span>
      <span class="feature-name">AYNA Messenger</span>
      <span class="feature-desc">মেসেজ, অডিও, ভিডিও ও ফাইল</span>
    </a>

    <a class="feature-card" href="notifications.html">
      <span class="feature-icon">🔔</span>
      <span class="feature-name">নোটিফিকেশন</span>
      <span class="feature-desc">সব আপডেট</span>
    </a>

    <a class="feature-card" href="radio.html">
      <span class="feature-icon">📻</span>
      <span class="feature-name">বিশ্ব রেডিও</span>
      <span class="feature-desc">রেডিও শুনুন</span>
    </a>

    <a class="feature-card" href="tv-live.html">
      <span class="feature-icon">📺</span>
      <span class="feature-name">বিশ্ব টেলিভিশন</span>
      <span class="feature-desc">টিভি দেখুন</span>
    </a>

    <a class="feature-card" href="gps.html">
      <span class="feature-icon">🛰️</span>
      <span class="feature-name">GPS নেভিগেশন</span>
      <span class="feature-desc">অবস্থান ও দিকনির্দেশ</span>
    </a>

    <a class="feature-card" href="compass.html">
      <span class="feature-icon">🧭</span>
      <span class="feature-name">ডিজিটাল কম্পাস</span>
      <span class="feature-desc">দিক নির্ণয়</span>
    </a>

    <a class="feature-card" href="radar.html">
      <span class="feature-icon">📡</span>
      <span class="feature-name">রাডার সিস্টেম</span>
      <span class="feature-desc">রাডার পেজ</span>
    </a>
  </section>

  <h2 class="section-title">✨ MORE AYNA BOOK FEATURES &amp; DIRECTORIES</h2>

  <section class="feature-grid-more">
    <a class="feature-card" href="world-leaders.html">
      <span class="feature-icon">🌐</span>
      <span class="feature-name">বিশ্বনেতা</span>
      <span class="feature-desc">আন্তর্জাতিক নেতৃত্ব ও তথ্য</span>
    </a>

    <a class="feature-card" href="world-grocery.html">
      <span class="feature-icon">🛒</span>
      <span class="feature-name">বিশ্ব মুদির দোকান</span>
      <span class="feature-desc">দৈনিক মূল্য অটো আপডেট</span>
    </a>

    <a class="feature-card" href="world-farmers.html">
      <span class="feature-icon">🌾</span>
      <span class="feature-name">বিশ্ব কৃষক</span>
      <span class="feature-desc">কৃষি তথ্য, ফসল ও বাজার দর</span>
    </a>

    <a class="feature-card" href="poultry-farmers.html">
      <span class="feature-icon">🐔</span>
      <span class="feature-name">পোলোট্রি কৃষক ও ব্যবসায়ী</span>
      <span class="feature-desc">মুরগি, ডিম, ফিড ও বাজার দর</span>
    </a>

    <a class="feature-card" href="price-list.html">
      <span class="feature-icon">📊</span>
      <span class="feature-name">দৈনিক মূল্যতালিকা</span>
      <span class="feature-desc">মুদি, কৃষি ও পোলোট্রি অটো-সিঙ্ক</span>
    </a>

    <a class="feature-card" href="world-market.html">
      <span class="feature-icon">🌍</span>
      <span class="feature-name">দৈনিক বিশ্ব বাজার</span>
      <span class="feature-desc">আন্তর্জাতিক ও দেশীয় বাজার দর</span>
    </a>

    <a class="feature-card" href="world-officials.html">
      <span class="feature-icon">🏛️</span>
      <span class="feature-name">এমপি, মন্ত্রী ও কর্মকর্তা</span>
      <span class="feature-desc">বিশ্ব প্রশাসন ও জনপ্রতিনিধি</span>
    </a>

    <a class="feature-card" href="air-rail-transport.html">
      <span class="feature-icon">✈️</span>
      <span class="feature-name">বিমান ও রেল পরিবহণ</span>
      <span class="feature-desc">ফোন, জিমেইল ও টিকেট মূল্যতালিকা</span>
    </a>

    <a class="feature-card" href="world-air-rail.html">
      <span class="feature-icon">🚆</span>
      <span class="feature-name">বিশ্ব বিমান ও রেল</span>
      <span class="feature-desc">আন্তর্জাতিক পরিবহণ ও টিকেট দর</span>
    </a>

    <a class="feature-card" href="world-garments.html">
      <span class="feature-icon">👕</span>
      <span class="feature-name">বিশ্ব গার্মেন্টস</span>
      <span class="feature-desc">মালিক, শ্রমিক ও পোশাক শিল্প</span>
    </a>

    <a class="feature-card" href="world-jobs.html">
      <span class="feature-icon">💼</span>
      <span class="feature-name">চাকুরী বাজার</span>
      <span class="feature-desc">সরকারি, বেসরকারি ও আন্তর্জাতিক</span>
    </a>

    <a class="feature-card" href="world-ngo-rights.html">
      <span class="feature-icon">🕊️</span>
      <span class="feature-name">UN, NGO ও মানবাধিকার</span>
      <span class="feature-desc">নাম, ফোন ও জিমেইল ডিরেক্টরি</span>
    </a>

    <a class="feature-card" href="military-radar.html">
      <span class="feature-icon">🎯</span>
      <span class="feature-name">মিলিটারি রাডার</span>
      <span class="feature-desc">তথ্যভিত্তিক রাডার</span>
    </a>

    <a class="feature-card" href="clock.html">
      <span class="feature-icon">🕒</span>
      <span class="feature-name">বিশ্ব ঘড়ি</span>
      <span class="feature-desc">সময় ও অ্যালার্ম</span>
    </a>

    <a class="feature-card" href="calendar.html">
      <span class="feature-icon">📅</span>
      <span class="feature-name">বিশ্ব ক্যালেন্ডার</span>
      <span class="feature-desc">তারিখ ও দিন</span>
    </a>

    <a class="feature-card" href="arabic-calendar.html">
      <span class="feature-icon">🌙</span>
      <span class="feature-name">আরবি ক্যালেন্ডার</span>
      <span class="feature-desc">হিজরি তারিখ</span>
    </a>

    <a class="feature-card" href="world-holidays.html">
      <span class="feature-icon">🎉</span>
      <span class="feature-name">বিশ্বের সরকারি ছুটি</span>
      <span class="feature-desc">ছুটির তালিকা</span>
    </a>

    <a class="feature-card" href="us-alerts.html">
      <span class="feature-icon">🚨</span>
      <span class="feature-name">জরুরি এলার্ট</span>
      <span class="feature-desc">এলার্ট তথ্য</span>
    </a>

    <a class="feature-card" href="prayer.html">
      <span class="feature-icon">🕌</span>
      <span class="feature-name">নামাজের সময়</span>
      <span class="feature-desc">প্রার্থনার সময়সূচি</span>
    </a>

    <a class="feature-card" href="quantum.html">
      <span class="feature-icon">⚛️</span>
      <span class="feature-name">কোয়ান্টাম হাব</span>
      <span class="feature-desc">কোয়ান্টাম সিস্টেম</span>
    </a>

    <a class="feature-card" href="supercomputer.html">
      <span class="feature-icon">🖥️</span>
      <span class="feature-name">সুপারকম্পিউটার</span>
      <span class="feature-desc">উচ্চগতির তথ্য</span>
    </a>
  </section>

  <!-- রাষ্ট্রনেতাদের নাম তালিকা -->
  <section class="panel" id="worldLeadersSection">
    <div class="panel-head-row">
      <h2>🌍 রাষ্ট্রনেতাদের নাম তালিকা</h2>
      <a href="world-leaders.html" class="panel-link-btn">সব রাষ্ট্রনেতা পেজ</a>
    </div>
    <input
      type="search"
      id="leaderSearchInput"
      class="hub-search-input"
      placeholder="রাষ্ট্রনেতা বা দেশের নাম দিয়ে খুঁজুন..."
    >
    <div class="hub-cards-grid" id="worldLeadersGrid"></div>
  </section>

  <!-- বিশ্ব আলেম গবেষণাগার -->
  <section class="panel" id="ulemaResearchSection">
    <div class="panel-head-row">
      <h2>🕌 বিশ্ব আলেম গবেষণাগার</h2>
      <a href="ulema-research.html" class="panel-link-btn">গবেষণাগার পেজ</a>
    </div>
    <input
      type="search"
      id="ulemaSearchInput"
      class="hub-search-input"
      placeholder="গবেষণার বিষয় বা বিভাগ খুঁজুন..."
    >
    <div class="hub-cards-grid" id="ulemaResearchGrid"></div>
  </section>

  <!-- মুদি বাজার ও বিশ্ব কৃষক -->
  <section class="panel" id="groceryFarmersSection">
    <div class="panel-head-row">
      <h2>🛒 মুদি বাজার ও 🌾 বিশ্ব কৃষক</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <a href="world-grocery.html" class="panel-link-btn">মুদি বাজার</a>
        <a href="world-farmers.html" class="panel-link-btn">বিশ্ব কৃষক</a>
      </div>
    </div>
    <div class="hub-controls-row">
      <select id="marketTypeSelect" class="hub-select">
        <option value="all">সব পণ্য (মুদি বাজার + বিশ্ব কৃষক)</option>
        <option value="grocery">শুধু মুদি বাজার</option>
        <option value="farmer">শুধু বিশ্ব কৃষক</option>
      </select>
      <input
        type="search"
        id="marketItemSearchInput"
        class="hub-search-input"
        placeholder="চাল, ডাল, তেল, আলু, গম, মসলা খুঁজুন..."
      >
    </div>
    <div class="hub-cards-grid" id="groceryFarmersGrid"></div>
  </section>

  <!-- বিশ্ব চাকুরীর বাজার — সরাসরি চাকুরীর বিজ্ঞাপন -->
  <section class="panel" id="worldJobsSection">
    <div class="panel-head-row">
      <h2>💼 বিশ্ব চাকুরীর বাজার — সরাসরি চাকুরীর বিজ্ঞাপন</h2>
      <a href="world-jobs.html" class="panel-link-btn">চাকুরী বাজার পেজ</a>
    </div>
    <input
      type="search"
      id="directJobSearchInput"
      class="hub-search-input"
      placeholder="পদবী, কোম্পানি বা লোকেশন দিয়ে চাকুরীর বিজ্ঞাপন খুঁজুন..."
    >
    <div class="hub-cards-grid" id="directJobsGrid"></div>
  </section>

  <!-- AYNA YOUTUBE HUB -->
  <section class="panel" id="youtubeHubSection">
    <h2>▶️ AYNA YOUTUBE HUB</h2>
    <div class="yt-input-row">
      <input
        type="text"
        id="ytSearchOrUrlInput"
        class="hub-search-input"
        style="margin:0;"
        placeholder="YouTube ভিডিও লিংক/ID দিন অথবা টপিক লিখে সার্চ করুন..."
      >
      <button type="button" id="ytPlaySearchBtn" class="yt-go-btn">চালান / খুঁজুন</button>
    </div>
    <div class="yt-preset-row">
      <button type="button" class="yt-preset-btn" data-yt="AYNA BOOK">AYNA BOOK</button>
      <button type="button" class="yt-preset-btn" data-yt="Bangla news live">বাংলা নিউজ</button>
      <button type="button" class="yt-preset-btn" data-yt="Islamic lecture Bangla">ইসলামি আলোচনা</button>
      <button type="button" class="yt-preset-btn" data-yt="Global agriculture farming">বিশ্ব কৃষি</button>
      <button type="button" class="yt-preset-btn" data-yt="Global job market career">বিশ্ব চাকুরী</button>
    </div>
    <iframe
      id="ytEmbedFrame"
      class="yt-player-frame"
      src="https://www.youtube.com/embed?listType=search&list=Bangla+news+live"
      title="AYNA YouTube Hub"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    ></iframe>
    <a
      id="ytDirectWatchLink"
      class="yt-ext-link"
      href="https://www.youtube.com/results?search_query=Bangla+news+live"
      target="_blank"
      rel="noopener"
    >
      ↗️ YouTube অ্যাপ বা ব্রাউজারে খুলুন
    </a>
  </section>

  <!-- POST CREATOR -->
  <section class="panel" id="createPost">
    <h2>✍️ নতুন কোয়ান্টাম পোস্ট তৈরি করুন</h2>

    <textarea
      id="postText"
      class="post-textarea"
      placeholder="আপনার মনের কথা লিখুন..."
    ></textarea>

    <div class="post-tools">
      <button type="button" class="tool-button" id="chooseImage">🖼️ ছবি (25MB)</button>
      <button type="button" class="tool-button" id="chooseAudio">🎵 অডিও (100MB)</button>
      <button type="button" class="tool-button" id="chooseVideo">🎬 বড় ভিডিও (250MB)</button>
      <button type="button" class="tool-button" id="chooseFile">📎 ফাইল (250MB)</button>
    </div>

    <div style="margin-top:16px;">
      <button type="button" class="tool-button" id="clearMedia" style="width:100%;">✖️ মিডিয়া / ফাইল বাদ দিন</button>
    </div>

    <input id="imageInput" type="file" accept="image/*" hidden>
    <input id="audioInput" type="file" accept="audio/*" hidden>
    <input id="videoInput" type="file" accept="video/*" hidden>
    <input id="fileInput" type="file" accept="*/*" hidden>

    <div class="progress-wrap" id="uploadProgressWrap">
      <div class="progress-bar" id="uploadProgressBar"></div>
    </div>

    <div class="preview" id="mediaPreview">
      <div id="previewContent"></div>
      <div class="preview-name" id="previewName"></div>
    </div>

    <button type="button" class="primary-button" id="publishPost">
      🚀 পোস্ট প্রকাশ করুন
    </button>

    <div class="status" id="postStatus">
      ছবি (25MB), অডিও (100MB), বড় ভিডিও (250MB) বা ফাইল (250MB) যুক্ত করে পোস্ট করুন।
    </div>
  </section>

  <!-- LIVE CAMERA -->
  <section class="panel media-box" id="liveSection">
    <h2>🔴 AYNA LIVE VIDEO</h2>

    <video id="liveVideo" autoplay muted playsinline></video>

    <div class="media-buttons">
      <button type="button" id="startCamera">📹 ক্যামেরা চালু</button>
      <button type="button" id="stopCamera">⏹ ক্যামেরা বন্ধ</button>
    </div>

    <div class="status" id="cameraStatus">
      ক্যামেরা এখন বন্ধ।
    </div>

    <p class="status">
      এটি আপনার ডিভাইসে লাইভ ক্যামেরা প্রিভিউ।
      অন্যদের কাছে সরাসরি সম্প্রচারের জন্য আলাদা লাইভ সার্ভার প্রয়োজন।
    </p>
  </section>

  <!-- FEED -->
  <h2 class="section-title">🌐 AYNA BOOK NEWS FEED</h2>

  <div class="feed-filters" role="group" aria-label="Feed filter">
    <button type="button" class="filter-btn active" data-filter="all">সব পোস্ট</button>
    <button type="button" class="filter-btn" data-filter="text">📝 টেক্সট</button>
    <button type="button" class="filter-btn" data-filter="image">🖼️ ছবি</button>
    <button type="button" class="filter-btn" data-filter="audio">🎵 অডিও</button>
    <button type="button" class="filter-btn" data-filter="video">🎬 ভিডিও</button>
    <button type="button" class="filter-btn" data-filter="file">📎 ফাইল</button>
  </div>

  <section id="feed">
    <div class="empty">পোস্ট লোড হচ্ছে...</div>
  </section>

  <!-- ফাইল ও ফোল্ডার তালিকা -->
  <section class="panel" id="fileRegistrySection">
    <h2>📁 AYNA BOOK ফাইল ও ফোল্ডার তালিকা (<span id="registryTotalLabel">192</span>টি)</h2>
    <input
      type="search"
      id="fileSearchInput"
      class="file-search-input"
      placeholder="ফাইল বা ফোল্ডারের নাম লিখে খুঁজুন..."
    >
    <div id="fileListGrid" class="file-list-grid"></div>
  </section>

</main>

<footer>
  © 2026 AYNA BOOK — Quantum Super-Speed Multimedia Social Platform
</footer>

<nav class="bottom-nav">
  <a href="index.html"><span>🏠</span>Home</a>
  <a href="#createPost"><span>➕</span>Post</a>
  <a href="messenger.html"><span>💬</span>Chat</a>
  <a href="profile.html"><span>👤</span>Profile</a>
</nav>

<script type="module">
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

$("qFileCount").textContent = String(AYNA_REGISTRY_ITEMS.length);
$("registryTotalLabel").textContent = String(AYNA_REGISTRY_ITEMS.length);

function renderFileRegistry(query = "") {
  const grid = $("fileListGrid");
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

$("fileSearchInput").addEventListener("input", e => {
  renderFileRegistry(e.target.value);
});

renderFileRegistry();

// রাষ্ট্রনেতাদের নাম তালিকা
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

// বিশ্ব আলেম গবেষণাগার
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

// মুদি বাজার ও বিশ্ব কৃষক বাজার (বিস্তৃত তালিকা)
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

let currentUsdToBdt = 120;

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

// বিশ্ব চাকুরীর বাজার — সরাসরি চাকুরীর বিজ্ঞাপন
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

// YouTube Hub
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

function notify(message) {
  const box = $("notice");
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    box.style.display = "none";
  }, 3200);
}

function safePhoto(photo) {
  return typeof photo === "string" && photo
    ? photo
আইকনে সমস্যা
আইডি খুঁজে পাওয়া যায়নি
aynabookofficel@gmail.com আইডি খুঁজে পাওয়া যায়নি অথবা সেটিতে ইমেল পাঠানো যায় না, তাই আপনার মেসেজটি পাঠানো যায়নি।
আরও জানুন
এই প্রতিক্রিয়া দেওয়া হয়েছে:
550 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces. For more information, go to https://support.google.com/mail/?p=NoSuchUser a640c23a62f3a-c513c2df93bsor489218266b.11 - gsmtp

