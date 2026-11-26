// AYNA BOOK — Pre-Deployment Readiness Check (deploy-check.js)
const fs = require("fs");
const path = require("path");

const requiredFiles = [
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

console.log("=== AYNA BOOK Deployment Readiness Check ===");

let missingCount = 0;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (!exists) missingCount++;
  console.log(`${exists ? "✅" : "❌"} ${file}`);
});

const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
console.log(`${hasApiKey ? "✅" : "⚠️"} GEMINI_API_KEY: ${hasApiKey ? "Configured" : "Not set (local fallback active)"}`);

if (missingCount === 0) {
  console.log("🚀 সব জরুরি ফাইল উপস্থিত আছে। লাইভ ডিপ্লয়মেন্টের জন্য প্রস্তুত!");
} else {
  console.log(`⚠️ ${missingCount}টি ফাইল অনুপস্থিত রয়েছে।`);
}