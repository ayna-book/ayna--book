// AYNA BOOK — Unified UHD Sounds & Voice Signal Engine (uhd-sounds-engine.js)
class AynaUhdSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.lastAnnouncement = "AYNA BOOK UHD সাউন্ড ইঞ্জিন প্রস্তুত আছে।";
    this.volume = 0.88;
  }

  unlock() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;

      if (!this.ctx) {
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(16, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

        this.compressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (_) {
      return null;
    }
  }

  setVolume(val = 0.88) {
    const clamped = Math.max(0, Math.min(1, Number(val)));
    this.volume = Number.isNaN(clamped) ? 0.88 : clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // 'confirm' | 'error' | 'alert' | 'radar' | 'uhd'
  playTone(type = "confirm") {
    const ctx = this.unlock();
    if (!ctx) return;

    const now = ctx.currentTime;
    const patterns = {
      confirm: { wave: "sine", notes: [528, 792, 1056], step: 0.08, dur: 0.34, gain: 0.18 },
      error:   { wave: "sawtooth", notes: [310, 215, 145], step: 0.11, dur: 0.36, gain: 0.17 },
      alert:   { wave: "triangle", notes: [880, 660, 880], step: 0.09, dur: 0.30, gain: 0.20 },
      radar:   { wave: "sine", notes: [1200, 1500], step: 0.10, dur: 0.22, gain: 0.12 },
      uhd:     { wave: "sine", notes: [432, 648, 864, 1296], step: 0.07, dur: 0.38, gain: 0.19 }
    };

    const cfg = patterns[type] || patterns.confirm;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(4500, now);
    filter.connect(this.compressor);

    cfg.notes.forEach((freq, idx) => {
      const startAt = now + idx * cfg.step;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = cfg.wave;
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.0008, startAt);
      gain.gain.exponentialRampToValueAtTime(cfg.gain, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0008, startAt + cfg.dur);

      osc.connect(gain);
      gain.connect(filter);

      osc.start(startAt);
      osc.stop(startAt + cfg.dur + 0.02);
    });
  }

  speak(text, onNotice = null) {
    if (!text) return;
    const cleanText = String(text).replace(/[*#]/g, "").trim().slice(0, 300);
    this.lastAnnouncement = cleanText;

    if (typeof onNotice === "function") {
      onNotice(cleanText);
    }

    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices() || [];
      const bnVoice = voices.find(v => /bn/i.test(v.lang));
      utter.voice = bnVoice || voices[0] || null;
      utter.lang = bnVoice?.lang || "bn-BD";
      utter.rate = 0.96;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  announceError(fieldOrPlace, reasonBn, onNotice = null) {
    this.playTone("error");
    const msg = fieldOrPlace
      ? `${fieldOrPlace} ঘরে ভুল হয়েছে। ${reasonBn}`
      : `ভুল হয়েছে। ${reasonBn}`;
    this.speak(msg, onNotice);
  }

  announceCurrentTime(onNotice = null) {
    this.playTone("confirm");
    const nowStr = new Date().toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    this.speak(`এখন সময় ${nowStr}।`, onNotice);
  }

  replayLast(onNotice = null) {
    this.playTone("alert");
    this.speak(this.lastAnnouncement, onNotice);
  }
}

const uhdSoundsInstance = new AynaUhdSoundEngine();
window.aynaSound = uhdSoundsInstance;
window.uhdSoundsEngine = uhdSoundsInstance;