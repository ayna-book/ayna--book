// =========================================================
// AYNA BOOK
// Firebase Storage Test
// Firebase SDK: 13.4.0
// =========================================================

import { storage, auth } from "./firebase-init.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-storage.js";


async function testStorage() {

  console.log("AYNA BOOK Storage Test শুরু হয়েছে...");

  try {

    // -----------------------------------------------------
    // 1. Login check
    // -----------------------------------------------------

    if (!auth.currentUser) {

      console.error(
        "❌ Storage Test বন্ধ: আগে AYNA BOOK-এ Login করুন।"
      );

      return false;
    }


    // -----------------------------------------------------
    // 2. Current user ID
    // -----------------------------------------------------

    const userId = auth.currentUser.uid;

    console.log(
      "Authenticated User:",
      userId
    );


    // -----------------------------------------------------
    // 3. Test file তৈরি
    // -----------------------------------------------------

    const testData = new Blob(
      ["AYNA BOOK Firebase Storage Test"],
      {
        type: "text/plain"
      }
    );


    // -----------------------------------------------------
    // 4. Storage path
    // -----------------------------------------------------

    const testRef = ref(
      storage,
      `users/${userId}/system-tests/ayna-book-storage-test.txt`
    );


    // -----------------------------------------------------
    // 5. Upload
    // -----------------------------------------------------

    console.log("1️⃣ Test file upload হচ্ছে...");

    await uploadBytes(
      testRef,
      testData
    );

    console.log(
      "✅ Upload সফল হয়েছে।"
    );


    // -----------------------------------------------------
    // 6. Download URL পরীক্ষা
    // -----------------------------------------------------

    console.log(
      "2️⃣ Download URL পরীক্ষা হচ্ছে..."
    );

    const downloadURL =
      await getDownloadURL(testRef);

    console.log(
      "✅ Download URL পাওয়া গেছে:",
      downloadURL
    );


    // -----------------------------------------------------
    // 7. Test file delete
    // -----------------------------------------------------

    console.log(
      "3️⃣ Test file delete হচ্ছে..."
    );

    await deleteObject(testRef);

    console.log(
      "✅ Test file delete সফল হয়েছে।"
    );


    // -----------------------------------------------------
    // 8. Final result
    // -----------------------------------------------------

    console.log(
      "🎉 AYNA BOOK Storage Test সফল হয়েছে।"
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


// ---------------------------------------------------------
// Test চালু
// ---------------------------------------------------------

testStorage();