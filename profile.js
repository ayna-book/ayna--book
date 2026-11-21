// =========================================================
// AYNA BOOK
// PROFILE CONTROLLER
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

const logoutButton = document.getElementById("logoutButton");
const statusMessage = document.getElementById("statusMessage");
const loadingMessage = document.getElementById("loadingMessage");
const profileCard = document.getElementById("profileCard");

const avatar = document.getElementById("avatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const verificationStatus = document.getElementById("verificationStatus");

const uidValue = document.getElementById("uidValue");
const accountTypeValue = document.getElementById("accountTypeValue");
const phoneValue = document.getElementById("phoneValue");
const countryValue = document.getElementById("countryValue");
const planValue = document.getElementById("planValue");
const accountStatusValue = document.getElementById("accountStatusValue");
const bioValue = document.getElementById("bioValue");


// =========================================================
// BASIC HELPERS
// =========================================================

function showStatus(message, type = "info") {
  if (!statusMessage) return;

  statusMessage.textContent = message;

  statusMessage.className = "status-message";

  if (type === "success") {
    statusMessage.classList.add("success");
  } else if (type === "error") {
    statusMessage.classList.add("error");
  } else {
    statusMessage.classList.add("info");
  }

  statusMessage.style.display = "block";
}


function hideStatus() {
  if (!statusMessage) return;

  statusMessage.textContent = "";
  statusMessage.style.display = "none";
}


function showLoading(show = true) {
  if (!loadingMessage) return;

  loadingMessage.style.display = show ? "block" : "none";
}


function showProfile(show = true) {
  if (!profileCard) return;

  profileCard.style.display = show ? "block" : "none";
}


// =========================================================
// SAFE TEXT HELPER
// =========================================================

function safeText(value, fallback = "—") {
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
// ACCOUNT TYPE LABEL
// =========================================================

function getAccountTypeLabel(accountType) {
  const type = String(accountType || "").toLowerCase();

  switch (type) {
    case "personal":
      return "Personal — Free";

    case "business":
      return "Business";

    case "vip":
      return "VIP";

    case "vvip":
      return "VVIP";

    default:
      return safeText(accountType, "Personal — Free");
  }
}


// =========================================================
// PLAN LABEL
// =========================================================

function getPlanLabel(plan) {
  const value = String(plan || "").toLowerCase();

  switch (value) {
    case "free":
      return "Free";

    case "business":
      return "Business";

    case "vip":
      return "VIP";

    case "vvip":
      return "VVIP";

    default:
      return safeText(plan, "Free");
  }
}


// =========================================================
// ACCOUNT STATUS LABEL
// =========================================================

function getAccountStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "active":
      return "Active";

    case "pending":
      return "Pending";

    case "pending_payment":
      return "Pending Payment";

    case "suspended":
      return "Suspended";

    case "disabled":
      return "Disabled";

    default:
      return safeText(status, "Active");
  }
}


// =========================================================
// AVATAR
// =========================================================

function setAvatar(userData, user) {
  if (!avatar) return;

  const photoURL =
    userData?.photoURL ||
    user?.photoURL ||
    "";

  if (photoURL) {
    avatar.innerHTML = "";
    avatar.style.backgroundImage = `url("${photoURL}")`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.style.backgroundRepeat = "no-repeat";
    return;
  }

  avatar.style.backgroundImage = "none";

  const name =
    userData?.fullName ||
    userData?.name ||
    user?.displayName ||
    user?.email ||
    "A";

  const firstLetter =
    String(name).trim().charAt(0).toUpperCase() || "A";

  avatar.textContent = firstLetter;
}


// =========================================================
// EMAIL VERIFICATION
// =========================================================

function setVerificationStatus(user) {
  if (!verificationStatus) return;

  if (user?.emailVerified) {
    verificationStatus.textContent = "✓ Email Verified";
    verificationStatus.className =
      "verification-status verified";
  } else {
    verificationStatus.textContent =
      "⚠ Email Not Verified";

    verificationStatus.className =
      "verification-status not-verified";
  }
}


// =========================================================
// LOAD PROFILE
// =========================================================

async function loadProfile(user) {
  if (!user) {
    window.location.replace("./login.html");
    return;
  }

  showLoading(true);
  showProfile(false);
  hideStatus();

  try {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    let profileData = {};

    if (snapshot.exists()) {
      profileData = snapshot.data() || {};
    } else {
      // Firestore document না থাকলেও Auth user-এর তথ্য দেখানো হবে
      profileData = {
        uid: user.uid,
        fullName: user.displayName || "",
        email: user.email || "",
        phone: "",
        country: "",
        accountType: "personal",
        plan: "free",
        accountStatus: "active",
        bio: "",
        photoURL: user.photoURL || ""
      };
    }


    // =====================================================
    // NAME
    // =====================================================

    const fullName =
      profileData.fullName ||
      profileData.name ||
      user.displayName ||
      "AYNA BOOK User";

    if (profileName) {
      profileName.textContent = safeText(
        fullName,
        "AYNA BOOK User"
      );
    }


    // =====================================================
    // EMAIL
    // =====================================================

    if (profileEmail) {
      profileEmail.textContent =
        safeText(
          profileData.email || user.email,
          "No email"
        );
    }


    // =====================================================
    // VERIFICATION
    // =====================================================

    setVerificationStatus(user);


    // =====================================================
    // UID
    // =====================================================

    if (uidValue) {
      uidValue.textContent =
        safeText(
          profileData.uid || user.uid,
          user.uid
        );
    }


    // =====================================================
    // ACCOUNT TYPE
    // =====================================================

    if (accountTypeValue) {
      accountTypeValue.textContent =
        getAccountTypeLabel(
          profileData.accountType
        );
    }


    // =====================================================
    // PHONE
    // =====================================================

    if (phoneValue) {
      phoneValue.textContent =
        safeText(profileData.phone);
    }


    // =====================================================
    // COUNTRY
    // =====================================================

    if (countryValue) {
      countryValue.textContent =
        safeText(profileData.country);
    }


    // =====================================================
    // PLAN
    // =====================================================

    if (planValue) {
      planValue.textContent =
        getPlanLabel(profileData.plan);
    }


    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    if (accountStatusValue) {
      accountStatusValue.textContent =
        getAccountStatusLabel(
          profileData.accountStatus
        );
    }


    // =====================================================
    // BIO
    // =====================================================

    if (bioValue) {
      bioValue.textContent =
        safeText(profileData.bio, "No bio added yet.");
    }


    // =====================================================
    // AVATAR
    // =====================================================

    setAvatar(profileData, user);


    // =====================================================
    // SHOW PROFILE
    // =====================================================

    showLoading(false);
    showProfile(true);

  } catch (error) {

    console.error(
      "AYNA BOOK profile loading error:",
      error
    );

    showLoading(false);

    let message =
      getAuthErrorMessage(error);

    if (
      error?.code ===
      "permission-denied"
    ) {
      message =
        "Profile access denied. Firestore permission check করুন।";
    }

    if (
      error?.code ===
      "unavailable"
    ) {
      message =
        "Network সমস্যা। ইন্টারনেট সংযোগ পরীক্ষা করুন।";
    }

    showStatus(
      message ||
      "Profile load করা যায়নি।",
      "error"
    );
  }
}


// =========================================================
// LOGOUT
// =========================================================

async function handleLogout() {
  if (!logoutButton) return;

  logoutButton.disabled = true;

  showStatus(
    "Logging out...",
    "info"
  );

  try {
    await logoutUser();

    window.location.replace(
      "./login.html"
    );

  } catch (error) {

    console.error(
      "AYNA BOOK logout error:",
      error
    );

    logoutButton.disabled = false;

    showStatus(
      getAuthErrorMessage(error) ||
      "Logout failed. আবার চেষ্টা করুন।",
      "error"
    );
  }
}


// =========================================================
// LOGOUT BUTTON EVENT
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

watchAuthState(async (user) => {

  if (!user) {
    window.location.replace(
      "./login.html"
    );
    return;
  }

  await loadProfile(user);

});


// =========================================================
// INITIAL AUTH SAFETY CHECK
// =========================================================

if (auth.currentUser) {
  loadProfile(auth.currentUser);
}