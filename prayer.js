/* =========================================================
   AYNA BOOK
   Prayer + Ramadan + Annual Prayer Calendar
   ========================================================= */

const API = "https://api.aladhan.com/v1";

const $ = (id) => document.getElementById(id);

/* ---------------------------------------------------------
   Default Settings
--------------------------------------------------------- */

const DEFAULTS = {
  country: "Bangladesh",
  city: "Cox's Bazar",
  method: 1,
  school: 1,
  sehriAdjust: 0,
  iftarAdjust: 0,
  ramadanAlarm: false,
  latitude: null,
  longitude: null
};

let settings = loadSettings();

let todayData = null;
let annualData = [];
let ramadanData = [];

let countdownTimer = null;
let fastCountdownTimer = null;

let alarmState = {
  Fajr: false,
  Dhuhr: false,
  Asr: false,
  Maghrib: false,
  Isha: false
};

const prayerNames = {
  Fajr: "ফজর",
  Dhuhr: "যোহর",
  Asr: "আসর",
  Maghrib: "মাগরিব",
  Isha: "এশা"
};


/* ---------------------------------------------------------
   Local Storage
--------------------------------------------------------- */

function loadSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("aynaPrayerSettings")
    );

    return {
      ...DEFAULTS,
      ...(saved || {})
    };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

function saveSettings() {
  localStorage.setItem(
    "aynaPrayerSettings",
    JSON.stringify(settings)
  );
}


/* ---------------------------------------------------------
   Load Alarm Settings
--------------------------------------------------------- */

function loadAlarmSettings() {

  try {

    const saved = JSON.parse(
      localStorage.getItem("aynaPrayerAlarms")
    );

    if (saved) {
      alarmState = {
        ...alarmState,
        ...saved
      };
    }

  } catch (e) {}

}


/* ---------------------------------------------------------
   Save Alarm Settings
--------------------------------------------------------- */

function saveAlarmSettings() {

  localStorage.setItem(
    "aynaPrayerAlarms",
    JSON.stringify(alarmState)
  );

}


/* ---------------------------------------------------------
   Time Helpers
--------------------------------------------------------- */

function timeToMinutes(time) {

  if (!time) return null;

  const clean = String(time)
    .replace(/\s/g, "")
    .split(" ")[0];

  const parts = clean.split(":");

  if (parts.length < 2) return null;

  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);

  if (
    Number.isNaN(h) ||
    Number.isNaN(m)
  ) {
    return null;
  }

  return h * 60 + m;
}


function addMinutes(time, amount) {

  const total =
    timeToMinutes(time) +
    Number(amount || 0);

  if (!Number.isFinite(total)) {
    return time;
  }

  const normalized =
    ((total % 1440) + 1440) % 1440;

  const h = Math.floor(normalized / 60);
  const m = normalized % 60;

  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0")
  );
}


function formatBanglaTime(time) {

  if (!time) return "--:--";

  const t = String(time)
    .replace(/\s/g, "")
    .split(" ")[0];

  const parts = t.split(":");

  if (parts.length < 2) {
    return time;
  }

  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);

  if (Number.isNaN(h) || Number.isNaN(m)) {
    return time;
  }

  const ampm = h >= 12 ? "PM" : "AM";

  h = h % 12;

  if (h === 0) h = 12;

  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    " " +
    ampm
  );
}


function toBanglaDigits(value) {

  const map = {
    0: "০",
    1: "১",
    2: "২",
    3: "৩",
    4: "৪",
    5: "৫",
    6: "৬",
    7: "৭",
    8: "৮",
    9: "৯"
  };

  return String(value).replace(
    /\d/g,
    d => map[d]
  );
}


/* ---------------------------------------------------------
   Date Helpers
--------------------------------------------------------- */

function getTodayString() {

  const now = new Date();

  const d = String(now.getDate())
    .padStart(2, "0");

  const m = String(now.getMonth() + 1)
    .padStart(2, "0");

  const y = now.getFullYear();

  return `${d}-${m}-${y}`;
}


function getTodayISO() {

  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}


function isoToDate(dateString) {

  if (!dateString) return null;

  const p = String(dateString).split("-");

  if (p.length !== 3) return null;

  return new Date(
    Number(p[0]),
    Number(p[1]) - 1,
    Number(p[2])
  );
}


function formatDateBangla(dateString) {

  const d = isoToDate(dateString);

  if (!d) return dateString || "";

  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর"
  ];

  return (
    toBanglaDigits(d.getDate()) +
    " " +
    months[d.getMonth()] +
    " " +
    toBanglaDigits(d.getFullYear())
  );
}


/* ---------------------------------------------------------
   API URL
--------------------------------------------------------- */

function locationQuery() {

  const params = new URLSearchParams();

  params.set("method", settings.method);
  params.set("school", settings.school);

  if (settings.sehriAdjust) {
    params.set(
      "tune",
      `0,0,0,0,0,${settings.iftarAdjust || 0},0,0,${settings.sehriAdjust || 0}`
    );
  }

  return params.toString();
}


/* ---------------------------------------------------------
   Fetch JSON
--------------------------------------------------------- */

async function fetchJSON(url) {

  const response = await fetch(url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}`
    );
  }

  const json = await response.json();

  if (
    json.code &&
    json.code !== 200
  ) {
    throw new Error(
      json.status || "API error"
    );
  }

  return json;
}


/* ---------------------------------------------------------
   Daily Prayer Data
--------------------------------------------------------- */

async function loadToday() {

  const date = getTodayString();

  let url;

  if (
    settings.latitude !== null &&
    settings.longitude !== null
  ) {

    url =
      `${API}/timings/${date}` +
      `?latitude=${encodeURIComponent(settings.latitude)}` +
      `&longitude=${encodeURIComponent(settings.longitude)}` +
      `&method=${settings.method}` +
      `&school=${settings.school}`;

  } else {

    url =
      `${API}/timingsByCity/${date}` +
      `?city=${encodeURIComponent(settings.city)}` +
      `&country=${encodeURIComponent(settings.country)}` +
      `&method=${settings.method}` +
      `&school=${settings.school}`;
  }

  const json = await fetchJSON(url);

  todayData = json.data;

  renderToday();

}


/* ---------------------------------------------------------
   Render Today's Prayer
--------------------------------------------------------- */

function renderToday() {

  if (!todayData) return;

  const t = todayData.timings || {};

  const prayerTimes = {
    Fajr: t.Fajr,
    Dhuhr: t.Dhuhr,
    Asr: t.Asr,
    Maghrib: t.Maghrib,
    Isha: t.Isha
  };

  setText(
    "fajrTime",
    formatBanglaTime(
      addMinutes(
        prayerTimes.Fajr,
        0
      )
    )
  );

  setText(
    "dhuhrTime",
    formatBanglaTime(
      prayerTimes.Dhuhr
    )
  );

  setText(
    "asrTime",
    formatBanglaTime(
      prayerTimes.Asr
    )
  );

  setText(
    "maghribTime",
    formatBanglaTime(
      prayerTimes.Maghrib
    )
  );

  setText(
    "ishaTime",
    formatBanglaTime(
      prayerTimes.Isha
    )
  );


  const imsak =
    t.Imsak ||
    t.Fajr;

  const sehri =
    addMinutes(
      imsak,
      settings.sehriAdjust || 0
    );

  const iftar =
    addMinutes(
      t.Maghrib ||
      t.Sunset,
      settings.iftarAdjust || 0
    );


  setText(
    "todaySehri",
    formatBanglaTime(sehri)
  );

  setText(
    "todayIftar",
    formatBanglaTime(iftar)
  );


  const hijri =
    todayData.date &&
    todayData.date.hijri;

  if (hijri) {

    setText(
      "currentHijri",
      `${hijri.day} ${hijri.month.en} ${hijri.year}`
    );
  }


  if (todayData.date) {

    const gregorian =
      todayData.date.gregorian;

    if (gregorian) {

      setText(
        "dateText",
        formatDateBangla(
          gregorian.date.split("-").reverse().join("-")
        )
      );
    }
  }


  setText(
    "locationText",
    `${settings.country} • ${settings.city}`
  );

  startPrayerCountdown();

  startFastCountdown(
    sehri,
    iftar
  );
}


/* ---------------------------------------------------------
   Set Text
--------------------------------------------------------- */

function setText(id, value) {

  const el = $(id);

  if (el) {
    el.textContent = value;
  }

}


/* ---------------------------------------------------------
   Annual Prayer Calendar
--------------------------------------------------------- */

async function loadAnnualCalendar() {

  const year =
    new Date().getFullYear();

  let url;

  if (
    settings.latitude !== null &&
    settings.longitude !== null
  ) {

    url =
      `${API}/calendar/${year}` +
      `?latitude=${encodeURIComponent(settings.latitude)}` +
      `&longitude=${encodeURIComponent(settings.longitude)}` +
      `&method=${settings.method}` +
      `&school=${settings.school}`;

  } else {

    url =
      `${API}/calendarByCity/${year}` +
      `?city=${encodeURIComponent(settings.city)}` +
      `&country=${encodeURIComponent(settings.country)}` +
      `&method=${settings.method}` +
      `&school=${settings.school}`;
  }

  const json = await fetchJSON(url);

  annualData = Array.isArray(json.data)
    ? json.data
    : [];

  renderAnnualCalendar();

  /*
    Annual data থেকে Ramadan-ও বের করা হবে।
    Hijri month 9 = Ramadan.
  */

  ramadanData =
    annualData.filter(item => {

      const h =
        item.date &&
        item.date.hijri;

      return (
        h &&
        h.month &&
        Number(h.month.number) === 9
      );
    });

  renderRamadanCalendar();

}


/* ---------------------------------------------------------
   Annual Calendar UI
--------------------------------------------------------- */

function ensureAnnualSection() {

  let section =
    document.getElementById(
      "annualPrayerSection"
    );

  if (section) {
    return section;
  }

  section =
    document.createElement("section");

  section.id =
    "annualPrayerSection";

  section.className =
    "section";

  section.innerHTML = `

    <div class="section-title">
      <h3>📆 সারা বছরের নামাজের সময়</h3>
      <span class="badge" id="annualYearBadge">
        ${new Date().getFullYear()}
      </span>
    </div>

    <div class="calendar-wrap">

      <table>

        <thead>
          <tr>
            <th>তারিখ</th>
            <th>হিজরি</th>
            <th>ফজর</th>
            <th>যোহর</th>
            <th>আসর</th>
            <th>মাগরিব</th>
            <th>এশা</th>
          </tr>
        </thead>

        <tbody id="annualPrayerBody">
          <tr>
            <td colspan="7"
                class="loading">
              সারা বছরের নামাজের সময় লোড হচ্ছে...
            </td>
          </tr>
        </tbody>

      </table>

    </div>

    <div class="calendar-note">
      এই তালিকায় নির্বাচিত বছরের প্রতিদিনের
      ৫ ওয়াক্ত নামাজের সময় দেখানো হবে।
    </div>
  `;

  const main =
    document.querySelector(".container");

  const footer =
    document.querySelector(".footer");

  if (main && footer) {
    main.insertBefore(section, footer);
  } else if (main) {
    main.appendChild(section);
  }

  return section;
}


/* ---------------------------------------------------------
   Render Annual Calendar
--------------------------------------------------------- */

function renderAnnualCalendar() {

  const section =
    ensureAnnualSection();

  const body =
    document.getElementById(
      "annualPrayerBody"
    );

  if (!body) return;

  if (!annualData.length) {

    body.innerHTML = `
      <tr>
        <td colspan="7"
            class="loading">
          কোনো বার্ষিক তথ্য পাওয়া যায়নি।
        </td>
      </tr>
    `;

    return;
  }

  const today =
    getTodayISO();

  let html = "";

  annualData.forEach(item => {

    const g =
      item.date &&
      item.date.gregorian;

    const h =
      item.date &&
      item.date.hijri;

    if (!g) return;

    const iso =
      `${g.year}-${String(g.month.number).padStart(2,"0")}-${String(g.day).padStart(2,"0")}`;

    const isToday =
      iso === today;

    const t =
      item.timings || {};

    html += `

      <tr class="${isToday ? "today" : ""}">

        <td>
          ${toBanglaDigits(g.day)}
          /
          ${toBanglaDigits(g.month.number)}
        </td>

        <td>
          ${h ? toBanglaDigits(h.day) : "-"}
          <span class="hijri">
            ${h ? h.month.en : ""}
          </span>
        </td>

        <td>
          ${formatBanglaTime(t.Fajr)}
        </td>

        <td>
          ${formatBanglaTime(t.Dhuhr)}
        </td>

        <td>
          ${formatBanglaTime(t.Asr)}
        </td>

        <td>
          ${formatBanglaTime(t.Maghrib)}
        </td>

        <td>
          ${formatBanglaTime(t.Isha)}
        </td>

      </tr>
    `;
  });

  body.innerHTML =
    html ||
    `
      <tr>
        <td colspan="7"
            class="loading">
          তথ্য পাওয়া যায়নি।
        </td>
      </tr>
    `;

}


/* ---------------------------------------------------------
   Ramadan Calendar
--------------------------------------------------------- */

function renderRamadanCalendar() {

  const body =
    $("ramadanCalendarBody");

  if (!body) return;

  if (!ramadanData.length) {

    body.innerHTML = `
      <tr>
        <td colspan="5"
            class="loading">

          এই Gregorian বছরে Ramadan-এর
          ৩০ দিনের তথ্য পাওয়া যায়নি।

        </td>
      </tr>
    `;

    setText(
      "ramadanYear",
      "Ramadan"
    );

    return;
  }


  ramadanData.sort(
    (a,b) =>
      Number(a.date.hijri.day) -
      Number(b.date.hijri.day)
  );


  const ramadanYear =
    ramadanData[0]
      ?.date
      ?.hijri
      ?.year;

  setText(
    "ramadanYear",
    ramadanYear
      ? `রমজান ${ramadanYear}`
      : "রমজান"
  );


  let html = "";

  const today =
    getTodayISO();


  ramadanData.forEach(item => {

    const g =
      item.date.gregorian;

    const h =
      item.date.hijri;

    const t =
      item.timings || {};


    const iso =
      `${g.year}-${String(g.month.number).padStart(2,"0")}-${String(g.day).padStart(2,"0")}`;


    const isToday =
      iso === today;


    let sehri =
      t.Imsak ||
      t.Fajr;


    let iftar =
      t.Maghrib ||
      t.Sunset;


    sehri =
      addMinutes(
        sehri,
        settings.sehriAdjust || 0
      );


    iftar =
      addMinutes(
        iftar,
        settings.iftarAdjust || 0
      );


    html += `

      <tr class="${isToday ? "today" : ""}">

        <td>
          <span class="day-number">
            ${toBanglaDigits(h.day)}
          </span>
        </td>

        <td>
          ${toBanglaDigits(h.day)}
          <span class="hijri">
            ${h.month.en}
          </span>
        </td>

        <td>
          ${formatDateBangla(iso)}
        </td>

        <td class="sehri">
          ${formatBanglaTime(sehri)}
        </td>

        <td class="iftar">
          ${formatBanglaTime(iftar)}
        </td>

      </tr>
    `;
  });


  body.innerHTML =
    html ||
    `
      <tr>
        <td colspan="5"
            class="loading">
          রোজার তথ্য পাওয়া যায়নি।
        </td>
      </tr>
    `;
}


/* ---------------------------------------------------------
   Prayer Countdown
--------------------------------------------------------- */

function startPrayerCountdown() {

  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  updatePrayerCountdown();

  countdownTimer =
    setInterval(
      updatePrayerCountdown,
      1000
    );
}


function updatePrayerCountdown() {

  if (!todayData) return;

  const t =
    todayData.timings || {};

  const now =
    new Date();

  const nowMinutes =
    now.getHours() * 60 +
    now.getMinutes() +
    now.getSeconds() / 60;


  const prayers = [
    {
      key: "Fajr",
      time: t.Fajr
    },
    {
      key: "Dhuhr",
      time: t.Dhuhr
    },
    {
      key: "Asr",
      time: t.Asr
    },
    {
      key: "Maghrib",
      time: t.Maghrib
    },
    {
      key: "Isha",
      time: t.Isha
    }
  ];


  let next = null;

  for (const p of prayers) {

    const mins =
      timeToMinutes(p.time);

    if (
      mins !== null &&
      mins > nowMinutes
    ) {
      next = p;
      break;
    }
  }


  /*
    যদি আজকের সব নামাজ শেষ হয়ে যায়,
    তাহলে আগামীকালের ফজরকে next হিসেবে দেখাবে।
  */

  if (!next) {

    const fajr =
      timeToMinutes(t.Fajr);

    if (fajr !== null) {

      const diff =
        (1440 - nowMinutes) +
        fajr;

      setText(
        "nextPrayer",
        "আগামীকাল " +
        prayerNames.Fajr
      );

      setText(
        "countdown",
        formatDuration(diff * 60)
      );

      return;
    }
  }


  if (!next) return;


  const nextMinutes =
    timeToMinutes(next.time);

  const diffSeconds =
    Math.max(
      0,
      Math.round(
        (nextMinutes - nowMinutes) *
        60
      )
    );


  setText(
    "nextPrayer",
    prayerNames[next.key]
  );


  setText(
    "countdown",
    formatDuration(diffSeconds)
  );
}


/* ---------------------------------------------------------
   Duration
--------------------------------------------------------- */

function formatDuration(totalSeconds) {

  totalSeconds =
    Math.max(
      0,
      Math.floor(totalSeconds)
    );

  const h =
    Math.floor(
      totalSeconds / 3600
    );

  const m =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const s =
    totalSeconds % 60;

  return (
    String(h).padStart(2,"0") +
    ":" +
    String(m).padStart(2,"0") +
    ":" +
    String(s).padStart(2,"0")
  );
}


/* ---------------------------------------------------------
   Sehri / Iftar Countdown
--------------------------------------------------------- */

function startFastCountdown(
  sehri,
  iftar
) {

  if (fastCountdownTimer) {
    clearInterval(fastCountdownTimer);
  }

  function update() {

    const now =
      new Date();

    const nowSeconds =
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds();


    const sehriMin =
      timeToMinutes(sehri);

    const iftarMin =
      timeToMinutes(iftar);


    if (
      sehriMin === null ||
      iftarMin === null
    ) {
      return;
    }


    const sehriSeconds =
      sehriMin * 60;

    const iftarSeconds =
      iftarMin * 60;


    let target;
    let label;


    if (nowSeconds < sehriSeconds) {

      target =
        sehriSeconds;

      label =
        "সেহরি শেষ হতে";

    } else if (
      nowSeconds < iftarSeconds
    ) {

      target =
        iftarSeconds;

      label =
        "ইফতার হতে";

    } else {

      setText(
        "fastCountdown",
        "আজকের ইফতার শেষ হয়েছে"
      );

      return;
    }


    const diff =
      target - nowSeconds;


    setText(
      "fastCountdown",
      `${label}: ${formatDuration(diff)}`
    );
  }


  update();

  fastCountdownTimer =
    setInterval(
      update,
      1000
    );
}


/* ---------------------------------------------------------
   GPS
--------------------------------------------------------- */

function useGPS() {

  if (!navigator.geolocation) {

    showStatus(
      "এই ফোনে GPS/Geolocation পাওয়া যাচ্ছে না।",
      true
    );

    return;
  }


  showStatus(
    "📍 GPS অবস্থান নেওয়া হচ্ছে..."
  );


  navigator.geolocation.getCurrentPosition(

    async position => {

      settings.latitude =
        position.coords.latitude;

      settings.longitude =
        position.coords.longitude;


      settings.city =
        "GPS Location";


      saveSettings();

      syncForm();


      try {

        await loadToday();

        await loadAnnualCalendar();

        showStatus(
          "✅ GPS অবস্থান অনুযায়ী নামাজ ও রোজার সময় আপডেট হয়েছে।"
        );

      } catch (error) {

        console.error(error);

        showStatus(
          "GPS পাওয়া গেছে, কিন্তু সময়সূচী লোড করা যায়নি।",
          true
        );
      }

    },

    error => {

      console.error(error);

      showStatus(
        "GPS অনুমতি দেওয়া হয়নি অথবা অবস্থান পাওয়া যায়নি। শহরের নাম দিয়ে চেষ্টা করুন।",
        true
      );
    },

    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 600000
    }
  );
}


/* ---------------------------------------------------------
   Update Settings From Form
--------------------------------------------------------- */

function readForm() {

  const country =
    $("country")?.value.trim();

  const city =
    $("city")?.value.trim();

  const method =
    Number(
      $("method")?.value || 1
    );

  const school =
    Number(
      $("school")?.value || 1
    );

  const sehriAdjust =
    Number(
      $("sehriAdjust")?.value || 0
    );

  const iftarAdjust =
    Number(
      $("iftarAdjust")?.value || 0
    );


  settings.country =
    country || "Bangladesh";

  settings.city =
    city || "Cox's Bazar";

  settings.method =
    method;

  settings.school =
    school;

  settings.sehriAdjust =
    sehriAdjust;

  settings.iftarAdjust =
    iftarAdjust;


  /*
    শহর manually পরিবর্তন করলে GPS location
    বাদ দেওয়া হবে।
  */

  settings.latitude = null;
  settings.longitude = null;


  saveSettings();
}


/* ---------------------------------------------------------
   Sync Form
--------------------------------------------------------- */

function syncForm() {

  if ($("country")) {
    $("country").value =
      settings.country;
  }

  if ($("city")) {
    $("city").value =
      settings.city;
  }

  if ($("method")) {
    $("method").value =
      String(settings.method);
  }

  if ($("school")) {
    $("school").value =
      String(settings.school);
  }

  if ($("sehriAdjust")) {
    $("sehriAdjust").value =
      settings.sehriAdjust;
  }

  if ($("iftarAdjust")) {
    $("iftarAdjust").value =
      settings.iftarAdjust;
  }

  if ($("ramadanAlarm")) {
    $("ramadanAlarm").checked =
      settings.ramadanAlarm;
  }

}


/* ---------------------------------------------------------
   Update Everything
--------------------------------------------------------- */

async function updateEverything() {

  try {

    readForm();

    showStatus(
      "⏳ নামাজ, রোজা ও সারা বছরের ক্যালেন্ডার লোড হচ্ছে..."
    );


    await loadToday();

    await loadAnnualCalendar();


    showStatus(
      "✅ নামাজের সময়, ৩০ দিনের রোজার ক্যালেন্ডার এবং সারা বছরের নামাজের সময় আপডেট হয়েছে।"
    );


  } catch (error) {

    console.error(error);

    showStatus(
      "❌ সময়সূচী লোড করা যায়নি। দেশ/শহরের নাম পরীক্ষা করুন এবং Internet চালু রাখুন।",
      true
    );
  }
}


/* ---------------------------------------------------------
   Status
--------------------------------------------------------- */

function showStatus(
  message,
  error = false
) {

  const el =
    $("statusMsg");

  if (!el) return;

  el.textContent =
    message;

  el.classList.toggle(
    "error",
    error
  );
}


/* ---------------------------------------------------------
   Prayer Alarm
--------------------------------------------------------- */

function setupPrayerAlarms() {

  loadAlarmSettings();


  document
    .querySelectorAll(
      ".alarm"
    )
    .forEach(checkbox => {

      const key =
        checkbox.dataset.prayer;

      checkbox.checked =
        !!alarmState[key];


      checkbox.addEventListener(
        "change",
        () => {

          alarmState[key] =
            checkbox.checked;

          saveAlarmSettings();

          if (
            checkbox.checked
          ) {

            speak(
              `${prayerNames[key]} এর অ্যালার্ম চালু হয়েছে।`
            );

          }

        }
      );

    });
}


/* ---------------------------------------------------------
   Voice
--------------------------------------------------------- */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {
    return;
  }

  try {

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.lang =
      "bn-BD";

    utterance.rate =
      0.9;

    utterance.pitch =
      1;

    window.speechSynthesis.speak(
      utterance
    );

  } catch (e) {
    console.error(e);
  }
}


/* ---------------------------------------------------------
   Check Prayer Alarms
--------------------------------------------------------- */

let lastAlarmKey = "";


function checkPrayerAlarms() {

  if (!todayData) return;

  const t =
    todayData.timings || {};

  const now =
    new Date();

  const currentHour =
    now.getHours();

  const currentMinute =
    now.getMinutes();


  const prayers = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
  ];


  prayers.forEach(key => {

    if (!alarmState[key]) {
      return;
    }

    const time =
      t[key];

    if (!time) return;

    const minutes =
      timeToMinutes(time);

    if (minutes === null) {
      return;
    }


    if (
      currentHour ===
      Math.floor(minutes / 60) &&

      currentMinute ===
      minutes % 60
    ) {

      const alarmKey =
        `${getTodayISO()}-${key}-${currentHour}-${currentMinute}`;


      if (
        lastAlarmKey !== alarmKey
      ) {

        lastAlarmKey =
          alarmKey;

        speak(
          `${prayerNames[key]} এর সময় হয়েছে।`
        );

        vibrate();
      }
    }

  });
}


/* ---------------------------------------------------------
   Ramadan Alert
--------------------------------------------------------- */

let lastRamadanAlert = "";


function checkRamadanAlert() {

  if (
    !settings.ramadanAlarm ||
    !todayData
  ) {
    return;
  }


  const t =
    todayData.timings || {};


  const sehri =
    addMinutes(
      t.Imsak || t.Fajr,
      settings.sehriAdjust || 0
    );


  const iftar =
    addMinutes(
      t.Maghrib || t.Sunset,
      settings.iftarAdjust || 0
    );


  const now =
    new Date();


  const nowMinutes =
    now.getHours() * 60 +
    now.getMinutes();


  const sehriMinutes =
    timeToMinutes(sehri);

  const iftarMinutes =
    timeToMinutes(iftar);


  /*
    সেহরির ৯০ মিনিট আগে
  */

  if (
    sehriMinutes !== null
  ) {

    const alertTime =
      sehriMinutes - 90;


    if (
      nowMinutes === alertTime
    ) {

      const key =
        `${getTodayISO()}-sehri`;

      if (
        lastRamadanAlert !== key
      ) {

        lastRamadanAlert =
          key;

        speak(
          "সেহরি শেষ হতে ১ ঘণ্টা ৩০ মিনিট বাকি।"
        );

        vibrate();
      }
    }
  }


  /*
    ইফতারের ৬০ মিনিট আগে
  */

  if (
    iftarMinutes !== null
  ) {

    const alertTime =
      iftarMinutes - 60;


    if (
      nowMinutes === alertTime
    ) {

      const key =
        `${getTodayISO()}-iftar`;

      if (
        lastRamadanAlert !== key
      ) {

        lastRamadanAlert =
          key;

        speak(
          "ইফতার হতে ১ ঘণ্টা বাকি।"
        );

        vibrate();
      }
    }
  }
}


/* ---------------------------------------------------------
   Vibration
--------------------------------------------------------- */

function vibrate() {

  if (
    "vibrate" in navigator
  ) {

    navigator.vibrate([
      300,
      150,
      300
    ]);
  }

}


/* ---------------------------------------------------------
   Alarm Loop
--------------------------------------------------------- */

setInterval(() => {

  checkPrayerAlarms();

  checkRamadanAlert();

}, 1000);


/* ---------------------------------------------------------
   Ramadan Alarm Toggle
--------------------------------------------------------- */

function setupRamadanAlarm() {

  const checkbox =
    $("ramadanAlarm");

  if (!checkbox) {
    return;
  }


  checkbox.checked =
    !!settings.ramadanAlarm;


  checkbox.addEventListener(
    "change",
    () => {

      settings.ramadanAlarm =
        checkbox.checked;

      saveSettings();


      if (
        checkbox.checked
      ) {

        speak(
          "সেহরি ও ইফতার Alert চালু হয়েছে।"
        );
      }

    }
  );
}


/* ---------------------------------------------------------
   Reset
--------------------------------------------------------- */

function resetSettings() {

  settings =
    { ...DEFAULTS };

  localStorage.removeItem(
    "aynaPrayerSettings"
  );

  localStorage.removeItem(
    "aynaPrayerAlarms"
  );

  alarmState = {
    Fajr: false,
    Dhuhr: false,
    Asr: false,
    Maghrib: false,
    Isha: false
  };

  syncForm();

  document
    .querySelectorAll(
      ".alarm"
    )
    .forEach(
      el => el.checked = false
    );


  updateEverything();
}


/* ---------------------------------------------------------
   Event Listeners
--------------------------------------------------------- */

function setupEvents() {

  const updateBtn =
    $("updateBtn");

  if (updateBtn) {

    updateBtn.addEventListener(
      "click",
      updateEverything
    );
  }


  const resetBtn =
    $("resetBtn");

  if (resetBtn) {

    resetBtn.addEventListener(
      "click",
      resetSettings
    );
  }


  const gpsBtn =
    $("gpsBtn");

  if (gpsBtn) {

    gpsBtn.addEventListener(
      "click",
      useGPS
    );
  }


  const backBtn =
    $("backBtn");

  if (backBtn) {

    backBtn.addEventListener(
      "click",
      () => {

        if (
          history.length > 1
        ) {

          history.back();

        } else {

          window.location.href =
            "./index.html";
        }

      }
    );
  }

}


/* ---------------------------------------------------------
   Auto Refresh At Midnight
--------------------------------------------------------- */

let lastDate =
  getTodayISO();


setInterval(() => {

  const nowDate =
    getTodayISO();

  if (
    nowDate !== lastDate
  ) {

    lastDate =
      nowDate;

    updateEverything();
  }

}, 30000);


/* ---------------------------------------------------------
   Start
--------------------------------------------------------- */

async function init() {

  syncForm();

  setupEvents();

  setupPrayerAlarms();

  setupRamadanAlarm();

  await updateEverything();

}


init();