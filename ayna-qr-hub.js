// =====================================================================
// AYNA BOOK — QR & BARCODE GENERATOR / SCANNER (ayna-qr-hub.js)
// =====================================================================

export function renderVisualCodeCard(containerEl, payloadText = "", title = "AYNA BOOK ID") {
  if (!containerEl) return;
  const cleanPayload = String(payloadText || "").trim() || "AYNA-2026-10000001";

  let hash = 0;
  for (let i = 0; i < cleanPayload.length; i++) {
    hash = ((hash << 5) - hash + cleanPayload.charCodeAt(i)) | 0;
  }

  const cells = [];
  const totalCells = 49; // 7x7 grid
  for (let i = 0; i < totalCells; i++) {
    const bit = ((Math.abs(hash >> (i % 24)) + i * 7) % 2) === 0;
    cells.push(
      `<span style="display:block;width:100%;aspect-ratio:1;background:${bit ? "#ffe64d" : "#050b1c"};border-radius:2px;"></span>`
    );
  }

  containerEl.innerHTML = `
    <div style="background:#060e24;border:3px solid #ffe64d;border-radius:10px;padding:18px;text-align:center;">
      <div style="font-size:28px;font-weight:900;color:#fff6b3;margin-bottom:10px;">${title}</div>
      <div style="display:grid;grid-template-columns:repeat(7,26px);gap:4px;justify-content:center;padding:12px;background:#091738;border:2px solid #ffe64d;border-radius:8px;margin:0 auto 12px;width:fit-content;">
        ${cells.join("")}
      </div>
      <div style="font-size:24px;color:#38f2ff;word-break:break-all;">${cleanPayload}</div>
    </div>
  `;
}

export async function startBarcodeScanner(videoEl, onDetected, onError) {
  if (!navigator.mediaDevices?.getUserMedia) {
    if (typeof onError === "function") onError("ক্যামেরা সাপোর্ট পাওয়া যায়নি");
    return null;
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
    audio: false
  });
  videoEl.srcObject = stream;
  await videoEl.play();

  const hasDetector = "BarcodeDetector" in window;
  const detector = hasDetector ? new window.BarcodeDetector() : null;
  let active = true;

  const scanLoop = async () => {
    if (!active || !videoEl || videoEl.readyState < 2) {
      if (active) requestAnimationFrame(scanLoop);
      return;
    }
    if (detector) {
      try {
        const codes = await detector.detect(videoEl);
        if (codes && codes.length > 0 && codes[0].rawValue) {
          if (typeof onDetected === "function") {
            onDetected(codes[0].rawValue, codes[0].format || "CODE");
          }
        }
      } catch (_) {}
    }
    if (active) requestAnimationFrame(scanLoop);
  };

  requestAnimationFrame(scanLoop);

  return {
    supported: hasDetector,
    stop() {
      active = false;
      stream.getTracks().forEach(t => t.stop());
      videoEl.srcObject = null;
    }
  };
}