
// =========================================================
// AYNA BOOK
// AUTHENTICATION CONTROLLER
// Firebase SDK: 13.4.0
// =========================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import { auth } from "./firebase.js";


// =========================================================
// SETTINGS
// =========================================================

export const MIN_PASSWORD_LENGTH = 11;


// =========================================================
// EMAIL VALIDATION
// =========================================================

export function validateGmail(email) {
  const value = String(email || "")
    .trim()
    .toLowerCase();

  return /^[a-z0-9._%+-]+@gmail\.com$/.test(value);
}


// =========================================================
// PASSWORD VALIDATION
// Signup-এর সময় ব্যবহার হবে
// =========================================================

export function validatePassword(password) {
  const value = String(password || "");

  return value.length >= MIN_PASSWORD_LENGTH;
}


// =========================================================
// PASSWORD CONFIRMATION
// =========================================================

export function passwordsMatch(password, confirmPassword) {
  return (
    String(password || "") ===
    String(confirmPassword || "")
  );
}


// =========================================================
// CREATE ACCOUNT
// =========================================================

export async function createRegistrationAccount({
  fullName,
  email,
  password
}) {

  const name = String(fullName || "").trim();

  const gmail = String(email || "")
    .trim()
    .toLowerCase();

  const pass = String(password || "");

  if (name.length < 2) {
    throw new Error("আপনার পূর্ণ নাম লিখুন।");
  }

  if (!validateGmail(gmail)) {
    throw new Error("শুধুমাত্র Gmail address ব্যবহার করুন।");
  }

  if (!validatePassword(pass)) {
    throw new Error(
      `Password কমপক্ষে ${MIN_PASSWORD_LENGTH} অক্ষরের হতে হবে।`
    );
  }

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      gmail,
      pass
    );

  const user = credential.user;

  if (!user) {
    throw new Error("Account তৈরি করা যায়নি।");
  }

  if (name) {
    await updateProfile(user, {
      displayName: name
    });
  }

  return user;
}


// =========================================================
// SEND VERIFICATION EMAIL
// =========================================================

export async function sendVerificationEmail(user = auth.currentUser) {

  if (!user) {
    throw new Error(
      "Verification email পাঠানোর জন্য কোনো user পাওয়া যায়নি।"
    );
  }

  await user.reload();

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User session পাওয়া যায়নি।");
  }

  if (currentUser.emailVerified) {
    return {
      alreadyVerified: true
    };
  }

  await sendEmailVerification(currentUser);

  return {
    alreadyVerified: false
  };
}


// =========================================================
// LOGIN
// গুরুত্বপূর্ণ:
// এখানে 11 অক্ষরের password বাধ্যতামূলক করা হয়নি।
// Firebase নিজেই password যাচাই করবে।
// =========================================================

export async function loginUser(email, password) {

  const gmail = String(email || "")
    .trim()
    .toLowerCase();

  const pass = String(password || "");

  if (!validateGmail(gmail)) {
    throw new Error("সঠিক Gmail address লিখুন।");
  }

  if (!pass) {
    throw new Error("Password লিখুন।");
  }

  const credential =
    await signInWithEmailAndPassword(
      auth,
      gmail,
      pass
    );

  const user = credential.user;

  if (!user) {
    throw new Error("Login করা যায়নি।");
  }

  await user.reload();

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("User session পাওয়া যায়নি।");
  }

  // Gmail verification বাধ্যতামূলক
  if (!currentUser.emailVerified) {

    await signOut(auth);

    throw new Error(
      "আপনার Gmail এখনো Verify করা হয়নি। Gmail থেকে Verification link-এ ক্লিক করুন।"
    );
  }

  return currentUser;
}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(email) {

  const gmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!validateGmail(gmail)) {
    throw new Error("সঠিক Gmail address লিখুন।");
  }

  await sendPasswordResetEmail(
    auth,
    gmail
  );

  return true;
}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {
  await signOut(auth);
}


// =========================================================
// AUTH STATE WATCHER
// =========================================================

export function watchAuthState(callback) {

  if (typeof callback !== "function") {
    throw new Error(
      "watchAuthState-এর জন্য callback function প্রয়োজন।"
    );
  }

  return onAuthStateChanged(
    auth,
    callback
  );
}


// =========================================================
// CURRENT USER
// =========================================================

export function getCurrentUser() {
  return auth.currentUser;
}


// =========================================================
// EMAIL VERIFIED?
// =========================================================

export function isEmailVerified() {

  const user = auth.currentUser;

  return !!(
    user &&
    user.emailVerified === true
  );
}


// =========================================================
// FIREBASE AUTH ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(error) {

  const code =
    error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে একটি account আছে। Login করুন।";

    case "auth/invalid-email":
      return "Gmail address সঠিক নয়।";

    case "auth/weak-password":
      return "Password আরও শক্তিশালী দিন।";

    case "auth/invalid-credential":
      return "Gmail অথবা Password সঠিক নয়।";

    case "auth/user-not-found":
      return "এই Gmail দিয়ে কোনো account পাওয়া যায়নি।";

    case "auth/wrong-password":
      return "Password সঠিক নয়।";

    case "auth/user-disabled":
      return "এই account বর্তমানে বন্ধ করা হয়েছে।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/network-request-failed":
      return "Internet connection পরীক্ষা করুন।";

    case "auth/requires-recent-login":
      return "এই কাজের জন্য আবার Login করতে হবে।";

    default:
      return (
        error?.message ||
        "Authentication-এর সময় একটি সমস্যা হয়েছে।"
      );
  }
}