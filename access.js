import { auth } from "./app.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-functions.js";

const functions = getFunctions(
  auth.app,
  "asia-southeast1"
);

const redeemCode = httpsCallable(
  functions,
  "redeemAccessCode"
);

const button = document.getElementById("redeemButton");
const tierInput = document.getElementById("tier");
const codeInput = document.getElementById("accessCode");
const message = document.getElementById("message");

let loggedIn = false;

onAuthStateChanged(auth, (user) => {
  loggedIn = !!user;
  message.textContent = user
    ? "আপনার Access Code দিন।"
    : "প্রথমে লগইন করুন।";
});

button.addEventListener("click", async () => {
  if (!loggedIn) {
    message.textContent = "প্রথমে লগইন করুন।";
    return;
  }

  const tier = tierInput.value;
  const code = codeInput.value.trim().toUpperCase();

  if (!/^[A-F0-9]{18}$/.test(code)) {
    message.textContent = "সঠিক ১৮ অক্ষরের Access Code দিন।";
    return;
  }

  button.disabled = true;
  message.textContent = "যাচাই হচ্ছে...";

  try {
    const result = await redeemCode({ tier, code });

    if (result.data.success) {
      message.textContent =
        tier.toUpperCase() + " ACCESS সফলভাবে চালু হয়েছে।";
      codeInput.value = "";
    }
  } catch (error) {
    console.error(error);
    message.textContent =
      error.message || "Access Code যাচাই করা যায়নি।";
  } finally {
    button.disabled = false;
  }
});