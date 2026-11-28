
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  auth,
  authReady
} from "./app.js";

const $ = (id) => document.getElementById(id);

const loginForm = $("loginForm");
const loginBtn = $("loginBtn");
const loginStatus = $("loginStatus");

function showStatus(element, message, error = false) {
  element.textContent = message;
  element.style.color = error ? "#ff8888" : "#e4bd45";
}

// Firebase Auth প্রস্তুত হওয়া পর্যন্ত অপেক্ষা
await authReady;

// ইতিমধ্যে লগইন থাকলে প্রোফাইলে পাঠানো
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.replace("./profile.html");
  }
});

// Password show/hide
$("togglePassword").addEventListener("click", () => {
  const password = $("password");
  const visible = password.type === "password";

  password.type = visible ? "text" : "password";
  $("togglePassword").textContent = visible ? "লুকান" : "দেখুন";
});

// ==================================================
// FIREBASE EMAIL/PASSWORD LOGIN
// ==================================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;

  if (!email || !password) {
    showStatus(loginStatus, "ইমেইল ও পাসওয়ার্ড লিখুন।", true);
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "লগইন হচ্ছে...";

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    if (!user.emailVerified) {
      showStatus(
        loginStatus,
        "আপনার ইমেইল এখনো যাচাই করা হয়নি। ইমেইল যাচাই করুন।",
        true
      );

      await auth.signOut();
      return;
    }

    showStatus(loginStatus, "লগইন সফল! প্রোফাইলে নেওয়া হচ্ছে...");

    window.location.replace("./profile.html");

  } catch (error) {
    console.error("AYNA Login Error:", error);

    const messages = {
      "auth/invalid-email": "সঠিক Gmail ঠিকানা লিখুন।",
      "auth/invalid-credential": "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
      "auth/user-disabled": "এই অ্যাকাউন্টটি নিষ্ক্রিয়।",
      "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।",
      "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করুন।"
    };

    showStatus(
      loginStatus,
      messages[error.code] || "লগইন ব্যর্থ: " + error.message,
      true
    );

  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "লগইন";
  }
});

// ==================================================
// SECURE PASSWORD RESET
// ==================================================

$("lookupBtn").addEventListener("click", async () => {
  const email = $("lookupEmail").value.trim().toLowerCase();
  const button = $("lookupBtn");

  if (!email) {
    showStatus($("lookupStatus"), "ইমেইল ঠিকানা লিখুন।", true);
    return;
  }

  button.disabled = true;

  try {
    await sendPasswordResetEmail(auth, email);

    showStatus(
      $("lookupStatus"),
      "যদি এই ইমেইলের অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেটের নির্দেশ পাঠানো হয়েছে। আপনার Inbox ও Spam ফোল্ডার দেখুন।"
    );

  } catch (error) {
    console.error("Password Reset Error:", error);

    showStatus(
      $("lookupStatus"),
      "রিসেট অনুরোধ সম্পন্ন করা যায়নি। ইমেইল ও ইন্টারনেট সংযোগ পরীক্ষা করুন।",
      true
    );

  } finally {
    button.disabled = false;
  }
});

// ==================================================
// AYNA VOICE ASSISTANT
// ==================================================

$("speakBtn").addEventListener("click", () => {
  if (!("speechSynthesis" in window)) {
    showStatus(loginStatus, "এই ব্রাউজারে Voice সুবিধা নেই।", true);
    return;
  }

  speechSynthesis.cancel();

  const message = new SpeechSynthesisUtterance(
    "প্রিয় স্যার, AYNA BOOK-এ আপনাকে স্বাগতম। আপনার ইমেইল এবং পাসওয়ার্ড দিয়ে নিরাপদে লগইন করুন।"
  );

  message.lang = "bn-BD";
  message.rate = 0.9;

  speechSynthesis.speak(message);
});

$("moreBtn").addEventListener("click", () => {
  $("assistantMessage").textContent =
    "আপনার অ্যাকাউন্ট নিরাপদ রাখতে পাসওয়ার্ড কাউকে দেবেন না। " +
    "লগইন সমস্যায় Forgot Password ব্যবহার করুন।";
});
