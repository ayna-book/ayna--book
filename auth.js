
// =========================================================
// AYNA BOOK
// AUTHENTICATION CONTROLLER
// File: auth.js
// Firebase SDK: 13.4.0
// =========================================================


// =========================================================
// FIREBASE AUTH IMPORTS
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


// =========================================================
// FIRESTORE IMPORTS
// =========================================================

import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// FIREBASE STORAGE IMPORTS
// =========================================================

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// FIREBASE INITIALIZATION
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase-init.js";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// GMAIL VALIDATION
// =========================================================

export function validateGmail(email) {

  if (typeof email !== "string") {
    return false;
  }

  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(
    email.trim()
  );

}


// =========================================================
// PASSWORD VALIDATION
// =========================================================

export function validatePassword(password) {

  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 128
  );

}


// =========================================================
// PHONE VALIDATION
// International E.164 format
// =========================================================

export function validatePhone(phone) {

  if (typeof phone !== "string") {
    return false;
  }

  return /^\+[1-9]\d{7,14}$/.test(phone.trim());

}


// =========================================================
// PROFILE PHOTO VALIDATION
// =========================================================

export function validateProfilePhoto(photo) {

  if (!(photo instanceof File)) {
    return false;
  }

  if (!ALLOWED_PHOTO_TYPES.includes(photo.type)) {
    return false;
  }

  if (photo.size <= 0 || photo.size > MAX_PHOTO_SIZE) {
    return false;
  }

  return true;

}


// =========================================================
// REGISTRATION
// =========================================================

export async function registerUser({
  fullName,
  email,
  phone,
  password,
  photo
}) {

  fullName = String(fullName || "").trim();

  email = String(email || "")
    .trim()
    .toLowerCase();

  phone = String(phone || "").trim();


  // Validate name

  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error(
      "Please enter a valid full name."
    );
  }


  // Validate Gmail

  if (!validateGmail(email)) {
    throw new Error(
      "Please use a valid Gmail address."
    );
  }


  // Validate phone

  if (!validatePhone(phone)) {
    throw new Error(
      "Enter your international phone number with country code."
    );
  }


  // Validate password

  if (!validatePassword(password)) {
    throw new Error(
      "Password must contain 6 to 128 characters."
    );
  }


  // Validate photo

  if (!validateProfilePhoto(photo)) {
    throw new Error(
      "A valid JPG, PNG or WebP profile photo up to 5 MB is required."
    );
  }


  let user = null;
  let photoRef = null;
  let userDocRef = null;

  let photoUploaded = false;
  let documentCreated = false;


  try {

    // -----------------------------------------------------
    // CREATE FIREBASE ACCOUNT
    // -----------------------------------------------------

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    user = credential.user;


    // -----------------------------------------------------
    // PHOTO FILE EXTENSION
    // -----------------------------------------------------

    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    }[photo.type];


    // -----------------------------------------------------
    // UPLOAD PROFILE PHOTO
    // -----------------------------------------------------

    photoRef = ref(
      storage,
      `profilePhotos/${user.uid}/profile.${extension}`
    );

    await uploadBytes(
      photoRef,
      photo,
      {
        contentType: photo.type
      }
    );

    photoUploaded = true;


    // -----------------------------------------------------
    // GET PHOTO URL
    // -----------------------------------------------------

    const photoURL = await getDownloadURL(photoRef);


    // -----------------------------------------------------
    // UPDATE AUTH PROFILE
    // -----------------------------------------------------

    await updateProfile(user, {
      displayName: fullName,
      photoURL
    });


    // -----------------------------------------------------
    // CREATE FIRESTORE USER DOCUMENT
    // -----------------------------------------------------

    userDocRef = doc(
      db,
      "users",
      user.uid
    );

    await setDoc(userDocRef, {

      uid: user.uid,

      fullName,

      email,

      phone,

      photoURL,

      accountType: "personal",

      plan: "free",

      accountStatus: "pending_email_verification",

      emailVerified: false,

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()

    });

    documentCreated = true;


    // -----------------------------------------------------
    // SEND EMAIL VERIFICATION
    // -----------------------------------------------------

    await sendEmailVerification(user);


    return user;

  } catch (error) {

    // -----------------------------------------------------
    // BEST-EFFORT CLEANUP
    // -----------------------------------------------------

    const cleanupFailed = [];

    if (documentCreated && userDocRef) {

      try {
        await deleteDoc(userDocRef);
      } catch (cleanupError) {
        cleanupFailed.push(cleanupError);
      }

    }


    if (photoUploaded && photoRef) {

      try {
        await deleteObject(photoRef);
      } catch (cleanupError) {
        cleanupFailed.push(cleanupError);
      }

    }


    if (user) {

      try {
        await deleteUser(user);
      } catch (cleanupError) {
        cleanupFailed.push(cleanupError);
      }

    }


    if (cleanupFailed.length > 0) {

      console.error(
        "Registration cleanup failed:",
        cleanupFailed
      );

      throw new Error(
        "Registration setup failed. Some cleanup operations could not be completed. Please contact support."
      );

    }


    throw error;

  }

}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(email, password) {

  email = String(email || "")
    .trim()
    .toLowerCase();


  if (!validateGmail(email)) {
    throw new Error(
      "Please enter a valid Gmail address."
    );
  }


  if (!validatePassword(password)) {
    throw new Error(
      "Invalid password."
    );
  }


  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = credential.user;


  // Refresh authentication information

  await reload(user);


  // Require verified Gmail

  if (!user.emailVerified) {

    await signOut(auth);

    throw new Error(
      "Your Gmail is not verified. Please verify your email before logging in."
    );

  }


  // Refresh Firebase ID token

  await user.getIdToken(true);


  // Activate account

  await updateDoc(
    doc(db, "users", user.uid),
    {

      emailVerified: true,

      accountStatus: "active",

      updatedAt: serverTimestamp()

    }
  );


  return user;

}


// =========================================================
// CHECK EMAIL VERIFICATION
// =========================================================

export async function checkEmailVerification() {

  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await reload(user);

  return Boolean(user.emailVerified);

}


// =========================================================
// RESEND EMAIL VERIFICATION
// =========================================================

export async function resendVerificationEmail() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Please log in first."
    );
  }


  await reload(user);


  if (user.emailVerified) {
    return true;
  }


  await sendEmailVerification(user);

  return true;

}


// =========================================================
// ACTIVATE VERIFIED ACCOUNT
// =========================================================

export async function activateVerifiedAccount() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "No authenticated account found."
    );
  }


  await reload(user);


  if (!user.emailVerified) {
    throw new Error(
      "Gmail verification is not complete."
    );
  }


  // Refresh token to obtain verified-email claim

  await user.getIdToken(true);


  await updateDoc(
    doc(db, "users", user.uid),
    {

      emailVerified: true,

      accountStatus: "active",

      updatedAt: serverTimestamp()

    }
  );


  return true;

}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(email) {

  email = String(email || "")
    .trim()
    .toLowerCase();


  if (!validateGmail(email)) {
    throw new Error(
      "Please enter a valid Gmail address."
    );
  }


  await sendPasswordResetEmail(
    auth,
    email
  );

  return true;

}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {

  await signOut(auth);

  return true;

}


// =========================================================
// AUTH STATE LISTENER
// =========================================================

export function watchAuthState(callback) {

  if (typeof callback !== "function") {
    throw new TypeError(
      "Auth callback must be a function."
    );
  }

  return onAuthStateChanged(
    auth,
    callback
  );

}


// =========================================================
// CURRENT USER
// =========================================================

export function getCurrentUser() {

  return auth.currentUser;

}


// =========================================================
// EMAIL VERIFIED STATUS
// =========================================================

export function isEmailVerified() {

  return Boolean(
    auth.currentUser?.emailVerified
  );

}


// =========================================================
// AUTH ERROR MESSAGES
// =========================================================

export function getAuthErrorMessage(error) {

  const messages = {

    "auth/email-already-in-use":
      "This Gmail address already has an account.",

    "auth/invalid-email":
      "Invalid Gmail address.",

    "auth/invalid-credential":
      "Incorrect Gmail or password.",

    "auth/user-disabled":
      "This account has been disabled.",

    "auth/weak-password":
      "Please choose a stronger password.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/network-request-failed":
      "Network error. Check your internet connection.",

    "auth/operation-not-allowed":
      "Email/Password authentication is not enabled.",

    "auth/unauthorized-domain":
      "This website domain is not authorized in Firebase.",

    "auth/requires-recent-login":
      "Please log in again to complete this security operation.",

    "permission-denied":
      "Firebase security rules denied this operation."

  };


  return (
    messages[error?.code] ||
    error?.message ||
    "Something went wrong. Please try again."
  );

}


// =========================================================
// END OF AUTHENTICATION CONTROLLER
// AYNA BOOK
// =========================================================