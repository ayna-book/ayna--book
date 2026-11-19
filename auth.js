/* =========================================================
   AYNA BOOK
   Authentication & Registration Controller
   Firebase SDK: 13.4.0
   ========================================================= */

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


/* =========================================================
   CONSTANTS
   ========================================================= */

const MIN_PASSWORD_LENGTH = 11;

const MAX_PROFILE_PHOTO_SIZE =
  5 * 1024 * 1024;


/* =========================================================
   PHONE NUMBER NORMALIZER
   Bangladesh:
   01XXXXXXXXX
   +8801XXXXXXXXX
   8801XXXXXXXXX
   ========================================================= */

export function normalizePhone(phone) {

  if (!phone) {
    throw new Error(
      "মোবাইল নম্বর দিন।"
    );
  }


  let value =
    String(phone)
      .trim()
      .replace(/[\s\-().]/g, "");


  /* +8801XXXXXXXXX */

  if (value.startsWith("+8801")) {

    if (!/^(\+8801)\d{9}$/.test(value)) {

      throw new Error(
        "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
      );
    }

    return value;
  }


  /* 8801XXXXXXXXX */

  if (value.startsWith("8801")) {

    if (!/^8801\d{9}$/.test(value)) {

      throw new Error(
        "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
      );
    }

    return "+" + value;
  }


  /* 01XXXXXXXXX */

  if (/^01\d{9}$/.test(value)) {

    return "+880" + value.substring(1);
  }


  throw new Error(
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।"
  );
}


/* =========================================================
   EMAIL VALIDATION
   AYNA BOOK Registration-এর জন্য Gmail
   ========================================================= */

function validateGmail(email) {

  const value =
    String(email || "")
      .trim()
      .toLowerCase();


  if (!value) {

    throw new Error(
      "Gmail address দিন।"
    );
  }


  if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(value)) {

    throw new Error(
      "AYNA BOOK Registration-এর জন্য একটি valid Gmail address দিন।"
    );
  }


  return value;
}


/* =========================================================
   PASSWORD VALIDATION
   ========================================================= */

function validatePassword(password) {

  if (!password) {

    throw new Error(
      "Password দিন।"
    );
  }


  if (password.length < MIN_PASSWORD_LENGTH) {

    throw new Error(
      "Password কমপক্ষে ১১ অক্ষরের হতে হবে।"
    );
  }


  return password;
}


/* =========================================================
   AUTH ERROR MESSAGE
   ========================================================= */

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


    case "auth/user-not-found":
      return "এই Gmail দিয়ে কোনো account পাওয়া যায়নি।";


    case "auth/wrong-password":
      return "Password সঠিক নয়।";


    case "auth/invalid-credential":
      return "Gmail অথবা Password সঠিক নয়।";


    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";


    case "auth/network-request-failed":
      return "Internet connection পরীক্ষা করুন।";


    case "auth/operation-not-allowed":
      return "Firebase Console-এ প্রয়োজনীয় Authentication method চালু করা হয়নি।";


    case "auth/quota-exceeded":
      return "এই মুহূর্তে Firebase quota সীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।";


    case "auth/captcha-check-failed":
      return "reCAPTCHA যাচাই ব্যর্থ হয়েছে। আবার চেষ্টা করুন।";


    case "auth/invalid-phone-number":
      return "মোবাইল নম্বর সঠিক নয়।";


    case "auth/missing-phone-number":
      return "মোবাইল নম্বর দিন।";


    case "auth/quota-exceeded":
      return "SMS quota সীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।";


    case "auth/code-expired":
      return "OTP-এর মেয়াদ শেষ হয়েছে। নতুন OTP নিন।";


    case "auth/invalid-verification-code":
      return "OTP সঠিক নয়। আবার চেষ্টা করুন।";


    case "auth/credential-already-in-use":
      return "এই মোবাইল নম্বর অন্য একটি account-এর সঙ্গে যুক্ত আছে।";


    case "auth/provider-already-linked":
      return "এই account-এর সঙ্গে একটি phone number ইতিমধ্যে যুক্ত আছে।";


    case "auth/requires-recent-login":
      return "নিরাপত্তার কারণে আবার Login করতে হবে।";


    case "storage/unauthorized":
      return "Profile photo upload করার অনুমতি নেই।";


    case "storage/quota-exceeded":
      return "Storage quota সীমা অতিক্রম করেছে।";


    case "storage/canceled":
      return "Photo upload বাতিল হয়েছে।";


    default:

      if (error?.message) {
        return error.message;
      }

      return "একটি অজানা সমস্যা হয়েছে। আবার চেষ্টা করুন।";
  }
}


/* =========================================================
   SEND PHONE OTP
   Current authenticated user-এর phone link করার জন্য
   ========================================================= */

export async function sendPhoneOtp(
  phone,
  appVerifier
) {

  try {

    const user =
      auth.currentUser;


    if (!user) {

      return {
        success: false,
        message:
          "Registration account session পাওয়া যায়নি।"
      };
    }


    if (!appVerifier) {

      return {
        success: false,
        message:
          "reCAPTCHA verification পাওয়া যায়নি।"
      };
    }


    const normalizedPhone =
      normalizePhone(phone);


    const provider =
      new PhoneAuthProvider(auth);


    const phoneInfoOptions = {

      phoneNumber:
        normalizedPhone,

      session:
        user

    };


    const verificationId =
      await verifyPhoneNumber(
        provider,
        phoneInfoOptions,
        appVerifier
      );


    return {

      success: true,

      verificationId:
        verificationId,

      phone:
        normalizedPhone

    };


  } catch (error) {

    console.error(
      "AYNA BOOK — Send OTP Error:",
      error
    );


    return {

      success: false,

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   CREATE EMAIL/PASSWORD REGISTRATION ACCOUNT
   ========================================================= */

export async function createRegistrationAccount({
  name,
  email,
  password
}) {

  try {

    const cleanName =
      String(name || "").trim();


    const cleanEmail =
      validateGmail(email);


    const cleanPassword =
      validatePassword(password);


    if (!cleanName) {

      return {
        success: false,
        message: "আপনার নাম দিন।"
      };
    }


    if (cleanName.length > 80) {

      return {
        success: false,
        message: "নাম সর্বোচ্চ ৮০ অক্ষরের হতে পারে।"
      };
    }


    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanPassword
      );


    const user =
      credential.user;


    /*
     * Temporary display name
     * পরে completeRegistration()
     * থেকে final profile update হবে।
     */

    await updateProfile(
      user,
      {
        displayName:
          cleanName
      }
    );


    return {

      success: true,

      user:

        user

    };


  } catch (error) {

    console.error(
      "AYNA BOOK — Create Account Error:",
      error
    );


    return {

      success: false,

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   COMPLETE REGISTRATION
   OTP verify + Phone link + Profile + Firestore
   ========================================================= */

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

      return {

        success: false,

        message:
          "Registration session পাওয়া যায়নি। আবার শুরু করুন।"

      };
    }


    const cleanName =
      String(name || "").trim();


    const cleanEmail =
      validateGmail(email);


    const normalizedPhone =
      normalizePhone(phone);


    if (!cleanName) {

      return {

        success: false,

        message:
          "নাম দেওয়া হয়নি।"

      };
    }


    if (!verificationId) {

      return {

        success: false,

        message:
          "OTP verification session পাওয়া যায়নি।"

      };
    }


    if (!/^\d{6}$/.test(String(otp || ""))) {

      return {

        success: false,

        message:
          "৬ সংখ্যার OTP দিন।"

      };
    }


    /* ===================================================
       OTP CREDENTIAL
       =================================================== */

    const credential =
      PhoneAuthProvider.credential(
        verificationId,
        String(otp)
      );


    /* ===================================================
       LINK PHONE TO CURRENT ACCOUNT
       =================================================== */

    const linkedResult =
      await linkWithCredential(
        user,
        credential
      );


    const verifiedUser =
      linkedResult.user;


    /* ===================================================
       PROFILE PHOTO
       =================================================== */

    let photoURL =
      verifiedUser.photoURL || "";


    if (photoFile) {

      if (!photoFile.type.startsWith("image/")) {

        return {

          success: false,

          message:
            "Profile Photo হিসেবে শুধু image file ব্যবহার করুন।"

        };
      }


      if (
        photoFile.size >
        MAX_PROFILE_PHOTO_SIZE
      ) {

        return {

          success: false,

          message:
            "Profile Photo সর্বোচ্চ 5 MB হতে পারবে।"

        };
      }


      try {

        const photoRef =
          ref(
            storage,
            `users/${verifiedUser.uid}/profile/profile.jpg`
          );


        await uploadBytes(
          photoRef,
          photoFile,
          {
            contentType:
              photoFile.type,

            cacheControl:
              "public,max-age=3600"
          }
        );


        photoURL =
          await getDownloadURL(
            photoRef
          );


      } catch (photoError) {

        /*
         * Photo upload ব্যর্থ হলেও
         * verified account নষ্ট করা হবে না।
         */

        console.error(
          "AYNA BOOK — Profile Photo Error:",
          photoError
        );

        photoURL = "";
      }
    }


    /* ===================================================
       FIREBASE AUTH PROFILE
       =================================================== */

    await updateProfile(
      verifiedUser,
      {

        displayName:
          cleanName,

        photoURL:
          photoURL || null

      }
    );


    /* ===================================================
       FIRESTORE USER DOCUMENT
       =================================================== */

    const userRef =
      doc(
        db,
        "users",
        verifiedUser.uid
      );


    await setDoc(
      userRef,
      {

        uid:
          verifiedUser.uid,

        name:
          cleanName,

        displayName:
          cleanName,

        email:
          cleanEmail,

        phone:
          normalizedPhone,

        phoneVerified:
          true,

        photoURL:
          photoURL || null,

        plan:
          "personal",

        accountStatus:
          "active",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      },
      {
        merge: true
      }
    );


    return {

      success: true,

      user:
        verifiedUser,

      uid:
        verifiedUser.uid,

      phone:
        normalizedPhone,

      photoURL:
        photoURL || null

    };


  } catch (error) {

    console.error(
      "AYNA BOOK — Complete Registration Error:",
      error
    );


    return {

      success: false,

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   LOGIN
   ========================================================= */

export async function loginUser(
  email,
  password
) {

  try {

    const cleanEmail =
      validateGmail(email);


    if (!password) {

      return {

        success: false,

        message:
          "Password দিন।"

      };
    }


    const credential =
      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );


    return {

      success: true,

      user:
        credential.user

    };


  } catch (error) {

    console.error(
      "AYNA BOOK — Login Error:",
      error
    );


    return {

      success: false,

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

export async function resetPassword(
  email
) {

  try {

    const cleanEmail =
      validateGmail(email);


    await sendPasswordResetEmail(
      auth,
      cleanEmail
    );


    return {

      success: true,

      message:
        "Password reset email পাঠানো হয়েছে। Inbox এবং Spam folder পরীক্ষা করুন।"

    };


  } catch (error) {

    console.error(
      "AYNA BOOK — Password Reset Error:",
      error
    );


    return {

      success: false,

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   LOGOUT
   ========================================================= */

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

      message:
        getAuthErrorMessage(error),

      error

    };
  }
}


/* =========================================================
   AUTH STATE
   ========================================================= */

export function watchAuthState(
  callback
) {

  return onAuthStateChanged(
    auth,
    callback
  );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

export function getCurrentUser() {

  return auth.currentUser;

}


/* =========================================================
   READY
   ========================================================= */

console.log(
  "AYNA BOOK — Authentication controller loaded successfully."
);