// =========================================================
// AYNA BOOK
// Registration Controller
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
  PhoneAuthProvider,
  RecaptchaVerifier,
  verifyPhoneNumber
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

import {
  getAccountType,
  getSelectedAccount,
  saveSelectedAccount
} from "./account-types.js";


// =========================================================
// CONSTANTS
// =========================================================

const OTP_SECONDS = 120;

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024;

const MIN_PASSWORD_LENGTH = 11;


// =========================================================
// DOM ELEMENTS
// =========================================================

const form =
  document.getElementById(
    "registrationForm"
  );

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const otpInput =
  document.getElementById("otp");

const photoInput =
  document.getElementById("photo");

const termsInput =
  document.getElementById("terms");

const sendOtpBtn =
  document.getElementById("sendOtpBtn");

const createAccountBtn =
  document.getElementById(
    "createAccountBtn"
  );

const countdownElement =
  document.getElementById(
    "countdown"
  );

const messageElement =
  document.getElementById(
    "message"
  );


// =========================================================
// INTERNAL STATE
// =========================================================

let recaptchaVerifier = null;

let verificationId = null;

let otpTimer = null;

let otpSecondsRemaining = 0;

let otpSending = false;

let registrationStarted = false;


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
  message,
  type = ""
) {

  if (!messageElement) {
    return;
  }

  messageElement.textContent =
    message || "";

  if (type === "error") {

    messageElement.style.color =
      "#EF4444";

  } else if (type === "success") {

    messageElement.style.color =
      "#22C55E";

  } else {

    messageElement.style.color =
      "#A9B0BC";

  }

}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function firebaseErrorMessage(error) {

  console.error(
    "AYNA BOOK — Firebase Error:",
    error
  );

  const code =
    error?.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "এই Gmail দিয়ে ইতিমধ্যে Account আছে। Login করুন।";

    case "auth/invalid-email":
      return "Gmail address সঠিক নয়।";

    case "auth/weak-password":
      return "Password আরও শক্তিশালী দিন। কমপক্ষে ১১ অক্ষর প্রয়োজন।";

    case "auth/operation-not-allowed":
      return "Firebase Console-এ Email/Password অথবা Phone Authentication চালু করা হয়নি।";

    case "auth/network-request-failed":
      return "ইন্টারনেট সংযোগ পরীক্ষা করুন।";

    case "auth/too-many-requests":
      return "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

    case "auth/invalid-phone-number":
      return "মোবাইল নম্বর সঠিক নয়।";

    case "auth/missing-phone-number":
      return "মোবাইল নম্বর দিন।";

    case "auth/quota-exceeded":
      return "SMS quota শেষ হয়েছে। পরে আবার চেষ্টা করুন।";

    case "auth/captcha-check-failed":
      return "reCAPTCHA যাচাই ব্যর্থ হয়েছে। পেজটি Refresh করে আবার চেষ্টা করুন।";

    case "auth/invalid-verification-code":
      return "OTP সঠিক নয়।";

    case "auth/code-expired":
      return "OTP-এর সময় শেষ হয়েছে। নতুন OTP পাঠান।";

    case "auth/credential-already-in-use":
      return "এই মোবাইল নম্বর অন্য একটি Account-এর সঙ্গে যুক্ত আছে।";

    case "auth/provider-already-linked":
      return "এই Account-এ মোবাইল নম্বর ইতিমধ্যে যুক্ত আছে।";

    default:
      return (
        error?.message ||
        "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );

  }

}


// =========================================================
// NORMALIZE BANGLADESHI PHONE
// =========================================================

function normalizePhone(phone) {

  let value =
    String(phone || "")
      .trim()
      .replace(
        /[\s\-().]/g,
        ""
      );


  if (
    /^01\d{9}$/.test(value)
  ) {

    return (
      "+880" +
      value.substring(1)
    );

  }


  if (
    /^8801\d{9}$/.test(value)
  ) {

    return "+" + value;

  }


  if (
    /^\+8801\d{9}$/.test(value)
  ) {

    return value;

  }


  throw new Error(
    "সঠিক বাংলাদেশি মোবাইল নম্বর দিন। উদাহরণ: 017XXXXXXXX"
  );

}


// =========================================================
// GMAIL VALIDATION
// =========================================================

function validateGmail(email) {

  return /^[a-z0-9._%+-]+@gmail\.com$/i
    .test(
      String(email || "")
        .trim()
        .toLowerCase()
    );

}


// =========================================================
// PASSWORD VALIDATION
// =========================================================

function validatePassword(password) {

  return (
    typeof password === "string" &&
    password.length >=
      MIN_PASSWORD_LENGTH
  );

}


// =========================================================
// GET ACCOUNT FROM URL / STORAGE
// =========================================================

function getRegistrationAccount() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const urlAccount =
    params.get("account");


  if (urlAccount) {

    const account =
      getAccountType(
        urlAccount
      );

    if (account) {

      try {

        saveSelectedAccount(
          account.id
        );

      } catch (error) {

        console.warn(
          "Could not save selected account:",
          error
        );

      }

      return account;

    }

  }


  return getSelectedAccount();

}


const selectedAccount =
  getRegistrationAccount();


if (!selectedAccount) {

  showMessage(
    "Account Type নির্বাচন করা হয়নি। প্রথমে Account নির্বাচন করুন।",
    "error"
  );

  if (createAccountBtn) {
    createAccountBtn.disabled = true;
  }

}


// =========================================================
// reCAPTCHA
// =========================================================

function setupRecaptcha() {

  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }


  if (!sendOtpBtn) {

    throw new Error(
      "SEND SMS OTP button পাওয়া যায়নি।"
    );

  }


  try {

    recaptchaVerifier =
      new RecaptchaVerifier(
        auth,
        sendOtpBtn,
        {
          size: "invisible",

          callback: () => {

            console.log(
              "AYNA BOOK — reCAPTCHA verified."
            );

          },

          "expired-callback": () => {

            console.warn(
              "AYNA BOOK — reCAPTCHA expired."
            );

          }

        }
      );


    return recaptchaVerifier;

  } catch (error) {

    console.error(
      "AYNA BOOK — reCAPTCHA setup error:",
      error
    );

    throw new Error(
      "reCAPTCHA প্রস্তুত করা যায়নি। পেজটি Refresh করুন।"
    );

  }

}


// =========================================================
// OTP COUNTDOWN
// =========================================================

function stopOtpCountdown() {

  if (otpTimer) {

    clearInterval(
      otpTimer
    );

    otpTimer = null;

  }

}


function updateCountdownText() {

  if (!countdownElement) {
    return;
  }


  if (
    otpSecondsRemaining <= 0
  ) {

    countdownElement.textContent =
      "OTP-এর সময় শেষ হয়েছে। নতুন OTP পাঠাতে পারেন।";

    return;

  }


  const minutes =
    Math.floor(
      otpSecondsRemaining / 60
    );

  const seconds =
    otpSecondsRemaining % 60;


  countdownElement.textContent =
    "OTP valid UI timer: "
    + String(minutes).padStart(2, "0")
    + ":"
    + String(seconds).padStart(2, "0");

}


function startOtpCountdown() {

  stopOtpCountdown();


  otpSecondsRemaining =
    OTP_SECONDS;


  updateCountdownText();


  otpTimer =
    setInterval(
      () => {

        otpSecondsRemaining--;

        updateCountdownText();


        if (
          otpSecondsRemaining <= 0
        ) {

          stopOtpCountdown();

          if (sendOtpBtn) {

            sendOtpBtn.disabled =
              false;

            sendOtpBtn.textContent =
              "RESEND SMS OTP";

          }

        }

      },
      1000
    );

}


// =========================================================
// SEND SMS OTP
// =========================================================

async function sendSmsOtp() {

  if (otpSending) {
    return;
  }


  if (!selectedAccount) {

    showMessage(
      "প্রথমে Account Type নির্বাচন করুন।",
      "error"
    );

    return;

  }


  const name =
    nameInput?.value
      ?.trim() || "";


  const email =
    emailInput?.value
      ?.trim()
      .toLowerCase() || "";


  const phone =
    phoneInput?.value
      ?.trim() || "";


  const password =
    passwordInput?.value || "";


  const confirmPassword =
    confirmPasswordInput?.value || "";


  if (name.length < 2) {

    showMessage(
      "প্রথমে আপনার নাম দিন।",
      "error"
    );

    nameInput?.focus();

    return;

  }


  if (!validateGmail(email)) {

    showMessage(
      "সঠিক Gmail address দিন।",
      "error"
    );

    emailInput?.focus();

    return;

  }


  if (!validatePassword(password)) {

    showMessage(
      "Password কমপক্ষে ১১ অক্ষরের হতে হবে।",
      "error"
    );

    passwordInput?.focus();

    return;

  }


  if (
    password !==
    confirmPassword
  ) {

    showMessage(
      "Password এবং Confirm Password মিলছে না।",
      "error"
    );

    confirmPasswordInput?.focus();

    return;

  }


  let normalizedPhone;

  try {

    normalizedPhone =
      normalizePhone(phone);

  } catch (error) {

    showMessage(
      error.message,
      "error"
    );

    phoneInput?.focus();

    return;

  }


  if (auth.currentUser) {

    showMessage(
      "এই Registration session ইতিমধ্যে শুরু হয়েছে।",
      "error"
    );

    return;

  }


  otpSending = true;

  sendOtpBtn.disabled = true;

  sendOtpBtn.textContent =
    "প্রস্তুত হচ্ছে...";


  try {

    /*
     * STEP 1
     * Firebase Email/Password account তৈরি
     */

    showMessage(
      "Registration account প্রস্তুত করা হচ্ছে..."
    );


    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      credential.user;


    registrationStarted =
      true;


    /*
     * Name Firebase Auth profile-এ রাখা
     */

    await updateProfile(
      user,
      {
        displayName: name
      }
    );


    /*
     * STEP 2
     * reCAPTCHA
     */

    showMessage(
      "SMS OTP-এর জন্য নিরাপত্তা যাচাই করা হচ্ছে..."
    );


    const verifier =
      setupRecaptcha();


    /*
     * STEP 3
     * Phone Authentication
     */

    const provider =
      new PhoneAuthProvider(
        auth
      );


    showMessage(
      "আপনার মোবাইলে SMS OTP পাঠানো হচ্ছে..."
    );


    verificationId =
      await verifyPhoneNumber(
        provider,
        {
          phoneNumber:
            normalizedPhone,

          session:
            user
        },
        verifier
      );


    /*
     * STEP 4
     * OTP timer
     */

    startOtpCountdown();


    sendOtpBtn.disabled =
      true;

    sendOtpBtn.textContent =
      "OTP SENT ✓";


    showMessage(
      "SMS OTP পাঠানো হয়েছে। ৬ সংখ্যার OTP দিন।",
      "success"
    );


    /*
     * OTP input focus
     */

    otpInput?.focus();


  } catch (error) {

    console.error(
      "AYNA BOOK — Send OTP Error:",
      error
    );


    /*
     * reCAPTCHA reset
     */

    try {

      if (
        recaptchaVerifier &&
        typeof recaptchaVerifier.clear ===
          "function"
      ) {

        recaptchaVerifier.clear();

      }

    } catch (captchaError) {

      console.warn(
        "reCAPTCHA clear failed:",
        captchaError
      );

    }


    recaptchaVerifier =
      null;


    showMessage(
      firebaseErrorMessage(
        error
      ),
      "error"
    );


    sendOtpBtn.disabled =
      false;

    sendOtpBtn.textContent =
      "SEND SMS OTP";

  } finally {

    otpSending =
      false;

  }

}


// =========================================================
// SEND OTP BUTTON
// =========================================================

if (sendOtpBtn) {

  sendOtpBtn.addEventListener(
    "click",
    sendSmsOtp
  );

}


// =========================================================
// OTP INPUT
// =========================================================

if (otpInput) {

  otpInput.addEventListener(
    "input",
    () => {

      otpInput.value =
        otpInput.value
          .replace(/\D/g, "")
          .slice(0, 6);

    }
  );

}


// =========================================================
// COMPLETE REGISTRATION
// =========================================================

async function completeRegistration() {

  if (!selectedAccount) {

    showMessage(
      "Account Type নির্বাচন করুন।",
      "error"
    );

    return;

  }


  const name =
    nameInput?.value
      ?.trim() || "";


  const email =
    emailInput?.value
      ?.trim()
      .toLowerCase() || "";


  const phone =
    phoneInput?.value
      ?.trim() || "";


  const password =
    passwordInput?.value || "";


  const confirmPassword =
    confirmPasswordInput?.value || "";


  const otp =
    otpInput?.value
      ?.trim() || "";


  const photoFile =
    photoInput?.files?.[0] ||
    null;


  const termsAccepted =
    termsInput?.checked === true;


  if (!name || name.length < 2) {

    showMessage(
      "সঠিক নাম দিন।",
      "error"
    );

    return;

  }


  if (!validateGmail(email)) {

    showMessage(
      "সঠিক Gmail address দিন।",
      "error"
    );

    return;

  }


  if (!validatePassword(password)) {

    showMessage(
      "Password কমপক্ষে ১১ অক্ষরের হতে হবে।",
      "error"
    );

    return;

  }


  if (
    password !==
    confirmPassword
  ) {

    showMessage(
      "Password এবং Confirm Password মিলছে না।",
      "error"
    );

    return;

  }


  if (
    !/^\d{6}$/.test(otp)
  ) {

    showMessage(
      "৬ সংখ্যার সঠিক SMS OTP দিন।",
      "error"
    );

    return;

  }


  if (!verificationId) {

    showMessage(
      "আগে SMS OTP পাঠান।",
      "error"
    );

    return;

  }


  if (!termsAccepted) {

    showMessage(
      "Terms ও Privacy Policy-তে সম্মতি দিন।",
      "error"
    );

    return;

  }


  const user =
    auth.currentUser;


  if (!user) {

    showMessage(
      "Registration session পাওয়া যায়নি। আবার Registration শুরু করুন।",
      "error"
    );

    return;

  }


  createAccountBtn.disabled =
    true;

  createAccountBtn.textContent =
    "VERIFYING OTP...";


  try {

    /*
     * =====================================================
     * STEP 1 — VERIFY PHONE OTP
     * =====================================================
     */

    const phoneCredential =
      PhoneAuthProvider.credential(
        verificationId,
        otp
      );


    /*
     * Phone credential account-এর সঙ্গে link
     */

    await user.linkWithCredential(
      phoneCredential
    );


    /*
     * =====================================================
     * STEP 2 — PROFILE PHOTO
     * =====================================================
     */

    let photoURL = "";


    if (photoFile) {

      if (
        !photoFile.type.startsWith(
          "image/"
        )
      ) {

        throw new Error(
          "Profile photo অবশ্যই image হতে হবে।"
        );

      }


      if (
        photoFile.size >
        MAX_PHOTO_SIZE
      ) {

        throw new Error(
          "Profile photo সর্বোচ্চ 5 MB হতে পারবে।"
        );

      }


      createAccountBtn.textContent =
        "UPLOADING PHOTO...";


      try {

        const photoRef =
          ref(
            storage,
            "users/"
            + user.uid
            + "/profile/profile.jpg"
          );


        await uploadBytes(
          photoRef,
          photoFile,
          {
            contentType:
              photoFile.type
          }
        );


        photoURL =
          await getDownloadURL(
            photoRef
          );


      } catch (photoError) {

        console.error(
          "AYNA BOOK — Photo Upload Error:",
          photoError
        );


        /*
         * Photo upload ব্যর্থ হলে
         * পুরো Registration ব্যর্থ না করে
         * Account চালু রাখা হবে।
         */

        photoURL = "";

      }

    }


    /*
     * =====================================================
     * STEP 3 — UPDATE AUTH PROFILE
     * =====================================================
     */

    createAccountBtn.textContent =
      "SAVING ACCOUNT...";


    await updateProfile(
      user,
      {
        displayName:
          name,

        photoURL:
          photoURL || null
      }
    );


    /*
     * =====================================================
     * STEP 4 — ACCOUNT STATUS
     * =====================================================
     */

    const isPaid =
      selectedAccount.paymentRequired === true;


    const accountStatus =
      isPaid
        ? "pending_payment"
        : "active";


    const paymentStatus =
      isPaid
        ? "pending"
        : "not_required";


    /*
     * =====================================================
     * STEP 5 — FIRESTORE
     * =====================================================
     */

    await setDoc(
      doc(
        db,
        "users",
        user.uid
      ),
      {

        uid:
          user.uid,

        name:
          name,

        displayName:
          name,

        email:
          email,

        phone:
          normalizePhone(phone),

        phoneVerified:
          true,

        photoURL:
          photoURL,

        accountType:
          selectedAccount.id,

        accountName:
          selectedAccount.name,

        priceUSD:
          selectedAccount.priceUSD,

        paymentRequired:
          isPaid,

        paymentStatus:
          paymentStatus,

        accountStatus:
          accountStatus,

        registrationCompleted:
          true,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      },
      {
        merge: true
      }
    );


    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    if (isPaid) {

      showMessage(
        selectedAccount.name
        + " Account Registration সফল। "
        + "Payment Verification Pending.",
        "success"
      );


      createAccountBtn.textContent =
        "PAYMENT PENDING";


      /*
       * পরের ধাপে Payment page যুক্ত হবে।
       */

      setTimeout(
        () => {

          window.location.replace(
            "./payment.html"
            + "?account="
            + encodeURIComponent(
                selectedAccount.id
              )
          );

        },
        1200
      );


    } else {

      showMessage(
        "Personal Account Registration সফল হয়েছে। Login page-এ নেওয়া হচ্ছে...",
        "success"
      );


      createAccountBtn.textContent =
        "ACCOUNT CREATED ✓";


      setTimeout(
        () => {

          window.location.replace(
            "./login.html"
          );

        },
        1200
      );

    }


  } catch (error) {

    console.error(
      "AYNA BOOK — Complete Registration Error:",
      error
    );


    showMessage(
      firebaseErrorMessage(
        error
      ),
      "error"
    );


    createAccountBtn.disabled =
      false;

    createAccountBtn.textContent =
      "CREATE ACCOUNT";

  }

}


// =========================================================
// FORM SUBMIT
// =========================================================

if (form) {

  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (!verificationId) {

        showMessage(
          "প্রথমে SEND SMS OTP চাপুন এবং OTP গ্রহণ করুন।",
          "error"
        );

        return;

      }


      await completeRegistration();

    }
  );

}


// =========================================================
// PAGE EXIT WARNING
// =========================================================

window.addEventListener(
  "beforeunload",
  event => {

    if (
      registrationStarted &&
      auth.currentUser
    ) {

      /*
       * Browser সাধারণত custom message
       * দেখায় না; শুধু confirmation prompt।
       */

      event.preventDefault();

      event.returnValue = "";

    }

  }
);


// =========================================================
// INITIAL MESSAGE
// =========================================================

if (selectedAccount) {

  if (
    selectedAccount.paymentRequired
  ) {

    showMessage(
      selectedAccount.name
      + " selected. Registration-এর পরে Payment Verification প্রয়োজন।"
    );

  } else {

    showMessage(
      "Personal Account selected. এটি Free Account।"
    );

  }

}


console.log(
  "AYNA BOOK — signup.js loaded successfully."
);