package com.aynabook.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.ui.components.AynaClockTempCard
import com.google.firebase.auth.FirebaseAuth

private val HomeDarkBg = Color(0xFF050A18)
private val HomePanelBg = Color(0xFF0A1636)
private val HomeGoldBright = Color(0xFFFFF6B3)
private val HomeGoldBorder = Color(0xFFFFE64D)
private val HomeCyanAccent = Color(0xFF38F2FF)

@Composable
fun HomeScreen(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    onOpenNewPost: () -> Unit = {},
    onOpenMessenger: () -> Unit = {},
    onOpenModeration: () -> Unit = {}
) {
    val scrollState = rememberScrollState()
    val currentUserLabel = auth.currentUser?.email ?: auth.currentUser?.uid ?: "সদস্য"

    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier
            .fillMaxSize()
            .background(HomeDarkBg)
            .verticalScroll(scrollState)
            .padding(16.dp)
    ) {
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = HomePanelBg),
            border = BorderStroke(3.dp, HomeGoldBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "AYNA BOOK",
                    color = HomeGoldBright,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "স্বাগতম, $currentUserLabel • বালুখালী বাজার, চট্টগ্রাম বিভাগ",
                    color = HomeCyanAccent,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        AynaClockTempCard(
            latitude = 21.2246,
            longitude = 92.2636,
            locationName = "বালুখালী বাজার, চট্টগ্রাম বিভাগ",
            apiBaseUrl = apiBaseUrl,
            auth = auth
        )

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = HomePanelBg),
            border = BorderStroke(3.dp, HomeGoldBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.padding(18.dp)
            ) {
                Text(
                    text = "⚡ দ্রুত মডিউলসমূহ",
                    color = HomeGoldBright,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold
                )

                Button(
                    onClick = onOpenNewPost,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = HomeGoldBorder,
                        contentColor = HomeDarkBg
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "✍️ নতুন পোস্ট ও AI ক্যাপশন",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Button(
                        onClick = onOpenMessenger,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HomeDarkBg,
                            contentColor = HomeCyanAccent
                        ),
                        border = BorderStroke(2.dp, HomeCyanAccent),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "💬 @ayna চ্যাট",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            maxLines = 1
                        )
                    }

                    Button(
                        onClick = onOpenModeration,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = HomeDarkBg,
                            contentColor = HomeGoldBright
                        ),
                        border = BorderStroke(2.dp, HomeGoldBorder),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = "🛡️ মডারেশন",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            maxLines = 1
                        )
                    }
                }
            }
        }
    }
}