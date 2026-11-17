
/* ======================================================
   AYNA BOOK — FIREBASE CONFIGURATION
   ====================================================== */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// ======================================================
// CONFIGURATION VALIDATION
// ======================================================

export function validateFirebaseConfig() {
  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId"
  ];

  for (const key of required) {
    if (
      !firebaseConfig[key] ||
      firebaseConfig[key].startsWith("YOUR_")
    ) {
      throw new Error(
        `AYNA BOOK: Firebase ${key} is missing.`
      );
    }
  }

  return true;
}
