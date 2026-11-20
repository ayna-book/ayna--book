
import {
  auth,
  db,
  storage
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


const form = document.getElementById("registrationForm");

const registerButton =
  document.getElementById("registerButton");

const statusMessage =
  document.getElementById("statusMessage");

const photoInput =
  document.getElementById("profilePhoto");

const photoPreview =
  document.getElementById("photoPreview");


const ACCOUNT_PRICES = {
  personal: 0,
  business: 10,
  vip: 10,
  vvip: 20
};


function showMessage(message, success = false) {
  statusMessage.style.display = "block";
  statusMessage.style.color = success ? "#8CFFB0" : "#FFB4B4";
  statusMessage.style.background =
    success ? "#123526" : "#402020";

  statusMessage.textContent = message;
}


function validateGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}


function validatePhone(phone) {
  return /^\+?[0-9]{10,15}$/.test(phone);
}


function getErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use":
      "এই Gmail দিয়ে আগে থেকেই অ্যাকাউন্ট রয়েছে। Login করুন অথবা Password Reset করুন।",

    "auth/invalid-email":
      "সঠিক Gmail Address দিন।",

    "auth/weak-password":
      "আরও শক্তিশালী Password দিন।",

    "auth/operation-not-allowed":
      "Firebase Console-এ Email/Password Authentication চালু করুন।",

    "auth/network-request-failed":
      "ইন্টারনেট সংযোগ পরীক্ষা করুন।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।",

    "auth/unauthorized-continue-uri":
      "Verification Link-এর Domain Firebase-এ Authorized নয়।",

    "auth/invalid-continue-uri":
      "Verification Link-এর ঠিকানা সঠিক নয়।"
  };

  return messages[error.code] ||
    "Registration সম্পন্ন হয়নি। Error Code: " +
    (error.code || "unknown");
}


// Password Show / Hide
document.querySelectorAll("[data-toggle]").forEach(button => {

  button.addEventListener("click", () => {

    const inputId = button.dataset.toggle;
    const input = document.getElementById(inputId);

    if (!input) return;

    const visible = input.type === "password";

    input.type = visible ? "text" : "password";

    button.textContent = visible ? "Hide" : "Show";
  });

});


// Profile Photo Preview
photoInput.addEventListener("change", () => {

  const file = photoInput.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showMessage("শুধু ছবি নির্বাচন করুন।");
    photoInput.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showMessage("ছবির সর্বোচ্চ সাইজ 5 MB হতে পারবে।");
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    photoPreview.src = event.target.result;
  };

  reader.readAsDataURL(file);

});


// Registration
form.addEventListener("submit", async event => {

  event.preventDefault();

  if (registerButton.disabled) return;

  const fullName =
    document.getElementById("fullName").value.trim();

  const email =
    document.getElementById("email").value.trim().toLowerCase();

  const phone =
    document.getElementById("phone").value.trim();

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;

  const accountType =
    document.getElementById("accountType").value;

  const photo =
    photoInput.files[0] || null;

  const terms =
    document.getElementById("terms").checked;


  // Validation
  if (!fullName || fullName.length < 2) {
    showMessage("সঠিক নাম লিখুন।");
    return;
  }

  if (!validateGmail(email)) {
    showMessage("শুধু Gmail Address ব্যবহার করুন।");
    return;
  }

  if (!validatePhone(phone)) {
    showMessage("সঠিক ফোন নম্বর লিখুন।");
    return;
  }

  if (password.length < 11) {
    showMessage("Password কমপক্ষে 11 অক্ষরের হতে হবে।");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("দুটি Password মিলছে না।");
    return;
  }

  if (!Object.hasOwn(ACCOUNT_PRICES, accountType)) {
    showMessage("সঠিক Account Category নির্বাচন করুন।");
    return;
  }

  if (!terms) {
    showMessage("Terms and Privacy Policy গ্রহণ করুন।");
    return;
  }

  if (photo) {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(photo.type)) {
      showMessage("JPEG, PNG অথবা WebP ছবি ব্যবহার করুন।");
      return;
    }

    if (photo.size > 5 * 1024 * 1024) {
      showMessage("ছবির সর্বোচ্চ সাইজ 5 MB।");
      return;
    }
  }


  registerButton.disabled = true;
  registerButton.textContent = "CREATING ACCOUNT...";

  showMessage("আপনার AYNA BOOK Account তৈরি হচ্ছে...");

  let createdUser = null;

  try {

    // Firebase Auth Persistence
    await setPersistence(auth, browserLocalPersistence);


    // Create Firebase Account
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    createdUser = credential.user;


    // Update Display Name
    await updateProfile(createdUser, {
      displayName: fullName
    });


    // Optional Profile Photo Upload
    let photoURL = "";

    if (photo) {

      try {

        const photoRef = ref(
          storage,
          `users/${createdUser.uid}/profile-photo`
        );

        const uploaded = await uploadBytes(
          photoRef,
          photo,
          {
            contentType: photo.type
          }
        );

        photoURL = await getDownloadURL(uploaded.ref);

        await updateProfile(createdUser, {
          photoURL: photoURL
        });

      } catch (photoError) {

        console.error("Profile photo upload failed:", photoError);

      }
    }


    // Account Information
    const priceUSD = ACCOUNT_PRICES[accountType];

    const paymentRequired = priceUSD > 0;


    // Save User Information
    await setDoc(
      doc(db, "users", createdUser.uid),
      {
        uid: createdUser.uid,

        name: fullName,

        email: email,

        phone: phone,

        photoURL: photoURL,

        accountType: accountType,

        priceUSD: priceUSD,

        paymentRequired: paymentRequired,

        emailVerified: false,

        emailVerificationStatus: "pending",

        paymentStatus: paymentRequired
          ? "pending"
          : "not_required",

        accountStatus: "pending_email_verification",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp()
      }
    );


    // Verification Link
    const loginURL = new URL(
      "./login.html",
      window.location.href
    ).href;


    // Send Verification Email
    await sendEmailVerification(
      createdUser,
      {
        url: loginURL,
        handleCodeInApp: false
      }
    );


    // Sign Out Until Email Is Verified
    await signOut(auth);


    form.reset();

    photoPreview.removeAttribute("src");

    showMessage(
      "অভিনন্দন! আপনার Registration Request তৈরি হয়েছে।\n\n" +
      "আপনার Gmail Inbox অথবা Spam Folder খুলুন।\n" +
      "AYNA BOOK-এর Verification Email-এর Link-এ ক্লিক করুন।\n\n" +
      "Email Verify হওয়ার পরে Login করুন।\n\n" +
      "আপনার Account Category: " +
      accountType.toUpperCase() +
      "\n\nLogin: " + loginURL,
      true
    );

    registerButton.textContent = "REGISTRATION REQUEST SENT";


  } catch (error) {

    console.error("AYNA BOOK Registration Error:", error);

    showMessage(getErrorMessage(error));

    registerButton.disabled = false;

    registerButton.textContent = "REGISTER";

  }

});
