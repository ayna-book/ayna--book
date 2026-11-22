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
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

import {
  auth,
  db,
  storage
} from "./firebase-init.js";

import {
  getDeviceSecurityId,
  getSecurityCapabilities,
  runSecuritySelfTest,
  createSecurityNonce
} from "./quantum-security.js";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// VALIDATORS
// =========================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}


function isGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
    .test(email);
}


function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 6 &&
    password.length <= 128
  );
}


function isValidPhone(phone) {
  return /^\+[1-9]\d{7,14}$/
    .test(String(phone || "").trim());
}


function validatePhoto(photo) {
  if (!photo) {
    throw new Error(
      "Profile photo is required."
    );
  }

  if (!ALLOWED_PHOTO_TYPES.includes(
    photo.type
  )) {
    throw new Error(
      "Only JPG, PNG or WebP images are allowed."
    );
  }

  if (photo.size > MAX_PHOTO_SIZE) {
    throw new Error(
      "Profile photo must be 5 MB or smaller."
    );
  }
}


// =========================================================
// REGISTER
// =========================================================

export async function registerUser({
  fullName,
  email,
  phone,
  password,
  photo
}) {
  const cleanName =
    String(fullName || "").trim();

  const cleanEmail =
    normalizeEmail(email);

  const cleanPhone =
    String(phone || "").trim();

  if (!cleanName) {
    throw new Error(
      "Full name is required."
    );
  }

  if (!isGmail(cleanEmail)) {
    throw new Error(
      "Please use a Gmail address."
    );
  }

  if (!isValidPhone(cleanPhone)) {
    throw new Error(
      "Phone number must use international format, e.g. +8801XXXXXXXXX."
    );
  }

  if (!isValidPassword(password)) {
    throw new Error(
      "Password must be 6–128 characters."
    );
  }

  validatePhoto(photo);

  let createdUser = null;
  let uploadedPhotoRef = null;

  try {

    // -----------------------------------------------------
    // CREATE AUTH USER
    // -----------------------------------------------------

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

    createdUser =
      credential.user;


    // -----------------------------------------------------
    // SECURITY DATA
    // -----------------------------------------------------

    const deviceSecurityId =
      getDeviceSecurityId();

    const registrationNonce =
      createSecurityNonce();


    // -----------------------------------------------------
    // PHOTO EXTENSION
    // -----------------------------------------------------

    const extension =
      photo.type === "image/png"
        ? "png"
        : photo.type === "image/webp"
          ? "webp"
          : "jpg";


    // -----------------------------------------------------
    // STORAGE
    // -----------------------------------------------------

    uploadedPhotoRef =
      ref(
        storage,
        `profilePhotos/${createdUser.uid}/profile.${extension}`
      );

    await uploadBytes(
      uploadedPhotoRef,
      photo,
      {
        contentType:
          photo.type
      }
    );

    const photoURL =
      await getDownloadURL(
        uploadedPhotoRef
      );


    // -----------------------------------------------------
    // FIREBASE AUTH PROFILE
    // -----------------------------------------------------

    await updateProfile(
      createdUser,
      {
        displayName:
          cleanName,

        photoURL
      }
    );


    // -----------------------------------------------------
    // FIRESTORE USER PROFILE
    // -----------------------------------------------------

    await setDoc(
      doc(
        db,
        "users",
        createdUser.uid
      ),
      {
        uid:
          createdUser.uid,

        fullName:
          cleanName,

        email:
          cleanEmail,

        phone:
          cleanPhone,

        photoURL,

        accountType:
          "personal",

        plan:
          "free",

        accountStatus:
          "pending_email_verification",

        emailVerified:
          false,

        deviceSecurityId,

        registrationNonce,

        securityVersion:
          1,

        securityArchitecture:
          "web-crypto-pqc-ready",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );


    // -----------------------------------------------------
    // EMAIL VERIFICATION
    // -----------------------------------------------------

    await sendEmailVerification(
      createdUser
    );


    return {
      success: true,
      user:
        createdUser,
      message:
        "Account created. Please verify your Gmail address."
    };

  } catch (error) {

    // -----------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------

    try {
      if (uploadedPhotoRef) {
        await deleteObject(
          uploadedPhotoRef
        );
      }
    } catch (_) {}

    try {
      if (createdUser) {
        await deleteDoc(
          doc(
            db,
            "users",
            createdUser.uid
          )
        );
      }
    } catch (_) {}

    try {
      if (createdUser) {
        await deleteUser(
          createdUser
        );
      }
    } catch (_) {}

    throw error;
  }
}


// =========================================================
// LOGIN
// =========================================================

export async function loginUser(
  email,
  password
) {
  const cleanEmail =
    normalizeEmail(email);

  if (!isGmail(cleanEmail)) {
    throw new Error(
      "Please enter a valid Gmail address."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  const credential =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  const user =
    credential.user;

  await reload(user);

  if (!user.emailVerified) {

    await signOut(auth);

    throw new Error(
      "Please verify your Gmail address before logging in."
    );
  }

  await user.getIdToken(true);

  await updateDoc(
    doc(
      db,
      "users",
      user.uid
    ),
    {
      emailVerified:
        true,

      accountStatus:
        "active",

      updatedAt:
        serverTimestamp()
    }
  );

  return user;
}


// =========================================================
// CHECK EMAIL VERIFICATION
// =========================================================

export async function checkEmailVerification() {
  const user =
    auth.currentUser;

  if (!user) {
    return false;
  }

  await reload(user);

  return Boolean(
    user.emailVerified
  );
}


// =========================================================
// RESEND VERIFICATION
// =========================================================

export async function resendVerificationEmail() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "No signed-in user."
    );
  }

  await reload(user);

  if (user.emailVerified) {
    return {
      success: true,
      alreadyVerified: true
    };
  }

  await sendEmailVerification(
    user
  );

  return {
    success: true,
    alreadyVerified: false
  };
}


// =========================================================
// ACTIVATE VERIFIED ACCOUNT
// =========================================================

export async function activateVerifiedAccount() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "No signed-in user."
    );
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error(
      "Email is not verified."
    );
  }

  await updateDoc(
    doc(
      db,
      "users",
      user.uid
    ),
    {
      emailVerified:
        true,

      accountStatus:
        "active",

      updatedAt:
        serverTimestamp()
    }
  );

  return true;
}


// =========================================================
// PASSWORD RESET
// =========================================================

export async function resetPassword(
  email
) {
  const cleanEmail =
    normalizeEmail(email);

  if (!isGmail(cleanEmail)) {
    throw new Error(
      "Please enter a valid Gmail address."
    );
  }

  await sendPasswordResetEmail(
    auth,
    cleanEmail
  );

  return true;
}


// =========================================================
// LOGOUT
// =========================================================

export async function logoutUser() {
  await signOut(auth);
}


// =========================================================
// AUTH STATE WATCHER
// =========================================================

export function watchAuthState(
  callback
) {
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
// VERIFIED STATUS
// =========================================================

export function isEmailVerified() {
  return Boolean(
    auth.currentUser?.emailVerified
  );
}


// =========================================================
// SECURITY STATUS
// =========================================================

export function getAYNABookSecurityStatus() {
  return {
    deviceSecurityId:
      getDeviceSecurityId(),

    capabilities:
      getSecurityCapabilities()
  };
}


// =========================================================
// SECURITY TEST
// =========================================================

export async function runAYNABookSecurityTest() {
  return runSecuritySelfTest();
}


// =========================================================
// AUTH SECURITY NONCE
// =========================================================

export function createAuthSecurityNonce() {
  return createSecurityNonce();
}


// =========================================================
// ERROR MESSAGE
// =========================================================

export function getAuthErrorMessage(
  error
) {
  const code =
    error?.code || "";

  const messages = {

    "auth/email-already-in-use":
      "This Gmail address is already registered.",

    "auth/invalid-email":
      "The email address is invalid.",

    "auth/invalid-credential":
      "Incorrect Gmail address or password.",

    "auth/user-not-found":
      "No account was found with this Gmail address.",

    "auth/wrong-password":
      "Incorrect password.",

    "auth/weak-password":
      "Password is too weak.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/network-request-failed":
      "Network connection failed.",

    "auth/user-disabled":
      "This account has been disabled.",

    "auth/requires-recent-login":
      "Please log in again and try again."
  };

  return (
    messages[code] ||
    error?.message ||
    "An authentication error occurred."
  );
}