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
let allResearch = [];

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

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString("bn-BD");
  } catch (err) {
    return "";
  }
}

// ==================================================
// AUTHENTICATION CHECK
// ==================================================

onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  const submitBtn = $("publishResearchBtn");
  if (!user) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "🔒 গবেষণা যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = "📌 গবেষণাগার তালিকায় যুক্ত করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile fetch error:", err);
  }
});

// ==================================================
// PUBLISH NEW RESEARCH ARTICLE / ENTRY
// ==================================================

const publishBtn = $("publishResearchBtn");
if (publishBtn) {
  publishBtn.addEventListener("click", async () => {
    if (!currentUser) {
      showNotice("গবেষণা যুক্ত করতে আগে লগইন করুন।");
      return;
    }

    const topic = $("researchTopic")?.value || "কুরআন ও হাদিস";
    const country = $("researchCountry")?.value.trim() || "আন্তর্জাতিক";
    const title = $("researchTitle")?.value.trim() || "";
    const scholar =
      $("researchScholar")?.value.trim() ||
      userProfile.fullName ||
      currentUser.displayName ||
      "আলেম সমাজ";
    const summary = $("researchSummary")?.value.trim() || "";

    if (!title || !summary) {
      showNotice("অনুগ্রহ করে গবেষণার শিরোনাম এবং সারসংক্ষেপ লিখুন।");
      return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = "যুক্ত করা হচ্ছে...";

    try {
      const researchRef = push(ref(database, "ulemaResearch"));

      await set(researchRef, {
        topic,
        country,
        title,
        scholar,
        summary,
        uid: currentUser.uid,
        submittedBy:
          userProfile.fullName ||
          currentUser.displayName ||
          currentUser.email ||
          "AYNA Member",
        createdAt: Date.now()
      });

      if ($("researchCountry")) $("researchCountry").value = "";
      if ($("researchTitle")) $("researchTitle").value = "";
      if ($("researchScholar")) $("researchScholar").value = "";
      if ($("researchSummary")) $("researchSummary").value = "";

      showNotice("বিশ্ব আলেম সমাজ গবেষণাগারে সফলভাবে যুক্ত হয়েছে!");
    } catch (error) {
      console.error("Research publish error:", error);
      showNotice(
        error.code === "PERMISSION_DENIED"
          ? "Firebase Rules অনুমতি দেয়নি।"
          : "গবেষণা যুক্ত করা যায়নি।"
      );
    } finally {
      publishBtn.disabled = false;
      publishBtn.textContent = "📌 গবেষণাগার তালিকায় যুক্ত করুন";
    }
  });
}

// ==================================================
// REALTIME LISTENER & FILTERING
// ==================================================

const topicFilterEl = $("topicFilter");
if (topicFilterEl) {
  topicFilterEl.addEventListener("change", renderResearch);
}

const searchInputEl = $("researchSearch");
if (searchInputEl) {
  searchInputEl.addEventListener("input", renderResearch);
}

onValue(
  ref(database, "ulemaResearch"),
  (snapshot) => {
    const data = snapshot.val() || {};
    allResearch = Object.entries(data)
      .map(([id, item]) => ({ id, ...item }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    renderResearch();
  },
  (error) => {
    console.error("Research load error:", error);
    const container = $("researchList");
    if (container) {
      container.innerHTML =
        '<div class="gold-3d box-pad">তথ্য লোড করা যায়নি। Firebase Rules পরীক্ষা করুন।</div>';
    }
  }
);

function renderResearch() {
  const container = $("researchList");
  if (!container) return;

  const selectedTopic = topicFilterEl ? topicFilterEl.value : "ALL";
  const query = searchInputEl ? searchInputEl.value.trim().toLowerCase() : "";

  const filtered = allResearch.filter((item) => {
    const matchTopic = selectedTopic === "ALL" || item.topic === selectedTopic;
    const matchQuery =
      !query ||
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.scholar && item.scholar.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query)) ||
      (item.country && item.country.toLowerCase().includes(query));

    return matchTopic && matchQuery;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad">এই বিষয়ে বা অনুসন্ধানে এখনও কোনো গবেষণা পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const article = document.createElement("article");
    article.className = "gold-3d research-card";

    const isOwner = currentUser && item.uid === currentUser.uid;
    const dateLabel = formatDate(item.createdAt);

    article.innerHTML = `
      <div class="research-meta">
        📖 ${escapeHTML(item.topic || "সাধারণ")} • 🌍 ${escapeHTML(item.country || "আন্তর্জাতিক")}
        ${dateLabel ? ` • 📅 ${escapeHTML(dateLabel)}` : ""}
      </div>
      <h3 class="research-title">${escapeHTML(item.title)}</h3>
      <p class="research-body">${escapeHTML(item.summary)}</p>
      <div class="research-author">
        গবেষক / আলেম: <strong>${escapeHTML(item.scholar || "আলেম সমাজ")}</strong>
      </div>
      ${
        isOwner
          ? `<button type="button" class="delete-research-btn" data-id="${escapeHTML(item.id)}" style="margin-top:12px;padding:9px 14px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;">🗑️ মুছে ফেলুন</button>`
          : ""
      }
    `;

    if (isOwner) {
      article
        .querySelector(".delete-research-btn")
        ?.addEventListener("click", () => deleteResearchItem(item.id));
    }

    container.appendChild(article);
  });
}

// ==================================================
// DELETE OWN RESEARCH ENTRY
// ==================================================

async function deleteResearchItem(itemId) {
  if (!currentUser) return;
  if (!confirm("আপনি কি নিশ্চিতভাবে এই গবেষণাটি মুছে ফেলতে চান?")) return;

  try {
    await remove(ref(database, `ulemaResearch/${itemId}`));
    showNotice("গবেষণাটি মুছে ফেলা হয়েছে।");
  } catch (error) {
    console.error("Delete error:", error);
    showNotice("মুছে ফেলা যায়নি।");
  }
}