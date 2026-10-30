
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const statusElement = document.getElementById("signupStatus");
const signupButton = document.getElementById("signupButton");

function showStatus(message) {
  statusElement.textContent = message;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();

    const username = document.getElementById("username")
      .value.trim()
      .replace(/^@/, "")
      .toLowerCase();

    const email = document.getElementById("email")
      .value.trim()
      .toLowerCase();

    const password = document.getElementById("password").value;

    const confirmPassword =
      document.getElementById("confirmPassword").value;

    if (!fullName || !username || !email || !password) {
      showStatus("সব প্রয়োজনীয় ঘর পূরণ করুন।");
      return;
    }

    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      showStatus(
        "ইউজারনেম ৩–৩০ অক্ষরের হতে হবে। ইংরেজি অক্ষর, সংখ্যা, _, . অথবা - ব্যবহার করুন।"
      );
      return;
    }

    if (password.length < 8) {
      showStatus("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      showStatus("দুটি পাসওয়ার্ড মিলছে না।");
      return;
    }

    signupButton.disabled = true;
    showStatus("আপনার অ্যাকাউন্ট তৈরি হচ্ছে...");

    let createdUser = null;

    try {
      // Create Firebase account
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      createdUser = credential.user;

      // Set account display name
      await updateProfile(createdUser, {
        displayName: fullName
      });

      // Save basic profile in Firestore
      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
        name: fullName,
        username,
        email,
        bio: "",
        location: "",
        photo: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send email verification
      await sendEmailVerification(createdUser);

      showStatus(
        "✅ অ্যাকাউন্ট তৈরি হয়েছে! আপনার ইমেইলের Inbox খুলে verification link-এ চাপ দিন। তারপর লগইন করুন।"
      );

      form.reset();

    } catch (error) {
      console.error("Signup error:", error);

      const messages = {
        "auth/email-already-in-use":
          "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট তৈরি করা আছে। লগইন করুন।",

        "auth/invalid-email":
          "সঠিক ইমেইল ঠিকানা লিখুন।",

        "auth/weak-password":
          "আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।",

        "auth/network-request-failed":
          "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

        "auth/operation-not-allowed":
          "Firebase Console-এ Email/Password Authentication চালু করুন।",

        "permission-denied":
          "Firestore Security Rules পরীক্ষা করুন।"
      };

      showStatus(
        messages[error.code] ||
        "অ্যাকাউন্ট তৈরি করা যায়নি। ইন্টারনেট ও Firebase সেটিংস পরীক্ষা করুন।"
      );

      // If Authentication succeeded but a later step failed,
      // the account may already exist. Do not create another one.
      if (createdUser) {
        showStatus(
          "আপনার Firebase Authentication অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু পরের কোনো ধাপে সমস্যা হয়েছে। একই ইমেইল দিয়ে আবার Signup না করে আগে Firebase Console ও ইমেইল পরীক্ষা করুন।"
        );
      }

    } finally {
      signupButton.disabled = false;
    }
  });
}
