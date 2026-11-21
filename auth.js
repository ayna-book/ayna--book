// =========================================================
// AYNA BOOK
// AUTHENTICATION CONTROLLER
// File: auth.js
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

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;


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
// =========================================================

export function validatePassword(password) {

  const value = String(password || "");

  return (
    value.length >= MIN_PASSWORD_LENGTH &&
    value.length <= MAX_PASSWORD_LENGTH
  );
}


// =========================================================
// PASSWORD CONFIRMATION
// =========================================================

export function passwordsMatch(
  password,
  confirmPassword
) {

  return (
    String(password || "") ===
    String(confirmPassword || "")
  );
}


// =========================================================
// CREATE REGISTRATION ACCOUNT
// =========================================================

export async function createRegistrationAccount({
  fullName,
  email,
  password
}) {

  const name =
    String(fullName || "").trim();

  const gmail =
    String(email || "")
      .trim()
      .toLowerCase();

  const pass =
    String(password || "");


  // -------------------------------------------------------
  // NAME
  // -------------------------------------------------------

  if (name.length < 2) {

    throw new Error(
      "আপনার পূর্ণ নাম লিখুন।"
    );
  }


  // -------------------------------------------------------
  // GMAIL
  // -------------------------------------------------------

  if (!validateGmail(gmail)) {

    throw new Error(
      "শুধুমাত্র বৈধ Gmail address ব্যবহার করুন।"
    );
  }


  // -------------------------------------------------------
  // PASSWORD
  // -------------------------------------------------------

  if (!validatePassword(pass)) {

    throw new Error(
      `Password ${MIN_PASSWORD_LENGTH} থেকে ${MAX_PASSWORD_LENGTH} অক্ষরের মধ্যে হতে হবে।`
    );
  }


  // -------------------------------------------------------
  // FIREBASE AUTH ACCOUNT
  // -------------------------------------------------------

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      gmail,
      pass
    );

  const user =
    credential.user;


  if (!user) {

    throw new Error(
      "Account তৈরি করা যায়নি।"
    );
  }


  // -------------------------------------------------------
  // SAVE DISPLAY NAME
  // -------------------------------------------------------

  try {

    await updateProfile(
      user,
      {
        displayName: name
      }
    );

  } catch (error) {

    console.error(
      "AYNA BOOK: Display name update failed:",
      error
    );

    // Authentication account already exists.
    // Do not hide the actual Firebase account creation.
    throw error;
  }


  return user;
}


// =========================================================
// SEND VERIFICATION EMAIL
// =========================================================

export async function sendVerificationEmail(
  user = auth.currentUser
) {

  if (!user) {

    throw new Error(
      "Verification email পাঠানোর জন্য কোনো user পাওয়া যায়নি।"
    );
  }


  // -------------------------------------------------------
  // REFRESH USER INFORMATION
  // -------------------------------------------------------

  await user.reload();


  const currentUser =
    auth.currentUser;


  // -------------------------------------------------------
  // CONFIRM SAME USER SESSION
  // -------------------------------------------------------

  if (
    !currentUser ||
    currentUser.uid !== user.uid
  ) {

    throw new Error(
      "User session পাওয়া যায়নি। আবার Login করুন।"
    );
  }


  // -------------------------------------------------------
  // ALREADY VERIFIED
  // -------------------------------------------------------

  if (
    currentUser.emailVerified === true
  ) {

    return {
      alreadyVerified: true
    };
  }


  // -------------------------------------------------------
  // SEND EMAIL
  // -------------------------------------------------------

  await sendEmailVerification(
    currentUser
  );


  return {
    alreadyVerified: false
  };
}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(
  email,
  password
) {

  const gmail =
    String(email || "")
      .trim()
      .toLowerCase();

  const pass =
    String(password || "");


  // -------------------------------------------------------
  // GMAIL
  // -------------------------------------------------------

  if (!validateGmail(gmail)) {

    throw new Error(
      "সঠিক Gmail address লিখুন।"
    );
  }


  // -------------------------------------------------------
  // PASSWORD
  // -------------------------------------------------------

  if (!pass) {

    throw new Error(
      "Password লিখুন।"
    );
  }


  // -------------------------------------------------------
  // FIREBASE LOGIN
  // -------------------------------------------------------

  const credential =
    await signInWithEmailAndPassword(
      auth,
      gmail,
      pass
    );


  const user =
    credential.user;


  if (!user) {

    throw new Error(
      "Login করা যায়নি।"
    );
  }


  // -------------------------------------------------------
  // REFRESH USER
  // -------------------------------------------------------

  await user.reload();


  const currentUser =
    auth.currentUser;


  // -------------------------------------------------------
  // CONFIRM SESSION
  // -------------------------------------------------------

  if (
    !currentUser ||
    currentUser.uid !== user.uid
  ) {

    throw new Error(
      "User session পাওয়া যায়নি।"
    );
  }


  // -------------------------------------------------------
  // EMAIL VERIFICATION REQUIRED
  // -------------------------------------------------------

  if (
    !currentUser.emailVerified
  ) {

    await signOut(auth);

    throw new Error(
      "আপনার Gmail এখনো Verify করা হয়নি। Gmail থেকে Verification Link-এ ক্লিক করুন।"
    );
  }


  return currentUser;
}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(
  email
) {

  const gmail =
    String(email || "")
      .trim()
      .toLowerCase();


  if (!validateGmail(gmail)) {

    throw new Error(
      "সঠিক Gmail address লিখুন।"
    );
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

  return true;
}


// =========================================================
// AUTH STATE WATCHER
// =========================================================

export function watchAuthState(
  callback
) {

  if (
    typeof callback !== "function"
  ) {

    throw new Error(
      "watchAuthState-এর জন্য callback function প্রয়োজন।"
    );
  }


  return onAuthStateChanged(
    auth,
    callback,
    (error) => {

      console.error(
        "AYNA BOOK Auth State Error:",
        error
      );
    }
  );
}


// =========================================================
// GET CURRENT USER
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;
}


// =========================================================
// CHECK EMAIL VERIFICATION
// =========================================================

export function isEmailVerified() {

  const user =
    auth.currentUser;


  return !!(
    user &&
    user.emailVerified === true
  );
}


// =========================================================
// FIREBASE AUTH ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(
  error
) {

  const code =
    error?.code || "";


  switch (code) {

    case "auth/email-already-in-use":

      return "এই Gmail দিয়ে ইতিমধ্যে একটি account আছে। Login করুন।";


    case "auth/invalid-email":

      return "Gmail address সঠিক নয়।";


    case "auth/weak-password":

      return "Password ৮–৫০ অক্ষরের মধ্যে দিন।";


    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":

      return "Gmail অথবা Password সঠিক নয়।";


    case "auth/user-not-found":

      return "এই Gmail দিয়ে কোনো account পাওয়া যায়নি।";


    case "auth/wrong-password":

      return "Password সঠিক নয়।";


    case "auth/missing-password":

      return "Password লিখুন।";


    case "auth/user-disabled":

      return "এই account বর্তমানে বন্ধ করা হয়েছে।";


    case "auth/too-many-requests":

      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";


    case "auth/network-request-failed":

      return "Internet connection পরীক্ষা করুন।";


    case "auth/requires-recent-login":

      return "এই কাজের জন্য আবার Login করতে হবে।";


    case "auth/operation-not-allowed":

      return "Firebase Console-এ Email/Password Sign-in চালু করুন।";


    case "auth/unauthorized-domain":

      return "এই Website-এর Domain Firebase Authorized Domains-এ যোগ করুন।";


    case "auth/invalid-api-key":
    case "auth/api-key-not-valid":

      return "Firebase API Key সঠিক নয়। Firebase Configuration পরীক্ষা করুন।";


    case "auth/quota-exceeded":

      return "Firebase-এর নির্ধারিত সীমা অতিক্রম হয়েছে। পরে আবার চেষ্টা করুন।";


    default:

      return (
        error?.message ||
        "Authentication-এর সময় একটি সমস্যা হয়েছে।"
      );
  }
}


// =========================================================
// INITIALIZATION LOG
// =========================================================

console.log(
  "========================================"
);

console.log(
  "AYNA BOOK - auth.js"
);

console.log(
  "Authentication Controller Loaded"
);

console.log(
  "Password Length:",
  `${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}`
);

console.log(
  "========================================"
);