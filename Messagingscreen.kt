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
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.*

private val NavyDark = Color(0xFF050A18)
private val NavyCard = Color(0xFF0A1636)
private val GoldBright = Color(0xFFFFF6B3)
private val GoldBorder = Color(0xFFFFE64D)
private val CyanAccent = Color(0xFF38F2FF)

data class AynaGroupItem(
    val id: String = "",
    val platform: String = "AYNA MESSENGER",
    val name: String = ""
)

data class AynaGroupMessage(
    val id: String = "",
    val text: String = "",
    val sender: String = "AYNA Member",
    val uid: String = "",
    val time: Long = 0L
)

@Composable
fun MessagingScreen(
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    val currentUser = auth.currentUser
    var groups by remember { mutableStateOf<List<AynaGroupItem>>(emptyList()) }
    var selectedGroupId by remember { mutableStateOf("grp_ayna_msg_main") }
    var messages by remember { mutableStateOf<List<AynaGroupMessage>>(emptyList()) }
    var messageInput by remember { mutableStateOf("") }
    var searchQuery by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        database.getReference("aynaGroups").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val loaded = mutableListOf<AynaGroupItem>()
                for (child in snapshot.children) {
                    val id = child.key ?: continue
                    val platform = child.child("platform").getValue(String::class.java) ?: "AYNA BOOK"
                    val name = child.child("name").getValue(String::class.java) ?: "AYNA Group"
                    loaded.add(AynaGroupItem(id = id, platform = platform, name = name))
                }
                if (loaded.isNotEmpty()) {
                    groups = loaded
                    if (loaded.none { it.id == selectedGroupId }) {
                        selectedGroupId = loaded.first().id
                    }
                }
            }

            override fun onCancelled(error: DatabaseError) {}
        })
    }

    LaunchedEffect(selectedGroupId) {
        if (selectedGroupId.isBlank()) return@LaunchedEffect
        database.getReference("aynaGroupMessages").child(selectedGroupId)
            .addValueEventListener(object : ValueEventListener {
                override fun onDataChange(snapshot: DataSnapshot) {
                    val list = mutableListOf<AynaGroupMessage>()
                    for (child in snapshot.children) {
                        val id = child.key ?: continue
                        val text = child.child("text").getValue(String::class.java) ?: ""
                        val sender = child.child("sender").getValue(String::class.java) ?: "AYNA Member"
                        val uid = child.child("uid").getValue(String::class.java) ?: ""
                        val time = child.child("time").getValue(Long::class.java) ?: 0L
                        list.add(AynaGroupMessage(id = id, text = text, sender = sender, uid = uid, time = time))
                    }
                    messages = list.sortedByDescending { it.time }
                }

                override fun onCancelled(error: DatabaseError) {}
            })
    }

    val filteredMessages = remember(messages, searchQuery) {
        val q = searchQuery.trim().lowercase()
        if (q.isEmpty()) messages
        else messages.filter { it.text.lowercase().contains(q) || it.sender.lowercase().contains(q) }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(16.dp)
    ) {
        Text(
            text = "AYNA MESSENGER & GROUPS",
            color = GoldBright,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(10.dp))

        if (groups.isNotEmpty()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                groups.take(3).forEach { grp ->
                    val isSelected = grp.id == selectedGroupId
                    Button(
                        onClick = { selectedGroupId = grp.id },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) GoldBorder else NavyCard,
                            contentColor = if (isSelected) NavyDark else GoldBright
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = grp.name,
                            maxLines = 1,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("গ্রুপ বার্তা খুঁজুন...", color = Color.LightGray, fontSize = 18.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 18.sp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = messageInput,
            onValueChange = { messageInput = it },
            placeholder = { Text("বার্তা লিখুন...", color = Color.LightGray, fontSize = 18.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 20.sp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(8.dp))

        Button(
            onClick = {
                val clean = messageInput.trim()
                val uid = currentUser?.uid ?: return@Button
                if (clean.isNotEmpty() && selectedGroupId.isNotBlank()) {
                    val ref = database.getReference("aynaGroupMessages").child(selectedGroupId).push()
                    val payload = mapOf(
                        "text" to clean,
                        "sender" to (currentUser.displayName ?: currentUser.email ?: "AYNA Member"),
                        "uid" to uid,
                        "time" to System.currentTimeMillis()
                    )
                    ref.setValue(payload)
                    messageInput = ""
                }
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = GoldBorder,
                contentColor = NavyDark
            ),
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("বার্তা পাঠান", fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredMessages, key = { it.id }) { msg ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = NavyCard),
                    border = BorderStroke(2.dp, GoldBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = msg.text,
                            color = Color.White,
                            fontSize = 20.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${msg.sender} • ${msg.uid}",
                            color = CyanAccent,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}