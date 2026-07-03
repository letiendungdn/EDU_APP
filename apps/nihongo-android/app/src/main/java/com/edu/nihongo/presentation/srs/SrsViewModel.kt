package com.edu.nihongo.presentation.srs

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.edu.nihongo.domain.entity.ReviewCard
import com.edu.nihongo.domain.repository.VocabularyRepository
import com.edu.nihongo.domain.usecase.GetReviewQueueUseCase
import com.edu.nihongo.utils.SrsAlgorithm
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SrsUiState(
    val cards: List<ReviewCard> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class SrsViewModel @Inject constructor(
    getReviewQueue: GetReviewQueueUseCase,
    private val vocabRepo: VocabularyRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(SrsUiState())
    val uiState: StateFlow<SrsUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            getReviewQueue().collect { cards ->
                _uiState.update { it.copy(cards = cards) }
            }
        }
    }

    fun onCardReviewed(card: ReviewCard, quality: Int) {
        viewModelScope.launch {
            val updated = SrsAlgorithm.calculateNextReview(card.card, quality)
            vocabRepo.updateSrsCard(updated).onFailure { e ->
                _uiState.update { it.copy(error = e.message) }
            }
        }
    }
}
