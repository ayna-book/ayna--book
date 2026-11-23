
import { loginUser } from "./auth.js";

import { auth } from "./app.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const message = document.getElementById("message");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user && user.emailVerified) {
    window.location.replace("./home.html");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (loginButton.disabled) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Email ও Password লিখুন।";
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = "PLEASE WAIT...";
  message.textContent = "";

  try {
    const result = await loginUser(email, password);

    const user = result.user || result;

    if (!user) {
      throw new Error("Login করা যায়নি।");
    }

    if (!user.emailVerified) {
      message.textContent = "আপনার Email Verify করা হয়নি।";

      window.location.href = "./verify-email.html";
      return;
    }

    message.textContent = "Login সফল হয়েছে!";

    window.location.replace("./home.html");

  } catch (error) {
    console.error("Login Error:", error);

    const errors = {
      "auth/invalid-email": "সঠিক Email Address দিন।",
      "auth/user-not-found": "এই Email দিয়ে কোনো Account পাওয়া যায়নি।",
      "auth/wrong-password": "Password সঠিক নয়।",
      "auth/invalid-credential": "Email অথবা Password সঠিক নয়।",
      "auth/user-disabled": "আপনার Account বন্ধ রয়েছে।",
      "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।",
      "auth/network-request-failed": "Internet Connection পরীক্ষা করুন।"
    };

    message.textContent =
      errors[error.code] || error.message || "Login ব্যর্থ হয়েছে।";

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "LOGIN";
  }
});
