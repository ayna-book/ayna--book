package com.aynabook.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.data.isCurrentUserAdmin
import com.aynabook.app.data.submitModerationReview
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.launch

private val ModNavyBg = Color(0xFF050A18)
private val ModCardBg = Color(0xFF0A1636)
private val ModHighlightCardBg = Color(0xFF102554)
private val ModGoldBright = Color(0xFFFFF6B3)
private val ModGoldBorder = Color(0xFFFFE64D)
private val ModCyan = Color(0xFF38F2FF)

private val ModerationDecisions = listOf("warned", "dismissed", "removed")

data class AynaPostReportItem(
    val postId: String = "",
    val reportId: String = "",
    val reporterUid: String = "",
    val reason: String = "",
    val createdAt: Long = 0L,
    val status: String = "pending",
    val decision: String = "",
    val note: String = ""
)

@Composable
fun ModerationScreen(
    initialPostId: String = "",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    val coroutineScope = rememberCoroutineScope()
    val currentUid = auth.currentUser?.uid
    val cleanInitialPostId = initialPostId.trim()

    var checkingAdmin by remember { mutableStateOf(true) }
    var isAdmin by remember { mutableStateOf(false) }
    var baseUrlInput by remember { mutableStateOf(apiBaseUrl) }
    var reports by remember { mutableStateOf<List<AynaPostReportItem>>(emptyList()) }
    var filterByInitialPost by remember { mutableStateOf(cleanInitialPostId.isNotEmpty()) }
    var statusBanner by remember { mutableStateOf("অ্যাডমিন যাচাই করা হচ্ছে...") }
    var activeReviewKey by remember { mutableStateOf<String?>(null) }

    val selectedDecisions = remember { mutableStateMapOf<String, String>() }
    val reviewNotes = remember { mutableStateMapOf<String, String>() }
    val notifyReporters = remember { mutableStateMapOf<String, Boolean>() }

    LaunchedEffect(cleanInitialPostId) {
        filterByInitialPost = cleanInitialPostId.isNotEmpty()
    }

    LaunchedEffect(currentUid) {
        checkingAdmin = true
        if (currentUid == null) {
            isAdmin = false
            reports = emptyList()
            checkingAdmin = false
            statusBanner = "মডারেশন প্যানেল ব্যবহার করতে অনুগ্রহ করে লগইন করুন।"
            return@LaunchedEffect
        }

        val adminFlag = isCurrentUserAdmin(auth = auth, database = database)
        isAdmin = adminFlag
        checkingAdmin = false

        if (!adminFlag) {
            reports = emptyList()
            statusBanner = "অ্যাক্সেস সীমাবদ্ধ: এই অ্যাকাউন্ট অ্যাডমিন হিসেবে অনুমোদিত নয়।"
        } else {
            statusBanner = "অ্যাডমিন অনুমোদিত। রিপোর্ট কিউ লোড হচ্ছে..."
        }
    }

    DisposableEffect(currentUid, isAdmin) {
        if (currentUid == null || !isAdmin) {
            onDispose {}
        } else {
            val reportsRef = database.getReference("postReports")
            val listener = object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val parsed = mutableListOf<AynaPostReportItem>()
                    for (postSnap in snapshot.children) {
                        val postId = postSnap.key ?: continue
                        for (repSnap in postSnap.children) {
                            val reportId = repSnap.key ?: continue
                            val reporterUid = repSnap.child("reporterUid").getValue(String::class.java) ?: ""
                            val reason = repSnap.child("reason").getValue(String::class.java) ?: ""
                            val createdAt = repSnap.child("createdAt").getValue(Long::class.java) ?: 0L
                            val status = repSnap.child("status").getValue(String::class.java) ?: "pending"
                            val decision = repSnap.child("decision").getValue(String::class.java) ?: ""
                            val note = repSnap.child("note").getValue(String::class.java) ?: ""

                            val itemKey = "$postId::$reportId"
                            if (!selectedDecisions.containsKey(itemKey)) {
                                selectedDecisions[itemKey] =
                                    if (decision in ModerationDecisions) decision else "warned"
                            }
                            if (!reviewNotes.containsKey(itemKey)) {
                                reviewNotes[itemKey] = note
                            }
                            if (!notifyReporters.containsKey(itemKey)) {
                                notifyReporters[itemKey] = false
                            }

                            parsed.add(
                                AynaPostReportItem(
                                    postId = postId,
                                    reportId = reportId,
                                    reporterUid = reporterUid,
                                    reason = reason,
                                    createdAt = createdAt,
                                    status = status,
                                    decision = decision,
                                    note = note
                                )
                            )
                        }
                    }
                    reports = parsed.sortedWith(
                        compareByDescending<AynaPostReportItem> {
                            cleanInitialPostId.isNotEmpty() && it.postId == cleanInitialPostId
                        }.thenByDescending { it.createdAt }
                    )
                    statusBanner = if (cleanInitialPostId.isNotEmpty()) {
                        val matchCount = reports.count { it.postId == cleanInitialPostId }
                        "মোট ${reports.size}টি রিপোর্ট (টার্গেট Post $cleanInitialPostId: $matchCountটি)।"
                    } else {
                        "মোট ${reports.size}টি পোস্ট রিপোর্ট পাওয়া গেছে।"
                    }
                }

                override fun onCancelled(error: DatabaseError) {
                    statusBanner = "রিপোর্ট লোড করা যায়নি: ${error.message}"
                }
            }

            reportsRef.addValueEventListener(listener)
            onDispose {
                reportsRef.removeEventListener(listener)
            }
        }
    }

    val visibleReports = remember(reports, filterByInitialPost, cleanInitialPostId) {
        if (filterByInitialPost && cleanInitialPostId.isNotEmpty()) {
            reports.filter { it.postId == cleanInitialPostId }
        } else {
            reports
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ModNavyBg)
            .padding(16.dp)
    ) {
        Text(
            text = "🛡️ AYNA MODERATION",
            color = ModGoldBright,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = baseUrlInput,
            onValueChange = { baseUrlInput = it },
            label = { Text("Backend API Base URL", color = ModGoldBright, fontSize = 16.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 18.sp),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        if (cleanInitialPostId.isNotEmpty()) {
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = { filterByInitialPost = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (filterByInitialPost) ModGoldBorder else ModCardBg,
                        contentColor = if (filterByInitialPost) ModNavyBg else ModGoldBright
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "🎯 শুধু Post: $cleanInitialPostId",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }
                Button(
                    onClick = { filterByInitialPost = false },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (!filterByInitialPost) ModGoldBorder else ModCardBg,
                        contentColor = if (!filterByInitialPost) ModNavyBg else ModGoldBright
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = "📋 সব রিপোর্ট (${reports.size})",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.ExtraBold,
                        maxLines = 1
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = ModCardBg),
            border = BorderStroke(2.dp, ModCyan),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(
                text = statusBanner,
                color = ModGoldBright,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(14.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (checkingAdmin) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                CircularProgressIndicator(color = ModGoldBorder)
            }
            return@Column
        }

        if (!isAdmin) {
            Card(
                colors = CardDefaults.cardColors(containerColor = ModCardBg),
                border = BorderStroke(2.dp, ModGoldBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "শুধুমাত্র অনুমোদিত অ্যাডমিনরা (admins/\$uid === true) পোস্ট রিপোর্ট রিভিউ করতে পারবেন।",
                    color = Color.White,
                    fontSize = 19.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }
            return@Column
        }

        if (visibleReports.isEmpty()) {
            Card(
                colors = CardDefaults.cardColors(containerColor = ModCardBg),
                border = BorderStroke(2.dp, ModGoldBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (filterByInitialPost && cleanInitialPostId.isNotEmpty()) {
                        "Post ID ($cleanInitialPostId)-এর জন্য কোনো রিপোর্ট পাওয়া যায়নি।"
                    } else {
                        "বর্তমানে কোনো পোস্ট রিপোর্ট নেই।"
                    },
                    color = Color.White,
                    fontSize = 18.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }
            return@Column
        }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(visibleReports, key = { "${it.postId}::${it.reportId}" }) { item ->
                val isTargetPost = cleanInitialPostId.isNotEmpty() && item.postId == cleanInitialPostId
                val itemKey = "${item.postId}::${item.reportId}"
                val chosenDecision = selectedDecisions[itemKey] ?: "warned"
                val chosenNote = reviewNotes[itemKey] ?: ""
                val shouldNotifyReporter = notifyReporters[itemKey] ?: false
                val isSubmittingThis = activeReviewKey == itemKey

                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = if (isTargetPost) ModHighlightCardBg else ModCardBg
                    ),
                    border = BorderStroke(
                        width = if (isTargetPost) 3.dp else 2.dp,
                        color = if (isTargetPost) ModCyan else ModGoldBorder
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        if (isTargetPost) {
                            Text(
                                text = "🎯 নোটিফিকেশন টার্গেট পোস্ট",
                                color = ModCyan,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                        }
                        Text(
                            text = "Post ID: ${item.postId}",
                            color = ModGoldBright,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Text(
                            text = "Report ID: ${item.reportId}",
                            color = ModCyan,
                            fontSize = 15.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "কারণ: ${item.reason.ifBlank { "উল্লেখ নেই" }}",
                            color = Color.White,
                            fontSize = 19.sp
                        )
                        Text(
                            text = "স্ট্যাটাস: ${item.status}${if (item.decision.isNotBlank()) " (${item.decision})" else ""}",
                            color = ModGoldBright,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            ModerationDecisions.forEach { option ->
                                val selected = chosenDecision == option
                                Button(
                                    enabled = !isSubmittingThis && activeReviewKey == null,
                                    onClick = { selectedDecisions[itemKey] = option },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (selected) ModGoldBorder else ModNavyBg,
                                        contentColor = if (selected) ModNavyBg else ModGoldBright
                                    ),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text(
                                        text = option,
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = chosenNote,
                            onValueChange = { reviewNotes[itemKey] = it },
                            enabled = !isSubmittingThis && activeReviewKey == null,
                            placeholder = {
                                Text("মডারেটর নোট (ঐচ্ছিক)...", color = Color.LightGray, fontSize = 16.sp)
                            },
                            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 18.sp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = shouldNotifyReporter,
                                enabled = !isSubmittingThis && activeReviewKey == null,
                                onCheckedChange = { notifyReporters[itemKey] = it },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = ModGoldBorder,
                                    checkmarkColor = ModNavyBg,
                                    uncheckedColor = ModGoldBright
                                )
                            )
                            Text(
                                text = "রিপোর্টারকে FCM নোটিফিকেশন পাঠান",
                                color = ModGoldBright,
                                fontSize = 17.sp
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Button(
                            enabled = !isSubmittingThis && activeReviewKey == null,
                            onClick = {
                                coroutineScope.launch {
                                    activeReviewKey = itemKey
                                    statusBanner = "রিপোর্ট (${item.reportId}) রিভিউ পাঠানো হচ্ছে..."
                                    try {
                                        val res = submitModerationReview(
                                            postId = item.postId,
                                            reportId = item.reportId,
                                            decision = chosenDecision,
                                            note = chosenNote,
                                            notifyReporter = shouldNotifyReporter,
                                            apiBaseUrl = baseUrlInput,
                                            auth = auth
                                        )
                                        statusBanner =
                                            "রিভিউ সম্পন্ন (${res.decision}) • Author FCM: ${res.authorFcmSent}, Reporter FCM: ${res.reporterFcmSent}"
                                    } catch (e: Exception) {
                                        statusBanner = "রিভিউ ব্যর্থ: ${e.message ?: "ত্রুটি ঘটেছে"}"
                                    } finally {
                                        activeReviewKey = null
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = ModGoldBorder,
                                contentColor = ModNavyBg
                            ),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = if (isSubmittingThis) "পাঠানো হচ্ছে..." else "✅ রিভিউ ও FCM পাঠান",
                                fontSize = 19.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                }
            }
        }
    }
}