import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const $ = id => document.getElementById(id);

const emailForm = $("emailForm");
const phoneForm = $("phoneForm");
const statusElement = $("status");

const emailSubmit = $("emailSubmit");
const sendOtpButton = $("sendOtpButton");
const verifyOtpButton = $("verifyOtpButton");

let recaptchaVerifier = null;
let confirmationResult = null;
let phoneRequestInProgress = false;
let emailRequestInProgress = false;

function showStatus(message) {
  statusElement.textContent = message;
}

function normalizeUsername(value) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

function validUsername(username) {
  return /^[a-z0-9_.-]{3,30}$/.test(username);
}

function normalizePhone(value) {
  // Removes spaces, parentheses and hyphens.
  return value.replace(/[\s()-]/g, "");
}

async function saveProfile(user, data) {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: data.name,
    username: data.username,
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    bio: "",
    location: "",
    photo: "",
    accountType: "personal",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/* ======================================
   GMAIL / EMAIL REGISTRATION
====================================== */

emailForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (emailRequestInProgress) return;

  const name = $("emailName").value.trim();
  const username = normalizeUsername($("emailUsername").value);
  const email = $("emailAddress").value.trim().toLowerCase();
  const password = $("emailPassword").value;
  const confirmPassword = $("emailPasswordConfirm").value;

  if (!name || !username || !email || !password) {
    showStatus("সব প্রয়োজনীয় ঘর পূরণ করুন।");
    return;
  }

  if (!validUsername(username)) {
    showStatus(
      "ইউজারনেম ৩–৩০ অক্ষরের হতে হবে। ইংরেজি অক্ষর, সংখ্যা, _, . অথবা - ব্যবহার করুন।"
    );
    return;
  }

  if (password.length < 8) {
    showStatus("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
    return;
  }

  if (password !== confirmPassword) {
    showStatus("দুটি পাসওয়ার্ড মিলছে না।");
    return;
  }

  emailRequestInProgress = true;
  emailSubmit.disabled = true;

  let createdUser = null;

  showStatus("আপনার Gmail অ্যাকাউন্ট তৈরি হচ্ছে...");

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    createdUser = credential.user;

    await updateProfile(createdUser, {
      displayName: name
    });

    await saveProfile(createdUser, {
      name,
      username
    });

    await sendEmailVerification(createdUser);

    showStatus(
      "✅ অ্যাকাউন্ট তৈরি হয়েছে! আপনার Inbox খুলে verification link-এ চাপ দিন। Spam/Junk ফোল্ডারও দেখুন।"
    );

    emailForm.reset();

  } catch (error) {
    console.error("Email signup error:", error);

    if (createdUser) {
      showStatus(
        "Authentication অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু পরের ধাপে সমস্যা হয়েছে। একই ইমেইল দিয়ে আবার Signup করবেন না। Firebase Console পরীক্ষা করুন।"
      );
    } else {
      const messages = {
        "auth/email-already-in-use":
          "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে। লগইন করুন।",

        "auth/invalid-email":
          "সঠিক ইমেইল ঠিকানা লিখুন।",

        "auth/weak-password":
          "আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।",

        "auth/operation-not-allowed":
          "Firebase Console-এ Email/Password Authentication চালু করুন।",

        "auth/network-request-failed":
          "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

        "permission-denied":
          "Firestore Rules পরীক্ষা করুন।"
      };

      showStatus(
        messages[error.code] ||
        "অ্যাকাউন্ট তৈরি হয়নি। Firebase সেটিংস পরীক্ষা করুন। ত্রুটি: " +
        (error.code || "unknown")
      );
    }
  } finally {
    emailRequestInProgress = false;
    emailSubmit.disabled = false;
  }
});

/* ======================================
   PHONE OTP — INITIALIZE RECAPTCHA
====================================== */

async function initializeRecaptcha() {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "normal",
      callback: () => {
        showStatus("মানব যাচাই সফল হয়েছে। এখন OTP পাঠাতে পারবেন।");
      },
      "expired-callback": () => {
        showStatus("reCAPTCHA মেয়াদ শেষ হয়েছে। আবার যাচাই করুন।");
      }
    }
  );

  await recaptchaVerifier.render();
  return recaptchaVerifier;
}

/* ======================================
   SEND OTP
====================================== */

sendOtpButton.addEventListener("click", async () => {
  if (phoneRequestInProgress) return;

  const name = $("phoneName").value.trim();
  const username = normalizeUsername($("phoneUsername").value);
  const phoneNumber = normalizePhone($("phoneNumber").value);

  if (!name || !username || !phoneNumber) {
    showStatus("নাম, ইউজারনেম ও ফোন নম্বর লিখুন।");
    return;
  }

  if (!validUsername(username)) {
    showStatus(
      "ইউজারনেম ৩–৩০ অক্ষরের হতে হবে। ইংরেজি অক্ষর, সংখ্যা, _, . অথবা - ব্যবহার করুন।"
    );
    return;
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
    showStatus(
      "দেশের কোডসহ সঠিক নম্বর লিখুন। বাংলাদেশের উদাহরণ: +8801812345678"
    );
    return;
  }

  phoneRequestInProgress = true;
  sendOtpButton.disabled = true;

  try {
    showStatus("reCAPTCHA যাচাই প্রস্তুত হচ্ছে...");

    const verifier = await initializeRecaptcha();

    showStatus("আপনার ফোনে SMS OTP পাঠানো হচ্ছে...");

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );

    $("otpSection").hidden = false;
    $("otpCode").focus();

    showStatus(
      "OTP পাঠানো হয়েছে। SMS-এ পাওয়া কোডটি লিখুন।"
    );

  } catch (error) {
    console.error("Phone OTP error:", error);

    const messages = {
      "auth/invalid-phone-number":
        "ফোন নম্বর সঠিক নয়। দেশের কোডসহ লিখুন।",

      "auth/too-many-requests":
        "অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।",

      "auth/quota-exceeded":
        "SMS সীমা শেষ হয়েছে। Firebase Console পরীক্ষা করুন।",

      "auth/operation-not-allowed":
        "Firebase Console-এ Phone Authentication চালু করুন।",

      "auth/captcha-check-failed":
        "reCAPTCHA যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",

      "auth/unauthorized-domain":
        "Firebase Authentication-এর Authorized domains-এ ওয়েবসাইটের ডোমেইন যোগ করুন।",

      "auth/network-request-failed":
        "ইন্টারনেট সংযোগ পরীক্ষা করুন।"
    };

    showStatus(
      messages[error.code] ||
      "OTP পাঠানো যায়নি। Firebase Phone Authentication ও reCAPTCHA সেটিংস পরীক্ষা করুন। ত্রুটি: " +
      (error.code || "unknown")
    );

    // Allow the user to try again with a fresh reCAPTCHA.
    if (recaptchaVerifier) {
      try {
        await recaptchaVerifier.clear();
      } catch (_) {}

      recaptchaVerifier = null;
    }

  } finally {
    phoneRequestInProgress = false;
    sendOtpButton.disabled = false;
  }
});

/* ======================================
   VERIFY OTP AND CREATE PHONE PROFILE
====================================== */

verifyOtpButton.addEventListener("click", async () => {
  if (!confirmationResult) {
    showStatus("আগে SMS OTP পাঠান।");
    return;
  }

  const name = $("phoneName").value.trim();
  const username = normalizeUsername($("phoneUsername").value);
  const code = $("otpCode").value.trim();

  if (!name || !validUsername(username)) {
    showStatus("নাম ও সঠিক ইউজারনেম লিখুন।");
    return;
  }

  if (!code) {
    showStatus("SMS-এ পাওয়া OTP লিখুন।");
    return;
  }

  verifyOtpButton.disabled = true;
  sendOtpButton.disabled = true;

  showStatus("OTP যাচাই হচ্ছে...");

  let userCredential = null;

  try {
    userCredential = await confirmationResult.confirm(code);

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name
    });

    await saveProfile(user, {
      name,
      username
    });

    showStatus(
      "✅ ফোন নম্বর যাচাই সফল! AYNA BOOK অ্যাকাউন্ট তৈরি হয়েছে।"
    );

    window.setTimeout(() => {
      window.location.href = "./profile.html";
    }, 1200);

  } catch (error) {
    console.error("OTP verification error:", error);

    if (userCredential) {
      showStatus(
        "ফোন নম্বর যাচাই হয়েছে, কিন্তু প্রোফাইল সংরক্ষণে সমস্যা হয়েছে। একই নম্বর দিয়ে বারবার অ্যাকাউন্ট তৈরি করার চেষ্টা করবেন না।"
      );
    } else {
      const messages = {
        "auth/invalid-verification-code":
          "OTP সঠিক নয়। SMS-এর কোড আবার পরীক্ষা করুন।",

        "auth/code-expired":
          "OTP-এর মেয়াদ শেষ হয়েছে। নতুন OTP পাঠান।",

        "permission-denied":
          "Firestore Rules পরীক্ষা করুন।"
      };

      showStatus(
        messages[error.code] ||
        "OTP যাচাই করা যায়নি। আবার চেষ্টা করুন। ত্রুটি: " +
        (error.code || "unknown")
      );
    }
  } finally {
    verifyOtpButton.disabled = false;
    sendOtpButton.disabled = false;
  }
});