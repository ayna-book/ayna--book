// =========================================================
// AYNA BOOK
// SIGNUP CONTROLLER
// File: signup.js
// =========================================================

import {
  registerUser,
  getAuthErrorMessage
} from "./auth.js";


// =========================================================
// DOM
// =========================================================

const form = document.getElementById("signupForm");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const passwordInput =
  document.getElementById("password");

const photoInput =
  document.getElementById("photo");

const photoPreview =
  document.getElementById("photoPreview");

const photoPreviewBox =
  document.getElementById("photoPreviewBox");

const photoStatus =
  document.getElementById("photoStatus");

const status =
  document.getElementById("status");

const signupButton =
  document.getElementById("signupButton");


// =========================================================
// CONSTANTS
// =========================================================

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);


// =========================================================
// STATE
// =========================================================

let selectedPhoto = null;
let previewUrl = null;


// =========================================================
// STATUS
// =========================================================

function setStatus(message, type = "") {

  if (!status) return;

  status.textContent = message;

  status.className =
    `status ${type}`.trim();

}


function setPhotoStatus(
  message,
  success = false
) {

  if (!photoStatus) return;

  photoStatus.textContent = message;

  photoStatus.className =
    success
      ? "status success"
      : "status error";

}


// =========================================================
// PHOTO PREVIEW CLEANUP
// =========================================================

function clearPhotoPreview() {

  if (previewUrl) {

    URL.revokeObjectURL(
      previewUrl
    );

    previewUrl = null;
  }

  if (photoPreview) {

    photoPreview.removeAttribute(
      "src"
    );
  }

  if (photoPreviewBox) {

    photoPreviewBox.style.display =
      "none";
  }

}


// =========================================================
// PHOTO VALIDATION
// =========================================================

function validatePhoto(file) {

  if (!file) {

    return "Profile Photo নির্বাচন করুন।";
  }

  if (
    !ALLOWED_PHOTO_TYPES.has(
      file.type
    )
  ) {

    return (
      "শুধু JPG, PNG অথবা WebP " +
      "ছবি ব্যবহার করুন।"
    );
  }

  if (
    file.size > MAX_PHOTO_SIZE
  ) {

    return (
      "ছবির আকার সর্বোচ্চ 5 MB " +
      "হতে হবে।"
    );
  }

  return "";
}


// =========================================================
// PHOTO SELECT
// =========================================================

photoInput?.addEventListener(
  "change",
  () => {

    selectedPhoto = null;

    clearPhotoPreview();

    const file =
      photoInput.files?.[0];

    const error =
      validatePhoto(file);

    if (error) {

      photoInput.value = "";

      setPhotoStatus(error);

      return;
    }

    selectedPhoto = file;

    previewUrl =
      URL.createObjectURL(file);

    if (photoPreview) {

      photoPreview.src =
        previewUrl;
    }

    if (photoPreviewBox) {

      photoPreviewBox.style.display =
        "block";
    }

    setPhotoStatus(
      "Profile photo প্রস্তুত।",
      true
    );

  }
);


// =========================================================
// SUBMIT
// =========================================================

form?.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    setStatus("");

    // ---------------------------------------------
    // Prevent duplicate submit
    // ---------------------------------------------

    if (
      signupButton?.disabled
    ) {

      return;
    }


    // ---------------------------------------------
    // Read values
    // ---------------------------------------------

    const fullName =
      fullNameInput?.value.trim() || "";

    const email =
      emailInput?.value.trim() || "";

    const phone =
      phoneInput?.value.trim() || "";

    const password =
      passwordInput?.value || "";


    // ---------------------------------------------
    // Basic photo check
    // ---------------------------------------------

    if (!selectedPhoto) {

      setPhotoStatus(
        "Profile Photo বাধ্যতামূলক।"
      );

      photoInput?.focus();

      return;
    }


    const photoError =
      validatePhoto(selectedPhoto);

    if (photoError) {

      setPhotoStatus(
        photoError
      );

      return;
    }


    // ---------------------------------------------
    // Basic text validation
    // ---------------------------------------------

    if (!fullName) {

      setStatus(
        "আপনার Full Name দিন।",
        "error"
      );

      fullNameInput?.focus();

      return;
    }


    if (!email) {

      setStatus(
        "আপনার Gmail দিন।",
        "error"
      );

      emailInput?.focus();

      return;
    }


    if (!phone) {

      setStatus(
        "আপনার Phone Number দিন।",
        "error"
      );

      phoneInput?.focus();

      return;
    }


    if (!password) {

      setStatus(
        "আপনার Password দিন।",
        "error"
      );

      passwordInput?.focus();

      return;
    }


    // ---------------------------------------------
    // Loading state
    // ---------------------------------------------

    if (signupButton) {

      signupButton.disabled = true;

      signupButton.textContent =
        "Creating Account...";
    }


    setStatus(
      "Account তৈরি হচ্ছে...",
      "success"
    );


    try {

      // ===========================================
      // FIREBASE AUTH + STORAGE + FIRESTORE
      // ===========================================

      const result =
        await registerUser({
          fullName,
          email,
          phone,
          password,
          photo: selectedPhoto
        });


      // ===========================================
      // SUCCESS
      // ===========================================

      console.log(
        "AYNA BOOK registration successful:",
        result
      );


      setStatus(
        "Account তৈরি হয়েছে। Gmail verification করুন।",
        "success"
      );


      setPhotoStatus(
        "Profile photo সফলভাবে সংরক্ষিত হয়েছে।",
        true
      );


      /*
       * Firebase verification email
       * ইতিমধ্যে auth.js-এর registerUser()
       * থেকে পাঠানো হয়েছে।
       *
       * কিছুক্ষণ অপেক্ষা করে Gmail Inbox/
       * Spam folder দেখুন।
       */


      setTimeout(() => {

        window.location.href =
          "./verify-email.html";

      }, 1800);


    } catch (error) {

      console.error(
        "AYNA BOOK signup error:",
        error
      );


      const message =
        getAuthErrorMessage(error);


      setStatus(
        message ||
        "Account তৈরি করা যায়নি। আবার চেষ্টা করুন।",
        "error"
      );


      if (signupButton) {

        signupButton.disabled = false;

        signupButton.textContent =
          "Create Account";
      }

    }

  }
);


// =========================================================
// CLEANUP
// =========================================================

window.addEventListener(
  "beforeunload",
  () => {

    if (previewUrl) {

      URL.revokeObjectURL(
        previewUrl
      );

      previewUrl = null;
    }

  }
);