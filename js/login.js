
import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const statusElement = document.getElementById("loginStatus");
const loginButton = document.getElementById("loginButton");

function showStatus(message) {
  statusElement.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email")
    .value.trim().toLowerCase();

  const password = document.getElementById("password").value;

  if (!email || !password) {
    showStatus("ইমেইল ও পাসওয়ার্ড লিখুন।");
    return;
  }

  loginButton.disabled = true;
  showStatus("লগইন হচ্ছে...");

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    // Require email verification
    if (!user.emailVerified) {
      try {
        await sendEmailVerification(user);
      } catch (verificationError) {
        console.error("Verification email error:", verificationError);
      }

      await signOut(auth);

      showStatus(
        "আপনার ইমেইল এখনো যাচাই করা হয়নি। Inbox খুলে Firebase verification link-এ চাপ দিন। প্রয়োজনে Spam/Junk ফোল্ডার দেখুন।"
      );

      return;
    }

    showStatus("✅ লগইন সফল! AYNA BOOK খুলছে...");

    window.location.replace("./profile.html");

  } catch (error) {
    console.error("Login error:", error);

    const messages = {
      "auth/invalid-email":
        "সঠিক ইমেইল ঠিকানা লিখুন।",

      "auth/invalid-credential":
        "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",

      "auth/user-not-found":
        "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",

      "auth/wrong-password":
        "পাসওয়ার্ড সঠিক নয়।",

      "auth/too-many-requests":
        "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

      "auth/network-request-failed":
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

      "auth/user-disabled":
        "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।"
    };

    showStatus(
      messages[error.code] ||
      "লগইন করা যায়নি। ইমেইল, পাসওয়ার্ড ও Firebase সেটিংস পরীক্ষা করুন।"
    );

  } finally {
    loginButton.disabled = false;
  }
});
