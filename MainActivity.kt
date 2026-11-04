
package com.aynabook.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val Navy = Color(0xFF071B49)
private val Gold = Color(0xFFFFD700)
private val White = Color.White

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AynaBookApp()
        }
    }
}

@Composable
fun AynaBookApp() {
    var selectedTab by remember { mutableStateOf("Home") }

    MaterialTheme {
        Scaffold(
            containerColor = Navy
        ) { padding ->

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "AYNA BOOK",
                    color = Gold,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "My World. My Story. My AYNA BOOK.",
                    color = White,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(5.dp)
                ) {
                    listOf("Home", "Post", "Profile", "Messages")
                        .forEach { tab ->
                            Button(
                                onClick = { selectedTab = tab },
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(3.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor =
                                        if (selectedTab == tab) Gold
                                        else Color(0xFF18366D),
                                    contentColor =
                                        if (selectedTab == tab) Navy
                                        else White
                                )
                            ) {
                                Text(tab, fontSize = 10.sp)
                            }
                        }
                }

                Spacer(modifier = Modifier.height(20.dp))

                when (selectedTab) {
                    "Home" -> HomeScreen()
                    "Post" -> PostScreen()
                    "Profile" -> SimpleScreen(
                        title = "আমার প্রোফাইল",
                        description = "আপনার ব্যক্তিগত প্রোফাইল এখানে তৈরি হবে।"
                    )
                    "Messages" -> MessagingScreen()
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Connect. Create. Share. Protect.",
                    color = Gold,
                    fontSize = 14.sp
                )
            }
        }
    }
}

@Composable
fun HomeScreen() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = White,
        shape = MaterialTheme.shapes.large
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = "স্বাগতম AYNA BOOK-এ",
                color = Navy,
                fontSize = 23.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "আপনার পৃথিবী, আপনার গল্প, আপনার আয়না বুক।",
                color = Color(0xFFFF4FA3),
                fontSize = 17.sp
            )

            Spacer(modifier = Modifier.height(18.dp))

            Text(
                text = "আপনার গল্প শেয়ার করতে Post নির্বাচন করুন।",
                color = Navy,
                fontSize = 15.sp
            )
        }
    }
}

@Composable
fun SimpleScreen(
    title: String,
    description: String
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = White,
        shape = MaterialTheme.shapes.large
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Text(
                text = title,
                color = Navy,
                fontSize = 23.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = description,
                color = Navy,
                fontSize = 16.sp
            )
        }
    }
}
