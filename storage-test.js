import { storage, auth } from "./firebase-init.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";

/* =====================================================
   AYNA BOOK — FIREBASE STORAGE TEST
   ===================================================== */

async function testStorage() {

  try {

    console.log("AYNA BOOK Storage Test শুরু হয়েছে...");

    /* Firebase login check */

    if (!auth.currentUser) {

      console.error(
        "❌ Storage Test বন্ধ: আগে AYNA BOOK-এ Login করুন।"
      );

      return false;
    }

    const userId = auth.currentUser.uid;

    /* ছোট test file */

    const testData = new Blob(
      ["AYNA BOOK Firebase Storage Test"],
      {
        type: "text/plain"
      }
    );

    /*
      Storage Rules অনুযায়ী
      নিজের userId folder ব্যবহার করা হচ্ছে।
    */

    const testRef = ref(
      storage,
      `users/${userId}/system-tests/ayna-book-storage-test.txt`
    );

    /* Upload */

    await uploadBytes(
      testRef,
      testData
    );

    console.log(
      "✅ Storage Upload সফল হয়েছে।"
    );

    /* Download URL */

    const downloadURL =
      await getDownloadURL(testRef);

    console.log(
      "✅ Storage Download URL পাওয়া গেছে:",
      downloadURL
    );

    /* Delete test file */

    await deleteObject(testRef);

    console.log(
      "✅ Test file Delete সফল হয়েছে।"
    );

    console.log(
      "🎉 AYNA BOOK Firebase Storage Test সফল।"
    );

    return true;

  } catch (error) {

    console.error(
      "❌ AYNA BOOK Storage Test Failed:",
      error
    );

    return false;
  }
}


/* =====================================================
   RUN TEST
   ===================================================== */

testStorage();