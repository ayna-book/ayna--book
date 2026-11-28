
/* =========================================================
   AYNA BOOK
   PROFILE SYSTEM
   File: profile.js
   Firebase SDK: 13.4.0
========================================================= */

import {
  auth,
  database,
  authReady
} from "./firebase-init.js";

import {
  onAuthStateChanged,
  reload,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


/* =========================================================
   ELEMENTS
========================================================= */

const $ = id => document.getElementById(id);

let currentUser = null;
let currentProfile = null;
let profileUid = null;
let isRedirecting = false;

const DEFAULT_PHOTO =
  "https://ui-avatars.com/api/?name=AYNA+BOOK&background=071b49&color=ffd700&size=512";


/* =========================================================
   TOAST
========================================================= */

function toast(message) {

  const box = $("toast");

  if (!box) {
    alert(message);
    return;
  }

  box.textContent = message;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, 2600);
}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

  const loading = $("loading");

  if (loading) {
    loading.style.display = "none";
  }

}

function showLoading(message = "AYNA BOOK — Loading Profile...") {

  const loading = $("loading");

  if (loading) {
    loading.textContent = message;
    loading.style.display = "flex";
  }

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   PROFILE URL
========================================================= */

function getProfileUrl(uid) {

  const url = new URL(
    "./profile.html",
    window.location.href
  );

  url.searchParams.set("uid", uid);

  return url.href;

}


/* =========================================================
   QR CODE
========================================================= */

function createQR(uid) {

  const box = $("accountQR");

  if (!box) return;

  box.innerHTML = "";

  if (!uid) {
    box.textContent = "QR unavailable";
    return;
  }

  if (typeof QRCode === "undefined") {
    box.textContent = "QR library unavailable";
    return;
  }

  try {

    new QRCode(box, {
      text: getProfileUrl(uid),
      width: 120,
      height: 120,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

  } catch (error) {

    console.error("QR error:", error);
    box.textContent = "QR error";

  }

}


/* =========================================================
   SAFE PHOTO
========================================================= */

function setProfilePhoto(photo) {

  const img = $("profilePhoto");

  if (!img) return;

  img.onerror = () => {
    img.onerror = null;
    img.src = DEFAULT_PHOTO;
  };

  img.src = photo || DEFAULT_PHOTO;

}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile(user) {

  if (!user || !user.uid) {
    throw new Error("Authenticated user is missing.");
  }

  currentUser = user;

  const params = new URLSearchParams(
    window.location.search
  );

  const requestedUid = params.get("uid");

  profileUid = requestedUid || user.uid;

  const isOwnProfile = profileUid === user.uid;

  const profileRef = ref(
    database,
    "users/" + profileUid
  );

  const snapshot = await get(profileRef);

  if (!snapshot.exists()) {

    if (isOwnProfile) {
      throw new Error("Your profile data was not found.");
    }

    $("profileName").textContent = "AYNA BOOK User";
    $("profileEmail").textContent = "";
    $("profileBio").textContent = "AYNA BOOK — Connect • Share • Create";

    setProfilePhoto(DEFAULT_PHOTO);
    createQR(profileUid);

    $("postsBox").innerHTML =
      '<div class="empty">Profile information is unavailable.</div>';

    $("postsCount").textContent = "0";

    return;

  }

  currentProfile = snapshot.val() || {};

  const data = currentProfile;

  const name =
    data.fullName ||
    data.displayName ||
    data.name ||
    user.displayName ||
    "AYNA BOOK User";

  /*
    অন্য ব্যক্তির private email প্রকাশ না করার জন্য
    শুধু নিজের প্রোফাইলে email দেখানো হচ্ছে।
  */

  const email = isOwnProfile
    ? (data.email || user.email || "")
    : "";

  const photo =
    data.photoURL ||
    data.photo ||
    (isOwnProfile ? user.photoURL : "") ||
    DEFAULT_PHOTO;

  const bio =
    data.bio ||
    "AYNA BOOK — Connect • Share • Create";

  $("profileName").textContent = name;
  $("profileEmail").textContent = email;
  $("profileBio").textContent = bio;

  setProfilePhoto(photo);

  createQR(profileUid);

  /*
    Private relationship counts may not be readable
    under your current RTDB rules. If so, they remain 0.
  */

  const friends = countEntries(data.friends, data.friendsCount);
  const followers = countEntries(data.followers, data.followersCount);
  const following = countEntries(data.following, data.followingCount);

  $("friendsCount").textContent = friends;
  $("followersCount").textContent = followers;
  $("followingCount").textContent = following;

  await loadPosts(profileUid);

}


/* =========================================================
   COUNT HELPER
========================================================= */

function countEntries(collection, fallback) {

  if (
    collection &&
    typeof collection === "object"
  ) {
    return Object.keys(collection).length;
  }

  const number = Number(fallback || 0);

  return Number.isFinite(number) ? number : 0;

}


/* =========================================================
   LOAD POSTS
========================================================= */

async function loadPosts(uid) {

  const box = $("postsBox");

  if (!box) return;

  box.innerHTML =
    '<div class="empty">Loading your posts...</div>';

  try {

    const postsQuery = query(
      ref(database, "posts"),
      orderByChild("uid")
    );

    const snapshot = await get(postsQuery);

    if (!snapshot.exists()) {

      box.innerHTML =
        '<div class="empty">📝 No posts yet.</div>';

      $("postsCount").textContent = "0";

      return;

    }

    const posts = [];

    snapshot.forEach(child => {

      const post = child.val() || {};

      const postUid =
        post.uid ||
        post.userId ||
        post.authorUid;

      if (postUid === uid) {

        posts.push({
          id: child.key,
          ...post
        });

      }

    });

    posts.sort((a, b) => {

      return Number(b.createdAt || 0) -
             Number(a.createdAt || 0);

    });

    $("postsCount").textContent = posts.length;

    if (!posts.length) {

      box.innerHTML =
        '<div class="empty">📝 No posts yet.</div>';

      return;

    }

    const profileName =
      $("profileName").textContent || "AYNA BOOK User";

    const profilePhoto =
      $("profilePhoto").src || DEFAULT_PHOTO;

    box.innerHTML = posts
      .slice(0, 20)
      .map(post => renderPost(post, profileName, profilePhoto))
      .join("");

  } catch (error) {

    console.error("AYNA BOOK posts error:", error);

    box.innerHTML =
      '<div class="empty">⚠️ Posts could not be loaded. Check database rules.</div>';

  }

}


/* =========================================================
   RENDER POST
========================================================= */

function renderPost(post, name, photo) {

  const text =
    post.text ||
    post.caption ||
    post.message ||
    "";

  const date = post.createdAt
    ? new Date(Number(post.createdAt)).toLocaleString()
    : "";

  /*
    Only allow HTTP/HTTPS media URLs.
    Base64 content and unsupported URLs are not rendered.
  */

  const mediaUrl =
    safeHttpUrl(
      post.mediaURL ||
      post.imageURL ||
      post.videoURL ||
      post.mediaUrl ||
      ""
    );

  const isVideo =
    Boolean(post.videoURL) ||
    post.type === "video";

  let mediaHTML = "";

  if (mediaUrl && isVideo) {

    mediaHTML = `
      <video
        class="post-media"
        src="${escapeHtml(mediaUrl)}"
        controls
        playsinline
        preload="metadata">
      </video>
    `;

  } else if (mediaUrl) {

    mediaHTML = `
      <img
        class="post-media"
        src="${escapeHtml(mediaUrl)}"
        alt="Post media"
        loading="lazy">
    `;

  }

  return `
    <article class="post">

      <div class="post-head">

        <img
          class="post-avatar"
          src="${escapeHtml(photo)}"
          alt="Profile">

        <div>

          <div class="post-name">
            ${escapeHtml(name)}
          </div>

          <div class="post-date">
            ${escapeHtml(date)}
          </div>

        </div>

      </div>

      ${
        text
        ? `
          <div class="post-text">
            ${escapeHtml(text).replaceAll("\n", "<br>")}
          </div>
        `
        : ""
      }

      ${mediaHTML}

    </article>
  `;

}


/* =========================================================
   SAFE HTTP URL
========================================================= */

function safeHttpUrl(value) {

  if (!value) return "";

  try {

    const url = new URL(String(value));

    if (
      url.protocol === "https:" ||
      url.protocol === "http:"
    ) {
      return url.href;
    }

  } catch (error) {

    return "";

  }

  return "";

}


/* =========================================================
   NAVIGATION
========================================================= */

function go(page) {

  if (!page) return;

  window.location.href = "./" + page;

}


/* =========================================================
   FEATURE CARDS
========================================================= */

document.querySelectorAll(".feature-card").forEach(card => {

  card.addEventListener("click", () => {

    const page = card.dataset.page;

    if (page) {
      go(page);
    }

  });

});


/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

document.querySelectorAll(".nav-item").forEach(item => {

  item.addEventListener("click", () => {

    const page = item.dataset.nav;

    if (page) {
      go(page);
    }

  });

});


/* =========================================================
   HOME BUTTON
========================================================= */

$("homeBtn")?.addEventListener("click", () => {

  go("index.html");

});


/* =========================================================
   LOGOUT
========================================================= */

$("logoutBtn")?.addEventListener("click", async () => {

  try {

    if (currentUser) {

      /*
        Optional: write offline presence here
        if your project has a presence helper.
      */

    }

    await signOut(auth);

    window.location.replace("./login.html");

  } catch (error) {

    console.error("Logout error:", error);

    toast("Logout failed. Please try again.");

  }

});


/* =========================================================
   EDIT PROFILE
========================================================= */

$("editProfileBtn")?.addEventListener("click", () => {

  go("settings.html");

});


/* =========================================================
   SHARE PROFILE
========================================================= */

$("shareProfileBtn")?.addEventListener("click", async () => {

  if (!profileUid) {
    toast("Profile is still loading.");
    return;
  }

  const url = getProfileUrl(profileUid);

  const title =
    $("profileName").textContent || "AYNA BOOK Profile";

  try {

    if (navigator.share) {

      await navigator.share({
        title: "AYNA BOOK Profile",
        text: title,
        url
      });

    } else if (navigator.clipboard?.writeText) {

      await navigator.clipboard.writeText(url);

      toast("Profile link copied.");

    } else {

      toast("Sharing is not supported on this browser.");

    }

  } catch (error) {

    if (error.name !== "AbortError") {

      console.error("Share error:", error);

      toast("Could not share profile.");

    }

  }

});


/* =========================================================
   QR BUTTON
========================================================= */

$("qrButton")?.addEventListener("click", () => {

  const qr = document.querySelector(".qr-card");

  qr?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  toast("ACCOUNT QR is ready.");

});


/* =========================================================
   AUTHENTICATION + EMAIL VERIFICATION
========================================================= */

async function startProfile() {

  try {

    if (authReady) {
      await authReady;
    }

    if (!auth) {
      throw new Error("Firebase Authentication is unavailable.");
    }

    onAuthStateChanged(auth, async user => {

      if (isRedirecting) return;

      if (!user) {

        isRedirecting = true;

        window.location.replace("./login.html");

        return;

      }

      try {

        await reload(user);

        if (!user.emailVerified) {

          isRedirecting = true;

          window.location.replace("./verify-email.html");

          return;

        }

        currentUser = user;

        await loadProfile(user);

        hideLoading();

      } catch (error) {

        console.error("Profile loading error:", error);

        toast(
          error.message || "Profile loading error."
        );

        hideLoading();

      }

    });

  } catch (error) {

    console.error("AYNA BOOK initialization error:", error);

    toast("Firebase connection error.");

    hideLoading();

  }

}


/* =========================================================
   GLOBAL PROFILE API
========================================================= */

window.AYNA_PROFILE = {

  reload: async () => {

    if (!currentUser) {
      throw new Error("No signed-in user.");
    }

    await reload(currentUser);

    if (!currentUser.emailVerified) {
      window.location.replace("./verify-email.html");
      return;
    }

    return loadProfile(currentUser);

  },

  getUser: () => currentProfile,

  getCurrentUser: () => currentUser,

  getProfileUid: () => profileUid

};


/* =========================================================
   START
========================================================= */

showLoading();

startProfile();
