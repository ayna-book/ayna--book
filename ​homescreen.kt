package com.aynabook.app

import android.speech.tts.TextToSpeech
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

private val AynaBg = Color(0xFF050A18)
private val AynaNavyTop = Color(0xFF1A3575)
private val AynaNavyBottom = Color(0xFF08122B)
private val AynaPanel = Color(0xFF050B1C)
private val AynaGold = Color(0xFFFFE64D)
private val AynaGoldBright = Color(0xFFFFF6B3)
private val AynaCyan = Color(0xFF38F2FF)
private val AynaWhite = Color(0xFFFFFFFF)
private val AynaMuted = Color(0xFFE6EEFF)

@Composable
fun HomeScreen(
    onOpenUrl: (String) -> Unit
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    // সেহরি (04:58) ও ইফতার (17:12) ভিত্তি সময় (২৪-ঘণ্টা ফরম্যাট)
    val sehriHour = 4
    val sehriMinute = 58
    val iftarHour = 17
    val iftarMinute = 12

    var nowMillis by remember { mutableStateOf(System.currentTimeMillis()) }
    var speakingClockEnabled by remember { mutableStateOf(true) }
    var sehriIftarScheduleEnabled by remember { mutableStateOf(true) }
    var ttsReady by remember { mutableStateOf(false) }

    var lastHourlySpokenKey by remember { mutableStateOf("") }
    var lastSehriAlertKey by remember { mutableStateOf("") }
    var lastIftar5MinKey by remember { mutableStateOf("") }

    val tts = remember {
        var engine: TextToSpeech? = null
        engine = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val bnLocale = Locale("bn", "BD")
                val res = engine?.setLanguage(bnLocale)
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    engine?.language = Locale.US
                }
                engine?.setSpeechRate(0.95f)
                ttsReady = true
            }
        }
        engine
    }

    DisposableEffect(Unit) {
        onDispose {
            tts.stop()
            tts.shutdown()
        }
    }

    fun speakAnnouncement(message: String) {
        if (!speakingClockEnabled || !ttsReady) return
        tts.speak(message, TextToSpeech.QUEUE_FLUSH, null, "ayna_clock_utt")
    }

    LaunchedEffect(speakingClockEnabled, sehriIftarScheduleEnabled, ttsReady) {
        while (true) {
            val now = Date()
            nowMillis = now.time

            val cal = Calendar.getInstance().apply { time = now }
            val h = cal.get(Calendar.HOUR_OF_DAY)
            val m = cal.get(Calendar.MINUTE)
            val nowMinutes = h * 60 + m
            val sehriMinutes = sehriHour * 60 + sehriMinute
            val iftarMinutes = iftarHour * 60 + iftarMinute
            val dayKey = "${cal.get(Calendar.YEAR)}-${cal.get(Calendar.DAY_OF_YEAR)}"
            val formattedTime = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(now)

            if (speakingClockEnabled) {
                var handledIftarWindow = false

                // ১. সেহরি-ইফতার সময়সূচি চালু থাকলে: সেহরির ১.৫ ঘণ্টা (৯০ মিনিট) আগে ঘোষণা
                if (sehriIftarScheduleEnabled && nowMinutes == sehriMinutes - 90) {
                    val sehriKey = "$dayKey-sehri90"
                    if (lastSehriAlertKey != sehriKey) {
                        lastSehriAlertKey = sehriKey
                        speakAnnouncement("সতর্কতা: সেহরির আর দেড় ঘণ্টা বাকি। এখন সময় $formattedTime।")
                    }
                }

                // ২. সেহরি-ইফতার সময়সূচি চালু থাকলে: ইফতারের ১ ঘণ্টা আগে থেকে প্রতি ৫ মিনিট পর পর ঘোষণা
                val iftarStart = iftarMinutes - 60
                if (sehriIftarScheduleEnabled && nowMinutes in iftarStart..iftarMinutes) {
                    val diff = nowMinutes - iftarStart
                    val iftarSlotKey = "$dayKey-$h:$m"
                    if (diff % 5 == 0 && lastIftar5MinKey != iftarSlotKey) {
                        lastIftar5MinKey = iftarSlotKey
                        val remainingMin = iftarMinutes - nowMinutes
                        if (remainingMin == 0) {
                            speakAnnouncement("এখন ইফতারের সময়, $formattedTime।")
                        } else {
                            speakAnnouncement("ইফতারের আর $remainingMin মিনিট বাকি। এখন সময় $formattedTime।")
                        }
                    }
                    handledIftarWindow = true
                }

                // ৩. প্রতি ১ ঘণ্টা পর পর রিয়েল-টাইম ঘোষণা
                if (!handledIftarWindow && m == 0) {
                    val hourKey = "$dayKey-$h"
                    if (lastHourlySpokenKey != hourKey) {
                        lastHourlySpokenKey = hourKey
                        speakAnnouncement("এখন সময় $formattedTime।")
                    }
                }
            }

            delay(10_000L)
        }
    }

    val currentDate = Date(nowMillis)
    val clockText = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(currentDate)
    val sehriDisplay = formatHm(sehriHour, sehriMinute)
    val iftarDisplay = formatHm(iftarHour, iftarMinute)

    val cardBrush = Brush.linearGradient(
        colors = listOf(AynaNavyTop, AynaNavyBottom)
    )
    val cardShape = RoundedCornerShape(10.dp)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AynaBg)
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "AYNA BOOK HOME ★",
            color = AynaGoldBright,
            fontSize = 28.sp,
            fontWeight = FontWeight.ExtraBold
        )

        // রিয়েল-টাইম কথা বলার ঘড়ি ও সেহরি-ইফতার কন্ট্রোল কার্ড
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(BorderStroke(3.dp, AynaGold), cardShape),
            shape = cardShape,
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(cardBrush)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "🕒 রিয়েল-টাইম কথা বলার ঘড়ি",
                    color = AynaGoldBright,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = clockText,
                    color = AynaCyan,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "• প্রতি ১ ঘণ্টা পর পর সময় ঘোষণা\n• সেহরির ১.৫ ঘণ্টা আগে ঘোষণা (সেহরি: $sehriDisplay)\n• ইফতারের ১ ঘণ্টা আগে থেকে প্রতি ৫ মিনিটে ঘোষণা (ইফতার: $iftarDisplay)",
                    color = AynaMuted,
                    fontSize = 15.sp,
                    lineHeight = 22.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = {
                            speakingClockEnabled = !speakingClockEnabled
                            if (speakingClockEnabled && ttsReady) {
                                val nowStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
                                tts.speak("সময় বলার ঘড়ি চালু হয়েছে। এখন সময় $nowStr।", TextToSpeech.QUEUE_FLUSH, null, "ayna_toggle_on")
                            } else {
                                tts.stop()
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (speakingClockEnabled) AynaGold else AynaPanel,
                            contentColor = if (speakingClockEnabled) AynaBg else AynaWhite
                        )
                    ) {
                        Text(
                            text = if (speakingClockEnabled) "🔊 সময় ঘড়ি: চালু" else "🔇 সময় ঘড়ি: বন্ধ",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }

                    Button(
                        onClick = {
                            sehriIftarScheduleEnabled = !sehriIftarScheduleEnabled
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (sehriIftarScheduleEnabled) AynaGold else AynaPanel,
                            contentColor = if (sehriIftarScheduleEnabled) AynaBg else AynaWhite
                        )
                    ) {
                        Text(
                            text = if (sehriIftarScheduleEnabled) "🌙 সেহরি-ইফতার: চালু" else "🌙 সেহরি-ইফতার: বন্ধ",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }

                Button(
                    onClick = {
                        if (ttsReady) {
                            val nowStr = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
                            tts.speak("এখন সময় $nowStr।", TextToSpeech.QUEUE_FLUSH, null, "ayna_test_now")
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AynaPanel,
                        contentColor = AynaGoldBright
                    )
                ) {
                    Text(
                        text = "🎙️ এখনই সময় বলুন (টেস্ট)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                }
            }
        }

        // বিশ্ব রাষ্ট্রনেতা কার্ড (অক্ষুণ্ণ)
        WorldLeadersCard(
            onOpenWorldLeaders = onOpenUrl,
            cardBrush = cardBrush,
            cardShape = cardShape
        )

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun WorldLeadersCard(
    onOpenWorldLeaders: (String) -> Unit,
    cardBrush: Brush = Brush.linearGradient(listOf(AynaNavyTop, AynaNavyBottom)),
    cardShape: RoundedCornerShape = RoundedCornerShape(10.dp)
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(BorderStroke(3.dp, AynaGold), cardShape),
        shape = cardShape,
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(cardBrush)
                .padding(16.dp)
        ) {
            Text(
                text = "🌐 বিশ্ব রাষ্ট্রনেতা",
                color = AynaGoldBright,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "নাম, মেয়াদকাল, ছবি ও পতাকা",
                color = AynaMuted,
                fontSize = 16.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = {
                    onOpenWorldLeaders("world-leaders/world-leaders.html")
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = AynaGold,
                    contentColor = AynaBg
                )
            ) {
                Text(
                    text = "খুলুন",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}

private fun formatHm(hour24: Int, minute: Int): String {
    val cal = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, hour24)
        set(Calendar.MINUTE, minute)
        set(Calendar.SECOND, 0)
    }
    return SimpleDateFormat("hh:mm a", Locale.getDefault()).format(cal.time)
}