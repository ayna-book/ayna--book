// firebase-init.js - AYNA BOOK Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "YOUR_WEB_API_KEY", // আপনার ফায়ারবেস প্রজেক্ট সেটিংস থেকে প্রাপ্ত ওয়েব এপিআই কি দিন
    authDomain: "ayna-book.firebaseapp.com",
    databaseURL: "https://ayna-book-default-rtdb.firebaseio.com", // আপনার রিয়েলটাইম ডাটাবেস ইউআরএল
    projectId: "ayna-book",
    storageBucket: "ayna-book.appspot.com",
    messagingSenderId: "805601138500", // আপনার প্রজেক্ট আইডি নম্বর অনুযায়ী
    appId: "1:805601138500:web:YOUR_APP_ID"
};

// ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);