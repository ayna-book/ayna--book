import { askAynaModuleAI } from "./ayna-ai-client.js";

const UNIFIED_COLD_KEY = "ayna_unified_clock_temp_cold_v1";

export function formatTimeBnNow() {
  const formatted = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `এখন সময় ${formatted}`;
}

export function speakBn(text, onStatus = () => {}) {
  if (!("speechSynthesis" in window)) {
    onStatus("এই ব্রাউজারে SpeechSynthesis সমর্থিত নয়।");
    return;
  }
  const clean = String(text || "").trim();
  if (!clean) return;

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  const voices = window.speechSynthesis.getVoices();
  const bnVoice = voices.find(v => (v.lang || "").toLowerCase().startsWith("bn"));
  if (bnVoice) {
    utter.voice = bnVoice;
    utter.lang = bnVoice.lang;
  }
  utter.onstart = () => onStatus(`বলছে: ${clean}`);
  utter.onerror = (e) => onStatus(`ভয়েস ত্রুটি: ${e.error || "অজানা"}`);
  window.speechSynthesis.speak(utter);
}

export function saveUnifiedColdState(state) {
  const payload = { savedAt: Date.now(), ...state };
  try {
    localStorage.setItem(UNIFIED_COLD_KEY, JSON.stringify(payload));
  } catch (_) {}
  return payload;
}

export function loadUnifiedColdState() {
  try {
    const raw = localStorage.getItem(UNIFIED_COLD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function runUnifiedAiClockAndTemp({
  latitude = 21.2246,
  longitude = 92.2636,
  locationName = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
  apiBaseUrl = "",
  onStatus = () => {}
} = {}) {
  const timeTextBn = formatTimeBnNow();
  onStatus("সময় ও তাপমাত্রা বিশ্লেষণ করছে...");

  const cached = loadUnifiedColdState();
  let tempC = cached?.temperatureC ?? 27;
  let feelsC = cached?.apparentTempC ?? 28;
  let humidity = cached?.humidityPercent ?? 72;
  let fromColdBackup = false;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}` +
      `&longitude=${encodeURIComponent(longitude)}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();
    const cur = data.current || {};
    tempC = Number(cur.temperature_2m ?? tempC);
    feelsC = Number(cur.apparent_temperature ?? feelsC);
    humidity = Number(cur.relative_humidity_2m ?? humidity);
  } catch (_) {
    fromColdBackup = true;
  }

  const fallbackInsight =
    `${locationName}-এ তাপমাত্রা ${tempC}°C (অনুভূত ${feelsC}°C) এবং আর্দ্রতা ${humidity}%।`;

  let aiInsightBn = fallbackInsight;
  try {
    const reply = await askAynaModuleAI({
      module: "weather",
      action: "unified_clock_temperature_ai",
      text: `Time: ${timeTextBn}. Location: ${locationName}. Temp: ${tempC}C. Feels like: ${feelsC}C. Humidity: ${humidity}%.`,
      context: "Give a concise 2-sentence Bengali speaking-clock weather insight without markdown or emojis.",
      apiBaseUrl
    });
    const cleaned = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 220);
    if (cleaned) aiInsightBn = cleaned;
  } catch (_) {
    if (cached?.aiInsightBn) {
      aiInsightBn = cached.aiInsightBn;
      fromColdBackup = true;
    }
  }

  const spokenScriptBn = `${timeTextBn}। ${aiInsightBn}`;
  const result = {
    timeTextBn,
    locationName,
    temperatureC: tempC,
    apparentTempC: feelsC,
    humidityPercent: humidity,
    aiInsightBn,
    spokenScriptBn,
    fromColdBackup
  };

  saveUnifiedColdState(result);
  speakBn(spokenScriptBn, onStatus);
  return result;
}