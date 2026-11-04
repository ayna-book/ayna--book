
package com.aynabook.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
private val Pink = Color(0xFFFF4FA3)

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
                    .padding(18.dp),
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
                    color = Color.White,
                    fontSize = 14.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "স্বাগতম AYNA BOOK-এ",
                            color = Navy,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Connect. Create. Share. Protect.",
                            color = Pink,
                            fontSize = 16.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "আপনার পৃথিবী, আপনার গল্প, আপনার আয়না বুক।",
                            color = Navy,
                            fontSize = 16.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                val tabs = listOf(
                    "Home", "Profile", "Messages",
                    "Discover", "Settings"
                )

                tabs.forEach { tab ->
                    Button(
                        onClick = { selectedTab = tab },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor =
                                if (selectedTab == tab) Gold
                                else Color(0xFF18366D),
                            contentColor =
                                if (selectedTab == tab) Navy
                                else Color.White
                        )
                    ) {
                        Text(
                            text = tab,
                            fontSize = 17.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Selected: $selectedTab",
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
    }
}
