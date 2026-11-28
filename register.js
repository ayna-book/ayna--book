
// =========================================================
// AYNA BOOK — REGISTRATION MODULE
// Firebase Authentication + Realtime Database
// Firebase SDK: 13.4.0
// Gmail verification required
// Profile image: compressed square JPEG, maximum 5 MB input
// =========================================================

import { AynaVoiceSignal } from "./ayna-voice-signal.js";
import { auth, database } from "./firebase-init.js";

const $ = id => document.getElementById(id);

const DEFAULT_FRAME_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="#0a1636"/><circle cx="80" cy="56" r="28" fill="#ffe64d"/><path d="M24 160 Q32 104 80 104 Q128 104 136 160" fill="#ffe64d"/></svg>'
  );

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MAX_COMPRESSED_PHOTO_SIZE = 450 * 1024;

let photoDataUrl = "";
let registrationInProgress = false;


// =========================================================
// INITIALIZE PAGE
// =========================================================

export function initRegisterPage() {
  const preview = $("regPhotoPreview");

  if (preview && !preview.getAttribute("src")) {
    preview.src = DEFAULT_FRAME_SVG;
  }

  $("speakClockBtn")?.addEventListener("click", () => {
    AynaVoiceSignal.speakCurrentTime();
  });

  $("toggleClockBtn")?.addEventListener("click", () => {
    AynaVoiceSignal.toggleClock("toggleClockBtn");
  });

  $("repeatSignalBtn")?.addEventListener("click", () => {
    AynaVoiceSignal.repeatLast();
  });

  $("loginPageBtn")?.addEventListener("click", () => {
    window.location.href = "login.html";
  });

  bindPasswordToggle(
    "togglePasswordBtn",
    "regPassword",
    "👁️ পাসওয়ার্ড দেখাও",
    "🙈 পাসওয়ার্ড লুকাও"
  );

  bindPasswordToggle(
    "toggleConfirmPasswordBtn",
    "regConfirmPassword",
    "👁️ রি-পাসওয়ার্ড দেখাও",
    "🙈 রি-পাসওয়ার্ড লুকাও"
  );

  $("choosePhotoBtn")?.addEventListener("click", () => {
    $("regPhotoInput")?.click();
  });

  $("regPhotoInput")?.addEventListener("change", handlePhotoSelection);

  $("registerSubmitBtn")?.addEventListener("click", handleRegisterSubmit);

  // Enter key দিয়ে সাবমিট
  ["regEmail", "regPhone", "regPassword", "regConfirmPassword"].forEach(id => {
    $(id)?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleRegisterSubmit();
      }
    });
  });
}


// =========================================================
// PASSWORD SHOW / HIDE
// =========================================================

function bindPasswordToggle(btnId, inputId, showText, hideText) {
  $(btnId)?.addEventListener("click", () => {
    const input = $(inputId);
    const button = $(btnId);

    if (!input || !button) return;

    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";
    button.textContent = isHidden ? hideText : showText;
  });
}


// =========================================================
// IMAGE COMPRESSION
// =========================================================

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("ছবি পড়া যায়নি।"));

    reader.readAsDataURL(file);
  });
}

function loadImage(dataURL) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ছবিটি খোলা যায়নি।"));

    image.src = dataURL;
  });
}

async function compressSquarePhoto(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("JPG, PNG অথবা WebP ছবি নির্বাচন করুন।");
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("ছবির সাইজ ৫ MB-এর বেশি হতে পারবে না।");
  }

  const originalDataURL = await readFileAsDataURL(file);
  const image = await loadImage(originalDataURL);

  const side = Math.min(image.naturalWidth, image.naturalHeight);

  if (!side) {
    throw new Error("ছবির সাইজ সঠিক নয়।");
  }

  const canvas = document.createElement("canvas");
  const outputSize = Math.min(512, side);

  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("ছবি প্রস্তুত করা যায়নি।");
  }

  const sourceX = (image.naturalWidth - side) / 2;
  const sourceY = (image.naturalHeight - side) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    outputSize,
    outputSize
  );

  let quality = 0.82;
  let result = canvas.toDataURL("image/jpeg", quality);

  while (
    result.length > MAX_COMPRESSED_PHOTO_SIZE * 1.4 &&
    quality > 0.35
  ) {
    quality -= 0.08;
    result = canvas.toDataURL("image/jpeg", quality);
  }

  return result;
}


// =========================================================
// PHOTO SELECTION
// =========================================================

async function handlePhotoSelection(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    photoDataUrl = await compressSquarePhoto(file);

    if ($("regPhotoPreview")) {
      $("regPhotoPreview").src = photoDataUrl;
    }

    if ($("regPhotoLabel")) {
      $("regPhotoLabel").textContent =
        `নির্বাচিত ছবি: ${file.name}`;
    }

    AynaVoiceSignal.success("প্রোফাইল ছবি প্রস্তুত হয়েছে।");
  } catch (error) {
    photoDataUrl = "";

    if ($("regPhotoPreview")) {
      $("regPhotoPreview").src = DEFAULT_FRAME_SVG;
    }

    AynaVoiceSignal.error(error.message || "ছবি নির্বাচন করা যায়নি।");
    event.target.value = "";
  }
}


// =========================================================
// AYNA ID GENERATOR
// =========================================================

function generateAynaId() {
  const values = new Uint32Array(1);

  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
  } else {
    values[0] = Math.floor(Math.random() * 0xffffffff);
  }

  const number = String(values[0] % 90000000 + 10000000);

  return `2026-----${number}`;
}


// =========================================================
// REGISTRATION VALIDATION
// =========================================================

function validateRegistration() {
  const fullName =
    ($("regFullName")?.value || "").trim();

  const email =
    ($("regEmail")?.value || "").trim().toLowerCase();

  const phone =
    ($("regPhone")?.value || "").trim();

  const password =
    $("regPassword")?.value || "";

  const confirmPassword =
    $("regConfirmPassword")?.value || "";

  const country =
    ($("regCountry")?.value || "").trim();

  if (fullName.length < 2) {
    AynaVoiceSignal.error("সঠিক পূর্ণ নাম লিখুন।");
    $("regFullName")?.focus();
    return null;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    AynaVoiceSignal.error("সঠিক Gmail বা Email ঠিকানা লিখুন।");
    $("regEmail")?.focus();
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 8 || digits.length > 20) {
    AynaVoiceSignal.error("সঠিক ফোন নম্বর লিখুন।");
    $("regPhone")?.focus();
    return null;
  }

  if (password.length < 8 || password.length > 50) {
    AynaVoiceSignal.error("পাসওয়ার্ড ৮ থেকে ৫০ অক্ষরের মধ্যে দিন।");
    $("regPassword")?.focus();
    return null;
  }

  if (password !== confirmPassword) {
    AynaVoiceSignal.error("পাসওয়ার্ড ও রি-পাসওয়ার্ড এক নয়।");
    $("regConfirmPassword")?.focus();
    return null;
  }

  const terms = $("regTerms");

  if (terms && !terms.checked) {
    AynaVoiceSignal.error("রেজিস্ট্রেশনের আগে শর্তাবলিতে সম্মতি দিন।");
    terms.focus();
    return null;
  }

  return {
    fullName,
    email,
    phone,
    country,
    password
  };
}


// =========================================================
// REGISTER ACCOUNT
// =========================================================

async function handleRegisterSubmit() {
  if (registrationInProgress) return;

  if (!auth || !database) {
    AynaVoiceSignal.error(
      "Firebase সংযোগ পাওয়া যায়নি। firebase-init.js পরীক্ষা করুন।"
    );
    return;
  }

  const form = validateRegistration();

  if (!form) return;

  const btn = $("registerSubmitBtn");

  registrationInProgress = true;

  if (btn) {
    btn.disabled = true;
    btn.textContent = "রেজিস্ট্রেশন হচ্ছে...";
  }

  let accountCreated = false;

  try {
    const [
      { createUserWithEmailAndPassword, sendEmailVerification, signOut },
      { ref, set }
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
    ]);

    // ১. Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
      auth,
      form.email,
      form.password
    );

    accountCreated = true;

    const user = credential.user;
    const uid = user.uid;
    const aynaId = generateAynaId();
    const createdAt = Date.now();

    // ২. Realtime Database profile
    const profileData = {
      uid,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      country: form.country,
      photoURL: photoDataUrl,
      aynaId,
      accountType: "personal",
      plan: "free",
      emailVerified: false,
      createdAt
    };

    await set(ref(database, `users/${uid}`), profileData);

    // ৩. Gmail verification email পাঠানো
    await sendEmailVerification(user);

    // ৪. Verification-এর আগে লগইন বন্ধ করা
    await signOut(auth);

    // ৫. স্থানীয়ভাবে শুধু অস্থায়ী তথ্য রাখা
    try {
      localStorage.setItem(
        "ayna_pending_verification",
        JSON.stringify({
          email: form.email,
          aynaId,
          createdAt
        })
      );
    } catch (_) {
      // Local storage unavailable হলেও registration সফল থাকবে
    }

    AynaVoiceSignal.success(
      `রেজিস্ট্রেশন সফল। ${form.email} ঠিকানায় verification email পাঠানো হয়েছে। আপনার AYNA ID ${aynaId}।`
    );

    setTimeout(() => {
      window.location.href = "verify-email.html";
    }, 1800);

  } catch (error) {
    console.error("AYNA Registration Error:", error);

    const code = error?.code || "";

    if (code.includes("email-already-in-use")) {
      AynaVoiceSignal.error(
        "এই Email দিয়ে আগে থেকেই অ্যাকাউন্ট খোলা আছে। Login করুন।"
      );

    } else if (code.includes("invalid-email")) {
      AynaVoiceSignal.error("Email ঠিকানাটি সঠিক নয়।");

    } else if (code.includes("weak-password")) {
      AynaVoiceSignal.error(
        "পাসওয়ার্ড দুর্বল। অন্তত ৮ অক্ষরের পাসওয়ার্ড দিন।"
      );

    } else if (code.includes("network-request-failed")) {
      AynaVoiceSignal.error(
        "ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।"
      );

    } else if (code.includes("permission-denied")) {
      AynaVoiceSignal.error(
        "Firebase Database Rules অনুমতি দিচ্ছে না। Rules পরীক্ষা করুন।"
      );

    } else if (accountCreated) {
      AynaVoiceSignal.error(
        "Firebase Authentication account তৈরি হয়েছে, কিন্তু পরবর্তী ধাপ সম্পন্ন হয়নি। Login বা Firebase Console পরীক্ষা করুন।"
      );

    } else {
      AynaVoiceSignal.error(
        "রেজিস্ট্রেশন সম্পন্ন হয়নি। Firebase সেটিংস ও নেটওয়ার্ক পরীক্ষা করুন।"
      );
    }

  } finally {
    registrationInProgress = false;

    if (btn) {
      btn.disabled = false;
      btn.textContent = "✅ রেজিস্ট্রেশন বাটন";
    }
  }
}


// =========================================================
// START
// =========================================================

initRegisterPage();
