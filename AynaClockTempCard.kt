package com.aynabook.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.utility.AynaUnifiedAiClockTemp
import com.aynabook.app.utility.AynaUnifiedClockTempState
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

@Composable
fun AynaClockTempCard(
    latitude: Double = 23.8103,
    longitude: Double = 90.4125,
    locationName: String = "ঢাকা, ঢাকা বিভাগ",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var clockTempState by remember { mutableStateOf(AynaUnifiedClockTempState(locationName = locationName)) }

    val controller = remember {
        AynaUnifiedAiClockTemp(context = context) { updated ->
            clockTempState = updated
        }
    }

    LaunchedEffect(Unit) {
        controller.loadColdSnapshot()?.let { saved ->
            clockTempState = saved
        }
    }

    DisposableEffect(Unit) {
        onDispose { controller.shutdown() }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF08122B)),
        border = BorderStroke(3.dp, Color(0xFFFFE64D)),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "⏰ 🌡️ AI কথা বলার ঘড়ি ও তাপমাত্রা",
                color = Color(0xFFFFF6B3),
                fontSize = 23.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = clockTempState.statusMessage,
                color = Color(0xFF38F2FF),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            if (clockTempState.timeTextBn.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = clockTempState.timeTextBn,
                    color = Color(0xFFFFF6B3),
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
            if (clockTempState.temperatureC != 0.0) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${clockTempState.locationName}: ${clockTempState.temperatureC}°C (অনুভূত ${clockTempState.apparentTempC}°C) • আর্দ্রতা ${clockTempState.humidityPercent}%",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            if (clockTempState.aiInsightBn.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = clockTempState.aiInsightBn,
                    color = Color(0xFFFFF6B3),
                    fontSize = 17.sp
                )
            }
            Spacer(modifier = Modifier.height(14.dp))
            Button(
                onClick = {
                    scope.launch {
                        controller.runAiClockAndTemperature(
                            latitude = latitude,
                            longitude = longitude,
                            locationName = locationName,
                            apiBaseUrl = apiBaseUrl,
                            auth = auth
                        )
                    }
                },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFFE64D),
                    contentColor = Color(0xFF050A18)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "🔊 AI সময় ও তাপমাত্রা বলুন",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}