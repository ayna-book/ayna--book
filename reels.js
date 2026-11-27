
// ============================================================
// AYNA BOOK — REELS.JS
// Full-screen Reels • Firebase RTDB • Like • Comment • Share
// Save • Follow • Auto Play • Mute • Fullscreen • Double Tap
// ============================================================

import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  query,
  orderByChild,
  limitToLast,
  onValue,
  push,
  set,
  get,
  update,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";


// ============================================================
// CONFIG
// ============================================================

const REELS_PATH = "reels";
const COMMENTS_PATH = "reelComments";

const MAX_REELS = 50;


// ============================================================
// STATE
// ============================================================

let currentUser = null;
let reels = [];
let activeReelId = null;
let globalMuted = true;

const likedReels = new Set();
const savedReels = new Set();
const followedUsers = new Set();


// ============================================================
// DOM
// ============================================================

const container =
  document.getElementById("reelsContainer");

const loading =
  document.getElementById("loading");

const emptyState =
  document.getElementById("emptyState");

const commentPanel =
  document.getElementById("commentPanel");

const commentsList =
  document.getElementById("commentsList");

const commentForm =
  document.getElementById("commentForm");

const commentInput =
  document.getElementById("commentInput");

const closeCommentsBtn =
  document.getElementById("closeComments");

const homeBtn =
  document.getElementById("homeBtn");

const createBtn =
  document.getElementById("createBtn");


// ============================================================
// HELPERS
// ============================================================

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatCount(number) {
  const n = Number(number || 0);

  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(1) + "B";
  }

  if (n >= 1000000) {
    return (n / 1000000).toFixed(1) + "M";
  }

  if (n >= 1000) {
    return (n / 1000).toFixed(1) + "K";
  }

  return String(n);
}


function showToast(message) {
  let toast = document.getElementById("aynaToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "aynaToast";

    toast.style.cssText = `
      position:fixed;
      left:50%;
      bottom:30px;
      transform:translateX(-50%);
      z-index:99999;
      background:#071b49;
      color:#fff;
      border:2px solid #ffd700;
      border-radius:16px;
      padding:16px 22px;
      font-size:20px;
      font-weight:800;
      text-align:center;
      box-shadow:0 10px 35px rgba(0,0,0,.5);
      max-width:90%;
    `;

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";

  clearTimeout(window.__aynaToastTimer);

  window.__aynaToastTimer =
    setTimeout(() => {
      toast.style.display = "none";
    }, 2500);
}


function getUserName() {
  return (
    currentUser?.displayName ||
    currentUser?.email?.split("@")[0] ||
    "AYNA User"
  );
}


function getUserPhoto() {
  return currentUser?.photoURL || "";
}


// ============================================================
// NORMALIZE REEL
// ============================================================

function normalizeReel(id, data) {
  const item = data || {};

  return {
    id,

    authorUid:
      item.authorUid ||
      item.uid ||
      item.userId ||
      "",

    authorName:
      item.authorName ||
      item.fullName ||
      item.userName ||
      "AYNA User",

    authorPhoto:
      item.authorPhoto ||
      item.photoURL ||
      item.avatar ||
      "",

    caption:
      item.caption ||
      item.text ||
      "",

    videoUrl:
      item.videoUrl ||
      item.mediaUrl ||
      item.url ||
      "",

    music:
      item.music ||
      "",

    likesCount:
      Number(item.likesCount || item.likes || 0),

    commentsCount:
      Number(item.commentsCount || item.comments || 0),

    sharesCount:
      Number(item.sharesCount || item.shares || 0),

    createdAt:
      item.createdAt || 0
  };
}


// ============================================================
// LOAD REELS
// ============================================================

function loadReels() {
  if (!database) {
    showError("Firebase Database পাওয়া যায়নি।");
    return;
  }

  const reelsRef = query(
    ref(database, REELS_PATH),
    orderByChild("createdAt"),
    limitToLast(MAX_REELS)
  );

  onValue(
    reelsRef,
    snapshot => {
      reels = [];

      snapshot.forEach(child => {
        const reel = normalizeReel(
          child.key,
          child.val()
        );

        if (reel.videoUrl) {
          reels.push(reel);
        }
      });

      reels.reverse();

      renderReels();
    },
    error => {
      console.error(
        "AYNA REELS LOAD ERROR:",
        error
      );

      showError(
        "Reels লোড করা যায়নি। Firebase Rules পরীক্ষা করুন।"
      );
    }
  );
}


// ============================================================
// RENDER REELS
// ============================================================

function renderReels() {
  if (!container) return;

  container.innerHTML = "";

  if (loading) {
    loading.style.display = "none";
  }

  if (!reels.length) {
    if (emptyState) {
      emptyState.style.display = "flex";
    }

    return;
  }

  if (emptyState) {
    emptyState.style.display = "none";
  }

  reels.forEach(reel => {
    const article =
      createReelElement(reel);

    container.appendChild(article);
  });

  setupVideoObservers();
  setupDoubleTap();
}


// ============================================================
// CREATE REEL
// ============================================================

function createReelElement(reel) {
  const article =
    document.createElement("article");

  article.className = "reel";
  article.dataset.reelId = reel.id;

  const photo =
    reel.authorPhoto ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      reel.authorName
    )}&background=071b49&color=ffffff&size=256`;

  article.innerHTML = `
    <video
      class="reel-video"
      src="${escapeHTML(reel.videoUrl)}"
      playsinline
      loop
      preload="metadata"
      muted
    ></video>

    <div class="reel-gradient"></div>

    <div class="reel-top">
      <div class="reel-badge">
        AYNA REELS
      </div>

      <button
        class="reel-mute"
        type="button"
        title="Sound"
      >
        🔇
      </button>
    </div>


    <div class="reel-bottom">

      <div class="reel-author">

        <img
          class="reel-avatar"
          src="${photo}"
          alt=""
        />

        <div class="reel-author-info">

          <div class="reel-author-name">
            ${escapeHTML(reel.authorName)}
          </div>

          <button
            class="follow-btn"
            type="button"
            data-follow="${escapeHTML(reel.authorUid)}"
          >
            ${
              followedUsers.has(reel.authorUid)
                ? "Following"
                : "Follow"
            }
          </button>

        </div>

      </div>


      <div class="reel-caption">
        ${escapeHTML(reel.caption)}
      </div>


      ${
        reel.music
          ? `
            <div class="reel-music">
              🎵 ${escapeHTML(reel.music)}
            </div>
          `
          : ""
      }

    </div>


    <div class="reel-actions">

      <button
        class="reel-action like-btn"
        type="button"
        data-action="like"
      >
        <span class="action-icon">
          ${likedReels.has(reel.id) ? "❤️" : "🤍"}
        </span>

        <span class="action-count">
          ${formatCount(reel.likesCount)}
        </span>
      </button>


      <button
        class="reel-action comment-btn"
        type="button"
        data-action="comment"
      >
        <span class="action-icon">
          💬
        </span>

        <span class="action-count">
          ${formatCount(reel.commentsCount)}
        </span>
      </button>


      <button
        class="reel-action share-btn"
        type="button"
        data-action="share"
      >
        <span class="action-icon">
          ↗️
        </span>

        <span class="action-count">
          ${formatCount(reel.sharesCount)}
        </span>
      </button>


      <button
        class="reel-action save-btn"
        type="button"
        data-action="save"
      >
        <span class="action-icon">
          ${savedReels.has(reel.id) ? "🔖" : "📑"}
        </span>

        <span class="action-count">
          Save
        </span>
      </button>


      <button
        class="reel-action fullscreen-btn"
        type="button"
        data-action="fullscreen"
      >
        <span class="action-icon">
          ⛶
        </span>

        <span class="action-count">
          Full
        </span>
      </button>

    </div>
  `;


  // ==========================================================
  // BUTTON EVENTS
  // ==========================================================

  const likeBtn =
    article.querySelector(".like-btn");

  const commentBtn =
    article.querySelector(".comment-btn");

  const shareBtn =
    article.querySelector(".share-btn");

  const saveBtn =
    article.querySelector(".save-btn");

  const fullscreenBtn =
    article.querySelector(".fullscreen-btn");

  const muteBtn =
    article.querySelector(".reel-mute");

  const followBtn =
    article.querySelector(".follow-btn");


  likeBtn?.addEventListener(
    "click",
    () => toggleLike(reel, article)
  );


  commentBtn?.addEventListener(
    "click",
    () => openComments(reel)
  );


  shareBtn?.addEventListener(
    "click",
    () => shareReel(reel)
  );


  saveBtn?.addEventListener(
    "click",
    () => toggleSave(reel, article)
  );


  fullscreenBtn?.addEventListener(
    "click",
    () => fullscreenVideo(article)
  );


  muteBtn?.addEventListener(
    "click",
    () => toggleGlobalMute()
  );


  followBtn?.addEventListener(
    "click",
    () => toggleFollow(reel, article)
  );


  return article;
}


// ============================================================
// LIKE
// ============================================================

async function toggleLike(reel, article) {
  if (!currentUser) {
    showToast("লাইক দিতে আগে Login করুন।");
    return;
  }

  const alreadyLiked =
    likedReels.has(reel.id);

  const nextCount =
    Math.max(
      0,
      reel.likesCount +
      (alreadyLiked ? -1 : 1)
    );

  try {
    await update(
      ref(database, `${REELS_PATH}/${reel.id}`),
      {
        likesCount: nextCount
      }
    );

    reel.likesCount = nextCount;

    if (alreadyLiked) {
      likedReels.delete(reel.id);
    } else {
      likedReels.add(reel.id);
    }

    updateLikeUI(reel, article);

  } catch (error) {
    console.error(
      "LIKE ERROR:",
      error
    );

    showToast("Like করা যায়নি।");
  }
}


function updateLikeUI(reel, article) {
  const icon =
    article.querySelector(".like-btn .action-icon");

  const count =
    article.querySelector(".like-btn .action-count");

  if (icon) {
    icon.textContent =
      likedReels.has(reel.id)
        ? "❤️"
        : "🤍";
  }

  if (count) {
    count.textContent =
      formatCount(reel.likesCount);
  }
}


// ============================================================
// SAVE
// ============================================================

function toggleSave(reel, article) {
  if (!currentUser) {
    showToast("Save করতে আগে Login করুন।");
    return;
  }

  if (savedReels.has(reel.id)) {
    savedReels.delete(reel.id);
    showToast("Reel Saved list থেকে সরানো হয়েছে।");
  } else {
    savedReels.add(reel.id);
    showToast("Reel Saved হয়েছে।");
  }

  const icon =
    article.querySelector(".save-btn .action-icon");

  if (icon) {
    icon.textContent =
      savedReels.has(reel.id)
        ? "🔖"
        : "📑";
  }
}


// ============================================================
// FOLLOW
// ============================================================

function toggleFollow(reel, article) {
  if (!currentUser) {
    showToast("Follow করতে আগে Login করুন।");
    return;
  }

  if (!reel.authorUid) {
    showToast("এই Creator-এর UID পাওয়া যায়নি।");
    return;
  }

  if (reel.authorUid === currentUser.uid) {
    showToast("নিজেকে Follow করা যাবে না।");
    return;
  }

  if (followedUsers.has(reel.authorUid)) {
    followedUsers.delete(reel.authorUid);
    showToast("Unfollow করা হয়েছে।");
  } else {
    followedUsers.add(reel.authorUid);
    showToast("Creator Follow করা হয়েছে।");
  }

  const button =
    article.querySelector(".follow-btn");

  if (button) {
    button.textContent =
      followedUsers.has(reel.authorUid)
        ? "Following"
        : "Follow";
  }
}


// ============================================================
// SHARE
// ============================================================

async function shareReel(reel) {
  const shareUrl =
    new URL(
      `reels.html?reel=${encodeURIComponent(reel.id)}`,
      window.location.href
    ).href;

  const shareData = {
    title: `AYNA REELS — ${reel.authorName}`,
    text: reel.caption || "Watch this AYNA Reel",
    url: shareUrl
  };

  try {
    if (
      navigator.share &&
      typeof navigator.share === "function"
    ) {
      await navigator.share(shareData);

      await increaseShareCount(reel);

      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        shareUrl
      );

      await increaseShareCount(reel);

      showToast(
        "Reel link copied হয়েছে।"
      );

      return;
    }

    showToast(
      "এই ডিভাইসে Share সুবিধা পাওয়া যায়নি।"
    );

  } catch (error) {

    if (error?.name === "AbortError") {
      return;
    }

    console.error(
      "SHARE ERROR:",
      error
    );
  }
}


async function increaseShareCount(reel) {
  try {
    const next =
      Number(reel.sharesCount || 0) + 1;

    await update(
      ref(database, `${REELS_PATH}/${reel.id}`),
      {
        sharesCount: next
      }
    );

    reel.sharesCount = next;

  } catch (error) {
    console.warn(
      "Share count update failed:",
      error
    );
  }
}


// ============================================================
// COMMENTS
// ============================================================

async function openComments(reel) {
  activeReelId = reel.id;

  if (!commentPanel) return;

  commentPanel.classList.add("open");

  if (commentsList) {
    commentsList.innerHTML = `
      <div class="comments-loading">
        Comments loading...
      </div>
    `;
  }

  await loadComments(reel.id);
}


function closeComments() {
  activeReelId = null;

  if (commentPanel) {
    commentPanel.classList.remove("open");
  }

  if (commentsList) {
    commentsList.innerHTML = "";
  }
}


async function loadComments(reelId) {
  if (!commentsList) return;

  try {
    const snapshot =
      await get(
        ref(
          database,
          `${COMMENTS_PATH}/${reelId}`
        )
      );

    commentsList.innerHTML = "";

    if (!snapshot.exists()) {
      commentsList.innerHTML = `
        <div class="no-comments">
          এখনো কোনো মন্তব্য নেই।
        </div>
      `;

      return;
    }

    const comments = [];

    snapshot.forEach(child => {
      comments.push({
        id: child.key,
        ...child.val()
      });
    });

    comments.sort(
      (a, b) =>
        Number(a.createdAt || 0) -
        Number(b.createdAt || 0)
    );

    comments.forEach(comment => {
      const item =
        document.createElement("div");

      item.className =
        "comment-item";

      const photo =
        comment.userPhoto ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          comment.userName || "User"
        )}&background=071b49&color=ffffff&size=128`;

      item.innerHTML = `
        <img
          class="comment-avatar"
          src="${photo}"
          alt=""
        />

        <div class="comment-body">

          <div class="comment-name">
            ${escapeHTML(
              comment.userName || "AYNA User"
            )}
          </div>

          <div class="comment-text">
            ${escapeHTML(
              comment.text || ""
            )}
          </div>

        </div>
      `;

      commentsList.appendChild(item);
    });

  } catch (error) {
    console.error(
      "COMMENTS LOAD ERROR:",
      error
    );

    commentsList.innerHTML = `
      <div class="no-comments">
        Comments লোড করা যায়নি।
      </div>
    `;
  }
}


// ============================================================
// ADD COMMENT
// ============================================================

async function submitComment(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast(
      "Comment করতে আগে Login করুন।"
    );
    return;
  }

  if (!activeReelId) {
    return;
  }

  const text =
    commentInput?.value.trim();

  if (!text) {
    return;
  }

  if (text.length > 1000) {
    showToast(
      "Comment সর্বোচ্চ 1000 অক্ষর হতে পারে।"
    );
    return;
  }

  try {
    const commentRef =
      push(
        ref(
          database,
          `${COMMENTS_PATH}/${activeReelId}`
        )
      );

    await set(
      commentRef,
      {
        uid: currentUser.uid,

        userName:
          getUserName(),

        userPhoto:
          getUserPhoto(),

        text,

        createdAt:
          serverTimestamp()
      }
    );

    commentInput.value = "";

    showToast("Comment যোগ হয়েছে।");

    const reel =
      reels.find(
        item =>
          item.id === activeReelId
      );

    if (reel) {
      reel.commentsCount =
        Number(reel.commentsCount || 0) + 1;

      try {
        await update(
          ref(
            database,
            `${REELS_PATH}/${activeReelId}`
          ),
          {
            commentsCount:
              reel.commentsCount
          }
        );
      } catch (error) {
        console.warn(
          "Comment count update failed:",
          error
        );
      }
    }

    await loadComments(
      activeReelId
    );

  } catch (error) {
    console.error(
      "COMMENT ERROR:",
      error
    );

    showToast(
      "Comment যোগ করা যায়নি।"
    );
  }
}


// ============================================================
// GLOBAL MUTE
// ============================================================

function toggleGlobalMute() {
  globalMuted = !globalMuted;

  const videos =
    document.querySelectorAll(
      ".reel-video"
    );

  videos.forEach(video => {
    video.muted =
      globalMuted;
  });

  document
    .querySelectorAll(".reel-mute")
    .forEach(button => {
      button.textContent =
        globalMuted
          ? "🔇"
          : "🔊";
    });

  showToast(
    globalMuted
      ? "Sound Off"
      : "Sound On"
  );
}


// ============================================================
// VIDEO OBSERVER
// ============================================================

function setupVideoObservers() {
  const videos =
    document.querySelectorAll(
      ".reel-video"
    );

  if (!videos.length) return;

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          const video =
            entry.target;

          if (entry.isIntersecting) {

            document
              .querySelectorAll(
                ".reel-video"
              )
              .forEach(other => {
                if (other !== video) {
                  other.pause();
                }
              });

            video.muted =
              globalMuted;

            video
              .play()
              .catch(() => {});

            const article =
              video.closest(".reel");

            if (article) {
              activeReelId =
                article.dataset.reelId;
            }

          } else {
            video.pause();
          }

        });

      },
      {
        threshold: 0.75
      }
    );


  videos.forEach(video => {
    observer.observe(video);
  });
}


// ============================================================
// DOUBLE TAP LIKE
// ============================================================

function setupDoubleTap() {
  const reelsElements =
    document.querySelectorAll(
      ".reel"
    );

  reelsElements.forEach(article => {

    let lastTap = 0;

    article.addEventListener(
      "touchend",
      event => {

        const now =
          Date.now();

        if (
          now - lastTap <
          350
        ) {

          const reel =
            reels.find(
              item =>
                item.id ===
                article.dataset.reelId
            );

          if (reel) {
            toggleLike(
              reel,
              article
            );

            showHeartAnimation(
              article
            );
          }

        }

        lastTap = now;

      },
      {
        passive: true
      }
    );

  });
}


// ============================================================
// HEART ANIMATION
// ============================================================

function showHeartAnimation(article) {
  const heart =
    document.createElement("div");

  heart.textContent = "❤️";

  heart.style.cssText = `
    position:absolute;
    left:50%;
    top:50%;
    transform:translate(-50%,-50%) scale(.3);
    z-index:20;
    font-size:120px;
    pointer-events:none;
    opacity:0;
    transition:
      transform .25s ease,
      opacity .25s ease;
  `;

  article.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.opacity = "1";
    heart.style.transform =
      "translate(-50%,-50%) scale(1)";
  });

  setTimeout(() => {
    heart.style.opacity = "0";
    heart.style.transform =
      "translate(-50%,-50%) scale(1.4)";
  }, 450);

  setTimeout(() => {
    heart.remove();
  }, 750);
}


// ============================================================
// FULLSCREEN
// ============================================================

async function fullscreenVideo(article) {
  const video =
    article?.querySelector(
      ".reel-video"
    );

  if (!video) return;

  try {

    if (
      document.fullscreenElement
    ) {

      await document.exitFullscreen();

      return;
    }

    if (
      video.requestFullscreen
    ) {

      await video.requestFullscreen();

      return;
    }

    if (
      video.webkitEnterFullscreen
    ) {

      video.webkitEnterFullscreen();

      return;
    }

  } catch (error) {
    console.warn(
      "Fullscreen failed:",
      error
    );
  }
}


// ============================================================
// ERROR SCREEN
// ============================================================

function showError(message) {
  if (!container) return;

  if (loading) {
    loading.style.display =
      "none";
  }

  if (emptyState) {
    emptyState.style.display =
      "none";
  }

  container.innerHTML = `
    <div
      style="
        min-height:70vh;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        padding:30px;
      "
    >
      <div>

        <div
          style="
            font-size:70px;
            margin-bottom:20px;
          "
        >
          ⚠️
        </div>

        <div
          style="
            font-size:28px;
            font-weight:900;
            color:#ffd700;
            margin-bottom:15px;
          "
        >
          AYNA REELS
        </div>

        <div
          style="
            font-size:21px;
            line-height:1.5;
            color:#fff;
          "
        >
          ${escapeHTML(message)}
        </div>

      </div>
    </div>
  `;
}


// ============================================================
// NAVIGATION
// ============================================================

homeBtn?.addEventListener(
  "click",
  () => {
    window.location.href =
      "./home.html";
  }
);


createBtn?.addEventListener(
  "click",
  () => {
    window.location.href =
      "./media.html";
  }
);


closeCommentsBtn?.addEventListener(
  "click",
  closeComments
);


commentForm?.addEventListener(
  "submit",
  submitComment
);


// ============================================================
// ESC KEY
// ============================================================

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      if (
        commentPanel?.classList.contains(
          "open"
        )
      ) {
        closeComments();
      }

    }

  }
);


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
  auth,
  user => {

    currentUser = user || null;

    if (!user) {
      showToast(
        "Reels দেখতে Login করা প্রয়োজন হতে পারে।"
      );
    }

    loadReels();

  },
  error => {

    console.error(
      "AUTH STATE ERROR:",
      error
    );

    currentUser = null;

    loadReels();
  }
);


// ============================================================
// PUBLIC API
// ============================================================

window.AYNA_REELS = {

  reload() {
    loadReels();
  },

  getReels() {
    return reels;
  },

  getActiveReelId() {
    return activeReelId;
  },

  toggleMute() {
    toggleGlobalMute();
  },

  closeComments() {
    closeComments();
  },

  openComments(reelId) {

    const reel =
      reels.find(
        item =>
          item.id === reelId
      );

    if (reel) {
      openComments(reel);
    }
  },

  async like(reelId) {

    const reel =
      reels.find(
        item =>
          item.id === reelId
      );

    const article =
      document.querySelector(
        `.reel[data-reel-id="${CSS.escape(
          reelId
        )}"]`
      );

    if (reel && article) {
      await toggleLike(
        reel,
        article
      );
    }
  }

};


// ============================================================
// PAGE READY
// ============================================================

console.log(
  "AYNA BOOK — reels.js loaded successfully."
);