// ==================================================
// AYNA BOOK - ARABIC / HIJRI CALENDAR (arabic-calendar.js)
// ==================================================

const AYNA_HIJRI_CONFIG = {
  storageKey: "ayna_sehri_iftar_sync",
  offsetStorageKey: "ayna_hijri_day_offset",
  defaultCountry: "BD",
  defaultDistrict: "চট্টগ্রাম",
  locations: {
    BD: {
      countryName: "বাংলাদেশ",
      districts: {
        "চট্টগ্রাম": { sehri: "04:53", iftar: "17:07" },
        "কক্সবাজার": { sehri: "04:52", iftar: "17:08" },
        "ঢাকা": { sehri: "04:58", iftar: "17:12" },
        "সিলেট": { sehri: "04:50", iftar: "17:04" },
        "রাজশাহী": { sehri: "05:05", iftar: "17:19" },
        "খুলনা": { sehri: "05:02", iftar: "17:17" },
        "বরিশাল": { sehri: "04:59", iftar: "17:14" },
        "রংপুর": { sehri: "05:02", iftar: "17:14" },
        "ময়মনসিংহ": { sehri: "04:58", iftar: "17:11" }
      }
    },
    SA: {
      countryName: "সৌদি আরব",
      districts: {
        "মক্কা": { sehri: "05:24", iftar: "17:38" },
        "মদিনা": { sehri: "05:27", iftar: "17:36" },
        "রিয়াদ": { sehri: "04:56", iftar: "17:02" },
        "জেদ্দা": { sehri: "05:27", iftar: "17:41" }
      }
    },
    AE: {
      countryName: "সংযুক্ত আরব আমিরাত",
      districts: {
        "দুবাই": { sehri: "05:22", iftar: "17:32" },
        "আবুধাবি": { sehri: "05:26", iftar: "17:36" },
        "শারজাহ": { sehri: "05:21", iftar: "17:31" }
      }
    },
    GB: {
      countryName: "যুক্তরাজ্য",
      districts: {
        "লন্ডন": { sehri: "05:45", iftar: "16:02" },
        "বার্মিংহাম": { sehri: "05:52", iftar: "16:06" },
        "ম্যানচেস্টার": { sehri: "05:56", iftar: "16:04" }
      }
    },
    US: {
      countryName: "যুক্তরাষ্ট্র",
      districts: {
        "নিউইয়র্ক": { sehri: "05:32", iftar: "16:36" },
        "লস অ্যাঞ্জেলেস": { sehri: "05:38", iftar: "16:50" },
        "হিউস্টন": { sehri: "05:35", iftar: "17:15" }
      }
    }
  }
};

const HIJRI_MONTHS_BN = [
  "মুহাররম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জমাদিউল আউয়াল",
  "জমাদিউস সানি",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ"
];

const $ = (id) => document.getElementById(id);

let hijriDayOffset = 0;

function loadHijriOffset() {
  try {
    const saved = Number(localStorage.getItem(AYNA_HIJRI_CONFIG.offsetStorageKey) || "0");
    if (!Number.isNaN(saved) && saved >= -3 && saved <= 3) {
      hijriDayOffset = saved;
    }
  } catch (err) {
    hijriDayOffset = 0;
  }
}

function saveHijriOffset(val) {
  hijriDayOffset = val;
  try {
    localStorage.setItem(AYNA_HIJRI_CONFIG.offsetStorageKey, String(val));
  } catch (err) {
    console.error("Offset save error:", err);
  }
}

function getAdjustedDate(baseDate = new Date(), dayOffset = hijriDayOffset) {
  const d = new Date(baseDate.getTime());
  d.setDate(d.getDate() + Number(dayOffset || 0));
  return d;
}

function getHijriParts(dateObj) {
  try {
    const dayFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric" });
    const monthFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { month: "numeric" });
    const yearFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { year: "numeric" });
    const bnFullFormatter = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const dayNum = parseInt(dayFormatter.format(dateObj), 10) || 1;
    const monthNum = parseInt(monthFormatter.format(dateObj), 10) || 1;
    const yearStr = yearFormatter.format(dateObj).replace(/\D/g, "") || "1448";
    const yearNum = parseInt(yearStr, 10) || 1448;
    const monthNameBn = HIJRI_MONTHS_BN[(monthNum - 1) % 12] || "আরবি মাস";

    return {
      day: dayNum,
      month: monthNum,
      monthNameBn,
      year: yearNum,
      fullBn: bnFullFormatter.format(dateObj)
    };
  } catch (err) {
    console.error("Hijri formatter error:", err);
    return {
      day: 1,
      month: 1,
      monthNameBn: "মুহাররম",
      year: 1448,
      fullBn: dateObj.toLocaleDateString("bn-BD")
    };
  }
}

function toBanglaDigits(numOrStr) {
  const bnMap = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(numOrStr).replace(/\d/g, (d) => bnMap[Number(d)]);
}

function renderHijriHeader() {
  const adjustedNow = getAdjustedDate(new Date(), hijriDayOffset);
  const parts = getHijriParts(adjustedNow);

  if ($("hijriDateDisplay")) {
    $("hijriDateDisplay").textContent = parts.fullBn;
  }

  if ($("hijriMonthYear")) {
    $("hijriMonthYear").textContent =
      `${parts.monthNameBn} ${toBanglaDigits(parts.year)} হিজরি`;
  }

  if ($("gregorianDateSub")) {
    $("gregorianDateSub").textContent = new Date().toLocaleDateString("bn-BD", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  if ($("offsetValueDisplay")) {
    const sign = hijriDayOffset > 0 ? `+${hijriDayOffset}` : `${hijriDayOffset}`;
    $("offsetValueDisplay").textContent = `${toBanglaDigits(sign)} দিন`;
  }

  renderHijriMonthGrid(parts);
}

function renderHijriMonthGrid(currentParts) {
  const grid = $("hijriCalendarGrid");
  if (!grid) return;

  grid.innerHTML = "";
  const totalDaysInMonth = 30;

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "hijri-day-card";
    if (day === currentParts.day) {
      cell.classList.add("is-today");
    }

    cell.innerHTML = `
      <div class="hijri-day-num">${toBanglaDigits(day)}</div>
      <div class="hijri-day-month">${currentParts.monthNameBn}</div>
    `;

    grid.appendChild(cell);
  }
}

function populateCalendarDistricts() {
  const countryEl = $("calCountrySelect");
  const districtEl = $("calDistrictSelect");
  if (!countryEl || !districtEl) return;

  const countryCode = countryEl.value;
  const countryObj = AYNA_HIJRI_CONFIG.locations[countryCode];
  if (!countryObj) return;

  districtEl.innerHTML = "";
  Object.keys(countryObj.districts).forEach((distName) => {
    const opt = document.createElement("option");
    opt.value = distName;
    opt.textContent = distName;
    districtEl.appendChild(opt);
  });

  syncCalendarSelectionToClock();
}

function syncCalendarSelectionToClock() {
  const countryCode = $("calCountrySelect")?.value || AYNA_HIJRI_CONFIG.defaultCountry;
  const districtName = $("calDistrictSelect")?.value || AYNA_HIJRI_CONFIG.defaultDistrict;
  const leadHours = Number($("calIftarLeadHours")?.value || 1);

  const countryObj = AYNA_HIJRI_CONFIG.locations[countryCode];
  const times = countryObj?.districts?.[districtName] || { sehri: "04:53", iftar: "17:07" };
  const hijriParts = getHijriParts(getAdjustedDate(new Date(), hijriDayOffset));

  const payload = {
    countryCode,
    countryName: countryObj?.countryName || "",
    districtName,
    sehri: times.sehri,
    iftar: times.iftar,
    iftarLeadHours: leadHours,
    hijriDate: hijriParts.fullBn,
    updatedAt: Date.now()
  };

  try {
    localStorage.setItem(AYNA_HIJRI_CONFIG.storageKey, JSON.stringify(payload));
  } catch (err) {
    console.error("Storage sync error:", err);
  }

  if ($("calTimePreview")) {
    $("calTimePreview").textContent =
      `${payload.countryName} — ${payload.districtName} | সেহরি: ${payload.sehri} | ইফতার: ${payload.iftar}`;
  }

  const goClockLink = $("goToClockBtn");
  if (goClockLink) {
    goClockLink.href =
      `clock.html?country=${encodeURIComponent(countryCode)}&district=${encodeURIComponent(districtName)}&lead=${leadHours}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHijriOffset();
  renderHijriHeader();

  const countryEl = $("calCountrySelect");
  const districtEl = $("calDistrictSelect");
  const leadEl = $("calIftarLeadHours");

  if (countryEl) {
    countryEl.value = AYNA_HIJRI_CONFIG.defaultCountry;
    countryEl.addEventListener("change", populateCalendarDistricts);
  }

  if (districtEl) {
    districtEl.addEventListener("change", syncCalendarSelectionToClock);
  }

  if (leadEl) {
    leadEl.addEventListener("change", syncCalendarSelectionToClock);
  }

  $("prevHijriDayBtn")?.addEventListener("click", () => {
    saveHijriOffset(hijriDayOffset - 1);
    renderHijriHeader();
    syncCalendarSelectionToClock();
  });

  $("nextHijriDayBtn")?.addEventListener("click", () => {
    saveHijriOffset(hijriDayOffset + 1);
    renderHijriHeader();
    syncCalendarSelectionToClock();
  });

  $("resetHijriDayBtn")?.addEventListener("click", () => {
    saveHijriOffset(0);
    renderHijriHeader();
    syncCalendarSelectionToClock();
  });

  populateCalendarDistricts();
});