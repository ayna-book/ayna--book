// =========================================================
// AYNA BOOK
// SIGNUP / REGISTRATION
// Firebase SDK: 13.4.0
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

  if (!statusMessage) return;

  statusMessage.textContent = message;

  statusMessage.className = `status-message ${type}`;

  statusMessage.style.display = "block";
}


// =========================================================
// LOADING
// =========================================================

function setLoading(isLoading) {

  if (!registerButton) return;

  registerButton.disabled = isLoading;

  registerButton.textContent =
    isLoading
      ? "CREATING ACCOUNT..."
      : "CREATE ACCOUNT";
}


// =========================================================
// VALUE HELPERS
// =========================================================

function getValue(id) {

  const element = document.getElementById(id);

  return element
    ? element.value.trim()
    : "";
}


// =========================================================
// GMAIL VALIDATION
// =========================================================

function validateGmail(email) {

  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}


// =========================================================
// PHONE NORMALIZATION
// =========================================================

function normalizePhone(phone) {

  let value = phone.replace(/\s+/g, "");

  if (/^01\d{9}$/.test(value)) {
    return "+880" + value.substring(1);
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

  return typeof password === "string" &&
         password.length >= 11;
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

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {

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

  profilePhoto.addEventListener("change", () => {

    const file = profilePhoto.files?.[0];

    if (!file) {

      if (photoPreview) {
        photoPreview.style.display = "none";
        photoPreview.removeAttribute("src");
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
        photoPreview.style.display = "none";
        photoPreview.removeAttribute("src");
      }

      return;
    }

    if (photoPreview) {

      const objectURL =
        URL.createObjectURL(file);

      photoPreview.src = objectURL;

      photoPreview.style.display = "block";

      photoPreview.onload = () => {
        URL.revokeObjectURL(objectURL);
      };
    }
  });
}


// =========================================================
// FIRESTORE USER PROFILE
// =========================================================

async function createUserProfile(user, data) {

  showStatus(
    "ধাপ ২/৪: AYNA BOOK Profile তৈরি হচ্ছে...",
    "info"
  );

  const userRef =
    doc(db, "users", user.uid);

  await setDoc(userRef, {

    uid: user.uid,

    fullName: data.fullName,

    email: data.email,

    phone: data.phone,

    accountType: "personal",

    bio: "",

    country: "",

    photoURL: "",

    emailVerified: false,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp()

  });

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

  await sendEmailVerification(user);

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

      // -----------------------------------------------
      // PREVENT DOUBLE SUBMIT
      // -----------------------------------------------

      if (
        registerButton &&
        registerButton.disabled
      ) {
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
        getValue("email").toLowerCase();

      const phoneInput =
        getValue("phone");

      const password =
        getValue("password");

      const confirmPassword =
        getValue("confirmPassword");

      const terms =
        document.getElementById("terms");

      const photoFile =
        profilePhoto?.files?.[0] || null;


      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (accountType !== "personal") {

        showStatus(
          "এই Registration ধাপে বর্তমানে Personal — Free Account চালু আছে।",
          "error"
        );

        return;
      }


      if (!fullName || fullName.length < 2) {

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
        normalizePhone(phoneInput);

      if (!normalizedPhone) {

        showStatus(
          "সঠিক Bangladesh Mobile Number দিন।",
          "error"
        );

        return;
      }


      if (!validatePassword(password)) {

        showStatus(
          "Password কমপক্ষে 11 characters হতে হবে।",
          "error"
        );

        return;
      }


      if (password !== confirmPassword) {

        showStatus(
          "Password এবং Confirm Password একই নয়।",
          "error"
        );

        return;
      }


      if (!terms || !terms.checked) {

        showStatus(
          "Terms and Privacy Policy গ্রহণ করুন।",
          "error"
        );

        return;
      }


      const photoValidation =
        validatePhoto(photoFile);

      if (!photoValidation.valid) {

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

      let createdUser = null;
      let profileCreated = false;
      let verificationSent = false;


      try {

        // =================================================
        // STEP 1
        // FIREBASE AUTHENTICATION
        // =================================================

        showStatus(
          "ধাপ ১/৪: Firebase Account তৈরি হচ্ছে...",
          "info"
        );


        /*
         * IMPORTANT:
         * Do not block registration just because an
         * anonymous Firebase user exists.
         *
         * Only an actual authenticated email/password
         * account should be considered an existing account.
         */

        if (
          auth.currentUser &&
          !auth.currentUser.isAnonymous
        ) {

          showStatus(
            "এই Browser-এ ইতোমধ্যে একটি Account চালু আছে। আগে Logout করুন।",
            "error"
          );

          setLoading(false);

          return;
        }


        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );


        createdUser =
          credential.user;


        if (!createdUser) {

          throw new Error(
            "Firebase Account তৈরি হয়েছে বলে নিশ্চিত হওয়া যায়নি।"
          );
        }


        // -----------------------------------------------
        // UPDATE DISPLAY NAME
        // -----------------------------------------------

        showStatus(
          "ধাপ ১/৪ সম্পন্ন: Account তৈরি হয়েছে।",
          "success"
        );


        await updateProfile(
          createdUser,
          {
            displayName: fullName
          }
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
            phone: normalizedPhone
          }
        );


        profileCreated = true;


        // =================================================
        // STEP 3
        // EMAIL VERIFICATION
        // =================================================

        await sendVerification(
          createdUser
        );


        verificationSent = true;


        // =================================================
        // STEP 4
        // SIGN OUT
        // =================================================

        showStatus(
          "ধাপ ৪/৪: Registration সম্পন্ন হচ্ছে...",
          "info"
        );


        await signOut(auth);


        // =================================================
        // SUCCESS
        // =================================================

        showStatus(
          "Account তৈরি সফল হয়েছে। আপনার Gmail-এ Verification Email পাঠানো হয়েছে। Gmail খুলে Verify করুন।",
          "success"
        );


        registrationForm.reset();


        if (photoPreview) {

          photoPreview.style.display = "none";

          photoPreview.removeAttribute("src");
        }


      } catch (error) {

        console.error(
          "AYNA BOOK Registration Error:",
          error
        );


        // =================================================
        // ERROR MESSAGE
        // =================================================

        let message =
          "Registration সম্পন্ন হয়নি।";


        if (
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

        else if (profileCreated && !verificationSent) {

          message =
            "Account এবং Profile তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি।";
        }

        else if (createdUser && !profileCreated) {

          message =
            "Firebase Account তৈরি হয়েছে, কিন্তু User Profile তৈরি করা যায়নি।";
        }

        else if (error?.message) {

          message =
            error.message;
        }


        showStatus(
          message,
          "error"
        );


        // =================================================
        // IMPORTANT RECOVERY INFORMATION
        // =================================================

        if (createdUser) {

          console.warn(
            "Firebase User was created:",
            createdUser.uid
          );

          console.warn(
            "Do not repeatedly submit the form."
          );
        }

      } finally {

        setLoading(false);
      }
    }
  );
}


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Signup module loaded successfully."
);