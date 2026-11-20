import { auth, db, storage } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
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
const registerButton = document.getElementById("registerButton");
const statusMessage = document.getElementById("statusMessage");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const accountTypeInput = document.getElementById("accountType");
const profilePhotoInput = document.getElementById("profilePhoto");
const termsInput = document.getElementById("terms");

const photoPreview = document.getElementById("photoPreview");

function showStatus(message, type = "info") {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
}

function setLoading(loading) {
  if (!registerButton) return;

  registerButton.disabled = loading;
  registerButton.textContent = loading
    ? "CREATING ACCOUNT..."
    : "CREATE ACCOUNT";
}

function isValidGmail(email) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
}

function isValidPhone(phone) {
  return /^\+?[0-9]{10,15}$/.test(phone.replace(/[\s()-]/g, ""));
}

function getAccountPrice(accountType) {
  const prices = {
    personal: 0,
    business: 10,
    vip: 10,
    vvip: 20
  };

  return prices[accountType] ?? 0;
}

if (profilePhotoInput && photoPreview) {
  profilePhotoInput.addEventListener("change", () => {
    const file = profilePhotoInput.files?.[0];

    if (!file) {
      photoPreview.style.display = "none";
      photoPreview.src = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      showStatus("শুধু ছবি নির্বাচন করুন।", "error");
      profilePhotoInput.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showStatus("Profile Photo সর্বোচ্চ 5 MB হতে হবে।", "error");
      profilePhotoInput.value = "";
      return;
    }

    photoPreview.src = URL.createObjectURL(file);
    photoPreview.style.display = "block";
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (registerButton?.disabled) return;

    const fullName = fullNameInput?.value.trim() || "";
    const email = emailInput?.value.trim().toLowerCase() || "";
    const phone = phoneInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";
    const accountType = accountTypeInput?.value || "personal";
    const photoFile = profilePhotoInput?.files?.[0] || null;

    if (!fullName) {
      showStatus("Full Name লিখুন।", "error");
      return;
    }

    if (!isValidGmail(email)) {
      showStatus("একটি সঠিক Gmail Address দিন।", "error");
      return;
    }

    if (!isValidPhone(phone)) {
      showStatus("সঠিক Mobile Number দিন। উদাহরণ: +8801XXXXXXXXX", "error");
      return;
    }

    if (password.length < 11) {
      showStatus("Password কমপক্ষে 11 অক্ষরের হতে হবে।", "error");
      return;
    }

    if (password !== confirmPassword) {
      showStatus("Password এবং Confirm Password মিলছে না।", "error");
      return;
    }

    if (!termsInput?.checked) {
      showStatus("Terms and Privacy Policy গ্রহণ করুন।", "error");
      return;
    }

    setLoading(true);

    let createdUser = null;

    try {
      showStatus("Firebase Account তৈরি করা হচ্ছে...", "info");

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      createdUser = credential.user;

      showStatus("Profile তথ্য সংরক্ষণ করা হচ্ছে...", "info");

      await updateProfile(createdUser, {
        displayName: fullName
      });

      let photoURL = "";

      if (photoFile) {
        try {
          showStatus("Profile Photo আপলোড করা হচ্ছে...", "info");

          const photoRef = ref(
            storage,
            `profilePhotos/${createdUser.uid}/${Date.now()}-${photoFile.name}`
          );

          await uploadBytes(photoRef, photoFile);
          photoURL = await getDownloadURL(photoRef);
        } catch (photoError) {
          console.warn("Photo upload failed:", photoError);

          showStatus(
            "Photo upload হয়নি। Registration চালিয়ে যাওয়া হচ্ছে...",
            "info"
          );
        }
      }

      const price = getAccountPrice(accountType);

      showStatus("User information Firestore-এ সংরক্ষণ করা হচ্ছে...", "info");

      await setDoc(
        doc(db, "users", createdUser.uid),
        {
          uid: createdUser.uid,
          fullName,
          displayName: fullName,
          email,
          phone,
          accountType,
          accountPriceUSD: price,
          photoURL,

          emailVerified: false,
          emailVerificationStatus: "pending",

          accountStatus: "pending_email_verification",

          paymentStatus:
            price > 0 ? "pending" : "not_required",

          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      );

      showStatus("Gmail Verification Link পাঠানো হচ্ছে...", "info");

      await sendEmailVerification(createdUser);

      await signOut(auth);

      setLoading(false);

      showStatus(
        "Registration সফল হয়েছে। আপনার Gmail Inbox/Spam Folder থেকে Verification Link-এ ক্লিক করুন। এরপর Login করুন।",
        "success"
      );

      form.reset();

      if (photoPreview) {
        photoPreview.src = "";
        photoPreview.style.display = "none";
      }

    } catch (error) {
      console.error("Registration Error:", error);

      setLoading(false);

      let message = "Registration সম্পন্ন হয়নি।";

      switch (error.code) {
        case "auth/email-already-in-use":
          message =
            "এই Gmail দিয়ে ইতিমধ্যে একটি Firebase Account আছে। নতুন করে Registration করবেন না।";
          break;

        case "auth/invalid-email":
          message = "Gmail Address সঠিক নয়।";
          break;

        case "auth/weak-password":
          message = "Password আরও শক্তিশালী দিন।";
          break;

        case "auth/network-request-failed":
          message =
            "Internet Connection পরীক্ষা করে আবার চেষ্টা করুন।";
          break;

        case "permission-denied":
          message =
            "Firebase Firestore Permission সমস্যা হয়েছে।";
          break;

        default:
          message =
            `Registration Error: ${error.message || "Unknown error"}`;
      }

      if (createdUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.warn("Sign out failed:", signOutError);
        }
      }

      showStatus(message, "error");
    }
  });
}