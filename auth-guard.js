// ============================================================
// AYNA BOOK — AUTH GUARD
// Protects private pages from unauthenticated users
// Firebase Web SDK 13.4.0
// ============================================================

import { auth } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

// ------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------

const LOGIN_PAGE = "./login.html";

// ------------------------------------------------------------
// OPTIONAL: Show a temporary loading message
// ------------------------------------------------------------

function showAuthChecking() {
  document.documentElement.classList.add("ayna-auth-checking");

  const loader = document.getElementById("authGuardLoader");

  if (loader) {
    loader.style.display = "flex";
  }
}

// ------------------------------------------------------------
// Hide loading message
// ------------------------------------------------------------

function hideAuthChecking() {
  document.documentElement.classList.remove("ayna-auth-checking");

  const loader = document.getElementById("authGuardLoader");

  if (loader) {
    loader.style.display = "none";
  }
}

// ------------------------------------------------------------
// Redirect to login
// ------------------------------------------------------------

function redirectToLogin() {
  const currentPage =
    window.location.pathname +
    window.location.search +
    window.location.hash;

  // Prevent redirect loop
  if (
    window.location.pathname.endsWith("/login.html") ||
    window.location.pathname.endsWith("login.html")
  ) {
    return;
  }

  // Save the page the user wanted to open
  try {
    sessionStorage.setItem(
      "aynaReturnAfterLogin",
      currentPage
    );
  } catch (error) {
    console.warn(
      "AYNA BOOK: Could not save return page.",
      error
    );
  }

  window.location.replace(LOGIN_PAGE);
}

// ------------------------------------------------------------
// Firebase Auth State
// ------------------------------------------------------------

showAuthChecking();

onAuthStateChanged(
  auth,
  (user) => {

    if (!user) {
      redirectToLogin();
      return;
    }

    // User is authenticated
    hideAuthChecking();

    // Make current user available globally
    window.AYNA_AUTH_USER = user;

    console.log(
      "AYNA BOOK: Authenticated user:",
      user.uid
    );
  },

  (error) => {

    console.error(
      "AYNA BOOK: Authentication state error:",
      error
    );

    redirectToLogin();
  }
);