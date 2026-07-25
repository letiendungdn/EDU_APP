package com.edu.nihongo.presentation.pronunciation

import android.Manifest
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.edu.nihongo.utils.TtsHelper
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import kotlin.math.min

@OptIn(ExperimentalMaterial3Api::class, ExperimentalPermissionsApi::class)
@Composable
fun PronunciationScreen(
    kana: String,
    meaning: String,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val micPermission = rememberPermissionState(Manifest.permission.RECORD_AUDIO)
    var listening by remember { mutableStateOf(false) }
    var recognized by remember { mutableStateOf("") }
    var score by remember { mutableFloatStateOf(-1f) }

    val recognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            SpeechRecognizer.createSpeechRecognizer(context)
        } else null
    }

    DisposableEffect(Unit) {
        TtsHelper.init(context)
        onDispose {
            recognizer?.destroy()
        }
    }

    fun calcScore(r: String, e: String): Float {
        val a = r.trim().replace(" ", "")
        val b = e.trim().replace(" ", "")
        if (b.isEmpty()) return 0f
        if (a == b) return 1f
        var matches = 0
        val n = min(a.length, b.length)
        for (i in 0 until n) if (a[i] == b[i]) matches++
        return matches.toFloat() / b.length
    }

    fun startListen() {
        val sr = recognizer ?: return
        if (!micPermission.status.isGranted) {
            micPermission.launchPermissionRequest()
            return
        }
        recognized = ""
        score = -1f
        listening = true
        sr.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onPartialResults(partialResults: Bundle?) {}
            override fun onEvent(eventType: Int, params: Bundle?) {}
            override fun onEndOfSpeech() { listening = false }
            override fun onError(error: Int) { listening = false }
            override fun onResults(results: Bundle?) {
                val text = results
                    ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    ?.firstOrNull()
                    .orEmpty()
                recognized = text
                score = calcScore(text, kana)
                listening = false
            }
        })
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ja-JP")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
        }
        sr.startListening(intent)
    }

    fun stopListen() {
        recognizer?.stopListening()
        listening = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Luyện phát âm") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(kana, style = MaterialTheme.typography.displayMedium)
                    Spacer(Modifier.height(8.dp))
                    Text(meaning, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(12.dp))
                    OutlinedButton(onClick = { TtsHelper.speak(kana) }) {
                        Icon(Icons.Default.VolumeUp, contentDescription = null)
                        Text("  Nghe mẫu")
                    }
                }
            }
            Spacer(Modifier.height(32.dp))
            FilledIconButton(
                onClick = { if (listening) stopListen() else startListen() },
                modifier = Modifier.size(88.dp),
            ) {
                Icon(
                    if (listening) Icons.Default.Stop else Icons.Default.Mic,
                    contentDescription = null,
                    modifier = Modifier.size(40.dp),
                )
            }
            Text(if (listening) "Đang nghe..." else "Bấm để nói")
            if (recognized.isNotEmpty()) {
                Spacer(Modifier.height(24.dp))
                Text("Bạn đọc:", style = MaterialTheme.typography.labelLarge)
                Text(recognized, style = MaterialTheme.typography.headlineSmall)
            }
            if (score >= 0f) {
                Spacer(Modifier.height(16.dp))
                val color = when {
                    score >= 0.8f -> Color(0xFF16A34A)
                    score >= 0.5f -> Color(0xFFEA580C)
                    else -> Color(0xFFDC2626)
                }
                Text("${(score * 100).toInt()}", style = MaterialTheme.typography.displaySmall, color = color)
                Text(
                    when {
                        score >= 0.9f -> "Xuất sắc!"
                        score >= 0.7f -> "Tốt lắm!"
                        score >= 0.5f -> "Khá ổn, luyện thêm nhé!"
                        else -> "Thử lại nha!"
                    },
                )
                Spacer(Modifier.height(12.dp))
                Button(onClick = { startListen() }) { Text("Thử lại") }
            }
        }
    }
}
