// AYNA BOOK — Deployment & Environment Readiness Check (deploy-check.js)
const fs = require("fs");
const path = require("path");

// চাইলে .env ফাইল থেকে ভেরিয়েবল লোড করা (package.json-এ dotenv থাকলে বা না থাকলেও নিরাপদ)
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  }
}

const coreFiles = [
  "ayna-book-complete-hub.html",
  "manifest.json",
  "sw.js",
  "uhd-sounds-engine.js",
  "gps-ai-module.js",
  "google-connect-hub.js",
  "speed-booster-engine.js",
  "backup-engine.js",
  "server.js"
];

const optionalFiles = [
  "radar.html",
  "profile.html",
  "app-icon-generator.js",
  "qr-scanner-engine.js",
  "net-status-monitor.js",
  "storage-vault.js",
  "diagnostics-health-hub.js",
  "device-orientation-compass.js",
  "realtime-sync-bus.js",
  "ai-command-orchestrator.js",
  "package.json",
  ".env.example",
  ".env"
];

console.log("==========================================");
console.log("   AYNA BOOK ★ Deployment Readiness Check");
console.log("==========================================");

let missingCore = 0;

console.log("\n[Core Files]");
for (const file of coreFiles) {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (!exists) missingCore++;
  console.log(`${exists ? "✅" : "❌"} ${file}`);
}

console.log("\n[Optional & Extended Modules]");
for (const file of optionalFiles) {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? "✅" : "➖"} ${file}`);
}

console.log("\n[Environment Variables]");
const port = process.env.PORT || "3000";
const nodeEnv = process.env.NODE_ENV || "development";
const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
const hasRealGeminiKey =
  Boolean(geminiKey) &&
  !geminiKey.includes("your_gemini_api_key_here") &&
  geminiKey.length > 10;

console.log(`ℹ️ PORT: ${port}`);
console.log(`ℹ️ NODE_ENV: ${nodeEnv}`);
console.log(
  `${hasRealGeminiKey ? "✅" : "⚠️"} GEMINI_API_KEY: ${
    hasRealGeminiKey ? "Configured" : "Not configured (using local fallback)"
  }`
);

console.log("\n------------------------------------------");
if (missingCore === 0) {
  console.log("🚀 সব কোর ফাইল প্রস্তুত! এখন 'node server.js' দিয়ে সার্ভার চালু করতে পারেন।");
} else {
  console.log(`⚠️ ${missingCore}টি কোর ফাইল পাওয়া যায়নি। সার্ভার চালানোর আগে ফাইলগুলো যুক্ত করুন।`);
}
console.log("==========================================");