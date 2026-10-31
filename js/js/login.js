import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const resetButton = document.getElementById("resetButton");
const status = document.getElementById("status");

function showStatus(message) {
  status.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    showStatus("ইমেইল ও পাসওয়ার্ড লিখুন।");
    return;
  }

  loginButton.disabled = true;
  resetButton.disabled = true;
  showStatus("লগইন হচ্ছে...");

  try {
    await signInWithEmailAndPassword(auth, email, password);

    showStatus("✅ লগইন সফল! AYNA BOOK খুলছে...");

    window.location.replace("./index.html");

  } catch (error) {
    console.error("AYNA BOOK login error:", error);

    const messages = {
      "auth/invalid-credential":
        "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। আবার পরীক্ষা করুন।",

      "auth/user-not-found":
        "এই ইমেইলে অ্যাকাউন্ট পাওয়া যায়নি।",

      "auth/wrong-password":
        "পাসওয়ার্ড সঠিক নয়।",

      "auth/invalid-email":
        "সঠিক ইমেইল ঠিকানা লিখুন।",

      "auth/too-many-requests":
        "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

      "auth/network-request-failed":
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

      "auth/operation-not-allowed":
        "Firebase Authentication-এ Email/Password চালু করতে হবে।"
    };

    showStatus(
      messages[error.code] ||
      "লগইন হয়নি। ইন্টারনেট ও Firebase সেটিংস পরীক্ষা করুন।"
    );

  } finally {
    loginButton.disabled = false;
    resetButton.disabled = false;
  }
});

resetButton.addEventListener("click", async () => {
  const email = emailInput.value.trim().toLowerCase();

  if (!email) {
    showStatus("পাসওয়ার্ড রিসেট করতে আগে ইমেইল লিখুন।");
    emailInput.focus();
    return;
  }

  resetButton.disabled = true;
  showStatus("পাসওয়ার্ড রিসেটের ইমেইল পাঠানো হচ্ছে...");

  try {
    await sendPasswordResetEmail(auth, email);

    showStatus(
      "পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে। Inbox ও Spam/Junk ফোল্ডার দেখুন।"
    );

  } catch (error) {
    console.error("Password reset error:", error);

    showStatus(
      "রিসেট ইমেইল পাঠানো যায়নি। ইমেইল ঠিকানা ও Firebase সেটিংস পরীক্ষা করুন।"
    );

  } finally {
    resetButton.disabled = false;
  }
});