
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  reload,
  deleteUser
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import { auth } from "./app.js";

// Registration
export async function registerUser(email, password) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  await sendEmailVerification(credential.user);

  return credential;
}

// Login
export async function loginUser(email, password) {
  return await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
}

// Resend verification email
export async function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please login first.");
  }

  await sendEmailVerification(user);
}

// Check email verification
export async function checkEmailVerification() {
  const user = auth.currentUser;

  if (!user) return false;

  await reload(user);

  return user.emailVerified;
}

// Password reset
export async function resetPassword(email) {
  return await sendPasswordResetEmail(
    auth,
    email.trim()
  );
}

// Logout
export async function logoutUser() {
  return await signOut(auth);
}

// Current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Reload user
export async function reloadCurrentUser() {
  const user = auth.currentUser;

  if (user) {
    await reload(user);
  }

  return auth.currentUser;
}

// Delete current account
export async function deleteCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No logged-in user.");
  }

  return await deleteUser(user);
}

// Observe login state
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}
