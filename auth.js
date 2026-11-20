// =========================================================
// AYNA BOOK
// Authentication Controller
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase.js";

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
// AYNA BOOK — CONSTANTS
// =========================================================

const MIN_PASSWORD_LENGTH = 11;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;


// =========================================================
// NORMALIZE BANGLADESH PHONE NUMBER
// =========================================================

export function normalizePhone(phone) {

  if (!phone) {
    throw new Error("মোবাইল নম্বর দিন।");
  }

  let value = String(phone)
    .trim()
    .replace(/[\s\-().]/g, "");

  // 01XXXXXXXXX
  if (/^01\d{9}$/.test(value)) {
    value = "+880" + value.substring(1);
  }

  // 8801XXXXXXXXX
  else if (/^8801\d{9}$/.test(value)) {
    value = "+" + value;
  }

  // +8801XXXXXXXXX
  else if (/^\+8801\d{9}$/.test(value)) {
    // already correct
  }

  else {
    throw new Error(
      "সঠিক বাংলাদেশি মোবাইল নম্বর দিন। উদাহরণ: 017XXXXXXXX"
    );
  }

  return value;
}


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
// AUTH ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(error) {

  const code = error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে। Login করুন।";

    case "auth/invalid-email":
      return "Gmail address সঠিক নয়।";

    case "auth/weak-password":
      return "Password আরও শক্তিশালী দিন। কমপক্ষে ১১ অক্ষর প্রয়োজন।";

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
      return "Firebase Console-এ প্রয়োজনীয় Authentication method চালু করা হয়নি।";

    case "auth/invalid-verification-code":
      return "OTP সঠিক নয়। আবার চেষ্টা করুন।";

    case "auth/code-expired":
      return "OTP-এর সময় শেষ হয়েছে। নতুন OTP পাঠান।";

    case "auth/credential-already-in-use":
      return "এই মোবাইল নম্বর অন্য একটি অ্যাকাউন্টের সঙ্গে যুক্ত আছে।";

    case "auth/provider-already-linked":
      return "এই অ্যাকাউন্টে মোবাইল নম্বর ইতিমধ্যে যুক্ত আছে।";

    case "auth/quota-exceeded":
      return "SMS quota শেষ হয়ে গেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/captcha-check-failed":
      return "reCAPTCHA যাচাই ব্যর্থ হয়েছে। পেজটি Refresh করে আবার চেষ্টা করুন।";

    case "auth/missing-phone-number":
      return "মোবাইল নম্বর দেওয়া হয়নি।";

    case "auth/invalid-phone-number":
      return "মোবাইল নম্বর সঠিক নয়।";

    case "auth/session-expired":
      return "Registration session শেষ হয়েছে। আবার Registration শুরু করুন।";

    case "auth/user-disabled":
      return "এই অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয়।";

    case "auth/requires-recent-login":
      return "নিরাপত্তার জন্য আবার Login করতে হবে।";

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
// SEND SMS OTP
// =========================================================

export async function sendPhoneOtp(
  phone,
  appVerifier
) {

  try {

    if (!auth.currentUser) {
      throw new Error(
        "Registration account পাওয়া যায়নি। আগে Registration শুরু করুন।"
      );
    }

    if (!appVerifier) {
      throw new Error(
        "reCAPTCHA প্রস্তুত হয়নি। পেজটি Refresh করে আবার চেষ্টা করুন।"
      );
    }

    const normalizedPhone =
      normalizePhone(phone);

    const provider =
      new PhoneAuthProvider(auth);

    const phoneInfoOptions = {
      phoneNumber: normalizedPhone,
      session: auth.currentUser
    };

    const verificationId =
      await verifyPhoneNumber(
        provider,
        phoneInfoOptions,
        appVerifier
      );

    return {
      success: true,
      verificationId
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Send OTP Error:",
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
// CREATE INITIAL REGISTRATION ACCOUNT
// =========================================================

export async function createRegistrationAccount({
  name,
  email,
  password
}) {

  try {

    const cleanName =
      String(name || "").trim();

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!cleanName) {
      throw new Error("আপনার নাম দিন।");
    }

    if (cleanName.length < 2) {
      throw new Error("নাম কমপক্ষে ২ অক্ষরের হতে হবে।");
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

    // যদি আগে থেকেই Login করা থাকে
    if (auth.currentUser) {

      return {
        success: true,
        user: auth.currentUser,
        alreadySignedIn: true
      };
    }

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    const user =
      credential.user;

    // Firebase Authentication profile
    await updateProfile(
      user,
      {
        displayName: cleanName
      }
    );

    return {
      success: true,
      user
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Registration Account Error:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        getAuthErrorMessage(error),
      error
    };
  }
}


// =========================================================
// COMPLETE REGISTRATION
// =========================================================

export async function completeRegistration({
  name,
  email,
  phone,
  otp,
  verificationId,
  photoFile
}) {

  try {

    const user =
      auth.currentUser;

    if (!user) {
      throw new Error(
        "Registration session পাওয়া যায়নি। আবার Registration শুরু করুন।"
      );
    }

    const cleanName =
      String(name || "").trim();

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const normalizedPhone =
      normalizePhone(phone);

    const cleanOtp =
      String(otp || "")
        .trim();

    // -----------------------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------------------

    if (!cleanName) {
      throw new Error("নাম দিন।");
    }

    if (!validateGmail(cleanEmail)) {
      throw new Error(
        "সঠিক Gmail address দিন।"
      );
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      throw new Error(
        "৬ সংখ্যার সঠিক OTP দিন।"
      );
    }

    if (!verificationId) {
      throw new Error(
        "OTP verification session পাওয়া যায়নি। নতুন OTP পাঠান।"
      );
    }


    // -----------------------------------------------------
    // VERIFY PHONE OTP
    // -----------------------------------------------------

    const credential =
      PhoneAuthProvider.credential(
        verificationId,
        cleanOtp
      );

    await linkWithCredential(
      user,
      credential
    );


    // -----------------------------------------------------
    // PROFILE PHOTO
    // -----------------------------------------------------

    let photoURL = "";

    if (photoFile) {

      if (!(photoFile instanceof File)) {
        throw new Error(
          "Profile photo সঠিক নয়।"
        );
      }

      if (!photoFile.type.startsWith("image/")) {
        throw new Error(
          "Profile photo অবশ্যই একটি image হতে হবে।"
        );
      }

      if (photoFile.size > MAX_PHOTO_SIZE) {
        throw new Error(
          "Profile photo সর্বোচ্চ 5 MB হতে পারবে।"
        );
      }

      try {

        const photoRef =
          ref(
            storage,
            `users/${user.uid}/profile/profile.jpg`
          );

        await uploadBytes(
          photoRef,
          photoFile,
          {
            contentType: photoFile.type
          }
        );

        photoURL =
          await getDownloadURL(photoRef);

      } catch (photoError) {

        console.error(
          "AYNA BOOK — Profile Photo Upload Error:",
          photoError
        );

        // Registration বন্ধ করা হবে না
        // Storage সমস্যা থাকলেও account সম্পন্ন হবে।
        photoURL = "";
      }
    }


    // -----------------------------------------------------
    // UPDATE AUTH PROFILE
    // -----------------------------------------------------

    await updateProfile(
      user,
      {
        displayName: cleanName,
        photoURL: photoURL || null
      }
    );


    // -----------------------------------------------------
    // SAVE USER DATA TO FIRESTORE
    // -----------------------------------------------------

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );

    await setDoc(
      userRef,
      {
        uid: user.uid,

        name: cleanName,

        displayName: cleanName,

        email: cleanEmail,

        phone: normalizedPhone,

        phoneVerified: true,

        photoURL: photoURL || "",

        plan: "personal",

        accountStatus: "active",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );


    // -----------------------------------------------------
    // SUCCESS
    // -----------------------------------------------------

    return {
      success: true,
      user
    };

  } catch (error) {

    console.error(
      "AYNA BOOK — Complete Registration Error:",
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
// LOGIN
// =========================================================

export async function loginUser(
  email,
  password
) {

  try {

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!validateGmail(cleanEmail)) {
      throw new Error(
        "সঠিক Gmail address দিন।"
      );
    }

    if (!validatePassword(password)) {
      throw new Error(
        "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
      );
    }

    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    return {
      success: true,
      user: credential.user
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

export async function resetPassword(
  email
) {

  try {

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    if (!validateGmail(cleanEmail)) {
      throw new Error(
        "সঠিক Gmail address দিন।"
      );
    }

    await sendPasswordResetEmail(
      auth,
      cleanEmail
    );

    return {
      success: true
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

export function watchAuthState(
  callback
) {

  if (typeof callback !== "function") {
    throw new Error(
      "Auth state callback function প্রয়োজন।"
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
// AUTH MODULE READY
// =========================================================

console.log(
  "AYNA BOOK — Authentication controller loaded successfully."
);