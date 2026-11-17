// app.js
import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('auth-status');
    
    // লোকাল সেশন থেকে দ্রুত ডাটা লোড
    const savedSession = localStorage.getItem('ayna_user_session');
    if (savedSession && statusEl) {
        const user = JSON.parse(savedSession);
        statusEl.textContent = `● সক্রিয়: ${user.email}`;
    }

    // ফায়ারবেস স্টেট ভেরিফিকেশন
    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem('ayna_user_session', JSON.stringify({ uid: user.uid, email: user.email }));
            if (statusEl) statusEl.textContent = `● অনলাইন: ${user.email}`;
        } else {
            localStorage.removeItem('ayna_user_session');
            if (statusEl) statusEl.innerHTML = `<a href="login.html" style="color:#ffd700;">লগইন করুন</a>`;
        }
    });
});