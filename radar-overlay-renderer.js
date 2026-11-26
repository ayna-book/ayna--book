// AYNA BOOK — Radar Canvas Civil & Weather Overlay Renderer (radar-overlay-renderer.js)
class AynaRadarOverlayRenderer {
  constructor(engine = window.aynaCivilWeather) {
    this.engine = engine;
  }

  draw(ctx, width, height, sweepAngleDeg = 0) {
    if (!ctx || !this.engine) return;

    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) * 0.86;
    const weather = this.engine.weather;
    const advisory = this.engine.getWeatherAdvisory();
    const targets = this.engine.targets || [];

    ctx.save();

    // ১. আবহাওয়া সতর্কতা অনুযায়ী বাইরের রিংয়ের রঙ
    const ringColor =
      advisory.level === "high"
        ? "rgba(255, 77, 109, 0.75)"
        : advisory.level === "moderate"
        ? "rgba(255, 230, 77, 0.65)"
        : "rgba(56, 242, 255, 0.35)";

    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    // ২. বাতাসের দিক (Wind Vector) ইন্ডিকেটর
    const windRad = ((weather.windDirectionDeg || 0) - 90) * (Math.PI / 180);
    const wx = cx + Math.cos(windRad) * (maxRadius * 0.72);
    const wy = cy + Math.sin(windRad) * (maxRadius * 0.72);

    ctx.strokeStyle = "#38f2ff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(wx, wy);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#38f2ff";
    ctx.font = "bold 12px Arial, sans-serif";
    ctx.fillText(`WIND ${weather.windSpeedKmh}km/h`, wx + 6, wy - 4);

    // ৩. বেসামরিক টার্গেটগুলো সর্বোচ্চ রেঞ্জ (ধরুন 25 km) স্কেলে রাডারে প্লট করা
    const maxRangeKm = 25;
    targets.forEach(t => {
      const ratio = Math.min(1, t.distanceKm / maxRangeKm);
      const r = ratio * maxRadius;
      const angleRad = (t.bearingDeg - 90) * (Math.PI / 180);
      const tx = cx + Math.cos(angleRad) * r;
      const ty = cy + Math.sin(angleRad) * r;

      const isSwept =
        Math.abs((((sweepAngleDeg - t.bearingDeg + 540) % 360) - 180)) < 14;

      ctx.fillStyle =
        t.proximityAlert === "close"
          ? "#ff4d6d"
          : isSwept
          ? "#ffe64d"
          : "#38f2ff";

      ctx.beginPath();
      ctx.arc(tx, ty, isSwept ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "600 11px Arial, sans-serif";
      ctx.fillText(`${t.name} (${t.distanceKm}km)`, tx + 8, ty + 4);
    });

    ctx.restore();
  }
}

window.aynaRadarOverlay = new AynaRadarOverlayRenderer();