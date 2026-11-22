
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload,
  onAuthStateChanged,
  updateProfile
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

import { auth, db, storage } from "./firebase-init.js";

export function validateGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}

export async function registerUser({
  fullName,
  email,
  phone,
  password,
  photo
}) {
  fullName = String(fullName || "").trim();
  email = String(email || "").trim().toLowerCase();
  phone = String(phone || "").trim();

  if (fullName.length < 2 || fullName.length > 80) {
    throw new Error("Please enter a valid full name.");
  }

  if (!validateGmail(email)) {
    throw new Error("Please use a valid Gmail address.");
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("Enter phone number with country code, e.g. +8801XXXXXXXXX.");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must contain at least 6 characters.");
  }

  if (!(photo instanceof File)) {
    throw new Error("Profile photo is required.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    throw new Error("Only JPG, PNG, and WebP photos are allowed.");
  }

  if (photo.size > 5 * 1024 * 1024) {
    throw new Error("Profile photo must be 5 MB or less.");
  }

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = credential.user;

  try {
    const extension = photo.type === "image/png"
      ? "png"
      : photo.type === "image/webp" ? "webp" : "jpg";

    const photoRef = ref(storage, `profilePhotos/${user.uid}/profile.${extension}`);

    await uploadBytes(photoRef, photo, {
      contentType: photo.type
    });

    const photoURL = await getDownloadURL(photoRef);

    await updateProfile(user, {
      displayName: fullName,
      photoURL
    });

    await setDoc(doc(db, "users", user.uid), {
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

    await sendEmailVerification(user);
    return user;
  } catch (error) {
    // Account creation may already have succeeded.
    // Do not silently delete the user's account or uploaded data.
    throw new Error(
      `Account was created, but setup was incomplete. Please contact support. Details: ${error.message}`
    );
  }
}

export async function loginUser(email, password) {
  email = String(email || "").trim().toLowerCase();

  if (!validateGmail(email)) {
    throw new Error("Please enter your Gmail address.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  await reload(user);

  if (!user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your Gmail before logging in. Check your inbox.");
  }

  return user;
}

export async function resendVerificationEmail() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in first.");
  }

  await reload(user);

  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
}

export async function resetPassword(email) {
  email = String(email || "").trim().toLowerCase();

  if (!validateGmail(email)) {
    throw new Error("Please enter a valid Gmail address.");
  }

  await sendPasswordResetEmail(auth, email);
}

export function logoutUser() {
  return signOut(auth);
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function isEmailVerified() {
  return Boolean(auth.currentUser?.emailVerified);
}

export function getAuthErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "This Gmail address already has an account.",
    "auth/invalid-email": "Invalid email address.",
    "auth/invalid-credential": "Incorrect Gmail or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password login is not enabled in Firebase.",
    "auth/unauthorized-domain": "This website domain is not authorized in Firebase."
  };

  return messages[error?.code] || error?.message || "Something went wrong. Please try again.";
}
