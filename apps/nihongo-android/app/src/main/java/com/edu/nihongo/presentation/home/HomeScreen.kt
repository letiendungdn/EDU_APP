package com.edu.nihongo.presentation.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onVocab: (Int) -> Unit,
    onSrs: () -> Unit,
    onLogin: () -> Unit,
    onCamera: () -> Unit,
    onLive: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val isOnline by viewModel.isOnline.collectAsStateWithLifecycle(initialValue = true)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Nihongo — EDU APP") },
                actions = {
                    Icon(
                        imageVector = if (isOnline) Icons.Default.CloudDone else Icons.Default.CloudOff,
                        contentDescription = if (isOnline) "Online" else "Offline",
                        modifier = Modifier.padding(end = 16.dp),
                        tint = if (isOnline) {
                            MaterialTheme.colorScheme.primary
                        } else {
                            MaterialTheme.colorScheme.error
                        },
                    )
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                NavCard(
                    title = "Từ vựng bài 1",
                    subtitle = "Đọc offline từ SQLite, sync khi có mạng",
                    onClick = { onVocab(1) },
                )
            }
            item {
                NavCard(
                    title = "Ôn tập SRS",
                    subtitle = "Spaced repetition — SM-2",
                    onClick = onSrs,
                )
            }
            item {
                NavCard(
                    title = "Dịch camera",
                    subtitle = "Nhận chữ & dịch trực tiếp trên camera",
                    onClick = onCamera,
                )
            }
            item {
                NavCard(
                    title = "Livestream",
                    subtitle = "Xem / phát live Nihongo (LiveKit)",
                    onClick = onLive,
                )
            }
            item {
                NavCard(
                    title = "Đăng nhập",
                    subtitle = "Sync tiến độ lên server",
                    onClick = onLogin,
                )
            }
        }
    }
}

@Composable
private fun NavCard(title: String, subtitle: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = title, style = MaterialTheme.typography.titleMedium)
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
