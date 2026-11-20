// =========================================================
// AYNA BOOK
// Profile Controller
// Firebase SDK: 13.4.0
//
// Features:
// 1. Firebase Authentication
// 2. Firestore Profile
// 3. Profile Photo Preview
// 4. Firebase Storage Photo Upload
// 5. Firebase Auth Photo URL Update
// 6. Email Verification Status
// 7. Profile Save
// 8. Logout
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

const profilePhotoInput =
  document.getElementById("profilePhoto");

const profileImage =
  document.getElementById("profileImage");

const saveProfileButton =
  document.getElementById("saveProfileButton");

const logoutButton =
  document.getElementById("logoutButton");

const statusMessage =
  document.getElementById("statusMessage");

const verificationStatus =
  document.getElementById("verificationStatus");

const verificationText =
  document.getElementById("verificationText");

const userIdElement =
  document.getElementById("userId");

const createdAtElement =
  document.getElementById("createdAt");


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(
  message,
  type = "info"
) {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent =
    message;

  statusMessage.className =
    `status-message ${type}`;

  statusMessage.style.display =
    "block";
}


// =========================================================
// LOADING STATE
// =========================================================

function setLoading(
  loading
) {

  if (!saveProfileButton) {
    return;
  }

  saveProfileButton.disabled =
    loading;

  saveProfileButton.textContent =
    loading
      ? "SAVING..."
      : "SAVE PROFILE";
}


// =========================================================
// PHOTO PREVIEW
// =========================================================

function previewPhoto(file) {

  if (!profileImage) {
    return;
  }

  if (!file) {
    return;
  }

  const reader =
    new FileReader();

  reader.onload =
    function (event) {

      profileImage.src =
        event.target.result;
    };

  reader.onerror =
    function () {

      showStatus(
        "Profile photo preview করা যায়নি।",
        "error"
      );
    };

  reader.readAsDataURL(file);
}


// =========================================================
// PHOTO VALIDATION
// =========================================================

function validatePhoto(file) {

  if (!file) {

    return {
      valid: true
    };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {

    return {
      valid: false,
      message:
        "শুধু JPG, PNG অথবা WEBP ছবি ব্যবহার করুন।"
    };
  }

  if (
    file.size >
    MAX_PHOTO_SIZE
  ) {

    return {
      valid: false,
      message:
        "Profile photo সর্বোচ্চ 5 MB হতে পারবে।"
    };
  }

  return {
    valid: true
  };
}


// =========================================================
// LOAD PROFILE FROM FIRESTORE
// =========================================================

async function loadFirestoreProfile(
  user
) {

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );

  const snapshot =
    await getDoc(userRef);

  if (!snapshot.exists()) {

    return null;
  }

  return snapshot.data();
}


// =========================================================
// LOAD USER PROFILE
// =========================================================

async function loadProfile(
  user
) {

  try {

    showStatus(
      "Profile তথ্য লোড হচ্ছে...",
      "info"
    );

    await user.reload();

    const currentUser =
      auth.currentUser;

    if (!currentUser) {

      window.location.href =
        "./login.html";

      return;
    }


    // -----------------------------------------------------
    // Firestore Profile
    // -----------------------------------------------------

    let profileData =
      null;

    try {

      profileData =
        await loadFirestoreProfile(
          currentUser
        );

    } catch (firestoreError) {

      console.warn(
        "AYNA BOOK — Firestore profile load failed:",
        firestoreError
      );

      profileData =
        null;
    }


    // -----------------------------------------------------
    // Full Name
    // -----------------------------------------------------

    const savedName =
      profileData?.fullName ||
      currentUser.displayName ||
      "";

    if (fullNameInput) {

      fullNameInput.value =
        savedName;
    }


    // -----------------------------------------------------
    // Email
    // -----------------------------------------------------

    if (emailInput) {

      emailInput.value =
        currentUser.email ||
        profileData?.email ||
        "";
    }


    // -----------------------------------------------------
    // Phone
    // -----------------------------------------------------

    if (phoneInput) {

      phoneInput.value =
        profileData?.phone ||
        "";
    }


    // -----------------------------------------------------
    // Bio
    // -----------------------------------------------------

    if (bioInput) {

      bioInput.value =
        profileData?.bio ||
        "";
    }


    // -----------------------------------------------------
    // Country
    // -----------------------------------------------------

    if (countryInput) {

      countryInput.value =
        profileData?.country ||
        "";
    }


    // -----------------------------------------------------
    // Profile Photo
    // -----------------------------------------------------

    const savedPhotoURL =
      profileData?.photoURL ||
      currentUser.photoURL ||
      "";

    if (
      profileImage &&
      savedPhotoURL
    ) {

      profileImage.src =
        savedPhotoURL;
    }


    // -----------------------------------------------------
    // Verification Status
    // -----------------------------------------------------

    if (
      currentUser.emailVerified
    ) {

      if (verificationStatus) {

        verificationStatus.textContent =
          "✓";
      }

      if (verificationText) {

        verificationText.textContent =
          "Gmail Verified";
      }

    } else {

      if (verificationStatus) {

        verificationStatus.textContent =
          "!";
      }

      if (verificationText) {

        verificationText.textContent =
          "Gmail Not Verified";
      }
    }


    // -----------------------------------------------------
    // User ID
    // -----------------------------------------------------

    if (userIdElement) {

      userIdElement.textContent =
        currentUser.uid;
    }


    // -----------------------------------------------------
    // Created At
    // -----------------------------------------------------

    if (
      createdAtElement &&
      profileData?.createdAt
    ) {

      let createdDate;

      if (
        typeof profileData.createdAt.toDate ===
        "function"
      ) {

        createdDate =
          profileData.createdAt.toDate();

      } else {

        createdDate =
          new Date(
            profileData.createdAt
          );
      }

      if (
        !Number.isNaN(
          createdDate.getTime()
        )
      ) {

        createdAtElement.textContent =
          createdDate.toLocaleString(
            "en-BD"
          );
      }
    }


    showStatus(
      "Profile loaded successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Profile Load Error:",
      error
    );

    showStatus(
      "Profile তথ্য লোড করা যায়নি।",
      "error"
    );
  }
}


// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

async function uploadProfilePhoto(
  user,
  file
) {

  if (!file) {

    return user.photoURL ||
      "";
  }


  // -----------------------------------------------------
  // Validate Photo
  // -----------------------------------------------------

  const validation =
    validatePhoto(file);

  if (!validation.valid) {

    throw new Error(
      validation.message
    );
  }


  showStatus(
    "Profile photo Firebase Storage-এ upload হচ্ছে...",
    "info"
  );


  // -----------------------------------------------------
  // Storage Path
  // -----------------------------------------------------

  const photoRef =
    ref(
      storage,
      `users/${user.uid}/profile/profile-photo`
    );


  // -----------------------------------------------------
  // Upload
  // -----------------------------------------------------

  await uploadBytes(
    photoRef,
    file,
    {
      contentType:
        file.type,

      cacheControl:
        "public,max-age=3600"
    }
  );


  // -----------------------------------------------------
  // Download URL
  // -----------------------------------------------------

  const downloadURL =
    await getDownloadURL(
      photoRef
    );


  // -----------------------------------------------------
  // Update Firebase Auth Profile
  // -----------------------------------------------------

  await updateProfile(
    user,
    {
      photoURL:
        downloadURL
    }
  );


  return downloadURL;
}


// =========================================================
// SAVE PROFILE
// =========================================================

async function saveProfile() {

  const user =
    auth.currentUser;

  if (!user) {

    window.location.href =
      "./login.html";

    return;
  }


  try {

    setLoading(true);

    showStatus(
      "Profile save হচ্ছে...",
      "info"
    );


    // -----------------------------------------------------
    // Reload User
    // -----------------------------------------------------

    await user.reload();


    const currentUser =
      auth.currentUser;

    if (!currentUser) {

      throw new Error(
        "Login session পাওয়া যায়নি।"
      );
    }


    // -----------------------------------------------------
    // Get Form Values
    // -----------------------------------------------------

    const fullName =
      fullNameInput?.value.trim() ||
      "";

    const phone =
      phoneInput?.value.trim() ||
      "";

    const bio =
      bioInput?.value.trim() ||
      "";

    const country =
      countryInput?.value.trim() ||
      "";


    // -----------------------------------------------------
    // Name Validation
    // -----------------------------------------------------

    if (
      fullName.length < 2
    ) {

      throw new Error(
        "Full Name কমপক্ষে ২ অক্ষরের হতে হবে।"
      );
    }


    // -----------------------------------------------------
    // Selected Photo
    // -----------------------------------------------------

    const selectedFile =
      profilePhotoInput?.files?.[0] ||
      null;


    // -----------------------------------------------------
    // Upload Photo If Selected
    // -----------------------------------------------------

    let photoURL =
      currentUser.photoURL ||
      "";


    if (selectedFile) {

      photoURL =
        await uploadProfilePhoto(
          currentUser,
          selectedFile
        );
    }


    // -----------------------------------------------------
    // Update Auth Display Name
    // -----------------------------------------------------

    showStatus(
      "Account profile update হচ্ছে...",
      "info"
    );

    await updateProfile(
      currentUser,
      {
        displayName:
          fullName,

        photoURL:
          photoURL || null
      }
    );


    // -----------------------------------------------------
    // Firestore User Document
    // -----------------------------------------------------

    showStatus(
      "Secure profile data Firestore-এ save হচ্ছে...",
      "info"
    );


    const userRef =
      doc(
        db,
        "users",
        currentUser.uid
      );


    // -----------------------------------------------------
    // Save Profile Data
    // -----------------------------------------------------

    await setDoc(
      userRef,
      {
        uid:
          currentUser.uid,

        fullName:
          fullName,

        email:
          currentUser.email ||
          "",

        phone:
          phone,

        bio:
          bio,

        country:
          country,

        emailVerified:
          currentUser.emailVerified,

        photoURL:
          photoURL,

        accountType:
          "personal",

        accountStatus:
          "active",

        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );


    // -----------------------------------------------------
    // Refresh Photo
    // -----------------------------------------------------

    if (
      profileImage &&
      photoURL
    ) {

      profileImage.src =
        photoURL;
    }


    // -----------------------------------------------------
    // Success
    // -----------------------------------------------------

    setLoading(false);

    showStatus(
      "Profile সফলভাবে Save হয়েছে।",
      "success"
    );


    // -----------------------------------------------------
    // Clear Selected File
    // -----------------------------------------------------

    if (profilePhotoInput) {

      profilePhotoInput.value =
        "";
    }


    console.log(
      "AYNA BOOK — Profile saved successfully:",
      currentUser.uid
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Profile Save Error:",
      error
    );


    setLoading(false);


    let message =
      "Profile Save করা যায়নি।";


    // -----------------------------------------------------
    // Firebase Storage Errors
    // -----------------------------------------------------

    switch (error?.code) {

      case "storage/unauthorized":

        message =
          "Profile photo upload করার অনুমতি নেই। Storage Rules পরীক্ষা করুন.";

        break;


      case "storage/quota-exceeded":

        message =
          "Firebase Storage quota শেষ হয়ে গেছে.";

        break;


      case "storage/canceled":

        message =
          "Photo upload বাতিল হয়েছে.";

        break;


      case "storage/unknown":

        message =
          "Firebase Storage-এ অজানা সমস্যা হয়েছে.";

        break;


      case "permission-denied":

        message =
          "Firestore permission denied. Firestore Rules পরীক্ষা করুন.";

        break;


      case "unauthenticated":

        message =
          "আপনার Login session নেই। আবার Login করুন.";

        break;


      default:

        message =
          error?.message ||
          "Profile Save করা যায়নি।";
    }


    showStatus(
      message,
      "error"
    );
  }
}


// =========================================================
// PHOTO INPUT EVENT
// =========================================================

if (
  profilePhotoInput
) {

  profilePhotoInput.addEventListener(
    "change",
    function () {

      const file =
        this.files?.[0] ||
        null;

      if (!file) {
        return;
      }


      const validation =
        validatePhoto(file);


      if (!validation.valid) {

        showStatus(
          validation.message,
          "error"
        );

        this.value =
          "";

        return;
      }


      previewPhoto(
        file
      );


      showStatus(
        "Photo preview প্রস্তুত। SAVE PROFILE চাপুন।",
        "info"
      );
    }
  );
}


// =========================================================
// PROFILE FORM SUBMIT
// =========================================================

if (profileForm) {

  profileForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      if (
        saveProfileButton?.disabled
      ) {

        return;
      }

      await saveProfile();
    }
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

        logoutButton.disabled =
          true;

        logoutButton.textContent =
          "LOGGING OUT...";


        await signOut(
          auth
        );


        window.location.href =
          "./login.html";

      } catch (error) {

        console.error(
          "AYNA BOOK — Logout Error:",
          error
        );

        logoutButton.disabled =
          false;

        logoutButton.textContent =
          "LOGOUT";


        showStatus(
          "Logout করা যায়নি। আবার চেষ্টা করুন।",
          "error"
        );
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

      window.location.href =
        "./login.html";

      return;
    }


    console.log(
      "AYNA BOOK — Logged in user:",
      user.uid
    );


    await loadProfile(
      user
    );
  }
);


// =========================================================
// INITIAL CONSOLE MESSAGE
// =========================================================

console.log(
  "AYNA BOOK — profile.js loaded successfully."
);

console.log(
  "AYNA BOOK — Profile + Firestore + Storage system active."
);