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
import com.aynabook.app.utility.AynaCountryStatsItem
import com.aynabook.app.utility.AynaWorldStatsAiEngine
import com.aynabook.app.utility.AynaWorldStatsAiResult
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

private val WorldDarkBg = Color(0xFF050A18)
private val WorldCardBg = Color(0xFF0A1636)
private val WorldGoldBright = Color(0xFFFFF6B3)
private val WorldGoldBorder = Color(0xFFFFE64D)
private val WorldCyan = Color(0xFF38F2FF)

private fun formatNum(value: Long): String {
    return NumberFormat.getNumberInstance(Locale.US).format(value)
}

@Composable
fun AynaWorldStatsAiCard(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val engine = remember { AynaWorldStatsAiEngine(context) }

    val initialBundle = remember { engine.loadColdData() }
    val allCountries = remember { initialBundle.first }
    var searchText by remember { mutableStateOf("") }
    var selectedCountry by remember { mutableStateOf(allCountries.first()) }
    var aiResult by remember { mutableStateOf(initialBundle.second) }
    var isAnalyzing by remember { mutableStateOf(false) }

    val visibleCountries = remember(allCountries, searchText) {
        val needle = searchText.trim().lowercase()
        if (needle.isEmpty()) {
            allCountries.take(6)
        } else {
            allCountries.filter {
                it.nameBn.lowercase().contains(needle) ||
                    it.nameEn.lowercase().contains(needle) ||
                    it.isoCode.lowercase().contains(needle) ||
                    it.regionBn.lowercase().contains(needle)
            }.take(6)
        }
    }

    LaunchedEffect(visibleCountries) {
        if (visibleCountries.isNotEmpty() && visibleCountries.none { it.isoCode == selectedCountry.isoCode }) {
            selectedCountry = visibleCountries.first()
        }
    }

    DisposableEffect(Unit) {
        onDispose { engine.shutdown() }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = WorldCardBg),
        border = BorderStroke(3.dp, WorldGoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "🌍📊 বিশ্ব রাষ্ট্র: আয়াতন, জনসংখ্যা ও প্রবৃদ্ধি AI",
                color = WorldGoldBright,
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "আয়াতন (বর্গকিমি), জনসংখ্যা ও অর্থনৈতিক প্রবৃদ্ধিহার",
                color = WorldCyan,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = searchText,
                onValueChange = { searchText = it },
                label = { Text("দেশ বা অঞ্চল খুঁজুন (যেমন: বাংলাদেশ, ভারত)", color = WorldGoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            visibleCountries.chunked(2).forEach { row ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp)
                ) {
                    row.forEach { item: AynaCountryStatsItem ->
                        val active = selectedCountry.isoCode == item.isoCode
                        FilterChip(
                            selected = active,
                            onClick = { selectedCountry = item },
                            label = {
                                Text(
                                    text = "${item.nameBn} (${item.gdpGrowthPercent}%)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                containerColor = WorldDarkBg,
                                labelColor = WorldGoldBright,
                                selectedContainerColor = WorldGoldBorder,
                                selectedLabelColor = WorldDarkBg
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (row.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            Card(
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = WorldDarkBg),
                border = BorderStroke(1.5.dp, WorldCyan),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = "${selectedCountry.nameBn} (${selectedCountry.isoCode}) • ${selectedCountry.regionBn}",
                        color = WorldGoldBright,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "📐 আয়াতন: ${formatNum(selectedCountry.areaSqKm)} বর্গকিমি",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "👥 জনসংখ্যা: ${formatNum(selectedCountry.population)}",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "📈 অর্থনৈতিক প্রবৃদ্ধিহার: ${selectedCountry.gdpGrowthPercent}%",
                        color = WorldCyan,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                enabled = !isAnalyzing,
                onClick = {
                    scope.launch {
                        isAnalyzing = true
                        try {
                            aiResult = engine.analyzeCountryStatsWithAi(
                                country = selectedCountry,
                                allCountries = allCountries,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth,
                                speakSummary = true
                            )
                        } finally {
                            isAnalyzing = false
                        }
                    }
                },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = WorldGoldBorder,
                    contentColor = WorldDarkBg
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isAnalyzing) "AI বিশ্লেষণ চলছে..." else "🤖 AI বিশ্লেষণ ও ভয়েস সারসংক্ষেপ",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            aiResult?.let { res ->
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "জনঘনত্ব: ~${formatNum(res.densityPerSqKm)} জন/বর্গকিমি",
                    color = WorldCyan,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = res.aiAnalysisBn,
                    color = WorldGoldBright,
                    fontSize = 15.sp
                )
            }
        }
    }
}