// =====================================================================
// AYNA BOOK — VOICE NOTE RECORDER (ayna-voice-recorder.js)
// =====================================================================

export async function createAynaVoiceRecorder() {
  if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
    throw new Error("এই ডিভাইসে ভয়েস রেকর্ডিং সাপোর্ট নেই");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const chunks = [];
  const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  recorder.ondataavailable = event => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  return {
    start() {
      chunks.length = 0;
      recorder.start();
    },
    stop() {
      return new Promise((resolve, reject) => {
        recorder.onerror = err => reject(err);
        recorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          const finalType = recorder.mimeType || "audio/webm";
          const blob = new Blob(chunks, { type: finalType });
          const ext = finalType.includes("mp4") ? "m4a" : "webm";
          const file = new File([blob], `ayna_voice_${Date.now()}.${ext}`, {
            type: finalType,
            lastModified: Date.now()
          });
          resolve(file);
        };
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      });
    },
    cancel() {
      stream.getTracks().forEach(track => track.stop());
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }
  };
}