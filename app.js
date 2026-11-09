
import {
  auth, db, authPersistence
} from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  collection, addDoc, getDocs, query,
  orderBy, limit, serverTimestamp, doc, setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ==================================
// AYNA BOOK OMEGA V10000 APP ENGINE
// ==================================

const $ = id => document.getElementById(id);

function message(id, text, error = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = error ? "#ff8b8b" : "#00ffb0";
}

function showView(view) {
  document.querySelectorAll(".view").forEach(section => {
    section.classList.toggle("active", section.id === view);
  });

  document.querySelectorAll("#navigation button").forEach(button => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("#navigation button").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

// ==================================
// FIREBASE CONNECTION
// ==================================

let firebaseReady = false;

try {
  await authPersistence;
  firebaseReady = true;
  message("connectionStatus", "🟢 Firebase authentication initialized");
} catch (error) {
  message("connectionStatus", "🔴 Firebase connection error: " + error.message, true);
}

function requireFirebase() {
  if (!firebaseReady) {
    throw new Error("Firebase configuration ঠিক করুন এবং আবার চেষ্টা করুন।");
  }
}

// ==================================
// ACCOUNT REGISTRATION
// ==================================

$("registerBtn").addEventListener("click", async () => {
  try {
    requireFirebase();

    const name = $("fullName").value.trim();
    const email = $("email").value.trim();
    const password = $("password").value;
    const confirm = $("confirmPassword").value;

    if (!name || !email || !password) {
      throw new Error("নাম, ইমেইল ও পাসওয়ার্ড পূরণ করুন।");
    }

    if (password.length < 6) {
      throw new Error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
    }

    if (password !== confirm) {
      throw new Error("দুটি পাসওয়ার্ড মিলছে না।");
    }

    message("accountMessage", "Account creating...");

    const credential = await createUserWithEmailAndPassword(
      auth, email, password
    );

    await updateProfile(credential.user, {
      displayName: name
    });

    await setDoc(doc(db, "users", credential.user.uid), {
      name,
      email,
      phone: $("phone").value.trim(),
      createdAt: serverTimestamp(),
      membership: "FREE"
    });

    message("accountMessage", "✅ AYNA BOOK account created successfully!");

  } catch (error) {
    message("accountMessage", error.message, true);
  }
});

// ==================================
// LOGIN
// ==================================

$("loginBtn").addEventListener("click", async () => {
  try {
    requireFirebase();

    const email = $("email").value.trim();
    const password = $("password").value;

    if (!email || !password) {
      throw new Error("ইমেইল ও পাসওয়ার্ড লিখুন।");
    }

    await signInWithEmailAndPassword(auth, email, password);

    message("accountMessage", "✅ Login successful!");

  } catch (error) {
    message("accountMessage", error.message, true);
  }
});

// ==================================
// LOGOUT
// ==================================

$("logoutBtn").addEventListener("click", async () => {
  try {
    requireFirebase();
    await signOut(auth);
    message("accountMessage", "Successfully logged out.");
  } catch (error) {
    message("accountMessage", error.message, true);
  }
});

// ==================================
// PASSWORD RESET
// ==================================

$("resetBtn").addEventListener("click", async () => {
  try {
    requireFirebase();

    const email = $("email").value.trim();

    if (!email) throw new Error("আগে ইমেইল লিখুন।");

    await sendPasswordResetEmail(auth, email);

    message("accountMessage", "Password reset email পাঠানো হয়েছে।");

  } catch (error) {
    message("accountMessage", error.message, true);
  }
});

// ==================================
// AUTHENTICATION STATE
// ==================================

onAuthStateChanged(auth, user => {
  if (user) {
    $("homeName").textContent = user.displayName || "AYNA BOOK Member";
    $("homeEmail").textContent = user.email || "";
    message("connectionStatus", "🟢 Logged in: " + user.email);
  } else {
    $("homeName").textContent = "AYNA BOOK Member";
    $("homeEmail").textContent = "Not signed in";
    message("connectionStatus", "🟡 Please login to your account");
  }
});

// ==================================
// PASSWORD SHOW / HIDE
// ==================================

$("showPassword").addEventListener("change", event => {
  const type = event.target.checked ? "text" : "password";
  $("password").type = type;
  $("confirmPassword").type = type;
});

// ==================================
// PROFILE PHOTO PREVIEW
// ==================================

$("profileFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("শুধু ছবি নির্বাচন করুন।");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("ছবির সাইজ ৫ MB-এর কম রাখুন।");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    $("homeAvatar").src = reader.result;
  };

  reader.readAsDataURL(file);
});

$("coverFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("শুধু ছবি নির্বাচন করুন।");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("কভার ছবির সাইজ ৫ MB-এর কম রাখুন।");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    $("homeCover").style.backgroundImage =
      `url("${reader.result}")`;
  };

  reader.readAsDataURL(file);
});

// ==================================
// SOCIAL POST ENGINE
// ==================================

$("publishBtn").addEventListener("click", async () => {
  try {
    requireFirebase();

    if (!auth.currentUser) {
      throw new Error("পোস্ট করতে আগে লগইন করুন।");
    }

    const text = $("postText").value.trim();

    if (!text) throw new Error("পোস্ট লিখুন।");
    if (text.length > 5000) throw new Error("পোস্ট ৫০০০ অক্ষরের মধ্যে রাখুন।");

    await addDoc(collection(db, "posts"), {
      text,
      uid: auth.currentUser.uid,
      author: auth.currentUser.displayName || "AYNA Member",
      createdAt: serverTimestamp()
    });

    $("postText").value = "";
    message("postMessage", "✅ Post published!");

    await loadPosts();

  } catch (error) {
    message("postMessage", error.message, true);
  }
});

// ==================================
// LOAD PUBLIC POSTS
// ==================================

async function loadPosts() {
  try {
    requireFirebase();

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const snapshot = await getDocs(postsQuery);
    const container = $("postsList");

    container.replaceChildren();

    if (snapshot.empty) {
      container.textContent = "এখনো কোনো পোস্ট নেই।";
      return;
    }

    snapshot.forEach(item => {
      const data = item.data();

      const post = document.createElement("div");
      post.className = "post";

      const author = document.createElement("b");
      author.textContent = data.author || "AYNA Member";

      const content = document.createElement("p");
      content.textContent = data.text || "";

      const time = document.createElement("small");
      time.className = "muted";
      time.textContent = data.createdAt
        ? data.createdAt.toDate().toLocaleString()
        : "Just now";

      post.append(author, content, time);
      container.appendChild(post);
    });

  } catch (error) {
    $("postsList").textContent =
      "Posts unavailable: " + error.message;
  }
}

// ==================================
// MEDIA ENGINE
// ==================================

function playAudio(url, title) {
  const player = $("mediaPlayer");
  player.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = title;

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = url;

  const note = document.createElement("p");
  note.className = "muted";
  note.textContent = "অডিও চালাতে Play চাপুন।";

  player.append(heading, audio, note);

  audio.addEventListener("error", () => {
    note.textContent = "এই স্ট্রিমটি বর্তমানে পাওয়া যাচ্ছে না।";
  });
}

$("bbcBtn").addEventListener("click", () => {
  playAudio(
    "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    "BBC World Service"
  );
});

$("quranBtn").addEventListener("click", () => {
  playAudio(
    "https://quran.icecast.infomaniak.ch/quran-64.mp3",
    "Quran Radio"
  );
});

$("nasaBtn").addEventListener("click", () => {
  const player = $("mediaPlayer");
  player.replaceChildren();

  const link = document.createElement("a");
  link.href = "https://www.nasa.gov/live/";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open NASA Live Official Stream";

  player.append(link);
});

// ==================================
// BASS CONTROL
// ==================================

$("bass").addEventListener("input", event => {
  $("bassValue").textContent = event.target.value;
});

// ==================================
// GPS ENGINE
// ==================================

$("gpsBtn").addEventListener("click", () => {
  if (!navigator.geolocation) {
    message("gpsStatus", "এই ডিভাইসে GPS API পাওয়া যাচ্ছে না।", true);
    return;
  }

  message("gpsStatus", "📡 Location scanning...");

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      $("gpsResult").textContent =
        `Latitude: ${lat.toFixed(6)} | Longitude: ${lon.toFixed(6)}`;

      message(
        "gpsStatus",
        "🟢 Location received. Accuracy: " +
        Math.round(position.coords.accuracy) + " meters"
      );
    },

    error => {
      message("gpsStatus", "GPS Error: " + error.message, true);
    },

    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }
  );
});

// ==================================
// EMERGENCY TEST
// ==================================

$("sosBtn").addEventListener("click", () => {
  const time = new Date().toLocaleString();

  const item = document.createElement("div");
  item.className = "status warning";
  item.textContent = "TEST SOS generated: " + time;

  $("alertLog").prepend(item);

  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  alert("এটি শুধুমাত্র পরীক্ষামূলক SOS। কোনো জরুরি সেবা পাঠানো হয়নি।");
});

// ==================================
// STARTUP
// ==================================

showView("home");

if (firebaseReady) {
  loadPosts();
}

console.log("AYNA BOOK OMEGA V10000 initialized.");
