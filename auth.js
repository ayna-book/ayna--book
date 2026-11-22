
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
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
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
    throw new Error("Enter a valid name.");
  }

  if (!validateGmail(email)) {
    throw new Error("Please use a valid Gmail address.");
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error("Enter phone number with country code.");
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new Error("Password must contain at least 6 characters.");
  }

  if (!(photo instanceof File)) {
    throw new Error("Profile photo is required.");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
    throw new Error("Only JPG, PNG and WebP photos are allowed.");
  }

  if (photo.size > 5 * 1024 * 1024) {
    throw new Error("Photo must be 5 MB or less.");
  }

  let user = null;
  let photoRef = null;
  let userDocRef = null;
  let photoUploaded = false;
  let documentCreated = false;

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    user = credential.user;

    const extension = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    }[photo.type];

    photoRef = ref(
      storage,
      `profilePhotos/${user.uid}/profile.${extension}`
    );

    await uploadBytes(photoRef, photo, {
      contentType: photo.type
    });

    photoUploaded = true;

    const photoURL = await getDownloadURL(photoRef);

    await updateProfile(user, {
      displayName: fullName,
      photoURL
    });

    userDocRef = doc(db, "users", user.uid);

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

    await sendEmailVerification(user);

    return user;

  } catch (error) {
    // Best-effort cleanup if registration setup fails.
    const cleanupErrors = [];

    if (documentCreated && userDocRef) {
      try {
        await deleteDoc(userDocRef);
      } catch (e) {
        cleanupErrors.push(e);
      }
    }

    if (photoUploaded && photoRef) {
      try {
        await deleteObject(photoRef);
      } catch (e) {
        cleanupErrors.push(e);
      }
    }

    if (user) {
      try {
        await deleteUser(user);
      } catch (e) {
        cleanupErrors.push(e);
      }
    }

    if (cleanupErrors.length) {
      throw new Error(
        "Registration setup failed. Some cleanup operations also failed. Contact support."
      );
    }

    throw error;
  }
}

export async function loginUser(email, password) {
  email = String(email || "").trim().toLowerCase();

  if (!validateGmail(email)) {
    throw new Error("Enter a valid Gmail address.");
  }

  const credential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = credential.user;

  await reload(user);

  if (!user.emailVerified) {
    await signOut(auth);
    throw new Error(
      "Your Gmail is not verified. Please verify your email first."
    );
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
    throw new Error("Enter a valid Gmail address.");
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
    "auth/email-already-in-use":
      "This Gmail address already has an account.",

    "auth/invalid-email":
      "Invalid email address.",

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
      "Enable Email/Password in Firebase Authentication.",

    "auth/unauthorized-domain":
      "This domain is not authorized in Firebase."
  };

  return messages[error?.code] ||
    error?.message ||
    "Something went wrong. Please try again.";
}
