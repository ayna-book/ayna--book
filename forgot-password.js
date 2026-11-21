
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

    if (!resetButton.disabled) {

      resetButton.dataset.originalText =
        resetButton.textContent;
    }

    resetButton.disabled = true;

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

  if (email.length > 254) {

    return {
      valid: false,
      message: "Gmail Address অনেক বড়।"
    };
  }

  if (
    !/^[a-z0-9._%+-]+@gmail\.com$/i.test(email)
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
// FIREBASE ERROR MESSAGE
// =========================================================

function getResetErrorMessage(error) {

  switch (error?.code) {

    case "auth/invalid-email":

      return {
        message: "Gmail Address সঠিক নয়।",
        type: "error"
      };

    case "auth/too-many-requests":

      return {
        message:
          "অনেকবার Reset Link চাওয়া হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।",
        type: "warning"
      };

    case "auth/network-request-failed":

      return {
        message:
          "Internet Connection পরীক্ষা করে আবার চেষ্টা করুন।",
        type: "error"
      };

    case "auth/user-disabled":

      return {
        message:
          "এই Account বর্তমানে ব্যবহার করা যাচ্ছে না।",
        type: "error"
      };

    case "auth/operation-not-allowed":

      return {
        message:
          "Firebase-এ Password Reset সুবিধা চালু নেই।",
        type: "error"
      };

    default:

      return {
        message:
          getAuthErrorMessage(error),
        type: "error"
      };
  }
}


// =========================================================
// PASSWORD RESET
// =========================================================

async function handlePasswordReset() {

  if (!form || !emailInput || !resetButton) {
    return;
  }

  if (resetButton.disabled) {
    return;
  }

  const email =
    normalizeEmail(emailInput.value);

  const validation =
    validateEmail(email);

  if (!validation.valid) {

    showStatus(
      validation.message,
      "error"
    );

    emailInput.focus();

    return;
  }

  setLoading(true);

  showStatus(
    "Password Reset Link পাঠানোর অনুরোধ করা হচ্ছে...",
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
      "যদি এই Gmail দিয়ে AYNA BOOK Account থাকে, তাহলে Password Reset Link পাঠানো হবে। Gmail Inbox এবং Spam/Junk folder পরীক্ষা করুন।",
      "success"
    );

    emailInput.value = "";

  } catch (error) {

    console.error(
      "AYNA BOOK Password Reset Error:",
      error
    );

    const result =
      getResetErrorMessage(error);

    showStatus(
      result.message,
      result.type
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

} else {

  console.error(
    "AYNA BOOK: forgotPasswordForm not found."
  );
}


// =========================================================
// INITIAL MESSAGE
// =========================================================

showStatus(
  "আপনার AYNA BOOK Account-এর Gmail Address দিন।",
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
