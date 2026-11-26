// AYNA BOOK — Radar Bridge for UHD Sounds & Realtime Sync Bus (radar-sound-sync-bridge.js)
(function attachRadarSoundAndSync() {
  const getSound = () => window.aynaSound || window.uhdSoundsEngine || null;
  const getBus = () => window.aynaBus || null;

  let lastWeatherLevel = null;
  let lastSpokenAt = 0;

  function safePlayTone(toneName) {
    const sound = getSound();
    if (!sound) return;
    try {
      if (typeof sound.playTone === "function") {
        sound.playTone(toneName);
      } else if (typeof sound.play === "function") {
        sound.play(toneName);
      }
    } catch (_) {}
  }

  function safeSpeak(text, minGapMs = 5000) {
    const sound = getSound();
    if (!sound || typeof sound.speak !== "function" || !text) return;
    const now = Date.now();
    if (now - lastSpokenAt < minGapMs) return;
    lastSpokenAt = now;
    try {
      sound.speak(text);
    } catch (_) {}
  }

  function bindRadarEvents() {
    const bus = getBus();
    if (!bus || typeof bus.subscribe !== "function") return;

    // ১. আবহাওয়া আপডেট হলে সাউন্ড ও ভয়েস সতর্কতা
    bus.subscribe("radar:weather-update", payload => {
      const advisory = payload?.advisory;
      if (!advisory) return;

      if (advisory.level === "high") {
        safePlayTone("alert");
        safeSpeak(`জরুরি আবহাওয়া সতর্কতা: ${advisory.summaryBn}`, 4000);
      } else if (advisory.level === "moderate" && lastWeatherLevel !== "moderate") {
        safePlayTone("alert");
        safeSpeak(advisory.summaryBn, 6000);
      } else if (advisory.level === "clear" && lastWeatherLevel && lastWeatherLevel !== "clear") {
        safePlayTone("confirm");
        safeSpeak("আবহাওয়া এখন স্বাভাবিক রয়েছে।", 6000);
      }
      lastWeatherLevel = advisory.level;
    });

    // ২. কাছাকাছি বেসামরিক টার্গেট শনাক্ত হলে টোন সিগন্যাল
    bus.subscribe("radar:civil-targets", payload => {
      const nearest = payload?.nearest;
      if (nearest && nearest.proximityAlert === "close") {
        safePlayTone("confirm");
      }
    });

    // ৩. অন্য ট্যাব বা হাব থেকে আসা SOS বা AI সিগন্যাল
    bus.subscribe("sos:beacon", data => {
      safePlayTone("alert");
      safeSpeak(data?.message || "SOS সংকেত পাওয়া গেছে, রাডার ও লোকেশন পর্যবেক্ষণ করুন।", 2000);
    });

    bus.subscribe("ai:response", data => {
      if (data?.module === "radar" && data?.reply) {
        safeSpeak(data.reply, 4000);
      }
    });
  }

  // রাডার থেকে অন্য ট্যাবে GPS / স্থানাঙ্ক প্রকাশ করার হেল্পার
  window.aynaRadarBridge = {
    publishOrigin(lat, lon, extra = {}) {
      const bus = getBus();
      if (bus && typeof bus.publish === "function") {
        bus.publish("radar:origin-sync", { lat, lon, ...extra });
      }
    },
    announce(text, tone = "confirm") {
      safePlayTone(tone);
      safeSpeak(text, 1500);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindRadarEvents);
  } else {
    bindRadarEvents();
  }
})();