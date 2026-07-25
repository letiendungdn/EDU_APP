package com.edu.nihongo.presentation.kanji

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Undo
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.edu.nihongo.utils.TtsHelper

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KanjiDrawScreen(
    kanji: String,
    kana: String,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var current by remember { mutableStateOf<List<Offset>>(emptyList()) }
    var submitted by remember { mutableStateOf(false) }
    var correct by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Vẽ Kanji") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            if (strokes.isNotEmpty()) {
                                strokes.removeAt(strokes.lastIndex)
                                submitted = false
                            }
                        },
                        enabled = strokes.isNotEmpty(),
                    ) { Icon(Icons.Default.Undo, contentDescription = "Undo") }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(kanji, fontSize = 56.sp, color = MaterialTheme.colorScheme.primary)
            Text("（$kana）", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(8.dp))
            Text("Hãy vẽ chữ trên ô bên dưới")

            val borderColor = when {
                !submitted -> MaterialTheme.colorScheme.outlineVariant
                correct -> Color(0xFF16A34A)
                else -> Color(0xFFDC2626)
            }

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(vertical = 16.dp)
                    .border(2.dp, borderColor, RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(12.dp)),
            ) {
                Text(
                    kanji,
                    fontSize = 160.sp,
                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.15f),
                    modifier = Modifier.align(Alignment.Center),
                )
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .pointerInput(Unit) {
                            detectDragGestures(
                                onDragStart = { offset ->
                                    current = listOf(offset)
                                    submitted = false
                                },
                                onDrag = { change, _ ->
                                    change.consume()
                                    current = current + change.position
                                },
                                onDragEnd = {
                                    if (current.size > 2) strokes += current
                                    current = emptyList()
                                },
                            )
                        },
                ) {
                    val strokePaint = Stroke(width = 14f, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    (strokes + listOf(current)).forEach { stroke ->
                        if (stroke.size < 2) return@forEach
                        val path = Path().apply {
                            moveTo(stroke.first().x, stroke.first().y)
                            stroke.drop(1).forEach { lineTo(it.x, it.y) }
                        }
                        drawPath(path, color = Color(0xFF1D4ED8), style = strokePaint)
                    }
                }
            }

            if (submitted) {
                Text(
                    if (correct) "Tốt lắm! Tiếp tục luyện tập nhé" else "Chưa đủ nét — hãy thử lại!",
                    color = if (correct) Color(0xFF16A34A) else Color(0xFFDC2626),
                )
                Spacer(Modifier.height(8.dp))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                OutlinedButton(
                    onClick = {
                        strokes.clear()
                        submitted = false
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null)
                    Text(" Vẽ lại")
                }
                Button(
                    onClick = {
                        val total = strokes.sumOf { it.size }
                        correct = total > 20
                        submitted = true
                        if (correct) {
                            TtsHelper.init(context)
                            TtsHelper.speak(kana)
                        }
                    },
                    enabled = strokes.isNotEmpty(),
                    modifier = Modifier.weight(1f),
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Text(" Kiểm tra")
                }
            }
        }
    }
}
