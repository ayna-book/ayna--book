package com.aynabook.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.data.askAynaModuleAI
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import kotlinx.coroutines.launch

private val MsgNavyBg = Color(0xFF050A18)
private val MsgCardBg = Color(0xFF0A1636)
private val MsgGoldBright = Color(0xFFFFF6B3)
private val MsgGoldBorder = Color(0xFFFFE64D)
private val MsgCyan = Color(0xFF38F2FF)

private data class AynaChatMessage(
    val id: String = "",
    val senderUid: String = "",
    val senderName: String = "",
    val text: String = "",
    val createdAt: Long = 0L
)

@Composable
fun MessagingScreen(
    groupId: String = "global_ayna_room",
    apiBaseUrl: String = "http://10.0.2.2:3000",
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    val scope = rememberCoroutineScope()
    var messages by remember { mutableStateOf<List<AynaChatMessage>>(emptyList()) }
    var draft by remember { mutableStateOf("") }
    var aiThinking by remember { mutableStateOf(false) }
    var infoBanner by remember { mutableStateOf("AYNA MESSENGER যুক্ত আছে") }

    DisposableEffect(groupId) {
        val ref = database.getReference("groupMessages").child(groupId)
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<AynaChatMessage>()
                for (child in snapshot.children) {
                    list.add(
                        AynaChatMessage(
                            id = child.key ?: "",
                            senderUid = child.child("senderUid").getValue(String::class.java) ?: "",
                            senderName = child.child("senderName").getValue(String::class.java) ?: "Member",
                            text = child.child("text").getValue(String::class.java) ?: "",
                            createdAt = child.child("createdAt").getValue(Long::class.java) ?: 0L
                        )
                    )
                }
                messages = list.sortedBy { it.createdAt }.takeLast(50)
            }

            override fun onCancelled(error: DatabaseError) {
                infoBanner = "চ্যাট লোড ত্রুটি: ${error.message}"
            }
        }
        ref.addValueEventListener(listener)
        onDispose { ref.removeEventListener(listener) }
    }

    fun sendChatMessage(rawText: String, asAynaBot: Boolean = false) {
        val clean = rawText.trim()
        if (clean.isEmpty()) return
        val uid = auth.currentUser?.uid ?: return
        val senderName = if (asAynaBot) "🤖 @ayna AI" else (auth.currentUser?.email ?: uid)

        val msgRef = database.getReference("groupMessages").child(groupId).push()
        msgRef.setValue(
            mapOf<String, Any>(
                "senderUid" to uid,
                "senderName" to senderName,
                "text" to clean,
                "createdAt" to System.currentTimeMillis()
            )
        )
        if (!asAynaBot) draft = ""
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MsgNavyBg)
            .padding(14.dp)
    ) {
        Text(
            text = "💬 AYNA MESSENGER + @ayna AI",
            color = MsgGoldBright,
            fontSize = 23.sp,
            fontWeight = FontWeight.ExtraBold
        )
        Text(
            text = infoBanner,
            color = MsgCyan,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )

        Spacer(modifier = Modifier.height(10.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            items(messages, key = { it.id }) { m ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MsgCardBg),
                    border = BorderStroke(1.5.dp, MsgGoldBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = m.senderName,
                            color = MsgGoldBright,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = m.text,
                            color = Color.White,
                            fontSize = 18.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = draft,
            onValueChange = { draft = it },
            placeholder = { Text("মেসেজ বা @ayna প্রশ্ন লিখুন...", color = Color.LightGray, fontSize = 16.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 18.sp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Button(
                enabled = !aiThinking && draft.isNotBlank(),
                onClick = {
                    scope.launch {
                        aiThinking = true
                        infoBanner = "@ayna AI উত্তর তৈরি করছে..."
                        try {
                            val recentContext = messages.takeLast(8)
                                .joinToString("\n") { "${it.senderName}: ${it.text}" }
                            val aiReply = askAynaModuleAI(
                                module = "messenger",
                                action = "chat_reply",
                                text = draft,
                                context = recentContext,
                                apiBaseUrl = apiBaseUrl,
                                auth = auth
                            )
                            sendChatMessage(aiReply, asAynaBot = true)
                            infoBanner = "@ayna AI উত্তর পাঠিয়েছে।"
                        } catch (e: Exception) {
                            infoBanner = "AI ত্রুটি: ${e.message ?: "ব্যর্থ"}"
                        } finally {
                            aiThinking = false
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MsgCardBg,
                    contentColor = MsgCyan
                ),
                border = BorderStroke(2.dp, MsgCyan),
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = if (aiThinking) "ভাবছে..." else "🤖 @ayna উত্তর",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }

            Button(
                enabled = draft.isNotBlank(),
                onClick = { sendChatMessage(draft, asAynaBot = false) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MsgGoldBorder,
                    contentColor = MsgNavyBg
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "📤 পাঠান",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }
        }
    }
}