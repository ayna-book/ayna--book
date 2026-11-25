// firebase-config.js — AYNA BOOK Central Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "YOUR_AYNA_BOOK_WEB_API_KEY",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.appspot.com",
  messagingSenderId: "805601138500",
  appId: "YOUR_AYNA_BOOK_WEB_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);