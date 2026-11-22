// =========================================================
// AYNA BOOK
// FAST HOME STARTUP CONTROLLER
// File: index.js
// =========================================================

import { watchAuthState, logoutUser } from "./auth.js";

const $ = (id) => document.getElementById(id);

const authActionLink = $("authActionLink");
const authStateLabel = $("authStateLabel");
const aynaIdDisplay = $("aynaIdDisplay");
const barcodeCaption = $("barcodeCaption");
const userStatusText = $("userStatusText");
const userFramePhoto = $("userFramePhoto");
const accountTierBadge = $("accountTierBadge");

const DEFAULT_ID = "2026-----10000001";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAynaId(uid) {
  if (!uid) return DEFAULT_ID;

  let hash = 10000001;

  for (let i = 0; i < uid.length; i++) {
    hash =
      (hash * 31 + uid.charCodeAt(i)) % 89999999 +
      10000000;
  }

  return `2026-----${hash}`;
}

window.notify = function (message) {
  const toast = $("aynaToast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.__aynaToastTimer);

  window.__aynaToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
};

window.scrollToTop = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};

window.focusComposer = function () {
  const composer = $("postInput");

  if (!composer) return;

  composer.focus();

  composer.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
};

function setGuestState() {
  if (authStateLabel) {
    authStateLabel.textContent = "GUEST";
  }

  if (aynaIdDisplay) {
    aynaIdDisplay.textContent = DEFAULT_ID;
  }

  if (barcodeCaption) {
    barcodeCaption.textContent = DEFAULT_ID;
  }

  if (accountTierBadge) {
    accountTierBadge.textContent = "PERSONAL";
  }

  if (userStatusText) {
    userStatusText.innerHTML =
      'Guest Mode • <a href="./signup.html" style="color:var(--gold-bright);text-decoration:underline;">Create Free Account</a>';
  }

  if (authActionLink) {
    authActionLink.textContent = "Sign In";
    authActionLink.href = "./login.html";
    authActionLink.onclick = null;
  }
}

function setSignedInState(user) {
  const id = formatAynaId(user.uid);

  if (authStateLabel) {
    authStateLabel.textContent = "ACTIVE";
  }

  if (aynaIdDisplay) {
    aynaIdDisplay.textContent = id;
  }

  if (barcodeCaption) {
    barcodeCaption.textContent = id;
  }

  if (accountTierBadge) {
    accountTierBadge.textContent = "PERSONAL";
  }

  if (userFramePhoto && user.photoURL) {
    userFramePhoto.src = user.photoURL;
  }

  if (userStatusText) {
    userStatusText.innerHTML =
      `Signed in as <strong>${escapeHtml(
        user.email || user.uid
      )}</strong>`;
  }

  if (authActionLink) {
    authActionLink.textContent = "Sign Out";
    authActionLink.href = "#logout";

    authActionLink.onclick = async (event) => {
      event.preventDefault();

      try {
        await logoutUser();
        window.notify("Signed out securely.");
      } catch (error) {
        console.error("Logout error:", error);
        window.notify("Logout failed.");
      }
    };
  }
}

function startAuthObserver() {
  watchAuthState((user) => {
    if (user) {
      setSignedInState(user);
    } else {
      setGuestState();
    }
  });
}

function registerServiceWorkerLater() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((error) => {
        console.warn(
          "Service worker registration failed:",
          error
        );
      });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(register, {
      timeout: 2500
    });
  } else {
    setTimeout(register, 1200);
  }
}

function boot() {
  startAuthObserver();

  // Do not block first paint.
  registerServiceWorkerLater();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, {
    once: true
  });
} else {
  boot();
}