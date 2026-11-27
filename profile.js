// ============================================================
// AYNA BOOK — PROFILE PAGE
// profile.js
// Firebase Auth + Realtime Database
// ============================================================

import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  set,
  update,
  query,
  orderByChild,
  limitToLast,
  onValue
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// GLOBAL
// ============================================================

let currentUser = null;
let currentProfile = null;

const $ = (id) => document.getElementById(id);


// ============================================================
// TOAST
// ============================================================

function toast(message) {

  const box = $("toast");

  if (!box) return;

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.__aynaToastTimer);

  window.__aynaToastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2800);
}


// ============================================================
// NAVIGATION
// ============================================================

function go(page) {
  window.location.href = `./${page}`;
}


// ============================================================
// DEFAULT AVATAR
// ============================================================

function defaultAvatar(name = "AYNA BOOK") {

  return (
    "https://ui-avatars.com/api/" +
    "?name=" +
    encodeURIComponent(name) +
    "&background=071b49" +
    "&color=FFD700" +
    "&size=500"
  );
}


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile(user) {

  currentUser = user;

  const profileRef = ref(database, `users/${user.uid}`);

  try {

    const snapshot = await get(profileRef);

    let profile = {};

    if (snapshot.exists()) {
      profile = snapshot.val() || {};
    }

    currentProfile = profile;

    renderProfile(profile);

    await ensureBasicProfile(user, profile);

  } catch (error) {

    console.error("AYNA PROFILE LOAD ERROR:", error);

    // Auth information can still be shown even if RTDB is temporarily unavailable.

    currentProfile = {};

    renderProfile({
      fullName: user.displayName || "AYNA User",
      email: user.email || "",
      photoURL: user.photoURL || ""
    });

    toast("Profile database loading failed.");
  }
}


// ============================================================
// ENSURE BASIC PROFILE
// ============================================================

async function ensureBasicProfile(user, profile) {

  const updates = {};

  if (!profile.uid) {
    updates.uid = user.uid;
  }

  if (!profile.email && user.email) {
    updates.email = user.email;
  }

  if (!profile.fullName && user.displayName) {
    updates.fullName = user.displayName;
  }

  if (!profile.createdAt) {
    updates.createdAt = Date.now();
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  try {

    await update(
      ref(database, `users/${user.uid}`),
      updates
    );

  } catch (error) {

    console.warn(
      "AYNA PROFILE: Could not complete profile defaults:",
      error
    );
  }
}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderProfile(profile) {

  const name =
    profile.fullName ||
    profile.name ||
    currentUser?.displayName ||
    "AYNA User";

  const email =
    profile.email ||
    currentUser?.email ||
    "";

  const photo =
    profile.photoURL ||
    profile.photoUrl ||
    profile.photo ||
    currentUser?.photoURL ||
    defaultAvatar(name);

  const bio =
    profile.bio ||
    "AYNA BOOK — Connect • Share • Create";

  const posts =
    Number(profile.postCount || profile.postsCount || 0);

  const friends =
    Number(profile.friendCount || profile.friendsCount || 0);

  const followers =
    Number(profile.followerCount || profile.followersCount || 0);

  const following =
    Number(profile.followingCount || profile.followingCount || 0);

  $("profileName").textContent = name;

  $("profileEmail").textContent = email;

  $("profileBio").textContent = bio;

  $("profileAvatar").src = photo;

  $("profileAvatar").onerror = () => {
    $("profileAvatar").src = defaultAvatar(name);
  };

  $("postCount").textContent = posts;

  $("friendCount").textContent = friends;

  $("followerCount").textContent = followers;

  $("followingCount").textContent = following;

  // Verification

  const verified =
    profile.verified === true ||
    profile.isVerified === true ||
    profile.accountType === "business" && profile.businessVerified === true;

  $("verifiedBadge").style.display =
    verified ? "inline-flex" : "none";
}


// ============================================================
// LOAD POSTS
// ============================================================

function loadMyPosts(uid) {

  const postsRef = query(
    ref(database, "posts"),
    orderByChild("uid"),
    limitToLast(50)
  );

  onValue(
    postsRef,
    (snapshot) => {

      const container = $("postsContainer");

      if (!container) return;

      const posts = [];

      snapshot.forEach((child) => {

        const post = child.val() || {};

        if (
          post.uid === uid ||
          post.userId === uid ||
          post.authorUid === uid
        ) {

          posts.push({
            id: child.key,
            ...post
          });
        }

      });

      posts.reverse();

      renderPosts(posts);

      // Update visible count.

      $("postCount").textContent = posts.length;
    },
    (error) => {

      console.error(
        "AYNA PROFILE POSTS ERROR:",
        error
      );

      $("postsContainer").innerHTML = `
        <div class="empty">
          Posts could not be loaded.
        </div>
      `;
    }
  );
}


// ============================================================
// RENDER POSTS
// ============================================================

function renderPosts(posts) {

  const container = $("postsContainer");

  if (!container) return;

  if (!posts.length) {

    container.innerHTML = `
      <div class="empty">
        <div style="font-size:50px;">📝</div>
        <div style="margin-top:10px;">
          You have not created any posts yet.
        </div>
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  posts.forEach((post) => {

    const article = document.createElement("article");

    article.className = "post";

    const text =
      post.text ||
      post.caption ||
      post.content ||
      "";

    const created =
      post.createdAt ||
      post.timestamp ||
      Date.now();

    const time = formatDate(created);

    article.innerHTML = `
      <div class="post-head">

        <img
          class="post-avatar"
          src="${escapeHtml(
            currentProfile?.photoURL ||
            currentProfile?.photoUrl ||
            currentUser?.photoURL ||
            defaultAvatar(
              currentProfile?.fullName ||
              currentUser?.displayName ||
              "AYNA User"
            )
          )}"
          alt=""
        >

        <div>
          <div class="post-author">
            ${escapeHtml(
              currentProfile?.fullName ||
              currentUser?.displayName ||
              "AYNA User"
            )}
          </div>

          <span class="post-time">
            ${escapeHtml(time)}
          </span>
        </div>

      </div>

      ${
        text
          ? `
            <div class="post-text">
              ${escapeHtml(text)}
            </div>
          `
          : ""
      }

      <div class="post-actions">

        <button data-action="like">
          👍 Like
        </button>

        <button data-action="comment">
          💬 Comment
        </button>

        <button data-action="share">
          ↗ Share
        </button>

      </div>
    `;

    article
      .querySelector('[data-action="like"]')
      ?.addEventListener("click", () => {

        toast("Like feature is connected to the post system.");
      });

    article
      .querySelector('[data-action="comment"]')
      ?.addEventListener("click", () => {

        toast("Comment page will open from the post system.");
      });

    article
      .querySelector('[data-action="share"]')
      ?.addEventListener("click", async () => {

        const shareText =
          text ||
          "Check this post on AYNA BOOK.";

        await shareContent(
          "AYNA BOOK",
          shareText,
          window.location.href
        );
      });

    container.appendChild(article);
  });
}


// ============================================================
// DATE
// ============================================================

function formatDate(value) {

  let date;

  if (typeof value === "number") {
    date = new Date(value);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ============================================================
// SHARE
// ============================================================

async function shareContent(title, text, url) {

  try {

    if (navigator.share) {

      await navigator.share({
        title,
        text,
        url
      });

      return;
    }

    await navigator.clipboard.writeText(url);

    toast("Profile link copied.");
  } catch (error) {

    console.log("Share cancelled:", error);
  }
}


// ============================================================
// EDIT PROFILE
// ============================================================

function editProfile() {

  const currentName =
    currentProfile?.fullName ||
    currentUser?.displayName ||
    "";

  const currentBio =
    currentProfile?.bio ||
    "";

  const name = prompt(
    "Full Name",
    currentName
  );

  if (name === null) return;

  const bio = prompt(
    "Bio",
    currentBio
  );

  if (bio === null) return;

  const cleanName = name.trim();

  const cleanBio = bio.trim();

  if (!cleanName) {

    toast("Name cannot be empty.");

    return;
  }

  saveProfileChanges(
    cleanName,
    cleanBio
  );
}


// ============================================================
// SAVE PROFILE
// ============================================================

async function saveProfileChanges(name, bio) {

  if (!currentUser) return;

  try {

    await update(
      ref(database, `users/${currentUser.uid}`),
      {
        fullName: name,
        bio: bio,
        updatedAt: Date.now()
      }
    );

    currentProfile.fullName = name;

    currentProfile.bio = bio;

    renderProfile(currentProfile);

    toast("Profile updated successfully.");

  } catch (error) {

    console.error(
      "AYNA PROFILE UPDATE ERROR:",
      error
    );

    toast(
      "Profile update failed: " +
      (error.message || "Unknown error")
    );
  }
}


// ============================================================
// QR
// ============================================================

function openQR() {

  const uid = currentUser?.uid;

  if (!uid) return;

  const qrData =
    `${window.location.origin}${window.location.pathname}?uid=${encodeURIComponent(uid)}`;

  const qrWindow = window.open(
    "",
    "_blank",
    "width=420,height=620"
  );

  if (!qrWindow) {

    toast("Please allow popup windows.");

    return;
  }

  qrWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AYNA BOOK QR</title>
      <style>
        body{
          margin:0;
          min-height:100vh;
          background:#050914;
          color:white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-family:Arial;
          text-align:center;
        }
        .box{
          padding:25px;
        }
        h1{
          color:#ffd700;
        }
        #qr{
          background:white;
          padding:15px;
          border-radius:15px;
          margin-top:20px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>AYNA BOOK</h1>
        <p>My Profile QR</p>
        <div id="qr"></div>
        <p>${escapeHtml(qrData)}</p>
      </div>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

      <script>
        new QRCode(
          document.getElementById("qr"),
          {
            text:${JSON.stringify(qrData)},
            width:260,
            height:260
          }
        );
      <\/script>
    </body>
    </html>
  `);

  qrWindow.document.close();
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

  try {

    await signOut(auth);

    window.location.replace("./login.html");

  } catch (error) {

    console.error(
      "AYNA LOGOUT ERROR:",
      error
    );

    toast("Logout failed.");
  }
}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

  $("homeBtn")?.addEventListener(
    "click",
    () => go("home.html")
  );

  $("logoutBtn")?.addEventListener(
    "click",
    logout
  );

  $("editProfileBtn")?.addEventListener(
    "click",
    editProfile
  );

  $("shareProfileBtn")?.addEventListener(
    "click",
    () => {

      const uid = currentUser?.uid;

      const url =
        `${window.location.origin}${window.location.pathname}?uid=${encodeURIComponent(uid || "")}`;

      shareContent(
        "AYNA BOOK Profile",
        "View my AYNA BOOK profile.",
        url
      );
    }
  );

  $("qrBtn")?.addEventListener(
    "click",
    openQR
  );


  // Profile sections

  $("aboutBtn")?.addEventListener(
    "click",
    () => toast("About section is ready.")
  );

  $("photosBtn")?.addEventListener(
    "click",
    () => go("media.html")
  );

  $("videosBtn")?.addEventListener(
    "click",
    () => go("media.html")
  );

  $("reelsBtn")?.addEventListener(
    "click",
    () => go("reels.html")
  );

  $("storiesBtn")?.addEventListener(
    "click",
    () => toast("Stories page will be connected.")
  );

  $("memoriesBtn")?.addEventListener(
    "click",
    () => toast("Memories section is ready.")
  );

  $("friendsBtn")?.addEventListener(
    "click",
    () => go("friends.html")
  );

  $("followersBtn")?.addEventListener(
    "click",
    () => toast("Followers section is ready.")
  );


  // Account

  $("securityBtn")?.addEventListener(
    "click",
    () => go("security.html")
  );

  $("settingsBtn")?.addEventListener(
    "click",
    () => go("settings.html")
  );

  $("privacyBtn")?.addEventListener(
    "click",
    () => go("settings.html")
  );

  $("notificationsBtn")?.addEventListener(
    "click",
    () => go("notifications.html")
  );


  // Bottom navigation

  $("bottomHome")?.addEventListener(
    "click",
    () => go("home.html")
  );

  $("bottomFriends")?.addEventListener(
    "click",
    () => go("friends.html")
  );

  $("bottomMessenger")?.addEventListener(
    "click",
    () => go("messenger.html")
  );

  $("bottomReels")?.addEventListener(
    "click",
    () => go("reels.html")
  );

  $("bottomSettings")?.addEventListener(
    "click",
    () => go("settings.html")
  );
}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace("./login.html");

      return;
    }

    currentUser = user;

    await loadProfile(user);

    loadMyPosts(user.uid);
  },
  (error) => {

    console.error(
      "AYNA AUTH STATE ERROR:",
      error
    );

    window.location.replace("./login.html");
  }
);


// ============================================================
// START
// ============================================================

setupButtons();


// ============================================================
// PUBLIC API
// ============================================================

window.AYNA_PROFILE = {

  getUser: () => currentUser,

  getProfile: () => currentProfile,

  reload: async () => {

    if (currentUser) {
      await loadProfile(currentUser);
    }
  }

};

console.log(
  "AYNA BOOK PROFILE: Ready."
);