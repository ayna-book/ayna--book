import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { initializeApp, getApps }
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};

const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * লগইন করা ব্যবহারকারীর অবস্থা পর্যবেক্ষণ।
 * ব্যবহারকারী লগইন করলে callback-এ user পাওয়া যাবে।
 * লগইন না থাকলে user হবে null।
 */
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * বর্তমান ব্যবহারকারী লগইন করেছেন কি না।
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * লগআউট।
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * লগইন করা ব্যবহারকারী ছাড়া অন্যদের
 * নির্দিষ্ট পেজে প্রবেশ ঠেকানোর প্রাথমিক ব্যবস্থা।
 */
export function requireLogin(redirectTo = "./login.html") {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        window.location.replace(redirectTo);
        resolve(null);
      }
    });
  });
}

export { auth };