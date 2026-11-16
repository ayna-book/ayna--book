
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIW4FK9Il2yct-tOSCKuSodso8KN2UsTA",
  authDomain: "ayna-book.firebaseapp.com",
  databaseURL: "https://ayna-book-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ayna-book",
  storageBucket: "ayna-book.firebasestorage.app",
  messagingSenderId: "805601138500",
  appId: "1:805601138500:web:81a9adacbedbc5f3626911",
  measurementId: "G-JWBYNXSBMZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  auth,
  database,
  firestore,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  ref,
  set,
  get,
  update,
  push,
  onValue,
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  onSnapshot,
  storageRef,
  uploadBytes,
  getDownloadURL
};
