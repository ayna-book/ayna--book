import { askAynaModuleAI } from "./ayna-ai-client.js";

export function formatCurrentClockText() {
  const now = new Date();
  const formatted = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `এখন সময় ${formatted}`;
}

export function speakClockText(text, onStatus = () => {}) {
  if (!("speechSynthesis" in window)) {
    onStatus("এই ব্রাউজারে SpeechSynthesis সমর্থিত নয়।");
    return;
  }

  const clean = String(text || "").trim();
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  const voices = window.speechSynthesis.getVoices();
  const bnVoice = voices.find(v => (v.lang || "").toLowerCase().startsWith("bn"));
  if (bnVoice) {
    utterance.voice = bnVoice;
    utterance.lang = bnVoice.lang;
  }

  utterance.onstart = () => onStatus(`বলছে: ${clean}`);
  utterance.onerror = (e) => onStatus(`ভয়েস ত্রুটি: ${e.error || "অজানা"}`);

  window.speechSynthesis.speak(utterance);
}

export async function speakClockWithAI({
  locationLabel = "Balukhali Bazar, Chittagong Division, Bangladesh",
  weatherContext = "",
  apiBaseUrl = "",
  onStatus = () => {}
} = {}) {
  const baseLine = formatCurrentClockText();
  speakClockText(baseLine, onStatus);

  try {
    const aiReply = await askAynaModuleAI({
      module: "weather",
      action: "speaking_clock_briefing",
      text: `Time: ${new Date().toISOString()}. Location: ${locationLabel}. Context: ${weatherContext || "Hourly speaking clock"}`,
      context: "Reply in 1 short Bengali sentence suitable for voice readout without emojis or markdown.",
      apiBaseUrl
    });

    const cleanAi = String(aiReply || "").replace(/[*#]/g, "").trim().slice(0, 180);
    if (cleanAi) {
      speakClockText(`${baseLine}। ${cleanAi}`, onStatus);
    }
  } catch (_) {
    onStatus("স্থানীয় সময় বলা হয়েছে (AI ফলব্যাক)।");
  }
}