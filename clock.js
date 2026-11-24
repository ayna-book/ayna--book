const TalkingSehriIftarClock = {
  // ঢাকার ভিত্তি সময় (২৪-ঘণ্টা ফরম্যাটে, প্রয়োজনে UI বা লোকাল স্টোরেজ থেকে আপডেট করা যাবে)
  sehriTime: { hour: 4, minute: 58 },   // ০৪:৫৮ AM
  iftarTime: { hour: 17, minute: 12 }, // ০৫:১২ PM

  lastHourlySpoken: "",
  lastIftar5MinSpoken: "",
  sehriPreAlertSpoken: false,
  started: false,
  intervalId: null,

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

  formatHmText(h, m) {
    const temp = new Date();
    temp.setHours(h, m, 0, 0);
    return this.formatBanglaTime(temp);
  },

  speak(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "bn-BD";
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error("Speech error:", err);
    }
  },

  updateClockDisplay() {
    const now = new Date();
    const liveClockEl = document.getElementById("liveClock") || document.getElementById("clockDisplay");
    const sehriEl = document.getElementById("sehriTimeText");
    const iftarEl = document.getElementById("iftarTimeText");

    if (liveClockEl) {
      liveClockEl.textContent = this.formatBanglaTime(now);
    }
    if (sehriEl) {
      sehriEl.textContent = this.formatHmText(this.sehriTime.hour, this.sehriTime.minute);
    }
    if (iftarEl) {
      iftarEl.textContent = this.formatHmText(this.iftarTime.hour, this.iftarTime.minute);
    }
  },

  tick() {
    this.updateClockDisplay();

    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const nowMin = this.toMinutes(h, m);
    const sehriMin = this.toMinutes(this.sehriTime.hour, this.sehriTime.minute);
    const iftarMin = this.toMinutes(this.iftarTime.hour, this.iftarTime.minute);

    // ১. সেহরির ১.৫ ঘণ্টা (৯০ মিনিট) আগে সময় বলা
    const sehriAlertMin = sehriMin - 90;
    if (nowMin === sehriAlertMin && !this.sehriPreAlertSpoken) {
      this.sehriPreAlertSpoken = true;
      this.speak(`সতর্কতা: সেহরির আর দেড় ঘণ্টা বাকি। এখন সময় ${this.formatBanglaTime(now)}।`);
    }
    if (nowMin !== sehriAlertMin) {
      this.sehriPreAlertSpoken = false;
    }

    // ২. ইফতারের ১ ঘণ্টা (৬০ মিনিট) আগে থেকে ৫ মিনিট পর পর সময় বলা
    const iftarWindowStart = iftarMin - 60;
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

    // ৩. সাধারণ অবস্থায় প্রতি ১ ঘণ্টা পর পর সময় বলা
    const hourKey = `${now.toDateString()}-${h}`;
    if (m === 0 && this.lastHourlySpoken !== hourKey) {
      this.lastHourlySpoken = hourKey;
      this.speak(`এখন সময় ${this.formatBanglaTime(now)}।`);
    }
  },

  start() {
    if (this.started) return;
    this.started = true;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 10000);
  },

  testNow() {
    const now = new Date();
    this.speak(`টেস্ট ঘোষণা: এখন সময় ${this.formatBanglaTime(now)}।`);
  }
};

window.TalkingSehriIftarClock = TalkingSehriIftarClock;

document.addEventListener("DOMContentLoaded", () => {
  TalkingSehriIftarClock.updateClockDisplay();
});

document.addEventListener(
  "click",
  () => {
    TalkingSehriIftarClock.start();
  },
  { once: true }
);