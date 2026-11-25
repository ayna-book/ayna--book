package com.aynabook.app.utility

import android.content.Context
import android.speech.tts.TextToSpeech
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AynaAiSpeakingClock(
    context: Context,
    private val onStatus: (String) -> Unit = {}
) {
    private var isTtsReady = false
    private var pendingSpeech: String? = null

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val bnLocale = Locale("bn", "BD")
            val res = this.tts.setLanguage(bnLocale)
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                this.tts.language = Locale.getDefault()
                onStatus("বাংলা ভয়েস প্যাক নেই, ডিফল্ট ভয়েসে ফলব্যাক সক্রিয়।")
            } else {
                onStatus("AI কথা বলার ঘড়ি প্রস্তুত।")
            }
            isTtsReady = true
            pendingSpeech?.let {
                pendingSpeech = null
                speakText(it)
            }
        } else {
            onStatus("TTS চালু করা যায়নি (কোড: $status)। মিডিয়া ভলিউম ও ভয়েস ইঞ্জিন চেক করুন।")
        }
    }

    fun formatCurrentTimeBn(): String {
        val timePart = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        return "এখন সময় $timePart"
    }

    fun speakLocalTimeNow(customPrefix: String = "এখন সময়") {
        val timePart = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        speakText("$customPrefix $timePart")
    }

    suspend fun speakWithAiBriefing(
        locationLabel: String = "Balukhali Bazar, Chittagong Division",
        weatherOrContext: String = "",
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance()
    ) {
        val baseTimeLine = formatCurrentTimeBn()
        // আগে সাথে সাথে বর্তমান সময় বলে দিন যাতে ইউজারের অপেক্ষা না লাগে
        speakText(baseTimeLine)

        try {
            val dateText = SimpleDateFormat("EEEE, dd MMMM yyyy, hh:mm a", Locale.getDefault()).format(Date())
            val aiNote = askAynaModuleAI(
                module = "weather",
                action = "speaking_clock_briefing",
                text = "Current time: $dateText. Location: $locationLabel. Extra: ${weatherOrContext.ifBlank { "General hourly check" }}",
                context = "Keep response to 1 short natural Bengali sentence for a speaking clock without markdown or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim()

            if (aiNote.isNotBlank()) {
                val cleanNote = aiNote.replace("*", "").replace("#", "").take(180)
                speakText("$baseTimeLine। $cleanNote", flushQueue = true)
            }
        } catch (_: Exception) {
            // AI ব্যর্থ হলেও স্থানীয় সময় ইতিমধ্যে বলা হয়ে গেছে
            onStatus("স্থানীয় ঘড়িতে সময় বলা হয়েছে (AI অফলাইন/অনুপলব্ধ)।")
        }
    }

    fun speakText(text: String, flushQueue: Boolean = true) {
        val clean = text.trim()
        if (clean.isEmpty()) return
        if (!isTtsReady) {
            pendingSpeech = clean
            onStatus("ভয়েস ইঞ্জিন চালু হচ্ছে...")
            return
        }
        val mode = if (flushQueue) TextToSpeech.QUEUE_FLUSH else TextToSpeech.QUEUE_ADD
        val utteranceId = "ayna_clock_${System.currentTimeMillis()}"
        tts.speak(clean, mode, null, utteranceId)
        onStatus("বলছে: $clean")
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}