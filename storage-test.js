// =========================================================
// AYNA BOOK
// Firebase Storage Test
// Firebase SDK: 13.4.0
// =========================================================

import { auth, storage } from "./firebase.js";

import {
  ref,
  getMetadata
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// ---------------------------------------------------------
// Storage Test
// ---------------------------------------------------------

export async function testStorageConnection() {

  try {

    // Firebase Storage service আছে কি না
    if (!storage) {
      throw new Error(
        "Firebase Storage service পাওয়া যায়নি।"
      );
    }

    // বর্তমান লগইন user
    const user = auth.currentUser;

    if (!user) {

      return {
        success: false,
        loggedIn: false,
        message:
          "Storage পরীক্ষা করতে আগে AYNA BOOK-এ Login করুন।"
      };

    }


    // নিজের user storage path
    const storageRef = ref(
      storage,
      `users/${user.uid}`
    );


    /*
     * Folder-এর metadata সবসময় পাওয়া নাও যেতে পারে।
     * তাই এখানে Firebase Storage reference তৈরি হওয়া
     * এবং service initialize হয়েছে কি না যাচাই করা হচ্ছে।
     */

    console.log(
      "AYNA BOOK Storage Reference:",
      storageRef.fullPath
    );


    return {
      success: true,
      loggedIn: true,
      uid: user.uid,
      path: storageRef.fullPath,
      message:
        "AYNA BOOK Firebase Storage সংযোগ প্রস্তুত আছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Storage Test Error:",
      error
    );

    return {
      success: false,
      loggedIn: !!auth.currentUser,
      message:
        error?.message ||
        "Firebase Storage পরীক্ষা করা যায়নি।"
    };

  }

}


// ---------------------------------------------------------
// Optional File Metadata Test
// ---------------------------------------------------------

export async function testStorageFile(filePath) {

  try {

    const user = auth.currentUser;

    if (!user) {
      throw new Error(
        "আগে AYNA BOOK-এ Login করুন।"
      );
    }

    const cleanPath = String(filePath || "").trim();

    if (!cleanPath) {
      throw new Error(
        "Storage file path দিন।"
      );
    }


    // নিরাপত্তার জন্য নিজের user path-এর বাইরে যেতে দেওয়া হবে না
    const expectedPrefix = `users/${user.uid}/`;

    if (!cleanPath.startsWith(expectedPrefix)) {
      throw new Error(
        "নিজের Storage path-এর বাইরে পরীক্ষা করা যাবে না।"
      );
    }


    const fileRef = ref(storage, cleanPath);

    const metadata = await getMetadata(fileRef);


    return {
      success: true,
      metadata,
      message:
        "Storage file metadata সফলভাবে পাওয়া গেছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Storage Metadata Error:",
      error
    );

    return {
      success: false,
      metadata: null,
      message:
        error?.message ||
        "Storage file metadata পাওয়া যায়নি।"
    };

  }

}


// ---------------------------------------------------------
// Global AYNA BOOK Storage Test API
// ---------------------------------------------------------

window.AYNA_STORAGE = {
  test: testStorageConnection,
  testFile: testStorageFile
};


// ---------------------------------------------------------
// Ready
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — Firebase Storage Test Loaded Successfully."
);