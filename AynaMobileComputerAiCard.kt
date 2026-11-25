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
import com.aynabook.app.utility.AynaMobileAiEngine
import com.aynabook.app.utility.AynaMobileAiResponse
import com.aynabook.app.utility.MobileAiMode
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

private val McAiDarkBg = Color(0xFF050A18)
private val McAiCardBg = Color(0xFF0A1636)
private val McAiGoldBright = Color(0xFFFFF6B3)
private val McAiGoldBorder = Color(0xFFFFE64D)
private val McAiCyan = Color(0xFF38F2FF)

@Composable
fun AynaMobileComputerAiCard(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val engine = remember { AynaMobileAiEngine(context) }

    var inputText by remember { mutableStateOf("") }
    var selectedMode by remember { mutableStateOf(MobileAiMode.HYBRID_FAST) }
    var resultState by remember { mutableStateOf<AynaMobileAiResponse?>(null) }
    var isRunning by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        resultState = engine.loadLastResult()
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = McAiCardBg),
        border = BorderStroke(3.dp, McAiGoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "📱💻 মোবাইল ও কম্পিউটার AI প্রযুক্তি",
                color = McAiGoldBright,
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = resultState?.sourceEngine ?: "Hybrid Edge + Cloud Ready",
                color = McAiCyan,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                listOf(
                    MobileAiMode.HYBRID_FAST to "হাইব্রিড",
                    MobileAiMode.CLOUD_DEEP to "ক্লাউড AI",
                    MobileAiMode.LOCAL_OFFLINE to "লোকাল"
                ).forEach { (mode, label) ->
                    val active = selectedMode == mode
                    FilterChip(
                        selected = active,
                        onClick = { selectedMode = mode },
                        label = {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = McAiDarkBg,
                            labelColor = McAiGoldBright,
                            selectedContainerColor = McAiGoldBorder,
                            selectedLabelColor = McAiDarkBg
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                label = { Text("প্রশ্ন বা টেক্সট লিখুন", color = McAiGoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                enabled = !isRunning,
                onClick = {
                    scope.launch {
                        isRunning = true
                        try {
                            resultState = engine.runMobileAi(
                                promptText = inputText,
                                mode = selectedMode,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth
                            )
                        } finally {
                            isRunning = false
                        }
                    }
                },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = McAiGoldBorder,
                    contentColor = McAiDarkBg
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isRunning) "AI চলছে..." else "🚀 AI রেসপন্স পান",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            resultState?.let { res ->
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "${res.sourceEngine} • ${res.deviceSpec}",
                    color = McAiCyan,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = res.outputBn,
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
    }
}