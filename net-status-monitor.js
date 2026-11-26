// AYNA BOOK — Online/Offline & Network Quality Monitor (net-status-monitor.js)
class AynaNetworkMonitor {
  constructor() {
    this.listeners = [];
  }

  getInfo() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
    return {
      online: navigator.onLine,
      effectiveType: conn?.effectiveType || "unknown",
      downlinkMbps: typeof conn?.downlink === "number" ? conn.downlink : null,
      saveData: Boolean(conn?.saveData)
    };
  }

  onChange(cb) {
    if (typeof cb === "function") this.listeners.push(cb);
  }

  init() {
    const notify = () => {
      const info = this.getInfo();
      this.listeners.forEach(fn => {
        try { fn(info); } catch (_) {}
      });
    };
    window.addEventListener("online", notify);
    window.addEventListener("offline", notify);
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && typeof conn.addEventListener === "function") {
      conn.addEventListener("change", notify);
    }
    return this.getInfo();
  }
}

window.aynaNet = new AynaNetworkMonitor();