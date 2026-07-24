package com.edu.nihongo.data.remote

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VocabularyRemoteDataSource @Inject constructor(
    private val api: VocabularyApi,
) {
    suspend fun fetchAllForLesson(lessonNumber: Int): List<VocabDto> {
        val all = mutableListOf<VocabDto>()
        var page = 1
        val limit = 100

        while (true) {
            val envelope = api.list(lessonNumber = lessonNumber, page = page, limit = limit)
            val batch = envelope.data?.data.orEmpty()
            if (batch.isEmpty()) break
            all += batch
            if (batch.size < limit) break
            page += 1
        }

        return all
    }
}
