import { getAuth } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

async function authorizedPost(path, payload, apiBaseUrl = "") {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("অনুগ্রহ করে আগে লগইন করুন।");

  const idToken = await user.getIdToken(false);
  const base = String(apiBaseUrl || "").trim().replace(/\/+$/, "");
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

// পোস্ট ক্যাপশন/অনুবাদ, চ্যাট @ayna, মার্কেটপ্লেস, ওয়ার্ল্ড লিডার্স ও ওয়েদার AI
export async function askAynaModuleAI({
  module = "general",
  action = "assist",
  text,
  context = "",
  apiBaseUrl = ""
}) {
  const data = await authorizedPost(
    "/api/ai/assist",
    { module, action, text, context },
    apiBaseUrl
  );
  return data.reply;
}

// অ্যাডমিন মডারেশন কিউতে রিপোর্টের AI ঝুঁকি বিশ্লেষণ
export async function runReportAiTriage({
  postId,
  reportId,
  apiBaseUrl = ""
}) {
  const data = await authorizedPost(
    "/api/admin/reports/ai-triage",
    { postId, reportId },
    apiBaseUrl
  );
  return data.triage;
}