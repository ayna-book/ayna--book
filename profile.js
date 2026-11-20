
// =========================================================
// AYNA BOOK
// Profile Controller
// Firebase SDK: 13.4.0
//
// Profile Management
// Firestore + Firebase Storage
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// CONFIGURATION
// =========================================================

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// HTML ELEMENTS
// =========================================================

const profileImage =
  document.getElementById("profileImage");

const profilePhoto =
  document.getElementById("profilePhoto");

const profileForm =
  document.getElementById("profileForm");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const bioInput =
  document.getElementById("bio");

const countryInput =
  document.getElementById("country");

const verificationStatus =
  document.getElementById("verificationStatus");

const verificationText =
  document.getElementById("verificationText");

const saveProfileButton =
  document.getElementById("saveProfileButton");

const statusMessage =
  document.getElementById("statusMessage");

const logoutButton =
  document.getElementById("logoutButton");

const userIdElement =
  document.getElementById("userId");

const createdAtElement =
  document.getElementById("createdAt");


// =========================================================
// CURRENT USER
// =========================================================

let currentUser = null;


// =========================================================
// MESSAGE
// =========================================================

function showMessage(message) {

  if (statusMessage) {
    statusMessage.textContent =
      message || "";
  }

}


// =========================================================
// VERIFICATION STATUS
// =========================================================

function updateVerificationStatus(user) {

  if (!verificationStatus ||
      !verificationText) {
    return;
  }

  if (user.emailVerified) {

    verificationStatus.textContent =
      "VERIFIED";

    verificationText.textContent =
      "আপনার Gmail Verified হয়েছে।";

  } else {

    verificationStatus.textContent =
      "NOT VERIFIED";

    verificationText.textContent =
      "আপনার Gmail এখনো Verify করা হয়নি।";

  }

}


// =========================================================
// PHOTO PREVIEW
// =========================================================

if (profilePhoto) {

  profilePhoto.addEventListener(
    "change",
    function () {

      const file =
        profilePhoto.files?.[0];

      if (!file) {
        return;
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

        showMessage(
          "শুধু JPG, PNG অথবা WEBP ছবি ব্যবহার করুন।"
        );

        profilePhoto.value = "";

        return;
      }

      if (file.size > MAX_PHOTO_SIZE) {

        showMessage(
          "ছবির সাইজ সর্বোচ্চ 5MB হতে পারবে।"
        );

        profilePhoto.value = "";

        return;
      }

      const previewURL =
        URL.createObjectURL(file);

      if (profileImage) {

        profileImage.src =
          previewURL;

      }

      showMessage(
        "ছবির Preview প্রস্তুত। Save করলে Upload হবে।"
      );

    }
  );

}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile(user) {

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );

    const snapshot =
      await getDoc(userRef);

    const profile =
      snapshot.exists()
        ? snapshot.data()
        : {};

    if (fullNameInput) {

      fullNameInput.value =
        profile.fullName ||
        user.displayName ||
        "";

    }

    if (emailInput) {

      emailInput.value =
        user.email || "";

    }

    if (phoneInput) {

      phoneInput.value =
        profile.phone || "";

    }

    if (bioInput) {

      bioInput.value =
        profile.bio || "";

    }

    if (countryInput) {

      countryInput.value =
        profile.country || "";

    }

    if (profileImage) {

      profileImage.src =
        profile.photoURL ||
        user.photoURL ||
        "./assets/default-avatar.png";

    }

    if (userIdElement) {

      userIdElement.textContent =
        user.uid;

    }

    if (createdAtElement) {

      const createdAt =
        profile.createdAt;

      createdAtElement.textContent =
        createdAt?.toDate
          ? createdAt.toDate().toLocaleDateString("bn-BD")
          : "তথ্য পাওয়া যায়নি";

    }

    updateVerificationStatus(user);

    showMessage(
      "Profile Load হয়েছে।"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Profile Load Error:",
      error
    );

    showMessage(
      "Profile Load করা যায়নি। Firestore Rules পরীক্ষা করুন।"
    );

  }

}


// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

async function uploadProfilePhoto(user) {

  const file =
    profilePhoto?.files?.[0];

  if (!file) {

    return user.photoURL || "";

  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

    throw new Error(
      "ছবির Format সঠিক নয়।"
    );

  }

  if (file.size > MAX_PHOTO_SIZE) {

    throw new Error(
      "ছবির সাইজ 5MB-এর বেশি।"
    );

  }

  const photoRef =
    ref(
      storage,
      `users/${user.uid}/profile/profile-photo`
    );

  await uploadBytes(
    photoRef,
    file,
    {
      contentType: file.type
    }
  );

  return await getDownloadURL(
    photoRef
  );

}


// =========================================================
// SAVE PROFILE
// =========================================================

async function saveProfile(event) {

  event.preventDefault();

  if (!currentUser) {

    showMessage(
      "আপনার Login Session পাওয়া যায়নি।"
    );

    return;

  }

  const fullName =
    fullNameInput?.value.trim() || "";

  const phone =
    phoneInput?.value.trim() || "";

  const bio =
    bioInput?.value.trim() || "";

  const country =
    countryInput?.value.trim() || "";

  if (fullName.length < 2) {

    showMessage(
      "নাম কমপক্ষে ২ অক্ষরের হতে হবে।"
    );

    return;

  }

  if (fullName.length > 100 ||
      phone.length > 25 ||
      bio.length > 500 ||
      country.length > 100) {

    showMessage(
      "কোনো Profile তথ্য নির্ধারিত সীমার চেয়ে বড়।"
    );

    return;

  }

  saveProfileButton.disabled = true;

  saveProfileButton.textContent =
    "SAVING...";

  showMessage(
    "Profile Save হচ্ছে..."
  );

  try {

    const photoURL =
      await uploadProfilePhoto(
        currentUser
      );

    await updateProfile(
      currentUser,
      {
        displayName: fullName,
        photoURL
      }
    );

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
      );

    const snapshot =
      await getDoc(userRef);

    const profileData = {

      uid: currentUser.uid,

      fullName,

      email: currentUser.email || "",

      phone,

      bio,

      country,

      emailVerified:
        currentUser.emailVerified,

      photoURL,

      updatedAt:
        serverTimestamp()

    };

    if (!snapshot.exists()) {

      profileData.createdAt =
        serverTimestamp();

    }

    await setDoc(
      userRef,
      profileData,
      {
        merge: true
      }
    );

    if (profileImage && photoURL) {

      profileImage.src =
        photoURL;

    }

    showMessage(
      "AYNA BOOK Profile সফলভাবে Save হয়েছে।"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Profile Save Error:",
      error
    );

    showMessage(
      error.message ||
      "Profile Save করা যায়নি।"
    );

  } finally {

    saveProfileButton.disabled =
      false;

    saveProfileButton.textContent =
      "SAVE PROFILE";

  }

}


// =========================================================
// SAVE EVENT
// =========================================================

if (profileForm) {

  profileForm.addEventListener(
    "submit",
    saveProfile
  );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async function () {

      try {

        logoutButton.disabled = true;

        await signOut(auth);

        window.location.replace(
          "./login.html"
        );

      } catch (error) {

        console.error(
          "AYNA BOOK — Logout Error:",
          error
        );

        showMessage(
          "Logout করা যায়নি। আবার চেষ্টা করুন।"
        );

        logoutButton.disabled = false;

      }

    }
  );

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,
  async function (user) {

    if (!user) {

      window.location.replace(
        "./login.html"
      );

      return;

    }

    currentUser = user;

    await loadProfile(user);

  }
);


// =========================================================
// MODULE READY
// =========================================================

console.log(
  "AYNA BOOK — Profile Controller Loaded Successfully."
);
