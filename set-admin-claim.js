// =========================================================
// AYNA BOOK
// Firebase Admin — Set Admin Custom Claim
// File: set-admin-claim.js
//
// IMPORTANT:
// NEVER upload this file with service-account credentials
// to GitHub Pages or any public repository.
//
// This script is intended to run in a secure/local
// Node.js environment.
// =========================================================


const admin = require("firebase-admin");


// =========================================================
// FIREBASE ADMIN INITIALIZATION
// =========================================================
//
// OPTION A:
// Download the Firebase Service Account JSON from:
//
// Firebase Console
// → Project Settings
// → Service Accounts
// → Generate new private key
//
// Then keep the JSON file OUTSIDE the GitHub repository.
//
// Example:
//
// ./private/firebase-service-account.json
//
// NEVER put that JSON file on GitHub.
// =========================================================


const serviceAccount =
  require("./private/firebase-service-account.json");


admin.initializeApp({

  credential:
    admin.credential.cert(
      serviceAccount
    )

});


// =========================================================
// ADMIN USER
// =========================================================
//
// এখানে যে Gmail account-কে AYNA BOOK Admin
// বানাতে চান, সেই Gmail লিখুন।
//
// উদাহরণ:
// const ADMIN_EMAIL = "your-admin@gmail.com";
//
// নিজের প্রকৃত Admin Gmail বসাবেন।
// =========================================================

const ADMIN_EMAIL =
  "YOUR_ADMIN_GMAIL@gmail.com";


// =========================================================
// SET ADMIN CLAIM
// =========================================================

async function setAdminClaim() {

  try {

    if (
      !ADMIN_EMAIL ||
      ADMIN_EMAIL ===
        "YOUR_ADMIN_GMAIL@gmail.com"
    ) {

      throw new Error(
        "ADMIN_EMAIL-এ আপনার প্রকৃত Admin Gmail বসান।"
      );

    }


    const user =
      await admin
        .auth()
        .getUserByEmail(
          ADMIN_EMAIL
        );


    console.log(
      "User found:"
    );

    console.log(
      "UID:",
      user.uid
    );

    console.log(
      "Email:",
      user.email
    );


    // -----------------------------------------------------
    // ADMIN CUSTOM CLAIM
    // -----------------------------------------------------

    await admin
      .auth()
      .setCustomUserClaims(
        user.uid,
        {
          admin: true
        }
      );


    console.log(
      "----------------------------------------"
    );

    console.log(
      "AYNA BOOK ADMIN CLAIM SUCCESS"
    );

    console.log(
      "admin: true"
    );

    console.log(
      "Admin:",
      user.email
    );

    console.log(
      "----------------------------------------"
    );


    console.log(
      "\nIMPORTANT:"
    );

    console.log(
      "Admin account থেকে Logout করে আবার Login করুন।"
    );

    console.log(
      "এরপর admin-payment.html খুলুন।"
    );


  } catch (error) {

    console.error(
      "AYNA BOOK — Admin Claim Error:"
    );

    console.error(
      error
    );

    process.exitCode = 1;

  }

}


// =========================================================
// RUN
// =========================================================

setAdminClaim();