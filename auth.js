// =========================================================
// AYNA BOOK
// Authentication + Registration + SMS OTP
// Firebase SDK: 13.4.0
// =========================================================

import { auth, db, storage } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  PhoneAuthProvider,
  linkWithCredential,
  verifyPhoneNumber
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// 1. Bangladesh Phone Number Normalize
// =========================================================

export function normalizePhone(phone) {
  let value = String(phone || "").trim();

  // Remove spaces, hyphens and brackets
  value = value.replace(/[\s\-()]/g, "");

  // 01XXXXXXXXX → +8801XXXXXXXXX
  if (/^01\d{9}$/.test(value)) {
    return "+880" + value.substring(1);
  }

  // 8801XXXXXXXXX → +8801XXXXXXXXX
  if (/^8801\d{9}$/.test(value)) {
    return "+" + value;
  }

  // Already international format
  if (/^\+8801\d{9}$/.test(value)) {
    return value;
  }

  throw new Error(
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন। উদাহরণ: 017XXXXXXXX"
  );
}


// =========================================================
// 2. Firebase Error Message
// =========================================================

export function getAuthErrorMessage(error) {
  const code = error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।";

    case "auth/invalid-email":
      return "সঠিক Gmail address দিন।";

    case "auth/weak-password":
      return "Password আরও শক্তিশালী করুন।";

    case "auth/wrong-password":
      return "Password সঠিক নয়।";

    case "auth/invalid-credential":
      return "Gmail অথবা Password সঠিক নয়।";

    case "auth/user-not-found":
      return "এই Gmail দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    case "auth/invalid-verification-code":
      return "OTP সঠিক নয়। আবার চেষ্টা করুন।";

    case "auth/code-expired":
      return "OTP-এর সময় শেষ হয়েছে। নতুন OTP নিন।";

    case "auth/credential-already-in-use":
      return "এই মোবাইল নম্বর অন্য একটি অ্যাকাউন্টে ব্যবহার করা হয়েছে।";

    case "auth/phone-number-already-exists":
      return "এই মোবাইল নম্বর ইতিমধ্যে ব্যবহার করা হয়েছে।";

    case "auth/quota-exceeded":
      return "SMS সীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।";

    case "auth/billing-not-enabled":
      return "Firebase Phone Authentication-এর জন্য Billing/Blaze প্রয়োজন হতে পারে।";