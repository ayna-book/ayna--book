
import { auth, database } from "./firebase-init.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const statusMsg = document.getElementById("statusMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    statusMsg.textContent = "Email ও Password দিন।";
    return;
  }

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";
  statusMsg.textContent = "";

  let user = null;

  try {
    const credential = await signInWithEmailAndPassword(
      auth, email, password
    );

    user = credential.user;

    const snapshot = await get(ref(database, "users/" + user.uid));

    if (!snapshot.exists()) {
      await signOut(auth);
      throw new Error("PROFILE_NOT_FOUND");
    }

    const profile = snapshot.val();

    if (profile.uid !== user.uid) {
      await signOut(auth);
      throw new Error("PROFILE_INVALID");
    }

    statusMsg.textContent = "Login successful!";

    window.location.replace("./index.html");

  } catch (error) {
    console.error(error);

    if (error.message === "PROFILE_NOT_FOUND") {
      statusMsg.textContent =
        "অ্যাকাউন্ট আছে, কিন্তু Profile পাওয়া যায়নি। Profile recovery প্রয়োজন।";
    } else if (error.message === "PROFILE_INVALID") {
      statusMsg.textContent = "Profile তথ্য সঠিক নয়।";
    } else {
      const messages = {
        "auth/invalid-credential": "Email অথবা Password ভুল।",
        "auth/user-not-found": "এই Email দিয়ে অ্যাকাউন্ট পাওয়া যায়নি।",
        "auth/wrong-password": "Password ভুল।",
        "auth/invalid-email": "সঠিক Email দিন।",
        "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। পরে চেষ্টা করুন।",
        "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করুন।"
      };

      statusMsg.textContent =
        messages[error.code] || "Login করা যায়নি: " + error.message;
    }

  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Login";
  }
});
