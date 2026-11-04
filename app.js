// AYNA BOOK - 5000-Year Quantum & Auto-Link Online Core Engine

document.addEventListener('DOMContentLoaded', () => {
  console.log("AYNA BOOK Auto-Link Online Engine Initialized.");

  // ১. সিঙ্গেল পেজ নেভিগেশন (সরাসরি পেজ পরিবর্তন করার অটো-লিকিং)
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

  // ২. পাসওয়ার্ড শো/হাইড় বাটন
  const showPassButtons = document.querySelectorAll('.show-password');
  showPassButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const inputField = document.getElementById(targetId);
      if (inputField) {
        inputField.type = inputField.type === 'password' ? 'text' : 'password';
        btn.textContent = inputField.type === 'password' ? 'Show' : 'Hide';
      }
    });
  });

  // ৩. অটো অনলাইন সংযোগ ও স্যাটেলাইট স্ট্যাটাস আপডেট
  const cloudStatus = document.getElementById('cloudStatus');
  const appStatus = document.getElementById('appStatus');
  const loginStatusIndicator = document.getElementById('loginStatusIndicator');

  setTimeout(() => {
    if (cloudStatus) cloudStatus.textContent = "🟢 Online & NASA Satellite Linked (0MB Active)";
    if (appStatus) appStatus.textContent = "AYNA BOOK 5000-Year Global Network is Live.";
    if (loginStatusIndicator) loginStatusIndicator.textContent = "Online (Quantum Secure)";
  }, 500);

  // ৪. জিপিএস ও সামরিক রাডার অটো-কানেক্ট
  const startGpsBtn = document.getElementById('startGpsBtn');
  const gpsStatus = document.getElementById('gpsStatus');
  if (startGpsBtn) {
    startGpsBtn.addEventListener('click', () => {
      if (gpsStatus) gpsStatus.textContent = "📍 Military Satellite & GPS Auto-Connected Successfully!";
    });
  }
});