package com.edu.nihongo.presentation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.edu.nihongo.presentation.camera.CameraTranslateScreen
import com.edu.nihongo.presentation.home.HomeScreen
import com.edu.nihongo.presentation.live.LiveHostScreen
import com.edu.nihongo.presentation.live.LiveListScreen
import com.edu.nihongo.presentation.live.LiveViewerScreen
import com.edu.nihongo.presentation.login.LoginScreen
import com.edu.nihongo.presentation.srs.SrsScreen
import com.edu.nihongo.presentation.vocab.VocabScreen

object Routes {
    const val HOME = "home"
    const val VOCAB = "vocab/{lesson}"
    const val SRS = "srs"
    const val LOGIN = "login"
    const val CAMERA = "camera-translate"
    const val LIVE = "live"
    const val LIVE_VIEWER = "live/viewer"
    const val LIVE_HOST = "live/host"

    fun vocab(lesson: Int) = "vocab/$lesson"
}

@Composable
fun NihongoApp() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.HOME) {
        composable(Routes.HOME) {
            HomeScreen(
                onVocab = { lesson -> navController.navigate(Routes.vocab(lesson)) },
                onSrs = { navController.navigate(Routes.SRS) },
                onLogin = { navController.navigate(Routes.LOGIN) },
                onCamera = { navController.navigate(Routes.CAMERA) },
                onLive = { navController.navigate(Routes.LIVE) },
            )
        }
        composable(
            route = Routes.VOCAB,
            arguments = listOf(navArgument("lesson") { type = NavType.IntType }),
        ) { entry ->
            val lesson = entry.arguments?.getInt("lesson") ?: 1
            VocabScreen(
                lessonNumber = lesson,
                onBack = { navController.popBackStack() },
            )
        }
        composable(Routes.SRS) {
            SrsScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.LOGIN) {
            LoginScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.CAMERA) {
            CameraTranslateScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.LIVE) {
            LiveListScreen(
                onBack = { navController.popBackStack() },
                onNavigateViewer = { navController.navigate(Routes.LIVE_VIEWER) },
                onNavigateHost = { navController.navigate(Routes.LIVE_HOST) },
            )
        }
        composable(Routes.LIVE_VIEWER) {
            LiveViewerScreen(onBack = { navController.popBackStack() })
        }
        composable(Routes.LIVE_HOST) {
            LiveHostScreen(onBack = { navController.popBackStack() })
        }
    }
}
