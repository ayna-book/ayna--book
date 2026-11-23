// =========================================================
// AYNA BOOK
// AUTHENTICATION CONTROLLER
// File: auth.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload,
  deleteUser,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  app,
  auth
} from "./firebase-config.js";


// =========================================================
// REGISTER USER
// =========================================================

export async function registerUser(
  email,
  password,
  displayName = ""
) {
  try {
    const result =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;

    if (displayName.trim()) {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
    }

    await sendEmailVerification(user);

    return {
      success: true,
      user: user,
      verificationRequired: true
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Registration Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


// =========================================================
// LOGIN USER
// =========================================================

export async function loginUser(
  email,
  password
) {
  try {

    const result =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;

    if (!user.emailVerified) {

      return {
        success: false,
        verificationRequired: true,
        user: user,
        message:
          "Please verify your email address first."
      };
    }

    return {
      success: true,
      user: user
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Login Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


// =========================================================
// RESEND VERIFICATION EMAIL
// =========================================================

export async function resendVerificationEmail() {

  try {

    const user = auth.currentUser;

    if (!user) {

      return {
        success: false,
        message:
          "No signed-in user found."
      };
    }

    await sendEmailVerification(user);

    return {
      success: true,
      message:
        "Verification email sent successfully."
    };

  } catch (error) {

    console.error(
      "Verification Email Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
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
        message:
          "No signed-in user."
      };
    }

    await reload(user);

    const updatedUser =
      auth.currentUser;

    return {
      success: true,
      verified:
        !!updatedUser.emailVerified,
      user: updatedUser
    };

  } catch (error) {

    console.error(
      "Email Verification Check Error:",
      error
    );

    return {
      success: false,
      verified: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


// =========================================================
// RESET PASSWORD
// =========================================================

export async function resetPassword(email) {

  try {

    await sendPasswordResetEmail(
      auth,
      email.trim()
    );

    return {
      success: true,
      message:
        "Password reset email sent successfully."
    };

  } catch (error) {

    console.error(
      "Password Reset Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
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
      "Logout Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


// =========================================================
// GET CURRENT USER
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;

}


// =========================================================
// RELOAD CURRENT USER
// =========================================================

export async function reloadCurrentUser() {

  try {

    const user =
      auth.currentUser;

    if (!user) {
      return null;
    }

    await reload(user);

    return auth.currentUser;

  } catch (error) {

    console.error(
      "Reload User Error:",
      error
    );

    return null;
  }
}


// =========================================================
// DELETE CURRENT USER
// =========================================================

export async function deleteCurrentUser() {

  try {

    const user =
      auth.currentUser;

    if (!user) {

      return {
        success: false,
        message:
          "No signed-in user."
      };
    }

    await deleteUser(user);

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "Delete User Error:",
      error
    );

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


// =========================================================
// OBSERVE AUTH STATE
// =========================================================

export function observeAuthState(callback) {

  return onAuthStateChanged(
    auth,
    callback
  );

}


// =========================================================
// FIREBASE AUTH ERROR MESSAGES
// =========================================================

function getAuthErrorMessage(code) {

  switch (code) {

    case "auth/email-already-in-use":
      return "This email address is already registered.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password is too weak.";

    case "auth/user-not-found":
      return "No account was found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/invalid-credential":
      return "Email or password is incorrect.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/requires-recent-login":
      return "Please sign in again and retry.";

    case "auth/operation-not-allowed":
      return "Email/Password authentication is not enabled in Firebase.";

    default:
      return "Authentication failed. Please try again.";
  }
}


// =========================================================
// EXPORT
// =========================================================

export {
  app,
  auth
};