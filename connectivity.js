
/* =========================================================
   AYNA BOOK
   Network Connectivity Monitor
   ========================================================= */

class AynaConnectivityEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pingInterval = null;
    this.statusListeners = [];

    this.init();
  }

  init() {
    window.addEventListener("online", () => {
      this.checkConnection();
    });

    window.addEventListener("offline", () => {
      this.handleStatusChange(false);
    });

    this.updateUIBadge(this.isOnline);

    // প্রথমবার সংযোগ পরীক্ষা
    this.checkConnection();

    // প্রতি ৩০ সেকেন্ডে পরীক্ষা
    this.pingInterval = setInterval(() => {
      this.checkConnection();
    }, 30000);

    console.log(
      "AYNA BOOK Connectivity Engine Started."
    );
  }

  handleStatusChange(status) {
    if (this.isOnline === status) {
      this.updateUIBadge(status);
      return;
    }

    this.isOnline = status;

    this.updateUIBadge(status);

    console.log(
      "AYNA BOOK Network:",
      status ? "ONLINE" : "OFFLINE"
    );

    this.statusListeners.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error(
          "AYNA BOOK Listener Error:",
          error
        );
      }
    });
  }

  updateUIBadge(status) {
    const badge = document.getElementById(
      "network-status-badge"
    );

    if (!badge) return;

    badge.textContent = status
      ? "🟢 ONLINE"
      : "🔴 OFFLINE";

    badge.style.color = status
      ? "#2ECC71"
      : "#ef4444";
  }

  async checkConnection() {
    if (!navigator.onLine) {
      this.handleStatusChange(false);
      return false;
    }

    try {
      const pageURL = new URL(
        "./index.html",
        document.baseURI
      );

      pageURL.searchParams.set(
        "network-check",
        Date.now()
      );

      const response = await fetch(pageURL, {
        method: "HEAD",
        cache: "no-store"
      });

      const connected = response.ok;

      this.handleStatusChange(connected);

      return connected;

    } catch (error) {
      console.warn(
        "AYNA BOOK: Connection check failed.",
        error
      );

      this.handleStatusChange(false);

      return false;
    }
  }

  onStatusChange(callback) {
    if (typeof callback !== "function") {
      return () => {};
    }

    this.statusListeners.push(callback);

    // Listener বন্ধ করার ব্যবস্থা
    return () => {
      this.statusListeners =
        this.statusListeners.filter(
          (item) => item !== callback
        );
    };
  }

  destroy() {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.statusListeners = [];

    console.log(
      "AYNA BOOK Connectivity Engine Stopped."
    );
  }
}

// Global instance
window.AynaNetwork =
  new AynaConnectivityEngine();

console.log(
  "AYNA BOOK — Connectivity Loaded Successfully."
);
