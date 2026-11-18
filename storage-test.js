import { storage } from "./firebase-init.js";

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

    /*
     * ছোট একটি test file তৈরি
     */
    const testData = new Blob(
      ["AYNA BOOK Firebase Storage Test"],
      {
        type: "text/plain"
      }
    );


    /*
     * Test location
     */
    const testRef = ref(
      storage,
      "system-tests/ayna-book-storage-test.txt"
    );


    /*
     * Upload
     */
    await uploadBytes(
      testRef,
      testData
    );

    console.log(
      "✅ Storage Upload সফল হয়েছে।"
    );


    /*
     * Download URL
     */
    const downloadURL =
      await getDownloadURL(testRef);

    console.log(
      "✅ Storage Download URL পাওয়া গেছে:",
      downloadURL
    );


    /*
     * Test file delete
     */
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