// =====================================================================
// AYNA BOOK — LOCATION-BASED PRAYER, SEHRI & IFTAR (ayna-geo-prayer.js)
// =====================================================================

const DEFAULT_COORDS = { lat: 21.21, lon: 92.26, cityLabel: "বালুখালী / চট্টগ্রাম" };
const PRAYER_CACHE_KEY = "ayna_prayer_times_cache_v1";

export async function getUserGeoCoords() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(DEFAULT_COORDS);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          cityLabel: `GPS (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`
        });
      },
      () => resolve(DEFAULT_COORDS),
      { timeout: 6000 }
    );
  });
}

export async function syncLocationPrayerTimes(customCoords = null) {
  const coords = customCoords || (await getUserGeoCoords());
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  try {
    const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${coords.lat}&longitude=${coords.lon}&method=1`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    const timings = json?.data?.timings;

    if (timings) {
      const payload = {
        date: `${yyyy}-${mm}-${dd}`,
        locationLabel: coords.cityLabel,
        coords,
        timings: {
          Fajr: (timings.Fajr || "").slice(0, 5),
          Sunrise: (timings.Sunrise || "").slice(0, 5),
          Dhuhr: (timings.Dhuhr || "").slice(0, 5),
          Asr: (timings.Asr || "").slice(0, 5),
          Maghrib: (timings.Maghrib || "").slice(0, 5),
          Isha: (timings.Isha || "").slice(0, 5)
        },
        syncedAt: Date.now()
      };
      localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(payload));
      return payload;
    }
  } catch (err) {
    console.warn("Prayer API offline fallback:", err);
  }

  try {
    return JSON.parse(localStorage.getItem(PRAYER_CACHE_KEY) || "null");
  } catch {
    return null;
  }
}

export function applyPrayerTimesToClock(clockInstance, prayerPayload) {
  if (!clockInstance || !prayerPayload?.timings) return;

  const parseHM = hmStr => {
    const [h, m] = String(hmStr || "04:58").split(":").map(Number);
    return {
      hour: Number.isFinite(h) ? h : 4,
      minute: Number.isFinite(m) ? m : 58
    };
  };

  // সেহরির শেষ সময় সাধারণত ফজরের সময়ের কাছাকাছি রাখা হয়, ইফতার মাগরিবের সময়ে
  clockInstance.sehriTime = parseHM(prayerPayload.timings.Fajr);
  clockInstance.iftarTime = parseHM(prayerPayload.timings.Maghrib);
}