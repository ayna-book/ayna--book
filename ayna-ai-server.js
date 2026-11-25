import express from "express";
import cors from "cors";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.database();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ইন-মেমরি রেট লিমিটার (প্রতি ইউজার মিনিটে সর্বোচ্চ ৩০ রিকোয়েস্ট)
const rateBuckets = new Map();
function checkRateLimit(uid, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateBuckets.get(uid) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateBuckets.set(uid, entry);
  return entry.count <= limit;
}

// আইডি টোকেন ভেরিফিকেশন মিডলওয়্যার
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) return res.status(401).json({ ok: false, error: "Missing Bearer token" });

    const decoded = await admin.auth().verifyIdToken(token);
    if (!checkRateLimit(decoded.uid)) {
      return res.status(429).json({ ok: false, error: "Too many requests. Try again shortly." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ ok: false, error: "Invalid or expired Firebase ID token" });
  }
}

// অ্যাডমিন ভেরিফিকেশন (Custom Claim বা RTDB admins/$uid)
async function requireAdmin(req, res, next) {
  if (req.user?.admin === true) return next();
  const snap = await db.ref(`admins/${req.user.uid}`).get();
  if (snap.val() === true) return next();
  return res.status(403).json({ ok: false, error: "Admin privileges required" });
}

// Gemini REST হেল্পার
async function callGemini({ systemPrompt, userPrompt, jsonMode = false }) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured on server.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: jsonMode ? 0.2 : 0.6,
      ...(jsonMode ? { responseMimeType: "application/json" } : {})
    }
  };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || `Gemini API error (${resp.status})`);
  }
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ১. ইউনিভার্সাল AI অ্যাসিস্ট্যান্ট (পোস্ট, চ্যাট, মার্কেটপ্লেস, ওয়ার্ল্ড লিডার্স, ওয়েদার)
app.post("/api/ai/assist", requireAuth, async (req, res) => {
  try {
    const { module = "general", action = "assist", text = "", context = "" } = req.body || {};
    const cleanText = String(text).trim().slice(0, 4000);
    const cleanContext = String(context).trim().slice(0, 2000);

    if (!cleanText) {
      return res.status(400).json({ ok: false, error: "text is required" });
    }

    const systemMap = {
      post: "You are AYNA BOOK Post AI. Help write engaging Bengali/English captions, summarize long posts, or translate clearly.",
      messenger: "You are @ayna inside AYNA MESSENGER. Give concise, helpful replies, chat summaries, or smart reply suggestions.",
      marketplace: "You are AYNA Global Marketplace AI. Generate clear product titles, category, description, and fair pricing tips.",
      leaders: "You are AYNA World Leaders & Civic Directory AI. Provide factual, neutral, concise summaries.",
      weather: "You are AYNA Utility & Weather AI. Give practical safety and travel advice based on weather/location context.",
      general: "You are AYNA BOOK AI Assistant. Respond concisely in the user's language (Bengali or English)."
    };

    const systemPrompt = systemMap[module] || systemMap.general;
    const userPrompt = `Action: ${action}\nContext: ${cleanContext || "None"}\nInput:\n${cleanText}`;
    const reply = await callGemini({ systemPrompt, userPrompt, jsonMode: false });

    res.json({ ok: true, module, action, reply });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ২. মডারেশন AI ট্রায়াজ (রিপোর্টের ঝুঁকি স্কোর ও প্রস্তাবিত সিদ্ধান্ত)
app.post("/api/admin/reports/ai-triage", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { postId, reportId } = req.body || {};
    if (!postId || !reportId) {
      return res.status(400).json({ ok: false, error: "postId and reportId are required" });
    }

    const [postSnap, reportSnap] = await Promise.all([
      db.ref(`posts/${postId}`).get(),
      db.ref(`postReports/${postId}/${reportId}`).get()
    ]);

    const postData = postSnap.val() || {};
    const reportData = reportSnap.val() || {};

    const systemPrompt =
      "You are AYNA BOOK Content Moderation AI. Return strictly JSON with keys: " +
      "riskScore (0-100 integer), suggestedDecision ('dismissed'|'warned'|'removed'), " +
      "category (string), summaryBn (1-2 sentence Bengali summary), moderatorNote (short English/Bengali note).";

    const userPrompt = JSON.stringify({
      postText: postData.text || postData.caption || "",
      reportReason: reportData.reason || ""
    });

    const rawJson = await callGemini({ systemPrompt, userPrompt, jsonMode: true });
    const triage = JSON.parse(rawJson);

    const payload = {
      riskScore: Number(triage.riskScore) || 0,
      suggestedDecision: ["dismissed", "warned", "removed"].includes(triage.suggestedDecision)
        ? triage.suggestedDecision
        : "warned",
      category: String(triage.category || "general"),
      summaryBn: String(triage.summaryBn || ""),
      moderatorNote: String(triage.moderatorNote || ""),
      analyzedAt: Date.now(),
      analyzedBy: req.user.uid
    };

    await db.ref(`postReports/${postId}/${reportId}/aiTriage`).set(payload);
    res.json({ ok: true, triage: payload });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ৩. মডারেশন রিভিউ + Audit Log + FCM নোটিফিকেশন
app.post("/api/admin/reports/review", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { postId, reportId, decision, note = "", notifyReporter = false } = req.body || {};
    if (!postId || !reportId || !["dismissed", "warned", "removed"].includes(decision)) {
      return res.status(400).json({ ok: false, error: "Invalid postId, reportId, or decision" });
    }

    const reviewedAt = Date.now();
    const cleanNote = String(note).trim().slice(0, 500);

    await db.ref(`postReports/${postId}/${reportId}`).update({
      status: "reviewed",
      decision,
      note: cleanNote,
      reviewedBy: req.user.uid,
      reviewedAt
    });

    if (decision === "removed") {
      await db.ref(`posts/${postId}`).update({
        moderationStatus: "removed",
        removedAt: reviewedAt
      });
    }

    // অপরিবর্তনীয় অডিট লগ সংরক্ষণ
    await db.ref("moderationAuditLogs").push({
      adminUid: req.user.uid,
      postId,
      reportId,
      decision,
      note: cleanNote,
      notifyReporter: Boolean(notifyReporter),
      reviewedAt
    });

    res.json({
      ok: true,
      postId,
      reportId,
      decision,
      reviewedAt,
      notifications: { author: { sentCount: 0 }, reporter: { sentCount: 0 } }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AYNA BOOK AI & Moderation API running on port ${PORT}`);
});