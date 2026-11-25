import { askAynaModuleAI } from "./ayna-ai-client.js";

const WORLD_STATS_COLD_KEY = "ayna_world_stats_cold_v1";

export const WORLD_COUNTRIES_STATS = [
  { isoCode: "BGD", nameBn: "বাংলাদেশ", nameEn: "Bangladesh", areaSqKm: 147570, population: 173500000, gdpGrowthPercent: 5.8, regionBn: "দক্ষিণ এশিয়া" },
  { isoCode: "IND", nameBn: "ভারত", nameEn: "India", areaSqKm: 3287263, population: 1450000000, gdpGrowthPercent: 6.5, regionBn: "দক্ষিণ এশিয়া" },
  { isoCode: "USA", nameBn: "যুক্তরাষ্ট্র", nameEn: "United States", areaSqKm: 9833517, population: 345000000, gdpGrowthPercent: 2.4, regionBn: "উত্তর আমেরিকা" },
  { isoCode: "CHN", nameBn: "চীন", nameEn: "China", areaSqKm: 9596961, population: 1409000000, gdpGrowthPercent: 4.8, regionBn: "পূর্ব এশিয়া" },
  { isoCode: "JPN", nameBn: "জাপান", nameEn: "Japan", areaSqKm: 377975, population: 123700000, gdpGrowthPercent: 1.1, regionBn: "পূর্ব এশিয়া" },
  { isoCode: "DEU", nameBn: "জার্মানি", nameEn: "Germany", areaSqKm: 357114, population: 84500000, gdpGrowthPercent: 0.6, regionBn: "ইউরোপ" },
  { isoCode: "BRA", nameBn: "ব্রাজিল", nameEn: "Brazil", areaSqKm: 8515767, population: 216500000, gdpGrowthPercent: 2.9, regionBn: "দক্ষিণ আমেরিকা" },
  { isoCode: "SAU", nameBn: "সৌদি আরব", nameEn: "Saudi Arabia", areaSqKm: 2149690, population: 37200000, gdpGrowthPercent: 4.2, regionBn: "মধ্যপ্রাচ্য" }
];

export function saveWorldStatsCold(payload) {
  try {
    localStorage.setItem(WORLD_STATS_COLD_KEY, JSON.stringify({ savedAt: Date.now(), ...payload }));
  } catch (_) {}
}

export function loadWorldStatsCold() {
  try {
    return JSON.parse(localStorage.getItem(WORLD_STATS_COLD_KEY) || "null");
  } catch (_) {
    return null;
  }
}

export async function analyzeCountryStatsAiWeb({
  isoCode = "BGD",
  apiBaseUrl = "",
  speak = true
} = {}) {
  const country =
    WORLD_COUNTRIES_STATS.find(c => c.isoCode === isoCode) || WORLD_COUNTRIES_STATS[0];
  const density = Math.round(country.population / Math.max(country.areaSqKm, 1));
  const fallbackAnalysis =
    `${country.nameBn}: আয়াতন ${country.areaSqKm.toLocaleString()} বর্গকিমি, জনসংখ্যা ${country.population.toLocaleString()} (জনঘনত্ব ~${density.toLocaleString()}/বর্গকিমি), এবং অর্থনৈতিক প্রবৃদ্ধিহার ${country.gdpGrowthPercent}%।`;

  let analysisBn = fallbackAnalysis;
  try {
    const reply = await askAynaModuleAI({
      module: "world_stats",
      action: "country_area_population_gdp_growth_analysis",
      text: `Country: ${country.nameBn} (${country.nameEn}). Area: ${country.areaSqKm} sq km. Population: ${country.population}. Density: ~${density}/sq km. GDP growth: ${country.gdpGrowthPercent}%.`,
      context: "Provide a concise 2-3 sentence Bengali summary of area, population density, and economic growth rate without markdown asterisks or emojis.",
      apiBaseUrl
    });
    const clean = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 300);
    if (clean) analysisBn = clean;
  } catch (_) {
    analysisBn = fallbackAnalysis;
  }

  const result = { country, density, analysisBn };
  saveWorldStatsCold({ lastResult: result });

  if (speak && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(analysisBn);
    const bnVoice = window.speechSynthesis.getVoices().find(v => (v.lang || "").toLowerCase().startsWith("bn"));
    if (bnVoice) {
      utter.voice = bnVoice;
      utter.lang = bnVoice.lang;
    }
    window.speechSynthesis.speak(utter);
  }

  return result;
}