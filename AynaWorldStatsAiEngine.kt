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
import java.util.Locale
import kotlin.math.roundToLong

data class AynaCountryStatsItem(
    val isoCode: String,
    val nameBn: String,
    val nameEn: String,
    val areaSqKm: Long,
    val population: Long,
    val gdpGrowthPercent: Double,
    val regionBn: String
)

data class AynaWorldStatsAiResult(
    val isoCode: String,
    val countryNameBn: String,
    val densityPerSqKm: Long,
    val aiAnalysisBn: String,
    val fromColdBackup: Boolean = false
)

class AynaWorldStatsAiEngine(
    context: Context,
    private val onSpeakRequest: ((String) -> Unit)? = null
) {
    private val coldFile = File(context.filesDir, "ayna_world_stats_cold.json")
    private var ttsReady = false
    private var queuedSpeech: String? = null

    private val tts: TextToSpeech = TextToSpeech(context.applicationContext) { status ->
        if (status == TextToSpeech.SUCCESS) {
            val res = this.tts.setLanguage(Locale("bn", "BD"))
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                this.tts.language = Locale.getDefault()
            }
            ttsReady = true
            queuedSpeech?.let { pending ->
                queuedSpeech = null
                speakNow(pending)
            }
        }
    }

    fun defaultCountries(): List<AynaCountryStatsItem> = listOf(
        AynaCountryStatsItem(
            isoCode = "BGD",
            nameBn = "বাংলাদেশ",
            nameEn = "Bangladesh",
            areaSqKm = 147_570L,
            population = 173_500_000L,
            gdpGrowthPercent = 5.8,
            regionBn = "দক্ষিণ এশিয়া"
        ),
        AynaCountryStatsItem(
            isoCode = "IND",
            nameBn = "ভারত",
            nameEn = "India",
            areaSqKm = 3_287_263L,
            population = 1_450_000_000L,
            gdpGrowthPercent = 6.5,
            regionBn = "দক্ষিণ এশিয়া"
        ),
        AynaCountryStatsItem(
            isoCode = "USA",
            nameBn = "যুক্তরাষ্ট্র",
            nameEn = "United States",
            areaSqKm = 9_833_517L,
            population = 345_000_000L,
            gdpGrowthPercent = 2.4,
            regionBn = "উত্তর আমেরিকা"
        ),
        AynaCountryStatsItem(
            isoCode = "CHN",
            nameBn = "চীন",
            nameEn = "China",
            areaSqKm = 9_596_961L,
            population = 1_409_000_000L,
            gdpGrowthPercent = 4.8,
            regionBn = "পূর্ব এশিয়া"
        ),
        AynaCountryStatsItem(
            isoCode = "JPN",
            nameBn = "জাপান",
            nameEn = "Japan",
            areaSqKm = 377_975L,
            population = 123_700_000L,
            gdpGrowthPercent = 1.1,
            regionBn = "পূর্ব এশিয়া"
        ),
        AynaCountryStatsItem(
            isoCode = "DEU",
            nameBn = "জার্মানি",
            nameEn = "Germany",
            areaSqKm = 357_114L,
            population = 84_500_000L,
            gdpGrowthPercent = 0.6,
            regionBn = "ইউরোপ"
        ),
        AynaCountryStatsItem(
            isoCode = "GBR",
            nameBn = "যুক্তরাজ্য",
            nameEn = "United Kingdom",
            areaSqKm = 242_495L,
            population = 68_900_000L,
            gdpGrowthPercent = 1.5,
            regionBn = "ইউরোপ"
        ),
        AynaCountryStatsItem(
            isoCode = "BRA",
            nameBn = "ব্রাজিল",
            nameEn = "Brazil",
            areaSqKm = 8_515_767L,
            population = 216_500_000L,
            gdpGrowthPercent = 2.9,
            regionBn = "দক্ষিণ আমেরিকা"
        ),
        AynaCountryStatsItem(
            isoCode = "SAU",
            nameBn = "সৌদি আরব",
            nameEn = "Saudi Arabia",
            areaSqKm = 2_149_690L,
            population = 37_200_000L,
            gdpGrowthPercent = 4.2,
            regionBn = "মধ্যপ্রাচ্য"
        ),
        AynaCountryStatsItem(
            isoCode = "ARE",
            nameBn = "সংযুক্ত আরব আমিরাত",
            nameEn = "United Arab Emirates",
            areaSqKm = 83_600L,
            population = 10_400_000L,
            gdpGrowthPercent = 4.0,
            regionBn = "মধ্যপ্রাচ্য"
        )
    )

    fun speak(text: String) {
        val clean = text.trim()
        if (clean.isEmpty()) return
        onSpeakRequest?.invoke(clean)
        if (!ttsReady) {
            queuedSpeech = clean
            return
        }
        speakNow(clean)
    }

    private fun speakNow(text: String) {
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_world_stats_${System.currentTimeMillis()}")
    }

    fun saveColdData(
        countries: List<AynaCountryStatsItem>,
        lastAiResult: AynaWorldStatsAiResult?
    ) {
        val arr = JSONArray()
        countries.forEach { c ->
            arr.put(
                JSONObject().apply {
                    put("isoCode", c.isoCode)
                    put("nameBn", c.nameBn)
                    put("nameEn", c.nameEn)
                    put("areaSqKm", c.areaSqKm)
                    put("population", c.population)
                    put("gdpGrowthPercent", c.gdpGrowthPercent)
                    put("regionBn", c.regionBn)
                }
            )
        }
        val root = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("countries", arr)
            if (lastAiResult != null) {
                put(
                    "lastAiResult",
                    JSONObject().apply {
                        put("isoCode", lastAiResult.isoCode)
                        put("countryNameBn", lastAiResult.countryNameBn)
                        put("densityPerSqKm", lastAiResult.densityPerSqKm)
                        put("aiAnalysisBn", lastAiResult.aiAnalysisBn)
                    }
                )
            }
        }
        coldFile.writeText(root.toString(2), Charsets.UTF_8)
    }

    fun loadColdData(): Pair<List<AynaCountryStatsItem>, AynaWorldStatsAiResult?> {
        val defaults = defaultCountries()
        if (!coldFile.exists()) return defaults to null
        return try {
            val root = JSONObject(coldFile.readText(Charsets.UTF_8))
            val arr = root.optJSONArray("countries")
            val parsedList = if (arr != null && arr.length() > 0) {
                val list = mutableListOf<AynaCountryStatsItem>()
                for (i in 0 until arr.length()) {
                    val obj = arr.optJSONObject(i) ?: continue
                    list.add(
                        AynaCountryStatsItem(
                            isoCode = obj.optString("isoCode", "UNK"),
                            nameBn = obj.optString("nameBn", "দেশ"),
                            nameEn = obj.optString("nameEn", "Country"),
                            areaSqKm = obj.optLong("areaSqKm", 1L),
                            population = obj.optLong("population", 0L),
                            gdpGrowthPercent = obj.optDouble("gdpGrowthPercent", 0.0),
                            regionBn = obj.optString("regionBn", "বিশ্ব")
                        )
                    )
                }
                if (list.isNotEmpty()) list else defaults
            } else {
                defaults
            }

            val lastObj = root.optJSONObject("lastAiResult")
            val lastRes = lastObj?.let {
                AynaWorldStatsAiResult(
                    isoCode = it.optString("isoCode", ""),
                    countryNameBn = it.optString("countryNameBn", ""),
                    densityPerSqKm = it.optLong("densityPerSqKm", 0L),
                    aiAnalysisBn = it.optString("aiAnalysisBn", ""),
                    fromColdBackup = true
                )
            }

            parsedList to lastRes
        } catch (_: Exception) {
            defaults to null
        }
    }

    suspend fun analyzeCountryStatsWithAi(
        country: AynaCountryStatsItem,
        allCountries: List<AynaCountryStatsItem> = defaultCountries(),
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        speakSummary: Boolean = true
    ): AynaWorldStatsAiResult = withContext(Dispatchers.IO) {
        val safeArea = country.areaSqKm.coerceAtLeast(1L)
        val density = (country.population.toDouble() / safeArea.toDouble()).roundToLong()

        val fallbackText =
            "${country.nameBn} (${country.regionBn}): আয়াতন ${country.areaSqKm} বর্গকিমি, জনসংখ্যা প্রায় ${country.population} জন " +
                "(জনঘনত্ব প্রতি বর্গকিমি ~${density} জন), এবং বার্ষিক অর্থনৈতিক প্রবৃদ্ধির হার ${country.gdpGrowthPercent}%।"

        val aiText = try {
            val reply = askAynaModuleAI(
                module = "world_stats",
                action = "country_area_population_gdp_growth_analysis",
                text = "Country: ${country.nameBn} (${country.nameEn}, ${country.isoCode}). Region: ${country.regionBn}. " +
                    "Area: ${country.areaSqKm} sq km. Population: ${country.population}. " +
                    "Population density: ~$density per sq km. GDP growth rate: ${country.gdpGrowthPercent}%.",
                context = "Provide a concise 2-3 sentence Bengali analysis of this country's area, population density, and economic growth rate without markdown asterisks or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            reply.ifBlank { fallbackText }.take(300)
        } catch (_: Exception) {
            fallbackText
        }

        val result = AynaWorldStatsAiResult(
            isoCode = country.isoCode,
            countryNameBn = country.nameBn,
            densityPerSqKm = density,
            aiAnalysisBn = aiText,
            fromColdBackup = false
        )

        saveColdData(allCountries, result)

        if (speakSummary) {
            withContext(Dispatchers.Main) {
                speak(aiText)
            }
        }
        result
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}