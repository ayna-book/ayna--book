import {
  getAuth,
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
  initializeApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";


const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


export async function registerUser(email, password, displayName = "") {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;

    if (displayName) {
      await updateProfile(user, {
        displayName: displayName
      });
    }

    await sendEmailVerification(user);

    return {
      success: true,
      user: user
    };

  } catch (error) {
    console.error("Registration error:", error);

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export async function loginUser(email, password) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;

    if (!user.emailVerified) {
      return {
        success: false,
        verificationRequired: true,
        user: user,
        message: "Please verify your email address first."
      };
    }

    return {
      success: true,
      user: user
    };

  } catch (error) {
    console.error("Login error:", error);

    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export async function resendVerificationEmail() {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "No signed-in user found."
      };
    }

    await sendEmailVerification(user);

    return {
      success: true,
      message: "Verification email sent."
    };

  } catch (error) {
    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: "Password reset email sent."
    };

  } catch (error) {
    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export async function logoutUser() {
  try {
    await signOut(auth);

    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export function getCurrentUser() {
  return auth.currentUser;
}


export async function reloadCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  await reload(user);

  return auth.currentUser;
}


export async function deleteCurrentUser() {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        message: "No signed-in user."
      };
    }

    await deleteUser(user);

    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      code: error.code,
      message: getAuthErrorMessage(error.code)
    };
  }
}


export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}


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

    default:
      return "Authentication failed. Please try again.";
  }
}


export {
  auth,
  app
};