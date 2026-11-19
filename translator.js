/* =========================================================
   AYNA BOOK
   Global Language Translator
   MyMemory Translation API
   ========================================================= */

"use strict";


const AynaTranslator = {

  // MyMemory Translation API
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

      // -----------------------------------------------
      // Input পরিষ্কার করা
      // -----------------------------------------------

      const input =
        String(
          text ?? ""
        ).trim();


      if (!input) {

        throw new Error(
          "অনুবাদের জন্য লেখা দিন।"
        );

      }


      // -----------------------------------------------
      // Maximum text length
      // -----------------------------------------------

      if (
        input.length > 450
      ) {

        throw new Error(
          "একবারে সর্বোচ্চ ৪৫০ অক্ষর অনুবাদ করুন।"
        );

      }


      // -----------------------------------------------
      // Language validation
      // -----------------------------------------------

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


      // -----------------------------------------------
      // Same language
      // -----------------------------------------------

      if (
        source === target
      ) {

        return {

          success: true,

          translatedText:
            input

        };

      }


      // -----------------------------------------------
      // API Parameters
      // -----------------------------------------------

      const params =
        new URLSearchParams({

          q:
            input,

          langpair:
            `${source}|${target}`

        });


      const requestUrl =
        `${this.apiUrl}?${params.toString()}`;


      // -----------------------------------------------
      // API Request
      // -----------------------------------------------

      const response =
        await fetch(
          requestUrl,
          {
            method: "GET",

            headers: {
              "Accept":
                "application/json"
            },

            cache:
              "no-store"
          }
        );


      // -----------------------------------------------
      // HTTP Error
      // -----------------------------------------------

      if (
        !response.ok
      ) {

        throw new Error(
          `অনুবাদ সার্ভারে সমস্যা হয়েছে। HTTP ${response.status}`
        );

      }


      // -----------------------------------------------
      // JSON Response
      // -----------------------------------------------

      const data =
        await response.json();


      // -----------------------------------------------
      // API Response Validation
      // -----------------------------------------------

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
          data?.responseData
            ?.translatedText ||
          ""
        ).trim();


      if (!translatedText) {

        throw new Error(
          "অনুবাদের ফলাফল পাওয়া যায়নি।"
        );

      }


      // -----------------------------------------------
      // Success
      // -----------------------------------------------

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


// =========================================================
// Global Access
// =========================================================

window.AYNA_TRANSLATOR =
  AynaTranslator;


// =========================================================
// Ready
// =========================================================

console.log(
  "AYNA BOOK Translator Loaded Successfully."
);