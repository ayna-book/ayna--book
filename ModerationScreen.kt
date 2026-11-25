// প্রতিটি রিপোর্ট কার্ডের ভেতরে (যেমন review বাটনের আগে) এই ব্লকটি যুক্ত করুন:
var aiTriageResult by remember(itemKey) { mutableStateOf<AynaAiTriageResult?>(null) }
var isTriaging by remember(itemKey) { mutableStateOf(false) }

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
                if ((reviewNotes[itemKey] ?: "").isBlank() && triage.moderatorNote.isNotBlank()) {
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
    colors = ButtonDefaults.buttonColors(
        containerColor = ModNavyBg,
        contentColor = ModCyan
    ),
    border = BorderStroke(2.dp, ModCyan),
    modifier = Modifier.fillMaxWidth()
) {
    Text(
        text = if (isTriaging) "🧠 AI বিশ্লেষণ চলছে..." else "🧠 AI ঝুঁকি ও সারসংক্ষেপ যাচাই",
        fontSize = 16.sp,
        fontWeight = FontWeight.ExtraBold
    )
}

aiTriageResult?.let { t ->
    Spacer(modifier = Modifier.height(8.dp))
    Text(
        text = "🤖 Risk: ${t.riskScore}/100 (${t.category}) • প্রস্তাবনা: ${t.suggestedDecision}\n${t.summaryBn}",
        color = ModCyan,
        fontSize = 16.sp,
        fontWeight = FontWeight.Bold
    )
}