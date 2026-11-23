// ======================================================
// AYNA BOOK
// WORLDWIDE GOVERNMENT / PUBLIC HOLIDAYS
// Nager.Date REST API v4
// ======================================================

const API_BASE =
  "https://nagerholidays.com/api/v4/Holidays";


// ------------------------------------------------------
// Country names
// ------------------------------------------------------

const countryNames = {

  BD: "বাংলাদেশ",
  IN: "ভারত",
  PK: "পাকিস্তান",
  SA: "সৌদি আরব",
  AE: "সংযুক্ত আরব আমিরাত",
  MY: "মালয়েশিয়া",
  ID: "ইন্দোনেশিয়া",
  TR: "তুরস্ক",
  GB: "যুক্তরাজ্য",
  US: "যুক্তরাষ্ট্র",
  CA: "কানাডা",
  AU: "অস্ট্রেলিয়া",
  DE: "জার্মানি",
  FR: "ফ্রান্স",
  IT: "ইতালি",
  ES: "স্পেন",
  JP: "জাপান",
  CN: "চীন",
  KR: "দক্ষিণ কোরিয়া",
  RU: "রাশিয়া",
  BR: "ব্রাজিল",
  ZA: "দক্ষিণ আফ্রিকা"

};


// ------------------------------------------------------
// Elements
// ------------------------------------------------------

const countryEl = document.getElementById("country");
const yearEl = document.getElementById("year");
const filterEl = document.getElementById("filter");
const searchEl = document.getElementById("search");

const loadBtn = document.getElementById("loadBtn");
const todayBtn = document.getElementById("todayBtn");
const backBtn = document.getElementById("backBtn");

const statusEl = document.getElementById("status");
const holidayListEl = document.getElementById("holidayList");

const todayHolidayEl = document.getElementById("todayHoliday");
const countryInfoEl = document.getElementById("countryInfo");


// ------------------------------------------------------
// State
// ------------------------------------------------------

let holidays = [];


// ------------------------------------------------------
// Current year
// ------------------------------------------------------

const now = new Date();

yearEl.value = now.getFullYear();


// ------------------------------------------------------
// Bengali number
// ------------------------------------------------------

function bnNumber(value) {

  const english = "0123456789";
  const bengali = "০১২৩৪৫৬৭৮৯";

  return String(value).replace(
    /[0-9]/g,
    digit => bengali[english.indexOf(digit)]
  );
}


// ------------------------------------------------------
// Date formatting
// ------------------------------------------------------

function formatDate(dateString) {

  const date = new Date(dateString + "T00:00:00");

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(
    "bn-BD",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}


// ------------------------------------------------------
// Month name
// ------------------------------------------------------

function getMonthName(dateString) {

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString(
    "bn-BD",
    {
      year: "numeric",
      month: "long"
    }
  );
}


// ------------------------------------------------------
// Today
// ------------------------------------------------------

function getTodayString() {

  const d = new Date();

  const year = d.getFullYear();

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const day =
    String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ------------------------------------------------------
// Escape HTML
// ------------------------------------------------------

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ------------------------------------------------------
// Load holidays
// ------------------------------------------------------

async function loadHolidays() {

  const country = countryEl.value;

  let year = Number(yearEl.value);

  if (!Number.isInteger(year)) {

    year = now.getFullYear();

    yearEl.value = year;
  }


  if (year < 1 || year > 9999) {

    statusEl.textContent =
      "⚠️ বছর ১ থেকে ৯৯৯৯-এর মধ্যে দিন।";

    return;
  }


  statusEl.textContent =
    "⏳ সরকারি ছুটির তথ্য লোড হচ্ছে...";

  holidayListEl.innerHTML =
    `<div class="loading">
      🌍 অনলাইন তথ্য সংগ্রহ করা হচ্ছে...
    </div>`;


  const url =
    `${API_BASE}/${encodeURIComponent(country)}/${year}`;


  try {

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );
    }


    const data = await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "অবৈধ API response"
      );
    }


    holidays = data;


    localStorage.setItem(
      "aynaHolidayCountry",
      country
    );

    localStorage.setItem(
      "aynaHolidayYear",
      String(year)
    );


    statusEl.textContent =
      `✅ ${countryNames[country] || country} — ${bnNumber(year)} সালের তথ্য পাওয়া গেছে`;


    countryInfoEl.textContent =
      `দেশ: ${countryNames[country] || country} • বছর: ${bnNumber(year)}`;


    updateTodayStatus();

    renderHolidays();

  } catch (error) {

    console.error(
      "Holiday API Error:",
      error
    );


    holidays = [];


    statusEl.textContent =
      "❌ সরকারি ছুটির তথ্য আনা যায়নি।";


    holidayListEl.innerHTML = `
      <div class="empty">

        <div style="font-size:36px;">
          ⚠️
        </div>

        <p>
          ইন্টারনেট সংযোগ অথবা API সার্ভারে সমস্যা হতে পারে।
        </p>

        <button
          id="retryBtn"
          class="secondary"
          style="max-width:220px;"
        >
          🔄 আবার চেষ্টা করুন
        </button>

      </div>
    `;


    const retryBtn =
      document.getElementById("retryBtn");

    if (retryBtn) {
      retryBtn.addEventListener(
        "click",
        loadHolidays
      );
    }


    todayHolidayEl.textContent =
      "তথ্য পাওয়া যায়নি।";
  }
}


// ------------------------------------------------------
// Filter holidays
// ------------------------------------------------------

function getFilteredHolidays() {

  const filter =
    filterEl.value;

  const search =
    searchEl.value
      .trim()
      .toLowerCase();


  return holidays.filter(holiday => {

    // Type filter

    if (filter !== "all") {

      const types =
        Array.isArray(holiday.holidayTypes)
          ? holiday.holidayTypes
          : [];

      if (!types.includes(filter)) {
        return false;
      }
    }


    // Search

    if (search) {

      const text = [

        holiday.name || "",

        holiday.localName || "",

        ...(Array.isArray(holiday.holidayTypes)
          ? holiday.holidayTypes
          : [])

      ]
        .join(" ")
        .toLowerCase();


      if (!text.includes(search)) {
        return false;
      }
    }


    return true;

  }).sort(
    (a, b) =>
      String(a.date)
        .localeCompare(String(b.date))
  );
}


// ------------------------------------------------------
// Render holidays
// ------------------------------------------------------

function renderHolidays() {

  const list =
    getFilteredHolidays();


  if (list.length === 0) {

    holidayListEl.innerHTML = `
      <div class="empty">
        📭 এই অনুসন্ধান/ফিল্টারে কোনো ছুটি পাওয়া যায়নি।
      </div>
    `;

    return;
  }


  const today =
    getTodayString();


  let html = "";

  let currentMonth = "";


  list.forEach((holiday, index) => {

    const date =
      holiday.date || "";

    const month =
      getMonthName(date);


    if (month !== currentMonth) {

      currentMonth = month;


      html += `
        <div class="month-title">
          📅 ${escapeHTML(month)}
        </div>
      `;
    }


    const isToday =
      date === today;


    const types =
      Array.isArray(holiday.holidayTypes)
        ? holiday.holidayTypes
        : [];


    let badges = "";


    if (holiday.nationalHoliday === true) {

      badges += `
        <span class="badge">
          🇺🇳 জাতীয়
        </span>
      `;
    }


    types.forEach(type => {

      const label =
        getTypeLabel(type);

      badges += `
        <span class="badge">
          ${escapeHTML(label)}
        </span>
      `;
    });


    if (
      Array.isArray(
        holiday.subdivisionCodes
      ) &&
      holiday.subdivisionCodes.length > 0
    ) {

      badges += `
        <span class="badge">
          📍 আঞ্চলিক
        </span>
      `;
    }


    html += `
      <article
        class="holiday ${isToday ? "today" : ""}"
      >

        <div class="holiday-date">
          ${escapeHTML(formatDate(date))}
        </div>

        <div class="holiday-name">
          ${escapeHTML(
            holiday.name || "সরকারি ছুটি"
          )}
        </div>

        ${
          holiday.localName &&
          holiday.localName !== holiday.name
            ? `
              <div class="holiday-local">
                স্থানীয় নাম:
                ${escapeHTML(holiday.localName)}
              </div>
            `
            : ""
        }

        <div class="badges">
          ${badges}
        </div>

      </article>
    `;

  });


  holidayListEl.innerHTML = html;
}


// ------------------------------------------------------
// Holiday type labels
// ------------------------------------------------------

function getTypeLabel(type) {

  const labels = {

    Public: "সরকারি ছুটি",

    Bank: "ব্যাংক ছুটি",

    School: "স্কুল ছুটি",

    Authorities: "কর্তৃপক্ষ বন্ধ",

    Optional: "ঐচ্ছিক ছুটি",

    Observance: "বিশেষ দিবস"

  };


  return labels[type] || type;
}


// ------------------------------------------------------
// Check today's holiday
// ------------------------------------------------------

function updateTodayStatus() {

  const today =
    getTodayString();


  const found =
    holidays.filter(
      holiday =>
        holiday.date === today
    );


  if (found.length === 0) {

    todayHolidayEl.innerHTML =
      "আজ এই নির্বাচিত দেশের তালিকায় কোনো সরকারি ছুটি পাওয়া যায়নি।";

    return;
  }


  const names =
    found.map(
      holiday =>
        holiday.name || "সরকারি ছুটি"
    );


  todayHolidayEl.innerHTML =
    `🎉 আজ ছুটি: <strong>${escapeHTML(
      names.join(" • ")
    )}</strong>`;
}


// ------------------------------------------------------
// Search
// ------------------------------------------------------

searchEl.addEventListener(
  "input",
  renderHolidays
);


// ------------------------------------------------------
// Filter
// ------------------------------------------------------

filterEl.addEventListener(
  "change",
  renderHolidays
);


// ------------------------------------------------------
// Load button
// ------------------------------------------------------

loadBtn.addEventListener(
  "click",
  loadHolidays
);


// ------------------------------------------------------
// Today's year
// ------------------------------------------------------

todayBtn.addEventListener(
  "click",
  () => {

    const d =
      new Date();

    yearEl.value =
      d.getFullYear();

    loadHolidays();
  }
);


// ------------------------------------------------------
// Enter key
// ------------------------------------------------------

yearEl.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      loadHolidays();
    }

  }
);


// ------------------------------------------------------
// Back
// ------------------------------------------------------

backBtn.addEventListener(
  "click",
  () => {

    if (
      document.referrer &&
      document.referrer.includes(
        window.location.host
      )
    ) {

      history.back();

    } else {

      window.location.href =
        "./index.html";

    }

  }
);


// ------------------------------------------------------
// Restore saved settings
// ------------------------------------------------------

const savedCountry =
  localStorage.getItem(
    "aynaHolidayCountry"
  );

const savedYear =
  localStorage.getItem(
    "aynaHolidayYear"
  );


if (
  savedCountry &&
  countryEl.querySelector(
    `option[value="${savedCountry}"]`
  )
) {

  countryEl.value =
    savedCountry;
}


if (
  savedYear &&
  Number(savedYear) >= 1 &&
  Number(savedYear) <= 9999
) {

  yearEl.value =
    savedYear;
}


// ------------------------------------------------------
// Initial load
// ------------------------------------------------------

loadHolidays();