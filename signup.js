import {
  registerUser,
  getAuthErrorMessage
} from "./auth.js";


const form =
  document.getElementById("signupForm");

const photoInput =
  document.getElementById("profilePhoto");

const preview =
  document.getElementById("photoPreview");

const button =
  document.getElementById("signupButton");

const message =
  document.getElementById("statusMessage");


let previewUrl = null;


// =========================================================
// PHOTO PREVIEW
// =========================================================

photoInput.addEventListener(
  "change",
  () => {

    const photo =
      photoInput.files?.[0];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    preview.hidden = true;
    preview.removeAttribute("src");

    if (!photo) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {

      photoInput.value = "";

      message.textContent =
        "Select a JPG, PNG or WebP image.";

      return;
    }

    if (photo.size > 5 * 1024 * 1024) {

      photoInput.value = "";

      message.textContent =
        "Maximum photo size is 5 MB.";

      return;
    }

    previewUrl =
      URL.createObjectURL(photo);

    preview.src = previewUrl;
    preview.hidden = false;
  }
);


// =========================================================
// REGISTRATION
// =========================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    message.textContent = "";

    const fullName =
      document
        .getElementById("fullName")
        .value
        .trim();

    const email =
      document
        .getElementById("email")
        .value
        .trim()
        .toLowerCase();

    const phone =
      document
        .getElementById("phone")
        .value
        .trim();

    const password =
      document
        .getElementById("password")
        .value;

    const confirmPassword =
      document
        .getElementById("confirmPassword")
        .value;

    const photo =
      photoInput.files?.[0];


    // Photo required.
    if (!photo) {

      message.textContent =
        "Profile photo is required.";

      return;
    }


    // Password confirmation.
    if (password !== confirmPassword) {

      message.textContent =
        "Passwords do not match.";

      return;
    }


    // Firebase minimum.
    if (password.length < 6) {

      message.textContent =
        "Password must contain at least 6 characters.";

      return;
    }


    button.disabled = true;

    button.textContent =
      "CREATING ACCOUNT...";


    try {

      await registerUser({
        fullName,
        email,
        phone,
        password,
        photo
      });


      message.textContent =
        "Account created. Please verify your Gmail.";


      setTimeout(
        () => {
          window.location.href =
            "./verify-email.html";
        },
        1000
      );


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );

      message.textContent =
        getAuthErrorMessage(error);

    } finally {

      button.disabled = false;

      button.textContent =
        "CREATE ACCOUNT";
    }
  }
);