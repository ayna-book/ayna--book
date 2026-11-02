/**
 * AYNA BOOK — Firebase Cloud & Real-time Database Core
 * Founder: Mohammed Mahabub Alam
 * International Account ID: 01400751906
 */

// Firebase SDK মডিউল আমদানি (CDN ভার্সন)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// আপনার ফায়ারবেস কনফিগারেশন (Firebase Console থেকে আপনার প্রোজেক্ট ক্রিয়েট করে এখানে আপনার কোড বসাবেন)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "ayna-book.firebaseapp.com",
    projectId: "ayna-book",
    storageBucket: "ayna-book.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase ইনিশিয়ালাইজ বা চালু করা
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// গ্লোবাল একাউন্ট আইডি বাইন্ডিং (01400751906)
export async function saveUserData(userId, userData) {
    try {
        await setDoc(doc(db, "users", userId), {
            ...userData,
            internationalId: "01400751906",
            founder: "Mohammed Mahabub Alam",
            updatedAt: new Date().toISOString()
        }, { merge: true });
        console.log("[AYNA Firebase] User data saved successfully.");
    } catch (error) {
        console.error("[AYNA Firebase Error] Error saving user data: ", error);
    }
}