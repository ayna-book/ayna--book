// AYNA BOOK — QR Code Scanner Module (qr-scanner-engine.js)
class AynaQrScanner {
  constructor() {
    this.stream = null;
    this.timerId = null;
    this.detector = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
  }

  async start(videoElement, onDetected, onError) {
    if (!videoElement) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (typeof onError === "function") onError("এই ব্রাউজারে ক্যামেরা সমর্থন নেই।");
      return;
    }

    try {
      this.stop();
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      videoElement.srcObject = this.stream;
      await videoElement.play();

      this.timerId = setInterval(async () => {
        if (!this.detector || videoElement.readyState < 2) return;
        try {
          const codes = await this.detector.detect(videoElement);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            const val = String(codes[0].rawValue).trim();
            if (typeof onDetected === "function") onDetected(val);
          }
        } catch (_) {}
      }, 450);
    } catch (_) {
      if (typeof onError === "function") onError("QR ক্যামেরা চালু করা যায়নি।");
    }
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}

window.aynaQrScanner = new AynaQrScanner();