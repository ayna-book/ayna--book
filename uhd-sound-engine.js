// AYNA BOOK* • uhd-sound-engine.js
// World-Class Studio UHD Sound Engine (48kHz UHD Sample Rate + Harmonic Master + WAV Export)

const UHD_SAMPLE_RATE = 48000;

export const AynaUhdMasterSound = {
  ctx: null,
  masterGain: null,
  compressor: null,
  activeNodes: [],
  isPlaying: false,
  currentProfile: "ABBEY_HALL_UHD_48K",

  profiles: {
    ABBEY_HALL_UHD_48K: {
      title: "Abbey Studio Concert UHD (48kHz)",
      freqs: [130.81, 196.0, 261.63, 392.0, 528.0],
      detuneCents: [-7, 0, 6, -5, 4],
      durationSec: 4.5,
      gain: 0.22
    },
    VIENNA_PHIL_UHD: {
      title: "Vienna Symphony Warm UHD (48kHz)",
      freqs: [146.83, 220.0, 293.66, 440.0, 587.33],
      detuneCents: [-5, 4, -3, 5, 0],
      durationSec: 5.0,
      gain: 0.2
    },
    QUANTUM_MASTER_528: {
      title: "Quantum Harmonic Master UHD (48kHz)",
      freqs: [174.61, 264.0, 396.0, 528.0, 792.0],
      detuneCents: [0, -4, 4, 0, 6],
      durationSec: 4.0,
      gain: 0.21
    }
  },

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx({ sampleRate: UHD_SAMPLE_RATE, latencyHint: "interactive" });

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.004, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  },

  stop() {
    this.activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") node.stop();
        node.disconnect();
      } catch (_) {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
  },

  async playUhdSignature(profileKey = this.currentProfile) {
    const ctx = this.ensureContext();
    if (!ctx) return { ok: false, message: "ব্রাউজারে Web Audio API সাপোর্ট পাওয়া যায়নি।" };

    this.stop();
    this.currentProfile = this.profiles[profileKey] ? profileKey : "ABBEY_HALL_UHD_48K";
    const prof = this.profiles[this.currentProfile];
    const now = ctx.currentTime;

    // Stereo Chorus / Hall Delay Bus
    const delay = ctx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.028, now);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(0.26, now);
    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.32, now);

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(this.compressor);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(prof.gain, now + 0.35);
    env.gain.setValueAtTime(prof.gain, now + prof.durationSec - 1.1);
    env.gain.exponentialRampToValueAtTime(0.0001, now + prof.durationSec);
    env.connect(this.compressor);
    env.connect(delay);

    prof.freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(prof.detuneCents[idx] || 0, now);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.28 / (idx * 0.45 + 1), now);

      osc.connect(voiceGain);
      voiceGain.connect(env);
      osc.start(now);
      osc.stop(now + prof.durationSec + 0.05);
      this.activeNodes.push(osc);
    });

    this.activeNodes.push(delay, feedback, wetGain, env);
    this.isPlaying = true;

    setTimeout(() => {
      this.isPlaying = false;
    }, prof.durationSec * 1000);

    return {
      ok: true,
      profile: this.currentProfile,
      title: prof.title,
      sampleRate: ctx.sampleRate || UHD_SAMPLE_RATE
    };
  },

  // 48kHz 16-bit PCM UHD WAV Blob তৈরি করে (অডিও ট্যাগ বা ডাউনলোডের জন্য)
  createUhdWavBlob(profileKey = this.currentProfile) {
    const prof = this.profiles[profileKey] || this.profiles.ABBEY_HALL_UHD_48K;
    const duration = Math.min(prof.durationSec, 4.5);
    const numSamples = Math.floor(UHD_SAMPLE_RATE * duration);
    const numChannels = 2;
    const pcmData = new Int16Array(numSamples * numChannels);

    for (let i = 0; i < numSamples; i++) {
      const t = i / UHD_SAMPLE_RATE;
      const fadeIn = Math.min(1, t / 0.3);
      const fadeOut = Math.min(1, (duration - t) / 0.9);
      const amp = Math.max(0, fadeIn * fadeOut) * prof.gain;

      let leftSample = 0;
      let rightSample = 0;

      prof.freqs.forEach((f, idx) => {
        const detuneRatio = Math.pow(2, (prof.detuneCents[idx] || 0) / 1200);
        const w = 2 * Math.PI * f * detuneRatio * t;
        const echo = 0.25 * Math.sin(2 * Math.PI * f * detuneRatio * Math.max(0, t - 0.028));
        const val = (Math.sin(w) * 0.75 + Math.sin(w * 2) * 0.15 + echo) / (idx * 0.45 + 1);
        const pan = idx % 2 === 0 ? 0.85 : 1.0;
        leftSample += val * pan;
        rightSample += val * (1.85 - pan);
      });

      const lClamped = Math.max(-1, Math.min(1, leftSample * amp * 2.2));
      const rClamped = Math.max(-1, Math.min(1, rightSample * amp * 2.2));
      pcmData[i * 2] = lClamped < 0 ? lClamped * 0x8000 : lClamped * 0x7fff;
      pcmData[i * 2 + 1] = rClamped < 0 ? rClamped * 0x8000 : rClamped * 0x7fff;
    }

    const byteRate = UHD_SAMPLE_RATE * numChannels * 2;
    const blockAlign = numChannels * 2;
    const dataSize = pcmData.byteLength;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, UHD_SAMPLE_RATE, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, dataSize, true);

    new Int16Array(buffer, 44).set(pcmData);
    return new Blob([buffer], { type: "audio/wav" });
  }
};