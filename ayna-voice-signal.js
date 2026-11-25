// ayna-voice-signal.js — AYNA BOOK Voice Error Signal & Clock Module

export const AynaVoiceSignal = {
  lastSignalMessage: "প্রস্তুত",
  clockEnabled: true,

  notify(msg) {
    const el = document.getElementById("notice");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    clearTimeout(this._t);
    this._t = setTimeout(() => {
      el.style.display = "none";
    }, 3400);
  },

  playErrorBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(210, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (_) {}
  },

  speak(text, force = true) {
    if (!force || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      const voices = window.speechSynthesis.getVoices() || [];
      const bn = voices.find(v => /bn/i.test(v.lang));
      u.voice = bn || voices[0] || null;
      u.lang = bn?.lang || "bn-BD";
      u.rate = 0.96;
      window.speechSynthesis.speak(u);
    } catch (_) {}
  },

  error(mistakeBn, boxId = "registerSignalBox") {
    this.lastSignalMessage = `ভুল হয়েছে। ${mistakeBn}`;
    this.playErrorBeep();
    this.notify("⚠️ " + mistakeBn);
    const box = document.getElementById(boxId);
    if (box) box.textContent = `⚠️ ভুল সিগন্যাল:\n${mistakeBn}`;
    this.speak(this.lastSignalMessage, true);
  },

  success(okBn, boxId = "registerSignalBox") {
    this.lastSignalMessage = okBn;
    this.notify("✅ " + okBn);
    const box = document.getElementById(boxId);
    if (box) box.textContent = `✅ ${okBn}`;
    this.speak(okBn, true);
  },

  repeatLast() {
    this.speak(this.lastSignalMessage, true);
  },

  speakCurrentTime() {
    const nowStr = new Date().toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    this.notify("এখন সময় " + nowStr);
    this.speak(`এখন সময় ${nowStr}।`, true);
  },

  toggleClock(btnId = "toggleClockBtn") {
    this.clockEnabled = !this.clockEnabled;
    const btn = document.getElementById(btnId);
    if (btn) btn.textContent = this.clockEnabled ? "🔊 ঘড়ি: চালু" : "🔇 ঘড়ি: বন্ধ";
    this.notify(this.clockEnabled ? "সময় বলার ঘড়ি চালু হয়েছে" : "সময় বলার ঘড়ি বন্ধ হয়েছে");
    if (this.clockEnabled) this.speakCurrentTime();
  }
};