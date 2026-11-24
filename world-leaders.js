import { auth, database } from "./firebase-init.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
  ref,
  get,
  push,
  set,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-database.js";

// ==================================================
// STATE & DOM HELPERS
// ==================================================

let currentUser = null;
let userProfile = {};
let allLeaders = [];

const $ = (id) => document.getElementById(id);

function showNotice(message) {
  const box = $("notice");
  if (box) {
    box.textContent = message;
    box.style.display = "block";
    clearTimeout(showNotice.timer);
    showNotice.timer = setTimeout(() => {
      box.style.display = "none";
    }, 3000);
  } else {
    alert(message);
  }
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function defaultAvatar() {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" fill="#0a1636"/><circle cx="48" cy="36" r="18" fill="#ffd700"/><path d="M14 96 Q20 62 48 62 Q76 62 82 96" fill="#ffd700"/></svg>'
    )
  );
}

// ==================================================
// AUTHENTICATION CHECK
// ==================================================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  const submitBtn = $("addLeaderBtn");
  if (!user) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "🔒 তথ্য যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "🚀 বিশ্বনেতা তালিকায় যুক্ত করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile fetch error:", err);
  }
});

// ==================================================
// ADD NEW WORLD LEADER
// ==================================================

const addLeaderBtn = $("addLeaderBtn");
if (addLeaderBtn) {
  addLeaderBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showNotice("তথ্য যুক্ত করতে আগে লগইন করুন।");
      return;
    }

    const country = $("leaderCountry")?.value.trim() || "";
    const name = $("leaderName")?.value.trim() || "";
    const role = $("leaderRole")?.value.trim() || "বিশ্বনেতা";
    const photo = $("leaderPhoto")?.value.trim() || "";
    const bio = $("leaderBio")?.value.trim() || "";

    if (!name || !country) {
      showNotice("অনুগ্রহ করে নেতার নাম এবং দেশ লিখুন।");
      return;
    }

    addLeaderBtn.disabled = true;
    addLeaderBtn.textContent = "যুক্ত করা হচ্ছে...";

    try {
      const leaderRef = push(ref(database, "worldLeaders"));

      await set(leaderRef, {
        country,
        name,
        role,
        photo,
        bio,
        uid: currentUser.uid,
        addedBy:
          userProfile.fullName ||
          currentUser.displayName ||
          currentUser.email ||
          "AYNA Member",
        createdAt: Date.now()
      });

      if ($("leaderCountry")) $("leaderCountry").value = "";
      if ($("leaderName")) $("leaderName").value = "";
      if ($("leaderRole")) $("leaderRole").value = "";
      if ($("leaderPhoto")) $("leaderPhoto").value = "";
      if ($("leaderBio")) $("leaderBio").value = "";

      showNotice("বিশ্বনেতা তালিকায় সফলভাবে যুক্ত হয়েছে!");
    } catch (error) {
      console.error("Add leader error:", error);
      showNotice(
        error.code === "PERMISSION_DENIED"
          ? "Firebase Rules অনুমতি দেয়নি।"
          : "তথ্য যুক্ত করা যায়নি।"
      );
    } finally {
      addLeaderBtn.disabled = false;
      addLeaderBtn.textContent = "🚀 বিশ্বনেতা তালিকায় যুক্ত করুন";
    }
  });
}

// ==================================================
// REALTIME LISTENER & FILTERING
// ==================================================

const countryFilterEl = $("leaderCountryFilter");
if (countryFilterEl) {
  countryFilterEl.addEventListener("input", renderLeaders);
}

const searchInputEl = $("leaderSearch");
if (searchInputEl) {
  searchInputEl.addEventListener("input", renderLeaders);
}

onValue(
  ref(database, "worldLeaders"),
  (snapshot) => {
    const data = snapshot.val() || {};
    allLeaders = Object.entries(data)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    renderLeaders();
  },
  (error) => {
    console.error("World leaders load error:", error);
    const container = $("leadersList");
    if (container) {
      container.innerHTML =
        '<div class="gold-3d box-pad">তথ্য লোড করা যায়নি। Firebase Rules পরীক্ষা করুন।</div>';
    }
  }
);

function renderLeaders() {
  const container = $("leadersList");
  if (!container) return;

  const countryQ = countryFilterEl ? countryFilterEl.value.trim().toLowerCase() : "";
  const searchQ = searchInputEl ? searchInputEl.value.trim().toLowerCase() : "";

  const filtered = allLeaders.filter((item) => {
    const matchCountry =
      !countryQ || (item.country && item.country.toLowerCase().includes(countryQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.role && item.role.toLowerCase().includes(searchQ)) ||
      (item.bio && item.bio.toLowerCase().includes(searchQ)) ||
      (item.country && item.country.toLowerCase().includes(searchQ));

    return matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad">কোনো বিশ্বনেতার তথ্য পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d leader-card";
    const isOwner = currentUser && item.uid === currentUser.uid;

    card.innerHTML = `
      <div class="leader-top">
        <img class="leader-photo" src="${escapeHTML(item.photo || defaultAvatar())}" alt="${escapeHTML(item.name)}" loading="lazy">
        <div>
          <div class="leader-name">${escapeHTML(item.name)}</div>
          <div class="leader-role">${escapeHTML(item.role || "")}</div>
          <div class="leader-country">🌍 ${escapeHTML(item.country || "")}</div>
        </div>
      </div>
      <p class="leader-bio">${escapeHTML(item.bio || "")}</p>
      ${
        isOwner
          ? `<button type="button" class="del-leader-btn" data-id="${escapeHTML(item.id)}" style="margin-top:12px;padding:8px 14px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
          : ""
      }
    `;

    if (isOwner) {
      card
        .querySelector(".del-leader-btn")
        ?.addEventListener("click", () => deleteLeader(item.id));
    }

    container.appendChild(card);
  });
}

// ==================================================
// DELETE OWN ENTRY
// ==================================================

async function deleteLeader(leaderId) {
  if (!currentUser) return;
  if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;

  try {
    await remove(ref(database, `worldLeaders/${leaderId}`));
    showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
  } catch (error) {
    console.error("Delete leader error:", error);
    showNotice("মুছে ফেলা যায়নি।");
  }
}