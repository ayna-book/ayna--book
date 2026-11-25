package com.aynabook.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aynabook.app.ui.screens.HomeScreen
import com.aynabook.app.ui.screens.MessagingScreen
import com.aynabook.app.ui.screens.ModerationScreen
import com.aynabook.app.ui.screens.PostScreen
import com.google.firebase.auth.FirebaseAuth

private enum class AynaRoute(val key: String) {
    HOME("home"),
    POST("post"),
    MESSENGER("messenger"),
    MODERATION("moderation");

    companion object {
        fun fromRaw(raw: String?): AynaRoute? {
            return when (raw?.trim()?.lowercase()) {
                "home", "ayna_home" -> HOME
                "post", "new_post", "ayna_post" -> POST
                "messenger", "chat", "aynamessenger", "ayna_messenger" -> MESSENGER
                "moderation", "mod", "reports", "ayna_moderation" -> MODERATION
                else -> null
            }
        }
    }
}

private data class AynaDeepLinkPayload(
    val route: AynaRoute?,
    val postId: String?,
    val nonce: Long
)

private val AynaDarkBg = Color(0xFF050A18)
private val AynaPanelBg = Color(0xFF0A1636)
private val AynaGoldBright = Color(0xFFFFF6B3)
private val AynaGoldBorder = Color(0xFFFFE64D)
private val AynaCyanAccent = Color(0xFF38F2FF)

class MainActivity : ComponentActivity() {

    private var deepLinkState by mutableStateOf(
        AynaDeepLinkPayload(route = null, postId = null, nonce = 0L)
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        captureDeepLinkIntent(intent, consumeExtras = true)

        setContent {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = AynaDarkBg
            ) {
                AynaBookAppRoot(
                    deepLinkPayload = deepLinkState,
                    onDeepLinkConsumed = {
                        deepLinkState = deepLinkState.copy(route = null, postId = null)
                    }
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        captureDeepLinkIntent(intent, consumeExtras = true)
    }

    private fun captureDeepLinkIntent(sourceIntent: Intent?, consumeExtras: Boolean) {
        if (sourceIntent == null) return

        val extras = sourceIntent.extras
        val rawRoute = extras?.getString("ayna_route")
            ?: sourceIntent.data?.getQueryParameter("ayna_route")
            ?: sourceIntent.data?.host

        val rawPostId = extras?.getString("ayna_post_id")
            ?: sourceIntent.data?.getQueryParameter("ayna_post_id")

        val resolvedRoute = AynaRoute.fromRaw(rawRoute)
            ?: if (!rawPostId.isNullOrBlank()) AynaRoute.MODERATION else null

        if (resolvedRoute != null || !rawPostId.isNullOrBlank()) {
            deepLinkState = AynaDeepLinkPayload(
                route = resolvedRoute,
                postId = rawPostId?.trim()?.takeIf { it.isNotEmpty() },
                nonce = System.nanoTime()
            )
        }

        if (consumeExtras) {
            sourceIntent.removeExtra("ayna_route")
            sourceIntent.removeExtra("ayna_post_id")
        }
    }
}

@Composable
private fun AynaBookAppRoot(
    deepLinkPayload: AynaDeepLinkPayload,
    onDeepLinkConsumed: () -> Unit,
    apiBaseUrl: String = "http://10.0.2.2:3000"
) {
    val auth = remember { FirebaseAuth.getInstance() }
    var currentRoute by remember { mutableStateOf(AynaRoute.HOME) }
    var focusedPostId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(deepLinkPayload.nonce, deepLinkPayload.route, deepLinkPayload.postId) {
        val targetRoute = deepLinkPayload.route
        val targetPostId = deepLinkPayload.postId

        if (targetRoute != null || !targetPostId.isNullOrBlank()) {
            if (!targetPostId.isNullOrBlank()) {
                focusedPostId = targetPostId
            }
            currentRoute = targetRoute ?: AynaRoute.MODERATION
            onDeepLinkConsumed()
        }
    }

    Scaffold(
        containerColor = AynaDarkBg,
        bottomBar = {
            AynaBottomNavBar(
                currentRoute = currentRoute,
                onSelectRoute = { route -> currentRoute = route }
            )
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(AynaDarkBg)
                .padding(innerPadding)
        ) {
            when (currentRoute) {
                AynaRoute.HOME -> {
                    HomeScreen(
                        apiBaseUrl = apiBaseUrl,
                        auth = auth,
                        onOpenNewPost = { currentRoute = AynaRoute.POST },
                        onOpenMessenger = { currentRoute = AynaRoute.MESSENGER },
                        onOpenModeration = { currentRoute = AynaRoute.MODERATION }
                    )
                }

                AynaRoute.POST -> {
                    PostScreen(
                        apiBaseUrl = apiBaseUrl,
                        auth = auth,
                        onPostPublished = { currentRoute = AynaRoute.HOME }
                    )
                }

                AynaRoute.MESSENGER -> {
                    MessagingScreen(
                        apiBaseUrl = apiBaseUrl,
                        auth = auth
                    )
                }

                AynaRoute.MODERATION -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        focusedPostId?.let { targetId ->
                            TargetedPostBanner(
                                postId = targetId,
                                onClearPostId = { focusedPostId = null }
                            )
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            ModerationScreen()
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TargetedPostBanner(
    postId: String,
    onClearPostId: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = AynaPanelBg),
        border = BorderStroke(2.dp, AynaCyanAccent),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "🎯 Deep-Link Post Target",
                    color = AynaCyanAccent,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Post ID: $postId",
                    color = AynaGoldBright,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Button(
                onClick = onClearPostId,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AynaGoldBorder,
                    contentColor = AynaDarkBg
                )
            ) {
                Text(
                    text = "ক্লিয়ার",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}

@Composable
private fun AynaBottomNavBar(
    currentRoute: AynaRoute,
    onSelectRoute: (AynaRoute) -> Unit
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier
            .fillMaxWidth()
            .background(AynaPanelBg)
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        val navItems = listOf(
            AynaRoute.HOME to "🏠 হোম",
            AynaRoute.POST to "✍️ পোস্ট",
            AynaRoute.MESSENGER to "💬 চ্যাট",
            AynaRoute.MODERATION to "🛡️ মড"
        )

        navItems.forEach { (route, label) ->
            val selected = currentRoute == route
            Button(
                onClick = { onSelectRoute(route) },
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (selected) AynaGoldBorder else AynaDarkBg,
                    contentColor = if (selected) AynaDarkBg else AynaGoldBright
                ),
                border = BorderStroke(
                    width = 2.dp,
                    color = if (selected) AynaGoldBorder else AynaCyanAccent.copy(alpha = 0.65f)
                ),
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = label,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1
                )
            }
        }
    }
}