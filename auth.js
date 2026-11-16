
import {
  auth,
  database,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  ref,
  set
} from "./firebase-config.js";

// AYNA BOOK Authentication

const messageBox = document.getElementById("authMessage");

function showMessage(message, success = false) {
  if (messageBox) {
    messageBox.textContent = message;
    messageBox.style.color = success ? "green" : "red";
  }
}

// নতুন অ্যাকাউন্ট তৈরি
export async function registerUser(name, email, password) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    const user = result.user;

    // ব্যবহারকারীর তথ্য Realtime Database-এ রাখা
    await set(ref(database, "users/" + user.uid), {
      uid: user.uid,
      name: name.trim(),
      email: user.email,
      createdAt: Date.now()
    });

    showMessage("AYNA BOOK অ্যাকাউন্ট তৈরি হয়েছে!", true);
    return user;

  } catch (error) {
    showMessage(error.message);
    throw error;
  }
}

// লগইন
export async function loginUser(email, password) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    showMessage("সফলভাবে লগইন হয়েছে!", true);
    return result.user;

  } catch (error) {
    showMessage(error.message);
    throw error;
  }
}

// লগআউট
export async function logoutUser() {
  try {
    await signOut(auth);
    showMessage("আপনি লগআউট করেছেন।", true);
  } catch (error) {
    showMessage(error.message);
    throw error;
  }
}

// লগইন অবস্থা পর্যবেক্ষণ
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (typeof callback === "function") {
      callback(user);
    }
  });
}

// লগইন অবস্থা অনুযায়ী UI
watchAuthState((user) => {
  const loginArea = document.getElementById("loginArea");
  const accountArea = document.getElementById("accountArea");
  const userName = document.getElementById("currentUserName");

  if (user) {
    if (loginArea) loginArea.style.display = "none";
    if (accountArea) accountArea.style.display = "block";
    if (userName) userName.textContent = user.email || "AYNA BOOK User";
  } else {
    if (loginArea) loginArea.style.display = "block";
    if (accountArea) accountArea.style.display = "none";
  }
});

console.log("AYNA BOOK Authentication Ready");
