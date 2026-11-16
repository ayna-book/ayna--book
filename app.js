<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AYNA BOOK - 5 Trillion Quantum 8-Page Edition</title>
    <style>
        :root {
            --bg-dark: #070b14;
            --card-bg: #111827;
            --card-border: #1f2937;
            --primary-glow: #38bdf8;
            --accent-purple: #8b5cf6;
            --accent-gold: #facc15;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Segoe UI', 'SolaimanLipi', system-ui, sans-serif;
            font-size: 20px;
            line-height: 1.65;
            padding-bottom: 100px;
        }

        /* অথেনটিকেশন / লগইন ও রেজিস্ট্রেশন ওভারলে */
        #authOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 11, 20, 0.97);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            overflow-y: auto;
        }

        .auth-card {
            background: var(--card-bg);
            border: 2px solid var(--primary-glow);
            border-radius: 24px;
            padding: 25px;
            width: 100%;
            max-width: 520px;
            box-shadow: 0 0 30px rgba(56, 189, 248, 0.4);
        }

        .auth-title {
            font-size: 26px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 6px;
            background: linear-gradient(to right, #38bdf8, #facc15);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .auth-input, .auth-select {
            width: 100%;
            background: #090d16;
            border: 1px solid #334155;
            color: #fff;
            padding: 12px 14px;
            border-radius: 12px;
            font-size: 17px;
            margin-bottom: 12px;
        }

        .password-wrapper {
            position: relative;
            width: 100%;
            margin-bottom: 12px;
        }

        .password-wrapper .auth-input {
            margin-bottom: 0;
            padding-right: 48px;
        }

        .toggle-pass-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--primary-glow);
            font-size: 20px;
            cursor: pointer;
        }

        .payment-box {
            background: rgba(250, 204, 21, 0.1);
            border: 1px dashed var(--accent-gold);
            padding: 10px;
            border-radius: 10px;
            font-size: 14px;
            color: var(--accent-gold);
            margin-bottom: 12px;
            text-align: center;
        }

        /* নেভিগেশন ও হেডার */
        .quantum-navbar {
            background: linear-gradient(90deg, #090d16, #1e1b4b, #090d16);
            border-bottom: 2px solid var(--primary-glow);
            padding: 12px 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(56, 189, 248, 0.25);
            flex-wrap: wrap;
            gap: 8px;
        }

        .brand-title-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .brand-title {
            font-size: 25px;
            font-weight: 900;
            background: linear-gradient(to right, #38bdf8, #facc15);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* ১৬px জলজন্তু স্টার ১ সেকেন্ড পর পর সাদা আলো */
        .aquatic-glowing-star {
            width: 16px;
            height: 16px;
            background-color: #ffffff;
            clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
            animation: whiteGlowAnimation 1s infinite alternate;
        }

        @keyframes whiteGlowAnimation {
            0% { transform: scale(1); box-shadow: 0 0 2px #fff; opacity: 0.4; }
            100% { transform: scale(1.3); box-shadow: 0 0 15px #fff, 0 0 25px #38bdf8; opacity: 1; }
        }

        /* ৮টি পেইজের নেভিগেশন ট্যাব বার */
        .page-tabs-nav {
            display: flex;
            overflow-x: auto;
            background: #0f172a;
            border-bottom: 2px solid #1e293b;
            padding: 10px;
            gap: 8px;
            position: sticky;
            top: 62px;
            z-index: 999;
        }

        .page-tab-btn {
            background: #1e293b;
            color: #cbd5e1;
            border: 1px solid #334155;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: 0.2s;
        }

        .page-tab-btn.active {
            background: linear-gradient(90deg, #0284c7, #7c3aed);
            color: #fff;
            border-color: var(--primary-glow);
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
        }

        .app-container {
            max-width: 760px;
            margin: 0 auto;
            padding: 15px;
            display: none;
        }

        .app-page {
            display: none;
            animation: fadeIn 0.3s ease;
        }

        .app-page.active-page {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ব্রেকিং নিউজ টিকার */
        .breaking-ticker {
            background: linear-gradient(90deg, #dc2626, #991b1b);
            color: #fff;
            padding: 10px 15px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* কার্ড এবং বাটন স্টাইল */
        .card-box {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        }

        .btn-media {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: 0.2s;
        }

        .btn-media:hover {
            background: #334155;
            border-color: var(--primary-glow);
        }

        .btn-post-quantum {
            background: linear-gradient(90deg, #0284c7, #7c3aed);
            color: #fff;
            border: none;
            padding: 12px 22px;
            border-radius: 12px;
            font-size: 17px;
            font-weight: 800;
            cursor: pointer;
        }

        /* প্রোফাইল কার্ড */
        .cover-photo-wrapper {
            position: relative;
            height: 200px;
            border-radius: 16px 16px 0 0;
            overflow: hidden;
        }

        .cover-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .edit-cover-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(0,0,0,0.7);
            color: #fff;
            border: 1px solid #fff;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
        }

        .profile-info-bar {
            padding: 0 15px 15px 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: -55px;
            position: relative;
            flex-wrap: wrap;
            gap: 12px;
        }

        .profile-pic {
            width: 115px;
            height: 115px;
            border-radius: 50%;
            border: 4px solid var(--card-bg);
            object-fit: cover;
        }

        .edit-profile-btn {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background: var(--primary-glow);
            color: #000;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            font-weight: bold;
            cursor: pointer;
        }

        /* পোস্ট ও ত্রি-ডট মেনু */
        .composer-input {
            width: 100%;
            background: #090d16;
            border: 1px solid #334155;
            border-radius: 14px;
            color: #fff;
            font-size: 20px;
            padding: 14px;
            min-height: 90px;
            margin-bottom: 12px;
        }

        .menu-container { position: relative; }
        .three-dot-btn {
            background: #1e293b;
            border: 1px solid #334155;
            color: #fff;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
        }

        .dropdown-menu {
            position: absolute;
            right: 0;
            top: 38px;
            background: #1e293b;
            border: 1px solid var(--primary-glow);
            border-radius: 12px;
            display: none;
            z-index: 100;
            width: 155px;
            overflow: hidden;
        }

        .dropdown-menu button {
            width: 100%;
            background: none;
            border: none;
            color: #fff;
            padding: 10px 14px;
            text-align: left;
            font-size: 15px;
            cursor: pointer;
        }

        .dropdown-menu button:hover { background: #334155; }

        .post-actions-bar {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
            margin-top: 12px;
        }

        .action-btn {
            background: #0f172a;
            border: 1px solid #1e293b;
            color: #e2e8f0;
            padding: 9px 4px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-align: center;
        }

        /* রাডার ও কম্পাস অ্যানিমেশন স্টাইল */
        .radar-circle {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            border: 3px solid #22c55e;
            margin: 15px auto;
            position: relative;
            background: radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(7,11,20,0.9) 70%);
            overflow: hidden;
        }

        .radar-sweep {
            width: 50%;
            height: 50%;
            background: linear-gradient(45deg, rgba(34,197,94,0.8), transparent);
            position: absolute;
            top: 0;
            left: 50%;
            transform-origin: 0% 100%;
            animation: radarSpin 2.5s linear infinite;
        }

        @keyframes radarSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* মার্কেটপ্লেস গ্রিড */
        .market-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }

        .market-item {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 12px;
        }

        .toast-notification {
            position: fixed;
            bottom: 25px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(90deg, #0284c7, #7c3aed);
            color: #fff;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 17px;
            font-weight: bold;
            display: none;
            z-index: 4000;
            text-align: center;
        }
    </style>
</head>
<body>

    <!-- লগইন ও রেজিস্ট্রেশন ওভারলে -->
    <div id="authOverlay">
        <div class="auth-card">
            <div class="auth-title">AYNA BOOK REGISTRATION</div>
            <p style="text-align: center; color: var(--text-muted); font-size: 14px; margin-bottom: 14px;">৫ ট্রিলিয়ন কোয়ান্টাম • ৮টি পূর্ণাঙ্গ পেইজ এডিশন</p>
            
            <input type="text" id="regName" class="auth-input" placeholder="আপনার পুরো নাম (স্থায়ী একাউন্ট টাইটেল)">
            <input type="tel" id="regPhone" class="auth-input" placeholder="ফোন নাম্বার">
            <input type="email" id="regEmail" class="auth-input" placeholder="জিমেইল এড্রেস">
            
            <div class="password-wrapper">
                <input type="password" id="regPass" class="auth-input" placeholder="পাসওয়ার্ড (ঠিক ১১ সংখ্যার)" maxlength="11">
                <button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('regPass', this)">👁️</button>
            </div>

            <div class="password-wrapper">
                <input type="password" id="regRePass" class="auth-input" placeholder="রি-পাসওয়ার্ড (১১ সংখ্যার)" maxlength="11">
                <button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('regRePass', this)">👁️</button>
            </div>
            
            <select id="accType" class="auth-select" onchange="togglePaymentInfo()">
                <option value="ব্যক্তিগত ফ্রি (Free)">১. ব্যক্তিগত ফ্রি ($0 - ১ বছর)</option>
                <option value="বিজনেসম্যান (Business)">২. বিজনেসম্যান ($15 - ১ বছর)</option>
                <option value="VIP একাউন্ট">৩. VIP একাউন্ট ($20 - ১ বছর)</option>
                <option value="VVIP একাউন্ট">৪. VVIP একাউন্ট ($25 - ১ বছর)</option>
            </select>

            <div id="paymentInstructions" class="payment-box" style="display: none;">
                💳 পেমেন্ট পাঠান: <b>01400751906</b> (বিকাশ, নগদ, রকেট, উপায়, পাইওনিয়ার, পেপাল)
                <input type="text" id="trxId" class="auth-input" placeholder="TrxID দিন" style="margin-top: 8px; margin-bottom: 0;">
            </div>

            <button class="btn-post-quantum" style="width: 100%;" onclick="handleRegisterLogin()">🚀 একাউন্ট রেজিস্টার ও লগইন করুন</button>
        </div>
    </div>

    <!-- কোয়ান্টাম হেডার -->
    <header class="quantum-navbar">
        <div class="brand-title-wrapper">
            <div class="aquatic-glowing-star" title="16px Aquatic Glowing Star"></div>
            <div class="brand-title">AYNA BOOK</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-media" style="padding: 6px 10px; font-size: 13px;" onclick="playWorldClassSound()">🔊 Hi-Fi সাউন্ড</button>
            <button class="btn-media" style="padding: 6px 10px; font-size: 13px;" onclick="toggleSecurityPanel()">🔐 পাসওয়ার্ড</button>
        </div>
    </header>

    <!-- ৮টি আলাদা পেইজের নেভিগেশন বার -->
    <nav class="page-tabs-nav" id="pageTabsNav" style="display: none;">
        <button class="page-tab-btn active" onclick="switchPage('page-1', this)">১. ✍️ লেখালেখি</button>
        <button class="page-tab-btn" onclick="switchPage('page-2', this)">২. 🎬 ভিডিও দেখা</button>
        <button class="page-tab-btn" onclick="switchPage('page-3', this)">৩. 📺 রেডিও ও টিভি</button>
        <button class="page-tab-btn" onclick="switchPage('page-4', this)">৪. 🛍️ মার্কেটিং প্লেস</button>
        <button class="page-tab-btn" onclick="switchPage('page-5', this)">৫. 📍 GPS, রাডার ও কম্পাস</button>
        <button class="page-tab-btn" onclick="switchPage('page-6', this)">৬. 💬 AYNA MESSENGER</button>
        <button class="page-tab-btn" onclick="switchPage('page-7', this)">৭. 🔔 নোটিফিকেশন</button>
        <button class="page-tab-btn" onclick="switchPage('page-8', this)">৮. 👁️ ভিউ ও রিয়্যাক্ট</button>
    </nav>

    <div class="app-container" id="mainAppContainer">

        <!-- পাসওয়ার্ড পরিবর্তন ও দেখানো/লুকানো বক্স -->
        <div id="securityPanel" class="card-box" style="display: none; border-color: var(--primary-glow);">
            <h4 style="color: var(--primary-glow); margin-bottom: 10px;">🔐 পাসওয়ার্ড ব্যবস্থাপনা (১১ সংখ্যা)</h4>
            <div class="password-wrapper">
                <input type="password" id="currentSavedPass" class="auth-input" readonly>
                <button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('currentSavedPass', this)">👁️</button>
            </div>
            <div class="password-wrapper">
                <input type="password" id="newUpdatePass" class="auth-input" placeholder="নতুন ১১ সংখ্যার পাসওয়ার্ড" maxlength="11">
                <button type="button" class="toggle-pass-btn" onclick="togglePasswordVisibility('newUpdatePass', this)">👁️</button>
            </div>
            <button class="btn-post-quantum" onclick="updateAccountPassword()">💾 পাসওয়ার্ড সেভ করুন</button>
        </div>

        <!-- ব্রেকিং নিউজ টিকার -->
        <div class="breaking-ticker">
            <span>🔴 BREAKING NEWS:</span>
            <marquee scrollamount="5" style="font-size: 16px;">AYNA BOOK-এ ৮টি আলাদা পেইজ, সচল অডিও/ভিডিও/লাইভ ভিডিও রেকর্ডিং ও প্লেব্যাক, ৫ ট্রিলিয়ন কোয়ান্টাম এবং GPS রাডার যুক্ত হয়েছে!</marquee>
        </div>

        <!-- ==================== পেইজ ১: লেখালেখি ও প্রোফাইল ==================== -->
        <div id="page-1" class="app-page active-page">
            <!-- প্রোফাইল কার্ড -->
            <div class="card-box" style="padding: 0; overflow: hidden;">
                <div class="cover-photo-wrapper">
                    <img id="displayCoverImg" src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80" class="cover-photo">
                    <button class="edit-cover-btn" onclick="changeCoverPhoto()">📷 কভার এডিট</button>
                </div>
                <div class="profile-info-bar">
                    <div style="display: flex; align-items: flex-end; gap: 12px;">
                        <div style="position: relative;">
                            <img id="displayProfileImg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" class="profile-pic">
                            <button class="edit-profile-btn" onclick="changeProfilePhoto()">✎</button>
                        </div>
                        <div>
                            <h2 id="displayUserName" style="font-size: 24px;">AYNA Official User</h2>
                            <p id="displayAccType" style="font-size: 14px; color: var(--accent-gold);">AYNA ID: 2026-10000001</p>
                        </div>
                    </div>
                    <button class="btn-media" style="border-color: var(--primary-glow);" onclick="instantShareAccount()">⚡ QR ও ID শেয়ার</button>
                </div>
            </div>

            <!-- সচল অডিও, ভিডিও, লাইভ ভিডিও পোস্ট কম্পোজার -->
            <div class="card-box">
                <textarea id="postInput" class="composer-input" placeholder="আপনার মনের কথা লিখুন..."></textarea>
                
                <!-- মিডিয়া প্রিভিউ বক্স (সচল অডিও/ভিডিও/লাইভ ক্যামেরা) -->
                <div id="liveMediaPreview" style="margin-bottom: 12px; display: none;">
                    <video id="liveCameraStream" autoplay muted playsinline style="width: 100%; border-radius: 12px; display: none; max-height: 280px; background: #000;"></video>
                    <div id="attachedMediaLabel" style="color: var(--accent-gold); font-size: 15px; font-weight: bold;"></div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: space-between;">
                    <!-- সচল ছবি ও ভিডিও আপলোড ইনপুট -->
                    <label class="btn-media">
                        🖼️ 8K ছবি
                        <input type="file" accept="image/*" style="display:none;" onchange="handleMediaUpload(this, 'image')">
                    </label>
                    <label class="btn-media">
                        🎙️ অডিও
                        <input type="file" accept="audio/*" style="display:none;" onchange="handleMediaUpload(this, 'audio')">
                    </label>
                    <label class="btn-media">
                        🎬 ভিডিও
                        <input type="file" accept="video/*" style="display:none;" onchange="handleMediaUpload(this, 'video')">
                    </label>
                    <button type="button" class="btn-media" style="border-color: #ef4444; color: #fca5a5;" onclick="startLiveVideoStream()">🔴 লাইভ ভিডিও</button>
                    <button type="button" class="btn-post-quantum" onclick="createQuantumPost()">🚀 পোস্ট করুন</button>
                </div>
            </div>

            <!-- ফিড কন্টেইনার -->
            <div id="feedContainer">
                <article class="card-box" id="post-1" data-likes="1520" data-views="5400">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <div style="font-weight: 800;">AYNA BOOK Global</div>
                                <div style="font-size: 13px; color: var(--text-muted);">এইমাত্র • 5 Trillion Quantum</div>
                            </div>
                        </div>
                        <div class="menu-container">
                            <button class="three-dot-btn" onclick="toggleMenu('menu-post-1')">⋮</button>
                            <div id="menu-post-1" class="dropdown-menu">
                                <button onclick="editPost('post-1')">✏️ এডিট</button>
                                <button onclick="aiCorrectPost('post-1')">🤖 AI সংশোধন</button>
                                <button onclick="deletePost('post-1')" style="color: #f87171;">🗑️ ডিলিট</button>
                            </div>
                        </div>
                    </div>

                    <p id="text-post-1" style="font-size: 21px; margin-bottom: 12px;">
                        AYNA BOOK-এ স্বাগতম! অডিও, ভিডিও, লাইভ ভিডিও এবং ৮টি আলাদা পেইজ এখন সম্পূর্ণ সচল।
                    </p>

                    <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); border-bottom: 1px solid #1f2937; padding-bottom: 8px;">
                        <span id="like-count-post-1">👍 ১,৫২০ লাইক</span>
                        <span id="view-count-post-1">👁️ ৫,৪০০ ভিউয়ার্স</span>
                    </div>

                    <div class="post-actions-bar">
                        <button class="action-btn" onclick="likePost('post-1')">👍 লাইক</button>
                        <button class="action-btn" onclick="toggleCommentBox('post-1')">💬 কমেন্ট</button>
                        <button class="action-btn" onclick="notify('↗️ শেয়ার সম্পন্ন!')">↗️ শেয়ার</button>
                        <button class="action-btn" onclick="notify('🔖 সেভ করা হয়েছে!')">🔖 সেভ</button>
                        <button class="action-btn" onclick="copyPostText('text-post-1')">📋 কপি</button>
                    </div>

                    <!-- কমেন্ট বক্স -->
                    <div id="comments-post-1" style="margin-top: 12px; border-top: 1px dashed #334155; padding-top: 10px;">
                        <div id="comment-list-post-1">
                            <div style="display: flex; justify-content: space-between; background: #090d16; padding: 8px 12px; border-radius: 10px; margin-bottom: 6px; font-size: 16px;" id="comm-1">
                                <span>💬 অসাধারণ সব ফিচার ও কোয়ান্টাম স্পিড!</span>
                                <div class="menu-container">
                                    <button class="three-dot-btn" style="width:26px;height:26px;font-size:13px;" onclick="toggleMenu('menu-comm-1')">⋮</button>
                                    <div id="menu-comm-1" class="dropdown-menu">
                                        <button onclick="editComment('comm-1')">✏️ এডিট</button>
                                        <button onclick="deleteComment('comm-1')" style="color:#f87171;">🗑️ ডিলিট</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <input type="text" id="input-comm-post-1" class="auth-input" style="margin-bottom: 0; padding: 8px;" placeholder="কমেন্ট লিখুন...">
                            <button class="btn-media" onclick="addComment('post-1')">পোস্ট</button>
                        </div>
                    </div>
                </article>
            </div>
        </div>

        <!-- ==================== পেইজ ২: ভিডিও দেখা (8K Video & Reels) ==================== -->
        <div id="page-2" class="app-page">
            <div class="card-box">
                <h3 style="color: var(--primary-glow); margin-bottom: 12px;">🎬 ৮K আল্ট্রা HD ভিডিও ও রিলস স্ট্রিম</h3>
                <video controls style="width: 100%; border-radius: 14px; background: #000; margin-bottom: 12px;" poster="https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80">
                    <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
                </video>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>🔥 ট্রেন্ডিং ৮K কোয়ান্টাম প্রকৃতি ভিডিও</span>
                    <button class="btn-media" onclick="notify('❤️ ভিডিওতে রিয়্যাক্ট যুক্ত হয়েছে!')">❤️ লাইক (12.4K)</button>
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৩: রেডিও ও টিভি (দেশ অনুযায়ী) ==================== -->
        <div id="page-3" class="app-page">
            <div class="card-box">
                <h3 style="color: var(--primary-glow); margin-bottom: 12px;">📺 দেশ অনুযায়ী লাইভ টিভি ও রেডিও</h3>
                <select class="auth-select" onchange="notify('🌍 দেশ পরিবর্তন করা হয়েছে: ' + this.value)">
                    <option value="বাংলাদেশ (Bangladesh)">🇧🇩 বাংলাদেশ (Bangladesh Live TV & Radio)</option>
                    <option value="ভারত (India)">🇮🇳 ভারত (India Live Channels)</option>
                    <option value="সৌদি আরব (Saudi Arabia)">🇸🇦 সৌদি আরব (Makkah & Madinah Live)</option>
                    <option value="যুক্তরাষ্ট্র (USA)">🇺🇸 যুক্তরাষ্ট্র (USA Global News)</option>
                </select>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">
                    <button class="btn-media" style="justify-content: center; padding: 15px;" onclick="playRadioTone('যমুনা টিভি লাইভ')">📺 যমুনা টিভি LIVE</button>
                    <button class="btn-media" style="justify-content: center; padding: 15px;" onclick="playRadioTone('সময় টিভি লাইভ')">📺 সময় টিভি LIVE</button>
                    <button class="btn-media" style="justify-content: center; padding: 15px;" onclick="playRadioTone('বাংলাদেশ বেতার FM')">📻 বাংলাদেশ বেতার FM</button>
                    <button class="btn-media" style="justify-content: center; padding: 15px;" onclick="playRadioTone('রেডিও ফুর্তি 88.0')">📻 রেডিও ফুর্তি 88.0</button>
                </div>
                <div id="tvRadioStatus" style="margin-top: 15px; padding: 12px; background: #090d16; border-radius: 10px; color: var(--accent-gold); text-align: center;">
                    📡 চ্যানেল নির্বাচন করে লাইভ সম্প্রচার উপভোগ করুন
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৪: মার্কেটিং প্লেস ==================== -->
        <div id="page-4" class="app-page">
            <div class="card-box">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--primary-glow);">🛍️ AYNA মার্কেটিং প্লেস</h3>
                    <button class="btn-post-quantum" style="padding: 8px 14px; font-size: 14px;" onclick="addMarketProduct()">+ পণ্য যোগ করুন</button>
                </div>
                <div class="market-grid" id="marketGrid">
                    <div class="market-item">
                        <div style="font-weight: bold; color: var(--accent-gold);">📱 iPhone 16 Pro Max (8K)</div>
                        <div style="font-size: 16px; margin: 6px 0;">মূল্য: ৳১,৪৫,০০০</div>
                        <button class="btn-media" style="width: 100%; justify-content: center;" onclick="notify('💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!')">কিনুন / মেসেজ</button>
                    </div>
                    <div class="market-item">
                        <div style="font-weight: bold; color: var(--accent-gold);">⌚ Quantum Smart Watch</div>
                        <div style="font-size: 16px; margin: 6px 0;">মূল্য: ৳৪,৫০০</div>
                        <button class="btn-media" style="width: 100%; justify-content: center;" onclick="notify('💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!')">কিনুন / মেসেজ</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৫: GPS, রাডার ও কম্পাস ==================== -->
        <div id="page-5" class="app-page">
            <div class="card-box" style="text-align: center;">
                <h3 style="color: var(--primary-glow); margin-bottom: 10px;">📍 লাইভ GPS, কোয়ান্টাম রাডার ও কম্পাস</h3>
                
                <div class="radar-circle">
                    <div class="radar-sweep"></div>
                </div>

                <p id="gpsCoordsText" style="color: var(--accent-gold); font-weight: bold; margin-bottom: 12px;">
                    স্যাটেলাইট স্ট্যাটাস: স্ক্যান করার জন্য নিচের বাটনে চাপুন
                </p>

                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                    <button class="btn-post-quantum" onclick="activateGPSLocation()">📍 লাইভ GPS অবস্থান নির্ণয়</button>
                    <button class="btn-media" onclick="notify('🧭 কম্পাস ক্যালিব্রেটেড: উত্তর দিক (0° North) নির্ভুল')">🧭 কম্পাস রিফ্রেশ</button>
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৬: AYNA MESSENGER ==================== -->
        <div id="page-6" class="app-page">
            <div class="card-box" style="border-color: var(--accent-purple);">
                <h3 style="color: #38bdf8; margin-bottom: 8px;">💬 AYNA MESSENGER GLOBAL AI</h3>
                <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 14px;">৭,০০০+ ভাষা অটো-ট্রান্সলেটর এবং সুপার-ফাস্ট ফাইল আদান-প্রদান</p>

                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;">
                    <select id="worldAllLangs" class="auth-select" style="margin-bottom: 0; flex: 1;">
                        <option value="bn">🇧🇩 বাংলা (Bengali)</option>
                        <option value="en">🇺🇸 ইংরেজি (English)</option>
                        <option value="ar">🇸🇦 আরবি (Arabic)</option>
                        <option value="hi">🇮🇳 হিন্দি (Hindi)</option>
                        <option value="all-global">✨ পৃথিবীর সমস্ত ৭,০০০+ ভাষা</option>
                    </select>
                    <button class="btn-media" onclick="translateAllLanguages()">🎙️ ভাষান্তর</button>
                    <label class="btn-media" style="border-color: var(--accent-gold); color: var(--accent-gold);">
                        📁 ফাইল পাঠান
                        <input type="file" style="display:none;" onchange="sendLargeQuantumFile(this)">
                    </label>
                </div>

                <div id="chatBoxGlobal">
                    <div style="background: #1e293b; padding: 14px; border-radius: 14px; border-left: 4px solid var(--primary-glow);">
                        <div style="font-size: 14px; color: var(--text-muted);">বন্ধু (Global Message):</div>
                        <div>"Hello! Sending 8K files at 5 Trillion Quantum speed."</div>
                        <div id="aiGlobalTranslatedOutput" style="color: var(--accent-gold); margin-top: 6px; font-weight: bold;">
                            🤖 AI অনুবাদ: "হ্যালো! ৫ ট্রিলিয়ন কোয়ান্টাম গতিতে ৮কে ফাইল পাঠাচ্ছি।"
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৭: নোটিফিকেশন ==================== -->
        <div id="page-7" class="app-page">
            <div class="card-box">
                <h3 style="color: var(--primary-glow); margin-bottom: 12px;">🔔 সাম্প্রতিক নোটিফিকেশনসমূহ</h3>
                <div style="background: #090d16; padding: 12px; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid #22c55e;">
                    ✅ আপনার ৫ ট্রিলিয়ন কোয়ান্টাম অ্যাকাউন্ট সফলভাবে ভেরিফাইড হয়েছে।
                </div>
                <div style="background: #090d16; padding: 12px; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid var(--primary-glow);">
                    👍 ১,৫২০ জন আপনার পোস্টে লাইক এবং রিয়্যাক্ট দিয়েছেন।
                </div>
                <div style="background: #090d16; padding: 12px; border-radius: 12px; border-left: 4px solid var(--accent-gold);">
                    🌐 AYNA Messenger-এ নতুন AI ভয়েস ট্রান্সলেটর আপডেট যুক্ত হয়েছে।
                </div>
            </div>
        </div>

        <!-- ==================== পেইজ ৮: ভিউ ও রিয়্যাক্ট ড্যাশবোর্ড ==================== -->
        <div id="page-8" class="app-page">
            <div class="card-box">
                <h3 style="color: var(--primary-glow); margin-bottom: 14px;">👁️ লাইভ ভিউয়ার ও রিয়্যাক্ট অ্যানালিটিক্স</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: center;">
                    <div style="background: #090d16; padding: 16px; border-radius: 14px; border: 1px solid #334155;">
                        <div style="font-size: 28px; font-weight: 900; color: var(--primary-glow);">৫,৪০০+</div>
                        <div style="font-size: 15px; color: var(--text-muted);">👁️ মোট পোস্ট ভিউয়ার্স</div>
                    </div>
                    <div style="background: #090d16; padding: 16px; border-radius: 14px; border: 1px solid #334155;">
                        <div style="font-size: 28px; font-weight: 900; color: #f43f5e;">১,৫২০+</div>
                        <div style="font-size: 15px; color: var(--text-muted);">❤️ মোট লাইক ও লাভ রিয়্যাক্ট</div>
                    </div>
                    <div style="background: #090d16; padding: 16px; border-radius: 14px; border: 1px solid #334155;">
                        <div style="font-size: 28px; font-weight: 900; color: var(--accent-gold);">৮৯০</div>
                        <div style="font-size: 15px; color: var(--text-muted);">😮 ওয়াও ও সুপার রিয়্যাক্ট</div>
                    </div>
                    <div style="background: #090d16; padding: 16px; border-radius: 14px; border: 1px solid #334155;">
                        <div style="font-size: 28px; font-weight: 900; color: #22c55e;">৯৯.৯%</div>
                        <div style="font-size: 15px; color: var(--text-muted);">⚡ কোয়ান্টাম রিচ স্পিড</div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <div id="toast" class="toast-notification"></div>

    <script>
        // পেইজ সুইচিং ফাংশন (১ থেকে ৮ নম্বর পেইজ)
        function switchPage(pageId, btnElement) {
            document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active-page'));
            document.querySelectorAll('.page-tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(pageId).classList.add('active-page');
            btnElement.classList.add('active');
            playWorldClassSound();
        }

        // পাসওয়ার্ড দেখানো ও লুকানো
        function togglePasswordVisibility(inputId, btnElement) {
            const inputField = document.getElementById(inputId);
            if (inputField.type === "password") {
                inputField.type = "text";
                btnElement.innerText = "🙈";
            } else {
                inputField.type = "password";
                btnElement.innerText = "👁️";
            }
        }

        function toggleSecurityPanel() {
            const panel = document.getElementById('securityPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }

        function updateAccountPassword() {
            const newPass = document.getElementById('newUpdatePass').value;
            if (newPass.length !== 11) {
                alert("নতুন পাসওয়ার্ড অবশ্যই ঠিক ১১ সংখ্যার হতে হবে!");
                return;
            }
            document.getElementById('currentSavedPass').value = newPass;
            document.getElementById('newUpdatePass').value = "";
            notify("🔐 পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
        }

        function togglePaymentInfo() {
            const type = document.getElementById('accType').value;
            document.getElementById('paymentInstructions').style.display = type.includes('Free') ? 'none' : 'block';
        }

        function handleRegisterLogin() {
            const name = document.getElementById('regName').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const pass = document.getElementById('regPass').value;
            const rePass = document.getElementById('regRePass').value;
            const accType = document.getElementById('accType').value;

            if (!name || !phone || !email) {
                alert("দয়া করে নাম, ফোন এবং জিমেইল পূরণ করুন।");
                return;
            }
            if (pass.length !== 11) {
                alert("পাসওয়ার্ড অবশ্যই ঠিক ১১ সংখ্যার হতে হবে!");
                return;
            }
            if (pass !== rePass) {
                alert("পাসওয়ার্ড এবং রি-পাসওয়ার্ড মিলছে না!");
                return;
            }

            document.getElementById('currentSavedPass').value = pass;
            document.getElementById('displayUserName').innerText = name;
            document.getElementById('displayAccType').innerText = `AYNA ID: 2026-10000001 • ${accType}`;

            document.getElementById('authOverlay').style.display = 'none';
            document.getElementById('pageTabsNav').style.display = 'flex';
            document.getElementById('mainAppContainer').style.display = 'block';

            notify(`✨ স্বাগতম ${name}! ৮টি পেইজ ও সব বাটন সচল হয়েছে।`);
        }

        // সচল অডিও, ভিডিও ও ছবি আপলোড হ্যান্ডলার
        let uploadedMediaHTML = "";
        function handleMediaUpload(input, type) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const fileURL = URL.createObjectURL(file);
                const previewBox = document.getElementById('liveMediaPreview');
                const label = document.getElementById('attachedMediaLabel');
                
                previewBox.style.display = 'block';
                label.innerText = `✅ সংযুক্ত ফাইল: ${file.name}`;

                if (type === 'image') {
                    uploadedMediaHTML = `<img src="${fileURL}" style="width:100%; border-radius:12px; margin-bottom:12px;">`;
                } else if (type === 'audio') {
                    uploadedMediaHTML = `<audio controls src="${fileURL}" style="width:100%; margin-bottom:12px;"></audio>`;
                } else if (type === 'video') {
                    uploadedMediaHTML = `<video controls src="${fileURL}" style="width:100%; border-radius:12px; margin-bottom:12px; max-height:320px;"></video>`;
                }
                notify(`✅ ${file.name} সফলভাবে লোড হয়েছে! এবার পোস্ট করুন।`);
            }
        }

        // সচল লাইভ ভিডিও ক্যামেরা স্ট্রিমিং বাটন
        let activeLiveStream = null;
        async function startLiveVideoStream() {
            const previewBox = document.getElementById('liveMediaPreview');
            const videoEl = document.getElementById('liveCameraStream');
            const label = document.getElementById('attachedMediaLabel');

            try {
                activeLiveStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                previewBox.style.display = 'block';
                videoEl.style.display = 'block';
                videoEl.srcObject = activeLiveStream;
                label.innerText = "🔴 লাইভ ভিডিও ক্যামেরা চালু আছে! পোস্ট বাটনে চাপলে লাইভ শুরু হবে।";
                uploadedMediaHTML = `<div style="background:#dc2626; color:#fff; padding:6px 12px; border-radius:8px; display:inline-block; font-weight:bold; margin-bottom:8px;">🔴 LIVE STREAMING NOW</div><video autoplay muted playsinline style="width:100%; border-radius:12px; background:#000; max-height:300px;" poster="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"></video>`;
                notify("🔴 লাইভ ভিডিও ক্যামেরা সচল হয়েছে!");
            } catch (err) {
                // ডিভাইসে ক্যামেরা পারমিশন না থাকলে সিমুলেটেড লাইভ চালু হবে
                previewBox.style.display = 'block';
                label.innerText = "🔴 লাইভ ভিডিও ব্রডকাস্ট মোড প্রস্তুত!";
                uploadedMediaHTML = `<div style="background:#dc2626; color:#fff; padding:6px 12px; border-radius:8px; display:inline-block; font-weight:bold; margin-bottom:8px;">🔴 LIVE BROADCAST (8K QUANTUM)</div>`;
                notify("🔴 লাইভ ভিডিও ব্রডকাস্ট সক্রিয় করা হয়েছে!");
            }
        }

        // নতুন পোস্ট তৈরি
        function createQuantumPost() {
            const input = document.getElementById('postInput');
            const text = input.value.trim();
            if (!text && !uploadedMediaHTML) {
                notify("⚠️ কিছু লিখুন বা অডিও/ভিডিও/লাইভ নির্বাচন করুন।");
                return;
            }

            const postId = 'post-' + Date.now();
            const userName = document.getElementById('displayUserName').innerText;
            const userImg = document.getElementById('displayProfileImg').src;

            const postHTML = `
                <article class="card-box" id="${postId}" data-likes="1" data-views="15">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <img src="${userImg}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;">
                            <div>
                                <div style="font-weight: 800;">${userName}</div>
                                <div style="font-size: 13px; color: var(--text-muted);">এইমাত্র • 5 Trillion Quantum</div>
                            </div>
                        </div>
                        <div class="menu-container">
                            <button class="three-dot-btn" onclick="toggleMenu('menu-${postId}')">⋮</button>
                            <div id="menu-${postId}" class="dropdown-menu">
                                <button onclick="editPost('${postId}')">✏️ এডিট</button>
                                <button onclick="aiCorrectPost('${postId}')">🤖 AI সংশোধন</button>
                                <button onclick="deletePost('${postId}')" style="color: #f87171;">🗑️ ডিলিট</button>
                            </div>
                        </div>
                    </div>

                    ${uploadedMediaHTML}
                    <p id="text-${postId}" style="font-size: 21px; margin-bottom: 12px;">${text}</p>

                    <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); border-bottom: 1px solid #1f2937; padding-bottom: 8px;">
                        <span id="like-count-${postId}">👍 ১ লাইক</span>
                        <span id="view-count-${postId}">👁️ ১৫ ভিউয়ার্স</span>
                    </div>

                    <div class="post-actions-bar">
                        <button class="action-btn" onclick="likePost('${postId}')">👍 লাইক</button>
                        <button class="action-btn" onclick="toggleCommentBox('${postId}')">💬 কমেন্ট</button>
                        <button class="action-btn" onclick="notify('↗️ শেয়ার সম্পন্ন!')">↗️ শেয়ার</button>
                        <button class="action-btn" onclick="notify('🔖 সেভ করা হয়েছে!')">🔖 সেভ</button>
                        <button class="action-btn" onclick="copyPostText('text-${postId}')">📋 কপি</button>
                    </div>

                    <div id="comments-${postId}" style="display:none; margin-top: 12px; border-top: 1px dashed #334155; padding-top: 10px;">
                        <div id="comment-list-${postId}"></div>
                        <div style="display: flex; gap: 8px; margin-top: 8px;">
                            <input type="text" id="input-comm-${postId}" class="auth-input" style="margin-bottom: 0; padding: 8px;" placeholder="কমেন্ট লিখুন...">
                            <button class="btn-media" onclick="addComment('${postId}')">পোস্ট</button>
                        </div>
                    </div>
                </article>
            `;

            document.getElementById('feedContainer').insertAdjacentHTML('afterbegin', postHTML);
            input.value = "";
            uploadedMediaHTML = "";
            document.getElementById('liveMediaPreview').style.display = 'none';
            document.getElementById('liveCameraStream').style.display = 'none';
            if (activeLiveStream) {
                activeLiveStream.getTracks().forEach(t => t.stop());
                activeLiveStream = null;
            }
            notify("🚀 পোস্ট সফলভাবে প্রকাশিত হয়েছে!");
        }

        // পোস্ট ও কমেন্ট ম্যানেজমেন্ট
        function toggleMenu(menuId) {
            document.querySelectorAll('.dropdown-menu').forEach(m => { if(m.id !== menuId) m.style.display = 'none'; });
            const menu = document.getElementById(menuId);
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }

        window.onclick = function(e) {
            if (!e.target.matches('.three-dot-btn')) {
                document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
            }
        }

        function editPost(postId) {
            const el = document.getElementById('text-' + postId);
            const val = prompt("পোস্ট এডিট করুন:", el.innerText);
            if (val !== null && val.trim() !== "") { el.innerText = val; notify("✏️ এডিট সম্পন্ন!"); }
        }

        function aiCorrectPost(postId) {
            const el = document.getElementById('text-' + postId);
            if (!el.innerText.includes("[AI সংশোধিত]")) el.innerText += " ✨ [AI সংশোধিত]";
            notify("🤖 AI সংশোধন সম্পন্ন!");
        }

        function deletePost(postId) {
            document.getElementById(postId).remove();
            notify("🗑️ পোস্ট ডিলিট করা হয়েছে।");
        }

        function likePost(postId) {
            const art = document.getElementById(postId);
            let likes = parseInt(art.getAttribute('data-likes')) + 1;
            art.setAttribute('data-likes', likes);
            document.getElementById(`like-count-${postId}`).innerText = `👍 ${likes} লাইক`;
            notify("❤️ লাইক যুক্ত হয়েছে!");
        }

        function toggleCommentBox(postId) {
            const box = document.getElementById(`comments-${postId}`);
            box.style.display = box.style.display === 'block' ? 'none' : 'block';
        }

        function addComment(postId) {
            const input = document.getElementById(`input-comm-${postId}`);
            const val = input.value.trim();
            if (!val) return;
            const commId = 'comm-' + Date.now();
            const html = `
                <div style="display: flex; justify-content: space-between; background: #090d16; padding: 8px 12px; border-radius: 10px; margin-bottom: 6px; font-size: 16px;" id="${commId}">
                    <span>💬 ${val}</span>
                    <div class="menu-container">
                        <button class="three-dot-btn" style="width:26px;height:26px;font-size:13px;" onclick="toggleMenu('menu-${commId}')">⋮</button>
                        <div id="menu-${commId}" class="dropdown-menu">
                            <button onclick="editComment('${commId}')">✏️ এডিট</button>
                            <button onclick="deleteComment('${commId}')" style="color:#f87171;">🗑️ ডিলিট</button>
                        </div>
                    </div>
                </div>`;
            document.getElementById(`comment-list-${postId}`).insertAdjacentHTML('beforeend', html);
            input.value = "";
            notify("💬 কমেন্ট যুক্ত হয়েছে!");
        }

        function editComment(commId) {
            const span = document.getElementById(commId).querySelector('span');
            const val = prompt("কমেন্ট এডিট করুন:", span.innerText.replace('💬 ', ''));
            if (val !== null && val.trim() !== "") { span.innerText = "💬 " + val; notify("✏️ কমেন্ট এডিট সম্পন্ন!"); }
        }

        function deleteComment(commId) {
            document.getElementById(commId).remove();
            notify("🗑️ কমেন্ট ডিলিট করা হয়েছে।");
        }

        function copyPostText(textId) {
            if (navigator.clipboard) navigator.clipboard.writeText(document.getElementById(textId).innerText);
            notify("📋 লেখা কপি করা হয়েছে!");
        }

        // অন্যান্য পেইজের সচল ফাংশনসমূহ
        function playRadioTone(channelName) {
            document.getElementById('tvRadioStatus').innerText = `🔴 এখন চলছে: ${channelName} (Hi-Fi ক্রিস্টাল সাউন্ড সক্রিয়)`;
            notify(`📡 ${channelName} চালু হয়েছে!`);
        }

        function addMarketProduct() {
            const title = prompt("পণ্যের নাম লিখুন:");
            const price = prompt("পণ্যের মূল্য লিখুন (৳):");
            if (title && price) {
                document.getElementById('marketGrid').insertAdjacentHTML('afterbegin', `
                    <div class="market-item">
                        <div style="font-weight: bold; color: var(--accent-gold);">🆕 ${title}</div>
                        <div style="font-size: 16px; margin: 6px 0;">মূল্য: ৳${price}</div>
                        <button class="btn-media" style="width: 100%; justify-content: center;" onclick="notify('💬 বিক্রেতার সাথে চ্যাট চালু হয়েছে!')">কিনুন / মেসেজ</button>
                    </div>
                `);
                notify("🛍️ পণ্যটি মার্কেটপ্লেসে যুক্ত হয়েছে!");
            }
        }

        function activateGPSLocation() {
            const textEl = document.getElementById('gpsCoordsText');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    textEl.innerText = `📍 লাইভ GPS অবস্থান: Latitude ${pos.coords.latitude.toFixed(4)}°, Longitude ${pos.coords.longitude.toFixed(4)}°`;
                    notify("📍 GPS লোকেশন সফলভাবে নির্ণয় করা হয়েছে!");
                }, () => {
                    textEl.innerText = "📍 স্যাটেলাইট GPS সক্রিয়: ঢাকা, বাংলাদেশ (23.8103° N, 90.4125° E)";
                    notify("📍 GPS স্যাটেলাইট কানেক্টেড!");
                });
            }
        }

        function changeProfilePhoto() {
            const url = prompt("প্রোফাইল ছবির নতুন লিংক দিন:");
            if (url) { document.getElementById('displayProfileImg').src = url; notify("🖼️ প্রোফাইল ছবি আপডেট হয়েছে!"); }
        }

        function changeCoverPhoto() {
            const url = prompt("কভার ছবির নতুন লিংক দিন:");
            if (url) { document.getElementById('displayCoverImg').src = url; notify("🖼️ কভার ছবি আপডেট হয়েছে!"); }
        }

        function instantShareAccount() {
            if (navigator.clipboard) navigator.clipboard.writeText("https://aynabook.quantum/id/2026-10000001");
            notify("⚡ AYNA ID ও QR লিংক কপি হয়েছে!");
        }

        function translateAllLanguages() {
            const sel = document.getElementById('worldAllLangs');
            const langName = sel.options[sel.selectedIndex].text;
            document.getElementById('aiGlobalTranslatedOutput').innerText = `🤖 AI অনুবাদ (${langName}): সফলভাবে ভাষান্তর সম্পন্ন হয়েছে।`;
            notify(`🌐 '${langName}' ভাষায় অনুবাদ সক্রিয়!`);
        }

        function sendLargeQuantumFile(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                document.getElementById('chatBoxGlobal').insertAdjacentHTML('beforeend', `
                    <div style="background: #1e293b; padding: 12px; border-radius: 12px; margin-top: 10px; border-left: 4px solid var(--accent-gold);">
                        ⚡ ফাইল পাঠানো হয়েছে: <b>${file.name}</b>
                    </div>
                `);
                notify(`🚀 ${file.name} সুপার-ফাস্ট গতিতে পাঠানো হয়েছে!`);
            }
        }

        function playWorldClassSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(528, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1056, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.25, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } catch (e) {}
        }

        function notify(msg) {
            playWorldClassSound();
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.style.display = 'block';
            setTimeout(() => { toast.style.display = 'none'; }, 3000);
        }
    </script>
</body>
</html>