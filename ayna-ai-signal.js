// ayna-ai-signal.js — AYNA BOOK Universal AI Signal, Voice & Clock Module

export const AynaAiSignal = {
  clockEnabled: true,
  lastHourlyKey: "",
  lastMessage: "AYNA AI সিগন্যাল সিস্টেম প্রস্তুত।",

  notify(msg) {
    let box = document.getElementById("aynaSignalNotice");
    if (!box) {
      box = document.createElement("div");
      box.id = "aynaSignalNotice";
      box.style.cssText = [
        "position:fixed",
        "top:102px",
        "left:50%",
        "transform:translateX(-50%)",
        "background:#0a1636",
        "color:#ffffff",
        "border:3.5px solid #fff6b3",
        "padding:16px 24px",
        "border-radius:8px",
        "box-shadow:0 0 20px rgba(255,230,77,.8),0 7px 0 #8a6105",
        "z-index:200",
        "display:none",
        "max-width:92%",
        "font-size:28px",
        "font-weight:bold",
        "text-align:center"
      ].join(";");
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.style.display = "block";
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      box.style.display = "none";
    }, 3400);
  },

  playSignalTone(type = "alert") {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === "error" ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(type === "error" ? 320 : 660, ctx.currentTime);
      osc.frequency.setValueAtTime(type === "error" ? 210 : 880, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  },

  speak(text, force = true) {
    if ((!force && !this.clockEnabled) || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(text).replace(/[*#]/g, "").slice(0, 300));
      const voices = window.speechSynthesis.getVoices() || [];
      const bn = voices.find(v => /bn/i.test(v.lang));
      utter.voice = bn || voices[0] || null;
      utter.lang = bn?.lang || "bn-BD";
      utter.rate = 0.96;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  },

  error(mistakeBn, outputEl = null) {
    this.lastMessage = `ভুল হয়েছে। ${mistakeBn}`;
    this.playSignalTone("error");
    this.notify("⚠️ " + mistakeBn);
    if (outputEl) outputEl.textContent = `⚠️ AI ভুল সিগন্যাল:\n${mistakeBn}`;
    this.speak(this.lastMessage, true);
  },

  aiAlert(infoBn, outputEl = null, speakNow = true) {
    this.lastMessage = infoBn;
    this.playSignalTone("alert");
    this.notify("🤖 " + infoBn);
    if (outputEl) outputEl.textContent = `🤖 AI সিগন্যাল:\n${infoBn}`;
    if (speakNow) this.speak(infoBn, true);
  },

  formatBanglaTime(date = new Date()) {
    return date.toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  },

  speakNow() {
    const nowText = this.formatBanglaTime(new Date());
    const msg = `এখন সময় ${nowText}।`;
    this.aiAlert(msg, null, true);
  },

  setClockEnabled(enabled, announce = true) {
    this.clockEnabled = !!enabled;
    if (this.clockEnabled) {
      this.notify("সময় বলার ঘড়ি চালু হয়েছে");
      if (announce) this.speak(`সময় বলার ঘড়ি চালু হয়েছে। এখন সময় ${this.formatBanglaTime(new Date())}।`, true);
    } else {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      this.notify("সময় বলার ঘড়ি বন্ধ করা হয়েছে");
    }
  },

  startHourlyClock(onTickDisplay = null) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    const tick = () => {
      const now = new Date();
      if (typeof onTickDisplay === "function") onTickDisplay(now);
      if (!this.clockEnabled) return;
      const h = now.getHours();
      const m = now.getMinutes();
      const key = `${now.toDateString()}-${h}`;
      if (m === 0 && this.lastHourlyKey !== key) {
        this.lastHourlyKey = key;
        this.aiAlert(`এখন সময় ${this.formatBanglaTime(now)}।`, null, true);
      }
    };
    tick();
    return setInterval(tick, 1000);
  }
};