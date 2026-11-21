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
  getCurrentUser,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH
} from "./auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form =
  document.getElementById("registrationForm");

const accountTypeInput =
  document.getElementById("accountType");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const countryInput =
  document.getElementById("country");

const profilePhotoInput =
  document.getElementById("profilePhoto");

const photoPreview =
  document.getElementById("photoPreview");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const termsInput =
  document.getElementById("terms");

const registerButton =
  document.getElementById("registerButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// CONSTANTS
// =========================================================

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_COUNTRY_LENGTH = 100;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

let isSubmitting = false;
let currentPreviewUrl = null;


// =========================================================
// PHOTO PREVIEW
// =========================================================

function clearPhotoPreview() {

  if (currentPreviewUrl) {

    URL.revokeObjectURL(
      currentPreviewUrl
    );

    currentPreviewUrl = null;
  }

  if (photoPreview) {

    photoPreview.removeAttribute(
      "src"
    );

    photoPreview.style.display =
      "none";
  }
}


function validatePhoto(file) {

  if (!file) {

    return {
      valid: true
    };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {

    return {
      valid: false,
      message:
        "ছবির ধরন JPG, PNG অথবা WebP হতে হবে।"
    };
  }

  if (file.size > MAX_PHOTO_SIZE) {

    return {
      valid: false,
      message:
        "প্রোফাইল ছবির সর্বোচ্চ সাইজ ৫ MB হতে পারবে।"
    };
  }

  return {
    valid: true
  };
}


function handlePhotoPreview() {

  clearPhotoPreview();

  const file =
    profilePhotoInput?.files?.[0];

  if (!file) {
    return;
  }

  const result =
    validatePhoto(file);

  if (!result.valid) {

    showStatus(
      result.message,
      "error"
    );

    profilePhotoInput.value =
      "";

    return;
  }

  currentPreviewUrl =
    URL.createObjectURL(file);

  if (photoPreview) {

    photoPreview.src =
      currentPreviewUrl;

    photoPreview.style.display =
      "block";
  }
}


// =========================================================
// INPUT HELPERS
// =========================================================

function normalizeText(value) {

  return String(
    value || ""
  ).trim();
}


function normalizeEmail(value) {

  return normalizeText(
    value
  ).toLowerCase();
}


function normalizePhone(value) {

  return normalizeText(
    value
  )
    .replace(/\s+/g, "")
    .replace(/[()-]/g, "");
}


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(
  message,
  type = "info"
) {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent =
    message;

  statusMessage.className =
    "status show";

  statusMessage.classList.add(
    type
  );
}


// =========================================================
// BUTTON STATE
// =========================================================

function setLoading(
  isLoading
) {

  if (!registerButton) {
    return;
  }

  registerButton.disabled =
    isLoading;

  if (isLoading) {

    if (
      !registerButton.dataset.originalText
    ) {

      registerButton.dataset.originalText =
        registerButton.textContent;
    }

    registerButton.textContent =
      "অ্যাকাউন্ট তৈরি হচ্ছে...";

  } else {

    registerButton.textContent =
      registerButton.dataset.originalText ||
      "Create AYNA Account";
  }
}


// =========================================================
// PASSWORD STRENGTH
// =========================================================

function getPasswordStrength(
  password
) {

  const value =
    String(password || "");

  if (!value) {
    return "none";
  }

  let score = 0;

  if (value.length >= 8) {
    score++;
  }

  if (value.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(value)) {
    score++;
  }

  if (/[A-Z]/.test(value)) {
    score++;
  }

  if (/[0-9]/.test(value)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(value)) {
    score++;
  }

  if (score <= 2) {
    return "weak";
  }

  if (score <= 4) {
    return "medium";
  }

  return "strong";
}


function updatePasswordStrength() {

  const strengthElement =
    document.getElementById(
      "passwordStrength"
    );

  const strengthText =
    document.getElementById(
      "passwordStrengthText"
    );

  if (
    !strengthElement &&
    !strengthText
  ) {
    return;
  }

  const strength =
    getPasswordStrength(
      passwordInput?.value
    );

  if (strengthElement) {

    strengthElement.className =
      "password-strength";

    if (strength !== "none") {

      strengthElement.classList.add(
        strength
      );
    }
  }

  if (strengthText) {

    const messages = {

      none: "",

      weak:
        "Password Strength: Weak",

      medium:
        "Password Strength: Medium",

      strong:
        "Password Strength: Strong"
    };

    strengthText.textContent =
      messages[strength];
  }
}


// =========================================================
// PASSWORD MATCH
// =========================================================

function checkPasswordMatch() {

  if (
    !passwordInput ||
    !confirmPasswordInput
  ) {
    return;
  }

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmPasswordInput.value;

  const matchMessage =
    document.getElementById(
      "passwordMatchMessage"
    );

  if (!confirmPassword) {

    if (matchMessage) {
      matchMessage.textContent =
        "";
    }

    confirmPasswordInput.setCustomValidity(
      ""
    );

    return;
  }

  if (
    password !==
    confirmPassword
  ) {

    confirmPasswordInput.setCustomValidity(
      "Password এবং Confirm Password একই হতে হবে।"
    );

    if (matchMessage) {

      matchMessage.textContent =
        "Password মিলছে না।";
    }

  } else {

    confirmPasswordInput.setCustomValidity(
      ""
    );

    if (matchMessage) {

      matchMessage.textContent =
        "✓ Password মিলেছে।";
    }
  }
}


// =========================================================
// VALIDATION
// =========================================================

function validateForm() {

  const accountType =
    normalizeText(
      accountTypeInput?.value
    );

  const fullName =
    normalizeText(
      fullNameInput?.value
    );

  const email =
    normalizeEmail(
      emailInput?.value
    );

  const phone =
    normalizePhone(
      phoneInput?.value
    );

  const country =
    normalizeText(
      countryInput?.value
    );

  const password =
    String(
      passwordInput?.value || ""
    );

  const confirmPassword =
    String(
      confirmPasswordInput?.value || ""
    );

  const termsAccepted =
    Boolean(
      termsInput?.checked
    );


  // -------------------------------------------------------
  // ACCOUNT TYPE
  // -------------------------------------------------------

  if (
    accountType !==
    "personal"
  ) {

    return {
      valid: false,
      message:
        "বর্তমানে শুধু Personal Account অনুমোদিত।"
    };
  }


  // -------------------------------------------------------
  // NAME
  // -------------------------------------------------------

  if (
    fullName.length < 2 ||
    fullName.length >
    MAX_NAME_LENGTH
  ) {

    return {
      valid: false,
      message:
        "পূর্ণ নাম ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।"
    };
  }


  // -------------------------------------------------------
  // GMAIL
  // -------------------------------------------------------

  if (
    !/^[a-z0-9._%+-]+@gmail\.com$/i.test(
      email
    )
  ) {

    return {
      valid: false,
      message:
        "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
    };
  }


  // -------------------------------------------------------
  // PHONE
  // -------------------------------------------------------

  if (
    !phone ||
    phone.length >
    MAX_PHONE_LENGTH
  ) {

    return {
      valid: false,
      message:
        "সঠিক মোবাইল নম্বর লিখুন।"
    };
  }


  // -------------------------------------------------------
  // COUNTRY
  // -------------------------------------------------------

  if (
    !country ||
    country.length >
    MAX_COUNTRY_LENGTH
  ) {

    return {
      valid: false,
      message:
        "সঠিক Country নাম লিখুন।"
    };
  }


  // -------------------------------------------------------
  // PASSWORD
  // -------------------------------------------------------

  if (
    password.length <
    MIN_PASSWORD_LENGTH
  ) {

    return {
      valid: false,
      message:
        `Password কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`
    };
  }


  if (
    password.length >
    MAX_PASSWORD_LENGTH
  ) {

    return {
      valid: false,
      message:
        `Password সর্বোচ্চ ${MAX_PASSWORD_LENGTH} অক্ষরের হতে পারবে।`
    };
  }


  // -------------------------------------------------------
  // CONFIRM PASSWORD
  // -------------------------------------------------------

  if (
    password !==
    confirmPassword
  ) {

    return {
      valid: false,
      message:
        "Password এবং Confirm Password একই নয়।"
    };
  }


  // -------------------------------------------------------
  // TERMS
  // -------------------------------------------------------

  if (!termsAccepted) {

    return {
      valid: false,
      message:
        "Terms & Conditions এবং Privacy Policy গ্রহণ করতে হবে।"
    };
  }


  // -------------------------------------------------------
  // PHOTO
  // -------------------------------------------------------

  const photo =
    profilePhotoInput?.files?.[0];

  const photoResult =
    validatePhoto(photo);

  if (!photoResult.valid) {

    return photoResult;
  }


  // -------------------------------------------------------
  // VALID
  // -------------------------------------------------------

  return {

    valid: true,

    data: {
      accountType,
      fullName,
      email,
      phone,
      country,
      password
    }
  };
}


// =========================================================
// CREATE FIRESTORE USER PROFILE
// =========================================================

async function createUserProfile(
  user,
  data
) {

  if (!user?.uid) {

    throw new Error(
      "AUTH_USER_MISSING"
    );
  }

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );

  const profileData = {

    uid:
      user.uid,

    fullName:
      data.fullName,

    name:
      data.fullName,

    email:
      data.email,

    phone:
      data.phone,

    country:
      data.country,

    accountType:
      data.accountType,

    plan:
      "free",

    bio:
      "",

    photoURL:
      "",

    emailVerified:
      false,

    accountStatus:
      "pending_verification",

    paymentStatus:
      "none",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp()
  };

  await setDoc(
    userRef,
    profileData
  );

  return userRef;
}


// =========================================================
// CLEANUP AFTER SUCCESS
// =========================================================

function clearSensitiveFields() {

  if (passwordInput) {

    passwordInput.value =
      "";
  }

  if (confirmPasswordInput) {

    confirmPasswordInput.value =
      "";
  }

  if (profilePhotoInput) {

    profilePhotoInput.value =
      "";
  }

  clearPhotoPreview();

  updatePasswordStrength();

  checkPasswordMatch();
}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getSignupErrorMessage(
  error
) {

  switch (error?.code) {

    case "auth/email-already-in-use":

      return "এই Gmail দিয়ে ইতিমধ্যে Account আছে। Login করুন।";


    case "auth/invalid-email":

      return "Gmail Address সঠিক নয়।";


    case "auth/weak-password":

      return "Password ৮–৫০ অক্ষরের মধ্যে দিন।";


    case "auth/too-many-requests":

      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।";


    case "auth/network-request-failed":

      return "Internet Connection পরীক্ষা করুন।";


    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":

      return "Firebase API Key সঠিক নয়। Firebase Configuration পরীক্ষা করুন।";


    case "permission-denied":
    case "firestore/permission-denied":

      return "Firebase Account তৈরি হয়েছে, কিন্তু Firestore Profile সংরক্ষণ হয়নি। Firestore Rules পরীক্ষা করুন।";


    default:

      return getAuthErrorMessage(
        error
      );
  }
}


// =========================================================
// SIGNUP PROCESS
// =========================================================

async function handleSignup() {

  if (isSubmitting) {
    return;
  }

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

  const existingUser =
    getCurrentUser();

  if (existingUser) {

    showStatus(
      "একটি Firebase Account বর্তমানে লগইন করা আছে। আগে Logout করুন।",
      "warning"
    );

    return;
  }

  isSubmitting =
    true;

  setLoading(
    true
  );

  let createdUser =
    null;

  let profileSaved =
    false;


  try {

    // =====================================================
    // STEP 1 — CREATE AUTH ACCOUNT
    // =====================================================

    showStatus(
      "১/৩ — Firebase Account তৈরি হচ্ছে...",
      "info"
    );

    createdUser =
      await createRegistrationAccount({

        fullName:
          data.fullName,

        email:
          data.email,

        password:
          data.password
      });


    if (!createdUser?.uid) {

      throw new Error(
        "AUTH_USER_CREATION_FAILED"
      );
    }


    // =====================================================
    // STEP 2 — SAVE FIRESTORE PROFILE
    // =====================================================

    showStatus(
      "২/৩ — AYNA BOOK Profile সংরক্ষণ হচ্ছে...",
      "info"
    );

    await createUserProfile(
      createdUser,
      data
    );

    profileSaved =
      true;


    // =====================================================
    // STEP 3 — SEND VERIFICATION EMAIL
    // =====================================================

    showStatus(
      "৩/৩ — Gmail Verification Email পাঠানো হচ্ছে...",
      "info"
    );

    await sendVerificationEmail(
      createdUser
    );


    // =====================================================
    // SUCCESS
    // =====================================================

    clearSensitiveFields();

    showStatus(
      "আপনার AYNA BOOK Account তৈরি হয়েছে। Gmail Inbox থেকে Verification Link খুলুন। এখন Verification পেজে নেওয়া হচ্ছে...",
      "success"
    );


    setTimeout(
      () => {

        window.location.replace(
          "./verify-email.html"
        );

      },
      2000
    );


  } catch (error) {

    console.error(
      "AYNA BOOK Signup Error:",
      error
    );


    if (
      createdUser &&
      !profileSaved
    ) {

      showStatus(
        "Firebase Authentication Account তৈরি হয়েছে, কিন্তু Firestore Profile সংরক্ষণ হয়নি। একই Gmail দিয়ে আবার Signup করবেন না। Firestore Rules পরীক্ষা করুন।",
        "error"
      );


    } else if (
      createdUser &&
      profileSaved
    ) {

      showStatus(
        "Account এবং Profile তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি। Verification পেজে চেষ্টা করুন।",
        "warning"
      );


      setTimeout(
        () => {

          window.location.replace(
            "./verify-email.html"
          );

        },
        3000
      );


    } else {

      showStatus(
        getSignupErrorMessage(
          error
        ),
        "error"
      );
    }


  } finally {

    isSubmitting =
      false;

    setLoading(
      false
    );
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

} else {

  console.error(
    "AYNA BOOK: registrationForm not found."
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
// PASSWORD EVENTS
// =========================================================

if (passwordInput) {

  passwordInput.addEventListener(
    "input",
    () => {

      updatePasswordStrength();

      checkPasswordMatch();
    }
  );
}


if (confirmPasswordInput) {

  confirmPasswordInput.addEventListener(
    "input",
    checkPasswordMatch
  );
}


// =========================================================
// INITIAL MESSAGE
// =========================================================

showStatus(
  `Password ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} অক্ষর হতে পারে। আপনার তথ্য পূরণ করে AYNA BOOK Account তৈরি করুন।`,
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
  "Password Length:",
  `${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}`
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