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
import com.aynabook.app.utility.AynaTradeAiEngine
import com.aynabook.app.utility.AynaTradeAiOutput
import com.aynabook.app.utility.AynaTradeCommodityItem
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

private val TradeDarkBg = Color(0xFF050A18)
private val TradeCardBg = Color(0xFF0A1636)
private val TradeGoldBright = Color(0xFFFFF6B3)
private val TradeGoldBorder = Color(0xFFFFE64D)
private val TradeCyan = Color(0xFF38F2FF)

@Composable
fun AynaTradeAiCard(
    apiBaseUrl: String = "http://10.0.2.2:3000",
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    onSendContactToMessenger: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val engine = remember { AynaTradeAiEngine(context) }

    val commodities = remember { engine.loadColdTradeState().first }
    var selectedCommodity by remember { mutableStateOf(commodities.first()) }
    var quantityInput by remember { mutableStateOf("10") }
    var counterpartyInput by remember { mutableStateOf("গ্লোবাল সাপ্লায়ার ও শিপমেন্ট ডেস্ক") }
    var aiOutput by remember { mutableStateOf<AynaTradeAiOutput?>(null) }
    var isProcessing by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val (_, savedOutput) = engine.loadColdTradeState()
        if (savedOutput != null) {
            aiOutput = savedOutput
        }
    }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = TradeCardBg),
        border = BorderStroke(3.dp, TradeGoldBorder),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Text(
                text = "🌐📦 বিশ্ব আমদানি-রপ্তানি মূল্য ও যোগাযোগ AI",
                color = TradeGoldBright,
                fontSize = 21.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "HS কোড, রেফারেন্স মূল্য তালিকা ও স্মার্ট বাণিজ্য যোগাযোগ",
                color = TradeCyan,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(10.dp))

            commodities.chunked(2).forEach { rowItems ->
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 6.dp)
                ) {
                    rowItems.forEach { item: AynaTradeCommodityItem ->
                        val active = selectedCommodity.code == item.code
                        FilterChip(
                            selected = active,
                            onClick = { selectedCommodity = item },
                            label = {
                                Text(
                                    text = "${item.nameBn.substringBefore(" (")} ($${item.referencePriceUsd})",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                containerColor = TradeDarkBg,
                                labelColor = TradeGoldBright,
                                selectedContainerColor = TradeGoldBorder,
                                selectedLabelColor = TradeDarkBg
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (rowItems.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }

            Card(
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = TradeDarkBg),
                border = BorderStroke(1.5.dp, TradeCyan),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = "${selectedCommodity.nameBn} • HS ${selectedCommodity.hsCode}",
                        color = TradeGoldBright,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "ধারা: ${selectedCommodity.flowType} • দর: $${selectedCommodity.referencePriceUsd} (${selectedCommodity.unitLabel})",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "অঞ্চল: ${selectedCommodity.partnerRegion} • যোগাযোগ: ${selectedCommodity.contactChannel}",
                        color = TradeCyan,
                        fontSize = 13.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = quantityInput,
                onValueChange = { quantityInput = it },
                label = { Text("পরিমাণ (${selectedCommodity.unitLabel})", color = TradeGoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = counterpartyInput,
                onValueChange = { counterpartyInput = it },
                label = { Text("যোগাযোগের পক্ষ / ক্রেতা বা সাপ্লায়ার", color = TradeGoldBright, fontSize = 14.sp) },
                textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(10.dp))

            Button(
                enabled = !isProcessing,
                onClick = {
                    scope.launch {
                        isProcessing = true
                        try {
                            val qty = quantityInput.toDoubleOrNull() ?: 1.0
                            aiOutput = engine.analyzeTradeAndContactWithAi(
                                commodity = selectedCommodity,
                                quantity = qty,
                                contactCounterparty = counterpartyInput,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth,
                                allCommodities = commodities
                            )
                        } finally {
                            isProcessing = false
                        }
                    }
                },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = TradeGoldBorder,
                    contentColor = TradeDarkBg
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isProcessing) "AI বিশ্লেষণ চলছে..." else "🤖 মূল্য বিশ্লেষণ ও যোগাযোগ বার্তা তৈরি করুন",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }

            aiOutput?.let { out ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "📊 মূল্য ও বাণিজ্য বিশ্লেষণ (${out.updatedAtLabel}):",
                    color = TradeGoldBright,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = out.priceAnalysisBn,
                    color = Color.White,
                    fontSize = 15.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "✉️ যোগাযোগের খসড়া বার্তা:",
                    color = TradeCyan,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = out.contactMessageDraftBn,
                    color = TradeGoldBright,
                    fontSize = 15.sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { onSendContactToMessenger(out.contactMessageDraftBn) },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = TradeDarkBg,
                        contentColor = TradeCyan
                    ),
                    border = BorderStroke(2.dp, TradeCyan),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "💬 AYNA MESSENGER-এ পাঠান",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }
        }
    }
}