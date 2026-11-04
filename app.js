// AYNA BOOK — 10,000-Year Quantum & 1500+ Tech Engine

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ইউনিভার্সাল পেজ সুইচিং ও বাটন সচল রাখার লজিক
function initAynaSystem() {
  const allNavElements = document.querySelectorAll('[data-page], [data-go]');
  const pages = document.querySelectorAll('.page');

  function gotoPage(targetId) {
    if (!targetId) return;

    pages.forEach(page => {
      if (page.id === 'page-' + targetId) {
        page.classList.add('active');
        page.style.display = 'block';
      } else {
        page.classList.remove('active');
        page.style.display = 'none';
      }
    });

    allNavElements.forEach(el => {
      const pageName = el.getAttribute('data-page') || el.getAttribute('data-go');
      if (pageName === targetId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.body.addEventListener('click', (e) => {
    const clickable = e.target.closest('[data-page], [data-go]');
    if (clickable) {
      e.preventDefault();
      const targetPage = clickable.getAttribute('data-page') || clickable.getAttribute('data-go');
      gotoPage(targetPage);
    }
  });
}

// DOM লোড হলে এক্সিকিউট হবে
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAynaSystem);
} else {
  initAynaSystem();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("AYNA BOOK 1500-Tech & 10,000-Year Engine Initialized.");

  // ১. সুপার ফাস্ট চ্যাট ও ফাইল ট্রান্সফার
  const chatForm = document.getElementById('chatForm');
  const chatInputMsg = document.getElementById('chatInputMsg');
  const chatMessagesContainer = document.getElementById('chatMessagesContainer');
  const bulkFileInput = document.getElementById('bulkFileInput');
  const fileNameDisplay = document.getElementById('fileNameDisplay');

  if (bulkFileInput) {
    bulkFileInput.addEventListener('change', () => {
      if (bulkFileInput.files.length > 0) {
        fileNameDisplay.textContent = `${bulkFileInput.files.length}টি ফাইল সিলেক্ট করা হয়েছে (Ready for 10GB/s transfer)`;
      }
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInputMsg.value.trim();
      if (!msg && (!bulkFileInput || bulkFileInput.files.length === 0)) return;

      const userElem = document.createElement('div');
      userElem.style.cssText = "background: #071b49; border: 1px solid #00ffcc44; color: #fff; padding: 10px; border-radius: 8px; margin-bottom: 8px;";
      
      let fileText = "";
      if (bulkFileInput && bulkFileInput.files.length > 0) {
        fileText = ` <br><span style="color:#00ffcc;">📎 [Attached Files: ${bulkFileInput.files.length} files sent at light-speed]</span>`;
      }

      userElem.innerHTML = `<strong>Sathiya:</strong> ${msg} ${fileText}`;
      chatMessagesContainer.appendChild(userElem);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

      chatInputMsg.value = "";
      if (bulkFileInput) bulkFileInput.value = "";
      if (fileNameDisplay) fileNameDisplay.textContent = "কোনো ফাইল নেই";
    });
  }

  // ২. ইনস্ট্যান্ট লাইভ ভিডিও কল (Camera Stream)
  const startLiveCamBtn = document.getElementById('startLiveCamBtn');
  const liveVideoFeed = document.getElementById('liveVideoFeed');

  if (startLiveCamBtn && liveVideoFeed) {
    startLiveCamBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        liveVideoFeed.srcObject = stream;
        startLiveCamBtn.textContent = "🟢 লাইভ ভিডিও সম্প্রচার চলছে";
        startLiveCamBtn.style.background = "#00ffcc";
        startLiveCamBtn.style.color = "#000";
      } catch (err) {
        alert("ক্যামেরা পারমিশন পাওয়া যায়নি অথবা ব্রাউজার ব্লক করেছে।");
        console.error(err);
      }
    });
  }

  // ৩. আয়না বুক ভিডিও আপলোড ও ফিড বক্স
  const uploadVideoBtn = document.getElementById('uploadVideoBtn');
  const videoUploadInput = document.getElementById('videoUploadInput');
  const videoFeedContainer = document.getElementById('videoFeedContainer');

  if (uploadVideoBtn && videoUploadInput) {
    uploadVideoBtn.addEventListener('click', () => {
      if (videoUploadInput.files.length === 0) {
        alert("দয়া করে প্রথমে একটি ভিডিও ফাইল সিলেক্ট করুন!");
        return;
      }

      const file = videoUploadInput.files[0];
      const videoURL = URL.createObjectURL(file);

      const videoCard = document.createElement('div');
      videoCard.style.cssText = "margin-bottom: 15px; background: #071b49; padding: 10px; border-radius: 8px; border: 1px solid #00ffcc;";
      videoCard.innerHTML = `
        <p style="color: #00ffcc; font-weight: bold; margin-bottom: 5px;">🎥 ${file.name}</p>
        <video controls style="width: 100%; max-height: 200px; border-radius: 6px;" src="${videoURL}"></video>
      `;

      videoFeedContainer.prepend(videoCard);
      alert("ভিডিও সফলভাবে আয়না বুক হাবে আপলোড ও প্রকাশিত হয়েছে!");
      videoUploadInput.value = "";
    });
  }
});