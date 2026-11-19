/* =========================================================
   AYNA BOOK
   Global Application Controller
   ========================================================= */

import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


/* =========================================================
   GLOBAL USER STATE
   ========================================================= */

let currentUser = null;


/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */

onAuthStateChanged(auth, (user) => {

  currentUser = user || null;

  /* Global access */
  window.AYNA_BOOK_USER = currentUser;

  /* Event dispatch */
  window.dispatchEvent(
    new CustomEvent("ayna-auth-state-changed", {
      detail: {
        user: currentUser
      }
    })
  );

  if (currentUser) {

    console.log(
      "AYNA BOOK — User signed in:",
      currentUser.email || currentUser.uid
    );

  } else {

    console.log(
      "AYNA BOOK — No authenticated user."
    );
  }

});


/* =========================================================
   GET CURRENT USER
   ========================================================= */

export function getCurrentUser() {
  return currentUser;
}


/* =========================================================
   LOGOUT
   ========================================================= */

export async function logout() {

  try {

    await signOut(auth);

    currentUser = null;
    window.AYNA_BOOK_USER = null;

    window.location.replace("./login.html");

  } catch (error) {

    console.error(
      "AYNA BOOK logout error:",
      error
    );

    alert(
      "Logout করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
    );
  }
}


/* =========================================================
   GLOBAL LOGOUT FUNCTION
   ========================================================= */

window.AYNA_BOOK_LOGOUT = logout;


/* =========================================================
   GLOBAL AYNA BOOK OBJECT
   ========================================================= */

window.AYNA_BOOK = {

  getUser: getCurrentUser,

  logout: logout,

  isLoggedIn: () => {
    return currentUser !== null;
  }

};


/* =========================================================
   PROTECT DASHBOARD
   ========================================================= */

if (
  window.location.pathname.endsWith("/dashboard.html")
) {

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      window.location.replace("./login.html");

    }

  });

}


/* =========================================================
   PROTECT PROFILE
   ========================================================= */

if (
  window.location.pathname.endsWith("/profile.html")
) {

  onAuthStateChanged(auth, (user) => {

    if (!user) {

      window.location.replace("./login.html");

    }

  });

}


/* =========================================================
   AYNA BOOK APP READY
   ========================================================= */

console.log(
  "AYNA BOOK — Application controller loaded successfully."
);