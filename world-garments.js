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
// AYNA BOOK - WORLD GARMENTS OWNERS & WORKERS (world-garments.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const DEFAULT_GARMENT_ENTRIES = [
  {
    id: "wg1",
    category: "গার্মেন্টস মালিক / বায়ার",
    country: "বাংলাদেশ ও আন্তর্জাতিক",
    name: "রপ্তানিমুখী নিট ও ওভেন ফ্যাক্টরি ডেস্ক",
    role: "গার্মেন্টস মালিক ও উৎপাদন সমন্বয়",
    contact: "",
    need: "বায়ার অর্ডার, কমপ্লায়েন্স ও উৎপাদন সংযোগ",
    desc: "বিশ্বব্যাপী পোশাক প্রস্তুতকারক, বায়ার এবং সাপ্লাই চেইন সংযোগের জন্য মালিকপক্ষের তথ্য এখানে যুক্ত ও অনুসন্ধান করা যাবে।"
  },
  {
    id: "wg2",
    category: "গার্মেন্টস শ্রমিক / অপারেটর",
    country: "বাংলাদেশ ও মধ্যপ্রাচ্য/এশিয়া",
    name: "দক্ষ সুইং, কাটিং ও হেল্পার পুল",
    role: "সুইং অপারেটর / কাটিং মাস্টার / হেল্পার",
    contact: "",
    need: "দেশীয় ও আন্তর্জাতিক গার্মেন্টস কাজের সুযোগ",
    desc: "বিভিন্ন মেশিন ও লাইন পরিচালনার অভিজ্ঞতাসম্পন্ন গার্মেন্টস শ্রমিক ও কারিগরদের প্রোফাইল এখানে যুক্ত করা যাবে।"
  },
  {
    id: "wg3",
    category: "মার্চেন্ডাইজিং ও কোয়ালিটি",
    country: "আন্তর্জাতিক পোশাক খাত",
    name: "মার্চেন্ডাইজিং, স্যাম্পল ও QC টিম",
    role: "মার্চেন্ডাইজার / কোয়ালিটি কন্ট্রোল (QC)",
    contact: "",
    need: "মান নিয়ন্ত্রণ, শিপমেন্ট ও বায়ার সমন্বয়",
    desc: "পোশাকের মান যাচাই, প্যাটার্ন/স্যাম্পল এবং রপ্তানি কার্যক্রমে যুক্ত পেশাজীবীদের তথ্য এখানে রাখা যাবে।"
  },
  {
    id: "wg4",
    category: "টেক্সটাইল ও অ্যাক্সেসরিজ",
    country: "বিশ্ব পোশাক বাজার",
    name: "ফ্যাব্রিক, ইয়ার্ন ও অ্যাক্সেসরিজ সরবরাহ",
    role: "টেক্সটাইল ও অ্যাক্সেসরিজ সরবরাহকারী",
    contact: "",
    need: "কাঁচামাল ও অ্যাক্সেসরিজ সরবরাহ সংযোগ",
    desc: "গার্মেন্টস শিল্পের প্রয়োজনীয় কাপড়, সুতা, বোতাম, জিপার ও প্যাকেজিং সরবরাহকারীদের তথ্য এখানে যুক্ত করা যাবে।"
  }
];

let currentUser = null;
let userProfile = {};
let dbGarments = [];

function showNotice(msg) {
  const box = $("notice");
  if (!box) return alert(msg);
  box.textContent = msg;
  box.style.display = "block";
  clearTimeout(showNotice.timer);
  showNotice.timer = setTimeout(() => {
    box.style.display = "none";
  }, 3000);
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

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const btn = $("addGarmentBtn");
  if (!user) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔒 তথ্য যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "📌 গার্মেন্টস তালিকায় যুক্ত করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile load error:", err);
  }
});

$("addGarmentBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("তথ্য যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("newGarmentCategory")?.value || "গার্মেন্টস শ্রমিক / অপারেটর";
  const country = $("newGarmentCountry")?.value.trim() || "আন্তর্জাতিক";
  const name = $("newGarmentName")?.value.trim() || "";
  const role = $("newGarmentRole")?.value.trim() || "";
  const contact = $("newGarmentContact")?.value.trim() || "";
  const need = $("newGarmentNeed")?.value.trim() || "";
  const desc = $("newGarmentDesc")?.value.trim() || "";

  if (!name || !role || !desc) {
    showNotice("অনুগ্রহ করে নাম, পদবি/দক্ষতা এবং বিস্তারিত বিবরণ লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldGarments"));
  await set(newRef, {
    category,
    country,
    name,
    role,
    contact,
    need,
    desc,
    uid: currentUser.uid,
    addedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    createdAt: Date.now()
  });

  if ($("newGarmentCountry")) $("newGarmentCountry").value = "";
  if ($("newGarmentName")) $("newGarmentName").value = "";
  if ($("newGarmentRole")) $("newGarmentRole").value = "";
  if ($("newGarmentContact")) $("newGarmentContact").value = "";
  if ($("newGarmentNeed")) $("newGarmentNeed").value = "";
  if ($("newGarmentDesc")) $("newGarmentDesc").value = "";

  showNotice("বিশ্ব গার্মেন্টস তালিকায় তথ্য যুক্ত হয়েছে!");
});

onValue(ref(database, "worldGarments"), (snapshot) => {
  const data = snapshot.val() || {};
  dbGarments = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderGarmentsList();
});

function renderGarmentsList() {
  const container = $("worldGarmentsList");
  if (!container) return;

  const catQ = $("garmentCategoryFilter")?.value || "ALL";
  const countryQ = ($("garmentCountryFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("garmentSearchInput")?.value || "").trim().toLowerCase();

  const merged = [...dbGarments, ...DEFAULT_GARMENT_ENTRIES];

  const filtered = merged.filter((item) => {
    const matchCat = catQ === "ALL" || item.category === catQ;
    const matchCountry =
      !countryQ || (item.country && item.country.toLowerCase().includes(countryQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.role && item.role.toLowerCase().includes(searchQ)) ||
      (item.country && item.country.toLowerCase().includes(searchQ)) ||
      (item.need && item.need.toLowerCase().includes(searchQ)) ||
      (item.desc && item.desc.toLowerCase().includes(searchQ)) ||
      (item.contact && item.contact.toLowerCase().includes(searchQ));

    return matchCat && matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো গার্মেন্টস তথ্য পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d garment-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;

    card.innerHTML = `
      <div>
        <span class="garment-badge">${escapeHTML(item.category || "গার্মেন্টস")} • 🌍 ${escapeHTML(item.country || "")}</span>
        <h3 class="garment-name">${escapeHTML(item.name)}</h3>
        <div class="garment-role">🧵 ${escapeHTML(item.role || "")}</div>
        ${item.need ? `<div class="garment-info" style="color:#ffd700;">🎯 ${escapeHTML(item.need)}</div>` : ""}
        <p class="garment-info">${escapeHTML(item.desc || "")}</p>
        ${item.contact ? `<div class="garment-info" style="color:#ffd700;">📞 যোগাযোগ: ${escapeHTML(item.contact)}</div>` : ""}
      </div>
      <div>
        <div class="garment-footer">
          যুক্ত করেছেন: <strong>${escapeHTML(item.addedBy || "AYNA গার্মেন্টস ডিরেক্টরি")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-garment-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-garment-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldGarments/${item.id}`));
        showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("garmentCategoryFilter")?.addEventListener("change", renderGarmentsList);
  $("garmentCountryFilter")?.addEventListener("input", renderGarmentsList);
  $("garmentSearchInput")?.addEventListener("input", renderGarmentsList);
  renderGarmentsList();
});