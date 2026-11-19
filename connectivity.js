/* =========================================================
   AYNA BOOK
   Network Connectivity Monitor
   Firebase SDK: 13.4.0
   ========================================================= */

class AynaConnectivityEngine {

  constructor() {

    this.isOnline = navigator.onLine;

    this.pingInterval = null;

    this.statusListeners = [];

    this.init();

  }


  // -------------------------------------------------------
  // Initialize
  // -------------------------------------------------------

  init() {

    window.addEventListener(
      "online",
      () => {
        this.checkConnection();
      }
    );


    window.addEventListener(
      "offline",
      () => {
        this.handleStatusChange(false);
      }
    );


    this.updateUIBadge(
      this.isOnline
    );


    // প্রথমবার সংযোগ পরীক্ষা
    this.checkConnection();


    // প্রতি ৩০ সেকেন্ডে পরীক্ষা
    this.pingInterval = setInterval(
      () => {
        this.checkConnection();
      },
      30000
    );


    console.log(
      "AYNA BOOK Connectivity Engine Started."
    );

  }


  // -------------------------------------------------------
  // Handle Network Status
  // -------------------------------------------------------

  handleStatusChange(status) {

    const changed =
      this.isOnline !== status;


    this.isOnline = status;


    this.updateUIBadge(
      status
    );


    if (!changed) {
      return;
    }


    console.log(
      "AYNA BOOK Network:",
      status
        ? "ONLINE"
        : "OFFLINE"
    );


    this.statusListeners.forEach(
      (callback) => {

        try {

          callback(status);

        } catch (error) {

          console.error(
            "AYNA BOOK Listener Error:",
            error
          );

        }

      }
    );

  }


  // -------------------------------------------------------
  // Update Network Badge
  // -------------------------------------------------------

  updateUIBadge(status) {

    const badge =
      document.getElementById(
        "network-status-badge"
      );


    if (!badge) {
      return;
    }


    badge.textContent =
      status
        ? "🟢 ONLINE"
        : "🔴 OFFLINE";


    badge.style.color =
      status
        ? "#2ECC71"
        : "#ef4444";

  }


  // -------------------------------------------------------
  // Check Internet Connection
  // -------------------------------------------------------

  async checkConnection() {

    if (!navigator.onLine) {

      this.handleStatusChange(
        false
      );

      return false;

    }


    try {

      const pageURL =
        new URL(
          "./index.html",
          document.baseURI
        );


      // Browser cache এড়িয়ে নতুন request
      pageURL.searchParams.set(
        "network-check",
        Date.now().toString()
      );


      const response =
        await fetch(
          pageURL.toString(),
          {
            method: "HEAD",
            cache: "no-store"
          }
        );


      const connected =
        response.ok;


      this.handleStatusChange(
        connected
      );


      return connected;


    } catch (error) {

      console.warn(
        "AYNA BOOK: Connection check failed.",
        error
      );


      this.handleStatusChange(
        false
      );


      return false;

    }

  }


  // -------------------------------------------------------
  // Add Status Listener
  // -------------------------------------------------------

  onStatusChange(callback) {

    if (
      typeof callback !==
      "function"
    ) {

      return () => {};

    }


    this.statusListeners.push(
      callback
    );


    // Listener remove করার function
    return () => {

      this.statusListeners =
        this.statusListeners.filter(
          (item) =>
            item !== callback
        );

    };

  }


  // -------------------------------------------------------
  // Stop Connectivity Engine
  // -------------------------------------------------------

  destroy() {

    if (
      this.pingInterval !== null
    ) {

      clearInterval(
        this.pingInterval
      );

      this.pingInterval = null;

    }


    this.statusListeners = [];


    console.log(
      "AYNA BOOK Connectivity Engine Stopped."
    );

  }

}


// ---------------------------------------------------------
// Global AYNA BOOK Network Engine
// ---------------------------------------------------------

if (!window.AynaNetwork) {

  window.AynaNetwork =
    new AynaConnectivityEngine();

} else {

  console.warn(
    "AYNA BOOK: AynaNetwork already exists."
  );

}


// ---------------------------------------------------------
// Ready
// ---------------------------------------------------------

console.log(
  "AYNA BOOK — Connectivity Loaded Successfully."
);