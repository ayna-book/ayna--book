
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
      "Firestore-এর অনুমতি পরীক্ষা করুন।",

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
   SAVE OR UPDATE USER PROFILE
   ========================================================= */

async function saveUserProfile(user, extraData = {}) {
  if (!user) {
    throw new Error("ব্যবহারকারীর তথ্য পাওয়া যায়নি।");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: user.displayName || "",
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      status: "active",
      updatedAt: serverTimestamp(),
      ...extraData
    },
    { merge: true }
  );
}


/* =========================================================
   REGISTER USER
   ========================================================= */

export async function registerUser(name, email, password) {
  let accountCreated = false;

  try {
    name = String(name || "").trim();
    email = String(email || "").trim().toLowerCase();

    if (!name || !email || !password) {
      throw new Error("নাম, ইমেইল ও পাসওয়ার্ড পূরণ করুন।");
    }

    if (name.length < 2 || name.length > 60) {
      throw new Error("নাম ২ থেকে ৬০ অক্ষরের মধ্যে হতে হবে।");
    }

    if (password.length < 6) {
      throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
    }

    // Create Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;
    accountCreated = true;

    // Save user's display name
    await updateProfile(user, {
      displayName: name
    });

    // Save profile in Firestore
    await saveUserProfile(user, {
      name,
      displayName: name,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    const message = "AYNA BOOK অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।";

    showMessage(message, "success");

    return {
      success: true,
      accountCreated: true,
      profileSaved: true,
      user,
      message
    };

  } catch (error) {
    console.error("AYNA BOOK Registration Error:", error);

    // Authentication account may already exist even if
    // the Firestore profile save failed.
    if (accountCreated) {
      const message =
        "আপনার অ্যাকাউন্ট তৈরি হয়েছে, তবে প্রোফাইল সংরক্ষণে সমস্যা হয়েছে। আবার লগইন করে চেষ্টা করুন।";

      showMessage(message, "warning");

      return {
        success: true,
        accountCreated: true,
        profileSaved: false,
        user: auth.currentUser,
        message,
        error
      };
    }

    const message = getAuthErrorMessage(error);
    showMessage(message, "error");

    return {
      success: false,
      accountCreated: false,
      profileSaved: false,
      user: null,
      message,
      error
    };
  }
}


/* =========================================================
   LOGIN USER
   ========================================================= */

export async function loginUser(email, password) {
  try {
    email = String(email || "").trim().toLowerCase();

    if (!email || !password) {
      throw new Error("ইমেইল ও পাসওয়ার্ড লিখুন।");
    }

    // Firebase login
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    // Login should remain successful even if the
    // Firestore profile update fails.
    try {
      await saveUserProfile(user, {
        lastLoginAt: serverTimestamp()
      });
    } catch (profileError) {
      console.error("AYNA BOOK Profile Update Error:", profileError);
    }

    const message = "AYNA BOOK-এ সফলভাবে লগইন হয়েছে।";

    showMessage(message, "success");

    return {
      success: true,
      user,
      message
    };

  } catch (error) {
    console.error("AYNA BOOK Login Error:", error);

    const message = getAuthErrorMessage(error);
    showMessage(message, "error");

    return {
      success: false,
      user: null,
      message,
      error
    };
  }
}


/* =========================================================
   PASSWORD RESET
   ========================================================= */

export async function resetPassword(email) {
  try {
    email = String(email || "").trim().toLowerCase();

    if (!email) {
      throw new Error("আপনার ইমেইল ঠিকানা লিখুন।");
    }

    await sendPasswordResetEmail(auth, email);

    const message =
      "পাসওয়ার্ড পরিবর্তনের নির্দেশনা আপনার ইমেইলে পাঠানো হয়েছে।";

    showMessage(message, "success");

    return {
      success: true,
      message
    };

  } catch (error) {
    console.error("AYNA BOOK Password Reset Error:", error);

    const message = getAuthErrorMessage(error);
    showMessage(message, "error");

    return {
      success: false,
      message,
      error
    };
  }
}


/* =========================================================
   LOGOUT USER
   ========================================================= */

export async function logoutUser() {
  try {
    await signOut(auth);

    const message = "AYNA BOOK থেকে সফলভাবে লগআউট হয়েছে।";

    showMessage(message, "success");

    return {
      success: true,
      message
    };

  } catch (error) {
    console.error("AYNA BOOK Logout Error:", error);

    const message = getAuthErrorMessage(error);
    showMessage(message, "error");

    return {
      success: false,
      message,
      error
    };
  }
}


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (typeof callback === "function") {
      callback(user);
    }
  });
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

console.log("AYNA BOOK Authentication System Loaded");
