// =========================================================
// AYNA BOOK
// Payment Status Controller
// File: payment-status.js
// Version: 1.0
// =========================================================

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


// =========================================================
// DOM
// =========================================================

const accountTypeElement =
  document.getElementById(
    "accountType"
  );

const paymentMethodElement =
  document.getElementById(
    "paymentMethod"
  );

const paymentAmountElement =
  document.getElementById(
    "paymentAmount"
  );

const requestIdElement =
  document.getElementById(
    "requestId"
  );


// =========================================================
// SESSION DATA
// =========================================================

const requestId =
  sessionStorage.getItem(
    "AYNA_BOOK_PAYMENT_REQUEST_ID"
  );


// =========================================================
// STATUS BOX
// =========================================================

const statusElement =
  document.querySelector(
    ".status"
  );


// =========================================================
// MESSAGE HELPER
// =========================================================

function setStatus(
  text
) {

  if (statusElement) {

    statusElement.textContent =
      text;

  }

}


// =========================================================
// ACCOUNT STATUS TEXT
// =========================================================

function getStatusText(
  status
) {

  switch (status) {

    case "pending":
    case "pending_payment":

      return "PENDING VERIFICATION";


    case "approved":
    case "verified":

      return "PAYMENT VERIFIED";


    case "rejected":

      return "PAYMENT REJECTED";


    case "cancelled":

      return "PAYMENT CANCELLED";


    default:

      return "PENDING VERIFICATION";

  }

}


// =========================================================
// PAYMENT METHOD TEXT
// =========================================================

function getPaymentMethodText(
  method
) {

  const methods = {

    bkash: "bKash",

    nagad: "Nagad",

    rocket: "Rocket",

    upay: "Upay",

    paypal: "PayPal",

    payoneer: "Payoneer"

  };

  return (
    methods[method] ||
    method ||
    "—"
  );

}


// =========================================================
// LOAD PAYMENT REQUEST
// =========================================================

function watchPaymentRequest(
  user
) {

  if (!requestId) {

    setStatus(
      "PAYMENT REQUEST NOT FOUND"
    );

    if (requestIdElement) {

      requestIdElement.textContent =
        "Request ID পাওয়া যায়নি";

    }

    return;

  }


  const paymentRef =
    doc(
      db,
      "users",
      user.uid,
      "paymentRequests",
      requestId
    );


  /*
   * onSnapshot ব্যবহার করা হয়েছে।
   *
   * ফলে Payment Request-এর status
   * Firebase-এ পরিবর্তন হলে page
   * refresh ছাড়াই update হতে পারবে।
   */

  onSnapshot(
    paymentRef,

    snapshot => {

      if (!snapshot.exists()) {

        setStatus(
          "PAYMENT REQUEST NOT FOUND"
        );

        return;

      }


      const data =
        snapshot.data();


      // -------------------------------------
      // STATUS
      // -------------------------------------

      const status =
        data.status ||
        "pending";


      setStatus(
        getStatusText(
          status
        )
      );


      // -------------------------------------
      // ACCOUNT
      // -------------------------------------

      if (
        accountTypeElement &&
        data.accountName
      ) {

        accountTypeElement.textContent =
          data.accountName +
          (
            data.accountNameBn
              ? " — " +
                data.accountNameBn
              : ""
          );

      }


      // -------------------------------------
      // PAYMENT METHOD
      // -------------------------------------

      if (
        paymentMethodElement
      ) {

        paymentMethodElement.textContent =
          getPaymentMethodText(
            data.paymentMethod
          );

      }


      // -------------------------------------
      // AMOUNT
      // -------------------------------------

      if (
        paymentAmountElement &&
        data.amount
      ) {

        paymentAmountElement.textContent =
          data.amount;

      }


      // -------------------------------------
      // REQUEST ID
      // -------------------------------------

      if (
        requestIdElement
      ) {

        requestIdElement.textContent =
          data.requestId ||
          requestId;

      }


      // -------------------------------------
      // SAVE CURRENT STATUS
      // -------------------------------------

      try {

        sessionStorage.setItem(
          "AYNA_BOOK_PAYMENT_STATUS",
          status
        );

      } catch (error) {

        console.warn(
          "AYNA BOOK — Could not save payment status.",
          error
        );

      }


      // -------------------------------------
      // APPROVED
      // -------------------------------------

      if (
        status === "approved" ||
        status === "verified"
      ) {

        console.log(
          "AYNA BOOK — Payment verified."
        );

      }


      // -------------------------------------
      // REJECTED
      // -------------------------------------

      if (
        status === "rejected"
      ) {

        console.log(
          "AYNA BOOK — Payment rejected."
        );

      }

    },

    error => {

      console.error(
        "AYNA BOOK — Payment Status Error:",
        error
      );


      setStatus(
        "STATUS CHECK FAILED"
      );

    }
  );

}


// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(
  auth,

  user => {

    if (!user) {

      setStatus(
        "LOGIN REQUIRED"
      );

      return;

    }


    watchPaymentRequest(
      user
    );

  }
);


// =========================================================
// DEBUG
// =========================================================

console.log(
  "AYNA BOOK — Payment Status controller loaded successfully."
);