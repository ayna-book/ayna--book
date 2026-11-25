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

data class AynaAutoEvDigest(
    val id: String,
    val titleBn: String,
    val summaryBn: String,
    val focusArea: String,
    val updatedAtMs: Long,
    val fromColdBackup: Boolean = false
)

data class AynaAutoEvState(
    val isAutoUpdating: Boolean = false,
    val intervalMinutes: Int = 60,
    val statusMessage: String = "বিশ্ব অটো ও ইভি AI প্রস্তুত",
    val latestDigest: AynaAutoEvDigest? = null,
    val digests: List<AynaAutoEvDigest> = emptyList()
)

class AynaAutoEvAiUpdater(
    context: Context,
    private val onStateChange: (AynaAutoEvState) -> Unit = {}
) {
    private val coldFile = File(context.filesDir, "ayna_auto_ev_cold.json")
    private var ttsReady = false
    private var queuedSpeech: String? = null
    private var currentState = AynaAutoEvState()

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val langRes = this.tts.setLanguage(Locale("bn", "BD"))
            if (langRes == TextToSpeech.LANG_MISSING_DATA || langRes == TextToSpeech.LANG_NOT_SUPPORTED) {
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
        val cached = loadColdDigests()
        if (cached.isNotEmpty()) {
            currentState = currentState.copy(
                digests = cached,
                latestDigest = cached.first(),
                statusMessage = "কোল্ড ব্যাকআপ থেকে ${cached.size}টি অটো/ইভি আপডেট লোড হয়েছে"
            )
            onStateChange(currentState)
        }
    }

    fun updateState(transform: (AynaAutoEvState) -> AynaAutoEvState) {
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
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_autoev_${System.currentTimeMillis()}")
    }

    fun saveColdDigests(items: List<AynaAutoEvDigest>) {
        val arr = JSONArray()
        items.take(25).forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("titleBn", item.titleBn)
                    put("summaryBn", item.summaryBn)
                    put("focusArea", item.focusArea)
                    put("updatedAtMs", item.updatedAtMs)
                }
            )
        }
        val wrapper = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("digests", arr)
        }
        coldFile.writeText(wrapper.toString(2), Charsets.UTF_8)
    }

    fun loadColdDigests(): List<AynaAutoEvDigest> {
        if (!coldFile.exists()) return emptyList()
        return try {
            val root = JSONObject(coldFile.readText(Charsets.UTF_8))
            val arr = root.optJSONArray("digests") ?: JSONArray()
            val list = mutableListOf<AynaAutoEvDigest>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                list.add(
                    AynaAutoEvDigest(
                        id = obj.optString("id", "ev_$i"),
                        titleBn = obj.optString("titleBn", "বিশ্ব অটো ও ইভি আপডেট"),
                        summaryBn = obj.optString("summaryBn", ""),
                        focusArea = obj.optString("focusArea", "EV & Smart Mobility"),
                        updatedAtMs = obj.optLong("updatedAtMs", 0L),
                        fromColdBackup = true
                    )
                )
            }
            list
        } catch (_: Exception) {
            emptyList()
        }
    }

    suspend fun fetchAndGenerateAutoEvUpdate(
        focusArea: String = "Global EV, Battery & Smart Mobility",
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        speakSummary: Boolean = false
    ): AynaAutoEvDigest = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val timeLabel = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date(now))
        val titleBn = "🚗⚡ বিশ্ব অটো ও ইভি আপডেট ($timeLabel)"

        val fallbackSummary =
            "বিশ্ব ইভি বাজারে এলএফপি (LFP) ব্যাটারি, ফাস্ট চার্জিং, হাইব্রিড/ইভি প্রতিযোগিতা এবং সফটওয়্যার-নির্ভর স্মার্ট গাড়ির চাহিদা বাড়ছে। চার্জিং নেটওয়ার্ক ও ব্যাটারি দক্ষতা এখন প্রধান অগ্রাধিকার।"

        val summaryBn = try {
            val aiReply = askAynaModuleAI(
                module = "auto_ev",
                action = "global_auto_ev_auto_update",
                text = "Focus area: $focusArea. Time: $timeLabel. Give a fresh global automobile and electric vehicle (EV) technology and market briefing in Bengali.",
                context = "Write 2-3 clear, concise sentences in Bengali covering global EV/auto trends, battery/charging or AI driving tech, without markdown or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            aiReply.ifBlank { fallbackSummary }.take(320)
        } catch (_: Exception) {
            fallbackSummary
        }

        val digest = AynaAutoEvDigest(
            id = "autoev_$now",
            titleBn = titleBn,
            summaryBn = summaryBn,
            focusArea = focusArea,
            updatedAtMs = now,
            fromColdBackup = false
        )

        val updatedList = listOf(digest) + currentState.digests
        saveColdDigests(updatedList)

        withContext(Dispatchers.Main) {
            updateState { prev ->
                prev.copy(
                    latestDigest = digest,
                    digests = updatedList,
                    statusMessage = "AI অটো-আপডেট সম্পন্ন ($timeLabel)"
                )
            }
            if (speakSummary) {
                speak("$titleBn। $summaryBn")
            }
        }

        digest
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}