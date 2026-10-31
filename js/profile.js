
// =============================================
// AYNA BOOK — SECURE PROFILE SYSTEM
// Firebase Authentication + Firestore
// Maximum profile photo preview: 500 KB
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

// HTML elements
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

// Settings
const MAX_PHOTO_SIZE = 500 * 1024;

let currentUser = null;
let saving = false;
let localPhotoUrl = null;

// Show status message
function showStatus(message, type = "info") {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.dataset.type = type;

  console.log("[AYNA BOOK]", message);
}

// Account status
function setAccountStatus(message) {
  if (accountStatus) {
    accountStatus.textContent = message;
  }
}

// Enable or disable profile form
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

// Release previous photo preview
function releasePhotoPreview() {
  if (localPhotoUrl) {
    URL.revokeObjectURL(localPhotoUrl);
    localPhotoUrl = null;
  }
}

// Clear photo preview
function clearPhotoPreview() {
  releasePhotoPreview();

  if (photoPreview) {
    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;
  }
}

// Preview selected photo
function previewPhoto(file) {
  clearPhotoPreview();

  localPhotoUrl = URL.createObjectURL(file);

  photoPreview.src = localPhotoUrl;
  photoPreview.hidden = false;

  photoPreview.onerror = () => {
    clearPhotoPreview();

    showStatus(
      "ছবির প্রিভিউ তৈরি করা যায়নি। অন্য ছবি নির্বাচন করুন।",
      "error"
    );
  };
}

// Global error handling
window.addEventListener("error", event => {
  console.error("Profile error:", event.error || event.message);

  showStatus(
    "পেজে একটি সমস্যা হয়েছে। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।",
    "error"
  );
});

window.addEventListener("unhandledrejection", event => {
  console.error("Profile async error:", event.reason);

  showStatus(
    "একটি কাজ সম্পন্ন হয়নি। ইন্টারনেট ও Firebase সংযোগ পরীক্ষা করুন।",
    "error"
  );
});

// Check required HTML elements
function checkElements() {
  const required = [
    form,
    nameInput,
    emailInput,
    phoneInput,
    locationInput,
    bioInput,
    photoInput,
    photoPreview,
    saveButton,
    logoutButton,
    statusElement,
    accountStatus
  ];

  return required.every(Boolean);
}

// =============================================
// START PROFILE SYSTEM
// =============================================

function startProfile() {

  setFormEnabled(false);

  showStatus("আপনার অ্যাকাউন্ট যাচাই হচ্ছে...");

  onAuthStateChanged(
    auth,

    async user => {

      // No logged-in account
      if (!user) {
        currentUser = null;

        setAccountStatus("লগইন করা নেই।");

        showStatus(
          "প্রোফাইল দেখতে আগে লগইন করুন।"
        );

        window.location.replace("./login.html");
        return;
      }

      // Reject anonymous or email-less accounts
      if (user.isAnonymous || !user.email) {

        currentUser = null;

        showStatus(
          "সঠিক ইমেইল অ্যাকাউন্ট দিয়ে লগইন করুন।",
          "error"
        );

        try {
          await signOut(auth);
        } catch (error) {
          console.error("Sign out error:", error);
        }

        window.location.replace("./login.html");
        return;
      }

      // Reject unverified email accounts
      if (!user.emailVerified) {

        currentUser = null;

        showStatus(
          "আপনার ইমেইল যাচাই করা হয়নি। Gmail যাচাই করুন।",
          "error"
        );

        try {
          await signOut(auth);
        } catch (error) {
          console.error("Sign out error:", error);
        }

        window.location.replace("./login.html");
        return;
      }

      currentUser = user;

      emailInput.value = user.email;

      setAccountStatus(
        "লগইন করা অ্যাকাউন্ট: " + user.email
      );

      await loadProfile(user);
    },

    error => {

      console.error("Authentication error:", error);

      currentUser = null;

      setAccountStatus("অ্যাকাউন্ট যাচাই করা যায়নি।");

      showStatus(
        "Firebase Authentication সমস্যা: " +
        (error.code || "unknown"),
        "error"
      );
    }
  );

  // Photo selection
  photoInput.addEventListener("change", () => {

    const file = photoInput.files?.[0];

    if (!file) {
      clearPhotoPreview();
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
        "শুধু JPG, PNG অথবা WEBP ছবি ব্যবহার করুন।",
        "error"
      );

      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {

      photoInput.value = "";
      clearPhotoPreview();

      showStatus(
        "ছবির সাইজ 500 KB-এর বেশি। ছোট ছবি নির্বাচন করুন।",
        "error"
      );

      return;
    }

    previewPhoto(file);

    showStatus(
      "ছবি নির্বাচিত হয়েছে। এটি শুধু প্রিভিউতে দেখা যাবে।",
      "success"
    );
  });

  // Save profile
  form.addEventListener("submit", async event => {

    event.preventDefault();

    if (saving) return;

    if (!currentUser || currentUser.isAnonymous || !currentUser.email) {

      showStatus(
        "প্রথমে ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন।",
        "error"
      );

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

    if (
      phone &&
      !/^\+?[0-9 ()-]{7,20}$/.test(phone)
    ) {

      showStatus(
        "সঠিক ফোন নম্বর লিখুন।",
        "error"
      );

      phoneInput.focus();

      return;
    }

    const selectedPhoto = photoInput.files?.[0];

    if (selectedPhoto && selectedPhoto.size > MAX_PHOTO_SIZE) {

      showStatus(
        "ছবির সাইজ সর্বোচ্চ 500 KB হতে পারবে।",
        "error"
      );

      return;
    }

    saving = true;

    saveButton.disabled = true;
    logoutButton.disabled = true;

    showStatus("Firebase-এ প্রোফাইল সংরক্ষণ হচ্ছে...");

    try {

      const profileRef = doc(
        db,
        "users",
        currentUser.uid
      );

      await setDoc(
        profileRef,
        {
          uid: currentUser.uid,
          name: name,
          email: currentUser.email,
          phone: phone,
          location: location,
          bio: bio,
          updatedAt: serverTimestamp()
        },
        {
          merge: true
        }
      );

      // Update Firebase display name
      try {

        await updateProfile(currentUser, {
          displayName: name
        });

      } catch (profileError) {

        console.warn(
          "Display name update warning:",
          profileError
        );
      }

      showStatus(
        "✅ আপনার প্রোফাইল সফলভাবে সংরক্ষণ হয়েছে। ছবিটি অনলাইনে সংরক্ষিত হয়নি।",
        "success"
      );

    } catch (error) {

      console.error("Profile save error:", error);

      const messages = {

        "permission-denied":
          "Firebase Firestore অনুমতি দেয়নি। Security Rules পরীক্ষা করুন।",

        "unavailable":
          "Firebase সার্ভার পাওয়া যাচ্ছে না। পরে চেষ্টা করুন।",

        "network-request-failed":
          "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

        "unauthenticated":
          "আপনার লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।"
      };

      showStatus(
        messages[error.code] ||
        "প্রোফাইল সংরক্ষণ হয়নি। আবার চেষ্টা করুন।",
        "error"
      );

    } finally {

      saving = false;

      saveButton.disabled = false;
      logoutButton.disabled = false;
    }
  });

  // Logout
  logoutButton.addEventListener("click", async () => {

    if (!currentUser) return;

    logoutButton.disabled = true;
    saveButton.disabled = true;

    showStatus("আপনার অ্যাকাউন্ট থেকে লগআউট হচ্ছে...");

    try {

      await signOut(auth);

      currentUser = null;

      window.location.replace("./login.html");

    } catch (error) {

      console.error("Logout error:", error);

      showStatus(
        "লগআউট করা যায়নি। আবার চেষ্টা করুন।",
        "error"
      );

      logoutButton.disabled = false;
      saveButton.disabled = false;
    }
  });
}

// =============================================
// LOAD PROFILE FROM FIRESTORE
// =============================================

async function loadProfile(user) {

  showStatus("আপনার প্রোফাইল লোড হচ্ছে...");

  try {

    const profileRef = doc(
      db,
      "users",
      user.uid
    );

    const snapshot = await getDoc(profileRef);

    if (snapshot.exists()) {

      const data = snapshot.data();

      nameInput.value =
        data.name || user.displayName || "";

      phoneInput.value =
        data.phone || user.phoneNumber || "";

      locationInput.value =
        data.location || "";

      bioInput.value =
        data.bio || "";

    } else {

      nameInput.value =
        user.displayName || "";

      phoneInput.value =
        user.phoneNumber || "";

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

    console.error("Profile loading error:", error);

    setFormEnabled(true);

    showStatus(
      "প্রোফাইল লোড হয়নি। Firebase Firestore Rules ও ইন্টারনেট পরীক্ষা করুন।",
      "error"
    );
  }
}

// =============================================
// INITIALIZE
// =============================================

if (checkElements()) {

  startProfile();

} else {

  console.error(
    "AYNA BOOK: Required profile HTML elements are missing."
  );

  showStatus(
    "প্রোফাইল HTML-এর প্রয়োজনীয় অংশ পাওয়া যায়নি। profile.html পরীক্ষা করুন।",
    "error"
  );
}

// Clean up photo preview
window.addEventListener(
  "pagehide",
  releasePhotoPreview
);
