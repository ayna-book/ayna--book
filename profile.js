// =========================================================
// AYNA BOOK
// PROFILE VIEW CONTROLLER
// File: profile.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  watchAuthState,
  logoutUser,
  getAuthErrorMessage
} from "./auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const loadingMessage =
  document.getElementById("loadingMessage");

const profileCard =
  document.getElementById("profileCard");

const statusMessage =
  document.getElementById("statusMessage");

const logoutButton =
  document.getElementById("logoutButton");

const avatar =
  document.getElementById("avatar");

const profileName =
  document.getElementById("profileName");

const profileEmail =
  document.getElementById("profileEmail");

const verificationStatus =
  document.getElementById("verificationStatus");

const uidValue =
  document.getElementById("uidValue");

const accountTypeValue =
  document.getElementById("accountTypeValue");

const phoneValue =
  document.getElementById("phoneValue");

const countryValue =
  document.getElementById("countryValue");

const planValue =
  document.getElementById("planValue");

const accountStatusValue =
  document.getElementById("accountStatusValue");

const bioValue =
  document.getElementById("bioValue");


// =========================================================
// STATUS
// =========================================================

function showStatus(message, type = "") {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent =
    message;

  statusMessage.className =
    "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }

}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

  if (loadingMessage) {

    loadingMessage.style.display =
      "block";

    loadingMessage.textContent =
      "Profile loading...";

  }

  if (profileCard) {

    profileCard.style.display =
      "none";

  }

}


// =========================================================
// SHOW PROFILE
// =========================================================

function showProfile() {

  if (loadingMessage) {

    loadingMessage.style.display =
      "none";

  }

  if (profileCard) {

    profileCard.style.display =
      "block";

  }

}


// =========================================================
// DEFAULT AVATAR
// =========================================================

function setDefaultAvatar() {

  if (!avatar) {
    return;
  }

  avatar.src =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="160"
        height="160"
        viewBox="0 0 160 160"
      >
        <rect
          width="160"
          height="160"
          rx="80"
          fill="#20242d"
        />

        <circle
          cx="80"
          cy="62"
          r="30"
          fill="#8d94a3"
        />

        <path
          d="
            M30 145
            C34 108 53 94 80 94
            C107 94 126 108 130 145
            Z
          "
          fill="#8d94a3"
        />
      </svg>
    `);

}


// =========================================================
// SET AUTH PROFILE IMMEDIATELY
// =========================================================

function showAuthProfile(user) {

  if (!user) {
    return;
  }


  // -------------------------------------------------------
  // Name
  // -------------------------------------------------------

  if (profileName) {

    profileName.textContent =
      user.displayName ||
      "AYNA BOOK User";

  }


  // -------------------------------------------------------
  // Email
  // -------------------------------------------------------

  if (profileEmail) {

    profileEmail.textContent =
      user.email ||
      "Not available";

  }


  // -------------------------------------------------------
  // UID
  // -------------------------------------------------------

  if (uidValue) {

    uidValue.textContent =
      user.uid ||
      "Not available";

  }


  // -------------------------------------------------------
  // Verification
  // -------------------------------------------------------

  if (verificationStatus) {

    if (user.emailVerified) {

      verificationStatus.textContent =
        "Verified";

      verificationStatus.classList.remove(
        "not-verified"
      );

      verificationStatus.classList.add(
        "verified"
      );

    } else {

      verificationStatus.textContent =
        "Not Verified";

      verificationStatus.classList.remove(
        "verified"
      );

      verificationStatus.classList.add(
        "not-verified"
      );

    }

  }


  // -------------------------------------------------------
  // Default values
  // -------------------------------------------------------

  if (accountTypeValue) {

    accountTypeValue.textContent =
      "Personal";

  }


  if (phoneValue) {

    phoneValue.textContent =
      "Not added";

  }


  if (countryValue) {

    countryValue.textContent =
      "Bangladesh";

  }


  if (planValue) {

    planValue.textContent =
      "Free";

  }


  if (accountStatusValue) {

    accountStatusValue.textContent =
      "Active";

  }


  if (bioValue) {

    bioValue.textContent =
      "No bio added.";

  }


  // -------------------------------------------------------
  // Photo
  // -------------------------------------------------------

  if (avatar) {

    if (user.photoURL) {

      avatar.src =
        user.photoURL;

    } else {

      setDefaultAvatar();

    }


    avatar.onerror = () => {

      setDefaultAvatar();

    };

  }


  // -------------------------------------------------------
  // IMPORTANT:
  // Auth data পাওয়া গেলেই profile দেখানো হবে
  // -------------------------------------------------------

  showProfile();

}


// =========================================================
// LOAD FIRESTORE PROFILE
// =========================================================

async function loadFirestoreProfile(user) {

  if (!user || !user.uid) {
    return;
  }


  try {

    console.log(
      "AYNA BOOK: Loading Firestore profile..."
    );


    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    /*
     * Firestore response-এর জন্য সর্বোচ্চ 8 সেকেন্ড অপেক্ষা।
     * Firestore আটকে গেলেও profile page আটকে থাকবে না।
     */

    const timeoutPromise =
      new Promise((_, reject) => {

        setTimeout(() => {

          reject(
            new Error(
              "Firestore profile request timeout."
            )
          );

        }, 8000);

      });


    const firestorePromise =
      getDoc(userRef);


    const snapshot =
      await Promise.race([
        firestorePromise,
        timeoutPromise
      ]);


    // -----------------------------------------------------
    // Document না থাকলে Auth profile-ই থাকবে
    // -----------------------------------------------------

    if (!snapshot.exists()) {

      console.warn(
        "AYNA BOOK: users/" +
        user.uid +
        " document not found."
      );

      return;

    }


    const data =
      snapshot.data() || {};


    // -----------------------------------------------------
    // Full Name
    // -----------------------------------------------------

    if (profileName) {

      profileName.textContent =
        data.fullName ||
        data.name ||
        user.displayName ||
        "AYNA BOOK User";

    }


    // -----------------------------------------------------
    // Email
    // -----------------------------------------------------

    if (profileEmail) {

      profileEmail.textContent =
        data.email ||
        user.email ||
        "Not available";

    }


    // -----------------------------------------------------
    // Account Type
    // -----------------------------------------------------

    if (accountTypeValue) {

      accountTypeValue.textContent =
        data.accountType ||
        "Personal";

    }


    // -----------------------------------------------------
    // Phone
    // -----------------------------------------------------

    if (phoneValue) {

      phoneValue.textContent =
        data.phone ||
        "Not added";

    }


    // -----------------------------------------------------
    // Country
    // -----------------------------------------------------

    if (countryValue) {

      countryValue.textContent =
        data.country ||
        "Bangladesh";

    }


    // -----------------------------------------------------
    // Plan
    // -----------------------------------------------------

    if (planValue) {

      planValue.textContent =
        data.plan ||
        "Free";

    }


    // -----------------------------------------------------
    // Account Status
    // -----------------------------------------------------

    if (accountStatusValue) {

      accountStatusValue.textContent =
        data.accountStatus ||
        "Active";

    }


    // -----------------------------------------------------
    // Bio
    // -----------------------------------------------------

    if (bioValue) {

      bioValue.textContent =
        data.bio ||
        "No bio added.";

    }


    // -----------------------------------------------------
    // Profile Photo
    // -----------------------------------------------------

    if (avatar) {

      const photoURL =
        data.photoURL ||
        user.photoURL ||
        "";


      if (photoURL) {

        avatar.src =
          photoURL;

      } else {

        setDefaultAvatar();

      }


      avatar.onerror = () => {

        setDefaultAvatar();

      };

    }


    console.log(
      "AYNA BOOK: Firestore profile loaded successfully."
    );


  } catch (error) {

    console.warn(
      "AYNA BOOK: Firestore profile unavailable:",
      error
    );

    /*
     * গুরুত্বপূর্ণ:
     * Firestore ব্যর্থ হলেও Auth profile ইতিমধ্যে
     * page-এ দেখানো হয়েছে।
     */

  }

}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile(user) {

  if (!user) {

    window.location.href =
      "./login.html";

    return;

  }


  console.log(
    "AYNA BOOK: Logged-in user:",
    user.uid
  );


  // -------------------------------------------------------
  // STEP 1
  // Auth data সঙ্গে সঙ্গে দেখান
  // -------------------------------------------------------

  showAuthProfile(user);


  // -------------------------------------------------------
  // STEP 2
  // Firestore data পরে load করুন
  // -------------------------------------------------------

  await loadFirestoreProfile(user);

}


// =========================================================
// LOGOUT
// =========================================================

async function handleLogout() {

  if (!logoutButton) {
    return;
  }


  try {

    logoutButton.disabled =
      true;

    logoutButton.textContent =
      "Logging out...";


    await logoutUser();


    window.location.replace(
      "./login.html"
    );


  } catch (error) {

    console.error(
      "AYNA BOOK: Logout error:",
      error
    );


    showStatus(
      getAuthErrorMessage(error),
      "error"
    );


    logoutButton.disabled =
      false;

    logoutButton.textContent =
      "Logout";

  }

}


// =========================================================
// LOGOUT BUTTON
// =========================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    handleLogout
  );

}


// =========================================================
// START
// =========================================================

showLoading();


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


    try {

      await loadProfile(user);

    } catch (error) {

      console.error(
        "AYNA BOOK: Profile controller error:",
        error
      );


      // কোনো unexpected error হলেও
      // loading screen-এ আটকে থাকবে না।

      showAuthProfile(user);

    }

  }
);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK: profile.js loaded successfully."
);