// firebase-init.js — AYNA BOOK Firebase Initialization (with safe fallback)

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.firebaseio.com",
  projectId: "ayna-book",
  storageBucket: "ayna-book.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app = null;
let auth = null;
let database = null;

try {
  const hasRealConfig =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.startsWith("YOUR_") &&
    firebaseConfig.projectId;

  if (hasRealConfig) {
    const [{ initializeApp }, { getAuth }, { getDatabase }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js")
    ]);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  }
} catch (_) {
  app = null;
  auth = null;
  database = null;
}

export { app, auth, database };