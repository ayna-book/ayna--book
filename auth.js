```js
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
  updateProfile,
  reload
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  auth
} from "./firebase.js";


// =========================================================
// CONSTANTS
// =========================================================

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;


// =========================================================
// GMAIL VALIDATION
// =========================================================

export function validateGmail(email) {

  const value =
    String(email || "")
      .trim()
      .toLowerCase();

  return /^[a-z0-9._%+-]+@gmail\.com$/i.test(
    value
  );

}


// =========================================================
// PASSWORD VALIDATION
// =========================================================

export function validatePassword(password) {

  const value =
    String(password || "");

  return (
    value.length >= MIN_PASSWORD_LENGTH &&
    value.length <= MAX_PASSWORD_LENGTH
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
  // Validate name
  // -------------------------------------------------------

  if (
    name.length < 2 ||
    name.length > 100
  ) {

    const error =
      new Error(
        "আপনার পূর্ণ নাম সঠিকভাবে লিখুন।"
      );

    error.code =
      "ayna/invalid-name";

    throw error;

  }


  // -------------------------------------------------------
  // Validate Gmail
  // -------------------------------------------------------

  if (!validateGmail(gmail)) {

    const error =
      new Error(
        "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
      );

    error.code =
      "auth/invalid-email";

    throw error;

  }


  // -------------------------------------------------------
  // Validate password
  // -------------------------------------------------------

  if (!validatePassword(pass)) {

    const error =
      new Error(
        `Password অবশ্যই ${MIN_PASSWORD_LENGTH} থেকে ${MAX_PASSWORD_LENGTH} অক্ষরের মধ্যে হতে হবে।`
      );

    error.code =
      "auth/weak-password";

    throw error;

  }


  // -------------------------------------------------------
  // Create Firebase Authentication account
  // -------------------------------------------------------

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      gmail,
      pass
    );


  const user =
    credential.user;


  // -------------------------------------------------------
  // Set Firebase Auth display name
  // -------------------------------------------------------

  await updateProfile(
    user,
    {
      displayName: name
    }
  );


  console.log(
    "AYNA BOOK: Authentication account created:",
    user.uid
  );


  return user;

}


// =========================================================
// LOGIN USER
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
  // Validate Gmail
  // -------------------------------------------------------

  if (!validateGmail(gmail)) {

    const error =
      new Error(
        "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
      );

    error.code =
      "auth/invalid-email";

    throw error;

  }


  // -------------------------------------------------------
  // Validate password
  // -------------------------------------------------------

  if (!pass) {

    const error =
      new Error(
        "Password লিখুন।"
      );

    error.code =
      "auth/missing-password";

    throw error;

  }


  // -------------------------------------------------------
  // Firebase Login
  // -------------------------------------------------------

  const credential =
    await signInWithEmailAndPassword(
      auth,
      gmail,
      pass
    );


  let user =
    credential.user;


  // -------------------------------------------------------
  // Reload latest Auth information
  // -------------------------------------------------------

  try {

    await reload(user);

    user = auth.currentUser || user;

  } catch (reloadError) {

    console.warn(
      "AYNA BOOK: User reload failed:",
      reloadError
    );

  }


  // -------------------------------------------------------
  // Email verification
  // -------------------------------------------------------

  if (!user.emailVerified) {

    await signOut(auth);


    const error =
      new Error(
        "আপনার Gmail এখনো Verified হয়নি।"
      );

    error.code =
      "auth/email-not-verified";

    throw error;

  }


  console.log(
    "AYNA BOOK: Login successful:",
    user.uid
  );


  return user;

}


// =========================================================
// SEND VERIFICATION EMAIL
// =========================================================

export async function sendVerificationEmail(
  user = auth.currentUser
) {

  if (!user) {

    const error =
      new Error(
        "Verification email পাঠানোর জন্য Login করা user পাওয়া যায়নি।"
      );

    error.code =
      "auth/no-current-user";

    throw error;

  }


  await sendEmailVerification(
    user
  );


  console.log(
    "AYNA BOOK: Verification email sent:",
    user.email
  );

}


// =========================================================
// RESET PASSWORD
// =========================================================

export async function resetPassword(
  email
) {

  const gmail =
    String(email || "")
      .trim()
      .toLowerCase();


  if (!validateGmail(gmail)) {

    const error =
      new Error(
        "শুধুমাত্র বৈধ Gmail Address ব্যবহার করুন।"
      );

    error.code =
      "auth/invalid-email";

    throw error;

  }


  await sendPasswordResetEmail(
    auth,
    gmail
  );


  console.log(
    "AYNA BOOK: Password reset email sent:",
    gmail
  );

}


// =========================================================
// LOGOUT USER
// =========================================================

export async function logoutUser() {

  await signOut(
    auth
  );


  console.log(
    "AYNA BOOK: User logged out."
  );

}


// =========================================================
// WATCH AUTH STATE
// =========================================================

export function watchAuthState(
  callback
) {

  if (
    typeof callback !==
    "function"
  ) {

    throw new Error(
      "watchAuthState callback must be a function."
    );

  }


  return onAuthStateChanged(
    auth,
    callback
  );

}


// =========================================================
// GET CURRENT USER
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;

}


// =========================================================
// IS EMAIL VERIFIED
// =========================================================

export function isEmailVerified(
  user = auth.currentUser
) {

  return Boolean(
    user &&
    user.emailVerified
  );

}


// =========================================================
// GET AUTH ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(
  error
) {

  if (!error) {

    return "একটি অজানা সমস্যা হয়েছে।";

  }


  switch (error.code) {

    case "auth/email-already-in-use":

      return (
        "এই Gmail দিয়ে ইতিমধ্যে একটি AYNA BOOK account আছে।"
      );


    case "auth/invalid-email":

      return (
        "Gmail Address সঠিক নয়।"
      );


    case "auth/invalid-credential":

      return (
        "Gmail অথবা Password সঠিক নয়।"
      );


    case "auth/wrong-password":

      return (
        "Password সঠিক নয়।"
      );


    case "auth/user-not-found":

      return (
        "এই Gmail দিয়ে কোনো account পাওয়া যায়নি।"
      );


    case "auth/user-disabled":

      return (
        "এই account বর্তমানে নিষ্ক্রিয়।"
      );


    case "auth/weak-password":

      return (
        `Password অবশ্যই ${MIN_PASSWORD_LENGTH} থেকে ${MAX_PASSWORD_LENGTH} অক্ষরের মধ্যে হতে হবে।`
      );


    case "auth/missing-password":

      return (
        "Password লিখুন।"
      );


    case "auth/email-not-verified":

      return (
        "আপনার Gmail এখনো Verified হয়নি।"
      );


    case "auth/too-many-requests":

      return (
        "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
      );


    case "auth/network-request-failed":

      return (
        "Internet connection পরীক্ষা করুন।"
      );


    case "auth/requires-recent-login":

      return (
        "এই কাজটি করতে আবার Login করতে হবে।"
      );


    case "auth/no-current-user":

      return (
        "বর্তমানে কোনো Login করা user নেই।"
      );


    case "auth/operation-not-allowed":

      return (
        "Firebase Authentication-এ Email/Password Login চালু নেই।"
      );


    case "permission-denied":

      return (
        "Firebase permission denied করেছে।"
      );


    case "ayna/invalid-name":

      return (
        "আপনার পূর্ণ নাম সঠিকভাবে লিখুন।"
      );


    default:

      return (
        error.message ||
        "Authentication-এর সময় একটি সমস্যা হয়েছে।"
      );

  }

}


// =========================================================
// AUTH MODULE READY
// =========================================================

console.log(
  "AYNA BOOK: auth.js loaded successfully."
);