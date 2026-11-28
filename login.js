
// =========================================================
// AYNA BOOK — LOGIN MODULE
// Firebase Authentication 13.4.0
// Email Verification Required
// =========================================================

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  reload
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  auth,
  authReady
} from "./app.js";

const $ = id => document.getElementById(id);

const loginForm = $("loginForm");
const loginBtn = $("loginBtn");
const loginStatus = $("loginStatus");

let loginInProgress = false;
let redirecting = false;


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(element, message, error = false) {
  if (!element) return;

  element.textContent = message;
  element.style.color = error ? "#ff8888" : "#e4bd45";
}


// =========================================================
// FIREBASE INITIALIZATION
// =========================================================

await authReady;

if (!auth) {
  showStatus(
    loginStatus,
    "Firebase সংযোগ পাওয়া যায়নি। firebase-init.js পরীক্ষা করুন।",
    true
  );

  if (loginBtn) loginBtn.disabled = true;

  throw new Error("Firebase Authentication is not initialized.");
}


// =========================================================
// AUTH STATE CHECK
// Already logged-in users are redirected safely
// =========================================================

onAuthStateChanged(auth, async user => {
  if (!user || redirecting) return;

  try {
    await reload(user);

    if (redirecting) return;

    redirecting = true;

    if (user.emailVerified) {
      window.location.replace("./profile.html");
    } else {
      window.location.replace("./verify-email.html");
    }

  } catch (error) {
    console.error("Auth state check error:", error);
    redirecting = false;
  }
});


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

$("togglePassword")?.addEventListener("click", () => {
  const password = $("password");
  const button = $("togglePassword");

  if (!password || !button) return;

  const visible = password.type === "password";

  password.type = visible ? "text" : "password";
  button.textContent = visible ? "লুকান" : "দেখুন";
});


// =========================================================
// FIREBASE EMAIL / PASSWORD LOGIN
// =========================================================

loginForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (loginInProgress || redirecting) return;

  const email = ($("email")?.value || "").trim().toLowerCase();
  const password = $("password")?.value || "";

  if (!email || !password) {
    showStatus(loginStatus, "ইমেইল ও পাসওয়ার্ড লিখুন।", true);
    return;
  }

  loginInProgress = true;

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = "লগইন হচ্ছে...";
  }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    // Firebase user-এর সর্বশেষ verification status আনুন
    await reload(user);

    if (!user.emailVerified) {
      showStatus(
        loginStatus,
        "আপনার ইমেইল এখনো যাচাই হয়নি। Verification পেজে নেওয়া হচ্ছে...",
        true
      );

      // Sign Out করা হচ্ছে না।
      // verify-email.js-এর জন্য Login session প্রয়োজন।

      redirecting = true;

      setTimeout(() => {
        window.location.replace("./verify-email.html");
      }, 800);

      return;
    }

    showStatus(
      loginStatus,
      "লগইন সফল! আপনার প্রোফাইল খুলছে..."
    );

    redirecting = true;

    window.location.replace("./profile.html");

  } catch (error) {
    console.error("AYNA Login Error:", error);

    const messages = {
      "auth/invalid-email":
        "সঠিক Email ঠিকানা লিখুন।",

      "auth/invalid-credential":
        "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",

      "auth/user-not-found":
        "এই Email দিয়ে অ্যাকাউন্ট পাওয়া যায়নি।",

      "auth/wrong-password":
        "পাসওয়ার্ড সঠিক নয়।",

      "auth/user-disabled":
        "এই অ্যাকাউন্টটি নিষ্ক্রিয়।",

      "auth/too-many-requests":
        "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

      "auth/network-request-failed":
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

      "auth/operation-not-allowed":
        "Firebase Console-এ Email/Password Login চালু করুন।"
    };

    showStatus(
      loginStatus,
      messages[error.code] ||
        "লগইন ব্যর্থ হয়েছে। Firebase সেটিংস পরীক্ষা করুন।",
      true
    );

  } finally {
    loginInProgress = false;

    if (loginBtn && !redirecting) {
      loginBtn.disabled = false;
      loginBtn.textContent = "লগইন";
    }
  }
});


// =========================================================
// FORGOT PASSWORD / ACCOUNT LOOKUP
// =========================================================

$("lookupBtn")?.addEventListener("click", async () => {
  const email = ($("lookupEmail")?.value || "")
    .trim()
    .toLowerCase();

  const button = $("lookupBtn");
  const status = $("lookupStatus");

  if (!email) {
    showStatus(status, "আপনার Email ঠিকানা লিখুন।", true);
    $("lookupEmail")?.focus();
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    showStatus(status, "সঠিক Email ঠিকানা লিখুন।", true);
    return;
  }

  if (button) {
    button.disabled = true;
    button.textContent = "পাঠানো হচ্ছে...";
  }

  try {
    await sendPasswordResetEmail(auth, email);

    showStatus(
      status,
      "যদি এই Email দিয়ে অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেটের নির্দেশ পাঠানো হয়েছে। Inbox ও Spam ফোল্ডার দেখুন।"
    );

  } catch (error) {
    console.error("Password Reset Error:", error);

    if (error.code === "auth/too-many-requests") {
      showStatus(
        status,
        "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",
        true
      );
    } else {
      showStatus(
        status,
        "পাসওয়ার্ড রিসেট অনুরোধ পাঠানো যায়নি। ইন্টারনেট ও Firebase সেটিংস পরীক্ষা করুন।",
        true
      );
    }

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "অ্যাকাউন্ট খুঁজুন";
    }
  }
});


// =========================================================
// AYNA VOICE ASSISTANT
// =========================================================

$("speakBtn")?.addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    showStatus(
      loginStatus,
      "এই ব্রাউজারে Voice সুবিধা নেই।",
      true
    );
    return;
  }

  window.speechSynthesis.cancel();

  const message = new SpeechSynthesisUtterance(
    "প্রিয় স্যার, AYNA BOOK-এ আপনাকে স্বাগতম। আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে নিরাপদে লগইন করুন।"
  );

  message.lang = "bn-BD";
  message.rate = 0.9;

  window.speechSynthesis.speak(message);
});


// =========================================================
// MORE INFORMATION
// =========================================================

$("moreBtn")?.addEventListener("click", () => {
  const message = $("assistantMessage");

  if (message) {
    message.textContent =
      "আপনার অ্যাকাউন্ট নিরাপদ রাখতে পাসওয়ার্ড কাউকে দেবেন না। " +
      "লগইন সমস্যায় Forgot Password ব্যবহার করুন। " +
      "ইমেইল যাচাই না হলে Verification পেজে যান।";
  }
});

console.log("AYNA BOOK Login Module Ready.");
