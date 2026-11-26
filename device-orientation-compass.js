// AYNA BOOK — Live Device Heading & Compass Bridge (device-orientation-compass.js)
class AynaDeviceHeading {
  constructor() {
    this.headingDeg = null;
    this.callbacks = [];
    this.listening = false;
  }

  onHeading(cb) {
    if (typeof cb === "function") this.callbacks.push(cb);
  }

  _emit(deg) {
    const normalized = ((Number(deg) % 360) + 360) % 360;
    this.headingDeg = normalized;
    this.callbacks.forEach(fn => {
      try { fn(normalized); } catch (_) {}
    });
  }

  async enable() {
    if (this.listening) return { ok: true, heading: this.headingDeg };

    // iOS 13+ অনুমতি চাইলে অনুরোধ করা
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const state = await DeviceOrientationEvent.requestPermission();
        if (state !== "granted") {
          return { ok: false, message: "কম্পাস সেন্সরের অনুমতি দেওয়া হয়নি।" };
        }
      } catch (_) {
        return { ok: false, message: "সেন্সর অনুমতি যাচাই করা যায়নি।" };
      }
    }

    const handler = event => {
      if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
        this._emit(event.webkitCompassHeading);
      } else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
        const compassHeading = (360 - event.alpha) % 360;
        this._emit(compassHeading);
      }
    };

    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    this.listening = true;
    return { ok: true, heading: this.headingDeg };
  }
}

window.aynaHeading = new AynaDeviceHeading();