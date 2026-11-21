// =========================================================
// AYNA BOOK
// FORGOT PASSWORD CONTROLLER
// File: forgot-password.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  resetPassword,
  getAuthErrorMessage
} from "./auth.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form =
  document.getElementById("forgotPasswordForm");

const emailInput =
  document.getElementById("email");

const resetButton =
  document.getElementById("resetButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;

  statusMessage.className =
    "status-message";

  statusMessage.classList.add(type);
}


// =========================================================
// BUTTON STATE
// =========================================================

function setLoading(isLoading) {

  if (!resetButton) {
    return;
  }

  if (isLoading) {

    resetButton.disabled = true;

    resetButton.dataset.originalText =
      resetButton.textContent;

    resetButton.textContent =
      "Sending...";

  } else {

    resetButton.disabled = false;

    resetButton.textContent =
      resetButton.dataset.originalText ||
      "Send Reset Link";
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
// EMAIL VALIDATION
// =========================================================

function validateEmail(email) {

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


  return {
    valid: true
  };
}


// =========================================================
// PASSWORD RESET
// =========================================================

async function handlePasswordReset() {

  const email =
    normalizeEmail(
      emailInput?.value
    );


  const validation =
    validateEmail(email);


  if (!validation.valid) {

    showStatus(
      validation.message,
      "error"
    );

    return;
  }


  setLoading(true);


  showStatus(
    "Password Reset Link পাঠানো হচ্ছে...",
    "info"
  );


  try {

    // =====================================================
    // FIREBASE PASSWORD RESET
    // =====================================================

    await resetPassword(email);


    // =====================================================
    // SUCCESS
    // =====================================================

    showStatus(
      "✅ Password Reset Link আপনার Gmail-এ পাঠানো হয়েছে। Gmail Inbox এবং Spam/Junk folder পরীক্ষা করুন।",
      "success"
    );


    // Email field পরিষ্কার
    if (emailInput) {
      emailInput.value = "";
    }


  } catch (error) {

    console.error(
      "AYNA BOOK Password Reset Error:",
      error
    );


    // =====================================================
    // USER NOT FOUND
    // =====================================================

    if (
      error?.code ===
      "auth/user-not-found"
    ) {

      showStatus(
        "এই Gmail দিয়ে কোনো AYNA BOOK Account পাওয়া যায়নি।",
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
        "Gmail Address সঠিক নয়।",
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
        "⚠️ অনেকবার Reset Link চাওয়া হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।",
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
    // DEFAULT ERROR
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

      await handlePasswordReset();

    }
  );

}


// =========================================================
// INITIAL MESSAGE
// =========================================================

showStatus(
  "আপনার Verified Gmail Address দিন।",
  "info"
);


// =========================================================
// DEBUG
// =========================================================

console.log(
  "========================================"
);

console.log(
  "AYNA BOOK - Forgot Password"
);

console.log(
  "forgot-password.js loaded successfully."
);

console.log(
  "========================================"
);