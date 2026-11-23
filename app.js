// =========================================================
// AYNA BOOK
// FIREBASE APP INITIALIZATION
// File: app.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// =========================================================
// FIREBASE CONFIGURATION
// =========================================================

const firebaseConfig = {

  apiKey:
    "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",

  authDomain:
    "ayna-book.firebaseapp.com",

  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "ayna-book",

  storageBucket:
    "ayna-book.firebasestorage.app",

  messagingSenderId:
    "805601138500",

  appId:
    "1:805601138500:web:47acdc90cb0cb521626911",

  measurementId:
    "G-RKHHSKNB4B"

};


// =========================================================
// INITIALIZE FIREBASE APP
// =========================================================

const app =
  initializeApp(firebaseConfig);


// =========================================================
// INITIALIZE FIREBASE AUTH
// =========================================================

const auth =
  getAuth(app);


// =========================================================
// EXPORT
// =========================================================

export {
  app,
  auth,
  firebaseConfig
};