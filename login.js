import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert("সফলভাবে লগইন হয়েছে!");
            window.location.href = "index.html"; // ড্যাশবোর্ডে রিডাইরেক্ট হবে
        } catch (error) {
            alert("লগইন ব্যর্থ হয়েছে: " + error.message);
        }
    });
}