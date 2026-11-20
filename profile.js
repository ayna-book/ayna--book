// =========================================================
// AYNA BOOK
// Profile Controller
// Step 12
// Firebase SDK: 13.4.0
// =========================================================

import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const profileForm =
  document.getElementById("profileForm");

const profileImage =
  document.getElementById("profileImage");

const profilePhoto =
  document.getElementById("profilePhoto");

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

const logoutButton =
  document.getElementById("logoutButton");

const statusMessage =
  document.getElementById("statusMessage");

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
// FORMAT DATE
// =========================================================

function formatDate(dateValue) {

  if (!dateValue) {
    return "Not available";
  }

  try {

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Date formatting error:",
      error
    );

    return "Not available";
  }
}


// =========================================================
// LOAD FIREBASE USER
// =========================================================

function loadUserProfile(user) {

  if (!user) {
    return;
  }


  // -------------------------------------------------------
  // Full Name
  // -------------------------------------------------------

  if (fullNameInput) {

    fullNameInput.value =
      user.displayName || "";

  }


  // -------------------------------------------------------
  // Gmail
  // -------------------------------------------------------

  if (emailInput) {

    emailInput.value =
      user.email || "";

  }


  // -------------------------------------------------------
  // User ID
  // -------------------------------------------------------

  if (userIdElement) {

    userIdElement.textContent =
      user.uid || "Not available";

  }


  // -------------------------------------------------------
  // Account Created
  // -------------------------------------------------------

  if (createdAtElement) {

    createdAtElement.textContent =
      formatDate(
        user.metadata?.creationTime
      );

  }


  // -------------------------------------------------------
  // Email Verification
  // -------------------------------------------------------

  if (verificationText) {

    if (user.emailVerified) {

      verificationText.textContent =
        "Email Verified ✓";

      verificationText.className =
        "verification-text verified";

    } else {

      verificationText.textContent =
        "Email Not Verified";

      verificationText.className =
        "verification-text not-verified";

    }

  }


  // -------------------------------------------------------
  // Existing Profile Photo
  // -------------------------------------------------------

  if (
    profileImage &&
    user.photoURL
  ) {

    profileImage.src =
      user.photoURL;

  }

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      console.log(
        "AYNA BOOK — No authenticated user."
      );

      window.location.href =
        "./login.html";

      return;
    }


    console.log(
      "AYNA BOOK — Profile User:",
      user.uid
    );


    try {

      await user.reload();

      const currentUser =
        auth.currentUser;

      if (!currentUser) {

        window.location.href =
          "./login.html";

        return;
      }


      loadUserProfile(
        currentUser
      );

    } catch (error) {

      console.error(
        "AYNA BOOK — Profile loading error:",
        error
      );

      showStatus(
        "Profile তথ্য লোড করতে সমস্যা হয়েছে।",
        "error"
      );

    }

  }
);


// =========================================================
// PROFILE PHOTO PREVIEW
// =========================================================

if (profilePhoto) {

  profilePhoto.addEventListener(
    "change",
    () => {

      const file =
        profilePhoto.files?.[0];

      if (!file) {
        return;
      }


      if (!file.type.startsWith("image/")) {

        showStatus(
          "শুধু Image file নির্বাচন করুন।",
          "error"
        );

        profilePhoto.value = "";

        return;
      }


      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        showStatus(
          "Profile Photo সর্বোচ্চ 5 MB হতে হবে।",
          "error"
        );

        profilePhoto.value = "";

        return;
      }


      const reader =
        new FileReader();


      reader.onload = () => {

        if (profileImage) {

          profileImage.src =
            reader.result;

        }

      };


      reader.onerror = () => {

        showStatus(
          "ছবিটি Preview করা যায়নি।",
          "error"
        );

      };


      reader.readAsDataURL(file);

    }
  );

}


// =========================================================
// PROFILE FORM
// =========================================================

if (profileForm) {

  profileForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const user =
        auth.currentUser;


      if (!user) {

        showStatus(
          "Login session পাওয়া যায়নি।",
          "error"
        );

        return;
      }


      const fullName =
        fullNameInput?.value.trim() || "";


      if (fullName.length < 2) {

        showStatus(
          "Full Name কমপক্ষে ২ অক্ষরের হতে হবে।",
          "error"
        );

        return;
      }


      /*
       * Step 12-এ আমরা শুধু UI এবং
       * Authentication connection পরীক্ষা করছি।
       *
       * Firestore Save এবং Storage Upload
       * পরবর্তী ধাপে যোগ করা হবে।
       */

      showStatus(
        "Profile Save System পরবর্তী ধাপে যুক্ত হবে।",
        "info"
      );

    }
  );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      try {

        logoutButton.disabled =
          true;

        logoutButton.textContent =
          "LOGGING OUT...";


        await signOut(auth);


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
          "LOG OUT";


        showStatus(
          "Logout করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          "error"
        );

      }

    }
  );

}


// =========================================================
// INITIAL LOG
// =========================================================

console.log(
  "AYNA BOOK — profile.js loaded successfully."
);

console.log(
  "AYNA BOOK — Profile Controller Step 12 active."
);