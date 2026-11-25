import { askAynaModuleAI } from "./ayna-ai-client.js";

const TRADE_COLD_KEY = "ayna_trade_cold_v1";

export const GLOBAL_COMMODITY_PRICE_LIST = [
  { code: "RICE_BASMATI", nameBn: "চাল (আমদানি/রপ্তানি গ্রেড)", hsCode: "1006.30", flow: "Import / Export", unit: "MT", refUsd: 540, contact: "trade-desk@aynabook.trade" },
  { code: "RMG_APPAREL", nameBn: "তৈরি পোশাক (RMG)", hsCode: "6109.10", flow: "Export", unit: "Doz", refUsd: 42.5, contact: "export-rmg@aynabook.trade" },
  { code: "CRUDE_OIL_BRENT", nameBn: "অপরিশোধিত তেল (Reference)", hsCode: "2709.00", flow: "Import", unit: "BBL", refUsd: 76, contact: "energy-import@aynabook.trade" },
  { code: "EV_LFP_CELL", nameBn: "ইভি ব্যাটারি সেল", hsCode: "8507.60", flow: "Import", unit: "kWh eq", refUsd: 98, contact: "ev-supply@aynabook.trade" },
  { code: "RAW_COTTON", nameBn: "কাঁচা তুলা", hsCode: "5201.00", flow: "Import", unit: "MT", refUsd: 1780, contact: "textile-raw@aynabook.trade" }
];

export function saveTradeCold(payload) {
  try {
    localStorage.setItem(TRADE_COLD_KEY, JSON.stringify({ savedAt: Date.now(), ...payload }));
  } catch (_) {}
}

export function loadTradeCold() {
  try {
    return JSON.parse(localStorage.getItem(TRADE_COLD_KEY) || "null");
  } catch (_) {
    return null;
  }
}

export async function generateTradePriceAndContactAi({
  commodityCode = "RMG_APPAREL",
  quantity = 10,
  counterparty = "আন্তর্জাতিক বাণিজ্য পার্টনার",
  apiBaseUrl = ""
} = {}) {
  const item =
    GLOBAL_COMMODITY_PRICE_LIST.find(c => c.code === commodityCode) || GLOBAL_COMMODITY_PRICE_LIST[0];
  const qty = Number(quantity) > 0 ? Number(quantity) : 1;
  const subtotalUsd = (item.refUsd * qty).toFixed(2);

  const fallbackPrice =
    `${item.nameBn} (HS ${item.hsCode}, ${item.flow}): রেফারেন্স দর $${item.refUsd}/${item.unit}, ${qty} ${item.unit}-এর আনুমানিক মূল্য $${subtotalUsd} USD।`;
  const fallbackContact =
    `প্রিয় ${counterparty}, আমরা ${item.nameBn} (HS ${item.hsCode}, পরিমাণ: ${qty} ${item.unit}) বিষয়ে মূল্য, শিপিং ও যোগাযোগের বিস্তারিত জানতে চাই। ইমেইল: ${item.contact}`;

  let priceAnalysisBn = fallbackPrice;
  let contactDraftBn = fallbackContact;

  try {
    const reply = await askAynaModuleAI({
      module: "trade",
      action: "global_import_export_price_and_outreach",
      text: `Item: ${item.nameBn} (HS ${item.hsCode}), Flow: ${item.flow}, Ref Price: $${item.refUsd}/${item.unit}, Qty: ${qty}, Subtotal: $${subtotalUsd} USD, Counterparty: ${counterparty}, Contact: ${item.contact}.`,
      context: "Reply in Bengali with two sections separated by ---CONTACT---: first price & market note, second business contact draft. No markdown asterisks.",
      apiBaseUrl
    });
    const clean = String(reply || "").replace(/[*#]/g, "").trim();
    if (clean.includes("---CONTACT---")) {
      const [p1, p2] = clean.split("---CONTACT---");
      if (p1?.trim()) priceAnalysisBn = p1.trim();
      if (p2?.trim()) contactDraftBn = p2.trim();
    } else if (clean) {
      priceAnalysisBn = clean.slice(0, 360);
    }
  } catch (_) {
    // অফলাইন ফলব্যাক ব্যবহৃত হয়েছে
  }

  const result = {
    commodity: item,
    quantity: qty,
    subtotalUsd: Number(subtotalUsd),
    priceAnalysisBn,
    contactDraftBn
  };
  saveTradeCold({ lastResult: result });
  return result;
}