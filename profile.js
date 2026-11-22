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
// STATUS MESSAGE
// =========================================================

function showStatus(message, type = "") {

  if (!statusMessage) {
    return;
  }

  statusMessage.textContent = message;

  statusMessage.className =
    "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }
}


// =========================================================
// SHOW LOADING
// =========================================================

function showLoading() {

  if (loadingMessage) {
    loadingMessage.style.display = "block";
    loadingMessage.textContent =
      "Profile loading...";
  }

  if (profileCard) {
    profileCard.style.display = "none";
  }
}


// =========================================================
// SHOW PROFILE
// =========================================================

function showProfile() {

  if (loadingMessage) {
    loadingMessage.style.display = "none";
  }

  if (profileCard) {
    profileCard.style.display = "block";
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
// LOAD PROFILE
// =========================================================

async function loadProfile(user) {

  showLoading();
  showStatus("");

  try {

    if (!user) {
      window.location.href = "./login.html";
      return;
    }


    // -----------------------------------------------------
    // Firebase Auth data
    // -----------------------------------------------------

    const authName =
      user.displayName ||
      "AYNA BOOK User";

    const authEmail =
      user.email ||
      "";

    const authPhoto =
      user.photoURL ||
      "";


    // -----------------------------------------------------
    // Default values
    // -----------------------------------------------------

    let profileData = {};


    // -----------------------------------------------------
    // Firestore users/{uid}
    // -----------------------------------------------------

    try {

      const userRef =
        doc(db, "users", user.uid);

      const snapshot =
        await getDoc(userRef);

      if (snapshot.exists()) {

        profileData =
          snapshot.data() || {};

      }

    } catch (firestoreError) {

      console.error(
        "AYNA BOOK: Firestore profile read failed:",
        firestoreError
      );

      // Auth data দিয়ে profile দেখানোর চেষ্টা চলবে।
      profileData = {};

    }


    // -----------------------------------------------------
    // Profile name
    // -----------------------------------------------------

    const fullName =
      profileData.fullName ||
      profileData.name ||
      authName ||
      "AYNA BOOK User";


    if (profileName) {
      profileName.textContent =
        fullName;
    }


    // -----------------------------------------------------
    // Email
    // -----------------------------------------------------

    if (profileEmail) {

      profileEmail.textContent =
        profileData.email ||
        authEmail ||
        "Not available";

    }


    // -----------------------------------------------------
    // Verification
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // UID
    // -----------------------------------------------------

    if (uidValue) {

      uidValue.textContent =
        user.uid || "Not available";

    }


    // -----------------------------------------------------
    // Account Type
    // -----------------------------------------------------

    if (accountTypeValue) {

      accountTypeValue.textContent =
        profileData.accountType ||
        "Personal";

    }


    // -----------------------------------------------------
    // Phone
    // -----------------------------------------------------

    if (phoneValue) {

      phoneValue.textContent =
        profileData.phone ||
        "Not added";

    }


    // -----------------------------------------------------
    // Country
    // -----------------------------------------------------

    if (countryValue) {

      countryValue.textContent =
        profileData.country ||
        "Bangladesh";

    }


    // -----------------------------------------------------
    // Plan
    // -----------------------------------------------------

    if (planValue) {

      planValue.textContent =
        profileData.plan ||
        "Free";

    }


    // -----------------------------------------------------
    // Account Status
    // -----------------------------------------------------

    if (accountStatusValue) {

      accountStatusValue.textContent =
        profileData.accountStatus ||
        "Active";

    }


    // -----------------------------------------------------
    // Bio
    // -----------------------------------------------------

    if (bioValue) {

      bioValue.textContent =
        profileData.bio ||
        "No bio added.";

    }


    // -----------------------------------------------------
    // Profile photo
    // -----------------------------------------------------

    const firestorePhoto =
      profileData.photoURL ||
      "";

    if (avatar) {

      if (firestorePhoto) {

        avatar.src =
          firestorePhoto;

      } else if (authPhoto) {

        avatar.src =
          authPhoto;

      } else {

        setDefaultAvatar();

      }


      avatar.onerror = () => {

        setDefaultAvatar();

      };

    }


    // -----------------------------------------------------
    // Show profile
    // -----------------------------------------------------

    showProfile();


  } catch (error) {

    console.error(
      "AYNA BOOK: Profile loading error:",
      error
    );


    showStatus(
      getAuthErrorMessage(error),
      "error"
    );


    // Auth data থেকে minimum profile দেখানো
    if (profileName && user) {

      profileName.textContent =
        user.displayName ||
        "AYNA BOOK User";

    }

    if (profileEmail && user) {

      profileEmail.textContent =
        user.email ||
        "";

    }

    if (uidValue && user) {

      uidValue.textContent =
        user.uid ||
        "";

    }

    if (verificationStatus && user) {

      verificationStatus.textContent =
        user.emailVerified
          ? "Verified"
          : "Not Verified";

    }

    setDefaultAvatar();

    showProfile();

  }

}


// =========================================================
// LOGOUT
// =========================================================

async function handleLogout() {

  if (!logoutButton) {
    return;
  }

  try {

    logoutButton.disabled = true;

    logoutButton.textContent =
      "Logging out...";


    await logoutUser();


    window.location.href =
      "./login.html";


  } catch (error) {

    console.error(
      "AYNA BOOK: Logout error:",
      error
    );


    showStatus(
      getAuthErrorMessage(error),
      "error"
    );


    logoutButton.disabled = false;

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
// AUTH STATE
// =========================================================

showLoading();


watchAuthState(async (user) => {

  if (!user) {

    window.location.href =
      "./login.html";

    return;

  }


  console.log(
    "AYNA BOOK: Logged-in user:",
    user.uid
  );


  await loadProfile(user);

});


// =========================================================
// CONSOLE
// =========================================================

console.log(
  "AYNA BOOK: profile.js loaded successfully."
);