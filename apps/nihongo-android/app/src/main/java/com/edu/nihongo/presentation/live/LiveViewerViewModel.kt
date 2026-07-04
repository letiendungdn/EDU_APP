package com.edu.nihongo.presentation.live

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edu.nihongo.data.LiveNavigationStore
import com.edu.nihongo.data.remote.LiveApi
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import io.livekit.android.LiveKit
import io.livekit.android.events.RoomEvent
import io.livekit.android.events.collect
import io.livekit.android.room.Room
import io.livekit.android.room.track.DataPublishReliability
import io.livekit.android.room.track.VideoTrack
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ChatMessage(val text: String, val isMe: Boolean)

data class LiveViewerUiState(
    val connecting: Boolean = true,
    val error: String? = null,
    val hostVideo: VideoTrack? = null,
    val viewerCount: Int = 0,
    val messages: List<ChatMessage> = emptyList(),
    val title: String? = null,
)

@HiltViewModel
class LiveViewerViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val navStore: LiveNavigationStore,
) : ViewModel() {

    private val _uiState = MutableStateFlow(LiveViewerUiState())
    val uiState: StateFlow<LiveViewerUiState> = _uiState.asStateFlow()

    var room: Room? = null
        private set

    init {
        connect()
    }

    private fun connect() {
        val join = navStore.consumeJoin()
        if (join == null) {
            _uiState.update { it.copy(connecting = false, error = "Thiếu thông tin phòng live") }
            return
        }

        _uiState.update { it.copy(title = join.title) }

        viewModelScope.launch {
            try {
                val r = LiveKit.create(context)
                room = r

                launch {
                    r.events.collect { event ->
                        when (event) {
                            is RoomEvent.TrackSubscribed -> {
                                val track = event.track
                                if (track is VideoTrack) {
                                    _uiState.update { it.copy(hostVideo = track) }
                                }
                            }

                            is RoomEvent.ParticipantConnected -> {
                                _uiState.update {
                                    it.copy(viewerCount = r.remoteParticipants.size)
                                }
                            }

                            is RoomEvent.ParticipantDisconnected -> {
                                _uiState.update {
                                    it.copy(viewerCount = r.remoteParticipants.size)
                                }
                            }

                            is RoomEvent.DataReceived -> {
                                if (event.topic == "chat") {
                                    val text = event.data.decodeToString()
                                    _uiState.update { state ->
                                        state.copy(
                                            messages = state.messages + ChatMessage(text, false),
                                        )
                                    }
                                }
                            }

                            else -> Unit
                        }
                    }
                }

                r.connect(join.wsUrl, join.token)
                _uiState.update { it.copy(connecting = false) }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(connecting = false, error = e.message ?: "Kết nối thất bại")
                }
            }
        }
    }

    fun sendChat(text: String) {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return
        viewModelScope.launch {
            try {
                room?.localParticipant?.publishData(
                    trimmed.toByteArray(),
                    DataPublishReliability.RELIABLE,
                    topic = "chat",
                )
                _uiState.update {
                    it.copy(messages = it.messages + ChatMessage(trimmed, true))
                }
            } catch (_: Exception) {
            }
        }
    }

    override fun onCleared() {
        room?.disconnect()
        room = null
        super.onCleared()
    }
}
