document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const menuButton = document.getElementById('menuButton');
  const mainNav = document.getElementById('mainNav');
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const bottomItems = document.querySelectorAll('.bottom-item');
  const actionButtons = document.querySelectorAll('[data-go]');
  const showPasswordBtns = document.querySelectorAll('.show-password');

  // Register & OTP Elements
  const registerForm = document.getElementById('registerForm');
  const otpSection = document.getElementById('otpSection');

  // Page Switch Function
  function navigateToPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    navLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    bottomItems.forEach(item => {
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Top Nav Clicks
  navLinks.forEach(button => {
    button.addEventListener('click', () => {
      navigateToPage(button.dataset.page);
    });
  });

  // Bottom Nav Clicks
  bottomItems.forEach(button => {
    button.addEventListener('click', () => {
      navigateToPage(button.dataset.page);
    });
  });

  // Action Buttons Clicks (data-go)
  actionButtons.forEach(button => {
    button.addEventListener('click', () => {
      navigateToPage(button.dataset.go);
    });
  });

  // Toggle Mobile Menu
  if (menuButton && mainNav) {
    menuButton.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
  }

  // Password Show / Hide Toggle
  showPasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const passInput = document.getElementById(targetId);
      if (passInput) {
        if (passInput.type === 'password') {
          passInput.type = 'text';
          btn.textContent = 'Hide';
        } else {
          passInput.type = 'password';
          btn.textContent = 'Show';
        }
      }
    });
  });

  // Register Form Submit -> Show OTP Section
  if (registerForm && otpSection) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault(); // ফর্মের ডিফল্ট রিলোড হওয়া আটকাবে
      
      // রেজিস্ট্রেশন ফর্ম লুকিয়ে ওটিপি বক্সটি দৃশ্যমান করা
      registerForm.style.display = 'none';
      otpSection.hidden = false;
      
      const otpStatus = document.getElementById('otpStatus');
      if(otpStatus) {
        otpStatus.textContent = "ওটিপি সফলভাবে পাঠানো হয়েছে। দয়া করে ৬ সংখ্যার কোডটি লিখুন।";
      }
    });
  }
});