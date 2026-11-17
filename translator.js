// translator.js
export async function translateText(text, targetLang = 'en') {
    if (!text.trim()) return "";
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=bn|${targetLang}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.responseData.translatedText || text;
    } catch (error) {
        console.error("Translation error:", error);
        return text;
    }
}

// গ্লোবাল উইন্ডোতে যুক্ত করা যাতে যেকোনো HTML পেজ থেকে সহজে ব্যবহার করা যায়
window.aynaTranslate = translateText;