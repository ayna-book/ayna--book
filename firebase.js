/*
 * AYNA BOOK
 * Firebase Service Connector
 *
 * Firebase initialization is handled by firebase-init.js.
 * This file re-exports the initialized Firebase services.
 */

export {
  app,
  auth,
  db,
  database,
  storage
} from "./firebase-init.js";

// AYNA BOOK Firebase connector ready
console.log("AYNA BOOK Firebase connector loaded successfully.");