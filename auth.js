
// =========================================================
// AYNA BOOK
// AUTHENTICATION CONTROLLER
// Firebase SDK: 13.4.0
// Personal Free + Gmail Verification
// =========================================================

import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// =========================================================
// CONSTANTS
// =========================================================

const MIN_PASSWORD_LENGTH = 11;


// =========================================================
// GMAIL VALIDATION
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

  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH
  );
}


// =========================================================
// BANGLADESH PHONE NORMALIZATION
// =========================================================

export function normalizePhone(phone) {

  if (!phone) {
    throw new Error("মোবাইল নম্বর দিন।");
  }

  let value = String(phone)
    .trim()
    .replace(/[\s\-().]/g, "");

  if (/^01\d{9}$/.test(value)) {
    return "+880" + value.substring(1);
  }

  if (/^8801\d{9}$/.test(value)) {
    return "+" + value;
  }

  if (/^\+8801\d{9}$/.test(value)) {
    return value;
  }

  throw new Error(
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন। উদাহরণ: 017XXXXXXXX"
  );
}


// =========================================================
// AUTH ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(error) {

  const code = error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে। Login করুন।";

    case "auth/invalid-email":
      return "Gmail address সঠিক নয়।";

    case "auth/weak-password":
      return "Password কমপক্ষে ১১ অক্ষরের হতে হবে।";

    case "auth/user-not-found":
      return "এই Gmail দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";

    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Gmail অথবা Password সঠিক নয়।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    case "auth/operation-not-allowed":
      return "Firebase Console-এ Email/Password Authentication চালু করুন।";

    case "auth/user-disabled":
      return "এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয়।";

    case "auth/requires-recent-login":
      return "নিরাপত্তার জন্য আবার Login করতে হবে।";

    case "auth/invalid-action-code":
      return "Verification Link সঠিক নয় অথবা মেয়াদ শেষ হয়েছে।";

    case "auth/expired-action-code":
      return "Verification Link-এর মেয়াদ শেষ হয়েছে। নতুন Email পাঠান।";

    case "auth/missing-email":
      return "Gmail address দিন।";

    case "auth/quota-exceeded":
      return "Firebase Email quota অতিক্রম হয়েছে। পরে চেষ্টা করুন।";

    default:

      console.error(
        "AYNA BOOK — Firebase Auth Error:",
        error
      );

      return (
        error?.message ||
        "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
  }
}


// =========================================================
// CREATE REGISTRATION ACCOUNT
// =========================================================

export async function createRegistrationAccount({
  name,
  email,
  password
}) {

  try {

    const cleanName = String(name || "").trim();

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (auth.currentUser) {
      throw new Error(
        "নতুন Registration করার আগে বর্তমান Account থেকে Logout করুন।"
      );
    }

    if (cleanName.length < 2) {
      throw new Error(
        "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"
      );
    }

    if (cleanName.length > 100) {
      throw new Error("নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারবে।");
    }

    if (!validateGmail(cleanEmail)) {
      throw new Error(
        "শুধু সঠিক Gmail address ব্যবহার করুন।"
      );
    }

    if (!validatePassword(password)) {
      throw new Error(
        "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
      );
    }

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user = credential.user;

    // Firebase Auth Profile Name
    await updateProfile(user, {
      displayName: cleanName
    });

    return {
      success: true,
      user
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Registration Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// SEND GMAIL VERIFICATION
// =========================================================

export async function sendVerificationEmail(
  user = auth.currentUser
) {

  try {

    if (!user) {
      throw new Error(
        "Verification Email পাঠানোর জন্য Login Session প্রয়োজন।"
      );
    }

    await user.reload();

    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Login Session পাওয়া যায়নি।");
    }

    if (currentUser.emailVerified) {
      return {
        success: true,
        alreadyVerified: true
      };
    }

    await sendEmailVerification(currentUser);

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Verification Email Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// CHECK EMAIL VERIFICATION
// =========================================================

export async function checkEmailVerification() {

  try {

    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        verified: false,
        message: "Login Session পাওয়া যায়নি।"
      };
    }

    await user.reload();

    const refreshedUser = auth.currentUser;

    const verified = !!refreshedUser?.emailVerified;

    return {
      success: true,
      verified,
      user: refreshedUser,
      message: verified
        ? "Gmail Verified হয়েছে।"
        : "আপনার Gmail এখনো Verify করা হয়নি।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Verification Check Error:",
      error
    );

    return {
      success: false,
      verified: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(email, password) {

  try {

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!validateGmail(cleanEmail)) {
      return {
        success: false,
        message: "সঠিক Gmail address দিন।"
      };
    }

    if (!validatePassword(password)) {
      return {
        success: false,
        message: "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
      };
    }

    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user = credential.user;

    await user.reload();

    const currentUser = auth.currentUser;

    if (!currentUser?.emailVerified) {

      await signOut(auth);

      return {
        success: false,
        emailVerified: false,
        message:
          "আপনার Gmail এখনো Verify করা হয়নি। Gmail Inbox অথবা Spam Folder পরীক্ষা করুন।"
      };
    }

    return {
      success: true,
      emailVerified: true,
      user: currentUser
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Login Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(email) {

  try {

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!validateGmail(cleanEmail)) {
      return {
        success: false,
        message: "সঠিক Gmail address দিন।"
      };
    }

    await sendPasswordResetEmail(
      auth,
      cleanEmail
    );

    return {
      success: true,
      message:
        "Password Reset Link আপনার Gmail-এ পাঠানো হয়েছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Password Reset Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {

  try {

    await signOut(auth);

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Logout Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// AUTH STATE LISTENER
// =========================================================

export function watchAuthState(callback) {

  if (typeof callback !== "function") {
    throw new Error(
      "Auth State Callback Function প্রয়োজন।"
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
  return auth.currentUser || null;
}


// =========================================================
// IS LOGGED IN
// =========================================================

export function isLoggedIn() {
  return !!auth.currentUser;
}


// =========================================================
// IS EMAIL VERIFIED
// =========================================================

export function isEmailVerified() {
  return !!(
    auth.currentUser &&
    auth.currentUser.emailVerified
  );
}


// =========================================================
// AUTH MODULE READY
// =========================================================

console.log(
  "AYNA BOOK — Authentication Controller Loaded."
);

console.log(
  "AYNA BOOK — Firebase SDK 13.4.0."
);

console.log(
  "AYNA BOOK — Gmail Verification Mode Active."
);
