package com.edu.nihongo.presentation.srs

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
            uiState.cards.isEmpty() -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text("Không có thẻ cần ôn hôm nay")
                }
            }

            else -> {
                SrsCardStack(
                    card = uiState.cards.first(),
                    remaining = uiState.cards.size,
                    onReviewed = viewModel::onCardReviewed,
                    modifier = Modifier.padding(padding),
                )
            }
        }
    }
}

@Composable
private fun SrsCardStack(
    card: ReviewCard,
    remaining: Int,
    onReviewed: (ReviewCard, Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showAnswer by remember(card.card.id) { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
    ) {
        Text("Còn $remaining thẻ", style = MaterialTheme.typography.labelLarge)
        Spacer(Modifier.height(16.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
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
                if (showAnswer) {
                    Spacer(Modifier.height(16.dp))
                    Text(card.meaning, style = MaterialTheme.typography.bodyLarge)
                    if (card.romaji.isNotBlank()) {
                        Text(card.romaji, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        if (!showAnswer) {
            Button(
                onClick = { showAnswer = true },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Xem đáp án")
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Quên" to 0, "Khó" to 2, "OK" to 3, "Dễ" to 5).forEach { (label, q) ->
                    OutlinedButton(
                        onClick = {
                            onReviewed(card, q)
                            showAnswer = false
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text(label)
                    }
                }
            }
        }
    }
}
