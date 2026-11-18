// firebase-init.js - AYNA BOOK Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyD-YourWebApiKeyFromConsole", // আপনার ফায়ারবেস কনসোলের ওয়েব প্রজেক্ট সেটিংস থেকে প্রাপ্ত API Key এখানে দিন
    authDomain: "ayna-book.firebaseapp.com",
    databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app", // আপনার কনসোলের রিয়েলটাইম ডাটাবেস ইউআরএল
    projectId: "ayna-book",
    storageBucket: "ayna-book.appspot.com",
    messagingSenderId: "805601138500", // প্রজেক্ট আইডি নম্বর
    appId: "1:805601138500:web:6a0213b9832c75d4626911" // ফায়ারবেস কনসোল থেকে প্রাপ্ত ওয়েব App ID
};

// ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);