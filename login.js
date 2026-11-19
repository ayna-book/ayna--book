// =========================================================
// AYNA BOOK
// Login JavaScript
// Firebase SDK: 13.4.0
// =========================================================

import { auth } from "./firebase-init.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


const loginForm =
  document.getElementById("loginForm");


if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const emailInput =
        document.getElementById("loginEmail");

      const passwordInput =
        document.getElementById("loginPassword");


      if (!emailInput || !passwordInput) {

        console.error(
          "AYNA BOOK: Login input পাওয়া যায়নি।"
        );

        return;
      }


      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      if (!email || !password) {

        alert(
          "ইমেইল এবং পাসওয়ার্ড লিখুন।"
        );

        return;
      }


      try {

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );


        console.log(
          "AYNA BOOK Login successful:",
          userCredential.user.uid
        );


        alert(
          "সফলভাবে লগইন হয়েছে!"
        );


        window.location.href =
          "index.html";


      } catch (error) {

        console.error(
          "AYNA BOOK Login Error:",
          error
        );


        alert(
          "লগইন ব্যর্থ হয়েছে: " +
          error.message
        );
      }

    }
  );

}