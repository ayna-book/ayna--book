import { askAynaModuleAI } from "./ayna-ai-client.js";

const RADAR_COMPASS_COLD_KEY = "ayna_radar_compass_cold_v1";

export function degToCardinalBn(deg = 0) {
  const d = ((Number(deg) % 360) + 360) % 360;
  if (d >= 337.5 || d < 22.5) return "উত্তর (N)";
  if (d < 67.5) return "উত্তর-পূর্ব (NE)";
  if (d < 112.5) return "পূর্ব (E)";
  if (d < 157.5) return "দক্ষিণ-পূর্ব (SE)";
  if (d < 202.5) return "দক্ষিণ (S)";
  if (d < 247.5) return "দক্ষিণ-পশ্চিম (SW)";
  if (d < 292.5) return "পশ্চিম (W)";
  return "উত্তর-পশ্চিম (NW)";
}

export function saveRadarCompassCold(payload) {
  try {
    localStorage.setItem(RADAR_COMPASS_COLD_KEY, JSON.stringify({ savedAt: Date.now(), ...payload }));
  } catch (_) {}
}

export function loadRadarCompassCold() {
  try {
    return JSON.parse(localStorage.getItem(RADAR_COMPASS_COLD_KEY) || "null");
  } catch (_) {
    return null;
  }
}

export async function runRadarCompassAi({
  azimuthDeg = 0,
  radarRangeKm = 15,
  locationLabelBn = "ঢাকা, ঢাকা বিভাগ",
  apiBaseUrl = "",
  speak = true
} = {}) {
  const deg = Math.round(((Number(azimuthDeg) % 360) + 360) % 360);
  const cardinalBn = degToCardinalBn(deg);
  const fallbackBriefing =
    `${locationLabelBn}-এ কম্পাস দিক ${deg}° (${cardinalBn}) এবং রাডার রেঞ্জ ${radarRangeKm} কিমি নির্ধারিত আছে।`;

  let briefingBn = fallbackBriefing;
  try {
    const reply = await askAynaModuleAI({
      module: "radar_compass",
      action: "radar_compass_navigation_briefing",
      text: `Location: ${locationLabelBn}. Heading: ${deg} deg (${cardinalBn}). Radar range: ${radarRangeKm} km.`,
      context: "Provide a concise 2-sentence Bengali radar and compass briefing without markdown or emojis.",
      apiBaseUrl
    });
    const clean = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 240);
    if (clean) briefingBn = clean;
  } catch (_) {
    briefingBn = fallbackBriefing;
  }

  const state = { azimuthDeg: deg, cardinalBn, radarRangeKm, locationLabelBn, briefingBn };
  saveRadarCompassCold(state);

  if (speak && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(briefingBn);
    const bnVoice = window.speechSynthesis.getVoices().find(v => (v.lang || "").toLowerCase().startsWith("bn"));
    if (bnVoice) {
      utter.voice = bnVoice;
      utter.lang = bnVoice.lang;
    }
    window.speechSynthesis.speak(utter);
  }

  return state;
}