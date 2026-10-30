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
  if (statusElement) {
    statusElement.textContent = message;
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName =
      document.getElementById("fullName").value.trim();

    const username = document.getElementById("username")
      .value.trim()
      .replace(/^@/, "")
      .toLowerCase();

    const email = document.getElementById("email")
      .value.trim()
      .toLowerCase();

    const password =
      document.getElementById("password").value;

    const confirmPassword =
      document.getElementById("confirmPassword").value;

    const accountTypeInput =
      form.querySelector('input[name="accountType"]:checked');

    const accountType = accountTypeInput
      ? accountTypeInput.value
      : "personal";

    const allowedAccountTypes = [
      "personal",
      "business",
      "vip",
      "vvip"
    ];

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

    if (!allowedAccountTypes.includes(accountType)) {
      showStatus("সঠিক অ্যাকাউন্টের ধরন নির্বাচন করুন।");
      return;
    }

    if (signupButton) {
      signupButton.disabled = true;
    }

    showStatus("আপনার AYNA BOOK অ্যাকাউন্ট তৈরি হচ্ছে...");

    let createdUser = null;

    try {
      // 1. Create Firebase Authentication account.
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      createdUser = credential.user;

      // 2. Set account display name.
      await updateProfile(createdUser, {
        displayName: fullName
      });

      // 3. VIP/VVIP must not grant themselves privileged access.
      // Their selected type is saved as a request.
      const requestedAccountType =
        accountType === "vip" || accountType === "vvip"
          ? accountType
          : null;

      // 4. Save the user's profile.
      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
        name: fullName,
        username,
        email,
        accountType:
          accountType === "vip" || accountType === "vvip"
            ? "personal"
            : accountType,
        requestedAccountType,
        accountStatus:
          requestedAccountType ? "pending_review" : "active",
        bio: "",
        location: "",
        photo: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 5. Send email verification.
      await sendEmailVerification(createdUser);

      if (requestedAccountType) {
        showStatus(
          "✅ অ্যাকাউন্ট তৈরি হয়েছে! আপনার ইমেইল যাচাই করুন। VIP/VVIP অনুরোধটি অনুমোদনের অপেক্ষায় থাকবে।"
        );
      } else {
        showStatus(
          "✅ অ্যাকাউন্ট তৈরি হয়েছে! আপনার ইমেইলের Inbox খুলে verification link-এ চাপ দিন। তারপর লগইন করুন।"
        );
      }

      form.reset();

    } catch (error) {
      console.error("AYNA BOOK signup error:", error);

      const messages = {
        "auth/email-already-in-use":
          "এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে। লগইন করুন।",

        "auth/invalid-email":
          "সঠিক ইমেইল ঠিকানা লিখুন।",

        "auth/weak-password":
          "আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।",

        "auth/network-request-failed":
          "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

        "auth/operation-not-allowed":
          "Firebase Console-এ Email/Password Authentication চালু করুন।",

        "permission-denied":
          "Firestore Rules আপনার অনুরোধ অনুমোদন করেনি। Rules পরীক্ষা করুন।",

        "firestore/permission-denied":
          "Firestore Rules আপনার অনুরোধ অনুমোদন করেনি।"
      };

      if (createdUser) {
        showStatus(
          "Firebase Authentication অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু পরের ধাপে সমস্যা হয়েছে। একই ইমেইল দিয়ে আবার Signup করবেন না। Firebase Console-এ Authentication ও Firestore পরীক্ষা করুন।"
        );
      } else {
        showStatus(
          messages[error.code] ||
          "অ্যাকাউন্ট তৈরি হয়নি। ইন্টারনেট, Firebase Authentication এবং Firestore সেটিংস পরীক্ষা করুন।"
        );
      }

    } finally {
      if (signupButton) {
        signupButton.disabled = false;
      }
    }
  });
}