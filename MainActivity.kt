package com.aynabook.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.data.isCurrentUserAdmin
import com.aynabook.app.notifications.AynaFirebaseMessagingService
import com.aynabook.app.ui.screens.AuthScreen
import com.aynabook.app.ui.screens.HomeScreen
import com.aynabook.app.ui.screens.MessagingScreen
import com.aynabook.app.ui.screens.ModerationScreen
import com.aynabook.app.ui.screens.PostScreen
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.database.FirebaseDatabase

private val AppNavyBg = Color(0xFF050A18)
private val AppNavyBar = Color(0xFF0A1636)
private val AppGoldBright = Color(0xFFFFF6B3)
private val AppGoldBorder = Color(0xFFFFE64D)

private enum class AynaRoute {
    HOME, MESSENGER, POST, MODERATION
}

private data class AynaNotificationTarget(
    val route: String = "",
    val postId: String = "",
    val nonce: Int = 0
)

class MainActivity : ComponentActivity() {
    private var notificationTargetState by mutableStateOf(AynaNotificationTarget())
    private var targetCounter = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        consumeNotificationIntent(intent)

        val auth = FirebaseAuth.getInstance()
        val database = FirebaseDatabase.getInstance()

        setContent {
            var currentUser by remember { mutableStateOf<FirebaseUser?>(auth.currentUser) }
            var currentRoute by remember { mutableStateOf(AynaRoute.HOME) }
            var isAdmin by remember { mutableStateOf(false) }

            fun selectRouteManually(route: AynaRoute) {
                currentRoute = route
                if (notificationTargetState.postId.isNotEmpty() || notificationTargetState.route.isNotEmpty()) {
                    notificationTargetState = notificationTargetState.copy(
                        route = "",
                        postId = ""
                    )
                }
            }

            DisposableEffect(auth) {
                val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
                    currentUser = firebaseAuth.currentUser
                }
                auth.addAuthStateListener(listener)
                onDispose { auth.removeAuthStateListener(listener) }
            }

            LaunchedEffect(currentUser?.uid) {
                if (currentUser == null) {
                    isAdmin = false
                    currentRoute = AynaRoute.HOME
                    return@LaunchedEffect
                }

                AynaFirebaseMessagingService.registerCurrentDeviceToken(
                    auth = auth,
                    database = database
                )

                val adminStatus = isCurrentUserAdmin(auth = auth, database = database)
                isAdmin = adminStatus
                if (!adminStatus && currentRoute == AynaRoute.MODERATION) {
                    currentRoute = AynaRoute.HOME
                }
            }

            LaunchedEffect(currentUser?.uid, isAdmin, notificationTargetState.nonce) {
                val target = notificationTargetState
                if (currentUser == null || target.route.isBlank()) return@LaunchedEffect

                val normalizedRoute = target.route.trim().lowercase()
                when (normalizedRoute) {
                    "reports", "moderation" -> {
                        if (isAdmin) {
                            currentRoute = AynaRoute.MODERATION
                        } else {
                            currentRoute = AynaRoute.HOME
                        }
                    }
                    "messages", "messenger", "chat" -> {
                        currentRoute = AynaRoute.MESSENGER
                    }
                    "post", "create_post" -> {
                        currentRoute = AynaRoute.POST
                    }
                    "feed", "home" -> {
                        currentRoute = AynaRoute.HOME
                    }
                }
            }

            if (currentUser == null) {
                AuthScreen(
                    auth = auth,
                    onAuthSuccess = { user ->
                        currentUser = user
                        currentRoute = AynaRoute.HOME
                        AynaFirebaseMessagingService.registerCurrentDeviceToken(
                            auth = auth,
                            database = database
                        )
                    }
                )
            } else {
                Scaffold(
                    containerColor = AppNavyBg,
                    topBar = {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(AppNavyBar)
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "⚡ AYNA BOOK",
                                color = AppGoldBright,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                            TextButton(onClick = { auth.signOut() }) {
                                Text(
                                    text = "লগআউট",
                                    color = AppGoldBorder,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    },
                    bottomBar = {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(AppNavyBar)
                                .padding(8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            NavTabButton(
                                label = "🏠 ফিড",
                                selected = currentRoute == AynaRoute.HOME,
                                modifier = Modifier.weight(1f),
                                onClick = { selectRouteManually(AynaRoute.HOME) }
                            )
                            NavTabButton(
                                label = "💬 চ্যাট",
                                selected = currentRoute == AynaRoute.MESSENGER,
                                modifier = Modifier.weight(1f),
                                onClick = { selectRouteManually(AynaRoute.MESSENGER) }
                            )
                            NavTabButton(
                                label = "✍️ পোস্ট",
                                selected = currentRoute == AynaRoute.POST,
                                modifier = Modifier.weight(1f),
                                onClick = { selectRouteManually(AynaRoute.POST) }
                            )
                            if (isAdmin) {
                                NavTabButton(
                                    label = "🛡️ মডারেটর",
                                    selected = currentRoute == AynaRoute.MODERATION,
                                    modifier = Modifier.weight(1f),
                                    onClick = { selectRouteManually(AynaRoute.MODERATION) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        when (currentRoute) {
                            AynaRoute.HOME -> HomeScreen(database = database, auth = auth)
                            AynaRoute.MESSENGER -> MessagingScreen(database = database, auth = auth)
                            AynaRoute.POST -> PostScreen(
                                database = database,
                                auth = auth,
                                onPostPublished = { selectRouteManually(AynaRoute.HOME) }
                            )
                            AynaRoute.MODERATION -> {
                                if (isAdmin) {
                                    ModerationScreen(
                                        initialPostId = notificationTargetState.postId,
                                        database = database,
                                        auth = auth
                                    )
                                } else {
                                    HomeScreen(database = database, auth = auth)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        consumeNotificationIntent(intent)
    }

    private fun consumeNotificationIntent(intent: Intent?) {
        val extras = intent?.extras ?: return
        val route = extras.getString("ayna_route")
            ?: extras.getString("route")
            ?: return
        val postId = extras.getString("ayna_post_id")
            ?: extras.getString("postId")
            ?: ""

        targetCounter += 1
        notificationTargetState = AynaNotificationTarget(
            route = route,
            postId = postId,
            nonce = targetCounter
        )
    }
}

@Composable
private fun NavTabButton(
    label: String,
    selected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = if (selected) AppGoldBorder else AppNavyBg,
            contentColor = if (selected) AppNavyBg else AppGoldBright
        ),
        modifier = modifier
    ) {
        Text(
            text = label,
            fontSize = 15.sp,
            fontWeight = FontWeight.ExtraBold,
            maxLines = 1
        )
    }
}