 // =========================================================
// AYNA BOOK ★
// PROFILE JAVASCRIPT
// File: profile.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  onAuthStateChanged,
  reload,
  signOut,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

import {
  auth,
  database,
  authReady
} from "./firebase-init.js";


// =========================================================
// ELEMENT HELPER
// =========================================================

const $ = (id) => document.getElementById(id);


// =========================================================
// ELEMENTS
// =========================================================

const profilePhoto = $("profilePhoto");
const profileName = $("profileName");
const profileEmail = $("profileEmail");

const verificationStatus = $("verificationStatus");

const infoFullName = $("infoFullName");
const infoEmail = $("infoEmail");
const infoPhone = $("infoPhone");
const infoCountry = $("infoCountry");
const infoAynaId = $("infoAynaId");
const infoAccountType = $("infoAccountType");
const infoPlan = $("infoPlan");
const infoStatus = $("infoStatus");

const securityVerification = $("securityVerification");
const profileProtection = $("profileProtection");

const profileMessage = $("profileMessage");

const loadingOverlay = $("loadingOverlay");

const verifyButton = $("verifyButton");
const refreshButton = $("refreshButton");

const logoutButton = $("logoutButton");

const homeButton = $("homeButton");
const homeButton2 = $("homeButton2");


// =========================================================
// DEFAULT PROFILE IMAGE
// =========================================================

const DEFAULT_PROFILE_IMAGE =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="500"
      viewBox="0 0 500 500"
    >
      <rect
        width="500"
        height="500"
        fill="#0b1833"
      />

      <circle
        cx="250"
        cy="180"
        r="90"
        fill="#d4af37"
      />

      <path
        d="
          M90 470
          C100 350 170 300 250 300
          C330 300 400 350 410 470
          Z
        "
        fill="#d4af37"
      />

      <text
        x="250"
        y="70"
        text-anchor="middle"
        font-family="Arial"
        font-size="34"
        font-weight="bold"
        fill="#ffffff"
      >
        AYNA
      </text>
    </svg>
  `);


// =========================================================
// LOADING
// =========================================================

function showLoading() {

  if (!loadingOverlay) {
    return;
  }

  loadingOverlay.classList.add("active");
  loadingOverlay.setAttribute("aria-hidden", "false");
}


function hideLoading() {

  if (!loadingOverlay) {
    return;
  }

  loadingOverlay.classList.remove("active");
  loadingOverlay.setAttribute("aria-hidden", "true");
}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
  text,
  type = "info"
) {

  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = text;

  profileMessage.classList.remove(
    "hidden",
    "success",
    "error",
    "info"
  );

  profileMessage.classList.add(type);
}


function hideMessage() {

  if (!profileMessage) {
    return;
  }

  profileMessage.textContent = "";

  profileMessage.classList.add("hidden");

  profileMessage.classList.remove(
    "success",
    "error",
    "info"
  );
}


// =========================================================
// SAFE TEXT
// =========================================================

function safeText(
  value,
  fallback = "—"
) {

  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
}


// =========================================================
// FORMAT ACCOUNT TYPE
// =========================================================

function formatAccountType(value) {

  const type = String(
    value || "personal"
  ).toLowerCase();

  const map = {
    personal: "Personal",
    business: "Business",
    vip: "VIP",
    vvip: "VVIP"
  };

  return map[type] || value || "Personal";
}


// =========================================================
// FORMAT PLAN
// =========================================================

function formatPlan(value) {

  const plan = String(
    value || "free"
  ).toLowerCase();

  const map = {
    free: "Free",
    business: "Business",
    vip: "VIP",
    vvip: "VVIP"
  };

  return map[plan] || value || "Free";
}


// =========================================================
// FORMAT STATUS
// =========================================================

function formatStatus(value) {

  const status = String(
    value || "active"
  ).toLowerCase();

  const map = {
    active: "Active",
    inactive: "Inactive",
    suspended: "Suspended",
    blocked: "Blocked",
    pending: "Pending"
  };

  return map[status] || value || "Active";
}


// =========================================================
// UPDATE VERIFICATION UI
// =========================================================

function updateVerificationUI(
  user
) {

  if (!user) {
    return;
  }

  if (user.emailVerified) {

    if (verificationStatus) {

      verificationStatus.innerHTML =
        `<span class="status-badge status-verified">
          ✓ Email Verified
        </span>`;
    }

    if (securityVerification) {

      securityVerification.textContent =
        "✓ Verified";
    }

    if (verifyButton) {

      verifyButton.textContent =
        "✓ Email Verified";

      verifyButton.disabled = true;
    }

  } else {

    if (verificationStatus) {

      verificationStatus.innerHTML =
        `<span class="status-badge status-unverified">
          ⚠ Email Not Verified
        </span>`;
    }

    if (securityVerification) {

      securityVerification.textContent =
        "⚠ Verification Required";
    }

    if (verifyButton) {

      verifyButton.textContent =
        "📩 Verify Email";

      verifyButton.disabled = false;
    }
  }
}


// =========================================================
// SET PROFILE PHOTO
// =========================================================

function setProfilePhoto(
  photoURL
) {

  if (!profilePhoto) {
    return;
  }

  const url = safeText(
    photoURL,
    DEFAULT_PROFILE_IMAGE
  );

  profilePhoto.src = url;

  profilePhoto.onerror = () => {

    profilePhoto.onerror = null;

    profilePhoto.src =
      DEFAULT_PROFILE_IMAGE;
  };
}


// =========================================================
// LOAD PROFILE FROM RTDB
// =========================================================

async function loadProfile(
  user,
  showLoadingScreen = true
) {

  if (!user) {
    return;
  }

  if (showLoadingScreen) {
    showLoading();
  }

  hideMessage();

  try {

    // -------------------------------------------------------
    // Reload Firebase Auth user
    // -------------------------------------------------------

    await reload(user);

    const currentUser =
      auth.currentUser;

    if (!currentUser) {

      window.location.replace(
        "./login.html"
      );

      return;
    }


    // -------------------------------------------------------
    // Read /users/{uid}
    // -------------------------------------------------------

    const userRef = ref(
      database,
      `users/${currentUser.uid}`
    );

    const snapshot =
      await get(userRef);


    let profileData = {};

    if (snapshot.exists()) {

      profileData =
        snapshot.val() || {};

    } else {

      console.warn(
        "AYNA BOOK: RTDB profile not found."
      );

      profileData = {};
    }


    // -------------------------------------------------------
    // Firebase Auth is authoritative
    // -------------------------------------------------------

    const fullName =
      profileData.fullName ||
      currentUser.displayName ||
      "AYNA BOOK User";

    const email =
      currentUser.email ||
      profileData.email ||
      "—";

    const phone =
      profileData.phone ||
      currentUser.phoneNumber ||
      "—";

    const country =
      profileData.country ||
      "—";

    const aynaId =
      profileData.aynaId ||
      "—";

    const accountType =
      formatAccountType(
        profileData.accountType
      );

    const plan =
      formatPlan(
        profileData.plan
      );

    const status =
      formatStatus(
        profileData.status
      );

    const photoURL =
      profileData.photoURL ||
      currentUser.photoURL ||
      DEFAULT_PROFILE_IMAGE;


    // -------------------------------------------------------
    // PROFILE HEADER
    // -------------------------------------------------------

    setProfilePhoto(
      photoURL
    );

    if (profileName) {

      profileName.textContent =
        fullName;
    }

    if (profileEmail) {

      profileEmail.textContent =
        email;
    }


    // -------------------------------------------------------
    // PROFILE INFORMATION
    // -------------------------------------------------------

    if (infoFullName) {

      infoFullName.textContent =
        fullName;
    }

    if (infoEmail) {

      infoEmail.textContent =
        email;
    }

    if (infoPhone) {

      infoPhone.textContent =
        phone;
    }

    if (infoCountry) {

      infoCountry.textContent =
        country;
    }

    if (infoAynaId) {

      infoAynaId.textContent =
        aynaId;
    }

    if (infoAccountType) {

      infoAccountType.textContent =
        accountType;
    }

    if (infoPlan) {

      infoPlan.textContent =
        plan;
    }

    if (infoStatus) {

      infoStatus.textContent =
        status;
    }


    // -------------------------------------------------------
    // PROFILE PROTECTION
    // -------------------------------------------------------

    if (profileProtection) {

      if (
        profileData.profileLocked === true
      ) {

        profileProtection.textContent =
          "✓ Protected — Core identity locked";

      } else {

        profileProtection.textContent =
          "Protected";
      }
    }


    // -------------------------------------------------------
    // AUTH VERIFICATION
    // -------------------------------------------------------

    updateVerificationUI(
      currentUser
    );


    // -------------------------------------------------------
    // SYNCHRONIZE VERIFICATION FLAG
    // -------------------------------------------------------

    if (
      currentUser.emailVerified &&
      profileData.emailVerified !== true
    ) {

      try {

        await update(
          userRef,
          {
            emailVerified: true,
            emailVerifiedAt:
              profileData.emailVerifiedAt ||
              Date.now(),
            updatedAt: Date.now()
          }
        );

      } catch (syncError) {

        console.warn(
          "AYNA BOOK verification sync warning:",
          syncError
        );
      }
    }


    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    showMessage(
      "✓ আপনার AYNA BOOK Profile সফলভাবে লোড হয়েছে।",
      "success"
    );


  } catch (error) {

    console.error(
      "AYNA BOOK Profile Load Error:",
      error
    );


    // -------------------------------------------------------
    // Auth error
    // -------------------------------------------------------

    if (
      error?.code ===
        "auth/user-token-expired" ||
      error?.code ===
        "auth/user-disabled"
    ) {

      showMessage(
        "আপনার লগইন সেশন শেষ হয়েছে। আবার Login করুন।",
        "error"
      );

      setTimeout(() => {

        window.location.replace(
          "./login.html"
        );

      }, 1800);

      return;
    }


    // -------------------------------------------------------
    // General error
    // -------------------------------------------------------

    showMessage(
      "Profile তথ্য লোড করা যায়নি। Firebase ও RTDB connection পরীক্ষা করুন।",
      "error"
    );


  } finally {

    hideLoading();
  }
}


// =========================================================
// AUTH STATE
// =========================================================

async function startProfile() {

  try {

    await authReady;

  } catch (error) {

    console.warn(
      "AYNA BOOK authReady warning:",
      error
    );
  }


  onAuthStateChanged(
    auth,
    async (user) => {

      if (!user) {

        window.location.replace(
          "./login.html"
        );

        return;
      }

      await loadProfile(
        user,
        true
      );
    }
  );
}


// =========================================================
// VERIFY EMAIL
// =========================================================

async function handleVerifyEmail() {

  const user =
    auth.currentUser;

  if (!user) {

    window.location.replace(
      "./login.html"
    );

    return;
  }


  try {

    await reload(user);

    const currentUser =
      auth.currentUser;

    if (
      currentUser &&
      currentUser.emailVerified
    ) {

      updateVerificationUI(
        currentUser
      );

      showMessage(
        "✓ আপনার Email ইতিমধ্যেই Verified।",
        "success"
      );

      return;
    }


    // -------------------------------------------------------
    // Send verification email
    // -------------------------------------------------------

    await sendEmailVerification(
      currentUser
    );


    showMessage(
      "📩 Verification Email পাঠানো হয়েছে। Gmail-এর Inbox অথবা Spam/Junk Folder দেখুন।",
      "success"
    );


  } catch (error) {

    console.error(
      "AYNA BOOK Verification Error:",
      error
    );


    let message =
      "Verification Email পাঠানো যায়নি।";


    switch (error?.code) {

      case "auth/too-many-requests":

        message =
          "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন.";

        break;


      case "auth/user-disabled":

        message =
          "এই account নিষ্ক্রিয় করা হয়েছে.";

        break;


      case "auth/network-request-failed":

        message =
          "Internet connection পরীক্ষা করুন.";

        break;


      case "auth/requires-recent-login":

        message =
          "নিরাপত্তার জন্য আবার Login করুন.";

        break;
    }


    showMessage(
      message,
      "error"
    );
  }
}


// =========================================================
// REFRESH PROFILE
// =========================================================

async function handleRefresh() {

  const user =
    auth.currentUser;

  if (!user) {

    window.location.replace(
      "./login.html"
    );

    return;
  }

  await loadProfile(
    user,
    true
  );
}


// =========================================================
// LOGOUT
// =========================================================

async function handleLogout() {

  const confirmed =
    window.confirm(
      "আপনি কি AYNA BOOK থেকে Sign Out করতে চান?"
    );

  if (!confirmed) {
    return;
  }


  try {

    showLoading();

    await signOut(auth);

    window.location.replace(
      "./login.html"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK Logout Error:",
      error
    );

    hideLoading();

    showMessage(
      "Sign Out করা যায়নি। আবার চেষ্টা করুন।",
      "error"
    );
  }
}


// =========================================================
// HOME
// =========================================================

function goHome() {

  window.location.href =
    "./index.html";
}


// =========================================================
// EVENT LISTENERS
// =========================================================

if (verifyButton) {

  verifyButton.addEventListener(
    "click",
    handleVerifyEmail
  );
}


if (refreshButton) {

  refreshButton.addEventListener(
    "click",
    handleRefresh
  );
}


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    handleLogout
  );
}


if (homeButton) {

  homeButton.addEventListener(
    "click",
    goHome
  );
}


if (homeButton2) {

  homeButton2.addEventListener(
    "click",
    goHome
  );
}


// =========================================================
// START
// =========================================================

startProfile();