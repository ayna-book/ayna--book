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

    case "auth/operation-not-allowed":
      return "Firebase Console-এ প্রয়োজনীয় Authentication provider চালু করা হয়নি।";

    default:
      console.error("Firebase Auth Error:", error);
      return "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।";
  }
}


// =========================================================
// 3. Send SMS OTP
// =========================================================

export async function sendPhoneOtp(phone, appVerifier) {

  const normalizedPhone = normalizePhone(phone);

  if (!appVerifier) {
    throw new Error("reCAPTCHA verification পাওয়া যায়নি।");
  }

  try {

    // -----------------------------------------------------
    // Current logged-in user is required for linking phone.
    // Registration flow creates the email account first.
    // -----------------------------------------------------

    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "OTP পাঠানোর আগে Registration account তৈরি করতে হবে।"
      );
    }

    const provider = new PhoneAuthProvider(auth);

    const phoneInfoOptions = {
      phoneNumber: normalizedPhone,
      session: currentUser
    };

    const verificationId = await verifyPhoneNumber(
      provider,
      phoneInfoOptions,
      appVerifier
    );

    return {
      success: true,
      verificationId
    };

  } catch (error) {

    console.error("SMS OTP Error:", error);

    throw new Error(getAuthErrorMessage(error));
  }
}


// =========================================================
// 4. Create Registration Account
// =========================================================

export async function createRegistrationAccount({
  name,
  email,
  password
}) {

  name = String(name || "").trim();
  email = String(email || "").trim().toLowerCase();

  if (!name) {
    throw new Error("নাম দিন।");
  }

  if (!email) {
    throw new Error("Gmail দিন।");
  }

  if (!password || password.length < 11) {
    throw new Error(
      "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
    );
  }

  try {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    console.error(
      "Registration Account Error:",
      error
    );

    throw new Error(getAuthErrorMessage(error));
  }
}


// =========================================================
// 5. Complete Registration with SMS OTP
// =========================================================

export async function completeRegistration({
  name,
  email,
  phone,
  otp,
  verificationId,
  photoFile
}) {

  name = String(name || "").trim();
  email = String(email || "").trim().toLowerCase();
  otp = String(otp || "").trim();

  const normalizedPhone = normalizePhone(phone);

  if (!name) {
    throw new Error("নাম দিন।");
  }

  if (!email) {
    throw new Error("Gmail দিন।");
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new Error("৬ সংখ্যার OTP দিন।");
  }

  if (!verificationId) {
    throw new Error("OTP verification information পাওয়া যায়নি।");
  }

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Registration session পাওয়া যায়নি। আবার Registration করুন।"
    );
  }

  try {

    // -----------------------------------------------------
    // Verify SMS OTP
    // -----------------------------------------------------

    const credential =
      PhoneAuthProvider.credential(
        verificationId,
        otp
      );

    // -----------------------------------------------------
    // Link verified phone with current email account
    // -----------------------------------------------------

    const linkedResult =
      await linkWithCredential(
        user,
        credential
      );

    const registeredUser = linkedResult.user;

    // -----------------------------------------------------
    // Profile Photo
    // -----------------------------------------------------

    let photoURL = "";

    if (photoFile) {

      if (!photoFile.type.startsWith("image/")) {
        throw new Error(
          "Profile Photo অবশ্যই একটি image হতে হবে।"
        );
      }

      if (photoFile.size > 5 * 1024 * 1024) {
        throw new Error(
          "Profile Photo সর্বোচ্চ 5 MB হতে পারবে।"
        );
      }

      const photoRef = ref(
        storage,
        `users/${registeredUser.uid}/profile/profile.jpg`
      );

      await uploadBytes(
        photoRef,
        photoFile,
        {
          contentType: photoFile.type
        }
      );

      photoURL = await getDownloadURL(photoRef);
    }

    // -----------------------------------------------------
    // Firebase Auth Profile
    // -----------------------------------------------------

    await updateProfile(
      registeredUser,
      {
        displayName: name,
        photoURL: photoURL || null
      }
    );

    // -----------------------------------------------------
    // Firestore User Document
    // -----------------------------------------------------

    await setDoc(
      doc(db, "users", registeredUser.uid),
      {
        uid: registeredUser.uid,

        name: name,

        displayName: name,

        email: email,

        phone: normalizedPhone,

        phoneVerified: true,

        photoURL: photoURL,

        plan: "personal",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

    return {
      success: true,
      user: registeredUser
    };

  } catch (error) {

    console.error(
      "Complete Registration Error:",
      error
    );

    throw new Error(
      getAuthErrorMessage(error)
    );
  }
}


// =========================================================
// 6. Login
// =========================================================

export async function loginUser(
  email,
  password
) {

  email = String(email || "").trim().toLowerCase();

  if (!email) {
    return {
      success: false,
      message: "Gmail দিন।"
    };
  }

  if (!password) {
    return {
      success: false,
      message: "Password দিন।"
    };
  }

  try {

    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// 7. Forgot Password
// =========================================================

export async function resetPassword(email) {

  email = String(email || "").trim().toLowerCase();

  if (!email) {
    throw new Error("Gmail দিন।");
  }

  try {

    await sendPasswordResetEmail(
      auth,
      email
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "Password Reset Error:",
      error
    );

    throw new Error(
      getAuthErrorMessage(error)
    );
  }
}


// =========================================================
// 8. Logout
// =========================================================

export async function logoutUser() {

  try {

    await signOut(auth);

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "Logout Error:",
      error
    );

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


// =========================================================
// 9. Authentication State
// =========================================================

export function watchAuthState(callback) {

  return onAuthStateChanged(
    auth,
    callback
  );
}


// =========================================================
// 10. Current User
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;
}


// =========================================================
// AYNA BOOK AUTH READY
// =========================================================

console.log(
  "AYNA BOOK — Authentication module loaded."
);