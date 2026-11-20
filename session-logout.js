
/* ========================================================
   AYNA BOOK
   Secure Logout Controller
   Step 26
   Firebase SDK: 13.4.0
======================================================== */

import {
  logoutSecurely,
  getSessionStatus
} from "./session-security.js";


// ========================================================
// LOGOUT BUTTON
// ========================================================

const logoutButton =
  document.getElementById("logoutButton");


// ========================================================
// LOGOUT STATUS
// ========================================================

const logoutStatus =
  document.getElementById("logoutStatus");


// ========================================================
// DISPLAY MESSAGE
// ========================================================

function showMessage(message) {

  if (logoutStatus) {

    logoutStatus.textContent = message;

  }

}


// ========================================================
// LOGOUT ACTION
// ========================================================

async function handleLogout() {

  const session = getSessionStatus();

  if (!session.authenticated) {

    showMessage(
      "আপনি ইতোমধ্যে Logout অবস্থায় আছেন।"
    );

    window.location.replace(
      "./login.html"
    );

    return;

  }

  const confirmation = window.confirm(
    "আপনি কি AYNA BOOK থেকে Logout করতে চান?"
  );

  if (!confirmation) {

    return;

  }

  if (logoutButton) {

    logoutButton.disabled = true;

    logoutButton.textContent =
      "Logging out...";

  }

  showMessage(
    "নিরাপদভাবে Logout হচ্ছে..."
  );

  try {

    await logoutSecurely();

  } catch (error) {

    console.error(
      "AYNA BOOK Secure Logout Error:",
      error
    );

    showMessage(
      "Logout করা যায়নি। আবার চেষ্টা করুন।"
    );

    if (logoutButton) {

      logoutButton.disabled = false;

      logoutButton.textContent =
        "Logout";

    }

  }

}


// ========================================================
// BUTTON EVENT
// ========================================================

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    handleLogout
  );

}


// ========================================================
// INITIAL STATUS
// ========================================================

showMessage(
  "AYNA BOOK Secure Logout Ready."
);

console.log(
  "AYNA BOOK — Secure Logout Controller Loaded."
);
