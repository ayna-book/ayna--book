/* =========================================================
   AYNA BOOK — AUTHENTICATION SYSTEM
   Firebase Authentication + Cloud Firestore
   Firebase SDK: 13.4.0
   ========================================================= */

import { auth, db } from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


/* =========================================================
   MESSAGE HELPER
   ========================================================= */

function showMessage(message, type = "info") {
  console.log(`[AYNA AUTH - ${type}] ${message}`);

  const element =
    document.getElementById("auth-message") ||
    document.getElementById("message") ||
    document.getElementById("error-message");

  if (element) {
    element.textContent = message;
    element.dataset.type = type;
  }
}


/* =========================================================
   FIREBASE ERROR MESSAGE
   ========================================================= */

export function getAuthErrorMessage(error) {

  const messages = {

    "auth/email-already-in-use":
      "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।",

    "auth/invalid-email":
      "সঠিক ইমেইল ঠিকানা লিখুন।",

    "auth/weak-password":
      "পাসওয়ার্ড আরও শক্তিশালী করুন।",

    "auth/user-not-found":
      "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",

    "auth/wrong-password":
      "পাসওয়ার্ড সঠিক নয়।",

    "auth/invalid-credential":
      "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

    "auth/network-request-failed":
      "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

    "auth/operation-not-allowed":
      "Firebase Console-এ Email/Password Authentication চালু করুন।",

    "auth/user-disabled":
      "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।",

    "auth/requires-recent-login":
      "এই কাজটি করতে আবার লগইন করতে হবে।",

    "permission-denied":
      "Firebase Firestore-এর অনুমতি পরীক্ষা করুন।",

    "failed-precondition":
      "Firebase-এর প্রয়োজনীয় সেটিং সম্পূর্ণ করা হয়নি।"
  };

  return (
    messages[error?.code] ||
    error?.message ||
    "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
  );
}


/* =========================================================
   REGISTER USER
   ========================================================= */

export async function registerUser(name, email, password) {

  try {

    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();

    if (!name || !email || !password) {
      throw new Error(
        "নাম, ইমেইল ও পাসওয়ার্ড পূরণ করুন।"
      );
    }

    if (name.length < 2 || name.length > 60) {
      throw new Error(
        "নাম ২ থেকে ৬০ অক্ষরের মধ্যে হতে হবে।"
      );
    }

    if (password.length < 6) {
      throw new Error(
        "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
      );
    }


    /* Create Firebase Authentication account */

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = credential.user;


    /* Save display name */

    await updateProfile(user, {
      displayName: name
    });


    /* Save user profile in Firestore */

    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name: name,
        displayName: name,
        email: user.email,
        photoURL: user.photoURL || "",

        status: "active",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
    );


    const message =
      "AYNA BOOK অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।";

    showMessage(message, "success");


    return {
      success: true,
      user: user,
      message: message
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Registration Error:",
      error
    );

    const message =
      getAuthErrorMessage(error);

    showMessage(message, "error");

    return {
      success: false,
      user: null,
      message: message,
      error: error
    };
  }
}


/* =========================================================
   LOGIN USER
   ========================================================= */

export async function loginUser(email, password) {

  try {

    email = String(email || "")
      .trim()
      .toLowerCase();

    if (!email || !password) {
      throw new Error(
        "ইমেইল ও পাসওয়ার্ড লিখুন।"
      );
    }


    /* Firebase login */

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = credential.user;


    /* Update last login */

    await setDoc(
      doc(db, "users", user.uid),
      {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active"
      },
      {
        merge: true
      }
    );


    const message =
      "AYNA BOOK-এ সফলভাবে লগইন হয়েছে।";

    showMessage(message, "success");


    return {
      success: true,
      user: user,
      message: message
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Login Error:",
      error
    );

    const message =
      getAuthErrorMessage(error);

    showMessage(message, "error");

    return {
      success: false,
      user: null,
      message: message,
      error: error
    };
  }
}


/* =========================================================
   PASSWORD RESET
   ========================================================= */

export async function resetPassword(email) {

  try {

    email = String(email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      throw new Error(
        "আপনার ইমেইল ঠিকানা লিখুন।"
      );
    }


    await sendPasswordResetEmail(
      auth,
      email
    );


    const message =
      "পাসওয়ার্ড পরিবর্তনের লিংক আপনার ইমেইলে পাঠানো হয়েছে।";

    showMessage(message, "success");


    return {
      success: true,
      message: message
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Password Reset Error:",
      error
    );

    const message =
      getAuthErrorMessage(error);

    showMessage(message, "error");

    return {
      success: false,
      message: message,
      error: error
    };
  }
}


/* =========================================================
   LOGOUT USER
   ========================================================= */

export async function logoutUser() {

  try {

    await signOut(auth);

    const message =
      "AYNA BOOK থেকে সফলভাবে লগআউট হয়েছে।";

    showMessage(message, "success");


    return {
      success: true,
      message: message
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Logout Error:",
      error
    );

    const message =
      getAuthErrorMessage(error);

    showMessage(message, "error");

    return {
      success: false,
      message: message,
      error: error
    };
  }
}


/* =========================================================
   AUTH STATE LISTENER
   =========================================================
   Firebase authentication loading শেষ হওয়ার পরে
   user আছে কি না তা নির্ভরযোগ্যভাবে জানা যাবে।
   ========================================================= */

export function watchAuthState(callback) {

  return onAuthStateChanged(
    auth,
    (user) => {

      if (typeof callback === "function") {
        callback(user);
      }

    }
  );
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

export function getCurrentUser() {
  return auth.currentUser;
}


/* =========================================================
   CHECK LOGIN STATUS
   ========================================================= */

export function isUserLoggedIn() {
  return Boolean(auth.currentUser);
}


/* =========================================================
   AUTH SYSTEM READY
   ========================================================= */

console.log(
  "AYNA BOOK Authentication System Loaded"
);