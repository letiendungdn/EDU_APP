package com.edu.nihongo.domain.repository

import com.edu.nihongo.domain.entity.ReviewCard
import com.edu.nihongo.domain.entity.SrsCard
import com.edu.nihongo.domain.entity.Vocabulary
import kotlinx.coroutines.flow.Flow

interface VocabularyRepository {
    fun getVocabByLesson(lessonNumber: Int): Flow<List<Vocabulary>>
    fun getReviewQueue(): Flow<List<ReviewCard>>
    suspend fun updateSrsCard(card: SrsCard): Result<Unit>
    suspend fun syncLesson(lessonNumber: Int): Result<Unit>
}

interface AuthRepository {
    suspend fun login(email: String, password: String): Result<Unit>
    suspend fun logout()
    suspend fun isLoggedIn(): Boolean
}

interface TranslateRepository {
    suspend fun translateJapanese(text: String): String
}
