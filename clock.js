// ==================================================
// AYNA BOOK - WORLD CLOCK & SEHRI/IFTAR VOICE (clock.js)
// ==================================================

const CLOCK_LOCATION_TIMES = {
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
};

const TalkingSehriIftarClock = {
  // আজকের ভিত্তি সময় (২৪-ঘণ্টা ফরম্যাটে, আরবি ক্যালেন্ডার বা দেশ/জেলা থেকে আপডেট হয়)[span_2](start_span)[span_2](end_span)
  sehriTime: { hour: 4, minute: 53 }, // ০৪:৫৩ AM[span_3](start_span)[span_3](end_span)
  iftarTime: { hour: 17, minute: 7 }, // ০৫:০৭ PM[span_4](start_span)[span_4](end_span)

  iftarLeadHours: 1, // ১ বা ২ ঘণ্টা
  enabled: {
    master: true,
    iftar: true,
    sehri: true,
    hourly: true
  },

  lastHourlySpoken: "",
  lastIftar5MinSpoken: "",
  sehriPreAlertSpoken: false,
  _timer: null,

  setTimeFromString(target, timeStr) {
    const [hStr, mStr] = (timeStr || "00:00").split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      this[target] = { hour: h, minute: m };
    }
  },

  speak(text) {
    if (!this.enabled.master) return;
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "bn-BD";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  },

  toMinutes(h, m) {
    return h * 60 + m;
  },

  formatBanglaTime(date) {
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  },

  tick() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    const clockEl = document.getElementById("liveClockDisplay");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    }

    if (!this.enabled.master) return;

    const nowMin = this.toMinutes(h, m);
    const sehriMin = this.toMinutes(this.sehriTime.hour, this.sehriTime.minute);
    const iftarMin = this.toMinutes(this.iftarTime.hour, this.iftarTime.minute);

    // ১. সেহরির ১.৫ ঘণ্টা (৯০ মিনিট) আগে সময় বলা[span_5](start_span)[span_5](end_span)
    if (this.enabled.sehri) {
      const sehriAlertMin = sehriMin - 90;
      if (nowMin === sehriAlertMin && !this.sehriPreAlertSpoken) {
        this.sehriPreAlertSpoken = true;
        this.speak(
          `সতর্কতা: সেহরির আর দেড় ঘণ্টা বাকি। এখন সময় ${this.formatBanglaTime(now)}।`
        );
      } else if (nowMin !== sehriAlertMin) {
        this.sehriPreAlertSpoken = false;
      }
    }

    // ২. ইফতারের ১ বা ২ ঘণ্টা আগে থেকে ৫ মিনিট পর পর সময় বলা[span_6](start_span)[span_6](end_span)
    if (this.enabled.iftar) {
      const leadMinutes = (Number(this.iftarLeadHours) === 2 ? 2 : 1) * 60;
      const iftarWindowStart = iftarMin - leadMinutes;
      if (nowMin >= iftarWindowStart && nowMin <= iftarMin) {
        const diffFromStart = nowMin - iftarWindowStart;
        const slotKey = `${now.toDateString()}-${h}:${m}`;
        if (diffFromStart % 5 === 0 && this.lastIftar5MinSpoken !== slotKey) {
          this.lastIftar5MinSpoken = slotKey;
          const leftMin = iftarMin - nowMin;
          this.speak(
            leftMin === 0
              ? `এখন ইফতারের সময়, ${this.formatBanglaTime(now)}।`
              : `ইফতারের আর ${leftMin} মিনিট বাকি। এখন সময় ${this.formatBanglaTime(now)}।`
          );
        }
        return;
      }
    }

    // ৩. সাধারণ অবস্থায় প্রতি ১ ঘণ্টা পর পর সময় বলা[span_7](start_span)[span_7](end_span)
    if (this.enabled.hourly) {
      const hourKey = `${now.toDateString()}-${h}`;
      if (m === 0 && this.lastHourlySpoken !== hourKey) {
        this.lastHourlySpoken = hourKey;
        this.speak(`এখন সময় ${this.formatBanglaTime(now)}।`);
      }
    }
  },

  start() {
    this.tick();
    if (!this._timer) {
      this._timer = setInterval(() => this.tick(), 1000); // প্রতি ১ সেকেন্ডে ঘড়ি ও মিনিট আপডেট[span_8](start_span)[span_8](end_span)
    }
    const statusEl = document.getElementById("voiceStatus");
    if (statusEl) {
      statusEl.textContent = this.enabled.master
        ? "বাংলা ভয়েস অ্যালার্ট সক্রিয় হয়েছে।"
        : "ভয়েস সিস্টেম বর্তমানে বন্ধ আছে।";
    }
  }
};

function populateDistricts() {
  const countrySelect = document.getElementById("countrySelect");
  const districtSelect = document.getElementById("districtSelect");
  if (!countrySelect || !districtSelect) return;

  const countryCode = countrySelect.value;
  const countryData = CLOCK_LOCATION_TIMES[countryCode];
  if (!countryData) return;

  districtSelect.innerHTML = "";
  Object.keys(countryData.districts).forEach((dist) => {
    const opt = document.createElement("option");
    opt.value = dist;
    opt.textContent = dist;
    districtSelect.appendChild(opt);
  });

  applySelectedDistrictTime();
}

function applySelectedDistrictTime() {
  const countryCode = document.getElementById("countrySelect")?.value;
  const distName = document.getElementById("districtSelect")?.value;
  const countryData = CLOCK_LOCATION_TIMES[countryCode];
  const times = countryData?.districts?.[distName];

  if (times) {
    const sehriInput = document.getElementById("sehriInput");
    const iftarInput = document.getElementById("iftarInput");
    if (sehriInput) sehriInput.value = times.sehri;
    if (iftarInput) iftarInput.value = times.iftar;
    TalkingSehriIftarClock.setTimeFromString("sehriTime", times.sehri);
    TalkingSehriIftarClock.setTimeFromString("iftarTime", times.iftar);
  }

  updateClockSummary();
}

function updateClockSummary() {
  const summaryEl = document.getElementById("scheduleSummary");
  if (!summaryEl) return;

  const countryCode = document.getElementById("countrySelect")?.value || "BD";
  const countryName = CLOCK_LOCATION_TIMES[countryCode]?.countryName || "";
  const distName = document.getElementById("districtSelect")?.value || "";
  const sehriVal = document.getElementById("sehriInput")?.value || "";
  const iftarVal = document.getElementById("iftarInput")?.value || "";
  const leadHrs = document.getElementById("iftarLeadHours")?.value || "1";

  summaryEl.textContent =
    `${countryName} — ${distName} | সেহরি: ${sehriVal} | ইফতার: ${iftarVal} | ইফতারের ${leadHrs} ঘণ্টা আগে থেকে ৫ মিনিট পর পর`;
}

function applySyncedCalendarData() {
  const params = new URLSearchParams(window.location.search);
  let synced = null;

  try {
    synced = JSON.parse(localStorage.getItem("ayna_sehri_iftar_sync") || "null");
  } catch (err) {
    synced = null;
  }

  const targetCountry = params.get("country") || synced?.countryCode;
  const targetDistrict = params.get("district") || synced?.districtName;
  const targetLead = params.get("lead") || synced?.iftarLeadHours;

  const countrySelect = document.getElementById("countrySelect");
  if (targetCountry && CLOCK_LOCATION_TIMES[targetCountry] && countrySelect) {
    countrySelect.value = targetCountry;
  }

  populateDistricts();

  const districtSelect = document.getElementById("districtSelect");
  if (
    targetDistrict &&
    countrySelect &&
    CLOCK_LOCATION_TIMES[countrySelect.value]?.districts?.[targetDistrict] &&
    districtSelect
  ) {
    districtSelect.value = targetDistrict;
    applySelectedDistrictTime();
  }

  if (synced?.sehri && !params.get("country")) {
    const sehriInput = document.getElementById("sehriInput");
    if (sehriInput) sehriInput.value = synced.sehri;
    TalkingSehriIftarClock.setTimeFromString("sehriTime", synced.sehri);
  }

  if (synced?.iftar && !params.get("country")) {
    const iftarInput = document.getElementById("iftarInput");
    if (iftarInput) iftarInput.value = synced.iftar;
    TalkingSehriIftarClock.setTimeFromString("iftarTime", synced.iftar);
  }

  if (targetLead && (Number(targetLead) === 1 || Number(targetLead) === 2)) {
    const leadSelect = document.getElementById("iftarLeadHours");
    if (leadSelect) {
      leadSelect.value = String(targetLead);
      TalkingSehriIftarClock.iftarLeadHours = Number(targetLead);
    }
  }

  updateClockSummary();
}

function setupTogglePair(key, openBtnId, closeBtnId, textId) {
  const openBtn = document.getElementById(openBtnId);
  const closeBtn = document.getElementById(closeBtnId);
  const stateText = document.getElementById(textId);
  if (!openBtn || !closeBtn) return;

  function refreshUI() {
    const isOn = TalkingSehriIftarClock.enabled[key];
    openBtn.classList.toggle("active", isOn);
    closeBtn.classList.toggle("active", !isOn);
    if (stateText) {
      stateText.textContent = isOn ? "অবস্থা: ওপেন (চালু)" : "অবস্থা: বন্ধ";
    }
  }

  openBtn.addEventListener("click", () => {
    TalkingSehriIftarClock.enabled[key] = true;
    if (key === "master") {
      window.speechSynthesis?.resume?.();
    }
    refreshUI();
  });

  closeBtn.addEventListener("click", () => {
    TalkingSehriIftarClock.enabled[key] = false;
    if (key === "master") {
      window.speechSynthesis?.cancel?.();
    }
    refreshUI();
  });

  refreshUI();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("countrySelect")?.addEventListener("change", populateDistricts);
  document.getElementById("districtSelect")?.addEventListener("change", applySelectedDistrictTime);

  document.getElementById("sehriInput")?.addEventListener("change", (e) => {
    TalkingSehriIftarClock.setTimeFromString("sehriTime", e.target.value);
    updateClockSummary();
  });

  document.getElementById("iftarInput")?.addEventListener("change", (e) => {
    TalkingSehriIftarClock.setTimeFromString("iftarTime", e.target.value);
    updateClockSummary();
  });

  document.getElementById("iftarLeadHours")?.addEventListener("change", (e) => {
    TalkingSehriIftarClock.iftarLeadHours = Number(e.target.value);
    TalkingSehriIftarClock.lastIftar5MinSpoken = "";
    updateClockSummary();
  });

  setupTogglePair("iftar", "iftarOpenBtn", "iftarCloseBtn", "iftarStateText");
  setupTogglePair("sehri", "sehriOpenBtn", "sehriCloseBtn", "sehriStateText");
  setupTogglePair("hourly", "hourlyOpenBtn", "hourlyCloseBtn", "hourlyStateText");
  setupTogglePair("master", "masterOpenBtn", "masterCloseBtn", "masterStateText");

  document.getElementById("testVoiceBtn")?.addEventListener("click", () => {
    TalkingSehriIftarClock.start();
    const now = new Date();
    TalkingSehriIftarClock.speak(
      `এখন সময় ${TalkingSehriIftarClock.formatBanglaTime(now)}।`
    );
  });

  // ব্রাউজারে অডিও অনুমতি সক্রিয় করতে প্রথম ক্লিকেই চালু হবে[span_9](start_span)[span_9](end_span)
  document.addEventListener(
    "click",
    () => {
      TalkingSehriIftarClock.start();
    },
    { once: true }
  );

  applySyncedCalendarData();
  TalkingSehriIftarClock.tick();
});