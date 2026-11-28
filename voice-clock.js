/* =========================================================
   AYNA BOOK — Voice Clock
   File: voice-clock.js
   No Firebase / No RTDB required
   Browser Web Speech API
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   CONFIG
--------------------------------------------------------- */

const DEFAULT_TIMEZONE = "Asia/Dhaka";
const DEFAULT_LANGUAGE = "bn-BD";
const DEFAULT_SPEED = 0.9;
const DEFAULT_FORMAT = "12";

let selectedLanguage =
  localStorage.getItem("aynaVoiceLanguage") || DEFAULT_LANGUAGE;

let speechRate =
  Number(localStorage.getItem("aynaVoiceSpeed")) || DEFAULT_SPEED;

let clockFormat =
  localStorage.getItem("aynaClockFormat") || DEFAULT_FORMAT;

let selectedTimezone =
  localStorage.getItem("aynaClockTimezone") || DEFAULT_TIMEZONE;

let voiceEnabled =
  localStorage.getItem("aynaVoiceEnabled") === "true";

let hourlyEnabled =
  localStorage.getItem("aynaHourlyEnabled") === "true";

let lastAnnouncedHour = null;
let voices = [];
let clockTimer = null;
let speechAvailable =
  "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;


/* ---------------------------------------------------------
   DOM
--------------------------------------------------------- */

const $ = (id) => document.getElementById(id);

const digitalClock = $("digitalClock");
const ampm = $("ampm");
const dateText = $("dateText");
const timezoneText = $("timezoneText");

const voiceStatus = $("voiceStatus");
const nextHourText = $("nextHourText");

const enableVoiceBtn = $("enableVoiceBtn");
const disableVoiceBtn = $("disableVoiceBtn");
const speakNowBtn = $("speakNowBtn");
const testVoiceBtn = $("testVoiceBtn");
const formatBtn = $("formatBtn");
const stopSpeechBtn = $("stopSpeechBtn");

const languageSelect = $("languageSelect");
const speedSelect = $("speedSelect");
const hourFormatSelect = $("hourFormatSelect");
const timezoneSelect = $("timezoneSelect");
const hourlyToggle = $("hourlyToggle");

const homeBtn = $("homeBtn");
const fullScreenBtn = $("fullScreenBtn");


/* ---------------------------------------------------------
   LANGUAGE DATA
--------------------------------------------------------- */

const LANGUAGE_DATA = {
  "bn-BD": {
    name: "বাংলা",
    voiceTest:
      "এটি আয়না বুক ভয়েস ক্লক। বাংলা ভয়েস পরীক্ষা সফল হয়েছে।",
    hourPrefix:
      "এখন সময়",
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    night: "রাত",
    oclock: "টা বাজে।",
    minute: "মিনিট",
    second: "সেকেন্ড",
    today: "আজ",
    timezone: "সময় অঞ্চল"
  },

  "en-US": {
    name: "English",
    voiceTest:
      "This is AYNA BOOK Voice Clock. The English voice test was successful.",
    hourPrefix:
      "The current time is",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
    oclock: "o'clock.",
    minute: "minutes",
    second: "seconds",
    today: "Today",
    timezone: "Time Zone"
  },

  "en-GB": {
    name: "English",
    voiceTest:
      "This is AYNA BOOK Voice Clock. The English voice test was successful.",
    hourPrefix:
      "The current time is",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night",
    oclock: "o'clock.",
    minute: "minutes",
    second: "seconds",
    today: "Today",
    timezone: "Time Zone"
  }
};


/* ---------------------------------------------------------
   STARTUP
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

  initializeControls();

  loadSpeechVoices();

  updateClock();

  clockTimer = setInterval(updateClock, 1000);

  if (speechAvailable) {

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      loadSpeechVoices
    );

  }

});


/* ---------------------------------------------------------
   INITIALIZE CONTROLS
--------------------------------------------------------- */

function initializeControls() {

  if (languageSelect) {
    languageSelect.value = selectedLanguage;
  }

  if (speedSelect) {
    speedSelect.value = String(speechRate);
  }

  if (hourFormatSelect) {
    hourFormatSelect.value = clockFormat;
  }

  if (timezoneSelect) {

    const exists = [
      ...timezoneSelect.options
    ].some(option => option.value === selectedTimezone);

    if (exists) {
      timezoneSelect.value = selectedTimezone;
    } else {
      selectedTimezone = DEFAULT_TIMEZONE;
      timezoneSelect.value = DEFAULT_TIMEZONE;
    }
  }

  if (hourlyToggle) {
    hourlyToggle.checked = hourlyEnabled;
  }

  updateVoiceStatus();

  updateHourlyStatus();


  /* Language */

  languageSelect?.addEventListener("change", () => {

    selectedLanguage = languageSelect.value;

    localStorage.setItem(
      "aynaVoiceLanguage",
      selectedLanguage
    );

    loadSpeechVoices();

    updateVoiceStatus();

  });


  /* Speech speed */

  speedSelect?.addEventListener("change", () => {

    const value = Number(speedSelect.value);

    if (Number.isFinite(value)) {

      speechRate = value;

      localStorage.setItem(
        "aynaVoiceSpeed",
        String(speechRate)
      );

    }

  });


  /* 12 / 24 */

  hourFormatSelect?.addEventListener("change", () => {

    clockFormat = hourFormatSelect.value;

    localStorage.setItem(
      "aynaClockFormat",
      clockFormat
    );

    updateClock();

  });


  /* Time Zone */

  timezoneSelect?.addEventListener("change", () => {

    selectedTimezone = timezoneSelect.value;

    localStorage.setItem(
      "aynaClockTimezone",
      selectedTimezone
    );

    lastAnnouncedHour = null;

    updateClock();

  });


  /* Hourly switch */

  hourlyToggle?.addEventListener("change", () => {

    hourlyEnabled = hourlyToggle.checked;

    localStorage.setItem(
      "aynaHourlyEnabled",
      String(hourlyEnabled)
    );

    if (!hourlyEnabled) {

      lastAnnouncedHour = null;

      stopSpeech();

    }

    updateHourlyStatus();

  });


  /* Voice buttons */

  enableVoiceBtn?.addEventListener(
    "click",
    enableVoice
  );

  disableVoiceBtn?.addEventListener(
    "click",
    disableVoice
  );

  speakNowBtn?.addEventListener(
    "click",
    speakCurrentTime
  );

  testVoiceBtn?.addEventListener(
    "click",
    testVoice
  );

  formatBtn?.addEventListener(
    "click",
    toggleClockFormat
  );

  stopSpeechBtn?.addEventListener(
    "click",
    stopSpeech
  );


  /* Home */

  homeBtn?.addEventListener("click", () => {

    window.location.href = "./index.html";

  });


  /* Fullscreen */

  fullScreenBtn?.addEventListener(
    "click",
    toggleFullscreen
  );

}


/* ---------------------------------------------------------
   LOAD BROWSER VOICES
--------------------------------------------------------- */

function loadSpeechVoices() {

  if (!speechAvailable) {

    updateVoiceStatus();

    return;

  }

  voices = window.speechSynthesis.getVoices() || [];

  /*
   * Android Chrome sometimes returns an empty array
   * on the first call.
   */

  if (!voices.length) {

    setTimeout(() => {

      voices =
        window.speechSynthesis.getVoices() || [];

      updateVoiceStatus();

    }, 500);

    return;

  }

  updateVoiceStatus();
}


/* ---------------------------------------------------------
   FIND BEST VOICE
--------------------------------------------------------- */

function findBestVoice(language) {

  if (!voices.length) {
    return null;
  }

  const wanted = language.toLowerCase();

  /* Exact language */

  let voice = voices.find(
    v => v.lang &&
      v.lang.toLowerCase() === wanted
  );

  if (voice) {
    return voice;
  }

  /* Same language family */

  const base =
    wanted.split("-")[0];

  voice = voices.find(
    v =>
      v.lang &&
      v.lang.toLowerCase().startsWith(base)
  );

  if (voice) {
    return voice;
  }

  /* Google voices often work well on Android */

  voice = voices.find(
    v =>
      v.name &&
      /google/i.test(v.name) &&
      v.lang &&
      v.lang.toLowerCase().startsWith(base)
  );

  if (voice) {
    return voice;
  }

  return voices[0] || null;
}


/* ---------------------------------------------------------
   ENABLE VOICE
--------------------------------------------------------- */

function enableVoice() {

  if (!speechAvailable) {

    alert(
      "আপনার browser Web Speech Voice সমর্থন করছে না। Android Chrome ব্যবহার করে আবার চেষ্টা করুন।"
    );

    return;

  }

  voiceEnabled = true;

  localStorage.setItem(
    "aynaVoiceEnabled",
    "true"
  );

  /*
   * Important:
   * Android browser usually requires a user gesture.
   * Therefore this function is called by a button.
   */

  stopSpeech();

  const text =
    selectedLanguage === "bn-BD"
      ? "আয়না বুক ভয়েস ক্লক চালু হয়েছে।"
      : "AYNA BOOK Voice Clock is now enabled.";

  speak(text, {
    force: true
  });

  updateVoiceStatus();

}


/* ---------------------------------------------------------
   DISABLE VOICE
--------------------------------------------------------- */

function disableVoice() {

  voiceEnabled = false;

  localStorage.setItem(
    "aynaVoiceEnabled",
    "false"
  );

  stopSpeech();

  updateVoiceStatus();

}


/* ---------------------------------------------------------
   SPEAK
--------------------------------------------------------- */

function speak(text, options = {}) {

  if (!speechAvailable) {

    updateVoiceStatus();

    return false;

  }

  if (!voiceEnabled && !options.force) {
    return false;
  }

  if (!text) {
    return false;
  }

  try {

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = selectedLanguage;

    utterance.rate =
      Math.max(
        0.5,
        Math.min(
          2,
          Number(speechRate) || DEFAULT_SPEED
        )
      );

    utterance.pitch = 1;

    utterance.volume = 1;

    const selectedVoice =
      findBestVoice(selectedLanguage);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {

      if (voiceStatus) {

        voiceStatus.textContent =
          selectedLanguage === "bn-BD"
            ? "🔊 Voice চলছে"
            : "🔊 Voice Speaking";

        voiceStatus.style.color =
          "#25d366";

      }

    };

    utterance.onend = () => {

      updateVoiceStatus();

    };

    utterance.onerror = (event) => {

      console.warn(
        "AYNA Voice Clock speech error:",
        event
      );

      updateVoiceStatus();

    };

    window.speechSynthesis.speak(
      utterance
    );

    return true;

  } catch (error) {

    console.error(
      "AYNA Voice Clock:",
      error
    );

    return false;

  }

}


/* ---------------------------------------------------------
   TEST VOICE
--------------------------------------------------------- */

function testVoice() {

  if (!speechAvailable) {

    alert(
      "Voice Speech API পাওয়া যায়নি। Android Chrome ব্যবহার করুন।"
    );

    return;

  }

  /*
   * Test button itself counts as a user gesture.
   * Therefore we allow forced test.
   */

  voiceEnabled = true;

  localStorage.setItem(
    "aynaVoiceEnabled",
    "true"
  );

  const data =
    LANGUAGE_DATA[selectedLanguage] ||
    LANGUAGE_DATA["en-US"];

  speak(data.voiceTest, {
    force: true
  });

  updateVoiceStatus();

}


/* ---------------------------------------------------------
   SPEAK CURRENT TIME
--------------------------------------------------------- */

function speakCurrentTime() {

  if (!speechAvailable) {

    alert(
      "আপনার browser Voice Speech সমর্থন করছে না।"
    );

    return;

  }

  if (!voiceEnabled) {

    /*
     * The button itself is a user gesture.
     * Automatically enable voice.
     */

    voiceEnabled = true;

    localStorage.setItem(
      "aynaVoiceEnabled",
      "true"
    );

  }

  const text =
    buildCurrentTimeSpeech();

  speak(text, {
    force: true
  });

  updateVoiceStatus();

}


/* ---------------------------------------------------------
   BUILD TIME SPEECH
--------------------------------------------------------- */

function buildCurrentTimeSpeech() {

  const now = new Date();

  const parts =
    getTimeParts(
      now,
      selectedTimezone
    );

  const hour =
    Number(parts.hour);

  const minute =
    Number(parts.minute);

  const second =
    Number(parts.second);

  const data =
    LANGUAGE_DATA[selectedLanguage] ||
    LANGUAGE_DATA["en-US"];


  /* -----------------------------------------
     BANGLA
  ----------------------------------------- */

  if (selectedLanguage === "bn-BD") {

    let banglaHour = hour;

    let period = "";

    if (clockFormat === "12") {

      if (hour === 0) {
        banglaHour = 12;
        period = "রাত";
      }
      else if (hour < 12) {
        banglaHour = hour;
        period = "সকাল";
      }
      else if (hour === 12) {
        banglaHour = 12;
        period = "দুপুর";
      }
      else if (hour < 18) {
        banglaHour = hour - 12;
        period = "দুপুর";
      }
      else if (hour < 20) {
        banglaHour = hour - 12;
        period = "সন্ধ্যা";
      }
      else {
        banglaHour = hour - 12;
        period = "রাত";
      }

    }
    else {

      banglaHour = hour;

      if (hour < 6) {
        period = "রাত";
      }
      else if (hour < 12) {
        period = "সকাল";
      }
      else if (hour < 18) {
        period = "দুপুর";
      }
      else if (hour < 20) {
        period = "সন্ধ্যা";
      }
      else {
        period = "রাত";
      }

    }

    const minuteText =
      minute === 0
        ? "ঠিক"
        : `${minute} মিনিট`;

    const secondText =
      ` ${second} সেকেন্ড।`;

    return (
      `${data.hourPrefix} ` +
      `${period} ` +
      `${banglaHour} ` +
      `টা ` +
      `${minuteText}` +
      `${minute === 0 ? " বাজে।" : " বাজে।"}` +
      secondText
    );

  }


  /* -----------------------------------------
     ENGLISH
  ----------------------------------------- */

  let displayHour = hour;

  let period = "";

  if (clockFormat === "12") {

    period =
      hour >= 12
        ? "PM"
        : "AM";

    displayHour =
      hour % 12 || 12;

  }

  if (clockFormat === "24") {

    period = "";

  }

  const minuteText =
    String(minute).padStart(2, "0");

  const secondText =
    String(second).padStart(2, "0");

  if (clockFormat === "24") {

    return (
      `${data.hourPrefix} ` +
      `${displayHour} hours ` +
      `${minuteText} minutes ` +
      `${secondText} seconds.`
    );

  }

  return (
    `${data.hourPrefix} ` +
    `${displayHour}:${minuteText} ` +
    `${period}.`
  );

}


/* ---------------------------------------------------------
   HOURLY ANNOUNCEMENT
--------------------------------------------------------- */

function checkHourlyAnnouncement() {

  if (!hourlyEnabled) {
    return;
  }

  if (!voiceEnabled) {
    return;
  }

  const now = new Date();

  const parts =
    getTimeParts(
      now,
      selectedTimezone
    );

  const hour =
    Number(parts.hour);

  const minute =
    Number(parts.minute);

  const second =
    Number(parts.second);


  /*
   * Announce during the first few seconds of every hour.
   * The remembered key prevents repeated speech.
   */

  if (
    minute === 0 &&
    second >= 0 &&
    second <= 5
  ) {

    const announcementKey =
      `${parts.year}-${parts.month}-${parts.day}-${hour}`;

    if (
      announcementKey !==
      lastAnnouncedHour
    ) {

      lastAnnouncedHour =
        announcementKey;

      speakCurrentTime();

    }

  }

}


/* ---------------------------------------------------------
   UPDATE CLOCK
--------------------------------------------------------- */

function updateClock() {

  const now = new Date();

  const parts =
    getTimeParts(
      now,
      selectedTimezone
    );


  let hour =
    Number(parts.hour);

  const minute =
    Number(parts.minute);

  const second =
    Number(parts.second);


  let displayHour =
    hour;

  let period = "";


  /* 12 Hour */

  if (clockFormat === "12") {

    period =
      hour >= 12
        ? "PM"
        : "AM";

    displayHour =
      hour % 12 || 12;

  }


  /* 24 Hour */

  if (clockFormat === "24") {

    period = "";

  }


  if (digitalClock) {

    digitalClock.textContent =
      `${String(displayHour).padStart(2,"0")}:` +
      `${String(minute).padStart(2,"0")}:` +
      `${String(second).padStart(2,"0")}`;

  }


  if (ampm) {

    if (clockFormat === "12") {

      ampm.textContent =
        period;

    } else {

      ampm.textContent =
        "24 HOUR";

    }

  }


  updateDate(
    now,
    selectedTimezone
  );

  updateTimezoneText();

  updateNextHour();

  checkHourlyAnnouncement();

}


/* ---------------------------------------------------------
   DATE
--------------------------------------------------------- */

function updateDate(date, timezone) {

  if (!dateText) {
    return;
  }

  const locale =
    selectedLanguage === "bn-BD"
      ? "bn-BD"
      : "en-US";

  try {

    const formatter =
      new Intl.DateTimeFormat(
        locale,
        {
          timeZone: timezone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      );

    const result =
      formatter.format(date);

    dateText.textContent =
      result;

  } catch (error) {

    dateText.textContent =
      date.toLocaleDateString();

  }

}


/* ---------------------------------------------------------
   TIMEZONE TEXT
--------------------------------------------------------- */

function updateTimezoneText() {

  if (!timezoneText) {
    return;
  }

  timezoneText.textContent =
    `🌍 Time Zone: ${selectedTimezone}`;

}


/* ---------------------------------------------------------
   NEXT HOUR
--------------------------------------------------------- */

function updateNextHour() {

  if (!nextHourText) {
    return;
  }

  if (!hourlyEnabled) {

    nextHourText.textContent =
      selectedLanguage === "bn-BD"
        ? "প্রতি ঘণ্টার ঘোষণা বন্ধ আছে"
        : "Hourly announcement is OFF";

    return;

  }

  const now = new Date();

  const parts =
    getTimeParts(
      now,
      selectedTimezone
    );

  const minute =
    Number(parts.minute);

  const second =
    Number(parts.second);

  const secondsLeft =
    (59 - minute) * 60 +
    (60 - second);

  const minutes =
    Math.floor(
      secondsLeft / 60
    );

  const seconds =
    secondsLeft % 60;


  if (selectedLanguage === "bn-BD") {

    nextHourText.textContent =
      `🔔 পরবর্তী সময় ঘোষণা প্রায় ` +
      `${minutes} মিনিট ${seconds} সেকেন্ড পরে`;

  } else {

    nextHourText.textContent =
      `🔔 Next hourly announcement in ` +
      `${minutes} min ${seconds} sec`;

  }

}


/* ---------------------------------------------------------
   GET TIME PARTS
--------------------------------------------------------- */

function getTimeParts(date, timezone) {

  try {

    const formatter =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23"
        }
      );

    const values =
      formatter.formatToParts(date);

    const result = {};

    values.forEach(part => {

      if (
        part.type !== "literal"
      ) {

        result[part.type] =
          part.value;

      }

    });

    return result;

  } catch (error) {

    console.error(
      "Timezone error:",
      error
    );

    const fallback =
      new Date();

    return {
      year: fallback.getFullYear(),
      month: String(
        fallback.getMonth() + 1
      ).padStart(2, "0"),
      day: String(
        fallback.getDate()
      ).padStart(2, "0"),
      hour: String(
        fallback.getHours()
      ).padStart(2, "0"),
      minute: String(
        fallback.getMinutes()
      ).padStart(2, "0"),
      second: String(
        fallback.getSeconds()
      ).padStart(2, "0")
    };

  }

}


/* ---------------------------------------------------------
   TOGGLE 12 / 24
--------------------------------------------------------- */

function toggleClockFormat() {

  clockFormat =
    clockFormat === "12"
      ? "24"
      : "12";

  localStorage.setItem(
    "aynaClockFormat",
    clockFormat
  );

  if (hourFormatSelect) {

    hourFormatSelect.value =
      clockFormat;

  }

  updateClock();

}


/* ---------------------------------------------------------
   STOP SPEECH
--------------------------------------------------------- */

function stopSpeech() {

  if (!speechAvailable) {
    return;
  }

  try {

    window.speechSynthesis.cancel();

  } catch (error) {

    console.warn(
      "Unable to stop speech:",
      error
    );

  }

  updateVoiceStatus();

}


/* ---------------------------------------------------------
   VOICE STATUS
--------------------------------------------------------- */

function updateVoiceStatus() {

  if (!voiceStatus) {
    return;
  }

  if (!speechAvailable) {

    voiceStatus.textContent =
      "⚠️ Browser Voice API পাওয়া যায়নি";

    voiceStatus.style.color =
      "#ff5b5b";

    return;

  }

  if (voiceEnabled) {

    voiceStatus.textContent =
      selectedLanguage === "bn-BD"
        ? "🔊 Voice চালু"
        : "🔊 Voice ON";

    voiceStatus.style.color =
      "#25d366";

  } else {

    voiceStatus.textContent =
      selectedLanguage === "bn-BD"
        ? "🔇 Voice বন্ধ"
        : "🔇 Voice OFF";

    voiceStatus.style.color =
      "#ff5b5b";

  }

}


/* ---------------------------------------------------------
   HOURLY STATUS
--------------------------------------------------------- */

function updateHourlyStatus() {

  if (!hourlyToggle) {
    return;
  }

  hourlyToggle.checked =
    hourlyEnabled;

  updateNextHour();

}


/* ---------------------------------------------------------
   FULLSCREEN
--------------------------------------------------------- */

async function toggleFullscreen() {

  try {

    if (!document.fullscreenElement) {

      const element =
        document.getElementById("app") ||
        document.documentElement;

      await element.requestFullscreen();

      if (fullScreenBtn) {

        fullScreenBtn.textContent =
          "✕ Exit Full Screen";

      }

    } else {

      await document.exitFullscreen();

      if (fullScreenBtn) {

        fullScreenBtn.textContent =
          "⛶ Full Screen";

      }

    }

  } catch (error) {

    console.warn(
      "Fullscreen unavailable:",
      error
    );

    /*
     * Fallback for browsers that do not
     * support fullscreen.
     */

    alert(
      "এই browser-এ Full Screen সুবিধাটি বর্তমানে পাওয়া যাচ্ছে না।"
    );

  }

}


/* ---------------------------------------------------------
   FULLSCREEN CHANGE
--------------------------------------------------------- */

document.addEventListener(
  "fullscreenchange",
  () => {

    if (!fullScreenBtn) {
      return;
    }

    if (document.fullscreenElement) {

      fullScreenBtn.textContent =
        "✕ Exit Full Screen";

    } else {

      fullScreenBtn.textContent =
        "⛶ Full Screen";

    }

  }
);


/* ---------------------------------------------------------
   PAGE VISIBILITY
--------------------------------------------------------- */

document.addEventListener(
  "visibilitychange",
  () => {

    /*
     * Mobile Android may suspend JavaScript while
     * the page is backgrounded.
     *
     * When user returns, immediately refresh.
     */

    if (!document.hidden) {

      updateClock();

      loadSpeechVoices();

    }

  }
);


/* ---------------------------------------------------------
   PUBLIC AYNA API
--------------------------------------------------------- */

window.AYNA_VOICE_CLOCK = {

  speak: function(text) {

    return speak(text, {
      force: true
    });

  },

  speakCurrentTime: function() {

    voiceEnabled = true;

    localStorage.setItem(
      "aynaVoiceEnabled",
      "true"
    );

    speakCurrentTime();

  },

  enable: function() {

    enableVoice();

  },

  disable: function() {

    disableVoice();

  },

  stop: function() {

    stopSpeech();

  },

  getTime: function() {

    return {
      timezone: selectedTimezone,
      language: selectedLanguage,
      format: clockFormat,
      voiceEnabled,
      hourlyEnabled
    };

  }

};


/* ---------------------------------------------------------
   CLEANUP
--------------------------------------------------------- */

window.addEventListener(
  "beforeunload",
  () => {

    if (clockTimer) {

      clearInterval(
        clockTimer
      );

    }

    if (speechAvailable) {

      try {
        window.speechSynthesis.cancel();
      } catch (_) {}

    }

  }
);