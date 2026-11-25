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

data class AynaLaureateEntry(
    val id: String,
    val name: String,
    val year: Int,
    val prizeOrHonor: String,
    val achievementSummaryBn: String,
    val aiSpotlightBn: String = ""
)

data class AynaNobelLaureatesState(
    val isAutoUpdating: Boolean = false,
    val intervalMinutes: Int = 120,
    val statusMessage: String = "নোবেলজয়ী ও বিশ্ব মনীষী AI প্রস্তুত",
    val selectedId: String = "",
    val entries: List<AynaLaureateEntry> = emptyList()
)

class AynaNobelLaureatesAiEngine(
    context: Context,
    private val onStateChange: (AynaNobelLaureatesState) -> Unit = {}
) {
    private val coldFile = File(context.filesDir, "ayna_laureates_cold.json")
    private var ttsReady = false
    private var queuedSpeech: String? = null
    private var currentState = AynaNobelLaureatesState()

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val langRes = this.tts.setLanguage(Locale("bn", "BD"))
            if (langRes == TextToSpeech.LANG_MISSING_DATA || langRes == TextToSpeech.LANG_NOT_SUPPORTED) {
                this.tts.language = Locale.getDefault()
            }
            ttsReady = true
            queuedSpeech?.let { pending ->
                queuedSpeech = null
                speakNow(pending)
            }
        }
    }

    init {
        val initial = loadColdEntries()
        currentState = currentState.copy(
            entries = initial,
            selectedId = initial.firstOrNull()?.id.orEmpty(),
            statusMessage = "লোড হয়েছে: ${initial.size}টি মনীষী ও নোবেল তথ্য"
        )
        onStateChange(currentState)
    }

    fun defaultEntries(): List<AynaLaureateEntry> = listOf(
        AynaLaureateEntry(
            id = "nobel_2026_phys",
            name = "Francis Halzen",
            year = 2026,
            prizeOrHonor = "পদার্থবিজ্ঞানে নোবেল পুরস্কার ২০২৬",
            achievementSummaryBn = "IceCube Neutrino Observatory ও উচ্চ-শক্তির অ্যাস্ট্রোফিজিক্যাল নিউট্রিনো আবিষ্কারে গুরুত্বপূর্ণ অবদান।"
        ),
        AynaLaureateEntry(
            id = "nobel_2026_chem",
            name = "Henri B. Kagan ও Kenso Soai",
            year = 2026,
            prizeOrHonor = "রসায়নে নোবেল পুরস্কার ২০২৬",
            achievementSummaryBn = "অসমমিত জৈব সংশ্লেষণে নন-লিনিয়ার প্রভাব ও অটোক্যাটালাইসিস আবিষ্কার।"
        ),
        AynaLaureateEntry(
            id = "nobel_2026_med",
            name = "Karl Deisseroth, Peter Hegemann ও Georg Nagel",
            year = 2026,
            prizeOrHonor = "চিকিৎসাবিজ্ঞানে নোবেল পুরস্কার ২০২৬",
            achievementSummaryBn = "লাইট-গেটেড আয়ন চ্যানেল ও অপটোজেনেটিক্স সংক্রান্ত আবিষ্কার।"
        ),
        AynaLaureateEntry(
            id = "nobel_2026_lit",
            name = "Anne Carson",
            year = 2026,
            prizeOrHonor = "সাহিত্যে নোবেল পুরস্কার ২০২৬",
            achievementSummaryBn = "ধ্রুপদী ঐতিহ্যের সাথে সংলাপে সমকালীন সাহিত্যে নতুন রূপ সৃষ্টিকারী সৃজনশীল কর্ম।"
        ),
        AynaLaureateEntry(
            id = "nobel_2026_peace",
            name = "Navanethem “Navi” Pillay",
            year = 2026,
            prizeOrHonor = "শান্তিতে নোবেল পুরস্কার ২০২৬",
            achievementSummaryBn = "শান্তি ও আন্তর্জাতিক আইন প্রতিষ্ঠায় নিরবচ্ছিন্ন প্রচেষ্টা।"
        ),
        AynaLaureateEntry(
            id = "nobel_2026_econ",
            name = "Robert E. Hall ও Michael Woodford",
            year = 2026,
            prizeOrHonor = "অর্থনীতিতে নোবেল স্মৃতি পুরস্কার ২০২৬",
            achievementSummaryBn = "সামষ্টিক অর্থনৈতিক স্থিতিশীলতার ক্ষুদ্রঅর্থনৈতিক ভিত্তি নিয়ে গবেষণা।"
        ),
        AynaLaureateEntry(
            id = "classic_tagore",
            name = "রবীন্দ্রনাথ ঠাকুর (Rabindranath Tagore)",
            year = 1913,
            prizeOrHonor = "সাহিত্যে নোবেল পুরস্কার ১৯১৩",
            achievementSummaryBn = "গীতাঞ্জলির গভীর সংবেদনশীল ও কাব্যিক সৃষ্টিশীলতার জন্য।"
        ),
        AynaLaureateEntry(
            id = "classic_curie",
            name = "Marie Skłodowska Curie",
            year = 1903,
            prizeOrHonor = "পদার্থবিজ্ঞান (১৯০৩) ও রসায়নে (১৯১১) নোবেল পুরস্কার",
            achievementSummaryBn = "তেজস্ক্রিয়তা নিয়ে গবেষণা, পোলোনিয়াম ও রেডিয়াম আবিষ্কার।"
        )
    )

    fun updateState(transform: (AynaNobelLaureatesState) -> AynaNobelLaureatesState) {
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
        speakNow(clean)
    }

    private fun speakNow(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_nobel_${System.currentTimeMillis()}")
    }

    fun saveColdEntries(items: List<AynaLaureateEntry>) {
        val arr = JSONArray()
        items.take(40).forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("name", item.name)
                    put("year", item.year)
                    put("prizeOrHonor", item.prizeOrHonor)
                    put("achievementSummaryBn", item.achievementSummaryBn)
                    put("aiSpotlightBn", item.aiSpotlightBn)
                }
            )
        }
        val root = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("entries", arr)
        }
        coldFile.writeText(root.toString(2), Charsets.UTF_8)
    }

    fun loadColdEntries(): List<AynaLaureateEntry> {
        val defaults = defaultEntries()
        if (!coldFile.exists()) return defaults
        return try {
            val root = JSONObject(coldFile.readText(Charsets.UTF_8))
            val arr = root.optJSONArray("entries") ?: return defaults
            val list = mutableListOf<AynaLaureateEntry>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                list.add(
                    AynaLaureateEntry(
                        id = obj.optString("id", "entry_$i"),
                        name = obj.optString("name", "মনীষী"),
                        year = obj.optInt("year", 2026),
                        prizeOrHonor = obj.optString("prizeOrHonor", "নোবেল পুরস্কার"),
                        achievementSummaryBn = obj.optString("achievementSummaryBn", ""),
                        aiSpotlightBn = obj.optString("aiSpotlightBn", "")
                    )
                )
            }
            if (list.isNotEmpty()) list else defaults
        } catch (_: Exception) {
            defaults
        }
    }

    suspend fun refreshLaureateWithAi(
        targetEntry: AynaLaureateEntry,
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        speakSummary: Boolean = true
    ): AynaLaureateEntry = withContext(Dispatchers.IO) {
        val nowStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        val fallbackSpotlight =
            "${targetEntry.name} (${targetEntry.year}) — ${targetEntry.prizeOrHonor}: ${targetEntry.achievementSummaryBn}"

        val aiText = try {
            val reply = askAynaModuleAI(
                module = "nobel_laureates",
                action = "laureate_award_auto_update",
                text = "Name: ${targetEntry.name}. Year: ${targetEntry.year}. Award: ${targetEntry.prizeOrHonor}. Contribution: ${targetEntry.achievementSummaryBn}.",
                context = "Provide a concise 2-sentence Bengali summary of this laureate or notable figure and why their award/contribution matters, without markdown asterisks or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            reply.ifBlank { fallbackSpotlight }.take(280)
        } catch (_: Exception) {
            fallbackSpotlight
        }

        val updatedItem = targetEntry.copy(aiSpotlightBn = aiText)
        val nextEntries = currentState.entries.map {
            if (it.id == updatedItem.id) updatedItem else it
        }
        saveColdEntries(nextEntries)

        withContext(Dispatchers.Main) {
            updateState { prev ->
                prev.copy(
                    entries = nextEntries,
                    selectedId = updatedItem.id,
                    statusMessage = "AI আপডেট সম্পন্ন ($nowStr): ${updatedItem.name}"
                )
            }
            if (speakSummary) {
                speak("${updatedItem.name}। ${updatedItem.prizeOrHonor}। $aiText")
            }
        }

        updatedItem
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}