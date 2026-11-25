// ayna-quantum-sound.js — AYNA BOOK AI Quantum Sweet Loud Sound Engine

export const AynaQuantumSound = {
  enabled: true,
  loudnessBoost: 1.45, // উচ্চস্বরে স্পষ্ট শোনানোর জন্য নিয়ন্ত্রিত অ্যাম্প্লিফিকেশন
  ctx: null,

  getAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  // মিষ্টি-মধুর কোয়ান্টাম সাউন্ড সিগন্যাল (উচ্চস্বরে কিন্তু শ্রুতিমধুর)
  playSweetQuantumChime(mode = "media") {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, now);
      compressor.knee.setValueAtTime(18, now);
      compressor.ratio.setValueAtTime(6, now);
      compressor.attack.setValueAtTime(0.005, now);
      compressor.release.setValueAtTime(0.18, now);

      const warmFilter = ctx.createBiquadFilter();
      warmFilter.type = "lowpass";
      warmFilter.frequency.setValueAtTime(3400, now);

      const masterGain = ctx.createGain();
      const targetGain = Math.min(0.45, 0.24 * this.loudnessBoost);
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.05);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

      warmFilter.connect(compressor);
      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      const chordMap = {
        audio: [523.25, 659.25, 783.99],   // C5 - E5 - G5 (মিষ্টি অডিও কর্ড)
        video: [440.00, 554.37, 659.25],   // A4 - C#5 - E5 (সিনেমাটিক কর্ড)
        tv:    [587.33, 739.99, 880.00],   // D5 - F#5 - A5 (ব্রডকাস্ট টিভি কর্ড)
        radio: [493.88, 622.25, 739.99],   // B4 - D#5 - F#5 (রেডিও ওয়েভ কর্ড)
        media: [528.00, 660.00, 792.00]
      };
      const freqs = chordMap[mode] || chordMap.media;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = idx === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        noteGain.gain.setValueAtTime(0.001, now + idx * 0.09);
        noteGain.gain.exponentialRampToValueAtTime(0.65, now + idx * 0.09 + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

        osc.connect(noteGain);
        noteGain.connect(warmFilter);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.48);
      });
    } catch (_) {}
  },

  // মিষ্টি কণ্ঠে এআই সাউন্ড ঘোষণা
  speakSweet(text, force = true) {
    if ((!force && !this.enabled) || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(String(text));
      const voices = window.speechSynthesis.getVoices() || [];
      const bnVoice = voices.find(v => /bn/i.test(v.lang));
      utter.voice = bnVoice || voices[0] || null;
      utter.lang = bnVoice?.lang || "bn-BD";
      utter.pitch = 1.08; // মিষ্টি ও কোমল সুর
      utter.rate = 0.95;
      utter.volume = 1.0; // সর্বোচ্চ স্পষ্ট ভলিউম
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  },

  // অডিও, ভিডিও, টেলিভিশন বা রেডিও ওপেন করলে অটো ট্রিগার
  onMediaOpen(category = "media", customLabel = "") {
    const labels = {
      audio: "অডিও প্লেয়ার",
      video: "ভিডিও প্লেয়ার",
      tv: "বিশ্ব টেলিভিশন",
      radio: "বিশ্ব রেডিও",
      media: "মিডিয়া হাব"
    };
    const title = customLabel || labels[category] || labels.media;
    this.playSweetQuantumChime(category);
    this.speakSweet(`এআই কোয়ান্টাম সাউন্ড চালু হয়েছে। ${title} প্রস্তুত।`, true);
  },

  // HTMLAudio বা HTMLVideo এলিমেন্টে উচ্চস্বরে স্পষ্ট এআই সাউন্ড ব্যালেন্স যুক্ত করা
  enhanceMediaElement(el, category = "audio") {
    if (!el || el.dataset.aynaQuantumEnhanced === "1") return;
    el.dataset.aynaQuantumEnhanced = "1";
    el.volume = 1.0;

    el.addEventListener("play", () => {
      this.playSweetQuantumChime(category);
    }, { passive: true });

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const source = ctx.createMediaElementSource(el);
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.ratio.setValueAtTime(5, ctx.currentTime);

      const boostGain = ctx.createGain();
      boostGain.gain.setValueAtTime(this.loudnessBoost, ctx.currentTime);

      source.connect(compressor);
      compressor.connect(boostGain);
      boostGain.connect(ctx.destination);
    } catch (_) {
      // CORS বা স্ট্রিম সীমাবদ্ধতা থাকলে ডিফল্ট হাই-ভলিউম মোডে নিরাপদে চলবে
      el.volume = 1.0;
    }
  }
};