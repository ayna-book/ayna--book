// AYNA BOOK — Civil Navigation & Weather Radar Engine (civil-weather-radar.js)
class AynaCivilWeatherRadar {
  constructor() {
    this.targets = [];
    this.weather = {
      location: "Dhaka, Bangladesh",
      temperatureC: 28,
      humidityPct: 68,
      windSpeedKmh: 14,
      windDirectionDeg: 180,
      visibilityKm: 10,
      pressureHpa: 1012,
      conditionCode: "clear", // clear | cloudy | rain | storm | fog
      updatedAt: new Date().toISOString()
    };
  }

  _toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  _toDeg(rad) {
    return ((rad * 180) / Math.PI + 360) % 360;
  }

  // দুটি GPS স্থানাঙ্কের মাঝে দূরত্ব (km) ও প্রাথমিক বিয়ারিং (deg)
  computeVector(fromLat, fromLon, toLat, toLon) {
    const R = 6371;
    const dLat = this._toRad(toLat - fromLat);
    const dLon = this._toRad(toLon - fromLon);
    const lat1 = this._toRad(fromLat);
    const lat2 = this._toRad(toLat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearingDeg = this._toDeg(Math.atan2(y, x));

    return {
      distanceKm: Number(distanceKm.toFixed(2)),
      bearingDeg: Number(bearingDeg.toFixed(1))
    };
  }

  // বেসামরিক রাডার টার্গেট তালিকা আপডেট (যেমন: Checkpoint, Ferry, Hub, Relay)
  setCivilTargets(originLat, originLon, rawTargets = []) {
    this.targets = rawTargets.map((item, idx) => {
      const vec = this.computeVector(originLat, originLon, item.lat, item.lon);
      const speedKmh = Number(item.speedKmh || 0);
      const etaMinutes =
        speedKmh > 0.5 ? Math.round((vec.distanceKm / speedKmh) * 60) : null;

      let proximityAlert = "normal";
      if (vec.distanceKm <= 1) proximityAlert = "close";
      else if (vec.distanceKm <= 5) proximityAlert = "approaching";

      return {
        id: item.id || `CIV-${idx + 1}`,
        name: item.name || "Civil Node",
        category: item.category || "checkpoint", // checkpoint | vessel | transit | weather-station
        lat: item.lat,
        lon: item.lon,
        speedKmh,
        headingDeg: Number(item.headingDeg || 0),
        distanceKm: vec.distanceKm,
        bearingDeg: vec.bearingDeg,
        etaMinutes,
        proximityAlert
      };
    });

    this.targets.sort((a, b) => a.distanceKm - b.distanceKm);

    if (window.aynaBus && typeof window.aynaBus.publish === "function") {
      window.aynaBus.publish("radar:civil-targets", {
        count: this.targets.length,
        nearest: this.targets[0] || null
      });
    }

    return this.targets;
  }

  // লাইভ আবহাওয়া ডেটা সেট বা আপডেট করা
  updateWeather(patch = {}) {
    this.weather = {
      ...this.weather,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    const advisory = this.getWeatherAdvisory();
    if (window.aynaBus && typeof window.aynaBus.publish === "function") {
      window.aynaBus.publish("radar:weather-update", {
        weather: this.weather,
        advisory
      });
    }

    return { weather: this.weather, advisory };
  }

  // আবহাওয়া ও দৃশ্যমানতার ভিত্তিতে রাডার অ্যাডভাইজরি তৈরি
  getWeatherAdvisory() {
    const w = this.weather;
    const alerts = [];

    if (w.conditionCode === "storm" || w.windSpeedKmh >= 45) {
      alerts.push("তীব্র ঝড়ো হাওয়া বা বজ্রপাতের ঝুঁকি রয়েছে; খোলা জায়গা ও চলাচলে সতর্ক থাকুন।");
    } else if (w.conditionCode === "rain" || w.humidityPct >= 88) {
      alerts.push("বৃষ্টি বা উচ্চ আর্দ্রতা রয়েছে; দৃশ্যমানতা ও গ্রিপ কমে যেতে পারে।");
    }

    if (w.visibilityKm < 2 || w.conditionCode === "fog") {
      alerts.push(`দৃশ্যমানতা কম (${w.visibilityKm} কিমি); GPS বিয়ারিং ও রাডার সিগন্যালের ওপর নির্ভর করুন।`);
    }

    if (w.temperatureC >= 37) {
      alerts.push(`তাপমাত্রা বেশি (${w.temperatureC}°C); দীর্ঘক্ষণ বাইরে অবস্থান করলে হাইড্রেশন বজায় রাখুন।`);
    }

    const level =
      w.conditionCode === "storm" || w.windSpeedKmh >= 45 || w.visibilityKm < 1
        ? "high"
        : alerts.length > 0
        ? "moderate"
        : "clear";

    return {
      level,
      summaryBn:
        alerts.length > 0
          ? alerts.join(" ")
          : `আবহাওয়া স্বাভাবিক (${w.temperatureC}°C, বাতাস ${w.windSpeedKmh} কিমি/ঘণ্টা, দৃশ্যমানতা ${w.visibilityKm} কিমি)।`
    };
  }
}

window.aynaCivilWeather = new AynaCivilWeatherRadar();