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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.data.AynaAiTriageResult
import com.aynabook.app.data.runReportAiTriage
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

private val ModDarkBg = Color(0xFF050A18)
private val ModCardBg = Color(0xFF0A1636)
private val ModGoldBright = Color(0xFFFFF6B3)
private val ModGoldBorder = Color(0xFFFFE64D)
private val ModCyanAccent = Color(0xFF38F2FF)

private val ModerationDecisions = listOf("dismissed", "warned", "removed")

private data class ModerationReportQueueItem(
    val postId: String,
    val reportId: String,
    val reason: String,
    val status: String,
    val decision: String?,
    val note: String?,
    val reviewedAt: Long?
)

private suspend fun fetchFreshIdToken(auth: FirebaseAuth): String {
    val user = auth.currentUser ?: throw IllegalStateException("লগইন করা ইউজার পাওয়া যায়নি।")
    return suspendCancellableCoroutine { cont ->
        user.getIdToken(true)
            .addOnSuccessListener { result ->
                val token = result.token
                if (!token.isNullOrBlank() && cont.isActive) {
                    cont.resume(token)
                } else if (cont.isActive) {
                    cont.resumeWithException(IllegalStateException("খালি Firebase ID টোকেন পাওয়া গেছে।"))
                }
            }
            .addOnFailureListener { err ->
                if (cont.isActive) {
                    cont.resumeWithException(err)
                }
            }
    }
}

private suspend fun submitReportReviewApi(
    baseUrl: String,
    idToken: String,
    postId: String,
    reportId: String,
    decision: String,
    note: String,
    notifyReporter: Boolean = false
): JSONObject = withContext(Dispatchers.IO) {
    val normalizedBase = baseUrl.trim().trimEnd('/')
    val endpoint = URL("$normalizedBase/api/admin/reports/review")
    val conn = (endpoint.openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 20_000
        readTimeout = 20_000
        doOutput = true
        setRequestProperty("Content-Type", "application/json; charset=UTF-8")
        setRequestProperty("Authorization", "Bearer $idToken")
    }

    val payload = JSONObject().apply {
        put("postId", postId)
        put("reportId", reportId)
        put("decision", decision)
        put("note", note)
        put("notifyReporter", notifyReporter)
    }

    try {
        OutputStreamWriter(conn.outputStream, Charsets.UTF_8).use { writer ->
            writer.write(payload.toString())
            writer.flush()
        }
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        val bodyText = stream?.let {
            BufferedReader(InputStreamReader(it, Charsets.UTF_8)).use(BufferedReader::readText)
        }.orEmpty()
        val parsed = if (bodyText.isNotBlank()) JSONObject(bodyText) else JSONObject()
        if (code !in 200..299 || !parsed.optBoolean("ok", false)) {
            throw IllegalStateException(parsed.optString("error", "রিভিউ ব্যর্থ হয়েছে ($code)"))
        }
        parsed
    } finally {
        conn.disconnect()
    }
}

@Composable
fun ModerationScreen(
    initialPostId: String? = null,
    apiBaseUrl: String = "http://10.0.2.2:3000",
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance(),
    onClearInitialPostId: () -> Unit = {}
) {
    val coroutineScope = rememberCoroutineScope()
    var baseUrlInput by remember { mutableStateOf(apiBaseUrl) }
    var searchQuery by remember { mutableStateOf(initialPostId?.trim().orEmpty()) }
    var statusFilter by remember { mutableStateOf("all") }
    var reports by remember { mutableStateOf<List<ModerationReportQueueItem>>(emptyList()) }
    var statusBanner by remember { mutableStateOf("রিপোর্ট কিউ লোড হচ্ছে...") }
    var activeReviewKey by remember { mutableStateOf<String?>(null) }

    val selectedDecisions = remember { mutableStateMapOf<String, String>() }
    val reviewNotes = remember { mutableStateMapOf<String, String>() }

    LaunchedEffect(initialPostId) {
        val cleaned = initialPostId?.trim().orEmpty()
        if (cleaned.isNotEmpty()) {
            searchQuery = cleaned
            statusFilter = "all"
            statusBanner = "Post ID ফিল্টার সক্রিয়: $cleaned"
        }
    }

    DisposableEffect(database) {
        val reportsRef = database.getReference("postReports")
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val parsedItems = mutableListOf<ModerationReportQueueItem>()
                for (postSnap in snapshot.children) {
                    val postId = postSnap.key ?: continue
                    for (reportSnap in postSnap.children) {
                        val reportId = reportSnap.key ?: continue
                        val reason = reportSnap.child("reason").getValue(String::class.java) ?: "No reason provided"
                        val rawStatus = reportSnap.child("status").getValue(String::class.java) ?: "pending"
                        val normalizedStatus = if (rawStatus.equals("reviewed", ignoreCase = true)) {
                            "reviewed"
                        } else {
                            "pending"
                        }
                        val decision = reportSnap.child("decision").getValue(String::class.java)
                        val note = reportSnap.child("note").getValue(String::class.java)
                        val reviewedAt = reportSnap.child("reviewedAt").getValue(Long::class.java)

                        parsedItems.add(
                            ModerationReportQueueItem(
                                postId = postId,
                                reportId = reportId,
                                reason = reason,
                                status = normalizedStatus,
                                decision = decision,
                                note = note,
                                reviewedAt = reviewedAt
                            )
                        )
                    }
                }

                reports = parsedItems.sortedWith(
                    compareBy<ModerationReportQueueItem> { if (it.status == "pending") 0 else 1 }
                        .thenByDescending { it.reviewedAt ?: 0L }
                )

                for (item in parsedItems) {
                    val key = "${item.postId}/${item.reportId}"
                    if (!selectedDecisions.containsKey(key)) {
                        selectedDecisions[key] = item.decision ?: "warned"
                    }
                    if (!reviewNotes.containsKey(key) && !item.note.isNullOrBlank()) {
                        reviewNotes[key] = item.note
                    }
                }

                statusBanner = "মোট রিপোর্ট: ${parsedItems.size}টি"
            }

            override fun onCancelled(error: DatabaseError) {
                statusBanner = "রিপোর্ট লোড ত্রুটি: ${error.message}"
            }
        }
        reportsRef.addValueEventListener(listener)
        onDispose { reportsRef.removeEventListener(listener) }
    }

    val filteredReports = remember(reports, searchQuery, statusFilter) {
        val needle = searchQuery.trim().lowercase()
        reports.filter { item ->
            val matchesStatus = when (statusFilter) {
                "pending" -> item.status == "pending"
                "reviewed" -> item.status == "reviewed"
                else -> true
            }
            val matchesQuery = needle.isEmpty() ||
                item.postId.lowercase().contains(needle) ||
                item.reportId.lowercase().contains(needle) ||
                item.reason.lowercase().contains(needle)
            matchesStatus && matchesQuery
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ModDarkBg)
            .padding(14.dp)
    ) {
        Text(
            text = "🛡️ AYNA BOOK মডারেশন কিউ",
            color = ModGoldBright,
            fontSize = 24.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = statusBanner,
            color = ModCyanAccent,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = { Text("Post ID, Report ID বা Reason দিয়ে খুঁজুন", color = ModGoldBright, fontSize = 15.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 17.sp),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        if (searchQuery.isNotBlank() || !initialPostId.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = {
                        searchQuery = ""
                        onClearInitialPostId()
                        statusBanner = "ফিল্টার রিসেট করা হয়েছে।"
                    },
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = ModCardBg,
                        contentColor = ModGoldBright
                    ),
                    border = BorderStroke(1.5.dp, ModGoldBorder)
                ) {
                    Text(
                        text = "✕ ফিল্টার সাফ করুন",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            listOf("all" to "সব", "pending" to "Pending", "reviewed" to "Reviewed").forEach { (key, label) ->
                FilterChip(
                    selected = statusFilter == key,
                    onClick = { statusFilter = key },
                    label = {
                        Text(
                            text = label,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                    },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = ModCardBg,
                        labelColor = ModGoldBright,
                        selectedContainerColor = ModGoldBorder,
                        selectedLabelColor = ModDarkBg
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredReports, key = { "${it.postId}/${it.reportId}" }) { item ->
                val itemKey = "${item.postId}/${item.reportId}"
                val currentDecision = selectedDecisions[itemKey] ?: "warned"
                val currentNote = reviewNotes[itemKey].orEmpty()
                val isSubmitting = activeReviewKey == itemKey
                var aiTriageResult by remember(itemKey) { mutableStateOf<AynaAiTriageResult?>(null) }
                var isTriaging by remember(itemKey) { mutableStateOf(false) }

                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = ModCardBg),
                    border = BorderStroke(2.dp, ModGoldBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "Post: ${item.postId} • Report: ${item.reportId}",
                            color = ModGoldBright,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Status: ${item.status.uppercase()} • Reason: ${item.reason}",
                            color = Color.White,
                            fontSize = 16.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            ModerationDecisions.forEach { decisionOption ->
                                val isSelected = currentDecision == decisionOption
                                Button(
                                    onClick = { selectedDecisions[itemKey] = decisionOption },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (isSelected) ModGoldBorder else ModDarkBg,
                                        contentColor = if (isSelected) ModDarkBg else ModGoldBright
                                    ),
                                    border = BorderStroke(1.5.dp, ModGoldBorder),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = decisionOption,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = currentNote,
                            onValueChange = { reviewNotes[itemKey] = it },
                            label = { Text("মডারেটর নোট", color = ModGoldBright, fontSize = 14.sp) },
                            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 16.sp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            enabled = !isTriaging && activeReviewKey == null,
                            onClick = {
                                coroutineScope.launch {
                                    isTriaging = true
                                    statusBanner = "AI ঝুঁকি বিশ্লেষণ চলছে (${item.reportId})..."
                                    try {
                                        val triage = runReportAiTriage(
                                            postId = item.postId,
                                            reportId = item.reportId,
                                            apiBaseUrl = baseUrlInput,
                                            auth = auth
                                        )
                                        aiTriageResult = triage
                                        if (triage.suggestedDecision in ModerationDecisions) {
                                            selectedDecisions[itemKey] = triage.suggestedDecision
                                        }
                                        if (currentNote.isBlank() && triage.moderatorNote.isNotBlank()) {
                                            reviewNotes[itemKey] = triage.moderatorNote
                                        }
                                        statusBanner = "AI Risk: ${triage.riskScore}/100 • Suggested: ${triage.suggestedDecision}"
                                    } catch (e: Exception) {
                                        statusBanner = "AI ট্রায়াজ ব্যর্থ: ${e.message ?: "ত্রুটি"}"
                                    } finally {
                                        isTriaging = false
                                    }
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = ModDarkBg,
                                contentColor = ModCyanAccent
                            ),
                            border = BorderStroke(2.dp, ModCyanAccent),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (isTriaging) "🧠 AI বিশ্লেষণ চলছে..." else "🧠 AI ঝুঁকি ও সারসংক্ষেপ যাচাই",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }

                        aiTriageResult?.let { t ->
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "🤖 Risk: ${t.riskScore}/100 (${t.category}) • প্রস্তাবনা: ${t.suggestedDecision}\n${t.summaryBn}",
                                color = ModCyanAccent,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                            enabled = activeReviewKey == null,
                            onClick = {
                                coroutineScope.launch {
                                    activeReviewKey = itemKey
                                    statusBanner = "রিভিউ সাবমিট হচ্ছে (${item.reportId})..."
                                    try {
                                        val token = fetchFreshIdToken(auth)
                                        submitReportReviewApi(
                                            baseUrl = baseUrlInput,
                                            idToken = token,
                                            postId = item.postId,
                                            reportId = item.reportId,
                                            decision = currentDecision,
                                            note = currentNote,
                                            notifyReporter = false
                                        )
                                        statusBanner = "রিভিউ সম্পন্ন: ${item.reportId} -> $currentDecision"
                                    } catch (e: Exception) {
                                        statusBanner = "রিভিউ ব্যর্থ: ${e.message ?: "ত্রুটি"}"
                                    } finally {
                                        activeReviewKey = null
                                    }
                                }
                            },
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = ModGoldBorder,
                                contentColor = ModDarkBg
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (isSubmitting) "সাবমিট হচ্ছে..." else "✅ রিভিউ সম্পন্ন করুন",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                }
            }
        }
    }
}