// AYNA BOOK — Backup & Restore Engine (backup-engine.js)
class AynaBackupEngine {
  constructor() {
    this.storageKeys = [
      "ayna_profile_data",
      "ayna_gps_checkpoint",
      "ayna_last_gps_fix",
      "ayna_showcase_list",
      "ayna_posts_list"
    ];
  }

  collectBackupData() {
    const payload = {
      app: "AYNA BOOK ★",
      exportedAt: new Date().toISOString(),
      data: {}
    };

    try {
      this.storageKeys.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          payload.data[key] = val;
        }
      });

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("ayna_") && !(k in payload.data)) {
          payload.data[k] = localStorage.getItem(k);
        }
      }
    } catch (_) {}

    return payload;
  }

  downloadBackup(filename = "ayna-book-backup.json") {
    const bundle = this.collectBackupData();
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 1200);
    return Object.keys(bundle.data).length;
  }

  async restoreBackup(file) {
    if (!file) return { ok: false, message: "ব্যাকআপ ফাইল নির্বাচন করুন।" };
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed.data !== "object") {
        return { ok: false, message: "সঠিক AYNA BOOK ব্যাকআপ ফাইল নয়।" };
      }

      let restoredCount = 0;
      Object.entries(parsed.data).forEach(([key, val]) => {
        if (typeof val === "string") {
          localStorage.setItem(key, val);
          restoredCount++;
        }
      });

      return { ok: true, count: restoredCount, message: `${restoredCount}টি ডেটা রিস্টোর হয়েছে।` };
    } catch (_) {
      return { ok: false, message: "ব্যাকআপ ফাইল রিস্টোর করা যায়নি।" };
    }
  }
}

window.aynaBackup = new AynaBackupEngine();