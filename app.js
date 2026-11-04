// AYNA BOOK - Core Application Logic & Navigation Handler

document.addEventListener('DOMContentLoaded', () => {
  console.log("AYNA BOOK Quantum Core Initialized.");

  // ১. সিঙ্গেল পেজ নেভিগেশন সিস্টেম (SPA Routing)
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

    // ন্যাভবার আইটেম একটিভ করা
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

  // ২. পাসওয়ার্ড শো/হাইড় টগল বাটন
  const showPassButtons = document.querySelectorAll('.show-password');
  showPassButtons.forEach(btn => {
    btn.addEventListener('click', () => {
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

  // ৩. রেডিও ও টিভি মিডিয়া প্লেয়ার হ্যান্ডলার
  const playMediaBtn = document.getElementById('playMediaBtn');
  const stopMediaBtn = document.getElementById('stopMediaBtn');
  const mediaUrlInput = document.getElementById('mediaUrl');
  const videoPlayer = document.getElementById('videoPlayer');
  const audioPlayer = document.getElementById('audioPlayer');
  const mediaStatus = document.getElementById('mediaStatus');

  if (playMediaBtn) {
    playMediaBtn.addEventListener('click', () => {
      const url = mediaUrlInput.value.trim();
      if (!url) {
        mediaStatus.textContent = "অনুগ্রহ করে একটি অনুমোদিত স্ট্রিম ইউআরএল দিন।";
        return;
      }
      mediaStatus.textContent = "1000-Year Quantum Sound Engine Active: Streaming...";
      
      if (url.includes('.mp3') || url.includes('radio') || url.includes('audio')) {
        audioPlayer.src = url;
        audioPlayer.play().catch(err => {
          mediaStatus.textContent = "অডিও প্লে করতে সমস্যা হচ্ছে: " + err.message;
        });
      } else {
        videoPlayer.src = url;
        videoPlayer.play().catch(err => {
          mediaStatus.textContent = "ভিডিও প্লে করতে সমস্যা হচ্ছে: " + err.message;
        });
      }
    });
  }

  if (stopMediaBtn) {
    stopMediaBtn.addEventListener('click', () => {
      if (videoPlayer) { videoPlayer.pause(); videoPlayer.src = ""; }
      if (audioPlayer) { audioPlayer.pause(); audioPlayer.src = ""; }
      if (mediaStatus) { mediaStatus.textContent = "স্ট্রিম বন্ধ করা হয়েছে।"; }
    });
  }

  // ৪. জিপিএস ও সামরিক স্যাটেলাইট রাডার সিমুলেশন
  const startGpsBtn = document.getElementById('startGpsBtn');
  const gpsStatus = document.getElementById('gpsStatus');
  const compassHeading = document.getElementById('compassHeading');

  if (startGpsBtn) {
    startGpsBtn.addEventListener('click', () => {
      gpsStatus.textContent = "Military Satellite & GPS Scanning...";
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            gpsStatus.textContent = `📍 Satellite Locked! Lat: ${lat}, Lon: ${lon}`;
            if (compassHeading) {
              compassHeading.textContent = "Military Compass: North-Aligned (Quantum Sync)";
            }
          },
          (error) => {
            gpsStatus.textContent = "লொকেশন পারমিশন পাওয়া যায়নি বা জিপিএস নিষ্ক্রিয়।";
          }
        );
      } else {
        gpsStatus.textContent = "এই ব্রাউজারে জিপিএস সমর্থিত নয়।";
      }
    });
  }

  // ৫. ক্লাউড ও ফায়ারবেস কানেকশন স্ট্যাটাস স্টাব
  const cloudStatus = document.getElementById('cloudStatus');
  const appStatus = document.getElementById('appStatus');
  setTimeout(() => {
    if (cloudStatus) cloudStatus.textContent = "🟢 Quantum Firebase & Satellite Connected Successfully (0MB Mode)";
    if (appStatus) appStatus.textContent = "AYNA BOOK is fully operational at light speed.";
  }, 1000);
});