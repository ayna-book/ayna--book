
/* =========================================================
   AYNA BOOK
   Authentication System
   Firebase SDK: 13.4.0
   Password: Minimum 11 characters
   ========================================================= */

import { auth, db, storage } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


/* ---------- Error Messages ---------- */

export function getAuthErrorMessage(error) {
  const code = error?.code || "";

  const messages = {
    "auth/email-already-in-use": "এই Gmail দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।",
    "auth/invalid-email": "Gmail ঠিকানাটি সঠিক নয়।",
    "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।",
    "auth/invalid-credential": "Gmail অথবা পাসওয়ার্ড সঠিক নয়।",
    "auth/user-not-found": "এই Gmail দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",
    "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
    "auth/too-many-requests": "অনেকবার চেষ্টা করা হয়েছে। পরে আবার চেষ্টা করুন।",
    "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করুন।",
    "auth/user-disabled": "এই অ্যাকাউন্টটি নিষ্ক্রিয়।",
    "auth/operation-not-allowed": "Firebase Console-এ Email/Password Login চালু করুন।",
    "permission-denied": "তথ্য সংরক্ষণের অনুমতি নেই। Firestore Rules পরীক্ষা করুন।"
  };

  return messages[code] ||
    error?.message ||
    "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।";
}


/* ---------- Password Validation ---------- */

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 11) {
    throw new Error("পাসওয়ার্ড কমপক্ষে ১১ অক্ষরের হতে হবে।");
  }
}


/* ---------- Save User Profile ---------- */

export async function saveUserProfile(user, extraData = {}) {
  if (!user?.uid) {
    throw new Error("ব্যবহারকারীর UID পাওয়া যায়নি।");
  }

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    name: extraData.name || user.displayName || "",
    displayName: extraData.name || user.displayName || "",
    email: user.email || "",
    phone: extraData.phone || "",
    photoURL: extraData.photoURL || user.photoURL || "",
    updatedAt: serverTimestamp()
  }, { merge: true });

  return true;
}


/* ---------- Registration ---------- */

export async function registerUser(
  name,
  email,
  phone,
  password,
  photoFile = null
) {
  let user = null;
  let photoURL = "";

  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanPhone = String(phone || "").trim();

  try {
    if (!cleanName) throw new Error("আপনার নাম লিখুন।");
    if (!cleanEmail) throw new Error("আপনার Gmail লিখুন।");
    if (!cleanPhone) throw new Error("আপনার ফোন নম্বর লিখুন।");

    validatePassword(password);

    // Create Firebase Authentication account
    const credential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    user = credential.user;

  } catch (error) {
    console.error("AYNA BOOK Account Creation Error:", error);

    return {
      success: false,
      accountCreated: false,
      profileSaved: false,
      user: null,
      message: getAuthErrorMessage(error)
    };
  }

  // Account now exists. Do not report registration as failed
  // merely because a later profile operation fails.

  if (photoFile) {
    try {
      if (!photoFile.type.startsWith("image/")) {
        throw new Error("শুধু ছবির ফাইল ব্যবহার করুন।");
      }

      if (photoFile.size > 5 * 1024 * 1024) {
        throw new Error("ছবির আকার সর্বোচ্চ ৫ MB হতে পারবে।");
      }

      const photoRef = ref(
        storage,
        `users/${user.uid}/profile/profile-photo`
      );

      await uploadBytes(photoRef, photoFile);
      photoURL = await getDownloadURL(photoRef);

    } catch (photoError) {
      console.warn("Profile photo upload failed:", photoError);
    }
  }

  // Update Firebase Authentication display name
  try {
    await updateProfile(user, {
      displayName: cleanName,
      ...(photoURL ? { photoURL } : {})
    });
  } catch (profileError) {
    console.warn("Authentication profile update failed:", profileError);
  }

  // Save profile in Firestore
  try {
    await saveUserProfile(user, {
      name: cleanName,
      phone: cleanPhone,
      photoURL
    });

    return {
      success: true,
      accountCreated: true,
      profileSaved: true,
      photoUploaded: Boolean(photoURL),
      user,
      message: "AYNA BOOK অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।"
    };

  } catch (error) {
    console.error("AYNA BOOK Firestore Profile Error:", error);

    return {
      success: true,
      accountCreated: true,
      profileSaved: false,
      photoUploaded: Boolean(photoURL),
      user,
      message:
        "আপনার অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু প্রোফাইল সংরক্ষণ হয়নি। আবার চেষ্টা করুন।"
    };
  }
}


/* ---------- Login ---------- */

export async function loginUser(identifier, password) {
  try {
    const cleanIdentifier = String(identifier || "").trim();
    const cleanPassword = String(password || "");

    if (!cleanIdentifier) {
      throw new Error("নাম, ফোন নম্বর অথবা Gmail লিখুন।");
    }

    validatePassword(cleanPassword);

    // Name and phone login require a secure backend.
    if (!cleanIdentifier.includes("@")) {
      throw new Error(
        "আপাতত Gmail দিয়ে Login করুন। নাম অথবা ফোন নম্বর দিয়ে Login চালু করতে নিরাপদ Backend প্রয়োজন।"
      );
    }

    const credential = await signInWithEmailAndPassword(
      auth,
      cleanIdentifier.toLowerCase(),
      cleanPassword
    );

    const user = credential.user;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        lastLoginAt: serverTimestamp()
      });
    } catch (profileError) {
      console.warn("Last login update warning:", profileError);
    }

    return {
      success: true,
      user,
      message: "লগইন সফল হয়েছে।"
    };

  } catch (error) {
    console.error("AYNA BOOK Login Error:", error);

    return {
      success: false,
      user: null,
      message: getAuthErrorMessage(error)
    };
  }
}


/* ---------- Forgot Password ---------- */

export async function resetPassword(email) {
  try {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      throw new Error("আপনার Gmail লিখুন।");
    }

    await sendPasswordResetEmail(auth, cleanEmail);

    return {
      success: true,
      message: "পাসওয়ার্ড পরিবর্তনের লিংক আপনার Gmail-এ পাঠানো হয়েছে।"
    };

  } catch (error) {
    console.error("Password Reset Error:", error);

    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


/* ---------- Logout ---------- */

export async function logoutUser() {
  try {
    await signOut(auth);

    return {
      success: true,
      message: "লগআউট সফল হয়েছে।"
    };

  } catch (error) {
    return {
      success: false,
      message: getAuthErrorMessage(error)
    };
  }
}


/* ---------- Authentication State ---------- */

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}


/* ---------- Current User ---------- */

export function getCurrentUser() {
  return auth.currentUser;
}

export function isUserLoggedIn() {
  return Boolean(auth.currentUser);
}


/* ---------- System Ready ---------- */

console.log("AYNA BOOK Authentication System Loaded.");
