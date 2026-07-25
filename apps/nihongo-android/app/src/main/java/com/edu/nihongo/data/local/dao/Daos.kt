package com.edu.nihongo.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.edu.nihongo.data.local.entity.SrsCardEntity
import com.edu.nihongo.data.local.entity.SyncQueueEntity
import com.edu.nihongo.data.local.entity.VocabularyEntity
import kotlinx.coroutines.flow.Flow

data class ReviewRow(
    val id: Long,
    val vocabularyId: Long,
    val easeFactor: Float,
    val interval: Int,
    val repetitions: Int,
    val nextReviewAt: Long,
    val mastered: Boolean,
    val syncStatus: String,
    val updatedAt: Long,
    val kana: String,
    val kanji: String?,
    val meaning: String,
    val romaji: String,
)

@Dao
interface VocabularyDao {
    @Query(
        """
        SELECT * FROM vocabulary
        WHERE lesson_number = :lessonNumber
        ORDER BY sort_order ASC
        """,
    )
    fun getByLesson(lessonNumber: Int): Flow<List<VocabularyEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<VocabularyEntity>)

    @Query("SELECT * FROM vocabulary WHERE id = :id LIMIT 1")
    suspend fun getById(id: Long): VocabularyEntity?
}

@Dao
interface SrsCardDao {
    @Query(
        """
        SELECT s.id, s.vocabulary_id AS vocabularyId, s.ease_factor AS easeFactor,
               s.interval, s.repetitions, s.next_review_at AS nextReviewAt,
               s.mastered, s.sync_status AS syncStatus, s.updated_at AS updatedAt,
               v.kana, v.kanji, v.meaning, v.romaji
        FROM srs_card s
        INNER JOIN vocabulary v ON v.id = s.vocabulary_id
        WHERE s.next_review_at <= :now
        ORDER BY s.next_review_at ASC
        LIMIT :limit
        """,
    )
    fun getReviewQueue(now: Long = System.currentTimeMillis(), limit: Int = 20): Flow<List<ReviewRow>>

    @Query("SELECT * FROM srs_card WHERE vocabulary_id = :vocabId LIMIT 1")
    suspend fun getByVocabId(vocabId: Long): SrsCardEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(card: SrsCardEntity)

    @Query(
        """
        UPDATE srs_card
        SET ease_factor = :easeFactor,
            interval = :interval,
            repetitions = :repetitions,
            next_review_at = :nextReviewAt,
            mastered = :mastered,
            sync_status = 'PENDING',
            updated_at = :updatedAt
        WHERE id = :id
        """,
    )
    suspend fun updateAfterReview(
        id: Long,
        easeFactor: Float,
        interval: Int,
        repetitions: Int,
        nextReviewAt: Long,
        mastered: Boolean,
        updatedAt: Long = System.currentTimeMillis(),
    )

    @Query("SELECT * FROM srs_card WHERE sync_status = 'PENDING'")
    suspend fun getPendingSync(): List<SrsCardEntity>

    @Query("UPDATE srs_card SET sync_status = 'SYNCED' WHERE id IN (:ids)")
    suspend fun markSynced(ids: List<Long>)
}

@Dao
interface SyncQueueDao {
    @Insert
    suspend fun enqueue(item: SyncQueueEntity)

    @Query("SELECT * FROM sync_queue ORDER BY created_at ASC")
    suspend fun getPending(): List<SyncQueueEntity>

    @Query("DELETE FROM sync_queue WHERE id = :id")
    suspend fun delete(id: Long)

    @Query("DELETE FROM sync_queue WHERE operation = :operation AND entity_id = :entityId")
    suspend fun deleteByEntityId(operation: String, entityId: Long)
}
