// ======================================================
// AYNA BOOK — Authentication System
// Firebase SDK 12.5.0
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
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";


// ======================================================
// 1. REGISTER
// ======================================================

export async function registerUser(
  name,
  email,
  password
) {
  try {

    if (!name || !email || !password) {
      throw new Error("সব তথ্য পূরণ করুন।");
    }

    if (password.length < 6) {
      throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
    }

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;

    // Update display name
    await updateProfile(user, {
      displayName: name.trim()
    });

    // Send verification email
    await sendEmailVerification(user);

    console.log("✅ Registration successful:", user.email);

    return {
      success: true,
      user: user,
      message:
        "অ্যাকাউন্ট তৈরি হয়েছে। আপনার ইমেইল যাচাই করুন।"
    };

  } catch (error) {

    console.error("❌ Registration error:", error);

    return {
      success: false,
      error: getFirebaseError(error)
    };
  }
}


// ======================================================
// 2. LOGIN
// ======================================================

export async function loginUser(
  email,
  password
) {
  try {

    if (!email || !password) {
      throw new Error("ইমেইল ও পাসওয়ার্ড দিন।");
    }

    const result =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;

    console.log("✅ Login successful:", user.email);

    return {
      success: true,
      user: user,
      message: "সফলভাবে লগইন হয়েছে।"
    };

  } catch (error) {

    console.error("❌ Login error:", error);

    return {
      success: false,
      error: getFirebaseError(error)
    };
  }
}


// ======================================================
// 3. LOGOUT
// ======================================================

export async function logoutUser() {

  try {

    await signOut(auth);

    localStorage.removeItem("ayna_user_session");

    console.log("✅ Logout successful");

    return {
      success: true,
      message: "সফলভাবে লগআউট হয়েছে।"
    };

  } catch (error) {

    console.error("❌ Logout error:", error);

    return {
      success: false,
      error: getFirebaseError(error)
    };
  }
}


// ======================================================
// 4. PASSWORD RESET
// ======================================================

export async function resetPassword(email) {

  try {

    if (!email) {
      throw new Error("আপনার ইমেইল দিন।");
    }

    await sendPasswordResetEmail(
      auth,
      email.trim()
    );

    return {
      success: true,
      message:
        "পাসওয়ার্ড পরিবর্তনের লিংক আপনার ইমেইলে পাঠানো হয়েছে।"
    };

  } catch (error) {

    console.error(
      "❌ Password reset error:",
      error
    );

    return {
      success: false,
      error: getFirebaseError(error)
    };
  }
}


// ======================================================
// 5. AUTH STATE LISTENER
// ======================================================

export function watchAuthState(callback) {

  return onAuthStateChanged(
    auth,
    async (user) => {

      if (user) {

        console.log(
          "👤 Current user:",
          user.email
        );

        // Save basic session information
        localStorage.setItem(
          "ayna_user_session",
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: user.displayName || "",
            emailVerified: user.emailVerified
          })
        );

      } else {

        console.log(
          "👤 No authenticated user"
        );

        localStorage.removeItem(
          "ayna_user_session"
        );
      }

      if (typeof callback === "function") {
        callback(user);
      }
    }
  );
}


// ======================================================
// 6. CURRENT USER
// ======================================================

export function getCurrentUser() {

  return auth.currentUser || null;

}


// ======================================================
// 7. EMAIL VERIFICATION STATUS
// ======================================================

export function isEmailVerified() {

  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  return user.emailVerified === true;

}


// ======================================================
// 8. FIREBASE ERROR HANDLER
// ======================================================

function getFirebaseError(error) {

  if (!error) {
    return "অজানা সমস্যা হয়েছে।";
  }

  const code = error.code || "";

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

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    case "auth/user-disabled":
      return "এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।";

    case "auth/operation-not-allowed":
      return "Firebase Console-এ এই Login পদ্ধতি চালু করা হয়নি।";

    default:
      return error.message ||
        "Firebase Authentication-এ সমস্যা হয়েছে।";
  }
}


// ======================================================
// 9. GLOBAL AYNA AUTH API
// ======================================================

window.AYNA_AUTH = {

  registerUser,

  loginUser,

  logoutUser,

  resetPassword,

  watchAuthState,

  getCurrentUser,

  isEmailVerified

};


console.log(
  "🔐 AYNA BOOK Authentication System Ready"
);