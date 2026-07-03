package com.edu.nihongo.presentation.vocab

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edu.nihongo.domain.entity.Vocabulary
import com.edu.nihongo.domain.usecase.GetVocabByLessonUseCase
import com.edu.nihongo.domain.usecase.SyncLessonUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class VocabUiState(
    val items: List<Vocabulary> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class VocabViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    getVocabByLesson: GetVocabByLessonUseCase,
    private val syncLesson: SyncLessonUseCase,
) : ViewModel() {
    private val lessonNumber: Int = savedStateHandle.get<Int>("lesson") ?: 1

    private val _uiState = MutableStateFlow(VocabUiState())
    val uiState: StateFlow<VocabUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            getVocabByLesson(lessonNumber).collect { list ->
                _uiState.update { it.copy(items = list, isLoading = false) }
            }
        }

        viewModelScope.launch {
            syncLesson(lessonNumber)
                .onFailure { e ->
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = e.message,
                        )
                    }
                }
                .onSuccess {
                    _uiState.update { it.copy(isLoading = false, error = null) }
                }
        }
    }
}
