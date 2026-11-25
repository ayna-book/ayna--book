package com.aynabook.app.utility

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.speech.tts.TextToSpeech
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

data class AynaRadarTargetPoint(
    val id: String,
    val labelBn: String,
    val bearingDeg: Float,
    val distanceKm: Float,
    val category: String
)

data class AynaRadarCompassState(
    val azimuthDeg: Float = 0f,
    val cardinalBn: String = "উত্তর (N)",
    val radarRangeKm: Int = 15,
    val latitude: Double = 23.8103,
    val longitude: Double = 90.4125,
    val locationLabelBn: String = "ঢাকা, ঢাকা বিভাগ",
    val targets: List<AynaRadarTargetPoint> = emptyList(),
    val aiBriefingBn: String = "",
    val statusMessage: String = "রাডার ও কম্পাস সেন্সর প্রস্তুত",
    val fromColdBackup: Boolean = false
)

class AynaRadarCompassAiEngine(
    context: Context,
    private val onStateChange: (AynaRadarCompassState) -> Unit = {}
) : SensorEventListener {

    private val coldFile = File(context.filesDir, "ayna_radar_compass_cold.json")
    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val rotationVectorSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)

    private var ttsReady = false
    private var queuedSpeech: String? = null
    private val rotationMatrix = FloatArray(9)
    private val orientationAngles = FloatArray(3)
    private var lastSensorEmitMs = 0L

    private var state = AynaRadarCompassState(
        targets = defaultRadarTargets(23.8103, 90.4125)
    )

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
        loadColdSnapshot()?.let { cached ->
            state = cached
            onStateChange(state)
        }
    }

    private fun defaultRadarTargets(lat: Double, lon: Double): List<AynaRadarTargetPoint> {
        val baseOffset = (((lat + lon) * 10.0).roundToInt() % 45).toFloat()
        return listOf(
            AynaRadarTargetPoint("T1", "উত্তর সেক্টর চেকপয়েন্ট", normalizeDeg(12f + baseOffset), 4.2f, "Radar Node"),
            AynaRadarTargetPoint("T2", "পূর্ব করিডোর স্টেশন", normalizeDeg(88f - baseOffset / 2f), 9.5f, "Transit"),
            AynaRadarTargetPoint("T3", "দক্ষিণ উপকূলীয় রিলে", normalizeDeg(176f + baseOffset / 3f), 14.0f, "Relay")
        )
    }

    fun normalizeDeg(deg: Float): Float {
        val mod = deg % 360f
        return if (mod < 0f) mod + 360f else mod
    }

    fun bearingToCardinalBn(deg: Float): String {
        val d = normalizeDeg(deg)
        return when {
            d >= 337.5f || d < 22.5f -> "উত্তর (N)"
            d < 67.5f -> "উত্তর-পূর্ব (NE)"
            d < 112.5f -> "পূর্ব (E)"
            d < 157.5f -> "দক্ষিণ-পূর্ব (SE)"
            d < 202.5f -> "দক্ষিণ (S)"
            d < 247.5f -> "দক্ষিণ-পশ্চিম (SW)"
            d < 292.5f -> "পশ্চিম (W)"
            else -> "উত্তর-পশ্চিম (NW)"
        }
    }

    fun startCompassSensors() {
        val sensor = rotationVectorSensor
        if (sensorManager != null && sensor != null) {
            sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_UI)
            emit(state.copy(statusMessage = "লাইভ কম্পাস ও রাডার সক্রিয়"))
        } else {
            emit(state.copy(statusMessage = "ডিভাইসে রোটেশন সেন্সর নেই; ম্যানুয়াল/AI রাডার সক্রিয়"))
        }
    }

    fun stopCompassSensors() {
        sensorManager?.unregisterListener(this)
    }

    fun setManualHeadingAndRange(
        azimuthDeg: Float,
        radarRangeKm: Int,
        latitude: Double = state.latitude,
        longitude: Double = state.longitude,
        locationLabelBn: String = state.locationLabelBn
    ) {
        val cleanAz = normalizeDeg(azimuthDeg)
        val cleanRange = radarRangeKm.coerceIn(1, 200)
        emit(
            state.copy(
                azimuthDeg = cleanAz,
                cardinalBn = bearingToCardinalBn(cleanAz),
                radarRangeKm = cleanRange,
                latitude = latitude,
                longitude = longitude,
                locationLabelBn = locationLabelBn,
                targets = defaultRadarTargets(latitude, longitude)
            )
        )
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type != Sensor.TYPE_ROTATION_VECTOR) return
        val now = System.currentTimeMillis()
        if (now - lastSensorEmitMs < 180L) return
        lastSensorEmitMs = now

        SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
        SensorManager.getOrientation(rotationMatrix, orientationAngles)
        val azimuthRad = orientationAngles[0]
        val azimuthDeg = normalizeDeg(Math.toDegrees(azimuthRad.toDouble()).toFloat())
        val cardinal = bearingToCardinalBn(azimuthDeg)

        emit(
            state.copy(
                azimuthDeg = azimuthDeg,
                cardinalBn = cardinal,
                statusMessage = "কম্পাস: ${azimuthDeg.roundToInt()}° $cardinal • রাডার ${state.radarRangeKm} কিমি"
            )
        )
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit

    private fun emit(next: AynaRadarCompassState) {
        state = next
        onStateChange(next)
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
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ayna_radar_${System.currentTimeMillis()}")
    }

    fun saveColdSnapshot(snapshot: AynaRadarCompassState) {
        val obj = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("azimuthDeg", snapshot.azimuthDeg.toDouble())
            put("cardinalBn", snapshot.cardinalBn)
            put("radarRangeKm", snapshot.radarRangeKm)
            put("latitude", snapshot.latitude)
            put("longitude", snapshot.longitude)
            put("locationLabelBn", snapshot.locationLabelBn)
            put("aiBriefingBn", snapshot.aiBriefingBn)
        }
        coldFile.writeText(obj.toString(2), Charsets.UTF_8)
    }

    fun loadColdSnapshot(): AynaRadarCompassState? {
        if (!coldFile.exists()) return null
        return try {
            val obj = JSONObject(coldFile.readText(Charsets.UTF_8))
            val lat = obj.optDouble("latitude", 23.8103)
            val lon = obj.optDouble("longitude", 90.4125)
            val az = normalizeDeg(obj.optDouble("azimuthDeg", 0.0).toFloat())
            AynaRadarCompassState(
                azimuthDeg = az,
                cardinalBn = obj.optString("cardinalBn", bearingToCardinalBn(az)),
                radarRangeKm = obj.optInt("radarRangeKm", 15),
                latitude = lat,
                longitude = lon,
                locationLabelBn = obj.optString("locationLabelBn", "ঢাকা, ঢাকা বিভাগ"),
                targets = defaultRadarTargets(lat, lon),
                aiBriefingBn = obj.optString("aiBriefingBn", ""),
                statusMessage = "কোল্ড ব্যাকআপ থেকে রাডার ও কম্পাস লোড হয়েছে",
                fromColdBackup = true
            )
        } catch (_: Exception) {
            null
        }
    }

    suspend fun analyzeRadarAndCompassWithAi(
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        speakBriefing: Boolean = true
    ): AynaRadarCompassState = withContext(Dispatchers.IO) {
        val current = state
        val degInt = current.azimuthDeg.roundToInt()
        val inRangeTargets = current.targets.filter { it.distanceKm <= current.radarRangeKm.toFloat() }
        val timeStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())

        val fallbackBriefing =
            "${current.locationLabelBn}-এ কম্পাস দিক $degInt° (${current.cardinalBn}), রাডার রেঞ্জ ${current.radarRangeKm} কিমি, " +
                "এবং রেঞ্জের ভেতরে ${inRangeTargets.size}টি রাডার সিগন্যাল পয়েন্ট সক্রিয়।"

        val aiBriefing = try {
            val targetSummary = inRangeTargets.joinToString("; ") {
                "${it.labelBn} at ${it.bearingDeg.roundToInt()} deg, ${it.distanceKm} km"
            }.ifBlank { "No active points inside current range" }

            val reply = askAynaModuleAI(
                module = "radar_compass",
                action = "radar_compass_navigation_briefing",
                text = "Time: $timeStr. Location: ${current.locationLabelBn} (${current.latitude}, ${current.longitude}). " +
                    "Compass heading: $degInt deg (${current.cardinalBn}). Radar range: ${current.radarRangeKm} km. Targets: $targetSummary.",
                context = "Provide a concise 2-sentence Bengali compass and radar briefing without markdown asterisks or emojis.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
            reply.ifBlank { fallbackBriefing }.take(240)
        } catch (_: Exception) {
            fallbackBriefing
        }

        val updated = current.copy(
            aiBriefingBn = aiBriefing,
            statusMessage = "AI রাডার ও কম্পাস বিশ্লেষণ সম্পন্ন ($timeStr)",
            fromColdBackup = false
        )
        saveColdSnapshot(updated)

        withContext(Dispatchers.Main) {
            emit(updated)
            if (speakBriefing) {
                speak(aiBriefing)
            }
        }
        updated
    }

    fun shutdown() {
        stopCompassSensors()
        tts.stop()
        tts.shutdown()
    }
}