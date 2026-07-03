package com.edu.nihongo.domain.usecase

import com.edu.nihongo.domain.entity.ReviewCard
import com.edu.nihongo.domain.repository.VocabularyRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetReviewQueueUseCase @Inject constructor(
    private val repo: VocabularyRepository,
) {
    operator fun invoke(): Flow<List<ReviewCard>> = repo.getReviewQueue()
}

class GetVocabByLessonUseCase @Inject constructor(
    private val repo: VocabularyRepository,
) {
    operator fun invoke(lessonNumber: Int): Flow<List<com.edu.nihongo.domain.entity.Vocabulary>> =
        repo.getVocabByLesson(lessonNumber)
}

class SyncLessonUseCase @Inject constructor(
    private val repo: VocabularyRepository,
) {
    suspend operator fun invoke(lessonNumber: Int): Result<Unit> =
        repo.syncLesson(lessonNumber)
}
