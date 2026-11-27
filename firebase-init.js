// ============================================================
// AYNA BOOK — Firebase Initialization
// File: firebase-init.js
// Firebase Web SDK — CDN / ES Modules
// ============================================================

import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue,
  onDisconnect,
  set,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// ------------------------------------------------------------
// AYNA BOOK Firebase Configuration
// ------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",

  authDomain: "ayna-book.firebaseapp.com",

  databaseURL: "https://YOUR_DATABASE_URL",

  projectId: "ayna-book",

  storageBucket: "ayna-book.firebasestorage.app",

  messagingSenderId: "805601138500",

  appId: "YOUR_FIREBASE_APP_ID",

  measurementId: "YOUR_MEASUREMENT_ID"
};

// ------------------------------------------------------------
// Firebase App
// ------------------------------------------------------------

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// ------------------------------------------------------------
// Firebase Authentication
// ------------------------------------------------------------

const auth = getAuth(app);

// Keep login session on the device/browser.
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error(
      "AYNA BOOK Firebase Auth Persistence Error:",
      error
    );
  });

// ------------------------------------------------------------
// Firebase Realtime Database
// ------------------------------------------------------------

const database = getDatabase(app);

// ------------------------------------------------------------
// Connection Monitor
// ------------------------------------------------------------

const connectedRef = ref(database, ".info/connected");

onValue(
  connectedRef,
  (snapshot) => {

    if (snapshot.val() === true) {

      console.log(
        "🟢 AYNA BOOK Firebase: CONNECTED"
      );

      window.dispatchEvent(
        new CustomEvent("ayna-firebase-connected", {
          detail: {
            connected: true
          }
        })
      );

    } else {

      console.warn(
        "🔴 AYNA BOOK Firebase: DISCONNECTED"
      );

      window.dispatchEvent(
        new CustomEvent("ayna-firebase-disconnected", {
          detail: {
            connected: false
          }
        })
      );
    }
  },
  (error) => {

    console.error(
      "AYNA BOOK Firebase Connection Error:",
      error
    );

    window.dispatchEvent(
      new CustomEvent("ayna-firebase-error", {
        detail: {
          error: error
        }
      })
    );
  }
);

// ------------------------------------------------------------
// Helper: Check Firebase Connection
// ------------------------------------------------------------

export function watchFirebaseConnection(callback) {

  return onValue(
    connectedRef,
    (snapshot) => {

      const connected = snapshot.val() === true;

      callback(connected);
    },
    (error) => {

      console.error(
        "Firebase connection watcher error:",
        error
      );

      callback(false, error);
    }
  );
}

// ------------------------------------------------------------
// Helper: Set User Presence
// ------------------------------------------------------------

export async function setUserPresence(uid) {

  if (!uid) {
    console.warn(
      "AYNA BOOK Presence: UID missing"
    );
    return;
  }

  try {

    const presenceRef =
      ref(database, `presence/${uid}`);

    const onlineData = {
      online: true,
      lastChanged: serverTimestamp()
    };

    await set(
      presenceRef,
      onlineData
    );

    onDisconnect(presenceRef)
      .set({
        online: false,
        lastChanged: serverTimestamp()
      });

    console.log(
      "🟢 AYNA BOOK Presence: ONLINE",
      uid
    );

  } catch (error) {

    console.error(
      "AYNA BOOK Presence Error:",
      error
    );
  }
}

// ------------------------------------------------------------
// Helper: Set User Offline
// ------------------------------------------------------------

export async function setUserOffline(uid) {

  if (!uid) {
    return;
  }

  try {

    const presenceRef =
      ref(database, `presence/${uid}`);

    await set(
      presenceRef,
      {
        online: false,
        lastChanged: serverTimestamp()
      }
    );

  } catch (error) {

    console.error(
      "AYNA BOOK Offline Error:",
      error
    );
  }
}

// ------------------------------------------------------------
// Export
// ------------------------------------------------------------

export {
  app,
  auth,
  database,
  firebaseConfig
};

// ------------------------------------------------------------
// Global AYNA BOOK Firebase Object
// ------------------------------------------------------------

window.AYNA_FIREBASE = {
  app,
  auth,
  database,
  firebaseConfig,

  watchFirebaseConnection,
  setUserPresence,
  setUserOffline
};

console.log(
  "🚀 AYNA BOOK Firebase initialized"
);