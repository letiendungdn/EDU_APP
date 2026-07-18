package com.edu.nihongo.presentation.srs

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.edu.nihongo.domain.entity.ReviewCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SrsScreen(
    onBack: () -> Unit,
    viewModel: SrsViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ôn tập SRS") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        when {
            uiState.isDone -> DoneScreen(
                uiState = uiState,
                onRestart = viewModel::resetSession,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            )

            uiState.cards.isEmpty() -> EmptyScreen(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            )

            else -> {
                val progress by remember(uiState.sessionTotal, uiState.cards.size) {
                    derivedStateOf {
                        val total = uiState.sessionTotal + uiState.cards.size
                        if (total > 0) uiState.sessionTotal.toFloat() / total.toFloat() else 0f
                    }
                }

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                ) {
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    SrsCardContent(
                        card = uiState.cards.first(),
                        onReviewed = viewModel::onCardReviewed,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

@Composable
private fun DoneScreen(
    uiState: SrsUiState,
    onRestart: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("🎉", style = MaterialTheme.typography.displayLarge)
        Spacer(Modifier.height(16.dp))
        Text("Hoàn thành!", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(8.dp))
        Text(
            "Đúng ${uiState.sessionCorrect}/${uiState.sessionTotal} thẻ",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(24.dp))
        Button(onClick = onRestart) {
            Text("Bắt đầu lại")
        }
    }
}

@Composable
private fun EmptyScreen(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("📚", style = MaterialTheme.typography.displayLarge)
        Spacer(Modifier.height(16.dp))
        Text(
            "Không có thẻ cần ôn hôm nay",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun SrsCardContent(
    card: ReviewCard,
    onReviewed: (ReviewCard, Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showAnswer by remember(card.card.id) { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clickable(enabled = !showAnswer) { showAnswer = true },
            elevation = CardDefaults.cardElevation(4.dp),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(card.kana, style = MaterialTheme.typography.displayMedium)
                card.kanji?.let {
                    Text(it, style = MaterialTheme.typography.headlineSmall)
                }
                Spacer(Modifier.height(16.dp))
                if (!showAnswer) {
                    Text(
                        "Chạm để xem đáp án",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                } else {
                    Text(card.meaning, style = MaterialTheme.typography.bodyLarge)
                    if (card.romaji.isNotBlank()) {
                        Text(
                            card.romaji,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        if (showAnswer) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf(
                    Triple("🔁", "Lại", Color(0xFFEF4444) to 1),
                    Triple("😓", "Khó", Color(0xFFF97316) to 2),
                    Triple("👌", "Ổn", Color(0xFF22C55E) to 3),
                    Triple("⭐", "Dễ", Color(0xFF3B82F6) to 4),
                ).forEach { (emoji, label, colorQuality) ->
                    val (color, quality) = colorQuality
                    RatingButton(
                        emoji = emoji,
                        label = label,
                        color = color,
                        onClick = {
                            onReviewed(card, quality)
                            showAnswer = false
                        },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }
    }
}

@Composable
private fun RatingButton(
    emoji: String,
    label: String,
    color: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Button(
        onClick = onClick,
        modifier = modifier,
        colors = ButtonDefaults.buttonColors(containerColor = color),
        contentPadding = PaddingValues(vertical = 12.dp, horizontal = 4.dp),
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Text(emoji, style = MaterialTheme.typography.bodyLarge)
            Text(label, style = MaterialTheme.typography.labelSmall)
        }
    }
}
