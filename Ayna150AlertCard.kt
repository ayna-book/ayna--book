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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.LocalTextStyle
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
import com.aynabook.app.utility.Ayna150AlertEngine
import com.aynabook.app.utility.Ayna150AlertState
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private val Alert150DarkBg = Color(0xFF050A18)
private val Alert150CardBg = Color(0xFF0A1636)
private val Alert150GoldBright = Color(0xFFFFF6B3)
private val Alert150GoldBorder = Color(0xFFFFE64D)
private val Alert150Cyan = Color(0xFF38F2FF)

@Composable
fun Ayna150AlertCard(
    locationName: String = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var alertState by remember { mutableStateOf(Ayna150AlertState()) }
    var customReason by remember { mutableStateOf("সিস্টেম ও মডারেশন ১৫০ এলার্ট") }
    var isTriggering by remember { mutableStateOf(false) }

    val engine = remember {
        Ayna150AlertEngine(context = context) { updated ->
            alertState = updated
        }
    }

    DisposableEffect(Unit) {
        onDispose { engine.shutdown() }
    }

    LaunchedEffect(alertState.isRunning) {
        while (alertState.isRunning) {
            delay(1000L)
            if (alertState.countdownSeconds > 1) {
                engine.updateState { it.copy(countdownSeconds = it.countdownSeconds - 1) }
            } else {
                isTriggering = true
                try {
                    engine.triggerAi150Alert(
                        eventReason = customReason,
                        queueOrMetricCount = 150,
                        locationLabel = locationName,
                        apiBaseUrl = apiBaseUrl,
                        auth = auth,
                        speakAlert = true
                    )
                } finally {
                    isTriggering = false
                }
            }
        }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Alert150CardBg),
        border = BorderStroke(3.dp, Alert150GoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "🚨 AI ১৫০ এলার্ট প্রযুক্তি",
                color = Alert150GoldBright,
                fontSize = 23.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = alertState.statusMessage,
                color = Alert150Cyan,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "টাইমার: ${alertState.countdownSeconds}s / 150s • মোট এলার্ট: ${alertState.totalAlertsTriggered}টি",
                color = Color.White,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold
            )

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedTextField(
                value = customReason,
                onValueChange = { customReason = it },
                label = { Text("১৫০ এলার্ট বিষয়", color = Alert150GoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = {
                        engine.updateState { prev ->
                            val nextRun = !prev.isRunning
                            prev.copy(
                                isRunning = nextRun,
                                statusMessage = if (nextRun) "১৫০s অটো-এলার্ট চালু" else "১৫০s অটো-এলার্ট বিরতি"
                            )
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Alert150DarkBg,
                        contentColor = Alert150Cyan
                    ),
                    border = BorderStroke(2.dp, Alert150Cyan),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (alertState.isRunning) "⏸ বিরতি" else "⏱ ১৫০s অটো",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }

                Button(
                    enabled = !isTriggering,
                    onClick = {
                        scope.launch {
                            isTriggering = true
                            try {
                                engine.triggerAi150Alert(
                                    eventReason = customReason,
                                    queueOrMetricCount = 150,
                                    locationLabel = locationName,
                                    apiBaseUrl = apiBaseUrl,
                                    auth = auth,
                                    speakAlert = true
                                )
                            } finally {
                                isTriggering = false
                            }
                        }
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Alert150GoldBorder,
                        contentColor = Alert150DarkBg
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = if (isTriggering) "AI চলছে..." else "🚨 ১৫০ এলার্ট দিন",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }
            }

            alertState.latestAlert?.let { latest ->
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = latest.titleBn,
                    color = Alert150GoldBright,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = latest.aiAdviceBn,
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
    }
}