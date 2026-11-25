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
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.OutlinedTextField
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
import com.aynabook.app.utility.AynaLaureateEntry
import com.aynabook.app.utility.AynaNobelLaureatesAiEngine
import com.aynabook.app.utility.AynaNobelLaureatesState
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val NobelDarkBg = Color(0xFF050A18)
private val NobelCardBg = Color(0xFF0A1636)
private val NobelGoldBright = Color(0xFFFFF6B3)
private val NobelGoldBorder = Color(0xFFFFE64D)
private val NobelCyan = Color(0xFF38F2FF)

@Composable
fun AynaNobelLaureatesCard(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf(AynaNobelLaureatesState()) }
    var searchQuery by remember { mutableStateOf("") }
    var isUpdating by remember { mutableStateOf(false) }

    val engine = remember {
        AynaNobelLaureatesAiEngine(context = context) { updated ->
            state = updated
        }
    }

    DisposableEffect(Unit) {
        onDispose { engine.shutdown() }
    }

    val filteredList = remember(state.entries, searchQuery) {
        val q = searchQuery.trim().lowercase()
        if (q.isEmpty()) {
            state.entries.take(6)
        } else {
            state.entries.filter {
                it.name.lowercase().contains(q) ||
                    it.prizeOrHonor.lowercase().contains(q) ||
                    it.achievementSummaryBn.lowercase().contains(q) ||
                    it.year.toString().contains(q)
            }.take(6)
        }
    }

    val selectedEntry: AynaLaureateEntry? = remember(state.entries, state.selectedId, filteredList) {
        state.entries.find { it.id == state.selectedId } ?: filteredList.firstOrNull()
    }

    LaunchedEffect(state.isAutoUpdating, state.intervalMinutes) {
        if (!state.isAutoUpdating) return@LaunchedEffect
        val delayMs = state.intervalMinutes.coerceAtLeast(1) * 60_000L
        var cursor = 0
        while (state.isAutoUpdating) {
            val pool = state.entries
            if (pool.isNotEmpty()) {
                val target = pool[cursor % pool.size]
                cursor++
                isUpdating = true
                try {
                    engine.refreshLaureateWithAi(
                        targetEntry = target,
                        apiBaseUrl = apiBaseUrl,
                        auth = auth,
                        speakSummary = false
                    )
                } finally {
                    isUpdating = false
                }
            }
            delay(delayMs)
        }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = NobelCardBg),
        border = BorderStroke(3.dp, NobelGoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "🏅🌍 নোবেলজয়ী ও বিশ্ব মনীষী AI আপডেট",
                color = NobelGoldBright,
                fontSize = 21.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = state.statusMessage,
                color = NobelCyan,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("নাম, সাল বা পুরস্কার খুঁজুন (যেমন: 2026, Carson)", color = NobelGoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            filteredList.chunked(2).forEach { row ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp)
                ) {
                    row.forEach { item ->
                        val active = selectedEntry?.id == item.id
                        FilterChip(
                            selected = active,
                            onClick = { engine.updateState { it.copy(selectedId = item.id) } },
                            label = {
                                Text(
                                    text = "${item.name.substringBefore(" (")} (${item.year})",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                containerColor = NobelDarkBg,
                                labelColor = NobelGoldBright,
                                selectedContainerColor = NobelGoldBorder,
                                selectedLabelColor = NobelDarkBg
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (row.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            selectedEntry?.let { entry ->
                Card(
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = NobelDarkBg),
                    border = BorderStroke(1.5.dp, NobelCyan),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "${entry.name} • ${entry.year}",
                            color = NobelGoldBright,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = entry.prizeOrHonor,
                            color = NobelCyan,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = entry.achievementSummaryBn,
                            color = Color.White,
                            fontSize = 15.sp
                        )
                        if (entry.aiSpotlightBn.isNotBlank()) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "🤖 AI সারসংক্ষেপ: ${entry.aiSpotlightBn}",
                                color = NobelGoldBright,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    enabled = !isUpdating && selectedEntry != null,
                    onClick = {
                        val target = selectedEntry ?: return@Button
                        scope.launch {
                            isUpdating = true
                            try {
                                engine.refreshLaureateWithAi(
                                    targetEntry = target,
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
                        containerColor = NobelGoldBorder,
                        contentColor = NobelDarkBg
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (isUpdating) "AI চলছে..." else "🤖 AI আপডেট ও ভয়েস",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }

                Button(
                    onClick = {
                        engine.updateState { prev ->
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
                        containerColor = NobelDarkBg,
                        contentColor = NobelCyan
                    ),
                    border = BorderStroke(2.dp, NobelCyan),
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
        }
    }
}