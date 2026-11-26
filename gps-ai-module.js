// AYNA BOOK — Modern GPS & AI Location Module (gps-ai-module.js)
class AynaModernGpsEngine {
  constructor() {
    this.watchId = null;
    this.lastFix = null;
  }

  // দুই স্থানাঙ্কের মাঝে দূরত্ব (km) — Haversine Formula
  distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // বর্তমান অবস্থান থেকে লক্ষ্যস্থলের বিয়ারিং ডিগ্রি (0°–360°)
  bearingDeg(lat1, lon1, lat2, lon2) {
    const toRad = d => (d * Math.PI) / 180;
    const toDeg = r => (r * 180) / Math.PI;
    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  startTracking(onUpdate, onError) {
    if (!("geolocation" in navigator)) {
      if (typeof onError === "function") onError("এই ডিভাইসে GPS সমর্থন নেই।");
      return;
    }

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    this.watchId = navigator.geolocation.watchPosition(
      pos => {
        const fix = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 0),
          altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude) : null,
          speedKmh: pos.coords.speed !== null ? (pos.coords.speed * 3.6).toFixed(1) : "0.0",
          timestamp: new Date(pos.timestamp).toLocaleTimeString("bn-BD")
        };
        this.lastFix = fix;
        try {
          localStorage.setItem("ayna_last_gps_fix", JSON.stringify(fix));
        } catch (_) {}
        if (typeof onUpdate === "function") onUpdate(fix);
      },
      err => {
        const reason =
          err.code === 1
            ? "GPS লোকেশন অনুমতি দেওয়া হয়নি।"
            : err.code === 2
              ? "GPS সিগন্যাল পাওয়া যাচ্ছে না।"
              : "GPS সময়সীমা শেষ হয়েছে।";
        if (typeof onError === "function") onError(reason);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 12000 }
    );
  }

  stopTracking() {
    if (this.watchId !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}

window.aynaGps = new AynaModernGpsEngine();