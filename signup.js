// =========================================================
// AYNA BOOK
// SIGNUP CONTROLLER
// File: signup.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  createRegistrationAccount,
  sendVerificationEmail,
  getAuthErrorMessage,
  getCurrentUser
} from "./auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form = document.getElementById("registrationForm");

const accountTypeInput = document.getElementById("accountType");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const countryInput = document.getElementById("country");

const profilePhotoInput = document.getElementById("profilePhoto");
const photoPreview = document.getElementById("photoPreview");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const termsInput = document.getElementById("terms");

const registerButton = document.getElementById("registerButton");
const statusMessage = document.getElementById("statusMessage");


// =========================================================
// CONSTANTS
// =========================================================

const MIN_PASSWORD_LENGTH = 11;
const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_COUNTRY_LENGTH = 100;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;


// =========================================================
// PHOTO PREVIEW
// =========================================================

let currentPreviewUrl = null;


function clearPhotoPreview() {
  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = null;
  }

  if (photoPreview) {
    photoPreview.removeAttribute("src");
    photoPreview.style.display = "none";
  }
}


function handlePhotoPreview() {
  clearPhotoPreview();

  const file = profilePhotoInput?.files?.[0];

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    showStatus(
      "ছবির ধরন JPG, PNG অথবা WebP হতে হবে।",
      "error"
    );

    profilePhotoInput.value = "";
    return;
  }

  if (file.size > MAX_PHOTO_SIZE) {
    showStatus(
      "প্রোফাইল ছবির সর্বোচ্চ সাইজ ৫ MB হতে পারবে।",
      "error"
    );

    profilePhotoInput.value = "";
    return;
  }

  currentPreviewUrl = URL.createObjectURL(file);

  if (photoPreview) {
    photoPreview.src = currentPreviewUrl;
    photoPreview.style.display = "block";
  }
}


// =========================================================
// INPUT HELPERS
// =========================================================

function normalizeText(value) {
  return String(value || "").trim();
}


function normalizeEmail(value) {
  return normalizeText(value).toLowerCase();
}


function normalizePhone(value) {
  return normalizeText(value)
    .replace(/\s+/g, "")
    .replace(/[()-]/g, "");
}


// =========================================================
// STATUS MESSAGE
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
  if (!registerButton) {
    return;
  }

  registerButton.disabled = isLoading;

  if (isLoading) {
    registerButton.dataset.originalText =
      registerButton.textContent;

    registerButton.textContent =
      "অ্যাকাউন্ট তৈরি হচ্ছে...";
  } else {
    registerButton.textContent =
      registerButton.dataset.originalText ||
      "Create AYNA Account";
  }
}


// =========================================================
// VALIDATION
// =========================================================

function validateForm() {

  const accountType =
    normalizeText(accountTypeInput?.value);

  const fullName =
    normalizeText(fullNameInput?.value);

  const email =
    normalizeEmail(emailInput?.value);

  const phone =
    normalizePhone(phoneInput?.value);

  const country =
    normalizeText(countryInput?.value);

  const password =
    String(passwordInput?.value || "");

  const confirmPassword =
    String(confirmPasswordInput?.value || "");

  const termsAccepted =
    Boolean(termsInput?.checked);


  // -------------------------------------------------------
  // Account Type
  // -------------------------------------------------------

  if (!accountType) {
    return {
      valid: false,
      message: "অ্যাকাউন্ট ক্যাটাগরি নির্বাচন করুন।"
    };
  }


  if (accountType !== "personal") {
    return {
      valid: false,
      message: "বর্তমানে শুধু Personal Account অনুমোদিত।"
    };
  }


  // -------------------------------------------------------
  // Full Name
  // -------------------------------------------------------

  if (!fullName) {
    return {
      valid: false,
      message: "আপনার পূর্ণ নাম লিখুন।"
    };
  }


  if (fullName.length < 2) {
    return {
      valid: false,
      message: "পূর্ণ নাম কমপক্ষে ২ অক্ষরের হতে হবে।"
    };
  }


  if (fullName.length > MAX_NAME_LENGTH) {
    return {
      valid: false,
      message: "পূর্ণ নাম ১০০ অক্ষরের বেশি হতে পারবে না।"
    };
  }


  // -------------------------------------------------------
  // Email
  // -------------------------------------------------------

  if (!email) {
    return {
      valid: false,
      message: "Gmail Address লিখুন।"
    };
  }


  if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
    return {
      valid: false,
      message: "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
    };
  }


  // -------------------------------------------------------
  // Phone
  // -------------------------------------------------------

  if (!phone) {
    return {
      valid: false,
      message: "মোবাইল নম্বর লিখুন।"
    };
  }


  if (phone.length > MAX_PHONE_LENGTH) {
    return {
      valid: false,
      message: "মোবাইল নম্বর সঠিকভাবে লিখুন।"
    };
  }


  // -------------------------------------------------------
  // Country
  // -------------------------------------------------------

  if (country.length > MAX_COUNTRY_LENGTH) {
    return {
      valid: false,
      message: "Country নাম ১০০ অক্ষরের বেশি হতে পারবে না।"
    };
  }


  // -------------------------------------------------------
  // Password
  // -------------------------------------------------------

  if (!password) {
    return {
      valid: false,
      message: "Password লিখুন।"
    };
  }


  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message:
        `Password কমপক্ষে ${MIN_PASSWORD_LENGTH} characters হতে হবে।`
    };
  }


  // -------------------------------------------------------
  // Confirm Password
  // -------------------------------------------------------

  if (!confirmPassword) {
    return {
      valid: false,
      message: "Confirm Password লিখুন।"
    };
  }


  if (password !== confirmPassword) {
    return {
      valid: false,
      message: "Password এবং Confirm Password একই নয়।"
    };
  }


  // -------------------------------------------------------
  // Terms
  // -------------------------------------------------------

  if (!termsAccepted) {
    return {
      valid: false,
      message: "Terms & Conditions গ্রহণ করতে হবে।"
    };
  }


  return {
    valid: true,
    data: {
      accountType,
      fullName,
      email,
      phone,
      country,
      password,
      confirmPassword
    }
  };
}


// =========================================================
// TIMEOUT HELPER
// =========================================================

function withTimeout(promise, milliseconds = 20000) {

  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {

    timeoutId = setTimeout(() => {

      reject(
        new Error(
          "REQUEST_TIMEOUT"
        )
      );

    }, milliseconds);

  });


  return Promise.race([
    promise.finally(() => {
      clearTimeout(timeoutId);
    }),
    timeoutPromise
  ]);
}


// =========================================================
// FIRESTORE USER DOCUMENT
// =========================================================

async function createUserProfile(user, data) {

  if (!user?.uid) {
    throw new Error("AUTH_USER_MISSING");
  }


  const userRef =
    doc(db, "users", user.uid);


  await withTimeout(
    setDoc(
      userRef,
      {
        uid: user.uid,

        fullName: data.fullName,

        // Compatibility field
        name: data.fullName,

        email: data.email,

        phone: data.phone,

        country: data.country,

        accountType: data.accountType,

        // Existing AYNA BOOK compatibility
        plan: "free",

        bio: "",

        photoURL: "",

        emailVerified:
          user.emailVerified === true,

        accountStatus: "active",

        paymentStatus: "none",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      },
      {
        merge: false
      }
    ),
    20000
  );
}


// =========================================================
// SEND VERIFICATION
// =========================================================

async function sendVerification(user) {

  if (!user) {
    throw new Error("AUTH_USER_MISSING");
  }


  await withTimeout(
    sendVerificationEmail(user),
    20000
  );
}


// =========================================================
// SIGNUP PROCESS
// =========================================================

async function handleSignup() {

  const validation =
    validateForm();


  if (!validation.valid) {

    showStatus(
      validation.message,
      "error"
    );

    return;
  }


  const data =
    validation.data;


  // -------------------------------------------------------
  // Check existing session
  // -------------------------------------------------------

  const existingUser =
    getCurrentUser();


  if (existingUser) {

    showStatus(
      "একটি Firebase account বর্তমানে লগইন করা আছে। আগে Logout করুন।",
      "warning"
    );

    return;
  }


  setLoading(true);

  showStatus(
    "অ্যাকাউন্ট তৈরি করা হচ্ছে...",
    "info"
  );


  let createdUser = null;


  try {

    // =====================================================
    // STEP 1 — CREATE FIREBASE AUTH ACCOUNT
    // =====================================================

    showStatus(
      "১/৪ — Firebase Account তৈরি হচ্ছে...",
      "info"
    );


    createdUser =
      await withTimeout(
        createRegistrationAccount(
          data.email,
          data.password,
          data.fullName
        ),
        20000
      );


    if (!createdUser?.uid) {
      throw new Error(
        "AUTH_USER_CREATION_FAILED"
      );
    }


    // =====================================================
    // STEP 2 — CREATE FIRESTORE PROFILE
    // =====================================================

    showStatus(
      "২/৪ — AYNA BOOK Profile সংরক্ষণ হচ্ছে...",
      "info"
    );


    await createUserProfile(
      createdUser,
      data
    );


    // =====================================================
    // STEP 3 — SEND GMAIL VERIFICATION
    // =====================================================

    showStatus(
      "৩/৪ — Gmail Verification পাঠানো হচ্ছে...",
      "info"
    );


    await sendVerification(
      createdUser
    );


    // =====================================================
    // STEP 4 — SIGN OUT
    // =====================================================

    showStatus(
      "৪/৪ — Account নিরাপদভাবে প্রস্তুত করা হচ্ছে...",
      "info"
    );


    try {

      await auth.signOut();

    } catch (signOutError) {

      console.warn(
        "Automatic sign-out failed:",
        signOutError
      );

    }


    // =====================================================
    // SUCCESS
    // =====================================================

    showStatus(
      "✅ AYNA BOOK Account সফলভাবে তৈরি হয়েছে। Gmail খুলে Verification Link-এ ক্লিক করুন। তারপর Login করুন।",
      "success"
    );


    // Clear password fields
    if (passwordInput) {
      passwordInput.value = "";
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.value = "";
    }


    // Keep useful form data, but remove photo
    if (profilePhotoInput) {
      profilePhotoInput.value = "";
    }

    clearPhotoPreview();


    // -----------------------------------------------------
    // Redirect after short delay
    // -----------------------------------------------------

    setTimeout(() => {

      window.location.href =
        "./login.html";

    }, 5000);


  } catch (error) {

    console.error(
      "AYNA BOOK Signup Error:",
      error
    );


    // =====================================================
    // AUTH ACCOUNT MAY ALREADY HAVE BEEN CREATED
    // =====================================================

    if (
      error?.message === "REQUEST_TIMEOUT" &&
      createdUser?.uid
    ) {

      showStatus(
        "⚠️ সময়সীমা শেষ হয়েছে। Account তৈরি হয়ে থাকতে পারে। আবার Signup করবেন না। কয়েক মুহূর্ত পর Login/Email Verification পরীক্ষা করুন।",
        "warning"
      );

      return;
    }


    // =====================================================
    // FIRESTORE PERMISSION ERROR
    // =====================================================

    if (
      error?.code === "permission-denied"
    ) {

      showStatus(
        "❌ Firebase Authentication হয়েছে, কিন্তু Firestore Profile সংরক্ষণ করতে permission denied হয়েছে। Firestore Rules এবং Project নির্বাচন পরীক্ষা করতে হবে।",
        "error"
      );

      return;
    }


    // =====================================================
    // EMAIL ALREADY EXISTS
    // =====================================================

    if (
      error?.code === "auth/email-already-in-use"
    ) {

      showStatus(
        "এই Gmail দিয়ে ইতিমধ্যে AYNA BOOK Account আছে। নতুন Account না বানিয়ে Login করুন।",
        "error"
      );

      return;
    }


    // =====================================================
    // WEAK PASSWORD
    // =====================================================

    if (
      error?.code === "auth/weak-password"
    ) {

      showStatus(
        "Password Firebase-এর নিয়ম অনুযায়ী যথেষ্ট শক্তিশালী নয়।",
        "error"
      );

      return;
    }


    // =====================================================
    // INVALID EMAIL
    // =====================================================

    if (
      error?.code === "auth/invalid-email"
    ) {

      showStatus(
        "Gmail Address সঠিক নয়।",
        "error"
      );

      return;
    }


    // =====================================================
    // NETWORK ERROR
    // =====================================================

    if (
      error?.code === "auth/network-request-failed"
    ) {

      showStatus(
        "Internet Connection পরীক্ষা করুন এবং আবার চেষ্টা করুন।",
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

      await handleSignup();

    }
  );

}


// =========================================================
// PHOTO CHANGE
// =========================================================

if (profilePhotoInput) {

  profilePhotoInput.addEventListener(
    "change",
    handlePhotoPreview
  );

}


// =========================================================
// LIVE PASSWORD CHECK
// =========================================================

if (
  passwordInput &&
  confirmPasswordInput
) {

  confirmPasswordInput.addEventListener(
    "input",
    () => {

      const password =
        passwordInput.value;

      const confirmPassword =
        confirmPasswordInput.value;


      if (
        confirmPassword &&
        password !== confirmPassword
      ) {

        confirmPasswordInput.setCustomValidity(
          "Password এবং Confirm Password একই হতে হবে।"
        );

      } else {

        confirmPasswordInput.setCustomValidity(
          ""
        );

      }

    }
  );

}


// =========================================================
// INITIAL MESSAGE
// =========================================================

showStatus(
  "আপনার তথ্য পূরণ করে AYNA BOOK Account তৈরি করুন।",
  "info"
);


// =========================================================
// DEBUG
// =========================================================

console.log(
  "========================================"
);

console.log(
  "AYNA BOOK - Signup Controller"
);

console.log(
  "signup.js loaded successfully."
);

console.log(
  "Firebase Auth:",
  !!auth
);

console.log(
  "Firestore:",
  !!db
);

console.log(
  "========================================"
);