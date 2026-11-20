// =========================================================
// AYNA BOOK
// Registration Controller — TEST VERSION
// Firebase SDK: 13.4.0
// Free Plan + Gmail Verification
// =========================================================

import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// =========================================================
// ELEMENTS
// =========================================================

const form = document.getElementById("registrationForm");
const registerButton =
  document.getElementById("registerButton");
const statusMessage =
  document.getElementById("statusMessage");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const accountTypeInput =
  document.getElementById("accountType");

const termsInput =
  document.getElementById("terms");


// =========================================================
// STATUS
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) return;

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;

  statusMessage.style.display = "block";
}


// =========================================================
// LOADING
// =========================================================

function setLoading(loading) {

  if (!registerButton) return;

  registerButton.disabled = loading;

  registerButton.textContent =
    loading
      ? "CREATING ACCOUNT..."
      : "REGISTER";
}


// =========================================================
// GMAIL VALIDATION
// =========================================================

function isValidGmail(email) {

  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
    .test(email);
}


// =========================================================
// PHONE VALIDATION
// =========================================================

function isValidPhone(phone) {

  const value =
    phone.replace(/[\s\-().]/g, "");

  return /^\+?[0-9]{10,15}$/.test(value);
}


// =========================================================
// FORM CHECK
// =========================================================

if (!form) {

  console.error(
    "AYNA BOOK: registrationForm পাওয়া যায়নি।"
  );

} else {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      // ---------------------------------------------------
      // Prevent double click
      // ---------------------------------------------------

      if (registerButton?.disabled) {
        return;
      }


      // ---------------------------------------------------
      // Read values
      // ---------------------------------------------------

      const fullName =
        fullNameInput?.value.trim() || "";

      const email =
        emailInput?.value.trim().toLowerCase() || "";

      const phone =
        phoneInput?.value.trim() || "";

      const password =
        passwordInput?.value || "";

      const confirmPassword =
        confirmPasswordInput?.value || "";

      const accountType =
        accountTypeInput?.value || "personal";


      // ---------------------------------------------------
      // Full Name
      // ---------------------------------------------------

      if (fullName.length < 2) {

        showStatus(
          "আপনার Full Name দিন।",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Gmail
      // ---------------------------------------------------

      if (!isValidGmail(email)) {

        showStatus(
          "সঠিক Gmail Address দিন। উদাহরণ: example@gmail.com",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Phone
      // ---------------------------------------------------

      if (!isValidPhone(phone)) {

        showStatus(
          "সঠিক Mobile Number দিন। উদাহরণ: +8801XXXXXXXXX",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Password
      // ---------------------------------------------------

      if (password.length < 11) {

        showStatus(
          "Password কমপক্ষে 11 অক্ষরের হতে হবে।",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Confirm Password
      // ---------------------------------------------------

      if (password !== confirmPassword) {

        showStatus(
          "Password এবং Confirm Password মিলছে না।",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // Terms
      // ---------------------------------------------------

      if (!termsInput?.checked) {

        showStatus(
          "Terms and Privacy Policy গ্রহণ করুন।",
          "error"
        );

        return;
      }


      // ---------------------------------------------------
      // START
      // ---------------------------------------------------

      setLoading(true);

      showStatus(
        "Firebase Account তৈরি করা হচ্ছে...",
        "info"
      );


      let createdUser = null;


      try {

        // =================================================
        // STEP 1 — CREATE FIREBASE ACCOUNT
        // =================================================

        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        createdUser =
          credential.user;


        console.log(
          "AYNA BOOK — Firebase Account Created:",
          createdUser.uid
        );


        // =================================================
        // STEP 2 — UPDATE DISPLAY NAME
        // =================================================

        showStatus(
          "Account তৈরি হয়েছে। Profile Name সংরক্ষণ করা হচ্ছে...",
          "info"
        );


        // updateProfile আলাদা import না করে
        // Firebase user-এর updateProfile ব্যবহার করা হচ্ছে।

        if (createdUser.updateProfile) {

          await createdUser.updateProfile({
            displayName: fullName
          });

        }


        // =================================================
        // STEP 3 — SEND GMAIL VERIFICATION
        // =================================================

        showStatus(
          "Gmail Verification Link পাঠানো হচ্ছে...",
          "info"
        );


        await sendEmailVerification(
          createdUser
        );


        // =================================================
        // STEP 4 — SIGN OUT
        // =================================================

        await signOut(auth);


        // =================================================
        // SUCCESS
        // =================================================

        setLoading(false);


        showStatus(
          "Registration সফল হয়েছে!\n\n" +
          "আপনার Gmail Inbox অথবা Spam Folder খুলে " +
          "AYNA BOOK-এর Verification Link-এ ক্লিক করুন।\n\n" +
          "Email Verify করার পরে Login করুন।",
          "success"
        );


        form.reset();


      } catch (error) {

        console.error(
          "AYNA BOOK — Registration Error:",
          error
        );


        setLoading(false);


        // =================================================
        // ERROR MESSAGE
        // =================================================

        let message =
          "Registration সম্পন্ন হয়নি।";


        switch (error?.code) {

          case "auth/email-already-in-use":

            message =
              "এই Gmail দিয়ে ইতিমধ্যে একটি Firebase Account আছে। Login করুন অথবা Password Reset করুন।";

            break;


          case "auth/invalid-email":

            message =
              "Gmail Address সঠিক নয়।";

            break;


          case "auth/weak-password":

            message =
              "Password কমপক্ষে 11 অক্ষরের হতে হবে।";

            break;


          case "auth/operation-not-allowed":

            message =
              "Firebase Console-এ Email/Password Authentication Enabled আছে কি না পরীক্ষা করুন।";

            break;


          case "auth/network-request-failed":

            message =
              "Internet Connection পরীক্ষা করুন এবং আবার চেষ্টা করুন।";

            break;


          case "auth/too-many-requests":

            message =
              "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।";

            break;


          case "auth/quota-exceeded":

            message =
              "Firebase quota সীমা অতিক্রম হয়েছে। পরে আবার চেষ্টা করুন।";

            break;


          default:

            message =
              `Registration Error:\n${error?.message || "Unknown Error"}`;

        }


        // =================================================
        // CLEANUP
        // =================================================

        if (createdUser) {

          try {

            await signOut(auth);

          } catch (signOutError) {

            console.warn(
              "Sign out failed:",
              signOutError
            );

          }

        }


        showStatus(
          message,
          "error"
        );

      }

    }
  );

}


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — signup.js loaded successfully."
);

console.log(
  "AYNA BOOK — Registration Test Mode active."
);