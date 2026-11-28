
/* =========================================================
   AYNA BOOK
   AUTHENTICATION GUARD
   File: auth-guard.js
   Firebase SDK: 13.4.0

   REQUIREMENTS:
   - Firebase login required
   - Gmail verification required
   - Persistent login session
   - Redirect unverified users
========================================================= */

import {
  auth,
  authReady
} from "./firebase-init.js";

import {
  onAuthStateChanged,
  reload
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const LOGIN_PAGE = "./login.html";
const VERIFY_PAGE = "./verify-email.html";

const PUBLIC_PAGES = [
  "login.html",
  "register.html",
  "signup.html",
  "verify-email.html",
  "forgot-password.html"
];


/* =========================================================
   CURRENT PAGE
========================================================= */

const currentPage = (
  window.location.pathname.split("/").pop() || "index.html"
).toLowerCase();


/* =========================================================
   REDIRECT CONTROL
========================================================= */

let redirecting = false;

function redirectTo(page) {

  if (redirecting) return;

  redirecting = true;

  window.location.replace(page);

}


/* =========================================================
   AUTH STATUS
========================================================= */

function setGuardStatus(status, user = null) {

  window.AYNA_AUTH_STATUS = {
    status,
    uid: user?.uid || null,
    emailVerified: user?.emailVerified || false,
    checkedAt: Date.now()
  };

  window.dispatchEvent(
    new CustomEvent("ayna-auth-status", {
      detail: window.AYNA_AUTH_STATUS
    })
  );

}


/* =========================================================
   AUTH GUARD
========================================================= */

async function startAuthGuard() {

  try {

    if (authReady) {
      await authReady;
    }

    if (!auth) {
      throw new Error("Firebase Authentication unavailable.");
    }

    onAuthStateChanged(auth, async user => {

      if (redirecting) return;

      /*
        Public pages:
        Login, Register, Forgot Password,
        Verify Email.
      */

      if (PUBLIC_PAGES.includes(currentPage)) {

        setGuardStatus(
          user ? "authenticated" : "guest",
          user
        );

        return;

      }


      /*
        No logged-in user:
        Go to login page.
      */

      if (!user) {

        setGuardStatus("guest");

        redirectTo(LOGIN_PAGE);

        return;

      }


      /*
        Refresh Firebase user information.
      */

      try {

        await reload(user);

      } catch (error) {

        console.error(
          "AYNA BOOK user reload error:",
          error
        );

        setGuardStatus("error");

        redirectTo(LOGIN_PAGE);

        return;

      }


      /*
        Gmail verification required.
      */

      if (!user.emailVerified) {

        setGuardStatus(
          "unverified",
          user
        );

        redirectTo(VERIFY_PAGE);

        return;

      }


      /*
        Verified user:
        Allow page to continue.
      */

      setGuardStatus(
        "verified",
        user
      );

    });

  } catch (error) {

    console.error(
      "AYNA BOOK Auth Guard Error:",
      error
    );

    setGuardStatus("error");

    /*
      Do not redirect public pages
      because users must still be able
      to reach registration and login.
    */

    if (!PUBLIC_PAGES.includes(currentPage)) {

      redirectTo(LOGIN_PAGE);

    }

  }

}


/* =========================================================
   GLOBAL AUTH API
========================================================= */

window.AYNA_AUTH_GUARD = {

  getStatus: () => {

    return window.AYNA_AUTH_STATUS || {
      status: "checking",
      uid: null,
      emailVerified: false
    };

  },

  isVerified: () => {

    return window.AYNA_AUTH_STATUS?.status === "verified";

  },

  isAuthenticated: () => {

    return Boolean(auth.currentUser);

  }

};


/* =========================================================
   START GUARD
========================================================= */

startAuthGuard();
