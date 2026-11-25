package com.aynabook.app.utility

import android.content.Context
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class AynaTradeCommodityItem(
    val code: String,
    val nameBn: String,
    val hsCode: String,
    val flowType: String,
    val unitLabel: String,
    val referencePriceUsd: Double,
    val partnerRegion: String,
    val contactChannel: String
)

data class AynaTradeAiOutput(
    val commodityCode: String,
    val commodityNameBn: String,
    val priceAnalysisBn: String,
    val contactMessageDraftBn: String,
    val updatedAtLabel: String,
    val fromColdBackup: Boolean = false
)

class AynaTradeAiEngine(context: Context) {
    private val coldFile = File(context.filesDir, "ayna_trade_cold.json")

    fun defaultCommodities(): List<AynaTradeCommodityItem> = listOf(
        AynaTradeCommodityItem(
            code = "RICE_BASMATI",
            nameBn = "চাল (রপ্তানি/আমদানি গ্রেড)",
            hsCode = "1006.30",
            flowType = "Import / Export",
            unitLabel = "প্রতি মেট্রিক টন (MT)",
            referencePriceUsd = 540.0,
            partnerRegion = "দক্ষিণ ও দক্ষিণ-পূর্ব এশিয়া",
            contactChannel = "trade-desk@aynabook.trade"
        ),
        AynaTradeCommodityItem(
            code = "RMG_APPAREL",
            nameBn = "তৈরি পোশাক (RMG নিট ও ওভেন)",
            hsCode = "6109.10",
            flowType = "Export",
            unitLabel = "প্রতি ডজন (Doz)",
            referencePriceUsd = 42.5,
            partnerRegion = "ইউরোপ ও উত্তর আমেরিকা",
            contactChannel = "export-rmg@aynabook.trade"
        ),
        AynaTradeCommodityItem(
            code = "CRUDE_OIL_BRENT",
            nameBn = "অপরিশোধিত জ্বালানি তেল (Reference)",
            hsCode = "2709.00",
            flowType = "Import",
            unitLabel = "প্রতি ব্যারেল (BBL)",
            referencePriceUsd = 76.0,
            partnerRegion = "মধ্যপ্রাচ্য ও বৈশ্বিক স্পট বাজার",
            contactChannel = "energy-import@aynabook.trade"
        ),
        AynaTradeCommodityItem(
            code = "EV_LFP_CELL",
            nameBn = "ইভি লিথিয়াম-আয়রন ব্যাটারি সেল",
            hsCode = "8507.60",
            flowType = "Import",
            unitLabel = "প্রতি kWh সমতুল্য",
            referencePriceUsd = 98.0,
            partnerRegion = "পূর্ব এশিয়া ও ইউরোপ",
            contactChannel = "ev-supply@aynabook.trade"
        ),
        AynaTradeCommodityItem(
            code = "RAW_COTTON",
            nameBn = "কাঁচা তুলা (Raw Cotton)",
            hsCode = "5201.00",
            flowType = "Import",
            unitLabel = "প্রতি মেট্রিক টন (MT)",
            referencePriceUsd = 1780.0,
            partnerRegion = "মধ্য এশিয়া, আফ্রিকা ও যুক্তরাষ্ট্র",
            contactChannel = "textile-raw@aynabook.trade"
        )
    )

    fun saveColdTradeState(
        commodities: List<AynaTradeCommodityItem>,
        lastOutput: AynaTradeAiOutput?
    ) {
        val arr = JSONArray()
        commodities.forEach { c ->
            arr.put(
                JSONObject().apply {
                    put("code", c.code)
                    put("nameBn", c.nameBn)
                    put("hsCode", c.hsCode)
                    put("flowType", c.flowType)
                    put("unitLabel", c.unitLabel)
                    put("referencePriceUsd", c.referencePriceUsd)
                    put("partnerRegion", c.partnerRegion)
                    put("contactChannel", c.contactChannel)
                }
            )
        }
        val root = JSONObject().apply {
            put("savedAtEpochMs", System.currentTimeMillis())
            put("commodities", arr)
            if (lastOutput != null) {
                put(
                    "lastOutput",
                    JSONObject().apply {
                        put("commodityCode", lastOutput.commodityCode)
                        put("commodityNameBn", lastOutput.commodityNameBn)
                        put("priceAnalysisBn", lastOutput.priceAnalysisBn)
                        put("contactMessageDraftBn", lastOutput.contactMessageDraftBn)
                        put("updatedAtLabel", lastOutput.updatedAtLabel)
                    }
                )
            }
        }
        coldFile.writeText(root.toString(2), Charsets.UTF_8)
    }

    fun loadColdTradeState(): Pair<List<AynaTradeCommodityItem>, AynaTradeAiOutput?> {
        val fallbackList = defaultCommodities()
        if (!coldFile.exists()) return fallbackList to null
        return try {
            val root = JSONObject(coldFile.readText(Charsets.UTF_8))
            val arr = root.optJSONArray("commodities")
            val loadedList = if (arr != null && arr.length() > 0) {
                val list = mutableListOf<AynaTradeCommodityItem>()
                for (i in 0 until arr.length()) {
                    val obj = arr.optJSONObject(i) ?: continue
                    list.add(
                        AynaTradeCommodityItem(
                            code = obj.optString("code", "ITEM_$i"),
                            nameBn = obj.optString("nameBn", "পণ্য"),
                            hsCode = obj.optString("hsCode", "0000.00"),
                            flowType = obj.optString("flowType", "Import / Export"),
                            unitLabel = obj.optString("unitLabel", "Unit"),
                            referencePriceUsd = obj.optDouble("referencePriceUsd", 0.0),
                            partnerRegion = obj.optString("partnerRegion", "Global"),
                            contactChannel = obj.optString("contactChannel", "trade@aynabook.trade")
                        )
                    )
                }
                if (list.isNotEmpty()) list else fallbackList
            } else {
                fallbackList
            }

            val lastObj = root.optJSONObject("lastOutput")
            val loadedOutput = lastObj?.let {
                AynaTradeAiOutput(
                    commodityCode = it.optString("commodityCode", ""),
                    commodityNameBn = it.optString("commodityNameBn", ""),
                    priceAnalysisBn = it.optString("priceAnalysisBn", ""),
                    contactMessageDraftBn = it.optString("contactMessageDraftBn", ""),
                    updatedAtLabel = it.optString("updatedAtLabel", ""),
                    fromColdBackup = true
                )
            }

            loadedList to loadedOutput
        } catch (_: Exception) {
            fallbackList to null
        }
    }

    suspend fun analyzeTradeAndContactWithAi(
        commodity: AynaTradeCommodityItem,
        quantity: Double = 10.0,
        contactCounterparty: String = "আন্তর্জাতিক সাপ্লায়ার ও লজিস্টিকস পার্টনার",
        customNote: String = "",
        apiBaseUrl: String = "http://10.0.2.2:3000",
        auth: FirebaseAuth = FirebaseAuth.getInstance(),
        allCommodities: List<AynaTradeCommodityItem> = defaultCommodities()
    ): AynaTradeAiOutput = withContext(Dispatchers.IO) {
        val safeQty = if (quantity > 0.0) quantity else 1.0
        val estimatedTotalUsd = commodity.referencePriceUsd * safeQty
        val nowLabel = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())

        val fallbackPriceAnalysis =
            "${commodity.nameBn} (HS ${commodity.hsCode}, ${commodity.flowType}): রেফারেন্স দর $${commodity.referencePriceUsd} ${commodity.unitLabel}। " +
                "$safeQty ইউনিটের আনুমানিক মূল্য $${"%.2f".format(Locale.US, estimatedTotalUsd)} USD। বাজারের চাহিদা, ফ্রেইট ও শুল্ক অনুযায়ী দর ওঠানামা করতে পারে।"

        val fallbackContactDraft =
            "শুভেচ্ছা $contactCounterparty, আমরা ${commodity.nameBn} (HS ${commodity.hsCode}, পরিমাণ: $safeQty ${commodity.unitLabel}) " +
                "বিষয়ে সর্বশেষ দর, শিপিং সময়সূচি এবং যোগাযোগের বিস্তারিত জানতে আগ্রহী। যোগাযোগ চ্যানেল: ${commodity.contactChannel}।"

        val aiResponse = try {
            askAynaModuleAI(
                module = "trade",
                action = "global_import_export_price_and_outreach",
                text = buildString {
                    append("Commodity: ${commodity.nameBn} (${commodity.code}), HS Code: ${commodity.hsCode}, Flow: ${commodity.flowType}. ")
                    append("Reference unit price: $${commodity.referencePriceUsd} per ${commodity.unitLabel}. ")
                    append("Quantity: $safeQty, Estimated subtotal: $${"%.2f".format(Locale.US, estimatedTotalUsd)} USD. ")
                    append("Region: ${commodity.partnerRegion}. Counterparty: $contactCounterparty. Contact: ${commodity.contactChannel}. ")
                    if (customNote.isNotBlank()) append("Note: $customNote.")
                },
                context = "Respond in Bengali with two clear parts separated by '---CONTACT---'. Part 1: concise commodity price & trade note. Part 2: polite business/trade contact message draft. No markdown asterisks.",
                apiBaseUrl = apiBaseUrl,
                auth = auth
            ).trim().replace("*", "").replace("#", "")
        } catch (_: Exception) {
            ""
        }

        val (pricePart, contactPart) = if (aiResponse.contains("---CONTACT---")) {
            val split = aiResponse.split("---CONTACT---", limit = 2)
            val p1 = split[0].trim().ifBlank { fallbackPriceAnalysis }
            val p2 = split[1].trim().ifBlank { fallbackContactDraft }
            p1 to p2
        } else if (aiResponse.isNotBlank()) {
            aiResponse.take(360) to fallbackContactDraft
        } else {
            fallbackPriceAnalysis to fallbackContactDraft
        }

        val output = AynaTradeAiOutput(
            commodityCode = commodity.code,
            commodityNameBn = commodity.nameBn,
            priceAnalysisBn = pricePart,
            contactMessageDraftBn = contactPart,
            updatedAtLabel = nowLabel,
            fromColdBackup = false
        )

        saveColdTradeState(allCommodities, output)
        output
    }
}