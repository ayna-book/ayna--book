// =========================================================
// AYNA BOOK
// Secure Payment Verification Backend
// File: functions/index.js
//
// IMPORTANT:
// This file runs on Firebase server-side infrastructure.
// DO NOT put Firebase Admin credentials in frontend files.
// =========================================================

const {
  onCall,
  HttpsError
} = require("firebase-functions/v2/https");

const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

const {
  getAuth
} = require("firebase-admin/auth");

const {
  initializeApp
} = require("firebase-admin/app");


// =========================================================
// FIREBASE ADMIN INITIALIZATION
// =========================================================

initializeApp();


const db =
  getFirestore();

const adminAuth =
  getAuth();


// =========================================================
// ALLOWED ACCOUNT TYPES
// =========================================================

const PAID_ACCOUNT_TYPES = [
  "business",
  "vip",
  "vvip"
];


// =========================================================
// CHECK ADMIN
// =========================================================

function requireAdmin(
  request
) {

  if (!request.auth) {

    throw new HttpsError(
      "unauthenticated",
      "Admin login required."
    );

  }


  if (
    request.auth.token.admin !== true
  ) {

    throw new HttpsError(
      "permission-denied",
      "Admin permission required."
    );

  }

}


// =========================================================
// APPROVE PAYMENT
// =========================================================

exports.approvePayment =
  onCall(
    async (request) => {

      requireAdmin(
        request
      );


      const data =
        request.data || {};


      const userId =
        String(
          data.userId || ""
        ).trim();


      const paymentId =
        String(
          data.paymentId || ""
        ).trim();


      if (!userId) {

        throw new HttpsError(
          "invalid-argument",
          "User ID is required."
        );

      }


      if (!paymentId) {

        throw new HttpsError(
          "invalid-argument",
          "Payment ID is required."
        );

      }


      // ---------------------------------------------------
      // PAYMENT DOCUMENT
      // ---------------------------------------------------

      const paymentRef =
        db
          .collection("users")
          .doc(userId)
          .collection("paymentRequests")
          .doc(paymentId);


      const paymentSnap =
        await paymentRef.get();


      if (
        !paymentSnap.exists
      ) {

        throw new HttpsError(
          "not-found",
          "Payment request not found."
        );

      }


      const payment =
        paymentSnap.data();


      // ---------------------------------------------------
      // SECURITY CHECK
      // ---------------------------------------------------

      if (
        payment.uid !== userId
      ) {

        throw new HttpsError(
          "permission-denied",
          "Payment ownership mismatch."
        );

      }


      if (
        !PAID_ACCOUNT_TYPES.includes(
          payment.accountType
        )
      ) {

        throw new HttpsError(
          "invalid-argument",
          "This account type does not require paid verification."
        );

      }


      if (
        payment.status ===
          "approved" ||
        payment.status ===
          "verified"
      ) {

        return {

          success: true,

          message:
            "Payment is already approved."

        };

      }


      if (
        payment.status ===
        "rejected"
      ) {

        throw new HttpsError(
          "failed-precondition",
          "A rejected payment cannot be approved directly."
        );

      }


      // ---------------------------------------------------
      // USER DOCUMENT
      // ---------------------------------------------------

      const userRef =
        db
          .collection("users")
          .doc(userId);


      const userSnap =
        await userRef.get();


      if (
        !userSnap.exists
      ) {

        throw new HttpsError(
          "not-found",
          "User account not found."
        );

      }


      const userData =
        userSnap.data();


      // ---------------------------------------------------
      // APPROVE PAYMENT
      // ---------------------------------------------------

      await db.runTransaction(
        async transaction => {

          transaction.update(
            paymentRef,
            {

              status:
                "approved",

              accountStatus:
                "active",

              verifiedBy:
                request.auth.uid,

              verifiedAt:
                FieldValue.serverTimestamp(),

              updatedAt:
                FieldValue.serverTimestamp()

            }
          );


          transaction.update(
            userRef,
            {

              paymentStatus:
                "approved",

              accountStatus:
                "active",

              accountActivatedAt:
                FieldValue.serverTimestamp(),

              accountActivatedBy:
                request.auth.uid,

              updatedAt:
                FieldValue.serverTimestamp()

            }
          );

        }
      );


      // ---------------------------------------------------
      // OPTIONAL AUTH CUSTOM CLAIM
      //
      // This adds the paid account type to the user's
      // Authentication token.
      // ---------------------------------------------------

      try {

        await adminAuth.setCustomUserClaims(
          userId,
          {

            accountType:
              payment.accountType,

            paymentVerified:
              true

          }
        );

      } catch (claimError) {

        console.error(
          "AYNA BOOK — Custom Claim Error:",
          claimError
        );

        // Payment is already approved in Firestore.
        // Do not undo the transaction here.

      }


      return {

        success: true,

        message:
          "Payment approved and account activated.",

        userId,

        paymentId,

        accountType:
          payment.accountType

      };

    }
  );


// =========================================================
// REJECT PAYMENT
// =========================================================

exports.rejectPayment =
  onCall(
    async (request) => {

      requireAdmin(
        request
      );


      const data =
        request.data || {};


      const userId =
        String(
          data.userId || ""
        ).trim();


      const paymentId =
        String(
          data.paymentId || ""
        ).trim();


      const reason =
        String(
          data.reason || ""
        ).trim();


      if (!userId) {

        throw new HttpsError(
          "invalid-argument",
          "User ID is required."
        );

      }


      if (!paymentId) {

        throw new HttpsError(
          "invalid-argument",
          "Payment ID is required."
        );

      }


      if (
        reason.length > 500
      ) {

        throw new HttpsError(
          "invalid-argument",
          "Rejection reason is too long."
        );

      }


      const paymentRef =
        db
          .collection("users")
          .doc(userId)
          .collection("paymentRequests")
          .doc(paymentId);


      const paymentSnap =
        await paymentRef.get();


      if (
        !paymentSnap.exists
      ) {

        throw new HttpsError(
          "not-found",
          "Payment request not found."
        );

      }


      const payment =
        paymentSnap.data();


      if (
        payment.uid !== userId
      ) {

        throw new HttpsError(
          "permission-denied",
          "Payment ownership mismatch."
        );

      }


      if (
        payment.status ===
          "approved" ||
        payment.status ===
          "verified"
      ) {

        throw new HttpsError(
          "failed-precondition",
          "An approved payment cannot be rejected."
        );

      }


      const userRef =
        db
          .collection("users")
          .doc(userId);


      // ---------------------------------------------------
      // REJECT
      // ---------------------------------------------------

      await db.runTransaction(
        async transaction => {

          transaction.update(
            paymentRef,
            {

              status:
                "rejected",

              accountStatus:
                "pending_payment",

              rejectionReason:
                reason,

              rejectedBy:
                request.auth.uid,

              rejectedAt:
                FieldValue.serverTimestamp(),

              updatedAt:
                FieldValue.serverTimestamp()

            }
          );


          transaction.update(
            userRef,
            {

              paymentStatus:
                "rejected",

              accountStatus:
                "pending_payment",

              updatedAt:
                FieldValue.serverTimestamp()

            }
          );

        }
      );


      return {

        success: true,

        message:
          "Payment rejected.",

        userId,

        paymentId

      };

    }
  );


// =========================================================
// HEALTH CHECK
// =========================================================

exports.paymentSystemHealth =
  onCall(
    async (request) => {

      requireAdmin(
        request
      );


      return {

        success: true,

        system:
          "AYNA BOOK Payment Verification",

        status:
          "online",

        timestamp:
          new Date().toISOString()

      };

    }
  );