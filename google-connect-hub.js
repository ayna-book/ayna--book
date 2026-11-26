// AYNA BOOK — Google Services Connector Module (google-connect-hub.js)
class AynaGoogleConnector {
  constructor(config = {}) {
    this.clientId = config.clientId || "YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com";
    this.mapsApiKey = config.mapsApiKey || "";
    this.aiEndpoint = config.aiEndpoint || "/api/ai/assist";
    this.userProfile = null;
  }

  // ১. বর্তমান GPS স্থানাঙ্ক দিয়ে Google Maps লিংক তৈরি ও খোলা
  openInGoogleMaps(lat, lon, label = "AYNA BOOK Location") {
    if (typeof lat !== "number" || typeof lon !== "number" || Number.isNaN(lat) || Number.isNaN(lon)) {
      return { ok: false, message: "সঠিক অক্ষাংশ ও দ্রাঘিমাংশ প্রয়োজন।" };
    }
    const q = encodeURIComponent(`${lat},${lon} (${label})`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, "_blank", "noopener,noreferrer");
    return { ok: true, url };
  }

  // ২. Google Maps JavaScript API ডাইনামিকভাবে লোড করা (API Key থাকলে)
  loadMapsScript(onReady) {
    if (window.google && window.google.maps) {
      if (typeof onReady === "function") onReady(window.google.maps);
      return;
    }
    if (!this.mapsApiKey) {
      return { ok: false, message: "Google Maps API Key যুক্ত করা হয়নি।" };
    }
    const existing = document.getElementById("ayna-google-maps-sdk");
    if (existing) return;

    const cbName = "aynaOnGoogleMapsLoaded";
    window[cbName] = () => {
      if (typeof onReady === "function") onReady(window.google.maps);
    };

    const script = document.createElement("script");
    script.id = "ayna-google-maps-sdk";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(this.mapsApiKey)}&callback=${cbName}`;
    document.head.appendChild(script);
  }

  // ৩. Google Identity Services (GIS) দিয়ে Sign-In ইনিশিয়ালাইজ করা
  initGoogleSignIn(buttonContainerId, onCredentialCallback) {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      return { ok: false, message: "Google Identity SDK লোড হয়নি।" };
    }
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: response => {
        if (typeof onCredentialCallback === "function") {
          onCredentialCallback(response);
        }
      }
    });
    const el = document.getElementById(buttonContainerId);
    if (el) {
      window.google.accounts.id.renderButton(el, {
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "pill"
      });
    }
    return { ok: true };
  }

  // ৪. ব্যাকএন্ডের মাধ্যমে Google AI / Gemini সার্ভিসে প্রশ্ন পাঠানো
  async askGoogleAi(moduleName, promptText, fallbackBn = "Google AI সংযোগ প্রস্তুত।") {
    try {
      const res = await fetch(this.aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          module: moduleName,
          prompt: promptText
        })
      });
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      return (data.reply || data.text || data.answer || fallbackBn).trim();
    } catch (_) {
      return fallbackBn;
    }
  }
}

window.aynaGoogle = new AynaGoogleConnector();