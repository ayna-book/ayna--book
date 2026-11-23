// =====================================================
// AYNA BOOK
// GLOBAL PRAYER + RAMADAN TIME SYSTEM
// =====================================================

const API =
  "https://api.aladhan.com/v1/timingsByCity";


// =====================================================
// ELEMENTS
// =====================================================

const locationText =
  document.getElementById("locationText");

const dateText =
  document.getElementById("dateText");

const nextPrayer =
  document.getElementById("nextPrayer");

const countdown =
  document.getElementById("countdown");

const ramadanCountdown =
  document.getElementById("ramadanCountdown");

const statusEl =
  document.getElementById("status");


// =====================================================
// PRAYER ELEMENTS
// =====================================================

const prayerElements = {

  Fajr:
    document.getElementById("fajrTime"),

  Dhuhr:
    document.getElementById("dhuhrTime"),

  Asr:
    document.getElementById("asrTime"),

  Maghrib:
    document.getElementById("maghribTime"),

  Isha:
    document.getElementById("ishaTime")

};


// =====================================================
// ALARM ELEMENTS
// =====================================================

const alarmElements = {

  Fajr:
    document.getElementById("alarmFajr"),

  Dhuhr:
    document.getElementById("alarmDhuhr"),

  Asr:
    document.getElementById("alarmAsr"),

  Maghrib:
    document.getElementById("alarmMaghrib"),

  Isha:
    document.getElementById("alarmIsha")

};


const ramadanAlarm =
  document.getElementById("ramadanAlarm");


// =====================================================
// SETTINGS
// =====================================================

const countryInput =
  document.getElementById("countryInput");

const cityInput =
  document.getElementById("cityInput");

const methodSelect =
  document.getElementById("methodSelect");

const schoolSelect =
  document.getElementById("schoolSelect");

const sehriAdjust =
  document.getElementById("sehriAdjust");

const iftarAdjust =
  document.getElementById("iftarAdjust");


// =====================================================
// DEFAULT
// =====================================================

let settings = {

  country:
    localStorage.getItem(
      "ayna_prayer_country"
    ) || "Bangladesh",

  city:
    localStorage.getItem(
      "ayna_prayer_city"
    ) || "Cox's Bazar",

  method:
    localStorage.getItem(
      "ayna_prayer_method"
    ) || "1",

  school:
    localStorage.getItem(
      "ayna_prayer_school"
    ) || "1",

  sehriAdjust:
    Number(
      localStorage.getItem(
        "ayna_sehri_adjust"
      ) || 0
    ),

  iftarAdjust:
    Number(
      localStorage.getItem(
        "ayna_iftar_adjust"
      ) || 0
    )

};


// =====================================================
// DATA
// =====================================================

let prayerData = null;

let timings = null;

let lastAlarmKey = "";


// =====================================================
// LOAD SETTINGS INTO UI
// =====================================================

function loadSettingsUI() {

  countryInput.value =
    settings.country;

  cityInput.value =
    settings.city;

  methodSelect.value =
    settings.method;

  schoolSelect.value =
    settings.school;

  sehriAdjust.value =
    settings.sehriAdjust;

  iftarAdjust.value =
    settings.iftarAdjust;
}


// =====================================================
// SAVE SETTINGS
// =====================================================

function saveSettings() {

  settings.country =
    countryInput.value.trim();

  settings.city =
    cityInput.value.trim();

  settings.method =
    methodSelect.value;

  settings.school =
    schoolSelect.value;

  settings.sehriAdjust =
    Number(sehriAdjust.value || 0);

  settings.iftarAdjust =
    Number(iftarAdjust.value || 0);


  localStorage.setItem(
    "ayna_prayer_country",
    settings.country
  );

  localStorage.setItem(
    "ayna_prayer_city",
    settings.city
  );

  localStorage.setItem(
    "ayna_prayer_method",
    settings.method
  );

  localStorage.setItem(
    "ayna_prayer_school",
    settings.school
  );

  localStorage.setItem(
    "ayna_sehri_adjust",
    settings.sehriAdjust
  );

  localStorage.setItem(
    "ayna_iftar_adjust",
    settings.iftarAdjust
  );
}


// =====================================================
// DATE
// =====================================================

function getToday() {

  const now = new Date();

  const day =
    String(now.getDate())
      .padStart(2, "0");

  const month =
    String(now.getMonth() + 1)
      .padStart(2, "0");

  const year =
    now.getFullYear();

  return `${day}-${month}-${year}`;
}


// =====================================================
// LOAD PRAYER TIMES
// =====================================================

async function loadPrayerTimes() {

  saveSettings();

  if (!settings.city ||
      !settings.country) {

    statusEl.textContent =
      "দেশ ও শহর দিন।";

    return;
  }


  statusEl.textContent =
    "⏳ নামাজের সময় লোড হচ্ছে...";


  try {

    const date =
      getToday();


    const url =
      `${API}/${date}` +
      `?city=${encodeURIComponent(settings.city)}` +
      `&country=${encodeURIComponent(settings.country)}` +
      `&method=${encodeURIComponent(settings.method)}` +
      `&school=${encodeURIComponent(settings.school)}` +
      `&iso8601=true`;


    const response =
      await fetch(url);


    if (!response.ok) {
      throw new Error(
        "API response error"
      );
    }


    const json =
      await response.json();


    if (
      json.code !== 200 ||
      !json.data
    ) {

      throw new Error(
        "Prayer data unavailable"
      );

    }


    prayerData =
      json.data;

    timings =
      json.data.timings;


    showPrayerTimes();

    showLocation();

    updateNextPrayer();

    statusEl.textContent =
      "✅ সময়সূচি আপডেট হয়েছে";


  } catch (error) {

    console.error(error);

    statusEl.textContent =
      "❌ সময়সূচি পাওয়া যায়নি। Internet connection পরীক্ষা করুন।";

  }

}


// =====================================================
// TIME CLEAN
// =====================================================

function cleanTime(value) {

  if (!value) {
    return "--:--";
  }

  return value.substring(0, 5);
}


// =====================================================
// SHOW PRAYER TIMES
// =====================================================

function showPrayerTimes() {

  const list = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
  ];


  list.forEach(
    name => {

      if (
        prayerElements[name]
      ) {

        prayerElements[name]
          .textContent =
          cleanTime(
            timings[name]
          );

      }

    }
  );


  // ---------------------------------------------------
  // SEHRI
  // ---------------------------------------------------

  let sehri =
    timings.Imsak ||
    timings.Fajr;


  sehri =
    adjustTime(
      cleanTime(sehri),
      settings.sehriAdjust
    );


  document.getElementById(
    "sehriTime"
  ).textContent =
    sehri;


  // ---------------------------------------------------
  // IFTAR
  // ---------------------------------------------------

  let iftar =
    timings.Maghrib ||
    timings.Sunset;


  iftar =
    adjustTime(
      cleanTime(iftar),
      settings.iftarAdjust
    );


  document.getElementById(
    "iftarTime"
  ).textContent =
    iftar;


  dateText.textContent =
    `আজ ${getToday()} • ${prayerData.date.hijri.date} হিজরি`;
}


// =====================================================
// LOCATION
// =====================================================

function showLocation() {

  const city =
    prayerData.meta?.timezone
      ? `${settings.city}, ${settings.country}`
      : `${settings.city}, ${settings.country}`;

  locationText.textContent =
    city;
}


// =====================================================
// ADJUST TIME
// =====================================================

function adjustTime(
  time,
  minutes
) {

  if (
    !time ||
    time === "--:--"
  ) {

    return time;

  }


  const parts =
    time.split(":");

  let h =
    Number(parts[0]);

  let m =
    Number(parts[1]);


  m += Number(minutes || 0);


  while (m >= 60) {

    m -= 60;
    h++;

  }


  while (m < 0) {

    m += 60;
    h--;

  }


  h =
    (h + 24) % 24;


  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0")
  );
}


// =====================================================
// TIME TO DATE
// =====================================================

function timeToDate(
  time
) {

  if (
    !time ||
    time === "--:--"
  ) {

    return null;

  }


  const parts =
    time.split(":");

  const date =
    new Date();


  date.setHours(
    Number(parts[0]),
    Number(parts[1]),
    0,
    0
  );


  return date;
}


// =====================================================
// NEXT PRAYER
// =====================================================

function updateNextPrayer() {

  if (!timings) {
    return;
  }


  const now =
    new Date();


  const prayers = [

    {
      name: "ফজর",
      key: "Fajr"
    },

    {
      name: "যোহর",
      key: "Dhuhr"
    },

    {
      name: "আসর",
      key: "Asr"
    },

    {
      name: "মাগরিব",
      key: "Maghrib"
    },

    {
      name: "এশা",
      key: "Isha"
    }

  ];


  let next = null;


  for (
    const prayer of prayers
  ) {

    const time =
      timeToDate(
        cleanTime(
          timings[prayer.key]
        )
      );


    if (
      time &&
      time > now
    ) {

      next = {
        ...prayer,
        time
      };

      break;

    }

  }


  // ---------------------------------------------------
  // AFTER ISHA → TOMORROW FAJR
  // ---------------------------------------------------

  if (!next) {

    next = {
      name: "ফজর",
      key: "Fajr",
      time: timeToDate(
        cleanTime(
          timings.Fajr
        )
      )
    };


    if (next.time) {
      next.time.setDate(
        next.time.getDate() + 1
      );
    }

  }


  if (!next) {
    return;
  }


  nextPrayer.textContent =
    next.name;


  updateCountdown(
    next.time
  );
}


// =====================================================
// COUNTDOWN
// =====================================================

function updateCountdown(
  target
) {

  if (!target) {
    return;
  }


  const now =
    new Date();


  let diff =
    target.getTime() -
    now.getTime();


  if (diff < 0) {

    updateNextPrayer();

    return;

  }


  const totalSeconds =
    Math.floor(
      diff / 1000
    );


  const hours =
    Math.floor(
      totalSeconds / 3600
    );


  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );


  const seconds =
    totalSeconds % 60;


  countdown.textContent =
    `${String(hours).padStart(2,"0")}:` +
    `${String(minutes).padStart(2,"0")}:` +
    `${String(seconds).padStart(2,"0")}`;
}


// =====================================================
// RAMADAN COUNTDOWN
// =====================================================

function updateRamadanCountdown() {

  if (!timings) {
    return;
  }


  const now =
    new Date();


  const sehri =
    timeToDate(
      adjustTime(
        cleanTime(
          timings.Imsak ||
          timings.Fajr
        ),
        settings.sehriAdjust
      )
    );


  const iftar =
    timeToDate(
      adjustTime(
        cleanTime(
          timings.Maghrib ||
          timings.Sunset
        ),
        settings.iftarAdjust
      )
    );


  let target = null;

  let label = "";


  if (
    sehri &&
    now < sehri
  ) {

    target = sehri;
    label = "সেহরি শেষ হতে";

  } else if (
    iftar &&
    now < iftar
  ) {

    target = iftar;
    label = "ইফতার হতে";

  }


  if (!target) {

    ramadanCountdown.textContent =
      "আজকের সেহরি/ইফতার সময় শেষ";

    return;
  }


  let diff =
    target.getTime() -
    now.getTime();


  const seconds =
    Math.floor(
      diff / 1000
    );


  const h =
    Math.floor(
      seconds / 3600
    );


  const m =
    Math.floor(
      (seconds % 3600) / 60
    );


  const s =
    seconds % 60;


  ramadanCountdown.textContent =
    `${label}: ` +
    `${String(h).padStart(2,"0")}:` +
    `${String(m).padStart(2,"0")}:` +
    `${String(s).padStart(2,"0")}`;
}


// =====================================================
// ALARM CHECK
// =====================================================

function checkAlarms() {

  if (!timings) {
    return;
  }


  const now =
    new Date();


  const currentHour =
    now.getHours();

  const currentMinute =
    now.getMinutes();


  // ---------------------------------------------------
  // FIVE PRAYER ALARMS
  // ---------------------------------------------------

  const prayers = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha"
  ];


  prayers.forEach(
    prayer => {

      const checkbox =
        alarmElements[prayer];


      if (
        !checkbox ||
        !checkbox.checked
      ) {
        return;
      }


      const time =
        cleanTime(
          timings[prayer]
        );


      if (!time) {
        return;
      }


      const parts =
        time.split(":");


      const hour =
        Number(parts[0]);

      const minute =
        Number(parts[1]);


      if (
        currentHour === hour &&
        currentMinute === minute
      ) {

        const key =
          `${prayer}-${getToday()}`;


        if (
          lastAlarmKey !== key
        ) {

          lastAlarmKey =
            key;

          playAlarm(
            `এখন ${getBanglaPrayerName(prayer)} নামাজের সময়।`
          );

        }

      }

    }
  );


  // ---------------------------------------------------
  // RAMADAN ALERT
  // ---------------------------------------------------

  if (
    ramadanAlarm.checked
  ) {

    checkRamadanAlerts();

  }

}


// =====================================================
// RAMADAN ALERTS
// =====================================================

function checkRamadanAlerts() {

  const now =
    new Date();


  // ---------------------------------------------------
  // SEHRI 90 MINUTES BEFORE
  // ---------------------------------------------------

  const sehri =
    timeToDate(
      adjustTime(
        cleanTime(
          timings.Imsak ||
          timings.Fajr
        ),
        settings.sehriAdjust
      )
    );


  // ---------------------------------------------------
  // IFTAR 60 MINUTES BEFORE
  // ---------------------------------------------------

  const iftar =
    timeToDate(
      adjustTime(
        cleanTime(
          timings.Maghrib ||
          timings.Sunset
        ),
        settings.iftarAdjust
      )
    );


  if (sehri) {

    const alertTime =
      new Date(
        sehri.getTime() -
        90 * 60 * 1000
      );


    if (
      sameMinute(
        now,
        alertTime
      )
    ) {

      playAlarm(
        "সেহরি শেষ হতে আর এক ঘণ্টা ত্রিশ মিনিট বাকি।"
      );

    }

  }


  if (iftar) {

    const alertTime =
      new Date(
        iftar.getTime() -
        60 * 60 * 1000
      );


    if (
      sameMinute(
        now,
        alertTime
      )
    ) {

      playAlarm(
        "ইফতার হতে আর এক ঘণ্টা বাকি।"
      );

    }

  }

}


// =====================================================
// SAME MINUTE
// =====================================================

function sameMinute(
  a,
  b
) {

  return (
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes()
  );

}


// =====================================================
// PRAYER NAME
// =====================================================

function getBanglaPrayerName(
  prayer
) {

  const names = {

    Fajr: "ফজর",

    Dhuhr: "যোহর",

    Asr: "আসর",

    Maghrib: "মাগরিব",

    Isha: "এশা"

  };


  return names[prayer] ||
    prayer;
}


// =====================================================
// ALARM
// =====================================================

function playAlarm(
  message
) {

  // Voice
  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();


    const voice =
      new SpeechSynthesisUtterance(
        message
      );


    voice.lang =
      "bn-BD";


    voice.rate =
      .85;


    voice.pitch =
      1;


    window.speechSynthesis.speak(
      voice
    );

  }


  // Vibration
  if (
    navigator.vibrate
  ) {

    navigator.vibrate([
      500,
      300,
      500,
      300,
      800
    ]);

  }

}


// =====================================================
// GPS
// =====================================================

document
  .getElementById("gpsBtn")
  .addEventListener(
    "click",
    () => {

      if (
        !navigator.geolocation
      ) {

        statusEl.textContent =
          "এই ফোনে GPS পাওয়া যায়নি।";

        return;
      }


      statusEl.textContent =
        "📍 GPS অবস্থান নেওয়া হচ্ছে...";


      navigator.geolocation.getCurrentPosition(

        async position => {

          const lat =
            position.coords.latitude;

          const lon =
            position.coords.longitude;


          await loadPrayerTimesByCoordinates(
            lat,
            lon
          );

        },

        error => {

          console.error(error);

          statusEl.textContent =
            "GPS permission দেওয়া হয়নি অথবা অবস্থান পাওয়া যায়নি।";

        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }

      );

    }
  );


// =====================================================
// LOAD BY COORDINATES
// =====================================================

async function loadPrayerTimesByCoordinates(
  latitude,
  longitude
) {

  try {

    statusEl.textContent =
      "🌍 GPS অনুযায়ী সময় বের করা হচ্ছে...";


    const date =
      getToday();


    const url =
      `https://api.aladhan.com/v1/timings/${date}` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&method=${settings.method}` +
      `&school=${settings.school}` +
      `&iso8601=true`;


    const response =
      await fetch(url);


    const json =
      await response.json();


    if (
      json.code !== 200 ||
      !json.data
    ) {

      throw new Error(
        "GPS prayer data unavailable"
      );

    }


    prayerData =
      json.data;

    timings =
      json.data.timings;


    showPrayerTimes();


    const timezone =
      json.data.meta?.timezone ||
      "Local";


    locationText.textContent =
      `GPS Location • ${timezone}`;


    statusEl.textContent =
      "✅ GPS অনুযায়ী সময় আপডেট হয়েছে";


  } catch (error) {

    console.error(error);

    statusEl.textContent =
      "❌ GPS অনুযায়ী সময় পাওয়া যায়নি।";

  }

}


// =====================================================
// LOAD BUTTON
// =====================================================

document
  .getElementById("loadBtn")
  .addEventListener(
    "click",
    () => {

      loadPrayerTimes();

    }
  );


// =====================================================
// RESET
// =====================================================

document
  .getElementById("resetBtn")
  .addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "ayna_prayer_country"
      );

      localStorage.removeItem(
        "ayna_prayer_city"
      );

      localStorage.removeItem(
        "ayna_prayer_method"
      );

      localStorage.removeItem(
        "ayna_prayer_school"
      );

      localStorage.removeItem(
        "ayna_sehri_adjust"
      );

      localStorage.removeItem(
        "ayna_iftar_adjust"
      );


      location.reload();

    }
  );


// =====================================================
// ALARM SAVE
// =====================================================

Object.keys(
  alarmElements
).forEach(
  prayer => {

    const checkbox =
      alarmElements[prayer];


    const storageKey =
      `ayna_alarm_${prayer}`;


    checkbox.checked =
      localStorage.getItem(
        storageKey
      ) === "true";


    checkbox.addEventListener(
      "change",
      () => {

        localStorage.setItem(
          storageKey,
          String(
            checkbox.checked
          )
        );

      }
    );

  }
);


// =====================================================
// RAMADAN ALARM SAVE
// =====================================================

ramadanAlarm.checked =
  localStorage.getItem(
    "ayna_ramadan_alarm"
  ) === "true";


ramadanAlarm.addEventListener(
  "change",
  () => {

    localStorage.setItem(
      "ayna_ramadan_alarm",
      String(
        ramadanAlarm.checked
      )
    );

  }
);


// =====================================================
// BACK
// =====================================================

document
  .getElementById("backBtn")
  .addEventListener(
    "click",
    () => {

      if (
        document.referrer
      ) {

        history.back();

      } else {

        window.location.href =
          "./index.html";

      }

    }
  );


// =====================================================
// REAL-TIME CLOCK
// =====================================================

setInterval(
  () => {

    updateNextPrayer();

    updateRamadanCountdown();

    checkAlarms();

  },
  1000
);


// =====================================================
// INITIALIZE
// =====================================================

loadSettingsUI();

loadPrayerTimes();