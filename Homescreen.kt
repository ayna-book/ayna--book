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

private val HomeNavyBg = Color(0xFF050A18)
private val HomeCardBg = Color(0xFF0A1636)
private val HomeGoldBright = Color(0xFFFFF6B3)
private val HomeGoldBorder = Color(0xFFFFE64D)
private val HomeCyan = Color(0xFF38F2FF)

data class AynaFeedPost(
    val id: String = "",
    val uid: String = "",
    val authorName: String = "AYNA Member",
    val text: String = "",
    val createdAt: Long = 0L
)

@Composable
fun HomeScreen(
    database: FirebaseDatabase = FirebaseDatabase.getInstance(),
    auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    val currentUid = auth.currentUser?.uid.orEmpty()
    var posts by remember { mutableStateOf<List<AynaFeedPost>>(emptyList()) }
    var searchText by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        database.getReference("posts").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val list = mutableListOf<AynaFeedPost>()
                for (child in snapshot.children) {
                    val id = child.key ?: continue
                    val uid = child.child("uid").getValue(String::class.java) ?: ""
                    val authorName = child.child("authorName").getValue(String::class.java) ?: "AYNA Member"
                    val text = child.child("text").getValue(String::class.java) ?: ""
                    val createdAt = child.child("createdAt").getValue(Long::class.java) ?: 0L
                    if (text.isNotBlank()) {
                        list.add(
                            AynaFeedPost(
                                id = id,
                                uid = uid,
                                authorName = authorName,
                                text = text,
                                createdAt = createdAt
                            )
                        )
                    }
                }
                posts = list.sortedByDescending { it.createdAt }
            }

            override fun onCancelled(error: DatabaseError) {}
        })
    }

    val visiblePosts = remember(posts, searchText) {
        val q = searchText.trim().lowercase()
        if (q.isEmpty()) posts
        else posts.filter {
            it.text.lowercase().contains(q) || it.authorName.lowercase().contains(q)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(HomeNavyBg)
            .padding(16.dp)
    ) {
        Text(
            text = "AYNA BOOK LIVE FEED",
            color = HomeGoldBright,
            fontSize = 26.sp,
            fontWeight = FontWeight.ExtraBold
        )

        Spacer(modifier = Modifier.height(10.dp))

        OutlinedTextField(
            value = searchText,
            onValueChange = { searchText = it },
            placeholder = { Text("পোস্ট বা লেখকের নাম খুঁজুন...", color = Color.LightGray, fontSize = 18.sp) },
            textStyle = LocalTextStyle.current.copy(color = Color.White, fontSize = 18.sp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(visiblePosts, key = { it.id }) { post ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = HomeCardBg),
                    border = BorderStroke(2.dp, HomeGoldBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = post.authorName,
                            color = HomeGoldBright,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = post.text,
                            color = Color.White,
                            fontSize = 21.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "ID: ${post.id}",
                                color = HomeCyan,
                                fontSize = 13.sp
                            )
                            if (currentUid.isNotEmpty() && post.uid == currentUid) {
                                TextButton(
                                    onClick = {
                                        database.getReference("posts").child(post.id).removeValue()
                                    }
                                ) {
                                    Text(
                                        text = "🗑️ ডিলিট",
                                        color = HomeGoldBright,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}