
/* =========================================================
   AYNA BOOK — COMPLETE REGISTER.JS
   Firebase Authentication + Realtime Database
   FREE VERSION — NO FIREBASE STORAGE
   Firebase SDK: 13.4.0
   ========================================================= */

import {
  auth,
  database
} from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref as dbRef,
  set
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// =========================================================
// 1. HTML ELEMENTS
// =========================================================

const form = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const countryInput = document.getElementById("country");
const phoneInput = document.getElementById("phone");

const photoInput = document.getElementById("photo");

const passwordInput = document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const termsInput = document.getElementById("terms");

const submitButton = document.getElementById("submitBtn");

const statusMessage = document.getElementById("statusMsg");


// =========================================================
// 2. MESSAGE
// =========================================================

function showMessage(message, type = "error") {

  if (!statusMessage) {
    alert(message);
    return;
  }

  statusMessage.textContent = message;
  statusMessage.style.display = "block";
  statusMessage.style.padding = "15px";
  statusMessage.style.marginTop = "18px";
  statusMessage.style.borderRadius = "10px";

  if (type === "success") {

    statusMessage.style.background = "#123d24";
    statusMessage.style.color = "#8df5a9";

  } else {

    statusMessage.style.background = "#351515";
    statusMessage.style.color = "#ff9999";

  }
}


// =========================================================
// 3. LOADING
// =========================================================

function setLoading(loading) {

  if (!submitButton) return;

  submitButton.disabled = loading;

  submitButton.textContent = loading
    ? "PLEASE WAIT..."
    : "CREATE ACCOUNT";

}


// =========================================================
// 4. PASSWORD SHOW / HIDE
// =========================================================

function togglePassword(buttonId, inputId) {

  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);

  if (!button || !input) return;

  button.addEventListener("click", () => {

    const visible = input.type === "password";

    input.type = visible ? "text" : "password";

    button.textContent = visible ? "🙈" : "👁️";

  });

}

togglePassword("togglePassword", "password");

togglePassword(
  "toggleConfirmPassword",
  "confirmPassword"
);


// =========================================================
// 5. IMAGE COMPRESSION
// =========================================================

async function compressPhoto(file) {

  return new Promise((resolve, reject) => {

    const image = new Image();

    const objectURL = URL.createObjectURL(file);

    image.onload = async () => {

      try {

        URL.revokeObjectURL(objectURL);

        let width = image.width;
        let height = image.height;

        const MAX_SIZE = 512;

        if (width > MAX_SIZE || height > MAX_SIZE) {

          const scale = Math.min(
            MAX_SIZE / width,
            MAX_SIZE / height
          );

          width = Math.round(width * scale);
          height = Math.round(height * scale);

        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Image compression is not supported.");
        }

        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, width, height);

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        let quality = 0.75;
        let blob = null;

        for (let i = 0; i < 6; i++) {

          blob = await new Promise(resolveBlob => {

            canvas.toBlob(
              resolveBlob,
              "image/jpeg",
              quality
            );

          });

          if (!blob) {
            throw new Error("Image compression failed.");
          }

          if (blob.size <= 200 * 1024) {
            break;
          }

          quality -= 0.08;

        }

        if (!blob || blob.size > 300 * 1024) {

          throw new Error(
            "Image is too large. Please select another photo."
          );

        }

        const reader = new FileReader();

        reader.onload = () => {
          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(new Error("Unable to read profile photo."));
        };

        reader.readAsDataURL(blob);

      } catch (error) {

        reject(error);

      }

    };

    image.onerror = () => {

      URL.revokeObjectURL(objectURL);

      reject(new Error("Invalid profile photo."));

    };

    image.src = objectURL;

  });

}


// =========================================================
// 6. FIREBASE ERROR
// =========================================================

function getFriendlyError(error) {

  switch (error.code) {

    case "auth/email-already-in-use":
      return "This email is already registered. Please login.";

    case "auth/invalid-email":
      return "Please enter a valid email.";

    case "auth/weak-password":
      return "Password must contain at least 6 characters.";

    case "auth/network-request-failed":
      return "Internet connection failed. Please try again.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    case "PERMISSION_DENIED":
    case "database/permission-denied":
      return "Database permission denied. Check RTDB Rules.";

    default:
      return error.message || "Registration failed.";

  }

}


// =========================================================
// 7. REGISTRATION
// =========================================================

if (!form) {

  console.error("AYNA BOOK: Registration form not found.");

} else {

  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    let createdUser = null;

    // -----------------------------------------------
    // FORM VALUES
    // -----------------------------------------------

    const fullName = fullNameInput?.value.trim() || "";

    const email =
      emailInput?.value.trim().toLowerCase() || "";

    const country = countryInput?.value.trim() || "";

    const phone = phoneInput?.value.trim() || "";

    const password = passwordInput?.value || "";

    const confirmPassword =
      confirmPasswordInput?.value || "";

    const photo = photoInput?.files?.[0];


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!fullName || !email || !country) {

      showMessage("Please complete all required fields.");
      return;

    }

    if (!photo) {

      showMessage("Please select your profile photo.");
      return;

    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {

      showMessage("Only JPG, PNG or WEBP images are allowed.");
      return;

    }

    if (photo.size > 5 * 1024 * 1024) {

      showMessage("Photo must be 5 MB or smaller.");
      return;

    }

    if (password.length < 6) {

      showMessage("Password must contain at least 6 characters.");
      return;

    }

    if (password !== confirmPassword) {

      showMessage("Passwords do not match.");
      return;

    }

    if (!termsInput?.checked) {

      showMessage("Please accept Terms and Privacy Policy.");
      return;

    }


    // -----------------------------------------------
    // START
    // -----------------------------------------------

    setLoading(true);

    if (statusMessage) {
      statusMessage.style.display = "none";
    }

    try {

      // ---------------------------------------------
      // STEP 1: COMPRESS PHOTO
      // ---------------------------------------------

      showMessage(
        "Preparing profile photo...",
        "success"
      );

      const photoDataURL = await compressPhoto(photo);


      // ---------------------------------------------
      // STEP 2: CREATE AUTH ACCOUNT
      // ---------------------------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      createdUser = user;


      // ---------------------------------------------
      // STEP 3: GENERATE AYNA ID
      // ---------------------------------------------

      const aynaId = "AYNA-" + user.uid;


      // ---------------------------------------------
      // STEP 4: UPDATE AUTH PROFILE
      // ---------------------------------------------

      await updateProfile(user, {

        displayName: fullName

      });


      // ---------------------------------------------
      // STEP 5: USER DATA
      // ---------------------------------------------

      const now = Date.now();

      const userData = {

        uid: user.uid,

        aynaId: aynaId,

        fullName: fullName,

        email: email,

        country: country,

        phone: phone,

        photoURL: photoDataURL,

        photoMimeType: "image/jpeg",

        emailVerified: user.emailVerified,

        accountStatus: "active",

        profileCompleted: true,

        createdAt: now,

        updatedAt: now

      };


      // ---------------------------------------------
      // STEP 6: SAVE IN REALTIME DATABASE
      // ---------------------------------------------

      await set(
        dbRef(database, "users/" + user.uid),
        userData
      );


      // ---------------------------------------------
      // STEP 7: SEND VERIFICATION EMAIL
      // ---------------------------------------------

      let verificationSent = true;

      try {

        await sendEmailVerification(user);

      } catch (verificationError) {

        verificationSent = false;

        console.error(
          "Verification email error:",
          verificationError
        );

      }


      // ---------------------------------------------
      // STEP 8: SUCCESS
      // ---------------------------------------------

      submitButton.textContent = "ACCOUNT CREATED";

      showMessage(

        verificationSent

          ? "AYNA BOOK account created successfully! Check your email for verification."

          : "Account created successfully! Verification email could not be sent.",

        "success"

      );


      // ---------------------------------------------
      // STEP 9: LOGIN REDIRECT
      // ---------------------------------------------

      setTimeout(() => {

        window.location.href = "./login.html";

      }, 2500);


    } catch (error) {

      console.error(
        "AYNA BOOK Registration Error:",
        error
      );

      if (createdUser) {

        showMessage(

          "Your account was created, but profile saving failed. Do not register again. Please login and recover your profile. Error: " +
          getFriendlyError(error)

        );

      } else {

        showMessage(getFriendlyError(error));

      }

    } finally {

      if (
        submitButton &&
        submitButton.textContent !== "ACCOUNT CREATED"
      ) {

        setLoading(false);

      }

    }

  });

}


// =========================================================
// AYNA BOOK — REGISTER.JS END
// =========================================================
