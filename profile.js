// =========================================================
// AYNA BOOK
// Profile Controller
// Step 13 — Firestore Profile
// Firebase SDK: 13.4.0
// =========================================================


// =========================================================
// FIREBASE
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


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
// DATE FORMAT
// =========================================================

function formatDate(dateValue) {

  if (!dateValue) {
    return "Not available";
  }

  try {

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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
// FIRESTORE PROFILE LOAD
// =========================================================

async function loadFirestoreProfile(
  user
) {

  try {

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );

    const snapshot =
      await getDoc(userRef);


    if (!snapshot.exists()) {

      console.log(
        "AYNA BOOK — Firestore profile not found."
      );

      return;
    }


    const data =
      snapshot.data();


    // Full Name

    if (fullNameInput) {

      fullNameInput.value =
        data.fullName ||
        user.displayName ||
        "";

    }


    // Phone

    if (phoneInput) {

      phoneInput.value =
        data.phone || "";

    }


    // Bio

    if (bioInput) {

      bioInput.value =
        data.bio || "";

    }


    // Country

    if (countryInput) {

      countryInput.value =
        data.country || "";

    }


    console.log(
      "AYNA BOOK — Firestore profile loaded successfully."
    );

  } catch (error) {

    console.error(
      "AYNA BOOK — Firestore Profile Load Error:",
      error
    );

    showStatus(
      "Profile তথ্য লোড করতে সমস্যা হয়েছে।",
      "error"
    );
  }
}


// =========================================================
// AUTH USER PROFILE LOAD
// =========================================================

function loadAuthProfile(user) {

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
  // Email
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

  if (verificationStatus) {

    verificationStatus.className =
      "verification";
  }


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
  // Profile Photo
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
      "AYNA BOOK — Authenticated Profile User:",
      user.uid
    );


    try {

      // Refresh Firebase user

      await user.reload();


      const currentUser =
        auth.currentUser;


      if (!currentUser) {

        window.location.href =
          "./login.html";

        return;
      }


      // Load Firebase Auth data

      loadAuthProfile(
        currentUser
      );


      // Load Firestore data

      await loadFirestoreProfile(
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


      // Image validation

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        showStatus(
          "শুধু Image file নির্বাচন করুন।",
          "error"
        );

        profilePhoto.value =
          "";

        return;
      }


      // Maximum 5 MB

      const maxSize =
        5 * 1024 * 1024;


      if (file.size > maxSize) {

        showStatus(
          "Profile Photo সর্বোচ্চ 5 MB হতে হবে।",
          "error"
        );

        profilePhoto.value =
          "";

        return;
      }


      // Preview

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


      reader.readAsDataURL(
        file
      );

    }
  );

}


// =========================================================
// SAVE PROFILE
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


      // ---------------------------------------------------
      // Full Name
      // ---------------------------------------------------

      const fullName =
        fullNameInput?.value.trim() ||
        "";


      if (fullName.length < 2) {

        showStatus(
          "Full Name কমপক্ষে ২ অক্ষরের হতে হবে।",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Other Profile Data
      // ---------------------------------------------------

      const phone =
        phoneInput?.value.trim() ||
        "";

      const bio =
        bioInput?.value.trim() ||
        "";

      const country =
        countryInput?.value ||
        "";


      // ---------------------------------------------------
      // Loading
      // ---------------------------------------------------

      if (saveProfileButton) {

        saveProfileButton.disabled =
          true;

        saveProfileButton.textContent =
          "SAVING...";
      }


      showStatus(
        "Profile সংরক্ষণ করা হচ্ছে...",
        "info"
      );


      try {

        // -------------------------------------------------
        // Firestore User Document
        // -------------------------------------------------

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );


        await setDoc(
          userRef,
          {

            // Identity
            uid:
              user.uid,

            // Basic Information
            fullName:
              fullName,

            email:
              user.email || "",

            phone:
              phone,

            bio:
              bio,

            country:
              country,

            // Security Status
            emailVerified:
              user.emailVerified === true,

            // Profile
            photoURL:
              user.photoURL || "",

            // Account Type
            accountType:
              "personal",

            // Account Status
            accountStatus:
              "active",

            // Updated
            updatedAt:
              serverTimestamp()

          },
          {
            merge: true
          }
        );


        // -------------------------------------------------
        // Success
        // -------------------------------------------------

        showStatus(
          "Profile সফলভাবে সংরক্ষণ হয়েছে।",
          "success"
        );


        console.log(
          "AYNA BOOK — Firestore profile saved successfully:",
          user.uid
        );


      } catch (error) {

        console.error(
          "AYNA BOOK — Firestore Profile Save Error:",
          error
        );


        let message =
          "Profile Save করা যায়নি।";


        if (
          error?.code ===
          "permission-denied"
        ) {

          message =
            "Firestore Rules এই Profile Save অনুমতি দিচ্ছে না।";

        } else if (
          error?.code ===
          "unavailable"
        ) {

          message =
            "Firebase Server পাওয়া যাচ্ছে না। Internet Connection পরীক্ষা করুন।";

        } else if (
          error?.message
        ) {

          message =
            `Profile Save Error:\n${error.message}`;
        }


        showStatus(
          message,
          "error"
        );

      } finally {

        if (saveProfileButton) {

          saveProfileButton.disabled =
            false;

          saveProfileButton.textContent =
            "SAVE PROFILE";
        }
      }

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
  "AYNA BOOK — Profile Controller Step 13 active."
);

console.log(
  "AYNA BOOK — Firestore Profile Save/Load enabled."
);