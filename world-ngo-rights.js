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
// AYNA BOOK - UN, WORLD NGO & HUMAN RIGHTS (world-ngo-rights.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const DEFAULT_NGO_AND_RIGHTS_ORGS = [
  {
    id: "un1",
    category: "UN সংস্থা",
    region: "জেনেভা / বৈশ্বিক",
    name: "UNHCR — জাতিসংঘ শরণার্থী সংস্থা",
    phone: "+41 22 739 8111 (বাংলাদেশ হেল্পলাইন: 16670)",
    email: "bgdcoprt@unhcr.org",
    focus: "শরণার্থী সুরক্ষা ও মানবিক সহায়তা",
    desc: "জোরপূর্বক বাস্তুচ্যুত ও শরণার্থীদের সুরক্ষা, সহায়তা ও জরুরি যোগাযোগ ডেস্ক।"
  },
  {
    id: "un2",
    category: "UN সংস্থা",
    region: "জেনেভা / নিউ ইয়র্ক",
    name: "UN OCHA — মানবিক বিষয়ক সমন্বয় দপ্তর",
    phone: "+41 22 917 1352 / +1 212 963 0762",
    email: "ochany@un.org",
    focus: "জরুরি মানবিক সহায়তা সমন্বয়",
    desc: "বৈশ্বিক মানবিক সংকট ও দুর্যোগ মোকাবিলায় সমন্বয়কারী জাতিসংঘ দপ্তর।"
  },
  {
    id: "hr1",
    category: "মানবাধিকার সংগঠন",
    region: "জেনেভা / বৈশ্বিক",
    name: "UN OHCHR — জাতিসংঘ মানবাধিকার হাইকমিশন",
    phone: "+41 22 917 9220",
    email: "ohchr-InfoDesk@un.org",
    focus: "আন্তর্জাতিক মানবাধিকার পর্যবেক্ষণ ও সুরক্ষা",
    desc: "মানবাধিকার লঙ্ঘন, নাগরিক সমাজ ও আইনগত মানবাধিকার বিষয়ে সাধারণ অনুসন্ধান ডেস্ক।"
  },
  {
    id: "hr2",
    category: "মানবাধিকার সংগঠন",
    region: "লন্ডন / ব্যাংকক / বৈশ্বিক",
    name: "Amnesty International — অ্যামনেস্টি ইন্টারন্যাশনাল",
    phone: "+44-20-74135500 / +66 (0) 98 754 3995",
    email: "info.eseaprobangkok@amnesty.org",
    focus: "মানবাধিকার, ন্যায়বিচার ও স্বাধীন মতামত",
    desc: "বিশ্বব্যাপী মানবাধিকার সুরক্ষা ও অনুসন্ধানমূলক কার্যক্রমে নিয়োজিত আন্তর্জাতিক সংস্থা।"
  },
  {
    id: "hr3",
    category: "মানবাধিকার সংগঠন",
    region: "নিউ ইয়র্ক / জেনেভা / ব্রাসেলস",
    name: "Human Rights Watch (HRW)",
    phone: "+1-212-290-4700 / +32-2-732-2009",
    email: "belgium@hrw.org",
    focus: "মানবাধিকার অনুসন্ধান ও প্রতিবেদন",
    desc: "আন্তর্জাতিক মানবাধিকার পরিস্থিতি নিয়ে গবেষণা ও অ্যাডভোকেসি সংস্থা।"
  },
  {
    id: "ngo1",
    category: "বিশ্ব NGO ও মানবিক সহায়তা",
    region: "নিউ ইয়র্ক / জেনেভা / বৈশ্বিক",
    name: "MSF — ডক্টরস উইদাউট বর্ডার্স (Médecins Sans Frontières)",
    phone: "+1 212 679 6800 / +41 22 849 84 84",
    email: "info@doctorswithoutborders.org",
    focus: "জরুরি চিকিৎসা ও মানবিক সহায়তা",
    desc: "সংকটময় ও দুর্যোগপূর্ণ এলাকায় স্বাধীন চিকিৎসা ও মানবিক সহায়তা প্রদানকারী আন্তর্জাতিক NGO।"
  }
];

let currentUser = null;
let userProfile = {};
let dbOrgs = [];

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
  const btn = $("addOrgBtn");
  if (!user) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔒 তথ্য যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "📌 ডিরেক্টরিতে যুক্ত করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile fetch failed:", err);
  }
});

$("addOrgBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("তথ্য যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const category = $("newOrgCategory")?.value || "বিশ্ব NGO ও মানবিক সহায়তা";
  const region = $("newOrgRegion")?.value.trim() || "আন্তর্জাতিক";
  const name = $("newOrgName")?.value.trim() || "";
  const phone = $("newOrgPhone")?.value.trim() || "";
  const email = $("newOrgEmail")?.value.trim() || "";
  const focus = $("newOrgFocus")?.value.trim() || "";
  const desc = $("newOrgDesc")?.value.trim() || "";

  if (!name || (!phone && !email)) {
    showNotice("অনুগ্রহ করে সংগঠনের নাম এবং ফোন বা জিমেইল/ইমেইল লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldNgoHumanRights"));
  await set(newRef, {
    category,
    region,
    name,
    phone,
    email,
    focus,
    desc,
    uid: currentUser.uid,
    addedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    createdAt: Date.now()
  });

  if ($("newOrgRegion")) $("newOrgRegion").value = "";
  if ($("newOrgName")) $("newOrgName").value = "";
  if ($("newOrgPhone")) $("newOrgPhone").value = "";
  if ($("newOrgEmail")) $("newOrgEmail").value = "";
  if ($("newOrgFocus")) $("newOrgFocus").value = "";
  if ($("newOrgDesc")) $("newOrgDesc").value = "";

  showNotice("সংগঠনের তথ্য ডিরেক্টরিতে যুক্ত হয়েছে!");
});

onValue(ref(database, "worldNgoHumanRights"), (snapshot) => {
  const data = snapshot.val() || {};
  dbOrgs = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderOrgList();
});

function renderOrgList() {
  const container = $("worldOrgList");
  if (!container) return;

  const catQ = $("orgCategoryFilter")?.value || "ALL";
  const regionQ = ($("orgRegionFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("orgSearchInput")?.value || "").trim().toLowerCase();

  const merged = [...dbOrgs, ...DEFAULT_NGO_AND_RIGHTS_ORGS];

  const filtered = merged.filter((item) => {
    const matchCat = catQ === "ALL" || item.category === catQ;
    const matchRegion =
      !regionQ || (item.region && item.region.toLowerCase().includes(regionQ));
    const matchSearch =
      !searchQ ||
      (item.name && item.name.toLowerCase().includes(searchQ)) ||
      (item.phone && item.phone.toLowerCase().includes(searchQ)) ||
      (item.email && item.email.toLowerCase().includes(searchQ)) ||
      (item.region && item.region.toLowerCase().includes(searchQ)) ||
      (item.focus && item.focus.toLowerCase().includes(searchQ)) ||
      (item.desc && item.desc.toLowerCase().includes(searchQ));

    return matchCat && matchRegion && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো সংগঠনের তথ্য পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d org-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;

    card.innerHTML = `
      <div>
        <span class="org-badge">${escapeHTML(item.category || "সংগঠন")} • 🌍 ${escapeHTML(item.region || "")}</span>
        <h3 class="org-name">${escapeHTML(item.name)}</h3>
        ${item.focus ? `<div class="org-line" style="color:#ffd700;font-weight:bold;">🎯 ${escapeHTML(item.focus)}</div>` : ""}
        ${item.phone ? `<div class="org-line">📞 ফোন: <strong>${escapeHTML(item.phone)}</strong></div>` : ""}
        ${item.email ? `<div class="org-line">✉️ জিমেইল/ইমেইল: <a href="mailto:${escapeHTML(item.email)}">${escapeHTML(item.email)}</a></div>` : ""}
        ${item.desc ? `<p class="org-line" style="margin-top:6px;">${escapeHTML(item.desc)}</p>` : ""}
      </div>
      <div>
        <div class="org-footer">
          তথ্যসূত্র: <strong>${escapeHTML(item.addedBy || "AYNA ডিরেক্টরি")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-org-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-org-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই তথ্যটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldNgoHumanRights/${item.id}`));
        showNotice("তথ্যটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("orgCategoryFilter")?.addEventListener("change", renderOrgList);
  $("orgRegionFilter")?.addEventListener("input", renderOrgList);
  $("orgSearchInput")?.addEventListener("input", renderOrgList);
  renderOrgList();
});