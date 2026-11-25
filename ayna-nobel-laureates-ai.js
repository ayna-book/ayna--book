import { askAynaModuleAI } from "./ayna-ai-client.js";

const NOBEL_COLD_KEY = "ayna_laureates_cold_v1";

export const NOBEL_AND_NOTABLE_FIGURES = [
  {
    id: "nobel_2026_phys",
    name: "Francis Halzen",
    year: 2026,
    prizeOrHonor: "পদার্থবিজ্ঞানে নোবেল পুরস্কার ২০২৬",
    achievementBn: "IceCube Neutrino Observatory ও উচ্চ-শক্তির অ্যাস্ট্রোফিজিক্যাল নিউট্রিনো আবিষ্কারে অবদান।"
  },
  {
    id: "nobel_2026_chem",
    name: "Henri B. Kagan ও Kenso Soai",
    year: 2026,
    prizeOrHonor: "রসায়নে নোবেল পুরস্কার ২০২৬",
    achievementBn: "অসমমিত জৈব সংশ্লেষণে নন-লিনিয়ার প্রভাব ও অটোক্যাটালাইসিস আবিষ্কার।"
  },
  {
    id: "nobel_2026_med",
    name: "Karl Deisseroth, Peter Hegemann ও Georg Nagel",
    year: 2026,
    prizeOrHonor: "চিকিৎসাবিজ্ঞানে নোবেল পুরস্কার ২০২৬",
    achievementBn: "লাইট-গেটেড আয়ন চ্যানেল ও অপটোজেনেটিক্স সংক্রান্ত আবিষ্কার।"
  },
  {
    id: "nobel_2026_lit",
    name: "Anne Carson",
    year: 2026,
    prizeOrHonor: "সাহিত্যে নোবেল পুরস্কার ২০২৬",
    achievementBn: "ধ্রুপদী ঐতিহ্যের সংলাপে সমকালীন সাহিত্যে নতুন রূপ সৃষ্টি।"
  },
  {
    id: "nobel_2026_peace",
    name: "Navanethem “Navi” Pillay",
    year: 2026,
    prizeOrHonor: "শান্তিতে নোবেল পুরস্কার ২০২৬",
    achievementBn: "শান্তি ও আন্তর্জাতিক আইন প্রতিষ্ঠায় অবদান।"
  },
  {
    id: "nobel_2026_econ",
    name: "Robert E. Hall ও Michael Woodford",
    year: 2026,
    prizeOrHonor: "অর্থনীতিতে নোবেল স্মৃতি পুরস্কার ২০২৬",
    achievementBn: "সামষ্টিক অর্থনৈতিক স্থিতিশীলতার ক্ষুদ্রঅর্থনৈতিক ভিত্তি।"
  }
];

export function loadLaureatesCold() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOBEL_COLD_KEY) || "null");
    return Array.isArray(raw?.entries) && raw.entries.length > 0
      ? raw.entries
      : NOBEL_AND_NOTABLE_FIGURES;
  } catch (_) {
    return NOBEL_AND_NOTABLE_FIGURES;
  }
}

export function saveLaureatesCold(entries = []) {
  try {
    localStorage.setItem(NOBEL_COLD_KEY, JSON.stringify({ savedAt: Date.now(), entries }));
  } catch (_) {}
}

export async function updateLaureateWithAiWeb({
  id = "nobel_2026_phys",
  apiBaseUrl = "",
  speak = true
} = {}) {
  const list = loadLaureatesCold();
  const target = list.find(x => x.id === id) || list[0];
  const fallbackSpotlight = `${target.name} (${target.year}) — ${target.prizeOrHonor}: ${target.achievementBn}`;

  let spotlightBn = fallbackSpotlight;
  try {
    const reply = await askAynaModuleAI({
      module: "nobel_laureates",
      action: "laureate_award_auto_update",
      text: `Name: ${target.name}. Year: ${target.year}. Award: ${target.prizeOrHonor}. Contribution: ${target.achievementBn}.`,
      context: "Write a concise 2-sentence Bengali summary of this laureate and their award contribution without markdown asterisks or emojis.",
      apiBaseUrl
    });
    const clean = String(reply || "").replace(/[*#]/g, "").trim().slice(0, 280);
    if (clean) spotlightBn = clean;
  } catch (_) {
    spotlightBn = fallbackSpotlight;
  }

  const nextList = list.map(item => (item.id === target.id ? { ...item, aiSpotlightBn: spotlightBn } : item));
  saveLaureatesCold(nextList);

  if (speak && typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${target.name}। ${target.prizeOrHonor}। ${spotlightBn}`);
    const bnVoice = window.speechSynthesis.getVoices().find(v => (v.lang || "").toLowerCase().startsWith("bn"));
    if (bnVoice) {
      utter.voice = bnVoice;
      utter.lang = bnVoice.lang;
    }
    window.speechSynthesis.speak(utter);
  }

  return { updated: { ...target, aiSpotlightBn: spotlightBn }, entries: nextList };
}