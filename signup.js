
// =========================================================
// AYNA BOOK
// SIGNUP / REGISTRATION — DIAGNOSTIC VERSION
// Firebase SDK: 13.4.0
//
// Purpose:
// 1. Detect exact registration step
// 2. Prevent infinite CREATING ACCOUNT... state
// 3. Detect Firestore / Verification timeout
// 4. Preserve existing registration architecture
// =========================================================

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// CONFIGURATION
// =========================================================

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

// Maximum time allowed for a Firebase operation
const OPERATION_TIMEOUT = 20000;


// =========================================================
// DOM
// =========================================================

const registrationForm =
  document.getElementById("registrationForm");

const registerButton =
  document.getElementById("registerButton");

const statusMessage =
  document.getElementById("statusMessage");

const profilePhoto =
  document.getElementById("profilePhoto");

const photoPreview =
  document.getElementById("photoPreview");


// =========================================================
// STATUS
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) {
    console.warn("statusMessage element not found.");
    return;
  }

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;

  statusMessage.style.display = "block";

  console.log(
    `[AYNA BOOK STATUS] ${message}`
  );
}


// =========================================================
// LOADING
// =========================================================

function setLoading(isLoading) {

  if (!registerButton) {
    console.warn(
      "registerButton element not found."
    );
    return;
  }

  registerButton.disabled = isLoading;

  registerButton.textContent =
    isLoading
      ? "CREATING ACCOUNT..."
      : "CREATE ACCOUNT";
}


// =========================================================
// TIMEOUT HELPER
// =========================================================

function withTimeout(
  promise,
  timeoutMs,
  operationName
) {

  return Promise.race([

    promise,

    new Promise((_, reject) => {

      setTimeout(() => {

        const error =
          new Error(
            `${operationName} timed out after ${timeoutMs / 1000} seconds.`
          );

        error.code =
          "ayna/operation-timeout";

        error.operation =
          operationName;

        reject(error);

      }, timeoutMs);

    })

  ]);
}


// =========================================================
// VALUE HELPERS
// =========================================================

function getValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value.trim()
    : "";
}


// =========================================================
// GMAIL VALIDATION
// =========================================================

function validateGmail(email) {

  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
    .test(email);
}


// =========================================================
// PHONE NORMALIZATION
// =========================================================

function normalizePhone(phone) {

  let value =
    phone.replace(/\s+/g, "");

  if (/^01\d{9}$/.test(value)) {

    return "+880" +
      value.substring(1);
  }

  if (/^8801\d{9}$/.test(value)) {

    return "+" + value;
  }

  if (/^\+8801\d{9}$/.test(value)) {

    return value;
  }

  return null;
}


// =========================================================
// PASSWORD VALIDATION
// =========================================================

function validatePassword(password) {

  return (
    typeof password === "string" &&
    password.length >= 11
  );
}


// =========================================================
// PHOTO VALIDATION
// =========================================================

function validatePhoto(file) {

  if (!file) {

    return {
      valid: true,
      message: ""
    };
  }

  if (
    !ALLOWED_PHOTO_TYPES
      .includes(file.type)
  ) {

    return {
      valid: false,
      message:
        "Profile photo must be JPG, PNG or WEBP."
    };
  }

  if (file.size > MAX_PHOTO_SIZE) {

    return {
      valid: false,
      message:
        "Profile photo must be 5 MB or smaller."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


// =========================================================
// PHOTO PREVIEW
// =========================================================

if (profilePhoto) {

  profilePhoto.addEventListener(
    "change",
    () => {

      const file =
        profilePhoto.files?.[0];

      if (!file) {

        if (photoPreview) {

          photoPreview.style.display =
            "none";

          photoPreview.removeAttribute(
            "src"
          );
        }

        return;
      }


      const validation =
        validatePhoto(file);


      if (!validation.valid) {

        showStatus(
          validation.message,
          "error"
        );

        profilePhoto.value = "";

        if (photoPreview) {

          photoPreview.style.display =
            "none";

          photoPreview.removeAttribute(
            "src"
          );
        }

        return;
      }


      if (photoPreview) {

        const objectURL =
          URL.createObjectURL(file);

        photoPreview.src =
          objectURL;

        photoPreview.style.display =
          "block";

        photoPreview.onload = () => {

          URL.revokeObjectURL(
            objectURL
          );
        };
      }

    }
  );
}


// =========================================================
// FIRESTORE USER PROFILE
// =========================================================

async function createUserProfile(
  user,
  data
) {

  showStatus(
    "ধাপ ২/৪: AYNA BOOK Profile তৈরি হচ্ছে...",
    "info"
  );

  console.log(
    "[AYNA BOOK] STEP 2 START — Firestore"
  );


  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  await withTimeout(

    setDoc(
      userRef,
      {

        uid:
          user.uid,

        fullName:
          data.fullName,

        email:
          data.email,

        phone:
          data.phone,

        accountType:
          "personal",

        bio:
          "",

        country:
          "",

        photoURL:
          "",

        emailVerified:
          false,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }
    ),

    OPERATION_TIMEOUT,

    "Firestore user profile creation"

  );


  console.log(
    "[AYNA BOOK] STEP 2 SUCCESS — Firestore"
  );


  return true;
}


// =========================================================
// SEND VERIFICATION EMAIL
// =========================================================

async function sendVerification(user) {

  showStatus(
    "ধাপ ৩/৪: Gmail Verification Email পাঠানো হচ্ছে...",
    "info"
  );

  console.log(
    "[AYNA BOOK] STEP 3 START — Email Verification"
  );


  await withTimeout(

    sendEmailVerification(user),

    OPERATION_TIMEOUT,

    "Email verification"

  );


  console.log(
    "[AYNA BOOK] STEP 3 SUCCESS — Email Verification"
  );


  return true;
}


// =========================================================
// SUBMIT
// =========================================================

if (registrationForm) {

  registrationForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      console.log(
        "================================================="
      );

      console.log(
        "AYNA BOOK REGISTRATION STARTED"
      );

      console.log(
        "================================================="
      );


      // -----------------------------------------------
      // PREVENT DOUBLE SUBMIT
      // -----------------------------------------------

      if (
        registerButton &&
        registerButton.disabled
      ) {

        console.warn(
          "[AYNA BOOK] Double submit prevented."
        );

        return;
      }


      // -----------------------------------------------
      // READ FORM
      // -----------------------------------------------

      const accountType =
        getValue("accountType");

      const fullName =
        getValue("fullName");

      const email =
        getValue("email")
          .toLowerCase();

      const phoneInput =
        getValue("phone");

      const password =
        getValue("password");

      const confirmPassword =
        getValue("confirmPassword");

      const terms =
        document.getElementById("terms");

      const photoFile =
        profilePhoto?.files?.[0] ||
        null;


      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (
        accountType !== "personal"
      ) {

        showStatus(
          "এই Registration ধাপে বর্তমানে Personal — Free Account চালু আছে।",
          "error"
        );

        return;
      }


      if (
        !fullName ||
        fullName.length < 2
      ) {

        showStatus(
          "আপনার Full Name লিখুন।",
          "error"
        );

        return;
      }


      if (!validateGmail(email)) {

        showStatus(
          "সঠিক Gmail Address দিন।",
          "error"
        );

        return;
      }


      const normalizedPhone =
        normalizePhone(
          phoneInput
        );


      if (!normalizedPhone) {

        showStatus(
          "সঠিক Bangladesh Mobile Number দিন।",
          "error"
        );

        return;
      }


      if (
        !validatePassword(password)
      ) {

        showStatus(
          "Password কমপক্ষে 11 characters হতে হবে।",
          "error"
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {

        showStatus(
          "Password এবং Confirm Password একই নয়।",
          "error"
        );

        return;
      }


      if (
        !terms ||
        !terms.checked
      ) {

        showStatus(
          "Terms and Privacy Policy গ্রহণ করুন।",
          "error"
        );

        return;
      }


      const photoValidation =
        validatePhoto(
          photoFile
        );


      if (
        !photoValidation.valid
      ) {

        showStatus(
          photoValidation.message,
          "error"
        );

        return;
      }


      // -----------------------------------------------
      // START
      // -----------------------------------------------

      setLoading(true);


      let createdUser =
        null;

      let profileCreated =
        false;

      let verificationSent =
        false;


      try {

        // =================================================
        // STEP 1
        // FIREBASE AUTHENTICATION
        // =================================================

        showStatus(
          "ধাপ ১/৪: Firebase Account তৈরি হচ্ছে...",
          "info"
        );


        console.log(
          "[AYNA BOOK] STEP 1 START — Firebase Auth"
        );


        // -----------------------------------------------
        // CHECK CURRENT USER
        // -----------------------------------------------

        if (
          auth.currentUser &&
          !auth.currentUser.isAnonymous
        ) {

          console.warn(
            "[AYNA BOOK] Existing authenticated user found:",
            auth.currentUser.uid
          );


          showStatus(
            "এই Browser-এ ইতোমধ্যে একটি Account চালু আছে। আগে Logout করুন।",
            "error"
          );


          setLoading(false);

          return;
        }


        // -----------------------------------------------
        // CREATE ACCOUNT
        // -----------------------------------------------

        const credential =
          await withTimeout(

            createUserWithEmailAndPassword(
              auth,
              email,
              password
            ),

            OPERATION_TIMEOUT,

            "Firebase account creation"

          );


        createdUser =
          credential.user;


        if (!createdUser) {

          throw new Error(
            "Firebase Account তৈরি হয়েছে বলে নিশ্চিত হওয়া যায়নি।"
          );
        }


        console.log(
          "[AYNA BOOK] STEP 1 SUCCESS — Firebase Auth"
        );

        console.log(
          "[AYNA BOOK] UID:",
          createdUser.uid
        );


        showStatus(
          "ধাপ ১/৪ সম্পন্ন: Firebase Account তৈরি হয়েছে।",
          "success"
        );


        // -----------------------------------------------
        // UPDATE DISPLAY NAME
        // -----------------------------------------------

        console.log(
          "[AYNA BOOK] Updating displayName..."
        );


        await withTimeout(

          updateProfile(
            createdUser,
            {
              displayName:
                fullName
            }
          ),

          OPERATION_TIMEOUT,

          "Firebase display name update"

        );


        console.log(
          "[AYNA BOOK] displayName updated."
        );


        // =================================================
        // STEP 2
        // FIRESTORE PROFILE
        // =================================================

        await createUserProfile(
          createdUser,
          {
            fullName,
            email,
            phone:
              normalizedPhone
          }
        );


        profileCreated =
          true;


        // =================================================
        // STEP 3
        // EMAIL VERIFICATION
        // =================================================

        await sendVerification(
          createdUser
        );


        verificationSent =
          true;


        // =================================================
        // STEP 4
        // SIGN OUT
        // =================================================

        showStatus(
          "ধাপ ৪/৪: Registration সম্পন্ন হচ্ছে...",
          "info"
        );


        console.log(
          "[AYNA BOOK] STEP 4 START — Sign Out"
        );


        await withTimeout(

          signOut(auth),

          OPERATION_TIMEOUT,

          "Firebase sign out"

        );


        console.log(
          "[AYNA BOOK] STEP 4 SUCCESS — Sign Out"
        );


        // =================================================
        // SUCCESS
        // =================================================

        showStatus(
          "Account তৈরি সফল হয়েছে। আপনার Gmail-এ Verification Email পাঠানো হয়েছে। Gmail খুলে Verify করুন।",
          "success"
        );


        registrationForm.reset();


        if (photoPreview) {

          photoPreview.style.display =
            "none";

          photoPreview.removeAttribute(
            "src"
          );
        }


        console.log(
          "================================================="
        );

        console.log(
          "AYNA BOOK REGISTRATION SUCCESS"
        );

        console.log(
          "================================================="
        );


      } catch (error) {

        console.error(
          "================================================="
        );

        console.error(
          "AYNA BOOK REGISTRATION ERROR"
        );

        console.error(
          error
        );

        console.error(
          "================================================="
        );


        // =================================================
        // ERROR MESSAGE
        // =================================================

        let message =
          "Registration সম্পন্ন হয়নি।";


        // -----------------------------------------------
        // TIMEOUT
        // -----------------------------------------------

        if (
          error?.code ===
          "ayna/operation-timeout"
        ) {

          message =
            `Registration-এর "${error.operation}" ধাপে 20 সেকেন্ড ধরে কোনো response পাওয়া যায়নি।`;

          console.error(
            "[AYNA BOOK] TIMEOUT:",
            error.operation
          );
        }


        // -----------------------------------------------
        // AUTH ERRORS
        // -----------------------------------------------

        else if (
          error?.code ===
          "auth/email-already-in-use"
        ) {

          message =
            "এই Gmail দিয়ে Firebase-এ আগে থেকেই Account আছে।";
        }


        else if (
          error?.code ===
          "auth/invalid-email"
        ) {

          message =
            "Gmail Address সঠিক নয়।";
        }


        else if (
          error?.code ===
          "auth/weak-password"
        ) {

          message =
            "Password আরও শক্তিশালী করুন।";
        }


        else if (
          error?.code ===
          "auth/network-request-failed"
        ) {

          message =
            "Network সমস্যা হয়েছে। Internet connection পরীক্ষা করুন।";
        }


        else if (
          error?.code ===
          "auth/too-many-requests"
        ) {

          message =
            "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।";
        }


        // -----------------------------------------------
        // FIRESTORE
        // -----------------------------------------------

        else if (
          error?.code ===
          "permission-denied"
        ) {

          message =
            "Firestore Permission Denied হয়েছে। Security Rules পরীক্ষা করতে হবে।";
        }


        else if (
          error?.code ===
          "failed-precondition"
        ) {

          message =
            "Firebase configuration বা database state-এ সমস্যা হয়েছে।";
        }


        // -----------------------------------------------
        // PROFILE CREATED BUT VERIFICATION FAILED
        // -----------------------------------------------

        else if (
          profileCreated &&
          !verificationSent
        ) {

          message =
            "Firebase Account এবং Profile তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি।";
        }


        // -----------------------------------------------
        // AUTH CREATED BUT PROFILE FAILED
        // -----------------------------------------------

        else if (
          createdUser &&
          !profileCreated
        ) {

          message =
            "Firebase Account তৈরি হয়েছে, কিন্তু AYNA BOOK User Profile তৈরি করা যায়নি।";
        }


        // -----------------------------------------------
        // GENERIC ERROR
        // -----------------------------------------------

        else if (
          error?.message
        ) {

          message =
            error.message;
        }


        // -----------------------------------------------
        // SHOW ERROR
        // -----------------------------------------------

        showStatus(
          message,
          "error"
        );


        // =================================================
        // RECOVERY INFORMATION
        // =================================================

        if (createdUser) {

          console.warn(
            "-------------------------------------------------"
          );

          console.warn(
            "IMPORTANT:"
          );

          console.warn(
            "Firebase User was already created."
          );

          console.warn(
            "UID:",
            createdUser.uid
          );

          console.warn(
            "Do NOT repeatedly submit registration."
          );

          console.warn(
            "-------------------------------------------------"
          );
        }


      } finally {

        // =================================================
        // ALWAYS RESET BUTTON
        // =================================================

        setLoading(false);


        console.log(
          "[AYNA BOOK] Registration handler finished."
        );
      }

    }
  );

}


// =========================================================
// READY
// =========================================================

console.log(
  "================================================="
);

console.log(
  "AYNA BOOK — Signup Diagnostic Module Loaded"
);

console.log(
  "Firebase SDK: 13.4.0"
);

console.log(
  "Operation Timeout:",
  OPERATION_TIMEOUT / 1000,
  "seconds"
);

console.log(
  "================================================="
);