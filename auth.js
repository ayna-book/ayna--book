// ======================================================
// AYNA BOOK — Authentication
// Firebase Authentication + Firestore
// ======================================================

import {
  auth,
  db
} from "./firebase-init.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


// ======================================================
// HELPER
// ======================================================

function showMessage(message, type = "info") {

  console.log(`[AYNA AUTH - ${type}] ${message}`);

  const element =
    document.getElementById("auth-message") ||
    document.getElementById("message") ||
    document.getElementById("error-message");

  if (element) {
    element.textContent = message;
    element.dataset.type = type;
  }
}


// ======================================================
// REGISTER
// ======================================================

export async function registerUser(
  name,
  email,
  password
) {

  try {

    if (!name || !email || !password) {
      throw new Error(
        "Name, email and password are required."
      );
    }

    if (password.length < 6) {
      throw new Error(
        "Password must contain at least 6 characters."
      );
    }

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;


    // Update Firebase Auth profile
    await updateProfile(user, {
      displayName: name.trim()
    });


    // Create Firestore user document
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,

        name: name.trim(),

        email: user.email,

        photoURL: user.photoURL || "",

        createdAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        status: "active"
      },
      {
        merge: true
      }
    );


    showMessage(
      "Registration successful.",
      "success"
    );


    return user;

  } catch (error) {

    console.error(
      "❌ Registration error:",
      error
    );

    showMessage(
      getAuthErrorMessage(error),
      "error"
    );

    throw error;
  }
}


// ======================================================
// LOGIN
// ======================================================

export async function loginUser(
  email,
  password
) {

  try {

    if (!email || !password) {
      throw new Error(
        "Email and password are required."
      );
    }

    const result =
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    const user = result.user;


    // Update last login
    await setDoc(
      doc(db, "users", user.uid),
      {
        lastLoginAt: serverTimestamp(),

        updatedAt: serverTimestamp(),

        status: "active"
      },
      {
        merge: true
      }
    );


    showMessage(
      "Login successful.",
      "success"
    );


    return user;

  } catch (error) {

    console.error(
      "❌ Login error:",
      error
    );

    showMessage(
      getAuthErrorMessage(error),
      "error"
    );

    throw error;
  }
}


// ======================================================
// LOGOUT
// ======================================================

export async function logoutUser() {

  try {

    await signOut(auth);

    showMessage(
      "You have been logged out.",
      "success"
    );

  } catch (error) {

    console.error(
      "❌ Logout error:",
      error
    );

    showMessage(
      "Logout failed.",
      "error"
    );

    throw error;
  }
}


// ======================================================