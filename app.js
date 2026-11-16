<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AYNA BOOK - 1 KOTI TRILLION SUPERFAST QUANTUM V100.0</title>
<style>
:root{--bg:#070b14;--card:#111827;--border:#1f2937;--glow:#38bdf8;--purple:#8b5cf6;--gold:#facc15;--text:#f8fafc;--muted:#94a3b8}
*{box-sizing:border-box;margin:0;padding:0;user-select:none}
body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;font-size:20px;line-height:1.65;overflow-x:hidden;min-height:100vh}
#authOverlay{position:fixed;inset:0;width:100vw;height:100vh;background:linear-gradient(135deg,#050811,#0f172a,#1e1b4b);z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto}
.auth-true-fullscreen{width:100%;max-width:520px;display:flex;flex-direction:column;justify-content:center}
.auth-brand-header{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px}
.auth-title{font-size:42px;font-weight:900;color:#FFFFFF;letter-spacing:1px;text-shadow:0 0 20px #38bdf8,0 0 40px #8b5cf6}
.auth-mode-tabs{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:rgba(15,23,42,.9);padding:6px;border-radius:16px;border:1px solid #334155;margin-bottom:22px;margin-top:10px}
.auth-tab-btn{background:transparent;border:none;color:var(--muted);padding:14px;border-radius:12px;font-size:18px;font-weight:800;cursor:pointer}
.auth-tab-btn.active{background:linear-gradient(90deg,#0284c7,#7c3aed);color:#fff;box-shadow:0 4px 20px rgba(56,189,248,.5)}
.auth-input,.auth-select{width:100%;background:rgba(9,13,22,.95);border:1px solid #334155;color:#fff;padding:16px 18px;border-radius:16px;font-size:18px;margin-bottom:16px;user-select:text}
.password-wrapper{position:relative;width:100%;margin-bottom:16px}
.password-wrapper .auth-input{margin-bottom:0;padding-right:55px}
.toggle-pass-btn{position:absolute;right:18px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--glow);font-size:24px;cursor:pointer}
.payment-box{background:rgba(250,204,21,.12);border:1px dashed var(--gold);padding:14px;border-radius:14px;font-size:16px;color:var(--gold);margin-bottom:16px;text-align:center}
.quantum-navbar{background:linear-gradient(90deg,#090d16,#1e1b4b,#090d16);border-bottom:2px solid var(--glow);padding:12px 18px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:1000}
.brand-title-wrapper{display:flex;align-items:center;gap:10px}
.brand-title{font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:.5px;text-shadow:0 0 18px #38bdf8}
.aquatic-glowing-star{width:16px;height:16px;min-width:16px;min-height:16px;background:#fff;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);animation:whiteGlow 1s infinite alternate}
@keyframes whiteGlow{0%{transform:scale(1);box-shadow:0 0 2px #fff;opacity:.4}100%{transform:scale(1.3);box-shadow:0 0 15px #fff,0 0 25px #38bdf8;opacity:1}}
.page-tabs-nav{display:flex;overflow-x:auto;background:#0f172a;border-bottom:2px solid #1e293b;padding:10px;gap:8px;position:sticky;top:62px;z-index:999;scrollbar-width:none}
.page-tabs-nav::-webkit-scrollbar{display:none}
.page-tab-btn{background:#1e293b;color:#cbd5e1;border:1px solid #334155;padding:10px 16px;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;white-space:nowrap}
.page-tab-btn.active{background:linear-gradient(90deg,#0284c7,#7c3aed);color:#fff;border-color:var(--glow)}
.app-container{max-width:820px;margin:0 auto;padding:18px 14px;display:none;min-height:85vh}
.app-page{display:none;animation:fadeIn .3s ease}
.app-page.active-page{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateX(15px)}to{opacity:1;transform:translateX(0)}}
.live-ticker-banner{background:linear-gradient(90deg,#0f172a,#1e1b4b,#0f172a);border:1px solid var(--glow);border-radius:16px;padding:12px 16px;margin-bottom:22px;display:flex;align-items:center;gap:12px}
.ticker-badge{background:#dc2626;color:#fff;padding:4px 10px;border-radius:8px;font-size:14px;font-weight:900;white-space:nowrap;animation:pulseGlow 1.5s infinite}
@keyframes pulseGlow{0%{opacity:.85}50%{opacity:1;box-shadow:0 0 10px #dc2626}100%{opacity:.85}}
.card-box{background:var(--card);border:1px solid var(--border);border-radius:22px;padding:22px;margin-bottom:22px;box-shadow:0 10px 30px rgba(0,0,0,.6)}
.btn-media{background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:11px 15px;border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.btn-post-quantum{background:linear-gradient(90deg,#0284c7,#7c3aed);color:#fff;border:none;padding:16px 28px;border-radius:16px;font-size:19px;font-weight:800;cursor:pointer;width:100%}
.composer-input-large{width:100%;background:#090d16;border:1px solid #334155;border-radius:16px;color:#fff;font-size:22px;padding:18px;min-height:160px;margin-bottom:15px;resize:vertical;user-select:text}
.cover-photo-wrapper{position:relative;height:210px;border-radius:18px 18px 0 0;overflow:hidden}
.cover-photo{width:100%;height:100%;object-fit:cover}
.edit-cover-btn{position:absolute;top:15px;right:15px;background:rgba(0,0,0,.7);color:#fff;border:1px solid #fff;padding:8px 14px;border-radius:10px;font-size:14px;cursor:pointer}
.profile-info-bar{padding:0 20px 20px;display:flex;justify-content:space-between;align-items:flex-end;margin-top:-65px;position:relative;flex-wrap:wrap;gap:15px}
.profile-pic{width:125px;height:125px;border-radius:50%;border:5px solid var(--card);object-fit:cover}
.edit-profile-btn{position:absolute;bottom:5px;right:5px;background:var(--glow);color:#000;border:none;width:34px;height:34px;border-radius:50%;font-weight:bold;cursor:pointer}
.menu-container{position:relative}
.three-dot-btn{background:#1e293b;border:1px solid #334155;color:#fff;width:38px;height:38px;border-radius:50%;font-size:18px;cursor:pointer}
.dropdown-menu{position:absolute;right:0;top:42px;background:#1e293b;border:1px solid var(--glow);border-radius:14px;display:none;z-index:100;width:160px;overflow:hidden}
.dropdown-menu button{width:100%;background:none;border:none;color:#fff;padding:12px 16px;text-align:left;font-size:16px;cursor:pointer}
.post-actions-bar{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:15px}
.action-btn{background:#0f172a;border:1px solid #1e293b;color:#e2e8f0;padding:10px 6px;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;text-align:center}
.radar-circle{width:200px;height:200px;border-radius:50%;border:3px solid #22c55e;margin:20px auto;position:relative;background:radial-gradient(circle,rgba(34,197,94,.2) 0%,rgba(7,11,20,.95) 70%);overflow:hidden}
.radar-sweep{width:50%;height:50%;background:linear-gradient(45deg,rgba(34,197,94,.8),transparent);position:absolute;top:0;left:50%;transform-origin:0% 100%;animation:radarSpin 2.5s linear infinite}
@keyframes radarSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.market-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:18px}
.market-item{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:15px}
.toast-notification{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,#0284c7,#7c3aed);color:#fff;padding:14px 28px;border-radius:35px;font-size:18px;font-weight:bold;display:none;z-index:6000;text-align:center}
.tvframe{width:100%;height:320px;border:0;background:#000;border-radius:14px;display:block}
.breakItem{border-bottom:1px solid #1e293b;padding:12px 0}
.breakItem b{font-size:19px;line-height:1.4;display:block}
.breakItem span{font-size:15px;color:var(--muted)}
.hidden{display:none!important}
</style>
</head>
<body id="mainBody">
<div id="authOverlay">
<div class="auth-true-fullscreen">
<div class="auth-brand-header"><div class="aquatic-glowing-star"></div><div class="auth-title">AYNA BOOK</div></div>
<p style="text-align:center;color:var(--muted);font-size:15px;margin-bottom:18px">⚡ ১ কোটি ট্রিলিয়ন সুপারফাস্ট কোয়ান্টাম • ফুল স্ক্রিন • V100.0</p>
<div class="auth-mode-tabs">
<button type="button" id="tabRegisterBtn" class="auth-tab-btn active" onclick="switchAuthMode('register')">🆕 রেজিস্ট্রেশন</button>
<button type="button" id="tabLoginBtn" class="auth-tab-btn" onclick="switchAuthMode('login')">🔑 লগইন</button>
</div>
<div id="registerFormBox">
<input type="text" id="regName" class="auth-input" placeholder="আপনার পুরো নাম">
<input type="tel" id="regPhone" class="auth-input" placeholder="ফোন নাম্বার (11 digits)" maxlength="11">
<input type="email" id="regEmail" class="auth-input" placeholder="জিমেইল এড্রেস">
<div class="password-wrapper"><input type="password" id="regPass" class="auth-input" placeholder="পাসওয়ার্ড (ঠিক ১১ সংখ্যার)" maxlength="11"><button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('regPass',this)">👁️</button></div>
<div class="password-wrapper"><input type="password" id="regRePass" class="auth-input" placeholder="রি-পাসওয়ার্ড (১১ সংখ্যার)" maxlength="11"><button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('regRePass',this)">👁️</button></div>
<select id="accType" class="auth-select" onchange="togglePaymentInfo()">
<option value="ব্যক্তিগত ফ্রি (Free)">১. ব্যক্তিগত ফ্রি ($0 - ১ বছর)</option>
<option value="বিজনেসম্যান (Business)">২. বিজনেসম্যান ($15 - ১ বছর)</option>
<option value="VIP একাউন্ট">৩. VIP একাউন্ট ($20 - ১ বছর)</option>
<option value="VVIP একাউন্ট">৪. VVIP একাউন্ট ($25 - ১ বছর)</option>
</select>
<div id="paymentInstructions" class="payment-box" style="display:none">💳 পেমেন্ট পাঠান: <b>01400751906</b> (বিকাশ, নগদ, রকেট, উপায়)<input type="text" id="trxId" class="auth-input" placeholder="TrxID দিন" style="margin-top:10px;margin-bottom:0"></div>
<button type="button" class="btn-post-quantum" onclick="handleRegister()">🚀 রেজিস্ট্রেশন সম্পন্ন করুন</button>
</div>
<div id="loginFormBox" style="display:none">
<input type="text" id="loginIdentifier" class="auth-input" placeholder="ফোন নাম্বার বা জিমেইল" value="01400751906">
<div class="password-wrapper"><input type="password" id="loginPass" class="auth-input" placeholder="আপনার ১১ সংখ্যার পাসওয়ার্ড" maxlength="11" value="01811820860"><button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('loginPass',this)">👁️</button></div>
<button type="button" class="btn-post-quantum" onclick="handleLogin()">🔑 লগইন করুন</button>
<button type="button" class="btn-post-quantum" style="background:#16a34a;margin-top:12px" onclick="forceLogin()">✅ Login না হলে এখানে চাপ দিন - FORCE LOGIN</button>
<p style="text-align:center;color:var(--muted);font-size:15px;margin-top:10px">Phone: 01400751906 • Pass: 01811820860</p>
</div>
</div>
</div>

<header class="quantum-navbar">
<div class="brand-title-wrapper"><div class="aquatic-glowing-star"></div><div class="brand-title">AYNA BOOK</div><span style="font-size:11px;background:rgba(56,189,248,.18);border:1px solid var(--glow);color:var(--glow);padding:2px 7px;border-radius:12px;font-weight:bold">1 KOTI TRILLION</span></div>
<div style="display:flex;gap:8px;align-items:center">
<button class="btn-media" style="padding:7px 11px;font-size:13px" onclick="toggleSecurityPanel()">🔐 পাসওয়ার্ড</button>
<button class="btn-media" style="padding:7px 11px;font-size:13px;border-color:#f87171;color:#fca5a5" onclick="logoutAccount()">🚪 লগআউট</button>
</div>
</header>

<nav class="page-tabs-nav" id="pageTabsNav" style="display:none">
<button class="page-tab-btn active" onclick="switchPage(0,this)">১. ✍️ বড় লেখা</button>
<button class="page-tab-btn" onclick="switchPage(1,this)">২. 🎬 ভিডিও</button>
<button class="page-tab-btn" onclick="switchPage(2,this)">৩. 📺 রেডিও ও টিভি</button>
<button class="page-tab-btn" onclick="switchPage(3,this)">৪. 🛍️ মার্কেট</button>
<button class="page-tab-btn" onclick="switchPage(4,this)">৫. 📍 GPS রাডার</button>
<button class="page-tab-btn" onclick="switchPage(5,this)">৬. 💬 MESSENGER</button>
<button class="page-tab-btn" onclick="switchPage(6,this)">৭. 🔔 নোটিফিকেশন</button>
<button class="page-tab-btn" onclick="switchPage(7,this)">৮. 👁️ ভিউ</button>
</nav>

<div class="app-container" id="mainAppContainer">
<div id="securityPanel" class="card-box" style="display:none;border-color:var(--glow)">
<h4 style="color:var(--glow);margin-bottom:12px">🔐 পাসওয়ার্ড ব্যবস্থাপনা</h4>
<div class="password-wrapper"><input type="password" id="currentSavedPass" class="auth-input" readonly><button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('currentSavedPass',this)">👁️</button></div>
<div class="password-wrapper"><input type="password" id="newUpdatePass" class="auth-input" placeholder="নতুন ১১ সংখ্যার পাসওয়ার্ড" maxlength="11"><button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('newUpdatePass',this)">👁️</button></div>
<button class="btn-post-quantum" onclick="updateAccountPassword()">💾 পাসওয়ার্ড আপডেট ও সেভ করুন</button>
</div>

<div id="page-0" class="app-page active-page">
<div class="card-box" style="padding:0;overflow:hidden">
<div class="cover-photo-wrapper"><img id="displayCoverImg" src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" class="cover-photo"><button class="edit-cover-btn" onclick="changeCoverPhoto()">📷 কভার এডিট</button></div>
<div class="profile-info-bar">
<div style="display:flex;align-items:flex-end;gap:15px">
<div style="position:relative"><img id="displayProfileImg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" class="profile-pic"><button class="edit-profile-btn" onclick="changeProfilePhoto()">✎</button></div>
<div><h2 id="displayUserName" style="font-size:26px">Mohammed Mahabub Alam</h2><p id="displayAccType" style="font-size:15px;color:var(--gold)">AYNA ID: 2026----10000001</p></div>
</div>
<button class="btn-media" style="border-color:var(--glow)" onclick="instantShareAccount()">⚡ QR ও ID শেয়ার</button>
</div>
</div>

<div class="live-ticker-banner"><div class="ticker-badge">🔴 LIVE NEWS & RADIO</div><marquee scrollamount="6" id="tickerText" style="font-size:17px;color:var(--gold);font-weight:bold">📡 যমুনা ও সময় টিভিতে সংবাদ চলছে | 📻 বাংলাদেশ বেতার ও ফুর্তি FM | ⚡ ১ কোটি ট্রিলিয়ন কোয়ান্টাম সিস্টেম সক্রিয়!</marquee></div>

<div class="card-box"><h3 style="color:var(--glow);margin-bottom:12px">🔴 VIRAL BREAKING • <span id="countryTitle">🇧🇩 Bangladesh</span></h3><div id="breakingList"><p>Login-এর পরে Breaking লোড হবে...</p></div><button class="btn-post-quantum" style="margin-top:12px" onclick="loadBreaking()">🔄 Breaking Refresh</button></div>

<div class="card-box">
<textarea id="postInput" class="composer-input-large" placeholder="আপনার মনের বড় লেখাটি এখানে লিখুন..."></textarea>
<div id="liveMediaPreview" style="margin-bottom:15px;display:none"><video id="liveCameraStream" autoplay muted playsinline style="width:100%;border-radius:14px;display:none;max-height:320px;background:#000"></video><div id="attachedMediaLabel" style="color:var(--gold);font-size:16px;font-weight:bold;margin-top:8px"></div></div>
<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between">
<label class="btn-media">🖼️ 8K ছবি<input type="file" accept="image/*" style="display:none" onchange="handleMediaUpload(this,'image')"></label>
<label class="btn-media">🎙️ অডিও<input type="file" accept="audio/*" style="display:none" onchange="handleMediaUpload(this,'audio')"></label>
<label class="btn-media">🎬 ভিডিও<input type="file" accept="video/*" style="display:none" onchange="handleMediaUpload(this,'video')"></label>
<button type="button" class="btn-media" style="border-color:#ef4444;color:#fca5a5" onclick="startLiveVideoStream()">🔴 লাইভ ভিডিও</button>
<button type="button" class="btn-post-quantum" style="width:auto;padding:12px 22px;font-size:17px" onclick="createQuantumPost()">🚀 পোস্ট করুন</button>
</div>
</div>
<div id="feedContainer"></div>
</div>

<div id="page-1" class="app-page">
<div class="card-box"><h3 style="color:var(--glow);margin-bottom:14px">🎬 ৮K ভিডিও ও রিলস</h3><video controls style="width:100%;border-radius:16px;background:#000;margin-bottom:14px" poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80"><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"></video><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:18px">🔥 ট্রেন্ডিং কোয়ান্টাম রিলস</span><button class="btn-media" onclick="notify('❤️ ভিডিওতে রিয়্যাক্ট যুক্ত হয়েছে!')">❤️ লাইক (18.9K)</button></div></div>
</div>

<div id="page-2" class="app-page">
<div class="card-box"><h3 style="color:var(--glow);margin-bottom:14px">📺 দেশ অনুযায়ী লাইভ টিভি ও রেডিও</h3>
<select id="countrySelect" class="auth-select" onchange="changeCountryManual()"><option value="AUTO">🌍 Auto - যে দেশে আছি</option><option value="BD">🇧🇩 Bangladesh</option><option value="IN">🇮🇳 India</option><option value="SA">🇸🇦 Saudi Arabia</option><option value="US">🇺🇸 USA</option><option value="GB">🇬🇧 Britain</option><option value="WORLD">🌍 World</option></select>
<iframe id="liveTvFrame" class="tvframe" src="" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">
<button class="btn-media" style="justify-content:center;padding:18px" onclick="setTv('jamuna')">📺 যমুনা TV LIVE</button>
<button class="btn-media" style="justify-content:center;padding:18px" onclick="setTv('somoy')">📺 সময় TV LIVE</button>
<button class="btn-media" style="justify-content:center;padding:18px" onclick="setTv('ekattor')">📺 একাত্তর TV LIVE</button>
<button class="btn-media" style="justify-content:center;padding:18px" onclick="setTv(' 【entity-bbc¦canonical_name=BBC】')">📺 【entity-BBC¦canonical_name=BBC】 LIVE</button>
<button class="btn-media" style="justify-content:center;padding:18px" onclick="playRadioTone('বাংলাদেশ বেতার FM')">📻 বাংলাদেশ বেতার FM</button>
<button class="btn-media" style="justify-content:center;padding:18px" onclick="playRadioTone('রেডিও ফুর্তি 88.0')">📻 রেডিও ফুর্তি 88.0</button>
</div>
<div id="tvRadioStatus" style="margin-top:18px;padding:14px;background:#090d16;border-radius:12px;color:var(--gold);text-align:center;font-size:17px">📡 চ্যানেল নির্বাচন করে লাইভ সম্প্রচার উপভোগ করুন</div>
<button class="btn-post-quantum" style="margin-top:12px" onclick="openFullTV()">⛶ FULL SCREEN LIVE TV</button>
</div>
</div>

<div id="page-3" class="app-page">
<div class="card-box"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="color:var(--glow)">🛍️ AYNA মার্কেটিং প্লেস</h3><button class="btn-post-quantum" style="width:auto;padding:10px 16px;font-size:15px" onclick="addMarketProduct()">+ পণ্য যোগ করুন</button></div>
<div class="market-grid" id="marketGrid">
<div class="market-item"><div style="font-weight:bold;color:var(--gold);font-size:18px">📱 iPhone 16 Pro Max (8K)</div><div style="font-size:17px;margin:8px 0">মূল্য: ৳১,৪৫,০০০</div><button class="btn-media" style="width:100%;justify-content:center" onclick="notify('💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!')">কিনুন / মেসেজ</button></div>
<div class="market-item"><div style="font-weight:bold;color:var(--gold);font-size:18px">⌚ Quantum Smart Watch</div><div style="font-size:17px;margin:8px 0">মূল্য: ৳৪,৫০০</div><button class="btn-media" style="width:100%;justify-content:center" onclick="notify('💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!')">কিনুন / মেসেজ</button></div>
</div></div>
</div>

<div id="page-4" class="app-page">
<div class="card-box" style="text-align:center"><h3 style="color:var(--glow);margin-bottom:12px">📍 লাইভ GPS, রাডার ও কম্পাস</h3><div class="radar-circle"><div class="radar-sweep"></div></div><p id="gpsCoordsText" style="color:var(--gold);font-weight:bold;margin-bottom:15px;font-size:18px">স্যাটেলাইট স্ট্যাটাস: স্ক্যান করার জন্য নিচের বাটনে চাপুন</p><div style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap"><button class="btn-post-quantum" style="width:auto" onclick="activateGPSLocation()">📍 লাইভ GPS অবস্থান নির্ণয়</button><button class="btn-media" onclick="notify('🧭 কম্পাস ক্যালিব্রেটেড: উত্তর দিক (0° North)')">🧭 কম্পাস রিফ্রেশ</button></div></div>
</div>

<div id="page-5" class="app-page">
<div class="card-box" style="border-color:var(--purple)"><h3 style="color:#38bdf8;margin-bottom:10px">💬 AYNA MESSENGER GLOBAL AI</h3><p style="font-size:15px;color:var(--muted);margin-bottom:16px">৭,০০০+ ভাষা অটো-ট্রান্সলেটর এবং ১ কোটি ট্রিলিয়ন কোয়ান্টাম ফাইল ট্রান্সফার</p>
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
<select id="worldAllLangs" class="auth-select" style="margin-bottom:0;flex:1"><option value="bn">🇧🇩 বাংলা</option><option value="en">🇺🇸 English</option><option value="ar">🇸🇦 Arabic</option><option value="hi">🇮🇳 Hindi</option><option value="all-global">✨ পৃথিবীর সমস্ত ৭,০০০+ ভাষা</option></select>
<button class="btn-media" onclick="translateAllLanguages()">🎙️ ভাষান্তর</button>
<label class="btn-media" style="border-color:var(--gold);color:var(--gold)">📁 ফাইল পাঠান<input type="file" style="display:none" onchange="sendLargeQuantumFile(this)"></label>
</div>
<div id="chatBoxGlobal"><div style="background:#1e293b;padding:16px;border-radius:16px;border-left:5px solid var(--glow)"><div style="font-size:15px;color:var(--muted)">বন্ধু:</div><div style="font-size:18px;margin:6px 0">"Hello! Sending 8K files at 1 Koti Trillion Quantum speed."</div><div id="aiGlobalTranslatedOutput" style="color:var(--gold);font-weight:bold;font-size:18px">🤖 AI অনুবাদ: "হ্যালো! ১ কোটি ট্রিলিয়ন কোয়ান্টাম গতিতে ৮কে ফাইল পাঠাচ্ছি।"</div></div></div>
</div>
</div>

<div id="page-6" class="app-page">
<div class="card-box"><h3 style="color:var(--glow);margin-bottom:14px">🔔 নোটিফিকেশন</h3><div style="background:#090d16;padding:14px;border-radius:14px;margin-bottom:12px;border-left:5px solid #22c55e;font-size:18px">✅ অ্যাকাউন্ট ফুল-স্ক্রিন কোয়ান্টাম সিস্টেমে স্থায়ীভাবে সেভ হয়েছে।</div><div style="background:#090d16;padding:14px;border-radius:14px;margin-bottom:12px;border-left:5px solid var(--glow);font-size:18px">👍 রিফ্রেশ করলে আর রেজিস্ট্রেশন পেইজ আসবে না।</div></div>
</div>

<div id="page-7" class="app-page">
<div class="card-box"><h3 style="color:var(--glow);margin-bottom:16px">👁️ লাইভ ভিউয়ার ও রিয়্যাক্ট</h3><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;text-align:center"><div style="background:#090d16;padding:20px;border-radius:16px;border:1px solid #334155"><div style="font-size:32px;font-weight:900;color:var(--glow)">১০,৫০০+</div><div style="font-size:16px;color:var(--muted);margin-top:5px">👁️ মোট ভিউয়ার্স</div></div><div style="background:#090d16;padding:20px;border-radius:16px;border:1px solid #334155"><div style="font-size:32px;font-weight:900;color:#f43f5e">৩,৪২০+</div><div style="font-size:16px;color:var(--muted);margin-top:5px">❤️ লাইক</div></div><div style="background:#090d16;padding:20px;border-radius:16px;border:1px solid #334155"><div style="font-size:32px;font-weight:900;color:var(--gold)">১,৮৯০</div><div style="font-size:16px;color:var(--muted);margin-top:5px">😮 ওয়াও</div></div><div style="background:#090d16;padding:20px;border-radius:16px;border:1px solid #334155"><div style="font-size:32px;font-weight:900;color:#22c55e">1 KOTI T</div><div style="font-size:16px;color:var(--muted);margin-top:5px">⚡ ১ কোটি ট্রিলিয়ন গতি</div></div></div></div>
</div>
</div>
<div id="toast" class="toast-notification"></div>
<script>
var STORAGE_USER_KEY="ayna_book_user_1kotiT";var STORAGE_SESSION_KEY="ayna_book_logged_in_1kotiT";var STORAGE_POSTS_KEY="ayna_book_posts_1kotiT";
var memoryUser=null;var memoryLogged=false;var currentCountry="BD";var currentLang="bn";var currentTv="jamuna";var isLoggedIn=false;
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRemove(k){try{localStorage.removeItem(k)}catch(e){}}
function showApp(user){isLoggedIn=true;memoryLogged=true;document.getElementById('authOverlay').style.display='none';document.getElementById('pageTabsNav').style.display='flex';document.getElementById('mainAppContainer').style.display='block';if(user)applyUserToUI(user);var f=document.getElementById('liveTvFrame');if(f)f.src="https://www.youtube.com/embed/live_stream?channel=UCN6sm8iHiPd0cnoUardDAnw&autoplay=1&mute=1";detectCountry();loadBreaking();window.scrollTo(0,0)}
function forceLogin(){var u=memoryUser||{name:"Mohammed Mahabub Alam",phone:"01400751906",email:"mahbub.uk.cox@gmail.com",pass:"01811820860",accType:"ব্যক্তিগত ফ্রি (Free)"};memoryUser=u;showApp(u);notify("✅ FORCE LOGIN সফল! স্বাগতম Mohammed Mahabub Alam")}
function switchAuthMode(mode){var r=document.getElementById('registerFormBox');var l=document.getElementById('loginFormBox');var tr=document.getElementById('tabRegisterBtn');var tl=document.getElementById('tabLoginBtn');if(mode==='register'){r.style.display='block';l.style.display='none';tr.classList.add('active');tl.classList.remove('active')}else{r.style.display='none';l.style.display='block';tl.classList.add('active');tr.classList.remove('active')}}
function handleRegister(){var name=document.getElementById('regName').value.trim();var phone=document.getElementById('regPhone').value.trim();var email=document.getElementById('regEmail').value.trim();var pass=document.getElementById('regPass').value;var re=document.getElementById('regRePass').value;var acc=document.getElementById('accType').value;if(!name||!phone||!email){alert("নাম, ফোন, জিমেইল পূরণ করুন");return}if(pass.length!==11){alert("পাসওয়ার্ড ঠিক ১১ সংখ্যার হতে হবে!");return}if(pass!==re){alert("পাসওয়ার্ড মিলছে না!");return}var u={name:name,phone:phone,email:email,pass:pass,accType:acc,profileImg:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",coverImg:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"};memoryUser=u;memoryLogged=true;safeSet(STORAGE_USER_KEY,JSON.stringify(u));safeSet(STORAGE_SESSION_KEY,"true");showApp(u);notify("✨ স্বাগতম "+name+"! একাউন্ট তৈরি হয়েছে।")}
function handleLogin(){var id=document.getElementById('loginIdentifier').value.trim();var pass=document.getElementById('loginPass').value;if(id===""&&pass===""){forceLogin();return}if(id==="01400751906"&&pass==="01811820860"){var u={name:"Mohammed Mahabub Alam",phone:"01400751906",email:"mahbub.uk.cox@gmail.com",pass:"01811820860",accType:"ব্যক্তিগত ফ্রি (Free)"};memoryUser=u;memoryLogged=true;safeSet(STORAGE_USER_KEY,JSON.stringify(u));safeSet(STORAGE_SESSION_KEY,"true");showApp(u);notify("🔑 লগইন সফল! স্বাগতম Mohammed Mahabub Alam");return}var saved=safeGet(STORAGE_USER_KEY);if(saved){try{var ud=JSON.parse(saved);if((id===ud.phone||id===ud.email)&&pass===ud.pass){memoryUser=ud;memoryLogged=true;safeSet(STORAGE_SESSION_KEY,"true");showApp(ud);notify("🔑 লগইন সফল! স্বাগতম "+ud.name);return}}catch(e){}}if(memoryUser&&(id===memoryUser.phone||id===memoryUser.email)&&pass===memoryUser.pass){showApp(memoryUser);return}if(id.length>=10&&pass.length===11){forceLogin();return}alert("ভুল ফোন/জিমেইল অথবা ১১ সংখ্যার পাসওয়ার্ড!")}
function logoutAccount(){memoryLogged=false;isLoggedIn=false;safeSet(STORAGE_SESSION_KEY,"false");document.getElementById('authOverlay').style.display='flex';document.getElementById('pageTabsNav').style.display='none';document.getElementById('mainAppContainer').style.display='none';switchAuthMode('login');notify("🚪 লগআউট সম্পন্ন।")}
function applyUserToUI(u){try{document.getElementById('currentSavedPass').value=u.pass||""}catch(e){}document.getElementById('displayUserName').innerText=u.name||"Mohammed Mahabub Alam";document.getElementById('displayAccType').innerText="AYNA ID: 2026----10000001 • "+(u.accType||"");if(u.profileImg)document.getElementById('displayProfileImg').src=u.profileImg;if(u.coverImg)document.getElementById('displayCoverImg').src=u.coverImg}
function openMainAppDirectly(){showApp(memoryUser)}
function updateAccountPassword(){var np=document.getElementById('newUpdatePass').value;if(np.length!==11){alert("নতুন পাসওয়ার্ড ঠিক ১১ সংখ্যার হতে হবে!");return}if(memoryUser)memoryUser.pass=np;var s=safeGet(STORAGE_USER_KEY);if(s){try{var u=JSON.parse(s);u.pass=np;safeSet(STORAGE_USER_KEY,JSON.stringify(u))}catch(e){}}document.getElementById('currentSavedPass').value=np;document.getElementById('newUpdatePass').value="";notify("🔐 পাসওয়ার্ড আপডেট ও সেভ হয়েছে!")}
function changeProfilePhoto(){var url=prompt("প্রোফাইল ছবির নতুন লিংক দিন:");if(url){document.getElementById('displayProfileImg').src=url;if(memoryUser)memoryUser.profileImg=url;notify("🖼️ প্রোফাইল ছবি সেভ হয়েছে!")}}
function changeCoverPhoto(){var url=prompt("কভার ছবির নতুন লিংক দিন:");if(url){document.getElementById('displayCoverImg').src=url;if(memoryUser)memoryUser.coverImg=url;notify("🖼️ কভার ছবি সেভ হয়েছে!")}}
function loadSavedPosts(){var container=document.getElementById('feedContainer');var saved=safeGet(STORAGE_POSTS_KEY);if(!saved||saved==="[]"){container.innerHTML='<article class="card-box"><div style="display:flex;align-items:center;gap:12px"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" style="width:52px;height:52px;border-radius:50%;object-fit:cover"><div><div style="font-weight:800;font-size:18px">AYNA BOOK Global</div><div style="font-size:14px;color:var(--muted)">এইমাত্র • 1 Koti Trillion Quantum</div></div></div><p style="font-size:22px;margin:14px 0">AYNA BOOK ১ কোটি ট্রিলিয়ন কোয়ান্টাম সংস্করণে স্বাগতম! সোয়াইপ করে ৮টি পেইজ পরিবর্তন করুন।</p></article>';return}try{container.innerHTML=JSON.parse(saved).join('')}catch(e){}}
function saveCurrentPostsToStorage(){try{var arts=Array.from(document.getElementById('feedContainer').children).map(function(el){return el.outerHTML});safeSet(STORAGE_POSTS_KEY,JSON.stringify(arts))}catch(e){}}
var touchStartX=0;var touchEndX=0;var currentPageIndex=0;var totalPages=8;
document.getElementById('mainBody').addEventListener('touchstart',function(e){touchStartX=e.changedTouches[0].screenX},false);
document.getElementById('mainBody').addEventListener('touchend',function(e){touchEndX=e.changedTouches[0].screenX;if(touchEndX+50<touchStartX&&currentPageIndex<totalPages-1){currentPageIndex++;navigateToPage(currentPageIndex)}else if(touchEndX>touchStartX+50&&currentPageIndex>0){currentPageIndex--;navigateToPage(currentPageIndex)}},false);
function switchPage(index){currentPageIndex=index;navigateToPage(index)}
function navigateToPage(index){document.querySelectorAll('.app-page').forEach(function(p,idx){p.classList.toggle('active-page',idx===index)});document.querySelectorAll('.page-tab-btn').forEach(function(b,idx){b.classList.toggle('active',idx===index)});var btn=document.querySelectorAll('.page-tab-btn')[index];if(btn)btn.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});playWorldClassSound()}
function togglePasswordVisibility(id,btn){var f=document.getElementById(id);if(f.type==="password"){f.type="text";btn.innerText="🙈"}else{f.type="password";btn.innerText="👁️"}}
function toggleSecurityPanel(){var p=document.getElementById('securityPanel');p.style.display=p.style.display==='none'?'block':'none'}
function togglePaymentInfo(){var t=document.getElementById('accType').value;document.getElementById('paymentInstructions').style.display=t.indexOf('Free')>=0?'none':'block'}
var uploadedMediaHTML="";var activeLiveStream=null;
function handleMediaUpload(input,type){if(input.files&&input.files[0]){var file=input.files[0];var url=URL.createObjectURL(file);document.getElementById('liveMediaPreview').style.display='block';document.getElementById('attachedMediaLabel').innerText="✅ সংযুক্ত: "+file.name;if(type==='image')uploadedMediaHTML='<img src="'+url+'" style="width:100%;border-radius:14px;margin-bottom:14px">';else if(type==='audio')uploadedMediaHTML='<audio controls src="'+url+'" style="width:100%;margin-bottom:14px"></audio>';else if(type==='video')uploadedMediaHTML='<video controls src="'+url+'" style="width:100%;border-radius:14px;margin-bottom:14px;max-height:350px"></video>';notify("✅ "+file.name+" লোড হয়েছে!")}}
function startLiveVideoStream(){var box=document.getElementById('liveMediaPreview');var v=document.getElementById('liveCameraStream');var label=document.getElementById('attachedMediaLabel');if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(function(s){activeLiveStream=s;box.style.display='block';v.style.display='block';v.srcObject=s;label.innerText="🔴 লাইভ ভিডিও চালু আছে!";uploadedMediaHTML='<div style="background:#dc2626;color:#fff;padding:6px 14px;border-radius:8px;display:inline-block;font-weight:bold;margin-bottom:10px">🔴 LIVE STREAMING</div>';notify("🔴 লাইভ ভিডিও সচল!")}).catch(function(){box.style.display='block';label.innerText="🔴 লাইভ ব্রডকাস্ট প্রস্তুত!";uploadedMediaHTML='<div style="background:#dc2626;color:#fff;padding:6px 14px;border-radius:8px;display:inline-block;font-weight:bold;margin-bottom:10px">🔴 LIVE BROADCAST</div>';notify("🔴 লাইভ ব্রডকাস্ট সক্রিয়!")})}else{box.style.display='block';label.innerText="🔴 লাইভ ব্রডকাস্ট প্রস্তুত!";notify("🔴 লাইভ ব্রডকাস্ট সক্রিয়!")}}
function createQuantumPost(){var input=document.getElementById('postInput');var text=input.value.trim();if(!text&&!uploadedMediaHTML){notify("⚠️ কিছু লিখুন বা মিডিয়া নির্বাচন করুন।");return}var postId='post-'+Date.now();var userName=document.getElementById('displayUserName').innerText;var userImg=document.getElementById('displayProfileImg').src;var html='<article class="card-box" id="'+postId+'" data-likes="1" data-views="25"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div style="display:flex;align-items:center;gap:12px"><img src="'+userImg+'" style="width:52px;height:52px;border-radius:50%;object-fit:cover"><div><div style="font-weight:800;font-size:18px">'+userName+'</div><div style="font-size:14px;color:var(--muted)">এইমাত্র • 1 Koti Trillion Quantum</div></div></div><div class="menu-container"><button class="three-dot-btn" onclick="toggleMenu(\'menu-'+postId+'\')">⋮</button><div id="menu-'+postId+'" class="dropdown-menu"><button onclick="editPost(\''+postId+'\')">✏️ এডিট</button><button onclick="aiCorrectPost(\''+postId+'\')">🤖 AI সংশোধন</button><button onclick="deletePost(\''+postId+'\')" style="color:#f87171">🗑️ ডিলিট</button></div></div></div>'+uploadedMediaHTML+'<p id="text-'+postId+'" style="font-size:22px;margin-bottom:14px">'+text+'</p><div style="display:flex;justify-content:space-between;font-size:15px;color:var(--muted);border-bottom:1px solid #1f2937;padding-bottom:10px"><span id="like-count-'+postId+'">👍 ১ লাইক</span><span>👁️ ২৫ ভিউয়ার্স</span></div><div class="post-actions-bar"><button class="action-btn" onclick="likePost(\''+postId+'\')">👍 লাইক</button><button class="action-btn" onclick="toggleCommentBox(\''+postId+'\')">💬 কমেন্ট</button><button class="action-btn" onclick="notify(\'↗️ শেয়ার সম্পন্ন!\')">↗️ শেয়ার</button><button class="action-btn" onclick="notify(\'🔖 সেভ হয়েছে!\')">🔖 সেভ</button><button class="action-btn" onclick="copyPostText(\'text-'+postId+'\')">📋 কপি</button></div><div id="comments-'+postId+'" style="display:none;margin-top:14px;border-top:1px dashed #334155;padding-top:12px"><div id="comment-list-'+postId+'"></div><div style="display:flex;gap:10px;margin-top:10px"><input type="text" id="input-comm-'+postId+'" class="auth-input" style="margin-bottom:0;padding:10px" placeholder="কমেন্ট লিখুন..."><button class="btn-media" onclick="addComment(\''+postId+'\')">পোস্ট</button></div></div></article>';document.getElementById('feedContainer').insertAdjacentHTML('afterbegin',html);saveCurrentPostsToStorage();input.value="";uploadedMediaHTML="";document.getElementById('liveMediaPreview').style.display='none';document.getElementById('liveCameraStream').style.display='none';if(activeLiveStream){activeLiveStream.getTracks().forEach(function(t){t.stop()});activeLiveStream=null}notify("🚀 পোস্ট প্রকাশিত ও সেভ হয়েছে!")}
function toggleMenu(id){document.querySelectorAll('.dropdown-menu').forEach(function(m){if(m.id!==id)m.style.display='none'});var menu=document.getElementById(id);menu.style.display=menu.style.display==='block'?'none':'block'}
window.onclick=function(e){if(!e.target.matches('.three-dot-btn')){document.querySelectorAll('.dropdown-menu').forEach(function(m){m.style.display='none'})}}
function editPost(id){var el=document.getElementById('text-'+id);var v=prompt("পোস্ট এডিট করুন:",el.innerText);if(v!==null&&v.trim()!==""){el.innerText=v;saveCurrentPostsToStorage();notify("✏️ এডিট সম্পন্ন!")}}
function aiCorrectPost(id){var el=document.getElementById('text-'+id);if(el.innerText.indexOf("[AI সংশোধিত]")<0){el.innerText+=" ✨ [AI সংশোধিত]";saveCurrentPostsToStorage()}notify("🤖 AI সংশোধন সম্পন্ন!")}
function deletePost(id){document.getElementById(id).remove();saveCurrentPostsToStorage();notify("🗑️ পোস্ট ডিলিট হয়েছে।")}
function likePost(id){var art=document.getElementById(id);var likes=parseInt(art.getAttribute('data-likes'))+1;art.setAttribute('data-likes',likes);document.getElementById('like-count-'+id).innerText="👍 "+likes+" লাইক";saveCurrentPostsToStorage();notify("❤️ লাইক যুক্ত হয়েছে!")}
function toggleCommentBox(id){var b=document.getElementById('comments-'+id);b.style.display=b.style.display==='block'?'none':'block'}
function addComment(id){var input=document.getElementById('input-comm-'+id);var val=input.value.trim();if(!val)return;var cid='comm-'+Date.now();var html='<div style="display:flex;justify-content:space-between;background:#090d16;padding:10px 14px;border-radius:12px;margin-bottom:8px;font-size:17px" id="'+cid+'"><span>💬 '+val+'</span><div class="menu-container"><button class="three-dot-btn" style="width:28px;height:28px;font-size:14px" onclick="toggleMenu(\'menu-'+cid+'\')">⋮</button><div id="menu-'+cid+'" class="dropdown-menu"><button onclick="editComment(\''+cid+'\')">✏️ এডিট</button><button onclick="deleteComment(\''+cid+'\')" style="color:#f87171">🗑️ ডিলিট</button></div></div></div>';document.getElementById('comment-list-'+id).insertAdjacentHTML('beforeend',html);input.value="";saveCurrentPostsToStorage();notify("💬 কমেন্ট যুক্ত হয়েছে!")}
function editComment(cid){var span=document.getElementById(cid).querySelector('span');var v=prompt("কমেন্ট এডিট করুন:",span.innerText.replace('💬 ',''));if(v!==null&&v.trim()!==""){span.innerText="💬 "+v;saveCurrentPostsToStorage();notify("✏️ কমেন্ট এডিট সম্পন্ন!")}}
function deleteComment(cid){document.getElementById(cid).remove();saveCurrentPostsToStorage();notify("🗑️ কমেন্ট ডিলিট হয়েছে।")}
function copyPostText(id){if(navigator.clipboard)navigator.clipboard.writeText(document.getElementById(id).innerText);notify("📋 লেখা কপি হয়েছে!")}
function playRadioTone(ch){document.getElementById('tvRadioStatus').innerText="🔴 এখন চলছে: "+ch+" (1 Koti Trillion Hi-Fi Audio)";notify("📡 "+ch+" চালু হয়েছে!")}
function addMarketProduct(){var t=prompt("পণ্যের নাম লিখুন:");var p=prompt("পণ্যের মূল্য লিখুন (৳):");if(t&&p){document.getElementById('marketGrid').insertAdjacentHTML('afterbegin','<div class="market-item"><div style="font-weight:bold;color:var(--gold);font-size:18px">🆕 '+t+'</div><div style="font-size:17px;margin:8px 0">মূল্য: ৳'+p+'</div><button class="btn-media" style="width:100%;justify-content:center" onclick="notify(\'💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!\')">কিনুন / মেসেজ</button></div>');notify("🛍️ পণ্যটি মার্কেটপ্লেসে যুক্ত হয়েছে!")}}
function activateGPSLocation(){var el=document.getElementById('gpsCoordsText');if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){el.innerText="📍 লাইভ GPS: Latitude "+pos.coords.latitude.toFixed(4)+"°, Longitude "+pos.coords.longitude.toFixed(4)+"°";notify("📍 GPS লোকেশন নির্ণয় হয়েছে!")},function(){el.innerText="📍 স্যাটেলাইট GPS সক্রিয়: ঢাকা, বাংলাদেশ (23.8103° N, 90.4125° E)";notify("📍 GPS স্যাটেলাইট কানেক্টেড!")})}}
function instantShareAccount(){if(navigator.clipboard)navigator.clipboard.writeText("https://aynabook.quantum/id/2026----10000001");notify("⚡ AYNA ID ও QR লিংক কপি হয়েছে!")}
function translateAllLanguages(){var sel=document.getElementById('worldAllLangs');var name=sel.options[sel.selectedIndex].text;document.getElementById('aiGlobalTranslatedOutput').innerText="🤖 AI অনুবাদ ("+name+"): ১ কোটি ট্রিলিয়ন কোয়ান্টাম স্পিডে ভাষান্তর সম্পন্ন।";notify("🌐 '"+name+"' ভাষায় অনুবাদ সক্রিয়!")}
function sendLargeQuantumFile(input){if(input.files&&input.files[0]){var f=input.files[0];document.getElementById('chatBoxGlobal').insertAdjacentHTML('beforeend','<div style="background:#1e293b;padding:14px;border-radius:14px;margin-top:12px;border-left:5px solid var(--gold);font-size:17px">⚡ ফাইল পাঠানো হয়েছে: <b>'+f.name+'</b></div>');notify("🚀 "+f.name+" ১ কোটি ট্রিলিয়ন গতিতে পাঠানো হয়েছে!")}}
function playWorldClassSound(){try{var ctx=new (window.AudioContext||window.webkitAudioContext)();var osc=ctx.createOscillator();var gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(528,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(1056,ctx.currentTime+.2);gain.gain.setValueAtTime(.25,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.35);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.35)}catch(e){}}
function notify(msg){playWorldClassSound();var t=document.getElementById('toast');t.innerText=msg;t.style.display='block';setTimeout(function(){t.style.display='none'},3000)}
var TVS={ekattor:{name:"একাত্তর TV",url:"https://www.youtube.com/@ekattortelevision/live"},jamuna:{name:"যমুনা TV",url:"https://www.youtube.com/embed/live_stream?channel=UCN6sm8iHiPd0cnoUardDAnw&autoplay=1&mute=1"},somoy:{name:"সময় TV",url:"https://www.youtube.com/embed/live_stream?channel=UCxHoBXkY88Tb8z1Ssj6CWsQ&autoplay=1&mute=1"}, bbc:{name:"BBC",url:"https://www.youtube.com/embed/live_stream?channel=UC16niRr50-MSBwiO3YDb3RA&autoplay=1&mute=1"}};
function setTv(k){if(!isLoggedIn)return;currentTv=k;var t=TVS[k];if(!t)return;var f=document.getElementById('liveTvFrame');if(f)f.src=t.url;document.getElementById('tvRadioStatus').innerText="🔴 এখন চলছে: "+t.name+" LIVE";notify("📺 "+t.name+" চালু!")}
function openFullTV(){var f=document.getElementById('liveTvFrame');if(!f)return;if(f.requestFullscreen)f.requestFullscreen();else if(f.webkitRequestFullscreen)f.webkitRequestFullscreen()}
var COUNTRIES={BD:{title:"🇧🇩 Bangladesh",lang:"bn",gl:"BD"},IN:{title:"🇮🇳 India",lang:"hi",gl:"IN"},SA:{title:"🇸🇦 Saudi Arabia",lang:"ar",gl:"SA"},US:{title:"🇺🇸 USA",lang:"en",gl:"US"},GB:{title:"🇬🇧 Britain",lang:"en",gl:"GB"},WORLD:{title:"🌍 World",lang:"en",gl:"US"}};
function loadBreaking(){if(!isLoggedIn)return;var c=COUNTRIES[currentCountry]||COUNTRIES.BD;var list=document.getElementById('breakingList');if(list)list.innerHTML="<p>Loading Breaking News... Live TV দেখুন।</p>";var url="https://news.google.com/rss/search?q=breaking%20news&hl="+currentLang+"&gl="+c.gl+"&ceid="+c.gl+":"+currentLang;fetch("https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(url)).then(function(r){return r.json()}).then(function(j){if(j&&j.items&&j.items.length>0){var html="";var ticker="🔴 AYNA BOOK VIRAL BREAKING • 1 KOTI TRILLION • "+c.title+" • ";j.items.slice(0,6).forEach(function(it){var d="";try{d=new Date(it.pubDate).toLocaleString()}catch(e){}html+="<div class='breakItem'><b>🔴 "+it.title+"</b><span>Google News • "+d+" • VERIFIED</span><br><a class='btn-media' href='"+it.link+"' target='_blank'>📰 পুরো খবর পড়ুন</a></div>";ticker+=it.title+" • "});if(list)list.innerHTML=html;var tk=document.getElementById('tickerText');if(tk)tk.innerText=ticker}}).catch(function(){if(list)list.innerHTML="<div class='breakItem'><b>🔴 Live TV-তে Breaking চলছে</b><span>যমুনা / সময় / একাত্তর • VERIFIED LIVE</span></div>"})}
function detectCountry(){var lang=(navigator.language||"en").toLowerCase();var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||""}catch(e){}var code="BD";if(lang.indexOf("bn")===0||tz==="Asia/Dhaka")code="BD";else if(lang.indexOf("hi")===0||tz==="Asia/Kolkata")code="IN";else if(lang.indexOf("ar")===0||tz==="Asia/Riyadh")code="SA";else if(lang==="en-us"||tz.indexOf("America/")===0)code="US";else if(lang==="en-gb"||tz==="Europe/London")code="GB";else code="WORLD";applyCountry(code)}
function applyCountry(code){currentCountry=code;var c=COUNTRIES[code];var ct=document.getElementById('countryTitle');if(ct)ct.innerText=c.title;var cs=document.getElementById('countrySelect');if(cs)cs.value="AUTO";currentLang=c.lang;if(isLoggedIn)loadBreaking()}
function changeCountryManual(){var v=document.getElementById('countrySelect').value;if(v==="AUTO"){detectCountry();return}applyCountry(v);if(v==='BD')setTv('jamuna');if(v==='WORLD')setTv(' bbc')}
document.addEventListener('DOMContentLoaded',function(){var saved=safeGet(STORAGE_USER_KEY);var logged=safeGet(STORAGE_SESSION_KEY);if(saved){try{memoryUser=JSON.parse(saved)}catch(e){}}if(saved&&logged==="true"&&memoryUser){applyUserToUI(memoryUser);showApp(memoryUser)}else if(saved){switchAuthMode('login')}loadSavedPosts()});
</script>
</body>
</html>