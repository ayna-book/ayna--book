package com.aynabook.app.utility

import android.content.Context
import android.speech.tts.TextToSpeech
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class Ayna150AlertItem(
    val id: String,
    val titleBn: String,
    val aiAdviceBn: String,
    val alertCount: Int,
    val triggerSeconds: Int,
    val timestampMs: Long,
    val fromColdBackup: Boolean = false
)

data class Ayna150AlertState(
    val countdownSeconds: Int = 150,
    val isRunning: Boolean = false,
    val totalAlertsTriggered: Int = 0,
    val statusMessage: String = "১৫০ এলার্ট ইঞ্জিন প্রস্তুত",
    val latestAlert: Ayna150AlertItem? = null,
    val history: List<Ayna150AlertItem> = emptyList()
)

class Ayna150AlertEngine(
    context: Context,
    private val onStateChange: (Ayna150AlertState) -> Unit = {}
) {
    private val coldFile = File(context.filesDir, "ayna_150_alerts_cold.json")
    private var ttsReady = false
    private var queuedSpeech: String? = null
    private var currentState = Ayna150AlertState()

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val res = this.tts.setLanguage(Locale("bn", "BD"))
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                this.tts.language = Locale.getDefault()
            }
            ttsReady = true
            queuedSpeech?.let { pending ->
                queuedSpeech = null
                speakInternal(pending)
            }
        }
    }

    init {
        val loaded = loadColdAlerts()
        if (loaded.isNotEmpty()) {
            currentState = currentState.copy(
                history = loaded,
                latestAlert = loaded.first(),
                totalAlertsTriggered = loaded.size,
                statusMessage = "কোল্ড ব্যাকআপ থেকে ${loaded.size}টি ১৫০-এলার্ট লোড হয়েছে"
            )
            onStateChange(currentState)
        }
    }

    fun updateState(transform: (Ayna150AlertState) -> Ayna150AlertState) {
        currentState = transform(currentState)
        onStateChange(currentState)
    }

    fun speak(text: String) {
        val clean = text.trim()
        if (clean.isEmpty()) return
        if (!ttsReady) {
            queuedSpeech = clean
            return
        }
        speakInternal(clean)
    }

    private fun speakInternal(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_150_${System.currentTimeMillis()}")
    }

    fun saveColdAlerts(items: List<Ayna150AlertItem>) {
        val arr = JSONArray()
        items.take(30).forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("titleBn", item.titleBn)
                    put("aiAdviceBn", item.aiAdviceBn)
                    put("alertCount", item.alertCount)
                    put("triggerSeconds", item.triggerSeconds)
                    put("timestampMs", item.timestampMs)
                }
            )
        }
        val wrapper = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("alerts", arr)
        }
        coldFile.writeText(wrapper.toString(2), Charsets.UTF_8)
    }

    fun loadColdAlerts(): List<Ayna150AlertItem> {
        if (!coldFile.exists()) return emptyList()
        return try {
            val root = JSONObject(coldFile.readText(Charsets.UTF_8))
            val arr = root.optJSONArray("alerts") ?: JSONArray()
            val out = mutableListOf<Ayna150AlertItem>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                out.add(
                    Ayna150AlertItem(
                        id = obj.optString("id", "alert_$i"),
                        titleBn = obj.optString("titleBn", "১৫০ এলার্ট"),
                        aiAdviceBn = obj.optString("aiAdviceBn", ""),
                        alertCount = obj.optInt("alertCount", 150),
                        triggerSeconds = obj.optInt("triggerSeconds", 150),
                        timestampMs = obj.optLong("timestampMs", 0L),
                        fromColdBackup = true
                    )
                )
            }
            out
        } catch (_: Exception) {
            emptyList()
        }
    }

    suspend fun triggerAi150Alert(
        eventReason: String = "১৫০ এলার্ট চেকপয়েন্ট",
        queueOrMetricCount: Int = 150,
        locationLabel: String = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        speakAlert: Boolean = true
    ): Ayna150AlertItem = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val timeFormatted = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date(now))
        val nextNumber = currentState.totalAlertsTriggered + 1
        val titleBn = "১৫০ এলার্ট #$nextNumber — $eventReason ($timeFormatted)"
        val fallbackAdvice =
            "$locationLabel-এ ১৫০ এলার্ট সক্রিয় হয়েছে। কাউন্ট: $queueOrMetricCount। জরুরি আইটেম ও নোটিফিকেশন যাচাই করুন।"

        val aiAdviceBn = try {
            val reply = askAynaModuleAI(
                module = "general",
                action = "ayna_150_alert",
                text = "Alert #150 trigger at $timeFormatted. Location: $locationLabel. Reason: $eventReason. Count metric: $queueOrMetricCount.",
                context = "Provide a concise 1-2 sentence Bengali alert action briefing without markdown or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            reply.ifBlank { fallbackAdvice }.take(220)
        } catch (_: Exception) {
            fallbackAdvice
        }

        val item = Ayna150AlertItem(
            id = "alert150_$now",
            titleBn = titleBn,
            aiAdviceBn = aiAdviceBn,
            alertCount = queueOrMetricCount,
            triggerSeconds = 150,
            timestampMs = now,
            fromColdBackup = false
        )

        val updatedHistory = listOf(item) + currentState.history
        saveColdAlerts(updatedHistory)

        withContext(Dispatchers.Main) {
            updateState { prev ->
                prev.copy(
                    countdownSeconds = 150,
                    totalAlertsTriggered = prev.totalAlertsTriggered + 1,
                    latestAlert = item,
                    history = updatedHistory,
                    statusMessage = "🚨 ১৫০ এলার্ট সক্রিয় হয়েছে ($timeFormatted)"
                )
            }
            if (speakAlert) {
                speak("সতর্কতা, ১৫০ এলার্ট। $aiAdviceBn")
            }
        }

        item
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}