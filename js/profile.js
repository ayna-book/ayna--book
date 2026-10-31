// =============================================
// AYNA BOOK — Enhanced Profile System
// Photo limit: 500 KB
// Firebase Authentication + Firestore
// =============================================

import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

"use strict";

const $ = id => document.getElementById(id);

const form = $("profileForm");
const nameInput = $("name");
const emailInput = $("email");
const phoneInput = $("phone");
const locationInput = $("location");
const bioInput = $("bio");
const photoInput = $("photo");
const photoPreview = $("photoPreview");

const saveButton = $("saveButton");
const logoutButton = $("logoutButton");
const statusElement = $("profileStatus");
const accountStatus = $("accountStatus");

const MAX_PHOTO_SIZE = 500 * 1024;

let currentUser = null;
let saving = false;
let localPhotoUrl = null;

function showStatus(message, type = "info") {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.dataset.type = type;

  console.log("[AYNA BOOK]", message);
}

function setAccountStatus(message) {
  if (accountStatus) {
    accountStatus.textContent = message;
  }
}

function setFormEnabled(enabled) {
  if (form) {
    for (const element of form.elements) {
      element.disabled = !enabled;
    }
  }

  if (logoutButton) {
    logoutButton.disabled = !enabled;
  }
}

function releasePhotoPreview() {
  if (localPhotoUrl) {
    URL.revokeObjectURL(localPhotoUrl);
    localPhotoUrl = null;
  }
}

function clearPhotoPreview() {
  releasePhotoPreview();

  if (photoPreview) {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
  }
}

function previewPhoto(file) {
  releasePhotoPreview();

  localPhotoUrl = URL.createObjectURL(file);

  photoPreview.src = localPhotoUrl;
  photoPreview.hidden = false;

  photoPreview.onerror = () => {
    clearPhotoPreview();
    showStatus("ছবির প্রিভিউ তৈরি করা যায়নি। অন্য ছবি চেষ্টা করুন।", "error");
  };
}

// কোনো JavaScript error হলে ব্যবহারকারীকে বার্তা দেখানো
window.addEventListener("error", event => {
  console.error("Profile page error:", event.error || event.message);

  showStatus(
    "পেজে একটি ত্রুটি হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।",
    "error"
  );
});

window.addEventListener("unhandledrejection", event => {
  console.error("Profile asynchronous error:", event.reason);

  showStatus(
    "একটি কাজ সম্পন্ন হয়নি। ইন্টারনেট ও Firebase সংযোগ পরীক্ষা করুন।",
    "error"
  );
});

// প্রয়োজনীয় HTML element আছে কি না পরীক্ষা
if (
  !form ||
  !nameInput ||
  !emailInput ||
  !phoneInput ||
  !locationInput ||
  !bioInput ||
  !photoInput ||
  !photoPreview ||
  !saveButton ||
  !logoutButton ||
  !statusElement ||
  !accountStatus
) {
  console.error("AYNA BOOK: Profile HTML element missing.");

  if (statusElement) {
    showStatus(
      "প্রোফাইল ফাইলে প্রয়োজনীয় HTML অংশ পাওয়া যায়নি। profile.html পরীক্ষা করুন।",
      "error"
    );
  }
} else {
  startProfile();
}

function startProfile() {
  setFormEnabled(false);
  showStatus("আপনার অ্যাকাউন্ট যাচাই হচ্ছে...");

  onAuthStateChanged(
    auth,
    async user => {
      if (!user) {
        currentUser = null;

        setAccountStatus("লগইন করা নেই। লগইন পেজ খোলা হচ্ছে...");
        showStatus("প্রোফাইল দেখতে আগে লগইন করুন।");

        window.location.replace("./login.html");
        return;
      }

      currentUser = user;

      emailInput.value = user.email || "";

      setAccountStatus(
        "লগইন করা অ্যাকাউন্ট: " +
        (user.email || "ইমেইল পাওয়া যায়নি")
      );

      await loadProfile(user);
    },
    error => {
      console.error("Authentication listener error:", error);

      setAccountStatus("অ্যাকাউন্ট যাচাই করা যায়নি।");

      showStatus(
        "Firebase Authentication-এ সমস্যা হয়েছে (" +
        (error.code || "unknown") +
        ")। আবার লগইন করুন।",
        "error"
      );
    }
  );

  // ছবি নির্বাচন: সর্বোচ্চ 500 KB
  photoInput.addEventListener("change", () => {
    try {
      const file = photoInput.files?.[0];

      if (!file) {
        clearPhotoPreview();
        showStatus("কোনো ছবি নির্বাচন করা হয়নি।");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (!allowedTypes.includes(file.type)) {
        photoInput.value = "";
        clearPhotoPreview();

        showStatus(
          "JPG, PNG অথবা WebP ফরম্যাটের ছবি নির্বাচন করুন।",
          "error"
        );
        return;
      }

      if (file.size > MAX_PHOTO_SIZE) {
        photoInput.value = "";
        clearPhotoPreview();

        showStatus(
          "ছবির আকার 500 KB-এর বেশি। ছোট ছবি নির্বাচন করুন।",
          "error"
        );
        return;
      }

      previewPhoto(file);

      const sizeKB = (file.size / 1024).toFixed(1);

      showStatus(
        "ছবি নির্বাচন সফল! আকার: " +
        sizeKB +
        " KB। প্রিভিউ দেখা যাচ্ছে।",
        "success"
      );

    } catch (error) {
      console.error("Photo preview error:", error);

      clearPhotoPreview();

      showStatus(
        "ছবি নির্বাচন করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।",
        "error"
      );
    }
  });

  // প্রোফাইল সংরক্ষণ
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (saving) return;

    if (!currentUser) {
      showStatus("প্রথমে Gmail ও পাসওয়ার্ড দিয়ে লগইন করুন।", "error");
      return;
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const location = locationInput.value.trim();
    const bio = bioInput.value.trim();

    if (!name) {
      showStatus("আপনার পূর্ণ নাম লিখুন।", "error");
      nameInput.focus();
      return;
    }

    if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
      showStatus(
        "ফোন নম্বর সঠিকভাবে লিখুন, যেমন +8801XXXXXXXXX।",
        "error"
      );
      phoneInput.focus();
      return;
    }

    const selectedPhoto = photoInput.files?.[0];

    if (selectedPhoto && selectedPhoto.size > MAX_PHOTO_SIZE) {
      showStatus("ছবির আকার 500 KB-এর মধ্যে রাখুন।", "error");
      return;
    }

    saving = true;
    saveButton.disabled = true;
    logoutButton.disabled = true;

    showStatus("Firebase-এ প্রোফাইল সংরক্ষণ হচ্ছে...");

    try {
      const profileRef = doc(db, "users", currentUser.uid);

      await setDoc(
        profileRef,
        {
          uid: currentUser.uid,
          name,
          email: currentUser.email || "",
          phone,
          location,
          bio,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      try {
        await updateProfile(currentUser, {
          displayName: name
        });
      } catch (error) {
        // Firestore-এ তথ্য সংরক্ষিত হলেও Auth displayName
        // আপডেট ব্যর্থ হতে পারে। সেটি আলাদাভাবে লগ করা হবে।
        console.warn("Display name update warning:", error);
      }

      showStatus(
        "✅ আপনার নাম, Gmail, ফোন নম্বর, শহর ও পরিচিতি সংরক্ষিত হয়েছে। " +
        "ছবি বর্তমানে শুধু প্রিভিউতে আছে; অনলাইনে সংরক্ষিত হয়নি।",
        "success"
      );

    } catch (error) {
      console.error("Profile save error:", error);

      const code = error?.code || "unknown";

      const messages = {
        "permission-denied":
          "Firestore Rules সংরক্ষণের অনুমতি দেয়নি। Firebase Console-এর Rules পরীক্ষা করুন।",

        "unavailable":
          "Firebase সার্ভার পাওয়া যাচ্ছে না। ইন্টারনেট পরীক্ষা করুন।",

        "unauthenticated":
          "আপনার লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।",

        "resource-exhausted":
          "Firebase-এর ব্যবহারসীমা অতিক্রম করেছে। পরে আবার চেষ্টা করুন।"
      };

      showStatus(
        "❌ সংরক্ষণ ব্যর্থ (" +
        code +
        "): " +
        (messages[code] || "Firebase সেটিংস ও ইন্টারনেট পরীক্ষা করুন।"),
        "error"
      );

    } finally {
      saving = false;
      saveButton.disabled = false;
      logoutButton.disabled = false;
    }
  });

  // লগআউট
  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    showStatus("লগআউট হচ্ছে...");

    try {
      await signOut(auth);
      window.location.replace("./login.html");

    } catch (error) {
      console.error("Logout error:", error);

      showStatus("লগআউট করা যায়নি। আবার চেষ্টা করুন।", "error");

      logoutButton.disabled = false;
    }
  });
}

async function loadProfile(user) {
  showStatus("আপনার প্রোফাইল লোড হচ্ছে...");

  try {
    const profileRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(profileRef);

    if (snapshot.exists()) {
      const data = snapshot.data();

      nameInput.value = data.name || user.displayName || "";
      phoneInput.value = data.phone || user.phoneNumber || "";
      locationInput.value = data.location || "";
      bioInput.value = data.bio || "";

    } else {
      nameInput.value = user.displayName || "";
      phoneInput.value = user.phoneNumber || "";
      locationInput.value = "";
      bioInput.value = "";
    }

    emailInput.value = user.email || "";

    setFormEnabled(true);

    showStatus(
      "প্রোফাইল প্রস্তুত। ছবি সর্বোচ্চ 500 KB হতে পারবে।",
      "success"
    );

  } catch (error) {
    console.error("Profile load error:", error);

    setFormEnabled(true);

    showStatus(
      "প্রোফাইল লোড হয়নি (" +
      (error.code || "unknown") +
      ")। Firebase Rules ও ইন্টারনেট পরীক্ষা করুন।",
      "error"
    );
  }
}

window.addEventListener("pagehide", releasePhotoPreview);