package com.edu.nihongo.presentation.live

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.edu.nihongo.data.remote.LiveSessionDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveListScreen(
    onBack: () -> Unit,
    onNavigateViewer: () -> Unit,
    onNavigateHost: () -> Unit,
    viewModel: LiveListViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var showHostDialog by remember { mutableStateOf(false) }
    var hostTitle by remember { mutableStateOf("Livestream Nihongo") }

    LaunchedEffect(Unit) {
        viewModel.navigateViewer.collect { onNavigateViewer() }
    }
    LaunchedEffect(Unit) {
        viewModel.navigateHost.collect { onNavigateHost() }
    }

    if (showHostDialog) {
        AlertDialog(
            onDismissRequest = { showHostDialog = false },
            title = { Text("Bắt đầu live") },
            text = {
                OutlinedTextField(
                    value = hostTitle,
                    onValueChange = { hostTitle = it },
                    label = { Text("Tiêu đề") },
                    modifier = Modifier.fillMaxWidth(),
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showHostDialog = false
                        viewModel.startHost(hostTitle.trim())
                    },
                ) {
                    Text("Tạo phòng")
                }
            },
            dismissButton = {
                TextButton(onClick = { showHostDialog = false }) {
                    Text("Hủy")
                }
            },
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Livestream") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = viewModel::refresh) {
                        Icon(Icons.Default.Refresh, contentDescription = "Làm mới")
                    }
                },
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showHostDialog = true }) {
                Icon(Icons.Default.Videocam, contentDescription = "Phát live")
            }
        },
    ) { padding ->
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }

            uiState.error != null && uiState.sessions.isEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(uiState.error ?: "")
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    uiState.error?.let { err ->
                        item {
                            Text(
                                text = err,
                                color = MaterialTheme.colorScheme.error,
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }

                    if (uiState.sessions.isEmpty()) {
                        item {
                            Text(
                                text = "Chưa có phiên live. Coach bấm nút camera để phát.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }

                    items(uiState.sessions, key = { it.id }) { session ->
                        LiveSessionCard(
                            session = session,
                            onClick = { viewModel.joinSession(session.id) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LiveSessionCard(session: LiveSessionDto, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = session.title, style = MaterialTheme.typography.titleMedium)
            Text(
                text = session.coach?.name?.let { "Coach: $it" } ?: "Coach",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = if (session.status == "LIVE") "Đang phát" else session.status,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}
