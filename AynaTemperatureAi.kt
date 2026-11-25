package com.aynabook.app.utility

import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class AynaWeatherSnapshot(
    val locationName: String,
    val temperatureC: Double,
    val apparentTempC: Double,
    val humidityPercent: Int,
    val windKmh: Double,
    val weatherCode: Int
)

data class AynaTemperatureAiInsight(
    val snapshot: AynaWeatherSnapshot,
    val aiSummaryBn: String
)

suspend fun fetchCurrentWeatherSnapshot(
    latitude: Double = 21.2246,
    longitude: Double = 92.2636,
    locationName: String = "বালুখালী বাজার, চট্টগ্রাম বিভাগ"
): AynaWeatherSnapshot = withContext(Dispatchers.IO) {
    val urlStr =
        "https://api.open-meteo.com/v1/forecast?latitude=$latitude&longitude=$longitude" +
            "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code" +
            "&timezone=auto"

    val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
        requestMethod = "GET"
        connectTimeout = 15_000
        readTimeout = 15_000
    }

    try {
        val raw = conn.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
        val root = JSONObject(raw)
        val current = root.optJSONObject("current") ?: JSONObject()

        AynaWeatherSnapshot(
            locationName = locationName,
            temperatureC = current.optDouble("temperature_2m", 26.0),
            apparentTempC = current.optDouble("apparent_temperature", 27.0),
            humidityPercent = current.optInt("relative_humidity_2m", 70),
            windKmh = current.optDouble("wind_speed_10m", 8.0),
            weatherCode = current.optInt("weather_code", 0)
        )
    } finally {
        conn.disconnect()
    }
}

suspend fun analyzeTemperatureWithAI(
    latitude: Double = 21.2246,
    longitude: Double = 92.2636,
    locationName: String = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
    userNote: String = "",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance()
): AynaTemperatureAiInsight {
    val snapshot = fetchCurrentWeatherSnapshot(
        latitude = latitude,
        longitude = longitude,
        locationName = locationName
    )

    val weatherPrompt = buildString {
        append("Location: ${snapshot.locationName}. ")
        append("Actual temperature: ${snapshot.temperatureC}°C. ")
        append("Feels like: ${snapshot.apparentTempC}°C. ")
        append("Humidity: ${snapshot.humidityPercent}%. ")
        append("Wind: ${snapshot.windKmh} km/h. ")
        append("WMO code: ${snapshot.weatherCode}.")
        if (userNote.isNotBlank()) {
            append(" User note: $userNote")
        }
    }

    val aiReply = try {
        askAynaModuleAI(
            module = "weather",
            action = "temperature_understanding",
            text = weatherPrompt,
            context = "Explain the current temperature in clear, friendly Bengali (2 short sentences). Mention how hot/cool/humid it feels and give practical clothing/comfort advice. No markdown bullets.",
            apiBaseUrl = apiBaseUrl,
            auth = auth
        ).trim().ifBlank { buildFallbackTempMessageBn(snapshot) }
    } catch (_: Exception) {
        buildFallbackTempMessageBn(snapshot)
    }

    return AynaTemperatureAiInsight(
        snapshot = snapshot,
        aiSummaryBn = aiReply
    )
}

fun buildFallbackTempMessageBn(snap: AynaWeatherSnapshot): String {
    val feelLabel = when {
        snap.apparentTempC >= 35.0 -> "খুবই গরম অনুভূত হচ্ছে"
        snap.apparentTempC >= 30.0 -> "গরম ও কিছুটা ভ্যাপসা অনুভূত হচ্ছে"
        snap.apparentTempC >= 22.0 -> "সহনীয় ও আরামদায়ক তাপমাত্রা রয়েছে"
        snap.apparentTempC >= 16.0 -> "হালকা ঠান্ডা আবহাওয়া অনুভূত হচ্ছে"
        else -> "বেশ ঠান্ডা অনুভূত হচ্ছে, গরম কাপড় রাখুন"
    }
    return "${snap.locationName}-এ বর্তমান তাপমাত্রা ${snap.temperatureC}°C (অনুভূত ${snap.apparentTempC}°C) এবং আর্দ্রতা ${snap.humidityPercent}%। $feelLabel।"
}