// ======================================================
// AYNA BOOK — Firebase Configuration
// ======================================================

export const firebaseConfig = {

  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",

  authDomain: "ayna-book.firebaseapp.com",

  databaseURL:
    "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId: "ayna-book",

  storageBucket:
    "ayna-book.firebasestorage.app",

  messagingSenderId:
    "805601138500",

  appId:
    "1:805601138500:web:81a9adacbedbc5f3626911",

  measurementId:
    "G-BM63HG60DK"
};


// ======================================================
// AYNA BOOK Firebase Configuration Check
// ======================================================

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {

  console.error(
    "❌ AYNA BOOK Firebase configuration is incomplete."
  );

} else {

  console.log(
    "✅ AYNA BOOK Firebase configuration loaded."
  );

}