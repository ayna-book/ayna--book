
/* =========================================================
   AYNA BOOK - Secure Authentication
   Firebase SDK 13.4.0
   SMS OTP + Email/Password
   ========================================================= */

import { auth, db, storage } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  PhoneAuthProvider,
  linkWithCredential
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


export function normalizePhone(phone) {
  let value = String(phone || "").replace(/[\s-]/g, "");

  if (/^01[3-9]\d{8}$/.test(value)) {
    value = "+88" + value;
  } else if (/^8801[3-9]\d{8}$/.test(value)) {
    value = "+" + value;
  }

  if (!/^\+8801[3-9]\d{8}$/.test(value)) {
    throw new Error("সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।");
  }

  return value;
}


export function getAuthErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use":
      "এই Gmail দিয়ে অ্যাকাউন্ট আগে থেকেই আছে।",

    "auth/invalid-email":
      "Gmail ঠিকানা সঠিক নয়।",

    "auth/weak-password":
      "পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।",

    "auth/invalid-credential":
      "Gmail অথবা পাসওয়ার্ড সঠিক নয়।",

    "auth/wrong-password":
      "পাসওয়ার্ড সঠিক নয়।",

    "auth/user-not-found":
      "এই Gmail দিয়ে অ্যাকাউন্ট পাওয়া যায়নি।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।",

    "auth/network-request-failed":
      "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

    "auth/operation-not-allowed":
      "Firebase Console-এ প্রয়োজনীয় Sign-in provider চালু করুন।",

    "auth/invalid-phone-number":
      "মোবাইল নম্বর সঠিক নয়।",

    "auth/invalid-verification-code":
      "OTP সঠিক নয়।",

    "auth/code-expired":
      "OTP-এর মেয়াদ শেষ হয়েছে। নতুন OTP নিন।",

    "auth/provider-already-linked":
      "এই অ্যাকাউন্টে ফোন নম্বর আগে থেকেই যুক্ত আছে।",

    "auth/credential-already-in-use":
      "এই ফোন নম্বর অন্য অ্যাকাউন্টে যুক্ত আছে।",

    "permission-denied":
      "Firestore Rules তথ্য সংরক্ষণে বাধা দিয়েছে।"
  };

  return messages[error?.code] ||
    error?.message ||
    "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}


/* ---------- Send SMS OTP ---------- */

export async function sendPhoneOtp(phone, appVerifier) {
  const phoneNumber = normalizePhone(phone);

  try {
    auth.languageCode = "bn";

    const { signInWithPhoneNumber } =
      await import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js");

    return await signInWithPhoneNumber(
      auth,
      phoneNumber,
      appVerifier
    );

  } catch (error) {
    console.error("AYNA SMS OTP Error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
}


/* ---------- Complete Registration ---------- */

export async function completeRegistration({
  name,
  email,
  phone,
  password,
  otp,
  verificationId,
  photoFile
}) {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPhone = normalizePhone(phone);

  if (!cleanName) throw new Error("আপনার নাম লিখুন।");

  if (!cleanEmail) throw new Error("Gmail লিখুন।");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error("সঠিক Gmail/Email লিখুন।");
  }

  if (typeof password !== "string" || password.length < 11) {
    throw new Error("পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।");
  }

  if (!/^\d{6}$/.test(String(otp || ""))) {
    throw new Error("৬ সংখ্যার OTP লিখুন।");
  }

  if (!verificationId) {
    throw new Error("OTP Verification ID পাওয়া যায়নি। নতুন OTP নিন।");
  }

  // Create email account, or sign in to an existing account.
  let user;

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    user = result.user;

  } catch (error) {
    if (error.code !== "auth/email-already-in-use") {
      throw new Error(getAuthErrorMessage(error));
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      user = result.user;

    } catch (loginError) {
      throw new Error(
        "এই Gmail আগে থেকেই আছে। সঠিক পাসওয়ার্ড দিয়ে চেষ্টা করুন।"
      );
    }
  }

  // Create phone credential from the SMS verification code.
  const phoneCredential = PhoneAuthProvider.credential(
    verificationId,
    String(otp)
  );

  // Attach verified phone number to this email account.
  try {
    const linked = await linkWithCredential(
      user,
      phoneCredential
    );

    user = linked.user;

  } catch (error) {
    console.error("Phone linking error:", error);
    throw new Error(getAuthErrorMessage(error));
  }

  let photoURL = "";

  // Profile photo is optional.
  if (photoFile) {
    if (!photoFile.type.startsWith("image/")) {
      throw new Error("শুধু ছবির ফাইল ব্যবহার করুন।");
    }

    if (photoFile.size > 5 * 1024 * 1024) {
      throw new Error("ছবির আকার সর্বোচ্চ ৫ MB হতে পারবে।");
    }

    try {
      const photoRef = ref(
        storage,
        `users/${user.uid}/profile/profile-photo`
      );

      await uploadBytes(photoRef, photoFile);
      photoURL = await getDownloadURL(photoRef);

    } catch (error) {
      console.warn("Profile photo upload failed:", error);
    }
  }

  await updateProfile(user, {
    displayName: cleanName,
    ...(photoURL ? { photoURL } : {})
  });

  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: cleanName,
      displayName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      phoneVerified: true,
      photoURL,
      plan: "personal",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return {
    success: true,
    user,
    message: "AYNA BOOK Registration সফল হয়েছে।"
  };
}


/* ---------- Login: Gmail + Password ---------- */

export async function loginUser(email, password) {
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error("Gmail ও পাসওয়ার্ড লিখুন।");
    }

    if (password.length < 11) {
      throw new Error("পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।");
    }

    const result = await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {
    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


/* ---------- Forgot Password ---------- */

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(
      auth,
      String(email || "").trim().toLowerCase()
    );

    return {
      success: true,
      message: "Password Reset Email পাঠানো হয়েছে।"
    };

  } catch (error) {
    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


/* ---------- Logout / Auth State ---------- */

export async function logoutUser() {
  await signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

console.log("AYNA BOOK Secure Authentication Loaded.");
