// =========================================================
// AYNA BOOK
// Authentication System
// Firebase SDK: 13.4.0
// =========================================================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// Error Message
// =========================================================

export function getAuthErrorMessage(error) {

  const code = error?.code || "";

  const messages = {
    "auth/email-already-in-use":
      "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।",

    "auth/invalid-email":
      "ইমেইল ঠিকানাটি সঠিক নয়।",

    "auth/weak-password":
      "পাসওয়ার্ড আরও শক্তিশালী দিন।",

    "auth/invalid-credential":
      "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",

    "auth/user-not-found":
      "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",

    "auth/wrong-password":
      "পাসওয়ার্ড সঠিক নয়।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

    "auth/network-request-failed":
      "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

    "auth/user-disabled":
      "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।"
  };

  return messages[code] || error?.message || "একটি সমস্যা হয়েছে।";
}


// =========================================================
// Save User Profile
// =========================================================

export async function saveUserProfile(user, extraData = {}) {

  if (!user?.uid) {
    throw new Error("ব্যবহারকারীর তথ্য পাওয়া যায়নি।");
  }

  const userRef = doc(db, "users", user.uid);

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email || "",
      displayName:
        extraData.displayName ||
        user.displayName ||
        "",

      ...extraData,

      updatedAt: serverTimestamp()
    },
    {
      merge: true
    }
  );

  return true;
}


// =========================================================
// Register User
// =========================================================

export async function registerUser(
  name,
  email,
  password,
  extraData = {}
) {

  let accountCreated = false;

  try {

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanName) {
      throw new Error("আপনার নাম লিখুন।");
    }

    if (!cleanEmail) {
      throw new Error("আপনার ইমেইল লিখুন।");
    }

    if (!cleanPassword) {
      throw new Error("আপনার পাসওয়ার্ড লিখুন।");
    }

    if (cleanPassword.length < 6) {
      throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
    }


    // -----------------------------------------------------
    // Create Firebase Authentication Account
    // -----------------------------------------------------

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

    const user = credential.user;

    accountCreated = true;


    // -----------------------------------------------------
    // Save User Profile in Firestore
    // -----------------------------------------------------

    try {

      await saveUserProfile(
        user,
        {
          displayName: cleanName,
          name: cleanName,
          ...extraData
        }
      );

      return {
        success: true,
        accountCreated: true,
        profileSaved: true,
        user,
        message: "AYNA BOOK অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।"
      };

    } catch (profileError) {

      console.error(
        "AYNA BOOK Profile Save Error:",
        profileError
      );

      return {
        success: true,
        accountCreated: true,
        profileSaved: false,
        user,
        message:
          "অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু প্রোফাইল তথ্য সংরক্ষণ করা যায়নি। পরে আবার চেষ্টা করুন।"
      };
    }

  } catch (error) {

    console.error(
      "AYNA BOOK Registration Error:",
      error
    );

    return {
      success: false,
      accountCreated,
      profileSaved: false,
      user: null,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// Login User
// =========================================================

export async function loginUser(email, password) {

  try {

    const cleanEmail =
      String(email || "").trim().toLowerCase();

    const cleanPassword =
      String(password || "");

    if (!cleanEmail) {
      throw new Error("আপনার ইমেইল লিখুন।");
    }

    if (!cleanPassword) {
      throw new Error("আপনার পাসওয়ার্ড লিখুন।");
    }


    // -----------------------------------------------------
    // Firebase Login
    // -----------------------------------------------------

    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );

    const user = credential.user;


    // -----------------------------------------------------
    // Update Last Login
    // -----------------------------------------------------

    try {

      const userRef =
        doc(db, "users", user.uid);

      await updateDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp()
        }
      );

    } catch (profileError) {

      // Login should remain successful even if
      // the optional Firestore update fails.

      console.warn(
        "AYNA BOOK Last Login Update Warning:",
        profileError
      );
    }


    return {
      success: true,
      user,
      message: "লগইন সফল হয়েছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Login Error:",
      error
    );

    return {
      success: false,
      user: null,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// Password Reset
// =========================================================

export async function resetPassword(email) {

  try {

    const cleanEmail =
      String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("আপনার ইমেইল লিখুন।");
    }

    await sendPasswordResetEmail(
      auth,
      cleanEmail
    );

    return {
      success: true,
      message:
        "পাসওয়ার্ড পরিবর্তনের জন্য আপনার ইমেইলে একটি লিংক পাঠানো হয়েছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Password Reset Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// Logout
// =========================================================

export async function logoutUser() {

  try {

    await signOut(auth);

    return {
      success: true,
      message: "লগআউট সফল হয়েছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Logout Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// Authentication State
// =========================================================

export function watchAuthState(callback) {

  return onAuthStateChanged(
    auth,
    (user) => {

      try {

        callback(user);

      } catch (error) {

        console.error(
          "AYNA BOOK Auth State Callback Error:",
          error
        );
      }
    }
  );
}


// =========================================================
// Get Current User
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;
}


// =========================================================
// Check Login Status
// =========================================================

export function isUserLoggedIn() {

  return !!auth.currentUser;
}


// =========================================================
// AYNA BOOK Auth Ready
// =========================================================

console.log(
  "AYNA BOOK — Authentication System Loaded Successfully."
);