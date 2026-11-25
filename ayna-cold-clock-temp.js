import { askAynaModuleAI } from "./ayna-ai-client.js";

export function getCurrentTimeBn() {
  const formatted = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `এখন সময় ${formatted}`;
}

export function speakBnText(text, onStatus = () => {}) {
  if (!("speechSynthesis" in window)) {
    onStatus("এই ব্রাউজারে SpeechSynthesis সাপোর্ট করে না।");
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

export async function runColdClockWithTemperature({
  latitude = 21.2246,
  longitude = 92.2636,
  locationName = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
  apiBaseUrl = "",
  onStatus = () => {}
} = {}) {
  const timeLine = getCurrentTimeBn();
  speakBnText(timeLine, onStatus);

  let tempC = 27;
  let feelsC = 28;
  let humidity = 72;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}` +
      `&longitude=${encodeURIComponent(longitude)}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const cur = data.current || {};
      tempC = Number(cur.temperature_2m ?? tempC);
      feelsC = Number(cur.apparent_temperature ?? feelsC);
      humidity = Number(cur.relative_humidity_2m ?? humidity);
    }
  } catch (_) {
    // নেটওয়ার্ক সমস্যা হলে ডিফল্ট মান বজায় থাকে
  }

  const fallbackSummary =
    `${locationName}-এ তাপমাত্রা ${tempC} ডিগ্রি সেলসিয়াস, অনুভূত ${feelsC} ডিগ্রি, আর্দ্রতা ${humidity} শতাংশ।`;

  let aiSummary = fallbackSummary;
  try {
    const reply = await askAynaModuleAI({
      module: "weather",
      action: "cold_clock_temperature",
      text: `Time: ${timeLine}. Location: ${locationName}. Temp: ${tempC}C. Feels like: ${feelsC}C. Humidity: ${humidity}%.`,
      context: "Give a short 1-2 sentence Bengali speaking-clock temperature note without markdown or emojis.",
      apiBaseUrl
    });
    const cleaned = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 200);
    if (cleaned) aiSummary = cleaned;
  } catch (_) {
    aiSummary = fallbackSummary;
  }

  const spokenTextBn = `${timeLine}। ${aiSummary}`;
  speakBnText(spokenTextBn, onStatus);

  return {
    timeTextBn: timeLine,
    tempSummaryBn: aiSummary,
    spokenTextBn,
    temperatureC: tempC,
    apparentTempC: feelsC,
    humidityPercent: humidity
  };
}