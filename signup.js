// =========================================================
// AYNA BOOK
// SIGN UP CONTROLLER
// File: signup.js
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// HTML ELEMENTS
// =========================================================

const registrationForm =
  document.getElementById("registrationForm");

const accountTypeInput =
  document.getElementById("accountType");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const countryInput =
  document.getElementById("country");

const profilePhotoInput =
  document.getElementById("profilePhoto");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const termsInput =
  document.getElementById("terms");

const registerButton =
  document.getElementById("registerButton");

const statusMessage =
  document.getElementById("statusMessage");


// =========================================================
// CONSTANTS
// =========================================================

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


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
// VALIDATE GMAIL
// =========================================================

function validateGmail(email) {

  const value =
    email.trim().toLowerCase();

  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(
    value
  );

}


// =========================================================
// VALIDATE PASSWORD
// =========================================================

function validatePassword(password) {

  return (
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );

}


// =========================================================
// VALIDATE FULL NAME
// =========================================================

function validateFullName(name) {

  const value =
    name.trim();

  return (
    value.length >= 2 &&
    value.length <= 100
  );

}


// =========================================================
// VALIDATE PHONE
// =========================================================

function validatePhone(phone) {

  const value =
    phone.trim();

  if (!value) {
    return true;
  }

  return /^[0-9+\-\s()]{7,20}$/.test(
    value
  );

}


// =========================================================
// VALIDATE PHOTO
// =========================================================

function validatePhoto(file) {

  if (!file) {
    return true;
  }

  if (
    !ALLOWED_PHOTO_TYPES.includes(
      file.type
    )
  ) {

    showStatus(
      "Profile Photo অবশ্যই JPG, PNG অথবা WebP হতে হবে।",
      "error"
    );

    return false;

  }


  if (file.size > MAX_PHOTO_SIZE) {

    showStatus(
      "Profile Photo সর্বোচ্চ 5 MB হতে পারবে।",
      "error"
    );

    return false;

  }


  return true;

}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getErrorMessage(error) {

  console.error(
    "AYNA BOOK Firebase Error:",
    error
  );


  switch (error?.code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে একটি account আছে।";

    case "auth/invalid-email":
      return "Gmail address সঠিক নয়।";

    case "auth/weak-password":
      return "Password আরও শক্তিশালী দিন।";

    case "auth/network-request-failed":
      return "Internet connection সমস্যা হয়েছে।";

    case "auth/operation-not-allowed":
      return "Email/Password authentication Firebase-এ চালু নেই।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "permission-denied":
      return "Firebase permission denied করেছে। Firestore/Storage Rules পরীক্ষা করুন।";

    case "storage/unauthorized":
      return "Profile photo upload করার permission নেই।";

    case "storage/canceled":
      return "Profile photo upload বাতিল হয়েছে।";

    case "storage/unknown":
      return "Profile photo upload করার সময় সমস্যা হয়েছে।";

    default:
      return (
        error?.message ||
        "Account তৈরি করার সময় একটি সমস্যা হয়েছে।"
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
    return "";
  }


  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const photoPath =
    `profilePhotos/${user.uid}/profile.${extension}`;


  const photoRef =
    ref(storage, photoPath);


  await uploadBytes(
    photoRef,
    file,
    {
      contentType: file.type
    }
  );


  const downloadURL =
    await getDownloadURL(
      photoRef
    );


  return downloadURL;

}


// =========================================================
// DISABLE FORM
// =========================================================

function setFormLoading(isLoading) {

  if (!registerButton) {
    return;
  }


  registerButton.disabled =
    isLoading;


  if (isLoading) {

    registerButton.textContent =
      "Account তৈরি হচ্ছে...";

  } else {

    registerButton.textContent =
      "Create Account";

  }

}


// =========================================================
// CREATE ACCOUNT
// =========================================================

async function createAccount() {

  const accountType =
    accountTypeInput?.value ||
    "personal";


  const fullName =
    fullNameInput?.value.trim() ||
    "";


  const email =
    emailInput?.value.trim().toLowerCase() ||
    "";


  const phone =
    phoneInput?.value.trim() ||
    "";


  const country =
    countryInput?.value.trim() ||
    "Bangladesh";


  const password =
    passwordInput?.value ||
    "";


  const confirmPassword =
    confirmPasswordInput?.value ||
    "";


  const profilePhoto =
    profilePhotoInput?.files?.[0] ||
    null;


  // -------------------------------------------------------
  // Validate Full Name
  // -------------------------------------------------------

  if (!validateFullName(fullName)) {

    throw new Error(
      "আপনার পূর্ণ নাম সঠিকভাবে লিখুন।"
    );

  }


  // -------------------------------------------------------
  // Validate Gmail
  // -------------------------------------------------------

  if (!validateGmail(email)) {

    throw new Error(
      "শুধুমাত্র valid Gmail address ব্যবহার করুন।"
    );

  }


  // -------------------------------------------------------
  // Validate Phone
  // -------------------------------------------------------

  if (!validatePhone(phone)) {

    throw new Error(
      "Mobile Number সঠিক নয়।"
    );

  }


  // -------------------------------------------------------
  // Validate Password
  // -------------------------------------------------------

  if (!validatePassword(password)) {

    throw new Error(
      `Password অবশ্যই ${MIN_PASSWORD_LENGTH} থেকে ${MAX_PASSWORD_LENGTH} অক্ষরের মধ্যে হতে হবে।`
    );

  }


  // -------------------------------------------------------
  // Confirm Password
  // -------------------------------------------------------

  if (password !== confirmPassword) {

    throw new Error(
      "Password এবং Confirm Password একই নয়।"
    );

  }


  // -------------------------------------------------------
  // Terms
  // -------------------------------------------------------

  if (!termsInput?.checked) {

    throw new Error(
      "Account তৈরি করতে Terms & Conditions গ্রহণ করতে হবে।"
    );

  }


  // -------------------------------------------------------
  // Profile Photo
  // -------------------------------------------------------

  if (!validatePhoto(profilePhoto)) {

    throw new Error(
      "Profile Photo সঠিক নয়।"
    );

  }


  // -------------------------------------------------------
  // Create Firebase Authentication account
  // -------------------------------------------------------

  const credential =
    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );


  const user =
    credential.user;


  // -------------------------------------------------------
  // Update Firebase Auth display name
  // -------------------------------------------------------

  await updateProfile(
    user,
    {
      displayName: fullName
    }
  );


  // -------------------------------------------------------
  // Upload profile photo
  // -------------------------------------------------------

  let photoURL = "";


  if (profilePhoto) {

    photoURL =
      await uploadProfilePhoto(
        user,
        profilePhoto
      );


    // Update Auth profile photo
    await updateProfile(
      user,
      {
        displayName: fullName,
        photoURL: photoURL
      }
    );

  }


  // -------------------------------------------------------
  // Account information
  // -------------------------------------------------------

  let plan =
    "Free";


  let accountStatus =
    "Active";


  if (accountType === "personal") {

    plan = "Free";

  }


  // -------------------------------------------------------
  // Create Firestore profile
  // -------------------------------------------------------

  const userRef =
    doc(
      db,
      "users",
      user.uid
    );


  await setDoc(
    userRef,
    {
      uid: user.uid,

      fullName: fullName,

      name: fullName,

      email: email,

      phone: phone,

      country: country,

      accountType: accountType,

      plan: plan,

      accountStatus: accountStatus,

      bio: "",

      photoURL: photoURL,

      emailVerified:
        user.emailVerified,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()
    }
  );


  // -------------------------------------------------------
  // Send verification email
  // -------------------------------------------------------

  await sendEmailVerification(
    user
  );


  return user;

}


// =========================================================
// FORM SUBMIT
// =========================================================

if (registrationForm) {

  registrationForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      showStatus("");


      setFormLoading(true);


      try {

        const user =
          await createAccount();


        console.log(
          "AYNA BOOK: Account created:",
          user.uid
        );


        showStatus(
          "Account সফলভাবে তৈরি হয়েছে। আপনার Gmail-এ verification link পাঠানো হয়েছে।",
          "success"
        );


        // -------------------------------------------------
        // Redirect to verification page
        // -------------------------------------------------

        setTimeout(() => {

          window.location.href =
            "./verify-email.html";

        }, 1500);


      } catch (error) {

        console.error(
          "AYNA BOOK: Registration failed:",
          error
        );


        showStatus(
          getErrorMessage(error),
          "error"
        );


        setFormLoading(false);

      }

    }
  );

}


// =========================================================
// PHOTO VALIDATION ON SELECT
// =========================================================

if (profilePhotoInput) {

  profilePhotoInput.addEventListener(
    "change",
    () => {

      const file =
        profilePhotoInput.files?.[0] ||
        null;


      if (!file) {
        return;
      }


      if (!validatePhoto(file)) {

        profilePhotoInput.value =
          "";

      }

    }
  );

}


// =========================================================
// PASSWORD CONFIRMATION
// =========================================================

if (confirmPasswordInput) {

  confirmPasswordInput.addEventListener(
    "input",
    () => {

      const password =
        passwordInput?.value ||
        "";

      const confirmPassword =
        confirmPasswordInput.value;


      if (
        confirmPassword &&
        password !== confirmPassword
      ) {

        confirmPasswordInput.setCustomValidity(
          "Password এবং Confirm Password একই নয়।"
        );

      } else {

        confirmPasswordInput.setCustomValidity(
          ""
        );

      }

    }
  );

}


// =========================================================
// INITIAL MESSAGE
// =========================================================

console.log(
  "AYNA BOOK: signup.js loaded successfully."
);