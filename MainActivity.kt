
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
import androidx.compose.ui.text.style.TextAlign
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

    var selectedPage by remember {
        mutableStateOf("Home")
    }

    MaterialTheme {
        Scaffold(
            containerColor = Navy,
            bottomBar = {
                NavigationBar(
                    containerColor = Color(0xFF102957)
                ) {
                    val pages = listOf(
                        "Home",
                        "Discover",
                        "Messages",
                        "Profile"
                    )

                    pages.forEach { page ->
                        NavigationBarItem(
                            selected = selectedPage == page,
                            onClick = {
                                selectedPage = page
                            },
                            icon = {
                                Text(
                                    when (page) {
                                        "Home" -> "⌂"
                                        "Discover" -> "◎"
                                        "Messages" -> "✉"
                                        else -> "●"
                                    },
                                    fontSize = 20.sp
                                )
                            },
                            label = {
                                Text(page)
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Gold,
                                selectedTextColor = Gold,
                                indicatorColor = Navy,
                                unselectedIconColor = White,
                                unselectedTextColor = White
                            )
                        )
                    }
                }
            }
        ) { padding ->

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Navy)
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                Spacer(modifier = Modifier.height(35.dp))

                Text(
                    text = "AYNA BOOK",
                    color = Gold,
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = "আমার পৃথিবী আমার গল্প আমার আয়না বুক",
                    color = White,
                    fontSize = 15.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(35.dp))

                Text(
                    text = selectedPage,
                    color = Gold,
                    fontSize = 25.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(20.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF173568)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                       Text(
                            text = "Welcome to AYNA BOOK 🌍",
                            color = White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(
                            modifier = Modifier.height(12.dp)
                        )

                        Text(
                            text = "Connect. Create. Share. Protect.",
                            color = Gold,
                            fontSize = 15.sp
                        )

                        Spacer(
                            modifier = Modifier.height(12.dp)
                        )

                        Text(
                            text = "Your world, your story, your AYNA BOOK.",
                            color = White,
                            fontSize = 14.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(25.dp))

                Button(
                    onClick = {
                        selectedPage = "Discover"
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Gold,
                        contentColor = Navy
                    )
                ) {
                    Text(
                        text = "Explore AYNA BOOK",
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                Text(
                    text = "Founder: Mohammad Mahbub Alam",
                    color = White,
                    fontSize = 12.sp
                )
            }
        }
    }
}
