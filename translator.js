// =========================================================
// AYNA BOOK
// Translation System
// MyMemory Translation API
// =========================================================

"use strict";


// ---------------------------------------------------------
// Translator Engine
// ---------------------------------------------------------

const AynaTranslator = {

  apiUrl:
    "https://api.mymemory.translated.net/get",


  // -------------------------------------------------------
  // Translate
  // -------------------------------------------------------

  async translate(
    text,
    sourceLang,
    targetLang
  ) {

    try {

      const input =
        String(
          text ?? ""
        ).trim();


      if (!input) {

        throw new Error(
          "অনুবাদের জন্য লেখা দিন।"
        );

      }


      // নিরাপত্তা ও API request সীমা
      if (
        input.length > 450
      ) {

        throw new Error(
          "একবারে সর্বোচ্চ ৪৫০ অক্ষর অনুবাদ করুন।"
        );

      }


      const source =
        String(
          sourceLang ?? ""
        ).trim();


      const target =
        String(
          targetLang ?? ""
        ).trim();


      if (
        !source ||
        !target
      ) {

        throw new Error(
          "উৎস ও লক্ষ্য ভাষা নির্বাচন করুন।"
        );

      }


      // একই ভাষা হলে API call প্রয়োজন নেই
      if (
        source === target
      ) {

        return {

          success: true,

          translatedText:
            input

        };

      }


      // ---------------------------------------------------
      // API Request
      // ---------------------------------------------------

      const params =
        new URLSearchParams({
          q: input,
          langpair:
            `${source}|${target}`
        });


      const requestUrl =
        `${this.apiUrl}?${params.toString()}`;


      const response =
        await fetch(
          requestUrl,
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            },

            cache: "no-store"
          }
        );


      if (
        !response.ok
      ) {

        throw new Error(
          `অনুবাদ সার্ভারে সমস্যা হয়েছে। HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      if (
        Number(
          data?.responseStatus
        ) !== 200
      ) {

        throw new Error(
          data?.responseDetails ||
          "অনুবাদ পাওয়া যায়নি।"
        );

      }


      const translatedText =
        String(
          data?.responseData?.translatedText ||
          ""
        ).trim();


      if (!translatedText) {

        throw new Error(
          "অনুবাদের ফলাফল পাওয়া যায়নি।"
        );

      }


      return {

        success: true,

        translatedText

      };


    } catch (error) {

      console.error(
        "AYNA BOOK Translation Error:",
        error
      );


      return {

        success: false,

        translatedText: "",

        message:
          error?.message ||
          "অনুবাদ করা যায়নি।"

      };

    }

  }

};


// ---------------------------------------------------------
// Global AYNA BOOK Translator
// ---------------------------------------------------------

window.AYNA_TRANSLATOR =
  AynaTranslator;


// ---------------------------------------------------------
// Ready
// ---------------------------------------------------------

console.log(
  "AYNA BOOK Translator Loaded Successfully."
);