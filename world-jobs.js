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
// AYNA BOOK - WORLD GOVT & PRIVATE JOB MARKET (world-jobs.js)
// ==================================================

const $ = (id) => document.getElementById(id);

const DEFAULT_WORLD_JOBS = [
  {
    id: "wj1",
    sector: "সরকারি চাকুরী",
    country: "বাংলাদেশ",
    title: "সরকারি প্রশাসন, শিক্ষা, স্বাস্থ্য ও কারিগরি নিয়োগ ডেস্ক",
    organization: "বিভিন্ন সরকারি মন্ত্রণালয় ও অধিদপ্তর",
    salary: "জাতীয় বেতন স্কেল অনুযায়ী",
    deadline: "বিজ্ঞপ্তি অনুযায়ী",
    description: "দেশের সরকারি দপ্তর, স্বায়ত্তশাসিত প্রতিষ্ঠান ও পাবলিক নিয়োগের সর্বশেষ তথ্য এখানে যুক্ত ও অনুসন্ধান করা যাবে।"
  },
  {
    id: "wj2",
    sector: "বেসরকারি চাকুরী",
    country: "বাংলাদেশ ও আন্তর্জাতিক",
    title: "কর্পোরেট, আইটি, ব্যাংকিং, উৎপাদন ও বিক্রয় পদ",
    organization: "দেশীয় ও বহুজাতিক বেসরকারি প্রতিষ্ঠান",
    salary: "যোগ্যতা ও অভিজ্ঞতা অনুযায়ী",
    deadline: "চলমান",
    description: "বিভিন্ন বেসরকারি প্রতিষ্ঠানের শূন্য পদের তথ্য, প্রয়োজনীয় যোগ্যতা ও যোগাযোগের বিবরণ এখানে সংযুক্ত করা যাবে।"
  },
  {
    id: "wj3",
    sector: "আন্তর্জাতিক ও প্রবাসী চাকুরী",
    country: "মধ্যপ্রাচ্য, ইউরোপ ও এশিয়া",
    title: "আন্তর্জাতিক কর্মসংস্থান ও দক্ষ জনশক্তি সুযোগ",
    organization: "আন্তর্জাতিক নিয়োগকারী ও প্রতিষ্ঠান",
    salary: "দেশ ও মুদ্রা অনুযায়ী",
    deadline: "বিজ্ঞপ্তি অনুযায়ী",
    description: "বিদেশে সরকারি বা অনুমোদিত বেসরকারি কর্মসংস্থানের তথ্য এবং ভিসা/কাজের ক্যাটাগরি এখানে ফিল্টার করে দেখা যাবে।"
  },
  {
    id: "wj4",
    sector: "রিমোট ও ফ্রিল্যান্স চাকুরী",
    country: "বিশ্বব্যাপী (Remote)",
    title: "ওয়েব/অ্যাপ ডেভেলপমেন্ট, ডিজাইন ও ডিজিটাল সেবা",
    organization: "গ্লোবাল রিমোট টিম ও ক্লায়েন্ট",
    salary: "প্রজেক্ট বা মাসিক ভিত্তিক",
    deadline: "চলমান",
    description: "বাসা থেকে বা দূরবর্তী কাজের সুযোগ ও কারিগরি দক্ষতাভিত্তিক চাকুরীর তথ্য এখানে যুক্ত করা যাবে।"
  }
];

let currentUser = null;
let userProfile = {};
let dbJobs = [];

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
  const btn = $("addJobBtn");
  if (!user) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔒 বিজ্ঞপ্তি যুক্ত করতে লগইন করুন";
    }
    return;
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = "📌 চাকুরী বাজারে প্রকাশ করুন";
  }

  try {
    const snap = await get(ref(database, "users/" + user.uid));
    userProfile = snap.val() || {};
  } catch (err) {
    console.error("User profile load error:", err);
  }
});

$("addJobBtn")?.addEventListener("click", async () => {
  if (!currentUser) {
    showNotice("বিজ্ঞপ্তি যুক্ত করতে আগে লগইন করুন।");
    return;
  }

  const sector = $("newJobSector")?.value || "বেসরকারি চাকুরী";
  const country = $("newJobCountry")?.value.trim() || "আন্তর্জাতিক";
  const title = $("newJobTitle")?.value.trim() || "";
  const organization = $("newJobOrg")?.value.trim() || "";
  const salary = $("newJobSalary")?.value.trim() || "";
  const deadline = $("newJobDeadline")?.value.trim() || "";
  const description = $("newJobDesc")?.value.trim() || "";

  if (!title || !organization || !description) {
    showNotice("অনুগ্রহ করে পদবি, প্রতিষ্ঠানের নাম এবং বিস্তারিত বিবরণ লিখুন।");
    return;
  }

  const newRef = push(ref(database, "worldJobs"));
  await set(newRef, {
    sector,
    country,
    title,
    organization,
    salary,
    deadline,
    description,
    uid: currentUser.uid,
    postedBy:
      userProfile.fullName ||
      currentUser.displayName ||
      currentUser.email ||
      "AYNA Member",
    createdAt: Date.now()
  });

  if ($("newJobCountry")) $("newJobCountry").value = "";
  if ($("newJobTitle")) $("newJobTitle").value = "";
  if ($("newJobOrg")) $("newJobOrg").value = "";
  if ($("newJobSalary")) $("newJobSalary").value = "";
  if ($("newJobDeadline")) $("newJobDeadline").value = "";
  if ($("newJobDesc")) $("newJobDesc").value = "";

  showNotice("চাকুরীর বিজ্ঞপ্তি সফলভাবে প্রকাশিত হয়েছে!");
});

onValue(ref(database, "worldJobs"), (snapshot) => {
  const data = snapshot.val() || {};
  dbJobs = Object.entries(data)
    .map(([id, item]) => ({ id, ...item }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  renderJobsList();
});

function renderJobsList() {
  const container = $("worldJobsList");
  if (!container) return;

  const sectorQ = $("jobSectorFilter")?.value || "ALL";
  const countryQ = ($("jobCountryFilter")?.value || "").trim().toLowerCase();
  const searchQ = ($("jobSearchInput")?.value || "").trim().toLowerCase();

  const merged = [...dbJobs, ...DEFAULT_WORLD_JOBS];

  const filtered = merged.filter((item) => {
    const matchSector = sectorQ === "ALL" || item.sector === sectorQ;
    const matchCountry =
      !countryQ || (item.country && item.country.toLowerCase().includes(countryQ));
    const matchSearch =
      !searchQ ||
      (item.title && item.title.toLowerCase().includes(searchQ)) ||
      (item.organization && item.organization.toLowerCase().includes(searchQ)) ||
      (item.country && item.country.toLowerCase().includes(searchQ)) ||
      (item.salary && item.salary.toLowerCase().includes(searchQ)) ||
      (item.description && item.description.toLowerCase().includes(searchQ));

    return matchSector && matchCountry && matchSearch;
  });

  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML =
      '<div class="gold-3d box-pad" style="grid-column:1/-1;text-align:center;">কোনো চাকুরীর বিজ্ঞপ্তি পাওয়া যায়নি।</div>';
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gold-3d job-card";
    const isOwner = currentUser && item.uid && item.uid === currentUser.uid;

    card.innerHTML = `
      <div>
        <span class="job-badge">${escapeHTML(item.sector || "চাকুরী")} • 🌍 ${escapeHTML(item.country || "")}</span>
        <h3 class="job-title">${escapeHTML(item.title)}</h3>
        <div class="job-org">🏢 ${escapeHTML(item.organization || "")}</div>
        ${item.salary ? `<div class="job-detail" style="color:#ffd700;">💰 বেতন/স্কেল: <strong>${escapeHTML(item.salary)}</strong></div>` : ""}
        ${item.deadline ? `<div class="job-detail" style="color:#ffd700;">🗓️ সময়/যোগাযোগ: <strong>${escapeHTML(item.deadline)}</strong></div>` : ""}
        <p class="job-detail">${escapeHTML(item.description || "")}</p>
      </div>
      <div>
        <div class="job-footer">
          প্রকাশক: <strong>${escapeHTML(item.postedBy || "AYNA চাকুরী বাজার")}</strong>
        </div>
        ${
          isOwner && item.id
            ? `<button type="button" class="del-job-btn" style="margin-top:10px;width:100%;padding:8px;background:#7f1d1d;color:#fff;border:1.5px solid #ffd700;border-radius:6px;font-weight:bold;cursor:pointer;">🗑️ মুছে ফেলুন</button>`
            : ""
        }
      </div>
    `;

    if (isOwner && item.id) {
      card.querySelector(".del-job-btn")?.addEventListener("click", async () => {
        if (!confirm("আপনি কি নিশ্চিতভাবে এই চাকুরীর বিজ্ঞপ্তিটি মুছে ফেলতে চান?")) return;
        await remove(ref(database, `worldJobs/${item.id}`));
        showNotice("বিজ্ঞপ্তিটি মুছে ফেলা হয়েছে।");
      });
    }

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("jobSectorFilter")?.addEventListener("change", renderJobsList);
  $("jobCountryFilter")?.addEventListener("input", renderJobsList);
  $("jobSearchInput")?.addEventListener("input", renderJobsList);
  renderJobsList();
});