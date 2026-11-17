// ======================================================
// AYNA BOOK — Authentication System
// Firebase Web SDK 13.4.0
// ======================================================

import {
  auth
} from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ======================================================
// 1. REGISTER USER
// ======================================================

export async function registerUser(
  name,
  email,
  password
) {

  try {

    name = String(name || "").trim();
    email = String(email || "").trim();

    if (!name) {
      throw new Error("আপনার নাম লিখুন।");
    }

    if (!email) {
      throw new Error("আপনার ইমেইল লিখুন।");
    }

    if (!password) {
      throw new Error("আপনার পাসওয়ার্ড লিখুন।");
    }

    if (password.length < 6) {
      throw new Error(
        "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
      );
    }


    // Create Firebase account
    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = result.user;


    // Save display name
    await updateProfile(user, {
      displayName: name
    });


    // Send verification email
    try {

      await sendEmailVerification(user);

      console.log(
        "📧 Verification email sent"
      );

    } catch (verificationError) {

      console.warn(
        "⚠️ Verification email could not be sent:",
        verificationError
      );

    }


    // Save local session
    saveUserSession(user);


    console.log(
      "✅ AYNA BOOK registration successful:",
      user.email
    );


    return {

      success: true,

      user: user,

      message:
        "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আপনার ইমেইল যাচাই করুন।"

    };

  } catch (error) {

    console.error(
      "❌ Registration failed:",
      error
    );


    return {

      success: false,

      error: getFirebaseErrorMessage(error)

    };

  }

}


// ======================================================
// 2. LOGIN USER
// ======================================================

export async function loginUser(
  email,
  password
) {

  try {

    email = String(email || "").trim();

    if (!email) {
      throw new Error(
        "আপনার ইমেইল লিখুন।"
      );
    }

    if (!password) {
      throw new Error(
        "আপনার পাসওয়ার্ড লিখুন।"
      );
    }


    const result =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = result.user;


    // Save session
    saveUserSession(user);


    console.log(
      "✅ AYNA BOOK login successful:",
      user.email
    );


    return {

      success: true,

      user: user,

      message:
        "সফলভাবে লগইন হয়েছে।"

    };

  } catch (error) {

    console.error(
      "❌ Login failed:",
      error
    );


    return {

      success: false,

      error: getFirebaseErrorMessage(error)

    };

  }

}


// ======================================================
// 3. LOGOUT USER
// ======================================================

export async function logoutUser() {

  try {

    await signOut(auth);


    localStorage.removeItem(
      "ayna_user_session"
    );


    console.log(
      "✅ AYNA BOOK logout successful"
    );


    return {

      success: true,

      message:
        "সফলভাবে লগআউট হয়েছে।"

    };

  } catch (error) {

    console.error(
      "❌ Logout failed:",
      error
    );


    return {

      success: false,

      error: getFirebaseErrorMessage(error)

    };

  }

}


// ======================================================
// 4. RESET PASSWORD
// ======================================================

export async function resetPassword(
  email
) {

  try {

    email = String(email || "").trim();


    if (!email) {

      throw new Error(
        "আপনার ইমেইল লিখুন।"
      );

    }


    await sendPasswordResetEmail(
      auth,
      email
    );


    console.log(
      "📧 Password reset email sent"
    );


    return {

      success: true,

      message:
        "পাসওয়ার্ড পরিবর্তনের লিংক আপনার ইমেইলে পাঠানো হয়েছে।"

    };

  } catch (error) {

    console.error(
      "❌ Password reset failed:",
      error
    );


    return {

      success: false,

      error: getFirebaseErrorMessage(error)

    };

  }

}


// ======================================================
// 5. SEND EMAIL VERIFICATION AGAIN
// ======================================================

export async function resendVerificationEmail() {

  try {

    const user = auth.currentUser;


    if (!user) {

      throw new Error(
        "প্রথমে লগইন করুন।"
      );

    }


    if (user.emailVerified) {

      return {

        success: true,

        message:
          "আপনার ইমেইল ইতিমধ্যে verified।"

      };

    }


    await sendEmailVerification(
      user
    );


    return {

      success: true,

      message:
        "Verification email আবার পাঠানো হয়েছে।"

    };

  } catch (error) {

    console.error(
      "❌ Verification email failed:",
      error
    );


    return {

      success: false,

      error: getFirebaseErrorMessage(error)

    };

  }

}


// ======================================================
// 6. AUTH STATE LISTENER
// ======================================================

export function watchAuthState(
  callback
) {

  return onAuthStateChanged(
    auth,
    (user) => {

      if (user) {

        saveUserSession(user);


        console.log(
          "👤 AYNA BOOK user:",
          user.email
        );

      } else {

        localStorage.removeItem(
          "ayna_user_session"
        );


        console.log(
          "👤 No AYNA BOOK user logged in"
        );

      }


      if (
        typeof callback ===
        "function"
      ) {

        callback(user);

      }

    }
  );

}


// ======================================================
// 7. GET CURRENT USER
// ======================================================

export function getCurrentUser() {

  return auth.currentUser || null;

}


// ======================================================
// 8. CHECK LOGIN STATUS
// ======================================================

export function isLoggedIn() {

  return !!auth.currentUser;

}


// ======================================================
// 9. CHECK EMAIL VERIFIED
// ======================================================

export function isEmailVerified() {

  const user =
    auth.currentUser;


  if (!user) {

    return false;

  }


  return user.emailVerified === true;

}


// ======================================================
// 10. SAVE USER SESSION
// ======================================================

function saveUserSession(
  user
) {

  if (!user) {
    return;
  }


  const session = {

    uid:
      user.uid || "",

    email:
      user.email || "",

    name:
      user.displayName || "",

    photoURL:
      user.photoURL || "",

    emailVerified:
      user.emailVerified === true,

    loginTime:
      Date.now()

  };


  localStorage.setItem(
    "ayna_user_session",
    JSON.stringify(session)
  );

}


// ======================================================
// 11. GET SAVED SESSION
// ======================================================

export function getSavedSession() {

  try {

    const data =
      localStorage.getItem(
        "ayna_user_session"
      );


    if (!data) {

      return null;

    }


    return JSON.parse(data);

  } catch (error) {

    console.error(
      "❌ Session read error:",
      error
    );


    return null;

  }

}


// ======================================================
// 12. CLEAR SESSION
// ======================================================

export function clearSession() {

  localStorage.removeItem(
    "ayna_user_session"
  );

}


// ======================================================
// 13. FIREBASE ERROR MESSAGE
// ======================================================

function getFirebaseErrorMessage(
  error
) {

  if (!error) {

    return "অজানা সমস্যা হয়েছে।";

  }


  const code =
    error.code || "";


  switch (code) {

    case "auth/email-already-in-use":

      return "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।";


    case "auth/invalid-email":

      return "সঠিক ইমেইল ঠিকানা দিন।";


    case "auth/weak-password":

      return "পাসওয়ার্ড আরও শক্তিশালী করুন।";


    case "auth/user-not-found":

      return "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";


    case "auth/wrong-password":

      return "পাসওয়ার্ড সঠিক নয়।";


    case "auth/invalid-credential":

      return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";


    case "auth/invalid-login-credentials":

      return "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";


    case "auth/too-many-requests":

      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";


    case "auth/network-request-failed":

      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";


    case "auth/user-disabled":

      return "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।";


    case "auth/operation-not-allowed":

      return "Firebase Console-এ এই Sign-in পদ্ধতি চালু করা হয়নি।";


    case "auth/requires-recent-login":

      return "নিরাপত্তার জন্য আবার লগইন করুন।";


    default:

      return (
        error.message ||
        "Firebase Authentication-এ সমস্যা হয়েছে।"
      );

  }

}


// ======================================================
// 14. GLOBAL AYNA AUTH API
// ======================================================

window.AYNA_AUTH = {

  registerUser,

  loginUser,

  logoutUser,

  resetPassword,

  resendVerificationEmail,

  watchAuthState,

  getCurrentUser,

  isLoggedIn,

  isEmailVerified,

  getSavedSession,

  clearSession

};


// ======================================================
// READY MESSAGE
// ======================================================

console.log(
  "=========================================="
);

console.log(
  "🔐 AYNA BOOK Authentication Ready"
);

console.log(
  "🔥 Firebase Web SDK 13.4.0"
);

console.log(
  "=========================================="
);