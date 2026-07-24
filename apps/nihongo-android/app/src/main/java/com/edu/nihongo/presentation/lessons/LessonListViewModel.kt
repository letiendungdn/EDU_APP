package com.edu.nihongo.presentation.lessons

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edu.nihongo.data.remote.LessonDto
import com.edu.nihongo.data.remote.LessonsApi
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LessonListUiState(
    val lessons: List<LessonDto> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

@HiltViewModel
class LessonListViewModel @Inject constructor(
    private val lessonsApi: LessonsApi,
) : ViewModel() {
    private val _uiState = MutableStateFlow(LessonListUiState())
    val uiState: StateFlow<LessonListUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            runCatching {
                lessonsApi.list().data.orEmpty()
                    .sortedBy { it.lessonNumber }
            }.onSuccess { list ->
                _uiState.update {
                    it.copy(lessons = list, isLoading = false, error = null)
                }
            }.onFailure { e ->
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Không tải được danh sách bài",
                    )
                }
            }
        }
    }
}
