package com.edu.nihongo.presentation.live

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import io.livekit.android.compose.ui.VideoTrackView

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LiveViewerScreen(
    onBack: () -> Unit,
    viewModel: LiveViewerViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var chatInput by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.lastIndex)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(uiState.title ?: "Xem live")
                },
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
                .padding(padding),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .background(Color.Black),
                contentAlignment = Alignment.Center,
            ) {
                when {
                    uiState.connecting -> CircularProgressIndicator(color = Color.White)
                    uiState.error != null -> Text(
                        text = uiState.error ?: "",
                        color = Color.White,
                    )

                    uiState.hostVideo != null && viewModel.room != null -> {
                        VideoTrackView(
                            videoTrack = uiState.hostVideo,
                            passedRoom = viewModel.room,
                            modifier = Modifier.fillMaxSize(),
                        )
                    }

                    else -> Text("Đang chờ video từ coach…", color = Color.White)
                }

                Text(
                    text = "${uiState.viewerCount} người xem",
                    color = Color.White,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .background(Color.Black.copy(alpha = 0.5f))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall,
                )
            }

            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.35f)
                    .padding(horizontal = 8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                items(uiState.messages) { msg ->
                    Text(
                        text = if (msg.isMe) "Bạn: ${msg.text}" else msg.text,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value = chatInput,
                    onValueChange = { chatInput = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Chat…") },
                    singleLine = true,
                )
                IconButton(
                    onClick = {
                        viewModel.sendChat(chatInput)
                        chatInput = ""
                    },
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Gửi")
                }
            }
        }
    }
}
