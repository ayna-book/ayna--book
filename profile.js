// =========================================================
// AYNA BOOK
// PROFILE EDIT CONTROLLER
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase.js";

import {
  watchAuthState,
  getAuthErrorMessage
} from "./auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// ELEMENTS
// =========================================================

const fullNameInput =
  document.getElementById("fullName");

const phoneInput =
  document.getElementById("phone");

const countryInput =
  document.getElementById("country");

const bioInput =
  document.getElementById("bio");

const profilePhotoInput =
  document.getElementById("profilePhoto");

const saveButton =
  document.getElementById("saveProfileButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// CURRENT USER
// =========================================================

let currentUser = null;


// =========================================================
// STATUS
// =========================================================

function showStatus(
  message,
  type = "info"
) {

  if (!statusMessage) return;

  statusMessage.textContent = message;

  statusMessage.style.display = "block";

  statusMessage.className =
    `status-message ${type}`;

}


// =========================================================
// VALIDATION
// =========================================================

function validateProfile() {

  const fullName =
    fullNameInput?.value.trim() || "";

  const phone =
    phoneInput?.value.trim() || "";

  const country =
    countryInput?.value.trim() || "";

  const bio =
    bioInput?.value.trim() || "";


  if (fullName.length < 2) {

    showStatus(
      "Full Name কমপক্ষে ২ অক্ষরের হতে হবে।",
      "error"
    );

    return false;
  }


  if (fullName.length > 100) {

    showStatus(
      "Full Name সর্বোচ্চ ১০০ অক্ষর হতে পারবে।",
      "error"
    );

    return false;
  }


  if (phone.length > 30) {

    showStatus(
      "Phone Number সঠিকভাবে দিন।",
      "error"
    );

    return false;
  }


  if (country.length > 100) {

    showStatus(
      "Country সর্বোচ্চ ১০০ অক্ষর হতে পারবে।",
      "error"
    );

    return false;
  }


  if (bio.length > 500) {

    showStatus(
      "Bio সর্বোচ্চ ৫০০ অক্ষর হতে পারবে।",
      "error"
    );

    return false;
  }


  return true;
}


// =========================================================
// PROFILE PHOTO UPLOAD
// =========================================================

async function uploadProfilePhoto(user) {

  if (!profilePhotoInput) {
    return "";
  }


  const file =
    profilePhotoInput.files?.[0];


  if (!file) {
    return "";
  }


  // -------------------------------------------------------
  // File type
  // -------------------------------------------------------

  if (!file.type.startsWith("image/")) {

    throw new Error(
      "শুধু image file upload করা যাবে।"
    );

  }


  // -------------------------------------------------------
  // 5 MB limit
  // -------------------------------------------------------

  const maxSize =
    5 * 1024 * 1024;


  if (file.size > maxSize) {

    throw new Error(
      "Profile photo সর্বোচ্চ 5 MB হতে পারবে।"
    );

  }


  // -------------------------------------------------------
  // Storage path
  // -------------------------------------------------------

  const extension =
    file.name.includes(".")
      ? file.name
          .split(".")
          .pop()
          .toLowerCase()
      : "jpg";


  const fileName =
    `profile-${Date.now()}.${extension}`;


  const storagePath =
    `users/${user.uid}/profile/${fileName}`;


  const storageRef =
    ref(storage, storagePath);


  // -------------------------------------------------------
  // Upload
  // -------------------------------------------------------

  await uploadBytes(
    storageRef,
    file,
    {
      contentType: file.type
    }
  );


  // -------------------------------------------------------
  // Download URL
  // -------------------------------------------------------

  const downloadURL =
    await getDownloadURL(storageRef);


  return downloadURL;
}


// =========================================================
// LOAD EXISTING PROFILE
// =========================================================

async function loadProfile(user) {

  try {

    const userRef =
      doc(db, "users", user.uid);

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      if (fullNameInput) {
        fullNameInput.value =
          user.displayName || "";
      }

      return;
    }


    const data =
      snapshot.data();


    if (fullNameInput) {

      fullNameInput.value =
        data.fullName ||
        data.name ||
        user.displayName ||
        "";

    }


    if (phoneInput) {

      phoneInput.value =
        data.phone || "";

    }


    if (countryInput) {

      countryInput.value =
        data.country || "";

    }


    if (bioInput) {

      bioInput.value =
        data.bio || "";

    }


  } catch (error) {

    console.error(
      "AYNA BOOK profile load error:",
      error
    );


    showStatus(
      getAuthErrorMessage(error) ||
      "Profile তথ্য load করা যায়নি।",
      "error"
    );

  }

}


// =========================================================
// SAVE PROFILE
// =========================================================

async function saveProfile() {

  if (!currentUser) {

    showStatus(
      "আগে Login করুন।",
      "error"
    );

    return;
  }


  if (!validateProfile()) {
    return;
  }


  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent =
      "Saving...";
  }


  try {

    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
      );


    // -----------------------------------------------------
    // Existing document
    // -----------------------------------------------------

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      throw new Error(
        "আপনার AYNA BOOK profile document পাওয়া যায়নি।"
      );

    }


    // -----------------------------------------------------
    // Upload photo if selected
    // -----------------------------------------------------

    let photoURL = "";


    if (profilePhotoInput?.files?.length) {

      showStatus(
        "Profile photo upload হচ্ছে...",
        "info"
      );


      photoURL =
        await uploadProfilePhoto(
          currentUser
        );

    }


    // -----------------------------------------------------
    // Profile data
    // -----------------------------------------------------

    const profileData = {

      fullName:
        fullNameInput?.value.trim() || "",

      name:
        fullNameInput?.value.trim() || "",

      phone:
        phoneInput?.value.trim() || "",

      country:
        countryInput?.value.trim() || "",

      bio:
        bioInput?.value.trim() || "",

      updatedAt:
        serverTimestamp()

    };


    // -----------------------------------------------------
    // Photo URL
    // -----------------------------------------------------

    if (photoURL) {

      profileData.photoURL =
        photoURL;

    }


    // -----------------------------------------------------
    // Update Firestore
    // -----------------------------------------------------

    await updateDoc(
      userRef,
      profileData
    );


    showStatus(
      "Profile সফলভাবে আপডেট হয়েছে।",
      "success"
    );


    if (saveButton) {

      saveButton.textContent =
        "Saved ✓";

    }


  } catch (error) {

    console.error(
      "AYNA BOOK profile save error:",
      error
    );


    let message =
      error?.message ||
      getAuthErrorMessage(error) ||
      "Profile update করা যায়নি।";


    if (
      error?.code ===
      "permission-denied"
    ) {

      message =
        "Profile update permission denied। Firestore Rules পরীক্ষা করুন।";

    }


    if (
      error?.code ===
      "storage/unauthorized"
    ) {

      message =
        "Profile photo upload permission denied। Storage Rules পরীক্ষা করুন।";

    }


    showStatus(
      message,
      "error"
    );


    if (saveButton) {

      saveButton.disabled = false;

      saveButton.textContent =
        "Save Profile";

    }

  }

}


// =========================================================
// SAVE BUTTON
// =========================================================

if (saveButton) {

  saveButton.addEventListener(
    "click",
    saveProfile
  );

}


// =========================================================
// AUTH STATE
// =========================================================

watchAuthState(
  async (user) => {

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
// GLOBAL ACCESS
// =========================================================

if (
  typeof window !== "undefined"
) {

  window.saveAYNAProfile =
    saveProfile;

}