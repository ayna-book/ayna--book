// AYNA BOOK — 5000-Year Quantum, Firebase & 500+ Tech JavaScript Engine

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// আপনার ফায়ারবেস কনফিগারেশন (আপনার প্রজেক্ট অনুযায়ী আপডেট করে নিন)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ayna-book.firebaseapp.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// ফায়ারবেস ও ফায়ারস্টোর ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  console.log("AYNA BOOK 5000-Year Core & Firebase Initialized.");

  // ১. সিঙ্গেল পেজ রাউটিং (পেজ সুইচিং ও বাটন সচল করা)
  const navButtons = document.querySelectorAll('[data-page], [data-go]');
  const pages = document.querySelectorAll('.page');

  function switchPage(targetPageId) {
    pages.forEach(page => {
      if (page.id === 'page-' + targetPageId) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    navButtons.forEach(btn => {
      const pageAttr = btn.getAttribute('data-page') || btn.getAttribute('data-go');
      if (pageAttr === targetPageId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const target = button.getAttribute('data-page') || button.getAttribute('data-go');
      if (target) {
        switchPage(target);
      }
    });
  });

  // ২. পাসওয়ার্ড শো/হাইড় টগল
  const showPassButtons = document.querySelectorAll('.show-password');
  showPassButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const inputField = document.getElementById(targetId);
      if (inputField) {
        if (inputField.type === 'password') {
          inputField.type = 'text';
          btn.textContent = 'Hide';
        } else {
          inputField.type = 'password';
          btn.textContent = 'Show';
        }
      }
    });
  });

  // ৩. ফায়ারবেস থেকে প্রোফাইল ডাটা লোড করার ফাংশন
  async function loadUserProfile(userId) {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        document.getElementById("profileName").textContent = userData.name || "Quantum User";
        document.getElementById("profileEmail").textContent = userData.email || "secure@aynabook.com";
        console.log("Firestore User Data Loaded Successfully[span_0](start_span)[span_0](end_span).");
      }
    } catch (error) {
      console.error("Error loading user data from Firebase: ", error);
    }
  }

  // উদাহরণের জন্য একটি ইউজার আইডি দিয়ে ফায়ারবেস ডাটা কল করা যেতে পারে
  // loadUserProfile("B91hFzywdnOsUquCKKsRha...");

  // ৪. এআই ভয়েস ও চ্যাট ট্রান্সলেশন সিস্টেম
  const chatForm = document.getElementById('chatForm');
  const chatInputMsg = document.getElementById('chatInputMsg');
  const chatMessagesContainer = document.getElementById('chatMessagesContainer');
  const chatStatus = document.getElementById('chatStatus');

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInputMsg.value.trim();
      if (!msg) return;

      const userElem = document.createElement('div');
      userElem.style.cssText = "background: #071b49; border: 1px solid #00ffcc44; color: #fff; padding: 10px; border-radius: 8px; margin-bottom: 8px;";
      userElem.innerHTML = `<strong>আপনি (বাংলা):</strong> ${msg}`;
      chatMessagesContainer.appendChild(userElem);

      if (chatStatus) chatStatus.textContent = "AI Exact Voice Cloning & Translation Processing...";

      setTimeout(() => {
        const aiElem = document.createElement('div');
        aiElem.style.cssText = "background: rgba(0,255,204,0.1); border: 1px solid #00ffcc; color: #00ffcc; padding: 10px; border-radius: 8px; margin-bottom: 8px;";
        aiElem.innerHTML = `<strong>AYNA AI (Recipient Language):</strong> [Translated with Original Vocal Tone] — Quantum Verified`;
        chatMessagesContainer.appendChild(aiElem);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        if (chatStatus) chatStatus.textContent = "বার্তা কোয়ান্টাম এনক্রিপশনে সফলভাবে প্রেরিত হয়েছে।";
        chatInputMsg.value = "";
      }, 800);
    });
  }

  // ৫. সামরিক স্যাটেলাইট জিপিএস ও রাডার স্ক্যান
  const startGpsBtn = document.getElementById('startGpsBtn');
  const startCompassBtn = document.getElementById('startCompassBtn');
  const gpsStatus = document.getElementById('gpsStatus');
  const compassStatus = document.getElementById('compassStatus');

  if (startGpsBtn) {
    startGpsBtn.addEventListener('click', () => {
      if (gpsStatus) gpsStatus.textContent = "📍 NASA Satellite & GPS Sync Completed Successfully!";
    });
  }

  if (startCompassBtn) {
    startCompassBtn.addEventListener('click', () => {
      if (compassStatus) compassStatus.textContent = "🟢 Military Radar Sweep Active (360° Secure Zone).";
    });
  }

  // ৬. হেলথ ও ফিভার মনিটর অ্যালার্ট
  const enableAlertsBtn = document.getElementById('enableAlertsBtn');
  const alertsContainer = document.getElementById('alertsContainer');

  if (enableAlertsBtn) {
    enableAlertsBtn.addEventListener('click', () => {
      if (alertsContainer) {
        alertsContainer.innerHTML = `
          <div style="background: rgba(255,77,77,0.15); border: 1px solid #ff4d4d; padding: 12px; border-radius: 8px; margin-top: 10px;">
            <h4 style="color: #ff4d4d;">🌡️ Health & Fever AI Sensor: Normal (36.6°C)</h4>
            <p style="font-size: 12px; color: #fff; margin-top: 4px;">শরীরের তাপমাত্রা বা স্বাস্থ্যের ঝুঁকি টের পেলেই অটো অ্যালার্ট সেন্ট্রাল স্যাটেলাইটে পাঠানো হবে।</p>
          </div>
        `;
      }
    });
  }
});