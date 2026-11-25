// firebase-init.js — AYNA BOOK Firebase Initialization

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:47acdc90cb0cb521626911",
  measurementId: "G-RKHHSKNB4B"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (_) {
    analytics = null;
  }
}

export { app, auth, database, analytics };