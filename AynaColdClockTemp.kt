package com.aynabook.app.utility

import android.content.Context
import android.speech.tts.TextToSpeech
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class ColdClockTempResult(
    val timeTextBn: String,
    val tempSummaryBn: String,
    val spokenTextBn: String,
    val temperatureC: Double,
    val apparentTempC: Double,
    val humidityPercent: Int
)

class AynaColdClockTempController(
    context: Context,
    private val onStatus: (String) -> Unit = {}
) {
    private var ttsReady = false
    private var queuedSpokenText: String? = null

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val langCode = this.tts.setLanguage(Locale("bn", "BD"))
            if (langCode == TextToSpeech.LANG_MISSING_DATA || langCode == TextToSpeech.LANG_NOT_SUPPORTED) {
                this.tts.language = Locale.getDefault()
                onStatus("বাংলা ভয়েস প্যাক নেই, ডিফল্ট ভয়েস সক্রিয়।")
            } else {
                onStatus("কোল্ড ক্লক ও ভয়েস প্রস্তুত।")
            }
            ttsReady = true
            queuedSpokenText?.let { pending ->
                queuedSpokenText = null
                dispatchSpeak(pending)
            }
        } else {
            onStatus("TTS চালু করা যায়নি (কোড: $status)")
        }
    }

    fun currentTimeBn(): String {
        val now = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        return "এখন সময় $now"
    }

    fun speak(text: String) {
        val clean = text.trim()
        if (clean.isEmpty()) return
        if (!ttsReady) {
            queuedSpokenText = clean
            onStatus("ভয়েস ইঞ্জিন চালু হচ্ছে (কোল্ড স্টার্ট)...")
            return
        }
        dispatchSpeak(clean)
    }

    private fun dispatchSpeak(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_cold_${System.currentTimeMillis()}")
        onStatus("বলছে: $text")
    }

    suspend fun fetchAndSpeakColdClockWithTemp(
        latitude: Double = 21.2246,
        longitude: Double = 92.2636,
        locationName: String = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance()
    ): ColdClockTempResult {
        val timeLine = currentTimeBn()
        // কোল্ড স্টার্টে আগে সাথে সাথে সময় বলে দিন
        speak(timeLine)

        val snapshot = withContext(Dispatchers.IO) {
            val url =
                "https://api.open-meteo.com/v1/forecast?latitude=$latitude&longitude=$longitude" +
                    "&current=temperature_2m,apparent_temperature,relative_humidity_2m&timezone=auto"
            val conn = (URL(url).openConnection() as HttpURLConnection).apply {
                requestMethod = "GET"
                connectTimeout = 15_000
                readTimeout = 15_000
            }
            try {
                val raw = conn.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
                val cur = JSONObject(raw).optJSONObject("current") ?: JSONObject()
                Triple(
                    cur.optDouble("temperature_2m", 27.0),
                    cur.optDouble("apparent_temperature", 28.0),
                    cur.optInt("relative_humidity_2m", 72)
                )
            } catch (_: Exception) {
                Triple(27.0, 28.0, 72)
            } finally {
                conn.disconnect()
            }
        }

        val (tempC, feelsC, humidity) = snapshot
        val fallbackSummary =
            "$locationName-এ তাপমাত্রা $tempC ডিগ্রি সেলসিয়াস, অনুভূত $feelsC ডিগ্রি, আর্দ্রতা $humidity শতাংশ।"

        val aiSummary = try {
            val reply = askAynaModuleAI(
                module = "weather",
                action = "cold_clock_temperature",
                text = "Time: $timeLine. Location: $locationName. Temp: ${tempC}C. Feels like: ${feelsC}C. Humidity: $humidity%.",
                context = "Give a concise, helpful 1-2 sentence Bengali speaking-clock weather insight without markdown or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            reply.ifBlank { fallbackSummary }.take(200)
        } catch (_: Exception) {
            fallbackSummary
        }

        val fullSpoken = "$timeLine। $aiSummary"
        speak(fullSpoken)

        return ColdClockTempResult(
            timeTextBn = timeLine,
            tempSummaryBn = aiSummary,
            spokenTextBn = fullSpoken,
            temperatureC = tempC,
            apparentTempC = feelsC,
            humidityPercent = humidity
        )
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}