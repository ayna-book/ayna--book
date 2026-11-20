
// =========================================================
// AYNA BOOK
// REGISTRATION CONTROLLER
// Firebase SDK: 13.4.0
// Personal Free + Gmail Verification
// =========================================================

import { auth, db, storage } from "./firebase.js";

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
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// CONSTANTS
// =========================================================

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];


// =========================================================
// ELEMENTS
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
// STATUS MESSAGE
// =========================================================

function showStatus(message, type = "info") {

  if (!statusMessage) return;

  statusMessage.textContent = message;

  statusMessage.className =
    `status-message ${type}`;

  statusMessage.style.display = "block";
}


// =========================================================
// LOADING
// =========================================================

function setLoading(loading) {

  if (!registerButton) return;

  registerButton.disabled = loading;

  registerButton.textContent = loading
    ? "CREATING ACCOUNT..."
    : "REGISTER";
}


// =========================================================
// ACCOUNT TYPE
// =========================================================

function getAccountType() {

  const selected =
    accountTypeInput?.value || "personal";

  const allowedTypes = [
    "personal",
    "business",
    "vip",
    "vvip"
  ];

  if (!allowedTypes.includes(selected)) {
    throw new Error("Account Type সঠিক নয়।");
  }

  // Registration-এ সবাই Personal Free দিয়ে শুরু করবে।
  // Paid account কেবল Admin অনুমোদনের পর সক্রিয় হবে।

  return {
    selected,
    initial: "personal"
  };
}


// =========================================================
// PHOTO VALIDATION
// =========================================================

function validatePhoto(file) {

  if (!file) return true;

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

  return true;
}


// =========================================================
// PHOTO PREVIEW
// =========================================================

let previewObjectURL = null;

if (profilePhotoInput) {

  profilePhotoInput.addEventListener(
    "change",
    () => {

      const file =
        profilePhotoInput.files?.[0];

      if (!file) return;

      try {

        validatePhoto(file);

        if (previewObjectURL) {
          URL.revokeObjectURL(previewObjectURL);
        }

        previewObjectURL =
          URL.createObjectURL(file);

        if (photoPreview) {
          photoPreview.src = previewObjectURL;
        }

        showStatus(
          "Profile Photo Preview প্রস্তুত।",
          "info"
        );

      } catch (error) {

        profilePhotoInput.value = "";

        showStatus(
          error.message,
          "error"
        );

      }
    }
  );
}


// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

async function uploadProfilePhoto(user) {

  const file =
    profilePhotoInput?.files?.[0];

  if (!file) {
    return "";
  }

  validatePhoto(file);

  const photoRef = ref(
    storage,
    `users/${user.uid}/profile/profile-photo`
  );

  await uploadBytes(
    photoRef,
    file,
    {
      contentType: file.type
    }
  );

  return await getDownloadURL(photoRef);
}


// =========================================================
// CREATE USER PROFILE
// =========================================================

async function createUserProfile(
  user,
  profileData
) {

  const userRef = doc(
    db,
    "users",
    user.uid
  );

  const existingProfile =
    await getDoc(userRef);

  if (existingProfile.exists()) {
    throw new Error(
      "এই Account-এর Profile ইতিমধ্যে তৈরি হয়েছে।"
    );
  }

  await setDoc(userRef, {

    uid: user.uid,

    fullName: profileData.fullName,

    email: user.email || "",

    phone: profileData.phone,

    country: "",

    bio: "",

    photoURL: profileData.photoURL,

    emailVerified: false,

    accountType: "personal",

    accountStatus: "pending_verification",

    createdAt: serverTimestamp(),

    updatedAt: serverTimestamp()

  });
}


// =========================================================
// FORM CHECK
// =========================================================

if (!form) {

  console.error(
    "AYNA BOOK — registrationForm পাওয়া যায়নি।"
  );

  throw new Error(
    "Registration Form পাওয়া যায়নি।"
  );

}

if (
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

  console.error(
    "AYNA BOOK — Registration HTML elements missing."
  );

  throw new Error(
    "Registration HTML-এর প্রয়োজনীয় Element পাওয়া যায়নি।"
  );

}


// =========================================================
// REGISTRATION FORM SUBMIT
// =========================================================

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    if (registerButton.disabled) return;


    // -----------------------------------------------------
    // READ VALUES
    // -----------------------------------------------------

    const fullName =
      fullNameInput.value.trim();

    const email =
      emailInput.value.trim().toLowerCase();

    const rawPhone =
      phoneInput.value.trim();

    const password =
      passwordInput.value;

    const confirmPassword =
      confirmPasswordInput.value;


    // -----------------------------------------------------
    // VALIDATE NAME
    // -----------------------------------------------------

    if (
      fullName.length < 2 ||
      fullName.length > 100
    ) {

      showStatus(
        "নাম ২ থেকে ১০০ অক্ষরের মধ্যে হতে হবে।",
        "error"
      );

      fullNameInput.focus();

      return;
    }


    // -----------------------------------------------------
    // VALIDATE GMAIL
    // -----------------------------------------------------

    if (!validateGmail(email)) {

      showStatus(
        "সঠিক Gmail Address দিন।",
        "error"
      );

      emailInput.focus();

      return;
    }


    // -----------------------------------------------------
    // VALIDATE PHONE
    // -----------------------------------------------------

    let phone = "";

    try {

      phone = normalizePhone(rawPhone);

    } catch (error) {

      showStatus(
        error.message,
        "error"
      );

      phoneInput.focus();

      return;
    }


    // -----------------------------------------------------
    // VALIDATE PASSWORD
    // -----------------------------------------------------

    if (!validatePassword(password)) {

      showStatus(
        "Password কমপক্ষে ১১ অক্ষরের হতে হবে।",
        "error"
      );

      passwordInput.focus();

      return;
    }


    // -----------------------------------------------------
    // CONFIRM PASSWORD
    // -----------------------------------------------------

    if (password !== confirmPassword) {

      showStatus(
        "Password এবং Confirm Password মিলছে না।",
        "error"
      );

      confirmPasswordInput.focus();

      return;
    }


    // -----------------------------------------------------
    // TERMS
    // -----------------------------------------------------

    if (!termsInput.checked) {

      showStatus(
        "Terms and Privacy Policy গ্রহণ করুন।",
        "error"
      );

      return;
    }


    // -----------------------------------------------------
    // ACCOUNT TYPE
    // -----------------------------------------------------

    let accountInfo;

    try {

      accountInfo = getAccountType();

    } catch (error) {

      showStatus(
        error.message,
        "error"
      );

      return;
    }


    // -----------------------------------------------------
    // PHOTO
    // -----------------------------------------------------

    const photoFile =
      profilePhotoInput?.files?.[0];

    try {

      validatePhoto(photoFile);

    } catch (error) {

      showStatus(
        error.message,
        "error"
      );

      return;
    }


    // -----------------------------------------------------
    // START REGISTRATION
    // -----------------------------------------------------

    setLoading(true);

    showStatus(
      "AYNA BOOK Account তৈরি হচ্ছে...",
      "info"
    );


    let createdUser = null;

    let profileCreated = false;

    let verificationSent = false;


    try {

      // ===================================================
      // STEP 1 — CREATE FIREBASE ACCOUNT
      // ===================================================

      const result =
        await createRegistrationAccount({

          name: fullName,

          email,

          password

        });


      if (!result.success) {

        throw new Error(
          result.message ||
          "Firebase Account তৈরি করা যায়নি।"
        );

      }


      createdUser = result.user;


      // ===================================================
      // STEP 2 — UPLOAD PROFILE PHOTO
      // ===================================================

      showStatus(
        "Profile Photo Upload হচ্ছে...",
        "info"
      );

      let photoURL = "";

      if (photoFile) {

        photoURL =
          await uploadProfilePhoto(createdUser);

      }


      // ===================================================
      // STEP 3 — CREATE FIRESTORE PROFILE
      // ===================================================

      showStatus(
        "Profile Information সংরক্ষণ হচ্ছে...",
        "info"
      );

      await createUserProfile(
        createdUser,
        {
          fullName,
          phone,
          photoURL
        }
      );

      profileCreated = true;


      // ===================================================
      // STEP 4 — SEND GMAIL VERIFICATION
      // ===================================================

      showStatus(
        "Gmail Verification Email পাঠানো হচ্ছে...",
        "info"
      );

      const verificationResult =
        await sendVerificationEmail(createdUser);


      if (!verificationResult.success) {

        throw new Error(
          "Account তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি। " +
          verificationResult.message
        );

      }

      verificationSent = true;


      // ===================================================
      // STEP 5 — SIGN OUT
      // ===================================================

      await auth.signOut?.();


      // Firebase modular signOut ব্যবহার
      // নিচে আলাদা signOut import প্রয়োজন হবে না।
      // Auth session বন্ধ না হলে সতর্কতা দেখানো হবে।

      if (auth.currentUser) {

        showStatus(
          "Account তৈরি হয়েছে। Gmail Verify করে Login করুন।",
          "success"
        );

      } else {

        showStatus(
          "Registration সফল হয়েছে!\n\n" +
          "আপনার Gmail Inbox অথবা Spam Folder খুলুন।\n" +
          "AYNA BOOK-এর Verification Link-এ ক্লিক করুন।\n\n" +
          "Gmail Verify করার পরে Login করুন।",
          "success"
        );

        form.reset();

        if (photoPreview) {
          photoPreview.removeAttribute("src");
        }

      }


    } catch (error) {

      console.error(
        "AYNA BOOK — Registration Error:",
        error
      );


      if (createdUser) {

        try {

          const { signOut } =
            await import(
              "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"
            );

          await signOut(auth);

        } catch (signOutError) {

          console.warn(
            "AYNA BOOK — Sign Out Error:",
            signOutError
          );

        }

      }


      if (createdUser && !profileCreated) {

        showStatus(
          "Firebase Account তৈরি হয়েছে, কিন্তু Profile সম্পূর্ণ হয়নি। " +
          "একই Gmail দিয়ে আবার Registration করবেন না। " +
          "পরবর্তী ধাপে Recovery ব্যবস্থা যুক্ত করতে হবে। " +
          (error.message || ""),
          "error"
        );

      } else if (
        createdUser &&
        profileCreated &&
        !verificationSent
      ) {

        showStatus(
          "Account ও Profile তৈরি হয়েছে, কিন্তু Verification Email পাঠানো যায়নি। " +
          "একই Gmail দিয়ে আবার Registration করবেন না। " +
          "পরবর্তী ধাপে Resend Verification ব্যবস্থা ব্যবহার করুন। " +
          (error.message || ""),
          "error"
        );

      } else {

        showStatus(
          error.message ||
          getAuthErrorMessage(error),
          "error"
        );

      }

    } finally {

      setLoading(false);

    }

  }
);


// =========================================================
// READY
// =========================================================

console.log(
  "AYNA BOOK — Registration Controller Loaded."
);

console.log(
  "AYNA BOOK — Personal Free Registration Mode Active."
);

console.log(
  "AYNA BOOK — Gmail Verification Enabled."
);
