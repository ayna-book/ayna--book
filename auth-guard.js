
/* ========================================================
   AYNA BOOK
   Authentication Guard
   Step 27
   Firebase SDK: 13.4.0
======================================================== */

import { auth } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// ========================================================
// CONFIGURATION
// ========================================================

const LOGIN_PAGE = "./login.html";

const VERIFY_PAGE = "./verify-email.html";


// ========================================================
// AUTHENTICATION GUARD
// ========================================================

export function protectPage(options = {}) {

  const requireVerifiedEmail =
    options.requireVerifiedEmail !== false;

  let redirecting = false;

  return new Promise(function (resolve) {

    onAuthStateChanged(
      auth,
      async function (user) {

        if (redirecting) {
          return;
        }

        if (!user) {

          redirecting = true;

          window.location.replace(
            LOGIN_PAGE
          );

          return;
        }

        try {

          await user.reload();

          const refreshedUser = auth.currentUser;

          if (!refreshedUser) {

            redirecting = true;

            window.location.replace(
              LOGIN_PAGE
            );

            return;
          }

          if (
            requireVerifiedEmail &&
            !refreshedUser.emailVerified
          ) {

            redirecting = true;

            window.location.replace(
              VERIFY_PAGE
            );

            return;
          }

          resolve(refreshedUser);

        } catch (error) {

          console.error(
            "AYNA BOOK Authentication Guard Error:",
            error
          );

          resolve(null);

        }

      }
    );

  });

}


// ========================================================
// SYSTEM READY
// ========================================================

console.log(
  "AYNA BOOK — Authentication Guard Loaded."
);
