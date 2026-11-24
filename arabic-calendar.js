// ==================================================
// AYNA BOOK - ARABIC CALENDAR & CLOCK SYNC (arabic-calendar.js)
// ==================================================

const AYNA_CALENDAR_CONFIG = {
  storageKey: "ayna_sehri_iftar_sync",
  defaultCountry: "BD",
  defaultDistrict: "চট্টগ্রাম",
  locations: {
    BD: {
      countryName: "বাংলাদেশ",
      districts: {
        "ঢাকা": { sehri: "04:58", iftar: "17:12" },
        "চট্টগ্রাম": { sehri: "04:53", iftar: "17:07" },
        "কক্সবাজার": { sehri: "04:52", iftar: "17:08" },
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
        "বার্মিংহাম": { sehri: "05:52", iftar: "16:06" }
      }
    },
    US: {
      countryName: "যুক্তরাষ্ট্র",
      districts: {
        "নিউইয়র্ক": { sehri: "05:32", iftar: "16:36" },
        "হিউস্টন": { sehri: "05:35", iftar: "17:15" }
      }
    }
  }
};

const $ = (id) => document.getElementById(id);

function getHijriDateInfo(date = new Date()) {
  try {
    const hijriFormatter = new Intl.DateTimeFormat("bn-BD-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long"
    });
    const enHijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    return {
      banglaText: hijriFormatter.format(date),
      englishText: enHijriFormatter.format(date)
    };
  } catch (err) {
    console.error("Hijri date format error:", err);
    return {
      banglaText: date.toLocaleDateString("bn-BD"),
      englishText: date.toLocaleDateString("en-US")
    };
  }
}

function renderHijriHeader() {
  const info = getHijriDateInfo(new Date());
  const hijriDisplay = $("hijriDateDisplay");
  if (hijriDisplay) {
    hijriDisplay.textContent = info.banglaText;
  }

  const hijriSub = $("hijriDateSub");
  if (hijriSub) {
    hijriSub.textContent = info.englishText;
  }
}

function populateCalendarDistricts() {
  const countryEl = $("calCountrySelect");
  const districtEl = $("calDistrictSelect");
  if (!countryEl || !districtEl) return;

  const countryCode = countryEl.value;
  const countryObj = AYNA_CALENDAR_CONFIG.locations[countryCode];
  if (!countryObj) return;

  districtEl.innerHTML = "";
  Object.keys(countryObj.districts).forEach((distName) => {
    const option = document.createElement("option");
    option.value = distName;
    option.textContent = distName;
    districtEl.appendChild(option);
  });

  syncCalendarSelectionToClock();
}

function syncCalendarSelectionToClock() {
  const countryCode = $("calCountrySelect")?.value || AYNA_CALENDAR_CONFIG.defaultCountry;
  const districtName = $("calDistrictSelect")?.value || AYNA_CALENDAR_CONFIG.defaultDistrict;
  const leadHours = Number($("calIftarLeadHours")?.value || 1);

  const countryObj = AYNA_CALENDAR_CONFIG.locations[countryCode];
  const times = countryObj?.districts?.[districtName] || { sehri: "04:58", iftar: "17:12" };

  const hijriInfo = getHijriDateInfo(new Date());

  const payload = {
    countryCode,
    countryName: countryObj?.countryName || "",
    districtName,
    sehri: times.sehri,
    iftar: times.iftar,
    iftarLeadHours: leadHours,
    hijriDate: hijriInfo.banglaText,
    updatedAt: Date.now()
  };

  try {
    localStorage.setItem(AYNA_CALENDAR_CONFIG.storageKey, JSON.stringify(payload));
  } catch (err) {
    console.error("Storage sync error:", err);
  }

  const previewBox = $("calTimePreview");
  if (previewBox) {
    previewBox.textContent =
      `${payload.countryName} — ${payload.districtName} | সেহরি: ${payload.sehri} | ইফতার: ${payload.iftar}`;
  }

  const goClockLink = $("goToClockBtn");
  if (goClockLink) {
    goClockLink.href =
      `clock.html?country=${encodeURIComponent(countryCode)}&district=${encodeURIComponent(districtName)}&lead=${leadHours}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderHijriHeader();

  const countryEl = $("calCountrySelect");
  const districtEl = $("calDistrictSelect");
  const leadEl = $("calIftarLeadHours");

  if (countryEl) {
    countryEl.value = AYNA_CALENDAR_CONFIG.defaultCountry;
    countryEl.addEventListener("change", populateCalendarDistricts);
  }

  if (districtEl) {
    districtEl.addEventListener("change", syncCalendarSelectionToClock);
  }

  if (leadEl) {
    leadEl.addEventListener("change", syncCalendarSelectionToClock);
  }

  populateCalendarDistricts();
});