
// =========================================================
// AYNA BOOK
// SIGNUP CONTROLLER
// Firebase SDK 13.4.0
// Personal Free + Gmail Verification
// =========================================================

import { auth, db } from "./firebase.js";

import {
  createRegistrationAccount,
  sendVerificationEmail,
  normalizePhone,
  validateGmail,
  validatePassword,
  getAuthErrorMessage
} from "./auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";


// =========================================================
// SETTINGS
// =========================================================

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// HTML ELEMENTS
// =========================================================

const form = document.getElementById("registrationForm");

const registerButton =
  document.getElementById("registerButton");

const statusMessage =
  document.getElementById("statusMessage");

const fullNameInput =
  document.getElementById("fullName");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const accountTypeInput =
  document.getElementById("accountType");

const termsInput =
  document.getElementById("terms");

const profilePhotoInput =
  document.getElementById("profilePhoto");

const photoPreview =
  document.getElementById("photoPreview");


// =========================================================
// CHECK REQUIRED ELEMENTS
// =========================================================

if (
  !form ||
  !registerButton ||
  !statusMessage ||
  !fullNameInput ||
  !emailInput ||
  !phoneInput ||
  !passwordInput ||
  !confirmPasswordInput ||
  !accountTypeInput ||
  !termsInput
) {
  throw new Error(
    "AYNA BOOK: signup.html-এর প্রয়োজনীয় HTML ID পাওয়া যায়নি।"
  );
}


// =========================================================
// STATUS MESSAGE
// =========================================================

function showStatus(message, type = "info") {

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;

  statusMessage.style.display = "block";
}


// =========================================================
// LOADING
// =========================================================

function setLoading(loading) {

  registerButton.disabled = loading;

  registerButton.textContent = loading
    ? "CREATING ACCOUNT..."
    : "REGISTER";
}


// =========================================================
// PHOTO VALIDATION
// =========================================================

function validatePhoto(file) {

  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "শুধু JPG, PNG অথবা WEBP ছবি ব্যবহার করুন।"
    );
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(
      "Profile Photo সর্বোচ্চ 5MB হতে পারবে।"
    );
  }
}


// =========================================================
// PHOTO PREVIEW
// =========================================================

let previewURL = null;

if (profilePhotoInput) {

  profilePhotoInput.addEventListener("change", () => {

    const file = profilePhotoInput.files?.[0];

    if (!file) return;

    try {

      validatePhoto(file);

      if (previewURL) {
        URL.revokeObjectURL(previewURL);
      }

      previewURL = URL.createObjectURL(file);

      if (photoPreview) {
        photoPreview.src = previewURL;
      }

      showStatus(
        "ছবির Preview প্রস্তুত হয়েছে।",
        "info"
      );

    } catch (error) {

      profilePhotoInput.value = "";

      showStatus(error.message, "error");

    }

  });

}


// =========================================================
// CREATE FIRESTORE PROFILE
// =========================================================

async function createUserProfile(user, data) {

  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {

    uid: user.uid,

    fullName: data.fullName,

    email: user.email || "",

    phone: data.phone,

    bio: "",

    country: "",

    photoURL: "",

    emailVerified: false,

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp()

  });

}


// =========================================================
// RESEND VERIFICATION BUTTON
// =========================================================

function showResendButton(user) {

  const resendButton = document.createElement("button");

  resendButton.type = "button";

  resendButton.textContent =
    "RESEND VERIFICATION EMAIL";

  resendButton.className = "resend-verification-button";

  resendButton.addEventListener("click", async () => {

    resendButton.disabled = true;

    resendButton.textContent = "SENDING...";

    const result = await sendVerificationEmail(user);

    if (result.success) {

      showStatus(
        "Verification Email পাঠানো হয়েছে। Gmail Inbox অথবা Spam Folder পরীক্ষা করুন।",
        "success"
      );

      try {
        await signOut(auth);
      } catch (error) {
        console.warn("Sign out warning:", error);
      }

    } else {

      showStatus(
        result.message || "Email পাঠানো যায়নি।",
        "error"
      );

      resendButton.disabled = false;

      resendButton.textContent =
        "RESEND VERIFICATION EMAIL";

    }

  });

  statusMessage.appendChild(resendButton);

}


// =========================================================
// REGISTRATION
// =========================================================

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  if (registerButton.disabled) return;

  const fullName = fullNameInput.value.trim();

  const email = emailInput.value.trim().toLowerCase();

  const rawPhone = phoneInput.value.trim();

  const password = passwordInput.value;

  const confirmPassword = confirmPasswordInput.value;

  const accountType = accountTypeInput.value;


  // -------------------------------------------------------
  // NAME VALIDATION
  // -------------------------------------------------------

  if (fullName.length < 2 || fullName.length > 100) {

    showStatus(
      "নাম ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // EMAIL VALIDATION
  // -------------------------------------------------------

  if (!validateGmail(email)) {

    showStatus(
      "সঠিক Gmail Address দিন।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // PHONE VALIDATION
  // -------------------------------------------------------

  let phone;

  try {

    phone = normalizePhone(rawPhone);

  } catch (error) {

    showStatus(
      error.message || "ফোন নম্বর সঠিক নয়।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // PASSWORD VALIDATION
  // -------------------------------------------------------

  if (!validatePassword(password)) {

    showStatus(
      "Password কমপক্ষে ১১ অক্ষরের হতে হবে।",
      "error"
    );

    return;
  }


  if (password !== confirmPassword) {

    showStatus(
      "Password এবং Confirm Password মিলছে না।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // ACCOUNT TYPE
  // -------------------------------------------------------

  if (accountType !== "personal") {

    showStatus(
      "এই ধাপে শুধু Personal Free Registration চালু আছে। Paid Account পরে Payment ও Admin Approval-এর মাধ্যমে চালু হবে।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // TERMS
  // -------------------------------------------------------

  if (!termsInput.checked) {

    showStatus(
      "Terms and Privacy Policy গ্রহণ করুন।",
      "error"
    );

    return;
  }


  // -------------------------------------------------------
  // PHOTO VALIDATION
  // -------------------------------------------------------

  const photoFile =
    profilePhotoInput?.files?.[0];

  try {

    validatePhoto(photoFile);

  } catch (error) {

    showStatus(error.message, "error");

    return;
  }


  // -------------------------------------------------------
  // START
  // -------------------------------------------------------

  setLoading(true);

  let createdUser = null;

  let profileCreated = false;

  try {

    // STEP 1: CREATE FIREBASE AUTH ACCOUNT

    showStatus(
      "Firebase Account তৈরি হচ্ছে...",
      "info"
    );

    const result = await createRegistrationAccount({

      name: fullName,

      email: email,

      password: password

    });

    if (!result.success) {

      throw new Error(
        result.message || "Account তৈরি করা যায়নি।"
      );

    }

    createdUser = result.user;


    // STEP 2: CREATE USER PROFILE

    showStatus(
      "আপনার Profile Information সংরক্ষণ হচ্ছে...",
      "info"
    );

    await createUserProfile(createdUser, {

      fullName: fullName,

      phone: phone

    });

    profileCreated = true;


    // STEP 3: SEND VERIFICATION EMAIL

    showStatus(
      "Gmail Verification Email পাঠানো হচ্ছে...",
      "info"
    );

    const verification =
      await sendVerificationEmail(createdUser);


    if (!verification.success) {

      showStatus(
        "Account তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি। নিচের বাটনে আবার চেষ্টা করুন।",
        "error"
      );

      showResendButton(createdUser);

      return;
    }


    // STEP 4: SIGN OUT

    await signOut(auth);


    // STEP 5: SUCCESS

    showStatus(
      "AYNA BOOK Registration সফল হয়েছে!\n\n" +
      "আপনার Gmail Inbox অথবা Spam Folder খুলুন।\n" +
      "AYNA BOOK-এর Verification Link-এ ক্লিক করুন।\n" +
      "Gmail Verify করার পরে Login করুন।",
      "success"
    );

    form.reset();

    if (photoPreview) {
      photoPreview.removeAttribute("src");
    }

    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      previewURL = null;
    }


  } catch (error) {

    console.error(
      "AYNA BOOK Registration Error:",
      error
    );

    if (createdUser && !profileCreated) {

      showStatus(
        "Firebase Account তৈরি হয়েছে, কিন্তু Profile সংরক্ষণ সম্পূর্ণ হয়নি। একই Gmail দিয়ে আবার Registration করবেন না। Error: " +
        (error.message || ""),
        "error"
      );

    } else if (createdUser && profileCreated) {

      showStatus(
        "Account ও Profile তৈরি হয়েছে। Verification Email পাঠাতে সমস্যা হয়েছে। একই Gmail দিয়ে আবার Registration করবেন না। Error: " +
        (error.message || ""),
        "error"
      );

      showResendButton(createdUser);

    } else {

      showStatus(
        getAuthErrorMessage(error) ||
        error.message ||
        "Registration ব্যর্থ হয়েছে।",
        "error"
      );

    }

  } finally {

    setLoading(false);

  }

});


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Signup Controller Loaded."
);
