// firebase-init.js - AYNA BOOK Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "আপনার_ওয়েব_অ্যাপের_আসল_API_KEY_এখানে_দিন",
    authDomain: "ayna-book.firebaseapp.com",
    databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ayna-book",
    storageBucket: "ayna-book.appspot.com",
    messagingSenderId: "805601138500",
    appId: "আপনার_ওয়েব_অ্যাপের_আসল_App_ID_এখানে_দিন"
};

// ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);