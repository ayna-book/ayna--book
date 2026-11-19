
/* =========================================================
   AYNA BOOK
   Global Language Translator
   ========================================================= */

const AynaTranslator = {
  apiUrl: "https://api.mymemory.translated.net/get",

  async translate(text, sourceLang, targetLang) {
    try {
      const input = String(text || "").trim();

      if (!input) {
        throw new Error("অনুবাদের জন্য লেখা দিন।");
      }

      if (input.length > 450) {
        throw new Error("একবারে সর্বোচ্চ ৪৫০ অক্ষর অনুবাদ করুন।");
      }

      if (!sourceLang || !targetLang) {
        throw new Error("উৎস ও লক্ষ্য ভাষা নির্বাচন করুন।");
      }

      if (sourceLang === targetLang) {
        return {
          success: true,
          translatedText: input
        };
      }

      const params = new URLSearchParams({
        q: input,
        langpair: `${sourceLang}|${targetLang}`
      });

      const response = await fetch(
        `${this.apiUrl}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("অনুবাদ সার্ভারে সমস্যা হয়েছে।");
      }

      const data = await response.json();

      if (
        data.responseStatus !== 200 ||
        !data.responseData?.translatedText
      ) {
        throw new Error(
          data.responseDetails || "অনুবাদ পাওয়া যায়নি।"
        );
      }

      return {
        success: true,
        translatedText:
          data.responseData.translatedText
      };

    } catch (error) {
      console.error(
        "AYNA BOOK Translation Error:",
        error
      );

      return {
        success: false,
        message:
          error.message || "অনুবাদ করা যায়নি।"
      };
    }
  }
};

// Global access
window.AYNA_TRANSLATOR = AynaTranslator;

console.log(
  "AYNA BOOK Translator Loaded Successfully."
);
