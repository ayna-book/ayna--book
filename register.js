// ============================================================
// AYNA BOOK
// USER REGISTRATION
// File: register.js
// Firebase SDK: 13.4.0
// ============================================================

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  auth,
  database,
  authReady
} from "./firebase-init.js";


// ============================================================
// SETTINGS
// ============================================================

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// RTDB-তে Base64 profile photo রাখার জন্য
// compressed image সাধারণত এই সীমার নিচে থাকবে।
const MAX_PHOTO_BASE64_LENGTH = 650000;

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;


// ============================================================
// ELEMENTS
// ============================================================

const registerForm = document.getElementById("registerForm");

const profilePhotoInput =
  document.getElementById("profilePhoto");

const previewImage =
  document.getElementById("previewImage");

const photoPlaceholder =
  document.getElementById("photoPlaceholder");

const regFullName =
  document.getElementById("regFullName");

const regEmail =
  document.getElementById("regEmail");

const regCountry =
  document.getElementById("regCountry");

const regPhone =
  document.getElementById("regPhone");

const regPassword =
  document.getElementById("regPassword");

const regConfirmPassword =
  document.getElementById("regConfirmPassword");

const termsCheckbox =
  document.getElementById("termsCheckbox");

const registerButton =
  document.getElementById("registerButton");

const registerMessage =
  document.getElementById("registerMessage");

const loadingOverlay =
  document.getElementById("loadingOverlay");

const toggleRegPassword =
  document.getElementById("toggleRegPassword");

const toggleRegConfirmPassword =
  document.getElementById("toggleRegConfirmPassword");


// ============================================================
// STATE
// ============================================================

let selectedPhotoBase64 = "";
let selectedPhotoMimeType = "";

let registerBusy = false;


// ============================================================
// MESSAGE
// ============================================================

function showMessage(text, type = "info") {

  if (!registerMessage) return;

  registerMessage.textContent = text;

  if (type === "success") {

    registerMessage.style.color = "#00ff99";

  } else if (type === "error") {

    registerMessage.style.color = "#ff6b6b";

  } else if (type === "warning") {

    registerMessage.style.color = "#ffd700";

  } else {

    registerMessage.style.color = "#ffffff";
  }
}


// ============================================================
// LOADING
// ============================================================

function setLoading(isLoading) {

  if (registerButton) {

    registerButton.disabled = isLoading;

    registerButton.textContent = isLoading
      ? "⏳ Account তৈরি হচ্ছে..."
      : "🚀 Create AYNA BOOK Account";
  }

  if (loadingOverlay) {

    loadingOverlay.style.display =
      isLoading ? "flex" : "none";

    loadingOverlay.setAttribute(
      "aria-hidden",
      isLoading ? "false" : "true"
    );
  }
}


// ============================================================
// PASSWORD TOGGLE
// ============================================================

function setupPasswordToggle(button, input) {

  if (!button || !input) return;

  button.addEventListener("click", () => {

    const isPassword =
      input.type === "password";

    input.type =
      isPassword ? "text" : "password";

    button.textContent =
      isPassword ? "🙈" : "👁";

    button.setAttribute(
      "aria-label",
      isPassword
        ? "Hide password"
        : "Show password"
    );
  });
}


setupPasswordToggle(
  toggleRegPassword,
  regPassword
);


setupPasswordToggle(
  toggleRegConfirmPassword,
  regConfirmPassword
);


// ============================================================
// PHOTO VALIDATION
// ============================================================

function isAllowedImageType(type) {

  return [
    "image/jpeg",
    "image/png",
    "image/webp"
  ].includes(type);
}


// ============================================================
// READ FILE
// ============================================================

function readFileAsDataURL(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error("PHOTO_READ_FAILED")
      );
    };

    reader.readAsDataURL(file);
  });
}


// ============================================================
// LOAD IMAGE
// ============================================================

function loadImage(dataURL) {

  return new Promise((resolve, reject) => {

    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(
        new Error("PHOTO_INVALID")
      );
    };

    image.src = dataURL;
  });
}


// ============================================================
// COMPRESS PROFILE PHOTO
// ============================================================

async function compressProfilePhoto(file) {

  if (!file) {
    throw new Error("PHOTO_REQUIRED");
  }

  if (!isAllowedImageType(file.type)) {
    throw new Error("PHOTO_TYPE");
  }

  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("PHOTO_TOO_LARGE");
  }

  const originalDataURL =
    await readFileAsDataURL(file);

  const image =
    await loadImage(originalDataURL);


  // ----------------------------------------------------------
  // Square crop
  // ----------------------------------------------------------

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("PHOTO_INVALID");
  }

  const squareSize =
    Math.min(
      sourceWidth,
      sourceHeight
    );


  // Center crop.
  // মাথা সাধারণত কেন্দ্রে রাখার জন্য crop করা হচ্ছে।
  const sourceX =
    Math.floor(
      (sourceWidth - squareSize) / 2
    );

  const sourceY =
    Math.floor(
      (sourceHeight - squareSize) / 2
    );


  // ----------------------------------------------------------
  // Output size
  // ----------------------------------------------------------

  const outputSize = 700;

  const canvas =
    document.createElement("canvas");

  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx =
    canvas.getContext("2d", {
      alpha: false
    });

  if (!ctx) {
    throw new Error("CANVAS_FAILED");
  }


  // ----------------------------------------------------------
  // Background
  // ----------------------------------------------------------

  ctx.fillStyle = "#080d1a";

  ctx.fillRect(
    0,
    0,
    outputSize,
    outputSize
  );


  // ----------------------------------------------------------
  // Draw image
  // ----------------------------------------------------------

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    squareSize,
    squareSize,
    0,
    0,
    outputSize,
    outputSize
  );


  // ----------------------------------------------------------
  // JPEG compression
  // ----------------------------------------------------------

  let quality = 0.82;

  let dataURL =
    canvas.toDataURL(
      "image/jpeg",
      quality
    );


  // Reduce until RTDB-safe size
  while (
    dataURL.length >
      MAX_PHOTO_BASE64_LENGTH &&
    quality > 0.40
  ) {

    quality -= 0.06;

    dataURL =
      canvas.toDataURL(
        "image/jpeg",
        quality
      );
  }


  if (
    dataURL.length >
    MAX_PHOTO_BASE64_LENGTH
  ) {

    throw new Error(
      "PHOTO_COMPRESS_FAILED"
    );
  }


  return {
    dataURL,
    mimeType: "image/jpeg",
    width: outputSize,
    height: outputSize
  };
}


// ============================================================
// PHOTO SELECT
// ============================================================

if (profilePhotoInput) {

  profilePhotoInput.addEventListener(
    "change",
    async () => {

      const file =
        profilePhotoInput.files?.[0];

      if (!file) return;

      showMessage(
        "⏳ Profile Photo প্রস্তুত করা হচ্ছে..."
      );

      try {

        const result =
          await compressProfilePhoto(file);

        selectedPhotoBase64 =
          result.dataURL;

        selectedPhotoMimeType =
          result.mimeType;


        // Preview
        if (previewImage) {

          previewImage.src =
            selectedPhotoBase64;

          previewImage.style.display =
            "block";
        }

        if (photoPlaceholder) {

          photoPlaceholder.style.display =
            "none";
        }

        showMessage(
          "✅ Profile Photo প্রস্তুত হয়েছে।",
          "success"
        );

      } catch (error) {

        console.error(
          "AYNA BOOK photo error:",
          error
        );

        selectedPhotoBase64 = "";
        selectedPhotoMimeType = "";

        profilePhotoInput.value = "";

        if (previewImage) {

          previewImage.src = "";

          previewImage.style.display =
            "none";
        }

        if (photoPlaceholder) {

          photoPlaceholder.style.display =
            "block";
        }

        switch (error.message) {

          case "PHOTO_REQUIRED":
            showMessage(
              "Profile Photo নির্বাচন করুন।",
              "error"
            );
            break;

          case "PHOTO_TYPE":
            showMessage(
              "শুধু JPG, PNG অথবা WebP ছবি ব্যবহার করুন।",
              "error"
            );
            break;

          case "PHOTO_TOO_LARGE":
            showMessage(
              "Profile Photo সর্বোচ্চ 5 MB হতে পারবে।",
              "error"
            );
            break;

          case "PHOTO_COMPRESS_FAILED":
            showMessage(
              "ছবিটি ছোট করা যায়নি। অন্য ছবি ব্যবহার করুন।",
              "error"
            );
            break;

          default:
            showMessage(
              "Profile Photo পড়া যায়নি। অন্য ছবি ব্যবহার করুন।",
              "error"
            );
        }
      }
    }
  );
}


// ============================================================
// NORMALIZE EMAIL
// ============================================================

function normalizeEmail(value) {

  return String(value || "")
    .trim()
    .toLowerCase();
}


// ============================================================
// GMAIL VALIDATION
// ============================================================

function isValidGmail(email) {

  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i
    .test(email);
}


// ============================================================
// PHONE VALIDATION
// ============================================================

function normalizePhone(phone) {

  return String(phone || "")
    .trim()
    .replace(/[()\s-]/g, "");
}


function isValidPhone(phone) {

  const normalized =
    normalizePhone(phone);

  return /^\+?[0-9]{10,15}$/
    .test(normalized);
}


// ============================================================
// PASSWORD VALIDATION
// ============================================================

function validatePassword(password) {

  if (
    password.length <
    MIN_PASSWORD_LENGTH
  ) {

    return "Password কমপক্ষে 8 অক্ষরের হতে হবে।";
  }

  if (
    password.length >
    MAX_PASSWORD_LENGTH
  ) {

    return "Password সর্বোচ্চ 50 অক্ষরের হতে পারবে।";
  }

  return "";
}


// ============================================================
// NAME VALIDATION
// ============================================================

function validateName(name) {

  const cleanName =
    String(name || "").trim();

  if (cleanName.length < 2) {

    return "Full Name কমপক্ষে 2 অক্ষরের হতে হবে।";
  }

  if (cleanName.length > 100) {

    return "Full Name অনেক বড় হয়ে গেছে।";
  }

  return "";
}


// ============================================================
// COUNTRY VALIDATION
// ============================================================

function validateCountry(country) {

  const value =
    String(country || "").trim();

  if (!value) {

    return "Country লিখুন।";
  }

  if (value.length > 80) {

    return "Country-এর নাম সঠিকভাবে লিখুন।";
  }

  return "";
}


// ============================================================
// GENERATE AYNA ID
// ============================================================

function generateAynaId() {

  const randomPart =
    crypto.randomUUID
      ? crypto.randomUUID()
      : (
          Date.now().toString(36) +
          Math.random()
            .toString(36)
            .substring(2, 12)
        );

  return (
    "AYNA-" +
    randomPart
      .replace(/-/g, "")
      .substring(0, 12)
      .toUpperCase()
  );
}


// ============================================================
// CREATE USER DATABASE RECORD
// ============================================================

async function createUserRecord(
  user,
  profileData
) {

  const userRef =
    ref(
      database,
      `users/${user.uid}`
    );


  const now = Date.now();

  const userData = {

    uid: user.uid,

    aynaId:
      profileData.aynaId,

    fullName:
      profileData.fullName,

    email:
      user.email,

    phone:
      profileData.phone,

    country:
      profileData.country,

    photoURL:
      selectedPhotoBase64 || "",

    photoMimeType:
      selectedPhotoMimeType || "",

    accountType:
      "personal",

    plan:
      "free",

    emailVerified:
      false,

    createdAt:
      now,

    updatedAt:
      now,

    profileLocked:
      true,

    status:
      "active"
  };


  await set(
    userRef,
    userData
  );


  return userData;
}


// ============================================================
// SEND VERIFICATION
// ============================================================

async function sendVerification(user) {

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await sendEmailVerification(user);
}


// ============================================================
// FIREBASE ERROR MESSAGE
// ============================================================

function getFirebaseErrorMessage(error) {

  if (!error) {

    return "Registration ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";
  }


  switch (error.code) {

    case "auth/email-already-in-use":

      return "এই Gmail দিয়ে ইতিমধ্যে একটি AYNA BOOK account আছে। Login করুন।";


    case "auth/invalid-email":

      return "Gmail address সঠিক নয়।";


    case "auth/weak-password":

      return "Password আরও শক্তিশালী দিন।";


    case "auth/network-request-failed":

      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";


    case "auth/operation-not-allowed":

      return "Firebase Console-এ Email/Password Sign-in চালু করা নেই।";


    case "auth/api-key-not-valid":

      return "Firebase API Key সঠিক নয়। firebase-init.js পরীক্ষা করুন।";


    case "auth/too-many-requests":

      return "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";


    case "auth/quota-exceeded":

      return "Firebase quota সীমা অতিক্রম হয়েছে। পরে আবার চেষ্টা করুন।";


    case "PERMISSION_DENIED":

      return "Firebase Realtime Database permission denied। Database Rules পরীক্ষা করুন।";


    default:

      return (
        "Registration ব্যর্থ হয়েছে: " +
        (
          error.message ||
          "Unknown Firebase error"
        )
      );
  }
}


// ============================================================
// FORM VALIDATION
// ============================================================

function validateForm() {

  const fullName =
    String(
      regFullName?.value || ""
    ).trim();

  const email =
    normalizeEmail(
      regEmail?.value
    );

  const country =
    String(
      regCountry?.value || ""
    ).trim();

  const phone =
    normalizePhone(
      regPhone?.value
    );

  const password =
    String(
      regPassword?.value || ""
    );

  const confirmPassword =
    String(
      regConfirmPassword?.value || ""
    );


  // ----------------------------------------------------------
  // Profile Photo
  // ----------------------------------------------------------

  if (!selectedPhotoBase64) {

    showMessage(
      "📷 Profile Photo নির্বাচন করুন।",
      "error"
    );

    profilePhotoInput?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Name
  // ----------------------------------------------------------

  const nameError =
    validateName(fullName);

  if (nameError) {

    showMessage(
      nameError,
      "error"
    );

    regFullName?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Gmail
  // ----------------------------------------------------------

  if (!isValidGmail(email)) {

    showMessage(
      "শুধু একটি বৈধ Gmail address ব্যবহার করুন। যেমন: example@gmail.com",
      "error"
    );

    regEmail?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Country
  // ----------------------------------------------------------

  const countryError =
    validateCountry(country);

  if (countryError) {

    showMessage(
      countryError,
      "error"
    );

    regCountry?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Phone
  // ----------------------------------------------------------

  if (!isValidPhone(phone)) {

    showMessage(
      "Phone Number সঠিক নয়। Country code সহ নম্বর দিন।",
      "error"
    );

    regPhone?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Password
  // ----------------------------------------------------------

  const passwordError =
    validatePassword(password);

  if (passwordError) {

    showMessage(
      passwordError,
      "error"
    );

    regPassword?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Confirm Password
  // ----------------------------------------------------------

  if (
    password !==
    confirmPassword
  ) {

    showMessage(
      "Password এবং Confirm Password একই নয়।",
      "error"
    );

    regConfirmPassword?.focus();

    return null;
  }


  // ----------------------------------------------------------
  // Terms
  // ----------------------------------------------------------

  if (
    !termsCheckbox?.checked
  ) {

    showMessage(
      "Registration করার আগে Terms ও Privacy গ্রহণ করুন।",
      "error"
    );

    return null;
  }


  return {
    fullName,
    email,
    country,
    phone,
    password
  };
}


// ============================================================
// REGISTER
// ============================================================

async function registerUser(event) {

  event.preventDefault();

  if (registerBusy) return;

  registerBusy = true;

  showMessage("");

  const formData =
    validateForm();

  if (!formData) {

    registerBusy = false;

    return;
  }


  setLoading(true);


  try {

    // --------------------------------------------------------
    // Wait for Firebase Auth persistence
    // --------------------------------------------------------

    try {

      await authReady;

    } catch (error) {

      console.warn(
        "Auth persistence warning:",
        error
      );
    }


    // --------------------------------------------------------
    // Create Firebase Authentication Account
    // --------------------------------------------------------

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );


    const user =
      credential.user;


    if (!user) {
      throw new Error(
        "USER_CREATION_FAILED"
      );
    }


    // --------------------------------------------------------
    // Generate AYNA ID
    // --------------------------------------------------------

    const aynaId =
      generateAynaId();


    // --------------------------------------------------------
    // Save profile in RTDB
    // --------------------------------------------------------

    await createUserRecord(
      user,
      {
        aynaId,
        fullName:
          formData.fullName,
        phone:
          formData.phone,
        country:
          formData.country
      }
    );


    // --------------------------------------------------------
    // Send Email Verification
    // --------------------------------------------------------

    await sendVerification(user);


    // --------------------------------------------------------
    // Refresh Firebase user
    // --------------------------------------------------------

    try {

      await reload(user);

    } catch (reloadError) {

      console.warn(
        "User reload warning:",
        reloadError
      );
    }


    // --------------------------------------------------------
    // IMPORTANT:
    // DO NOT SIGN OUT HERE.
    //
    // verify-email.js needs auth.currentUser.
    // --------------------------------------------------------

    showMessage(
      "✅ Account তৈরি হয়েছে! Verification Email পাঠানো হয়েছে।",
      "success"
    );


    // --------------------------------------------------------
    // Clear sensitive password fields
    // --------------------------------------------------------

    if (regPassword) {
      regPassword.value = "";
    }

    if (regConfirmPassword) {
      regConfirmPassword.value = "";
    }


    // --------------------------------------------------------
    // Go to verification page
    // --------------------------------------------------------

    setTimeout(() => {

      window.location.href =
        "./verify-email.html";

    }, 1000);


  } catch (error) {

    console.error(
      "AYNA BOOK registration error:",
      error
    );


    // --------------------------------------------------------
    // If Auth account was created but RTDB failed,
    // user may still exist in Firebase Authentication.
    // Do not automatically create another account.
    // --------------------------------------------------------

    showMessage(
      getFirebaseErrorMessage(error),
      "error"
    );


  } finally {

    registerBusy = false;

    setLoading(false);
  }
}


// ============================================================
// FORM EVENT
// ============================================================

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    registerUser
  );
}


// ============================================================
// PASSWORD LIVE CHECK
// ============================================================

if (regConfirmPassword) {

  regConfirmPassword.addEventListener(
    "input",
    () => {

      const password =
        regPassword?.value || "";

      const confirm =
        regConfirmPassword.value || "";

      if (!confirm) return;

      if (password === confirm) {

        regConfirmPassword.style.borderColor =
          "#00ff99";

      } else {

        regConfirmPassword.style.borderColor =
          "#ff6b6b";
      }
    }
  );
}


// ============================================================
// EMAIL NORMALIZATION
// ============================================================

if (regEmail) {

  regEmail.addEventListener(
    "blur",
    () => {

      regEmail.value =
        normalizeEmail(
          regEmail.value
        );
    }
  );
}


// ============================================================
// PHONE NORMALIZATION
// ============================================================

if (regPhone) {

  regPhone.addEventListener(
    "blur",
    () => {

      regPhone.value =
        normalizePhone(
          regPhone.value
        );
    }
  );
}


// ============================================================
// START
// ============================================================

console.log(
  "AYNA BOOK register.js loaded successfully."
);