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

    // আগে Login করা আছে কি না পরীক্ষা
    if (!auth.currentUser) {

      console.error(
        "❌ Storage Test বন্ধ: আগে AYNA BOOK-এ Login করুন।"
      );

      return false;
    }

    // বর্তমান User ID
    const userId = auth.currentUser.uid;

    // ছোট Test File
    const testData = new Blob(
      ["AYNA BOOK Firebase Storage Test"],
      {
        type: "text/plain"
      }
    );

    /*
      Storage Rules অনুযায়ী
      বর্তমান User-এর নিজের folder ব্যবহার করা হচ্ছে।
    */

    const testRef = ref(
      storage,
      `users/${userId}/system-tests/ayna-book-storage-test.txt`
    );

    // Upload Test
    await uploadBytes(
      testRef,
      testData
    );

    console.log(
      "✅ Storage Upload সফল হয়েছে।"
    );

    // Download URL Test
    const downloadURL =
      await getDownloadURL(testRef);

    console.log(
      "✅ Storage Download URL পাওয়া গেছে:",
      downloadURL
    );

    // Test File Delete
    await deleteObject(testRef);

    console.log(
      "✅ Test File Delete সফল হয়েছে।"
    );

    console.log(
      "🎉 AYNA BOOK Firebase Storage Test সফল হয়েছে।"
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