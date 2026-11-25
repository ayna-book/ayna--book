import { askAynaModuleAI } from "./ayna-ai-client.js";

const AUTO_EV_COLD_KEY = "ayna_auto_ev_cold_v1";

export function loadAutoEvCold() {
  try {
    const raw = JSON.parse(localStorage.getItem(AUTO_EV_COLD_KEY) || "null");
    return Array.isArray(raw?.digests) ? raw.digests : [];
  } catch (_) {
    return [];
  }
}

export function saveAutoEvCold(digests = []) {
  const payload = { savedAt: Date.now(), digests: digests.slice(0, 25) };
  try {
    localStorage.setItem(AUTO_EV_COLD_KEY, JSON.stringify(payload));
  } catch (_) {}
  return payload;
}

export async function runAutoEvAiUpdate({
  focusArea = "Global EV, Battery & Smart Mobility",
  apiBaseUrl = "",
  speak = false
} = {}) {
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  const titleBn = `বিশ্ব অটো ও ইভি আপডেট (${nowStr})`;
  const fallbackSummary =
    "বিশ্ব ইভি বাজারে এলএফপি ব্যাটারি, ফাস্ট চার্জিং, হাইব্রিড প্রতিযোগিতা এবং এআই স্মার্ট ড্রাইভিং প্রযুক্তির দ্রুত অগ্রগতি দেখা যাচ্ছে।";

  let summaryBn = fallbackSummary;
  try {
    const reply = await askAynaModuleAI({
      module: "auto_ev",
      action: "global_auto_ev_auto_update",
      text: `Focus: ${focusArea}. Time: ${nowStr}. Provide current global automobile and EV market/tech update in Bengali.`,
      context: "Write 2 concise sentences in Bengali without markdown or emojis.",
      apiBaseUrl
    });
    const clean = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 320);
    if (clean) summaryBn = clean;
  } catch (_) {
    summaryBn = fallbackSummary;
  }

  const digest = {
    id: `autoev_${Date.now()}`,
    titleBn,
    summaryBn,
    focusArea,
    createdAt: new Date().toISOString()
  };

  const nextDigests = [digest, ...loadAutoEvCold()];
  saveAutoEvCold(nextDigests);

  if (speak && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${titleBn}। ${summaryBn}`);
    const bnVoice = window.speechSynthesis.getVoices().find(v => (v.lang || "").toLowerCase().startsWith("bn"));
    if (bnVoice) {
      utter.voice = bnVoice;
      utter.lang = bnVoice.lang;
    }
    window.speechSynthesis.speak(utter);
  }

  return { digest, digests: nextDigests };
}