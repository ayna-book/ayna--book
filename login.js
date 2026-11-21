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

const form =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.getElementById("loginButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// STATUS
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;

  statusMessage.className = "status-message";

  if (type === "success") {
    statusMessage.classList.add("success");
  }

  if (type === "error") {
    statusMessage.classList.add("error");
  }

  if (type === "warning") {
    statusMessage.classList.add("warning");
  }

  if (type === "info") {
    statusMessage.classList.add("info");
  }
}


// =========================================================
// BUTTON STATE
// =========================================================

function setLoading(isLoading) {

  if (!loginButton) {
    return;
  }

  if (isLoading) {

    loginButton.disabled = true;

    loginButton.dataset.originalText =
      loginButton.textContent;

    loginButton.textContent =
      "Logging in...";

  } else {

    loginButton.disabled = false;

    loginButton.textContent =
      loginButton.dataset.originalText ||
      "Log In";
  }
}


// =========================================================
// INPUT NORMALIZATION
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

  const email =
    normalizeEmail(
      emailInput?.value
    );

  const password =
    String(
      passwordInput?.value || ""
    );


  if (!email) {

    return {
      valid: false,
      message: "Gmail Address লিখুন।"
    };
  }


  if (
    !/^[^\s@]+@gmail\.com$/i.test(email)
  ) {

    return {
      valid: false,
      message:
        "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
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
// LOGIN
// =========================================================

async function handleLogin() {

  const validation =
    validateLoginForm();


  if (!validation.valid) {

    showStatus(
      validation.message,
      "error"
    );

    return;
  }


  setLoading(true);


  try {

    // =====================================================
    // STEP 1 — FIREBASE LOGIN
    // =====================================================

    showStatus(
      "Firebase Account যাচাই করা হচ্ছে...",
      "info"
    );


    const user =
      await loginUser(
        validation.email,
        validation.password
      );


    if (!user?.uid) {

      throw new Error(
        "LOGIN_USER_MISSING"
      );
    }


    // =====================================================
    // STEP 2 — LOGIN ACTIVITY
    // =====================================================

    showStatus(
      "Login Activity সংরক্ষণ করা হচ্ছে...",
      "info"
    );


    try {

      await recordLoginActivity(
        user
      );

    } catch (activityError) {

      // Login Activity ব্যর্থ হলেও
      // মূল Login বন্ধ হবে না।

      console.warn(
        "Login activity could not be recorded:",
        activityError
      );

    }


    // =====================================================
    // STEP 3 — SUCCESS
    // =====================================================

    showStatus(
      "✅ Login সফল হয়েছে। AYNA BOOK খুলছে...",
      "success"
    );


    // Password field পরিষ্কার
    if (passwordInput) {
      passwordInput.value = "";
    }


    // =====================================================
    // REDIRECT
    // =====================================================

    setTimeout(() => {

      window.location.href =
        "./index.html";

    }, 800);


  } catch (error) {

    console.error(
      "AYNA BOOK Login Error:",
      error
    );


    // =====================================================
    // EMAIL NOT VERIFIED
    // =====================================================

    if (
      error?.code ===
      "auth/email-not-verified"
    ) {

      showStatus(
        "⚠️ আপনার Gmail এখনো Verified হয়নি। Gmail খুলে Verification Link-এ ক্লিক করুন, তারপর আবার Login করুন।",
        "warning"
      );

      return;
    }


    // =====================================================
    // INVALID CREDENTIALS
    // =====================================================

    if (
      error?.code ===
      "auth/invalid-credential"
    ) {

      showStatus(
        "❌ Gmail অথবা Password সঠিক নয়।",
        "error"
      );

      return;
    }


    // পুরোনো Firebase error compatibility
    if (
      error?.code ===
      "auth/wrong-password"
    ) {

      showStatus(
        "❌ Password সঠিক নয়।",
        "error"
      );

      return;
    }


    if (
      error?.code ===
      "auth/user-not-found"
    ) {

      showStatus(
        "❌ এই Gmail দিয়ে কোনো AYNA BOOK Account পাওয়া যায়নি।",
        "error"
      );

      return;
    }


    // =====================================================
    // INVALID EMAIL
    // =====================================================

    if (
      error?.code ===
      "auth/invalid-email"
    ) {

      showStatus(
        "❌ Gmail Address সঠিক নয়।",
        "error"
      );

      return;
    }


    // =====================================================
    // TOO MANY REQUESTS
    // =====================================================

    if (
      error?.code ===
      "auth/too-many-requests"
    ) {

      showStatus(
        "⚠️ অনেকবার Login চেষ্টা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।",
        "warning"
      );

      return;
    }


    // =====================================================
    // NETWORK ERROR
    // =====================================================

    if (
      error?.code ===
      "auth/network-request-failed"
    ) {

      showStatus(
        "❌ Internet Connection পরীক্ষা করুন।",
        "error"
      );

      return;
    }


    // =====================================================
    // USER DISABLED
    // =====================================================

    if (
      error?.code ===
      "auth/user-disabled"
    ) {

      showStatus(
        "❌ এই Account বর্তমানে নিষ্ক্রিয় করা হয়েছে।",
        "error"
      );

      return;
    }


    // =====================================================
    // DEFAULT FIREBASE ERROR
    // =====================================================

    const friendlyMessage =
      getAuthErrorMessage(error);


    showStatus(
      `❌ ${friendlyMessage}`,
      "error"
    );

  } finally {

    setLoading(false);

  }
}


// =========================================================
// FORM SUBMIT
// =========================================================

if (form) {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      await handleLogin();

    }
  );

}


// =========================================================
// AUTH STATE MONITOR
// =========================================================

watchAuthState(
  (user) => {

    if (!user) {
      return;
    }


    console.log(
      "AYNA BOOK Auth State:",
      {
        uid: user.uid,
        email: user.email,
        emailVerified:
          user.emailVerified
      }
    );

  }
);


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

console.log(
  "========================================"
);

console.log(
  "AYNA BOOK - Login Controller"
);

console.log(
  "login.js loaded successfully."
);

console.log(
  "========================================"
);