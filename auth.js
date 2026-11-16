
import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// নতুন অ্যাকাউন্ট তৈরি
export async function registerUser(name, email, password) {
  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || !email || password.length < 8) {
    throw new Error("নাম, সঠিক Gmail এবং কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন।");
  }

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(result.user, {
    displayName: name
  });

  await setDoc(doc(db, "users", result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    bio: "",
    photo: "",
    createdAt: serverTimestamp()
  });

  await sendEmailVerification(result.user);

  return result.user;
}

// Gmail দিয়ে লগইন
export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    password
  );

  if (!result.user.emailVerified) {
    await sendEmailVerification(result.user);
    await signOut(auth);
    throw new Error("Gmail-এর Inbox থেকে Verification সম্পন্ন করুন।");
  }

  return result.user;
}

// লগআউট
export async function logoutUser() {
  await signOut(auth);
}

// লগইন অবস্থা পর্যবেক্ষণ
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

// পাসওয়ার্ড রিসেট
export async function resetPassword(email) {
  await sendPasswordResetEmail(
    auth,
    email.trim().toLowerCase()
  );
}
