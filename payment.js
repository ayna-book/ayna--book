// =========================================================
// AYNA BOOK
// Payment Request Controller
// File: payment.js
// Version: 1.0
// =========================================================

import {
  auth,
  db,
  storage
} from "./firebase.js";

import {
  onAuthStateChanged
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
  getSelectedAccount
} from "./account-types.js";


// =========================================================
// CONFIGURATION
// =========================================================

const MAX_PROOF_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// DOM ELEMENTS
// =========================================================

const form =
  document.getElementById("paymentForm");

const submitButton =
  document.getElementById(
    "submitPaymentBtn"
  );

const message =
  document.getElementById("message");

const paymentMethod =
  document.getElementById(
    "paymentMethod"
  );

const transactionId =
  document.getElementById(
    "transactionId"
  );

const paymentAmount =
  document.getElementById(
    "paymentAmount"
  );

const paymentProof =
  document.getElementById(
    "paymentProof"
  );

const accountName =
  document.getElementById(
    "accountName"
  );

const accountPrice =
  document.getElementById(
    "accountPrice"
  );


// =========================================================
// BASIC PAGE CHECK
// =========================================================

if (
  !form ||
  !submitButton ||
  !message ||
  !paymentMethod ||
  !transactionId ||
  !paymentAmount ||
  !paymentProof
) {

  console.error(
    "AYNA BOOK — Payment page elements missing."
  );

  throw new Error(
    "AYNA BOOK Payment page elements missing."
  );
}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
  text,
  type = "info"
) {

  message.textContent =
    text || "";

  message.className =
    "message show " +
    type;
}


// =========================================================
// ACCOUNT FROM URL / SESSION
// =========================================================

const urlParams =
  new URLSearchParams(
    window.location.search
  );

const accountFromURL =
  urlParams.get("account");

const selectedAccount =
  getAccountType(accountFromURL) ||
  getSelectedAccount();


if (!selectedAccount) {

  if (accountName) {

    accountName.textContent =
      "Account পাওয়া যায়নি";

  }

  if (accountPrice) {

    accountPrice.textContent =
      "Registration থেকে আবার শুরু করুন।";

  }

} else {

  if (accountName) {

    accountName.textContent =
      selectedAccount.name +
      " — " +
      selectedAccount.nameBn;

  }

  if (accountPrice) {

    accountPrice.textContent =
      "$" +
      selectedAccount.priceUSD;

  }

}


// =========================================================
// CURRENT USER
// =========================================================

let currentUser = null;


onAuthStateChanged(
  auth,
  user => {

    currentUser = user || null;

    if (!currentUser) {

      showMessage(
        "Payment submit করার আগে Login/Registration session প্রয়োজন।",
        "error"
      );

      submitButton.disabled =
        true;

      return;

    }

    if (selectedAccount) {

      submitButton.disabled =
        false;

    }

  }
);


// =========================================================
// PAYMENT METHOD VALIDATION
// =========================================================

function isValidPaymentMethod(
  method
) {

  return [
    "bkash",
    "nagad",
    "rocket",
    "upay",
    "paypal",
    "payoneer"
  ].includes(method);

}


// =========================================================
// TRANSACTION ID VALIDATION
// =========================================================

function isValidTransactionId(
  value
) {

  if (!value) {
    return false;
  }

  if (value.length < 3) {
    return false;
  }

  if (value.length > 100) {
    return false;
  }

  return true;

}


// =========================================================
// AMOUNT VALIDATION
// =========================================================

function isValidAmount(
  value
) {

  if (!value) {
    return false;
  }

  if (value.length > 50) {
    return false;
  }

  return true;

}


// =========================================================
// PAYMENT PROOF VALIDATION
// =========================================================

function validateProof(
  file
) {

  if (!file) {

    return {
      valid: true,
      message: ""
    };

  }


  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {

    return {
      valid: false,
      message:
        "Payment Proof অবশ্যই JPG, PNG অথবা WebP image হতে হবে।"
    };

  }


  if (
    file.size >
    MAX_PROOF_SIZE
  ) {

    return {
      valid: false,
      message:
        "Payment Proof সর্বোচ্চ 5 MB হতে পারবে।"
    };

  }


  return {
    valid: true,
    message: ""
  };

}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getPaymentErrorMessage(
  error
) {

  const code =
    error?.code || "";

  switch (code) {

    case "permission-denied":

      return (
        "Firebase Security Rules অনুযায়ী Payment Request জমা দেওয়া যায়নি।"
      );


    case "storage/unauthorized":

      return (
        "Payment Proof upload করার অনুমতি নেই। Storage Rules পরীক্ষা করুন।"
      );


    case "storage/canceled":

      return (
        "Payment Proof upload বাতিল হয়েছে।"
      );


    case "storage/quota-exceeded":

      return (
        "Storage quota সমস্যা হয়েছে।"
      );


    case "storage/unknown":

      return (
        "Payment Proof upload-এর সময় অজানা সমস্যা হয়েছে।"
      );


    case "storage/retry-limit-exceeded":

      return (
        "Upload বারবার ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।"
      );


    case "unavailable":

      return (
        "Firebase service বর্তমানে পাওয়া যাচ্ছে না।"
      );


    default:

      console.error(
        "AYNA BOOK — Payment Firebase Error:",
        error
      );

      return (
        error?.message ||
        "Payment Request জমা দেওয়া যায়নি।"
      );

  }

}


// =========================================================
// UPLOAD PAYMENT PROOF
// =========================================================

async function uploadPaymentProof(
  user,
  file,
  requestId
) {

  if (!file) {

    return "";

  }


  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";


  const proofPath =
    `users/${user.uid}/payment-proofs/${requestId}.${extension}`;


  const proofRef =
    ref(
      storage,
      proofPath
    );


  await uploadBytes(
    proofRef,
    file,
    {
      contentType:
        file.type
    }
  );


  const downloadURL =
    await getDownloadURL(
      proofRef
    );


  return downloadURL;

}


// =========================================================
// CREATE PAYMENT REQUEST
// =========================================================

async function createPaymentRequest({

  user,
  account,
  method,
  transaction,
  amount,
  proofURL

}) {

  /*
   * Payment Request একটি user-owned
   * subcollection-এ রাখা হচ্ছে।
   *
   * Request ID হিসেবে timestamp + random
   * ব্যবহার করা হয়েছে।
   */

  const requestId =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;


  const paymentRef =
    doc(
      db,
      "users",
      user.uid,
      "paymentRequests",
      requestId
    );


  await setDoc(
    paymentRef,
    {

      requestId,

      uid:
        user.uid,

      email:
        user.email || "",

      accountType:
        account.id,

      accountName:
        account.name,

      accountNameBn:
        account.nameBn,

      priceUSD:
        account.priceUSD,

      paymentRequired:
        true,

      paymentMethod:
        method,

      transactionId:
        transaction,

      amount:
        amount,

      proofURL:
        proofURL || "",

      status:
        "pending",

      accountStatus:
        "pending_payment",

      submittedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }
  );


  return {
    success: true,
    requestId
  };

}


// =========================================================
// FORM SUBMISSION
// =========================================================

form.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    // -----------------------------------------
    // USER CHECK
    // -----------------------------------------

    if (!currentUser) {

      showMessage(
        "আপনার Registration/Login session পাওয়া যায়নি।",
        "error"
      );

      return;

    }


    // -----------------------------------------
    // ACCOUNT CHECK
    // -----------------------------------------

    if (!selectedAccount) {

      showMessage(
        "Paid Account Type পাওয়া যায়নি। Registration থেকে আবার শুরু করুন।",
        "error"
      );

      return;

    }


    // -----------------------------------------
    // PAID ACCOUNT CHECK
    // -----------------------------------------

    if (
      !selectedAccount.paymentRequired
    ) {

      showMessage(
        "Personal Account-এর জন্য Payment প্রয়োজন নেই।",
        "error"
      );

      return;

    }


    // -----------------------------------------
    // FORM VALUES
    // -----------------------------------------

    const method =
      paymentMethod.value.trim();


    const transaction =
      transactionId.value.trim();


    const amount =
      paymentAmount.value.trim();


    const proof =
      paymentProof.files?.[0] ||
      null;


    // -----------------------------------------
    // METHOD
    // -----------------------------------------

    if (
      !isValidPaymentMethod(
        method
      )
    ) {

      showMessage(
        "সঠিক Payment Method নির্বাচন করুন।",
        "error"
      );

      paymentMethod.focus();

      return;

    }


    // -----------------------------------------
    // TRANSACTION
    // -----------------------------------------

    if (
      !isValidTransactionId(
        transaction
      )
    ) {

      showMessage(
        "সঠিক Transaction / Reference ID দিন।",
        "error"
      );

      transactionId.focus();

      return;

    }


    // -----------------------------------------
    // AMOUNT
    // -----------------------------------------

    if (
      !isValidAmount(
        amount
      )
    ) {

      showMessage(
        "Payment Amount দিন।",
        "error"
      );

      paymentAmount.focus();

      return;

    }


    // -----------------------------------------
    // PROOF
    // -----------------------------------------

    const proofCheck =
      validateProof(
        proof
      );


    if (
      !proofCheck.valid
    ) {

      showMessage(
        proofCheck.message,
        "error"
      );

      return;

    }


    // -----------------------------------------
    // START
    // -----------------------------------------

    submitButton.disabled =
      true;

    submitButton.textContent =
      "SUBMITTING...";


    showMessage(
      "Payment Request প্রস্তুত করা হচ্ছে...",
      "info"
    );


    try {

      /*
       * প্রথমে একটি Request ID তৈরি করছি।
       * Proof path-এ একই ID ব্যবহার হবে।
       */

      const requestId =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 10)}`;


      // ---------------------------------------
      // PAYMENT PROOF UPLOAD
      // ---------------------------------------

      let proofURL = "";


      if (proof) {

        showMessage(
          "Payment Proof upload হচ্ছে...",
          "info"
        );


        const extension =
          proof.type === "image/png"
            ? "png"
            : proof.type === "image/webp"
              ? "webp"
              : "jpg";


        const proofPath =
          `users/${currentUser.uid}/payment-proofs/${requestId}.${extension}`;


        const proofRef =
          ref(
            storage,
            proofPath
          );


        await uploadBytes(
          proofRef,
          proof,
          {
            contentType:
              proof.type
          }
        );


        proofURL =
          await getDownloadURL(
            proofRef
          );

      }


      // ---------------------------------------
      // FIRESTORE PAYMENT REQUEST
      // ---------------------------------------

      showMessage(
        "Payment Request Firebase-এ জমা হচ্ছে...",
        "info"
      );


      const paymentRef =
        doc(
          db,
          "users",
          currentUser.uid,
          "paymentRequests",
          requestId
        );


      await setDoc(
        paymentRef,
        {

          requestId,

          uid:
            currentUser.uid,

          email:
            currentUser.email || "",

          accountType:
            selectedAccount.id,

          accountName:
            selectedAccount.name,

          accountNameBn:
            selectedAccount.nameBn,

          priceUSD:
            selectedAccount.priceUSD,

          paymentRequired:
            true,

          paymentMethod:
            method,

          transactionId:
            transaction,

          amount:
            amount,

          proofURL:
            proofURL,

          status:
            "pending",

          accountStatus:
            "pending_payment",

          submittedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      showMessage(
        "Payment Request সফলভাবে জমা হয়েছে। Account এখন Pending Verification অবস্থায় আছে।",
        "success"
      );


      submitButton.textContent =
        "PAYMENT SUBMITTED ✓";


      submitButton.disabled =
        true;


      // ---------------------------------------
      // SAVE LOCAL STATUS
      // ---------------------------------------

      try {

        sessionStorage.setItem(
          "AYNA_BOOK_PAYMENT_STATUS",
          "pending"
        );

        sessionStorage.setItem(
          "AYNA_BOOK_PAYMENT_REQUEST_ID",
          requestId
        );

      } catch (storageError) {

        console.warn(
          "AYNA BOOK — Session storage unavailable.",
          storageError
        );

      }


      // ---------------------------------------
      // REDIRECT
      // ---------------------------------------

      setTimeout(
        () => {

          window.location.replace(
            "./payment-pending.html"
          );

        },
        1800
      );


    } catch (error) {

      console.error(
        "AYNA BOOK — Payment Submission Error:",
        error
      );


      showMessage(
        getPaymentErrorMessage(
          error
        ),
        "error"
      );


      submitButton.disabled =
        false;


      submitButton.textContent =
        "SUBMIT PAYMENT FOR VERIFICATION";

    }

  }
);


// =========================================================
// INITIAL STATUS
// =========================================================

if (
  selectedAccount &&
  selectedAccount.paymentRequired
) {

  showMessage(
    "Payment তথ্য দিয়ে Submit করুন। Verification-এর আগে Account Active হবে না।",
    "info"
  );

}


// =========================================================
// DEBUG
// =========================================================

console.log(
  "AYNA BOOK — Payment controller loaded successfully."
);