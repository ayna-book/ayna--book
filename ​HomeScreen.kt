package com.aynabook.app.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener

data class AynaFeedPost(
    val id: String = "",
    val authorName: String = "AYNA Member",
    val aynaId: String = "2026-----10000001",
    val caption: String = ""
)

@Composable
fun HomeScreen(
    onSignOut: () -> Unit = {}
) {
    val auth = remember { FirebaseAuth.getInstance() }
    val dbRef = remember {
        FirebaseDatabase.getInstance("https://ayna-book-default-rtdb.firebaseio.com").reference
    }

    val currentUid = auth.currentUser?.uid
    var currentAynaId by remember { mutableStateOf("2026-----10000001") }
    var breakingNews by remember {
        mutableStateOf("AYNA BOOK LIVE • SECURE IDENTITY & REALTIME NETWORK • 2026-----10000001")
    }
    var posts by remember {
        mutableStateOf(
            listOf(
                AynaFeedPost(
                    id = "1",
                    authorName = "AYNA BOOK Official",
                    aynaId = "2026-----10000001",
                    caption = "Verified golden frame identity with centered barcode."
                ),
                AynaFeedPost(
                    id = "2",
                    authorName = "ayna-book Node",
                    aynaId = "2026-----10000002",
                    caption = "Realtime encrypted feed active across AYNA BOOK."
                )
            )
        )
    }

    LaunchedEffect(currentUid) {
        if (currentUid != null) {
            dbRef.child("users").child(currentUid).child("aynaId")
                .addValueEventListener(object : ValueEventListener {
                    override fun onDataChange(snapshot: DataSnapshot) {
                        val fetchedId = snapshot.getValue(String::class.java)
                        if (!fetchedId.isNullOrBlank()) {
                            currentAynaId = fetchedId
                        }
                    }

                    override fun onCancelled(error: DatabaseError) {}
                })
        }

        dbRef.child("breakingNews").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val news = snapshot.getValue(String::class.java)
                if (!news.isNullOrBlank()) {
                    breakingNews = news
                }
            }

            override fun onCancelled(error: DatabaseError) {}
        })

        dbRef.child("posts").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                val loaded = mutableListOf<AynaFeedPost>()
                for (child in snapshot.children) {
                    val item = child.getValue(AynaFeedPost::class.java)
                    if (item != null) {
                        loaded.add(
                            item.copy(
                                id = item.id.ifBlank { child.key ?: "" },
                                aynaId = item.aynaId.ifBlank { "2026-----10000001" }
                            )
                        )
                    }
                }
                if (loaded.isNotEmpty()) {
                    posts = loaded.reversed()
                }
            }

            override fun onCancelled(error: DatabaseError) {}
        })
    }

    Scaffold(
        containerColor = Color(0xFF050505),
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF0B0B0B))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .border(1.5.dp, Color(0xFFD4AF37), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "AB",
                                color = Color(0xFFF7C948),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 15.sp
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = "AYNA BOOK",
                                color = Color(0xFFF7C948),
                                fontWeight = FontWeight.ExtraBold,
                                fontSize = 18.sp,
                                letterSpacing = 2.sp
                            )
                            Text(
                                text = "ID: $currentAynaId",
                                color = Color(0xFFB5B5B5),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    TextButton(
                        onClick = {
                            auth.signOut()
                            onSignOut()
                        }
                    ) {
                        Text(
                            text = "Sign Out",
                            color = Color(0xFFF7C948),
                            fontSize = 13.sp
                        )
                    }
                }

                SlowBreakingNewsTicker(newsText = breakingNews)
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            items(posts, key = { it.id }) { post ->
                GoldenFramedPostCard(post = post)
            }
        }
    }
}

@Composable
private fun SlowBreakingNewsTicker(newsText: String) {
    val infiniteTransition = rememberInfiniteTransition(label = "breaking_news")
    val progress by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = -1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 22000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "ticker_offset"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF151208))
            .border(0.5.dp, Color(0x55D4AF37))
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "BREAKING",
            color = Color(0xFF050505),
            fontSize = 10.sp,
            fontWeight = FontWeight.ExtraBold,
            modifier = Modifier
                .padding(start = 10.dp, end = 8.dp)
                .background(Color(0xFFF7C948), RoundedCornerShape(4.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        )

        BoxWithConstraints(
            modifier = Modifier
                .weight(1f)
                .clipToBounds()
        ) {
            val travelDistance = maxWidth.value * 1.4f
            Text(
                text = newsText,
                color = Color(0xFFF7C948),
                fontSize = 12.sp,
                maxLines = 1,
                softWrap = false,
                modifier = Modifier.offset(x = (progress * travelDistance).dp)
            )
        }
    }
}

@Composable
private fun GoldenFramedPostCard(post: AynaFeedPost) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF101010), RoundedCornerShape(14.dp))
            .border(1.dp, Color(0x55D4AF37), RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        Text(
            text = post.authorName,
            color = Color(0xFFF7C948),
            fontWeight = FontWeight.Bold,
            fontSize = 15.sp
        )

        if (post.caption.isNotBlank()) {
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = post.caption,
                color = Color(0xFFE0E0E0),
                fontSize = 13.sp
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // বর্গাকার সোনালি ফটো ফ্রেম
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(Color(0xFF070707), RoundedCornerShape(8.dp))
                .border(2.dp, Color(0xFFD4AF37), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "AB",
                color = Color(0x33F7C948),
                fontSize = 56.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 6.sp
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // নিচে মাঝখানে বারকোড ও AYNA ID
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            AynaIdBarcode(aynaId = post.aynaId)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = post.aynaId,
                color = Color(0xFFF7C948),
                fontSize = 12.sp,
                fontFamily = FontFamily.Monospace,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun AynaIdBarcode(aynaId: String) {
    Canvas(
        modifier = Modifier
            .width(190.dp)
            .height(34.dp)
            .background(Color(0xFFF5F5F5), RoundedCornerShape(4.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        val seedDigits = aynaId.filter { it.isDigit() }.ifEmpty { "202610000001" }
        val barCount = 36
        val step = size.width / barCount

        for (i in 0 until barCount) {
            val digitChar = seedDigits[i % seedDigits.length]
            val digitVal = digitChar.code
            val isThick = (digitVal + i) % 3 == 0
            val strokeWidth = if (isThick) step * 0.65f else step * 0.32f
            val x = i * step + (step * 0.5f)

            drawLine(
                color = Color(0xFF050505),
                start = Offset(x, 0f),
                end = Offset(x, size.height),
                strokeWidth = strokeWidth
            )
        }
    }
}