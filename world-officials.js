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
// AYNA BOOK - WORLD MPs, MINISTERS & GOVT OFFICIALS (world-officials.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const DEFAULT_OFFICIALS = [
  {
    id: "of1",
    category: "সংসদ সদস্য (MP)",
    country: "বাংলাদেশ",
    name: "জাতীয় সংসদ সদস্য ডিরেক্টরি",
    role: "সংসদ সদস্য (MP)",
    department: "বাংলাদেশ জাতীয় সংসদ",
    photo: "",
    contact: "parliament.gov.bd",
    bio: "নির্বাচনী এলাকা ও সংসদীয় কমিটির তথ্য অনুযায়ী এমপিদের প্রোফাইল এখানে সংরক্ষণ ও অনুসন্ধান করা যাবে।"
  },
  {
    id: "of2",
    category: "মন্ত্রী ও প্রতিমন্ত্রী",
    country: "আন্তর্জাতিক ও দেশীয়",
    name: "মন্ত্রিসভা ও মন্ত্রণালয় নেতৃত্ব",
    role: "মন্ত্রী / প্রতিমন্ত্রী",
    department: "বিভিন্ন মন্ত্রণালয় ও বিভাগ",
    photo: "",
    contact: "",
    bio: "বিভিন্ন দেশের মন্ত্রিসভা ও মন্ত্রণালয়ের দায়িত্বপ্রাপ্ত মন্ত্রীদের তথ্য এখানে যুক্ত ও ফিল্টার করা যাবে।"
  },
  {
    id: "of3",
    category: "সরকারি কর্মকর্তা",
    country: "বাংলাদেশ ও বিশ্ব",
    name: "প্রশাসন ও দপ্তর কর্মকর্তা তালিকা",
    role: "সচিব / বিভাগীয় ও জেলা কর্মকর্তা",
    department: "সরকারি প্রশাসন ও সেবা দপ্তর",
    photo: "",
    contact: "",
    bio: "জনসেবা, প্রশাসন, স্বাস্থ্য, কৃষি ও স্থানীয় দপ্তরের সরকারি কর্মকর্তাদের তথ্য এখানে সংযুক্ত করা যাবে।"
  },
  {
    id: "of4",
    category: "কূটনীতিক ও রাষ্ট্রদূত",
    country: "আন্তর্জাতিক মিশন",
    name: "দূতাবাস ও কূটনৈতিক প্রতিনিধি",
    role: "রাষ্ট্রদূত / কনস্যুলার কর্মকর্তা",
    department: "পররাষ্ট্র ও কূটনৈতিক মিশন",
    photo: "",
    contact: "",
    bio: "প্রবাসী ও আন্তর্জাতিক সেবার জন্য বিভিন্ন দেশের দূতাবাস ও কূটনৈতিক কর্মকর্তাদের তথ্য এখানে রাখা যাবে।"
  }
];

let currentUser = null;
let userProfile = {};
let dbOfficials = [];

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

function defaultOfficialAvatar() {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><rect width="100%" height="100%" fill="#050b1c"/><circle cx="46" cy="34" r="17" fill="#ffd700"/><path d="M14 92 Q20 60 46 60 Q72 60 78 92" fill="#ffd700"/></svg>'
    )
  );
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  const btn = $("addOfficialBtn");
  if (!user) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔒 তথ্য যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "📌 তালিকায় তথ্য যুক্ত করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile load error:", err);
  }
});

$("addOfficialBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("তথ্য যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("newOfficialCategory")?.value || "সরকারি কর্মকর্তা";
  const country = $("newOfficialCountry")?.value.trim() || "";
  const name = $("newOfficialName")?.value.trim() || "";
  const role = $("newOfficialRole")?.value.trim() || "";
  const department = $("newOfficialDept")?.value.trim() || "";
  const photo = $("newOfficialPhoto")?.value.trim() || "";
  const contact = $("newOfficialContact")?.value.trim() || "";
  const bio = $("newOfficialBio")?.value.trim() || "";

  if (!name || !country || !role) {
    showNotice("অনুগ্রহ করে নাম, দেশ এবং পদবি লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldOfficials"));
  await set(newRef, {
    category,
    country,
    name,
    role,
    department,
    photo,
    contact,
    bio,
    uid: currentUser.uid,
    addedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    createdAt: Date.now()
  });

  if ($("newOfficialCountry")) $("newOfficialCountry").value = "";
  if ($("newOfficialName")) $("newOfficialName").value = "";
  if ($("newOfficialRole")) $("newOfficialRole").value = "";
  if ($("newOfficialDept")) $("newOfficialDept").value = "";
  if ($("newOfficialPhoto")) $("newOfficialPhoto").value = "";
  if ($("newOfficialContact")) $("newOfficialContact").value = "";
  if ($("newOfficialBio")) $("newOfficialBio").value = "";

  showNotice("তথ্য সফলভাবে তালিকায় যুক্ত হয়েছে!");
});

onValue(ref(database, "worldOfficials"), (snapshot) => {
  const data = snapshot.val() || {};
  dbOfficials = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderOfficialsList();
});

function renderOfficialsList() {
  const container = $("worldOfficialsList");
  if (!container) return;

  const catQ = $("officialCategoryFilter")?.value || "ALL";
  const countryQ = ($("officialCountryFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("officialSearchInput")?.value || "").trim().toLowerCase();

  const merged = [...dbOfficials, ...DEFAULT_OFFICIALS];

  const filtered = merged.filter((item) => {
    const matchCat = catQ === "ALL" || item.category === catQ;
    const matchCountry =
      !countryQ || (item.country && item.country.toLowerCase().includes(countryQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.role && item.role.toLowerCase().includes(searchQ)) ||
      (item.department && item.department.toLowerCase().includes(searchQ)) ||
      (item.country && item.country.toLowerCase().includes(searchQ)) ||
      (item.bio && item.bio.toLowerCase().includes(searchQ));

    return matchCat && matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো তথ্য পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d official-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;

    card.innerHTML = `
      <div>
        <div class="official-top">
          <img class="official-photo" src="${escapeHTML(item.photo || defaultOfficialAvatar())}" alt="${escapeHTML(item.name)}" loading="lazy">
          <div>
            <span class="official-badge">${escapeHTML(item.category || "সরকারি")}</span>
            <div class="official-name">${escapeHTML(item.name)}</div>
            <div class="official-role">${escapeHTML(item.role || "")}</div>
            <div class="official-meta">🌍 ${escapeHTML(item.country || "")}${item.department ? ` • 🏢 ${escapeHTML(item.department)}` : ""}</div>
          </div>
        </div>
        ${item.bio ? `<p class="official-bio">${escapeHTML(item.bio)}</p>` : ""}
        ${item.contact ? `<div style="margin-top:8px;color:#ffd700;font-size:16px;">🔗 যোগাযোগ/তথ্য: ${escapeHTML(item.contact)}</div>` : ""}
      </div>
      <div>
        <div class="official-footer">
          যুক্ত করেছেন: <strong>${escapeHTML(item.addedBy || "AYNA ডিরেক্টরি")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-official-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-official-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldOfficials/${item.id}`));
        showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("officialCategoryFilter")?.addEventListener("change", renderOfficialsList);
  $("officialCountryFilter")?.addEventListener("input", renderOfficialsList);
  $("officialSearchInput")?.addEventListener("input", renderOfficialsList);
  renderOfficialsList();
});