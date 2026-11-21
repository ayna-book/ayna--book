
// =========================================================
// AYNA BOOK
// LOGIN CONTROLLER
// File: login.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  loginUser,
  watchAuthState,
  getAuthErrorMessage
} from "./auth.js";

import {
  recordLoginActivity
} from "./login-activity.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const statusMessage = document.getElementById("statusMessage");


// =========================================================
// STATUS
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) return;

  statusMessage.textContent = message;

  // HTML-এর status.show CSS-এর সঙ্গে সামঞ্জস্য
  statusMessage.className = "status show";

  statusMessage.classList.add(type);
}


// =========================================================
// BUTTON STATE
// =========================================================

function setLoading(isLoading) {

  if (!loginButton) return;

  if (isLoading) {

    loginButton.disabled = true;

    loginButton.dataset.originalText =
      loginButton.textContent;

    loginButton.textContent = "Logging in...";

  } else {

    loginButton.disabled = false;

    loginButton.textContent =
      loginButton.dataset.originalText || "Log In";
  }
}


// =========================================================
// EMAIL NORMALIZATION
// =========================================================

function normalizeEmail(value) {

  return String(value || "")
    .trim()
    .toLowerCase();
}


// =========================================================
// VALIDATION
// =========================================================

function validateLoginForm() {

  const email = normalizeEmail(emailInput?.value);

  const password = String(passwordInput?.value || "");

  if (!email) {
    return {
      valid: false,
      message: "Gmail Address লিখুন।"
    };
  }

  if (!/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)) {
    return {
      valid: false,
      message: "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
    };
  }

  if (!password) {
    return {
      valid: false,
      message: "Password লিখুন।"
    };
  }

  return {
    valid: true,
    email,
    password
  };
}


// =========================================================
// LOGIN CONTROLLER
// =========================================================

async function handleLogin() {

  const validation = validateLoginForm();

  if (!validation.valid) {
    showStatus(validation.message, "error");
    return;
  }

  setLoading(true);

  try {

    // STEP 1 — FIREBASE AUTHENTICATION

    showStatus(
      "Firebase Account যাচাই করা হচ্ছে...",
      "info"
    );

    const user = await loginUser(
      validation.email,
      validation.password
    );

    if (!user || !user.uid) {
      throw new Error("LOGIN_USER_MISSING");
    }


    // STEP 2 — EMAIL VERIFICATION CHECK

    if (!user.emailVerified) {

      const error = new Error("EMAIL_NOT_VERIFIED");
      error.code = "auth/email-not-verified";

      throw error;
    }


    // STEP 3 — LOGIN ACTIVITY

    showStatus(
      "Login Activity সংরক্ষণ করা হচ্ছে...",
      "info"
    );

    try {

      await recordLoginActivity(user);

    } catch (activityError) {

      console.warn(
        "Login activity failed:",
        activityError
      );

      // Activity ব্যর্থ হলেও Login চলবে
    }


    // STEP 4 — SUCCESS

    showStatus(
      "Login সফল হয়েছে। AYNA BOOK খুলছে...",
      "success"
    );

    if (passwordInput) {
      passwordInput.value = "";
    }


    // STEP 5 — REDIRECT

    window.location.replace("./index.html");

  } catch (error) {

    console.error("AYNA BOOK Login Error:", error);

    if (error?.code === "auth/email-not-verified") {

      showStatus(
        "আপনার Gmail এখনো Verified হয়নি। Gmail খুলে Verification Link-এ ক্লিক করুন।",
        "warning"
      );

    } else if (
      error?.code === "auth/invalid-credential" ||
      error?.code === "auth/wrong-password"
    ) {

      showStatus(
        "Gmail অথবা Password সঠিক নয়।",
        "error"
      );

    } else if (error?.code === "auth/user-not-found") {

      showStatus(
        "এই Gmail দিয়ে কোনো Account পাওয়া যায়নি।",
        "error"
      );

    } else if (error?.code === "auth/invalid-email") {

      showStatus(
        "Gmail Address সঠিক নয়।",
        "error"
      );

    } else if (error?.code === "auth/too-many-requests") {

      showStatus(
        "অনেকবার Login চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।",
        "warning"
      );

    } else if (
      error?.code === "auth/network-request-failed"
    ) {

      showStatus(
        "Internet Connection পরীক্ষা করুন।",
        "error"
      );

    } else if (error?.code === "auth/user-disabled") {

      showStatus(
        "এই Account বর্তমানে নিষ্ক্রিয়।",
        "error"
      );

    } else {

      showStatus(
        getAuthErrorMessage(error),
        "error"
      );
    }

  } finally {

    setLoading(false);

  }
}


// =========================================================
// FORM SUBMIT
// =========================================================

if (form) {

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    await handleLogin();

  });

} else {

  console.error("Login form not found: loginForm");

}


// =========================================================
// AUTH STATE MONITOR
// =========================================================

watchAuthState((user) => {

  if (user) {

    console.log("AYNA BOOK Auth State:", {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    });

  }

});


// =========================================================
// INITIAL STATUS
// =========================================================

showStatus(
  "আপনার Verified Gmail ও Password দিয়ে Login করুন।",
  "info"
);


// =========================================================
// DEBUG
// =========================================================

console.log("========================================");
console.log("AYNA BOOK - Login Controller");
console.log("login.js loaded successfully.");
console.log("========================================");
