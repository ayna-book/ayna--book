document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const menuButton = document.getElementById('menuButton');
  const mainNav = document.getElementById('mainNav');
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const bottomItems = document.querySelectorAll('.bottom-item');
  const actionButtons = document.querySelectorAll('[data-go]');
  const showPasswordBtns = document.querySelectorAll('.show-password');

  // Page Switch Function
  function navigateToPage(pageId) {
    // 1. Hide all pages
    pages.forEach(page => page.classList.remove('active'));

    // 2. Show selected page
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // 3. Update top nav active state
    navLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // 4. Update bottom nav active state
    bottomItems.forEach(item => {
      if (item.dataset.page === pageId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile main menu if open
    if (mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
    }

    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Top Nav Button Clicks
  navLinks.forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.page;
      navigateToPage(pageId);
    });
  });

  // Bottom Nav Button Clicks
  bottomItems.forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.page;
      navigateToPage(pageId);
    });
  });

  // Feature Cards and Hero Buttons (data-go) Clicks
  actionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPageId = button.dataset.go;
      navigateToPage(targetPageId);
    });
  });

  // Toggle Header Mobile Menu
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
});