
/* =========================================================
   AYNA BOOK
   Login Controller
   File: login.js
   Firebase SDK: 13.4.0
   ========================================================= */

import {
  loginUser,
  watchAuthState
} from "./auth.js";


/* ---------- HTML Elements ---------- */

const loginForm = document.getElementById("loginForm");
const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const messageBox = document.getElementById("message");
const togglePasswordBtn = document.getElementById("togglePassword");


/* ---------- Show Message ---------- */

function showMessage(message, type = "error") {
  if (!messageBox) return;

  messageBox.textContent = message;
  messageBox.style.display = "block";

  if (type === "success") {
    messageBox.style.background = "#123B2A";
    messageBox.style.color = "#FFFFFF";
    messageBox.style.border = "1px solid #36C275";
  } else {
    messageBox.style.background = "#451C24";
    messageBox.style.color = "#FFFFFF";
    messageBox.style.border = "1px solid #FF6878";
  }
}


/* ---------- Hide Message ---------- */

function hideMessage() {
  if (!messageBox) return;

  messageBox.textContent = "";
  messageBox.style.display = "none";
}


/* ---------- Password Show / Hide ---------- */

if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    togglePasswordBtn.textContent = isHidden
      ? "লুকান"
      : "দেখুন";

    togglePasswordBtn.setAttribute(
      "aria-pressed",
      String(isHidden)
    );

    togglePasswordBtn.setAttribute(
      "aria-label",
      isHidden ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"
    );
  });
}


/* ---------- Login Form ---------- */

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideMessage();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    if (!identifier) {
      showMessage("নাম, ফোন নম্বর অথবা Gmail লিখুন।");
      identifierInput.focus();
      return;
    }

    if (!password || password.length < 11) {
      showMessage("পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।");
      passwordInput.focus();
      return;
    }

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = "অপেক্ষা করুন...";
    }

    try {
      const result = await loginUser(identifier, password);

      if (!result.success) {
        showMessage(result.message || "Login সফল হয়নি।");
        return;
      }

      showMessage("Login সফল হয়েছে। Dashboard-এ যাচ্ছেন...", "success");

      window.location.replace("./dashboard.html");

    } catch (error) {
      console.error("AYNA BOOK Login Controller Error:", error);

      showMessage(
        error.message || "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );

    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = "LOGIN";
      }
    }
  });
}


/* ---------- Firebase Login State ---------- */

watchAuthState((user) => {
  if (user) {
    console.log("AYNA BOOK: User is already logged in.");
  }
});


/* ---------- Ready ---------- */

console.log("AYNA BOOK Login Controller Loaded.");
