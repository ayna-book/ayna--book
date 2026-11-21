'use strict';

// =========================================================
// AYNA BOOK
// FIREBASE STORAGE TEST
// Firebase SDK: 13.4.0
// =========================================================

import {
  auth,
  storage
} from "./firebase.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


// =========================================================
// STORAGE TEST
// =========================================================

export async function testStorageConnection() {

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Storage test করতে আগে Login করতে হবে।"
    );
  }


  // =====================================================
  // TEST DATA
  // =====================================================

  const testText =
    "AYNA BOOK Firebase Storage Test";

  const testBlob = new Blob(
    [testText],
    {
      type: "text/plain"
    }
  );


  // =====================================================
  // TEST PATH
  // =====================================================

  const testPath =
    `users/${user.uid}/files/ayna-storage-test.txt`;

  const testRef =
    ref(storage, testPath);


  try {

    // ===================================================
    // UPLOAD
    // ===================================================

    const uploadResult =
      await uploadBytes(
        testRef,
        testBlob,
        {
          contentType: "text/plain"
        }
      );


    console.log(
      "AYNA BOOK Storage upload successful:",
      uploadResult.metadata.fullPath
    );


    // ===================================================
    // DOWNLOAD URL
    // ===================================================

    const downloadURL =
      await getDownloadURL(testRef);


    console.log(
      "AYNA BOOK Storage download URL:",
      downloadURL
    );


    // ===================================================
    // DELETE TEST FILE
    // ===================================================

    await deleteObject(testRef);


    console.log(
      "AYNA BOOK Storage test file deleted."
    );


    return {
      success: true,
      path: testPath,
      message:
        "Firebase Storage connection এবং Rules সফলভাবে কাজ করছে।"
    };

  } catch (error) {

    console.error(
      "AYNA BOOK Storage test failed:",
      error
    );


    // ===================================================
    // ERROR MESSAGE
    // ===================================================

    let message =
      "Firebase Storage test ব্যর্থ হয়েছে।";


    switch (error?.code) {

      case "storage/unauthorized":

        message =
          "Storage permission denied। storage.rules পরীক্ষা করুন।";

        break;


      case "storage/object-not-found":

        message =
          "Storage test file পাওয়া যায়নি।";

        break;


      case "storage/bucket-not-found":

        message =
          "Firebase Storage bucket পাওয়া যায়নি।";

        break;


      case "storage/quota-exceeded":

        message =
          "Firebase Storage quota exceeded।";

        break;


      case "storage/retry-limit-exceeded":

        message =
          "Storage request-এর retry limit শেষ হয়েছে।";

        break;


      case "storage/network-request-failed":

        message =
          "Network সমস্যা। Internet connection পরীক্ষা করুন।";

        break;


      case "storage/invalid-argument":

        message =
          "Storage upload-এর argument ভুল হয়েছে।";

        break;


      default:

        if (error?.message) {
          message =
            `${message} ${error.message}`;
        }

    }


    throw new Error(message);

  }

}


// =========================================================
// OPTIONAL BROWSER TEST
// =========================================================

if (
  typeof window !== "undefined"
) {

  window.testAYNAStorage =
    testStorageConnection;

}