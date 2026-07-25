package com.edu.nihongo.data.repository

import com.edu.nihongo.data.NetworkMonitor
import com.edu.nihongo.data.local.TokenStore
import com.edu.nihongo.data.local.dao.SrsCardDao
import com.edu.nihongo.data.local.dao.SyncQueueDao
import com.edu.nihongo.data.local.dao.VocabularyDao
import com.edu.nihongo.data.local.entity.SrsCardEntity
import com.edu.nihongo.data.local.entity.SyncQueueEntity
import com.edu.nihongo.data.local.entity.VocabularyEntity
import com.edu.nihongo.data.local.toDomain
import com.edu.nihongo.data.remote.AuthApi
import com.edu.nihongo.data.remote.LoginRequest
import com.edu.nihongo.data.remote.OidcRequest
import com.edu.nihongo.data.remote.TranslateApi
import com.edu.nihongo.data.remote.TranslateRequest
import com.edu.nihongo.data.remote.VocabularyRemoteDataSource
import com.edu.nihongo.domain.entity.SrsCard
import com.edu.nihongo.domain.repository.AuthRepository
import com.edu.nihongo.domain.repository.TranslateRepository
import com.edu.nihongo.domain.repository.VocabularyRepository
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val tokenStore: TokenStore,
) : AuthRepository {
    override suspend fun login(email: String, password: String): Result<Unit> = runCatching {
        val res = authApi.login(LoginRequest(email, password))
        val token = res.data?.accessToken
        require(!token.isNullOrBlank()) { "Không nhận được access token" }
        tokenStore.save(token)
    }

    override suspend fun loginWithOidc(accessToken: String, idToken: String?): Result<Unit> =
        runCatching {
            val res = authApi.loginOidc(OidcRequest(accessToken, idToken))
            val token = res.data?.accessToken
            require(!token.isNullOrBlank()) { "Không nhận được access token từ OIDC" }
            tokenStore.save(token)
        }

    override suspend fun logout() {
        try {
            authApi.logout()
        } finally {
            tokenStore.clear()
        }
    }

    override suspend fun isLoggedIn(): Boolean = tokenStore.isLoggedIn()
}

@Singleton
class TranslateRepositoryImpl @Inject constructor(
    private val api: TranslateApi,
) : TranslateRepository {
    private val cache = mutableMapOf<String, String>()

    override suspend fun translateJapanese(text: String): String {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return ""

        cache[trimmed]?.let { return it }

        val res = api.translate(TranslateRequest(text = trimmed))
        val translated = res.translation?.trim().orEmpty().ifEmpty { trimmed }
        cache[trimmed] = translated
        return translated
    }
}

@Singleton
class VocabularyRepositoryImpl @Inject constructor(
    private val vocabDao: VocabularyDao,
    private val srsDao: SrsCardDao,
    private val syncQueueDao: SyncQueueDao,
    private val remote: VocabularyRemoteDataSource,
    private val networkMonitor: NetworkMonitor,
    private val tokenStore: TokenStore,
    private val gson: Gson,
) : VocabularyRepository {

    override fun getVocabByLesson(lessonNumber: Int) =
        vocabDao.getByLesson(lessonNumber).map { list -> list.map { it.toDomain() } }

    override fun getReviewQueue() =
        srsDao.getReviewQueue().map { rows -> rows.map { it.toDomain() } }

    override suspend fun updateSrsCard(card: SrsCard): Result<Unit> = runCatching {
        srsDao.updateAfterReview(
            id = card.id,
            easeFactor = card.easeFactor,
            interval = card.interval,
            repetitions = card.repetitions,
            nextReviewAt = card.nextReviewAt,
            mastered = card.mastered,
            updatedAt = card.updatedAt,
        )

        syncQueueDao.enqueue(
            SyncQueueEntity(
                operation = "UPDATE_SRS",
                entityId = card.id,
                payload = gson.toJson(card),
            ),
        )

        if (networkMonitor.isOnline() && tokenStore.isLoggedIn()) {
            flushSyncQueue()
        }
    }

    override suspend fun syncLesson(lessonNumber: Int): Result<Unit> = runCatching {
        if (!networkMonitor.isOnline()) error("Không có mạng")

        val remoteList = remote.fetchAllForLesson(lessonNumber)
        val entities = remoteList.mapIndexed { index, dto ->
            VocabularyEntity(
                id = dto.id,
                lessonNumber = lessonNumber,
                kana = dto.kana.orEmpty(),
                kanji = dto.kanji,
                meaning = dto.meaning.orEmpty(),
                romaji = dto.romaji.orEmpty(),
                sortOrder = index,
            )
        }

        if (entities.isNotEmpty()) {
            vocabDao.upsertAll(entities)
            entities.forEach { ensureSrsCard(it.id) }
        }

        if (tokenStore.isLoggedIn()) {
            flushSyncQueue()
        }
    }

    private suspend fun ensureSrsCard(vocabId: Long) {
        if (srsDao.getByVocabId(vocabId) != null) return
        srsDao.upsert(
            SrsCardEntity(
                id = vocabId,
                vocabularyId = vocabId,
            ),
        )
    }

    private suspend fun flushSyncQueue() {
        val pending = syncQueueDao.getPending()
        val reviewItems = mutableListOf<com.edu.nihongo.data.remote.ReviewSyncItem>()
        val syncedQueueIds = mutableListOf<Long>()
        val syncedCardIds = mutableListOf<Long>()
        val isoFormat = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US).apply {
            timeZone = java.util.TimeZone.getTimeZone("UTC")
        }

        for (item in pending) {
            if (item.operation != "UPDATE_SRS") continue
            try {
                val card = gson.fromJson(item.payload, SrsCard::class.java)
                val vocab = vocabDao.getById(card.vocabularyId)
                if (vocab == null) {
                    syncedQueueIds += item.id
                    continue
                }
                reviewItems += com.edu.nihongo.data.remote.ReviewSyncItem(
                    kana = vocab.kana,
                    kanji = vocab.kanji,
                    meaning = vocab.meaning,
                    lessonNumber = vocab.lessonNumber,
                    wrongCount = if (card.repetitions == 0) 1 else 0,
                    reviewStreak = card.repetitions,
                    mastered = card.mastered,
                    lastReviewedAt = isoFormat.format(java.util.Date(card.updatedAt)),
                )
                syncedQueueIds += item.id
                syncedCardIds += card.id
            } catch (_: Exception) {
                // keep in queue for next flush
            }
        }

        if (reviewItems.isNotEmpty()) {
            remote.syncReviewBank(reviewItems)
        }
        if (syncedCardIds.isNotEmpty()) {
            srsDao.markSynced(syncedCardIds)
        }
        syncedQueueIds.forEach { syncQueueDao.delete(it) }
    }
}
