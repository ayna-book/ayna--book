package com.aynabook.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.utility.AynaAutoEvAiUpdater
import com.aynabook.app.utility.AynaAutoEvState
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val AutoEvDarkBg = Color(0xFF050A18)
private val AutoEvCardBg = Color(0xFF0A1636)
private val AutoEvGoldBright = Color(0xFFFFF6B3)
private val AutoEvGoldBorder = Color(0xFFFFE64D)
private val AutoEvCyan = Color(0xFF38F2FF)

private val AutoEvTopics = listOf(
    "Global EV & Hybrid",
    "Battery & Fast Charging",
    "AI & Autonomous Auto"
)

@Composable
fun AynaAutoEvCard(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf(AynaAutoEvState()) }
    var selectedTopic by remember { mutableStateOf(AutoEvTopics.first()) }
    var isUpdating by remember { mutableStateOf(false) }

    val updater = remember {
        AynaAutoEvAiUpdater(context = context) { updated ->
            state = updated
        }
    }

    DisposableEffect(Unit) {
        onDispose { updater.shutdown() }
    }

    LaunchedEffect(state.isAutoUpdating, state.intervalMinutes) {
        if (!state.isAutoUpdating) return@LaunchedEffect
        val intervalMs = state.intervalMinutes.coerceAtLeast(1) * 60_000L
        while (state.isAutoUpdating) {
            isUpdating = true
            try {
                updater.fetchAndGenerateAutoEvUpdate(
                    focusArea = selectedTopic,
                    apiBaseUrl = apiBaseUrl,
                    auth = auth,
                    speakSummary = false
                )
            } finally {
                isUpdating = false
            }
            delay(intervalMs)
        }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = AutoEvCardBg),
        border = BorderStroke(3.dp, AutoEvGoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "🚗⚡ বিশ্ব অটোমোবাইল ও ইভি AI আপডেট",
                color = AutoEvGoldBright,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = state.statusMessage,
                color = AutoEvCyan,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                AutoEvTopics.forEach { topic ->
                    val selected = selectedTopic == topic
                    FilterChip(
                        selected = selected,
                        onClick = { selectedTopic = topic },
                        label = {
                            Text(
                                text = topic.substringBefore(" &"),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = AutoEvDarkBg,
                            labelColor = AutoEvGoldBright,
                            selectedContainerColor = AutoEvGoldBorder,
                            selectedLabelColor = AutoEvDarkBg
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    enabled = !isUpdating,
                    onClick = {
                        scope.launch {
                            isUpdating = true
                            try {
                                updater.fetchAndGenerateAutoEvUpdate(
                                    focusArea = selectedTopic,
                                    apiBaseUrl = apiBaseUrl,
                                    auth = auth,
                                    speakSummary = true
                                )
                            } finally {
                                isUpdating = false
                            }
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AutoEvGoldBorder,
                        contentColor = AutoEvDarkBg
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (isUpdating) "আপডেট হচ্ছে..." else "🔄 এখনই AI আপডেট",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }

                Button(
                    onClick = {
                        updater.updateState { prev ->
                            val nextAuto = !prev.isAutoUpdating
                            prev.copy(
                                isAutoUpdating = nextAuto,
                                statusMessage = if (nextAuto) {
                                    "অটো-আপডেট চালু (প্রতি ${prev.intervalMinutes} মিনিট)"
                                } else {
                                    "অটো-আপডেট বন্ধ"
                                }
                            )
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AutoEvDarkBg,
                        contentColor = AutoEvCyan
                    ),
                    border = BorderStroke(2.dp, AutoEvCyan),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (state.isAutoUpdating) "⏸ অটো বন্ধ" else "⏱ অটো চালু",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }
            }

            state.latestDigest?.let { latest ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = latest.titleBn,
                    color = AutoEvGoldBright,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = latest.summaryBn,
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
    }
}