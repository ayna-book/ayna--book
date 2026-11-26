// AYNA BOOK — App Speed & Performance Booster Engine (speed-booster-engine.js)
class AynaSpeedBooster {
  constructor(options = {}) {
    this.maxFps = options.maxFps || 30;
    this.frameInterval = 1000 / this.maxFps;
    this.lastFrameTime = 0;
    this.idleQueue = [];
    this.isDrainingIdle = false;
  }

  // ১. রিকোয়েস্ট/ফাংশন দ্রুত কিন্তু অতিরিক্ত বার কল না করার Debounce
  debounce(fn, wait = 180) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ২. হাই-ফ্রিকোয়েন্সি ইভেন্ট (scroll, resize, sensor) নিয়ন্ত্রণের Throttle
  throttle(fn, limit = 100) {
    let inThrottle = false;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  // ৩. ক্যানভাস/অ্যানিমেশন লুপে FPS ক্যাপ করে CPU ও ব্যাটারি সাশ্রয়
  shouldRenderFrame(now) {
    if (now - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = now - ((now - this.lastFrameTime) % this.frameInterval);
      return true;
    }
    return false;
  }

  // ৪. কম জরুরি কাজগুলো ব্রাউজার ফ্রি থাকলে (Idle সময়ে) চালানো
  runWhenIdle(taskFn) {
    if (typeof taskFn !== "function") return;
    this.idleQueue.push(taskFn);
    if (this.isDrainingIdle) return;
    this.isDrainingIdle = true;

    const schedule = window.requestIdleCallback || (cb => setTimeout(() => cb({ timeRemaining: () => 16 }), 20));
    const step = deadline => {
      while (this.idleQueue.length > 0 && deadline.timeRemaining() > 4) {
        const nextTask = this.idleQueue.shift();
        try { nextTask(); } catch (_) {}
      }
      if (this.idleQueue.length > 0) {
        schedule(step);
      } else {
        this.isDrainingIdle = false;
      }
    };
    schedule(step);
  }

  // ৫. নিরাপদ ও দ্রুত LocalStorage Cache (TTL / মেয়াদসহ)
  setCache(key, value, ttlMs = 3600000) {
    try {
      const payload = {
        v: value,
        exp: Date.now() + ttlMs
      };
      localStorage.setItem("ayna_fast_" + key, JSON.stringify(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  getCache(key) {
    try {
      const raw = localStorage.getItem("ayna_fast_" + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.exp !== "number") return null;
      if (Date.now() > parsed.exp) {
        localStorage.removeItem("ayna_fast_" + key);
        return null;
      }
      return parsed.v;
    } catch (_) {
      return null;
    }
  }

  // ৬. পেজ লোড ও রিসোর্স স্পিড রিপোর্ট
  getPerformanceSummary() {
    const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    const domReadyMs = nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null;
    const loadMs = nav ? Math.round(nav.loadEventEnd - nav.startTime) : null;
    return {
      domReadyMs,
      loadMs,
      fpsCap: this.maxFps,
      queuedIdleTasks: this.idleQueue.length
    };
  }
}

window.aynaSpeed = new AynaSpeedBooster({ maxFps: 30 });