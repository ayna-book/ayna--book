// firebase-init.js - AYNA BOOK Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// আপনার প্রদানকৃত সঠিক ফায়ারবেস কনফিগারেশন
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

// ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// অন্যান্য ফাইলের ব্যবহারের জন্য সার্ভিসগুলো এক্সপোর্ট করা হলো
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);