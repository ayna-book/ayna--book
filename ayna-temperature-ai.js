import { askAynaModuleAI } from "./ayna-ai-client.js";

export async function fetchWeatherSnapshot({
  latitude = 21.2246,
  longitude = 92.2636,
  locationName = "বালুখালী বাজার, চট্টগ্রাম বিভাগ"
} = {}) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API failed (${res.status})`);
  }
  const data = await res.json();
  const cur = data.current || {};

  return {
    locationName,
    temperatureC: Number(cur.temperature_2m ?? 26),
    apparentTempC: Number(cur.apparent_temperature ?? 27),
    humidityPercent: Number(cur.relative_humidity_2m ?? 70),
    windKmh: Number(cur.wind_speed_10m ?? 8),
    weatherCode: Number(cur.weather_code ?? 0)
  };
}

export function buildFallbackTempBn(snap) {
  let feel = "সহনীয় ও আরামদায়ক তাপমাত্রা রয়েছে";
  if (snap.apparentTempC >= 35) feel = "খুবই গরম অনুভূত হচ্ছে";
  else if (snap.apparentTempC >= 30) feel = "গরম ও আর্দ্রতা বেশি";
  else if (snap.apparentTempC < 16) feel = "বেশ ঠান্ডা আবহাওয়া, গরম কাপড় রাখুন";
  else if (snap.apparentTempC < 22) feel = "হালকা ঠান্ডা আবহাওয়া রয়েছে";

  return `${snap.locationName}-এ বর্তমান তাপমাত্রা ${snap.temperatureC}°C (অনুভূত ${snap.apparentTempC}°C) এবং আর্দ্রতা ${snap.humidityPercent}%। ${feel}।`;
}

export async function understandTemperatureWithAI({
  latitude = 21.2246,
  longitude = 92.2636,
  locationName = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
  userNote = "",
  apiBaseUrl = ""
} = {}) {
  const snapshot = await fetchWeatherSnapshot({ latitude, longitude, locationName });

  try {
    const prompt =
      `Location: ${snapshot.locationName}. Temp: ${snapshot.temperatureC}°C. ` +
      `Feels like: ${snapshot.apparentTempC}°C. Humidity: ${snapshot.humidityPercent}%. ` +
      `Wind: ${snapshot.windKmh} km/h. Note: ${userNote || "None"}`;

    const reply = await askAynaModuleAI({
      module: "weather",
      action: "temperature_understanding",
      text: prompt,
      context: "Give a clear, friendly 2-sentence Bengali temperature insight and comfort tip without markdown.",
      apiBaseUrl
    });

    return {
      snapshot,
      aiSummaryBn: String(reply || "").trim() || buildFallbackTempBn(snapshot)
    };
  } catch (_) {
    return {
      snapshot,
      aiSummaryBn: buildFallbackTempBn(snapshot)
    };
  }
}