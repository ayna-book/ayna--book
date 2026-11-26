// AYNA BOOK — Advanced System Diagnostics & Error Guard (diagnostics-health-hub.js)
class AynaDiagnosticsHub {
  constructor() {
    this.errorLogs = [];
    this.bindGlobalGuards();
  }

  bindGlobalGuards() {
    window.addEventListener("error", event => {
      this.recordError("window.error", event.message || "Unknown script error", event.filename, event.lineno);
    });

    window.addEventListener("unhandledrejection", event => {
      const reason = event.reason && (event.reason.message || String(event.reason));
      this.recordError("promise.rejection", reason || "Unhandled promise rejection");
    });
  }

  recordError(type, message, file = "", line = 0) {
    this.errorLogs.unshift({
      type,
      message,
      file,
      line,
      at: new Date().toISOString()
    });
    this.errorLogs = this.errorLogs.slice(0, 50);
  }

  checkModules() {
    const registry = {
      sound: Boolean(window.aynaSound || window.uhdSoundsEngine),
      gps: Boolean(window.aynaGps),
      google: Boolean(window.aynaGoogle),
      speed: Boolean(window.aynaSpeed),
      backup: Boolean(window.aynaBackup),
      vault: Boolean(window.aynaVault),
      qrScanner: Boolean(window.aynaQrScanner),
      network: Boolean(window.aynaNet),
      iconGen: Boolean(typeof window.generateAynaAppIcon === "function")
    };

    const total = Object.keys(registry).length;
    const active = Object.values(registry).filter(Boolean).length;

    return {
      activeCount: active,
      totalCount: total,
      healthPercent: Math.round((active / total) * 100),
      registry,
      recentErrors: this.errorLogs.length
    };
  }

  getStorageUsageKb() {
    try {
      let bytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        const v = localStorage.getItem(k) || "";
        bytes += (k.length + v.length) * 2;
      }
      return Number((bytes / 1024).toFixed(2));
    } catch (_) {
      return 0;
    }
  }
}

window.aynaDiag = new AynaDiagnosticsHub();