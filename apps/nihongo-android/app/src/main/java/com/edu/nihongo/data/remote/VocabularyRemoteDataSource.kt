package com.edu.nihongo.data.remote

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VocabularyRemoteDataSource @Inject constructor(
    private val api: VocabularyApi,
    private val gson: Gson,
) {
    suspend fun fetchAllForLesson(lessonNumber: Int): List<VocabDto> {
        val all = mutableListOf<VocabDto>()
        var page = 1
        val limit = 100

        while (true) {
            val batch = parseList(api.list(lessonNumber = lessonNumber, page = page, limit = limit))
            if (batch.isEmpty()) break
            all += batch
            if (batch.size < limit) break
            page += 1
        }

        return all
    }

    @Suppress("UNCHECKED_CAST")
    private fun parseList(raw: Any): List<VocabDto> {
        return when (raw) {
            is List<*> -> raw.mapNotNull { item ->
                gson.fromJson(gson.toJson(item), VocabDto::class.java)
            }

            is Map<*, *> -> {
                val data = raw["data"]
                if (data is List<*>) {
                    data.mapNotNull { item ->
                        gson.fromJson(gson.toJson(item), VocabDto::class.java)
                    }
                } else {
                    emptyList()
                }
            }

            else -> {
                val type = object : TypeToken<List<VocabDto>>() {}.type
                gson.fromJson(gson.toJson(raw), type)
            }
        }
    }
}
