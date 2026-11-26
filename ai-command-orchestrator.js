// AYNA BOOK — Smart AI Command & Action Orchestrator (ai-command-orchestrator.js)
class AynaAiOrchestrator {
  constructor(endpoint = "/api/ai/assist") {
    this.endpoint = endpoint;
  }

  async execute(moduleName, promptText, options = {}) {
    const cleanPrompt = String(promptText || "").trim();
    const sound = window.aynaSound || window.uhdSoundsEngine;
    const bus = window.aynaBus;
    const vault = window.aynaVault;

    if (!cleanPrompt) {
      return { ok: false, text: "অনুগ্রহ করে একটি কমান্ড বা প্রশ্ন লিখুন।" };
    }

    let replyText = "";

    if (window.aynaGoogle && typeof window.aynaGoogle.askGoogleAi === "function") {
      replyText = await window.aynaGoogle.askGoogleAi(moduleName, cleanPrompt, "");
    }

    if (!replyText) {
      try {
        const res = await fetch(this.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ module: moduleName, prompt: cleanPrompt })
        });
        if (res.ok) {
          const data = await res.json();
          replyText = (data.reply || data.text || "").trim();
        }
      } catch (_) {}
    }

    if (!replyText) {
      replyText = `AYNA AI [${moduleName}]: "${cleanPrompt}" — সিস্টেম সক্রিয় আছে।`;
    }

    if (vault && typeof vault.saveItem === "function") {
      vault.saveItem("ai_history", {
        module: moduleName,
        prompt: cleanPrompt,
        reply: replyText
      });
    }

    if (bus && typeof bus.publish === "function") {
      bus.publish("ai:response", { module: moduleName, prompt: cleanPrompt, reply: replyText });
    }

    if (options.speak !== false && sound && typeof sound.speak === "function") {
      sound.speak(replyText);
    }

    return { ok: true, text: replyText };
  }
}

window.aynaAi = new AynaAiOrchestrator();