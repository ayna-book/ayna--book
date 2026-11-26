// AYNA BOOK — Data Backup, Export & Restore Engine (backup-restore-hub.js)
class AynaBackupEngine {
  constructor(prefixList = ["ayna_profile_data", "ayna_gps_checkpoint", "ayna_fast_"]) {
    this.prefixList = prefixList;
  }

  // সংশ্লিষ্ট সব localStorage ডেটা সংগ্রহ করা
  collectData() {
    const bundle = {
      app: "AYNA BOOK",
      exportedAt: new Date().toISOString(),
      items: {}
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const matched = this.prefixList.some(p => key === p || key.startsWith(p));
        if (matched) {
          bundle.items[key] = localStorage.getItem(key);
        }
      }
    } catch (_) {}

    return bundle;
  }

  // ডেটা JSON ফাইল হিসেবে ডাউনলোড করা
  downloadBackup(filename = "ayna-book-backup.json") {
    const data = this.collectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return Object.keys(data.items).length;
  }

  // JSON ব্যাকআপ ফাইল থেকে ডেটা রিস্টোর করা
  async restoreFromFile(file) {
    if (!file) return { ok: false, message: "ফাইল নির্বাচন করা হয়নি।" };
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed.items !== "object") {
        return { ok: false, message: "সঠিক AYNA BOOK ব্যাকআপ ফাইল নয়।" };
      }

      let count = 0;
      Object.entries(parsed.items).forEach(([k, v]) => {
        if (typeof v === "string") {
          localStorage.setItem(k, v);
          count++;
        }
      });

      return { ok: true, count, message: `${count}টি ডেটা আইটেম সফলভাবে রিস্টোর হয়েছে।` };
    } catch (_) {
      return { ok: false, message: "ব্যাকআপ ফাইল পড়া বা রিস্টোর করা যায়নি।" };
    }
  }
}

window.aynaBackup = new AynaBackupEngine();