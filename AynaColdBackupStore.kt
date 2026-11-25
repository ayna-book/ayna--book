package com.aynabook.app.utility

import android.content.Context
import org.json.JSONObject
import java.io.File

data class AynaColdSnapshot(
    val savedAtEpochMs: Long,
    val timeTextBn: String,
    val locationName: String,
    val temperatureC: Double,
    val apparentTempC: Double,
    val humidityPercent: Int,
    val tempSummaryBn: String
)

class AynaColdBackupStore(context: Context) {
    private val coldFile: File = File(context.filesDir, "ayna_cold_backup.json")

    fun saveSnapshot(snapshot: AynaColdSnapshot) {
        val obj = JSONObject().apply {
            put("savedAtEpochMs", snapshot.savedAtEpochMs)
            put("timeTextBn", snapshot.timeTextBn)
            put("locationName", snapshot.locationName)
            put("temperatureC", snapshot.temperatureC)
            put("apparentTempC", snapshot.apparentTempC)
            put("humidityPercent", snapshot.humidityPercent)
            put("tempSummaryBn", snapshot.tempSummaryBn)
        }
        coldFile.writeText(obj.toString(2), Charsets.UTF_8)
    }

    fun loadSnapshot(): AynaColdSnapshot? {
        if (!coldFile.exists()) return null
        return try {
            val obj = JSONObject(coldFile.readText(Charsets.UTF_8))
            AynaColdSnapshot(
                savedAtEpochMs = obj.optLong("savedAtEpochMs", 0L),
                timeTextBn = obj.optString("timeTextBn", ""),
                locationName = obj.optString("locationName", "বালুখালী বাজার, চট্টগ্রাম বিভাগ"),
                temperatureC = obj.optDouble("temperatureC", 27.0),
                apparentTempC = obj.optDouble("apparentTempC", 28.0),
                humidityPercent = obj.optInt("humidityPercent", 72),
                tempSummaryBn = obj.optString("tempSummaryBn", "")
            )
        } catch (_: Exception) {
            null
        }
    }

    fun exportColdJsonText(): String {
        return loadSnapshot()?.let { snap ->
            JSONObject().apply {
                put("savedAtEpochMs", snap.savedAtEpochMs)
                put("timeTextBn", snap.timeTextBn)
                put("locationName", snap.locationName)
                put("temperatureC", snap.temperatureC)
                put("apparentTempC", snap.apparentTempC)
                put("humidityPercent", snap.humidityPercent)
                put("tempSummaryBn", snap.tempSummaryBn)
            }.toString(2)
        } ?: "{}"
    }
}