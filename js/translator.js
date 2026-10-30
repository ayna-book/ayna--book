"use strict";

const input = document.getElementById("translateInput");
const language = document.getElementById("targetLanguage");
const output = document.getElementById("translatedOutput");
const status = document.getElementById("aiTranslateStatus");
const translateButton = document.getElementById("aiTranslateButton");
const copyButton = document.getElementById("copyTranslationButton");

// নিরাপদ সার্ভারের ঠিকানা পরে এখানে যুক্ত করতে হবে।
const TRANSLATION_ENDPOINT = "/api/translate";

translateButton.addEventListener("click", async () => {
  const text = input.value.trim();

  if (!text) {
    status.textContent = "প্রথমে অনুবাদের জন্য বার্তা লিখুন।";
    return;
  }

  if (text.length > 2000) {
    status.textContent = "বার্তা সর্বোচ্চ ২০০০ অক্ষরের হতে পারবে।";
    return;
  }

  translateButton.disabled = true;
  output.value = "";
  status.textContent = "অনুবাদের অনুরোধ পাঠানো হচ্ছে...";

  try {
    const response = await fetch(TRANSLATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        targetLanguage: language.value
      })
    });

    if (!response.ok) {
      throw new Error("Translation service unavailable");
    }

    const data = await response.json();

    if (typeof data.translatedText !== "string") {
      throw new Error("Invalid translation response");
    }

    output.value = data.translatedText;
    status.textContent = "✅ অনুবাদ সম্পন্ন হয়েছে।";

  } catch (error) {
    console.error("Translation error:", error);

    status.textContent =
      "অনুবাদ সার্ভার এখনো সংযুক্ত হয়নি। সার্ভার সেটআপ সম্পন্ন হলে এটি কাজ করবে।";
  } finally {
    translateButton.disabled = false;
  }
});

copyButton.addEventListener("click", async () => {
  if (!output.value.trim()) {
    status.textContent = "কপি করার মতো অনুবাদ এখনো নেই।";
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    status.textContent = "✅ অনুবাদ কপি হয়েছে।";
  } catch {
    output.focus();
    output.select();
    status.textContent =
      "অনুবাদ নির্বাচন করা হয়েছে। এখন Copy চাপুন।";
  }
});