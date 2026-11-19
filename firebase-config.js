/* =========================================================
   AYNA BOOK
   Firebase Configuration
   Project: ayna-book
   Firebase SDK: 13.4.0
   ========================================================= */

export const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",

  authDomain: "ayna-book.firebaseapp.com",

  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "ayna-book",

  storageBucket:
    "ayna-book.firebasestorage.app",

  messagingSenderId: "805601138500",

  appId:
    "1:805601138500:web:7e215da6aedecaa8626911",

  measurementId: "G-BM63HG60DK"
};


/* =========================================================
   CONFIGURATION CHECK
   ========================================================= */

if (!firebaseConfig.projectId) {
  console.error(
    "AYNA BOOK: Firebase Project ID পাওয়া যায়নি।"
  );
}

if (!firebaseConfig.apiKey) {
  console.error(
    "AYNA BOOK: Firebase API Key পাওয়া যায়নি।"
  );
}

console.log(
  "AYNA BOOK Firebase Project:",
  firebaseConfig.projectId
);