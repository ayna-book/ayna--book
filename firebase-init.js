
/* ============================================================
   AYNA BOOK — Firebase Initialization
   File: firebase-init.js
   Firebase Web SDK 13.4.0 — CDN / ES Modules
   ============================================================ */

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

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

/* ============================================================
   1. FIREBASE CONFIGURATION
   IMPORTANT: Replace every YOUR_... value with real values
   from Firebase Console > Project settings > Your apps.
   ============================================================ */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "YOUR_FIREBASE_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

/* ============================================================
   2. CONFIGURATION VALIDATION
   ============================================================ */

const requiredConfig = [
  "apiKey",
  "databaseURL",
  "appId"
];

const missingConfig = requiredConfig.filter((key) => {
  const value = firebaseConfig[key];

  return (
    !value ||
    value.startsWith("YOUR_") ||
    value.includes("YOUR_DATABASE_URL")
  );
});

if (missingConfig.length > 0) {
  throw new Error(
    "AYNA BOOK Firebase configuration missing: " +
    missingConfig.join(", ") +
    ". Please update firebase-init.js."
  );
}

/* ============================================================
   3. FIREBASE APP
   ============================================================ */

const app = getApps().length > 0
  ? getApp()
  : initializeApp(firebaseConfig);

/* ============================================================
   4. AUTHENTICATION
   ============================================================ */

const auth = getAuth(app);

export const authReady = setPersistence(
  auth,
  browserLocalPersistence
).catch((error) => {
  console.error(
    "AYNA BOOK Auth Persistence Error:",
    error
  );

  throw error;
});

/* ============================================================
   5. REALTIME DATABASE
   ============================================================ */

const database = getDatabase(app);

/* ============================================================
   6. CONNECTION MONITOR
   ============================================================ */

const connectedRef = ref(database, ".info/connected");

onValue(
  connectedRef,
  (snapshot) => {
    const connected = snapshot.val() === true;

    console.log(
      connected
        ? "AYNA BOOK Firebase CONNECTED"
        : "AYNA BOOK Firebase DISCONNECTED"
    );

    window.dispatchEvent(
      new CustomEvent(
        connected
          ? "ayna-firebase-connected"
          : "ayna-firebase-disconnected",
        {
          detail: { connected }
        }
      )
    );
  },
  (error) => {
    console.error(
      "AYNA BOOK Firebase Connection Error:",
      error
    );

    window.dispatchEvent(
      new CustomEvent("ayna-firebase-error", {
        detail: { error }
      })
    );
  }
);

/* ============================================================
   7. WATCH FIREBASE CONNECTION
   ============================================================ */

export function watchFirebaseConnection(callback) {
  if (typeof callback !== "function") {
    throw new TypeError(
      "Connection callback must be a function."
    );
  }

  return onValue(
    connectedRef,
    (snapshot) => {
      callback(snapshot.val() === true);
    },
    (error) => {
      console.error(
        "Firebase Connection Watch Error:",
        error
      );

      callback(false, error);
    }
  );
}

/* ============================================================
   8. SET USER PRESENCE ONLINE
   ============================================================ */

export async function setUserPresence(uid) {
  if (!uid) {
    throw new Error("User UID is required.");
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error(
      "Presence can only be updated for the signed-in user."
    );
  }

  const presenceRef = ref(
    database,
    `presence/${uid}`
  );

  try {
    // Register offline operation BEFORE setting online.
    await onDisconnect(presenceRef).set({
      online: false,
      lastChanged: serverTimestamp()
    });

    // Now mark the user online.
    await set(presenceRef, {
      online: true,
      lastChanged: serverTimestamp()
    });

    console.log(
      "AYNA BOOK Presence ONLINE:",
      uid
    );

    return true;

  } catch (error) {
    console.error(
      "AYNA BOOK Presence Error:",
      error
    );

    throw error;
  }
}

/* ============================================================
   9. SET USER OFFLINE
   ============================================================ */

export async function setUserOffline(uid) {
  if (!uid) {
    return false;
  }

  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error(
      "Cannot change another user's presence."
    );
  }

  const presenceRef = ref(
    database,
    `presence/${uid}`
  );

  try {
    // Remove pending disconnect operation.
    await onDisconnect(presenceRef).cancel();

    await set(presenceRef, {
      online: false,
      lastChanged: serverTimestamp()
    });

    console.log(
      "AYNA BOOK Presence OFFLINE:",
      uid
    );

    return true;

  } catch (error) {
    console.error(
      "AYNA BOOK Offline Error:",
      error
    );

    throw error;
  }
}

/* ============================================================
   10. FIREBASE EXPORTS
   ============================================================ */

export {
  app,
  auth,
  database,
  firebaseConfig
};

/* ============================================================
   11. GLOBAL AYNA FIREBASE OBJECT
   ============================================================ */

window.AYNA_FIREBASE = {
  app,
  auth,
  database,
  firebaseConfig,
  authReady,
  watchFirebaseConnection,
  setUserPresence,
  setUserOffline
};

// Backward-compatible auth reference for index.js.
window.AYNA_AUTH = auth;
window.AYNA_DATABASE = database;

console.log(
  "AYNA BOOK Firebase Initialization Loaded"
);
