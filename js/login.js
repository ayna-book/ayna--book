import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const statusElement = document.getElementById("status");
const loginButton = document.getElementById("loginButton");
const resetButton = document.getElementById("resetButton");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

function showStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

if (!form || !statusElement || !loginButton) {
  console.error("AYNA BOOK: Login form elements not found.");
  showStatus("লগইন ফর্মে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।");
} else {
  form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      showStatus("Gmail এবং পাসওয়ার্ড লিখুন।");
      return;
    }

    loginButton.disabled = true;
    showStatus("আপনার অ্যাকাউন্ট যাচাই হচ্ছে...");

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = credential.user;

      // ইমেইল যাচাই না থাকলে যাচাইয়ের ইমেইল পাঠানো হবে।
      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
        } catch (verificationError) {
          console.error(
            "Email verification error:",
            verificationError
          );
        }

        await signOut(auth);

        showStatus(
          "আপনার ইমেইল এখনো যাচাই হয়নি। Gmail Inbox বা Spam ফোল্ডারে Firebase-এর যাচাই লিংক দেখুন।"
        );

        return;
      }

      showStatus("✅ লগইন সফল! AYNA BOOK খুলছে...");

      window.location.replace("./profile.html");

    } catch (error) {
      console.error("AYNA BOOK login error:", error);

      const messages = {
        "auth/invalid-email":
          "সঠিক Gmail বা ইমেইল ঠিকানা লিখুন।",

        "auth/invalid-credential":
          "Gmail অথবা পাসওয়ার্ড সঠিক নয়।",

        "auth/user-not-found":
          "এই ইমেইলে অ্যাকাউন্ট পাওয়া যায়নি।",

        "auth/wrong-password":
          "পাসওয়ার্ড সঠিক নয়।",

        "auth/too-many-requests":
          "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

        "auth/network-request-failed":
          "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

        "auth/user-disabled":
          "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।",

        "auth/operation-not-allowed":
          "Firebase Console-এ Email/Password sign-in চালু করতে হবে."
      };

      showStatus(
        messages[error.code] ||
        "লগইন হয়নি। ইমেইল, পাসওয়ার্ড ও Firebase সেটিংস পরীক্ষা করুন।"
      );

    } finally {
      loginButton.disabled = false;
    }
  });

  if (resetButton) {
    resetButton.addEventListener("click", async () => {
      const email = emailInput.value.trim().toLowerCase();

      if (!email) {
        showStatus(
          "পাসওয়ার্ড রিসেট করতে আগে আপনার Gmail লিখুন।"
        );
        emailInput.focus();
        return;
      }

      resetButton.disabled = true;
      showStatus("পাসওয়ার্ড রিসেটের ইমেইল পাঠানো হচ্ছে...");

      try {
        await sendPasswordResetEmail(auth, email);

        showStatus(
          "পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে। Gmail Inbox ও Spam ফোল্ডার পরীক্ষা করুন।"
        );

      } catch (error) {
        console.error("Password reset error:", error);

        showStatus(
          "রিসেট ইমেইল পাঠানো যায়নি। ইমেইল ও Firebase সেটিংস পরীক্ষা করুন।"
        );

      } finally {
        resetButton.disabled = false;
      }
    });
  }

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";

      passwordInput.type = isHidden ? "text" : "password";
      togglePassword.textContent = isHidden ? "লুকান" : "দেখুন";
      togglePassword.setAttribute(
        "aria-pressed",
        String(isHidden)
      );
    });
  }
}