package com.edu.nihongo.data.remote

import com.edu.nihongo.BuildConfig
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import javax.inject.Inject
import javax.inject.Singleton

data class SentenceFeedback(
    val corrected: String,
    val reading: String,
    val meaning: String,
    val explanation: String,
    val examples: List<String>,
)

@Singleton
class SentencePracticeApi @Inject constructor(private val gson: Gson) {
    private val client = OkHttpClient()
    private val apiKey = BuildConfig.GEMINI_API_KEY
    private val url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey"

    private val systemPrompt = """Bạn là gia sư tiếng Nhật. Phản hồi JSON (không markdown): {"corrected":"","reading":"","meaning":"","explanation":"","examples":[]}. Nếu câu đúng để corrected rỗng."""

    suspend fun analyze(sentence: String): SentenceFeedback = withContext(Dispatchers.IO) {
        val body = gson.toJson(
            mapOf(
                "system_instruction" to mapOf("parts" to listOf(mapOf("text" to systemPrompt))),
                "contents" to listOf(mapOf("role" to "user", "parts" to listOf(mapOf("text" to sentence)))),
                "generationConfig" to mapOf("temperature" to 0.3, "maxOutputTokens" to 512),
            ),
        )
        val req = Request.Builder().url(url)
            .post(body.toRequestBody("application/json".toMediaType()))
            .build()
        val raw = client.newCall(req).execute().use { res ->
            val json = gson.fromJson(res.body?.string(), Map::class.java)
            @Suppress("UNCHECKED_CAST")
            val parts = ((json["candidates"] as? List<*>)?.firstOrNull() as? Map<String, Any>)
                ?.get("content").let { it as? Map<String, Any> }
                ?.get("parts").let { it as? List<*> }
            (parts?.firstOrNull() as? Map<String, Any>)?.get("text") as? String ?: ""
        }
        val cleaned = raw
            .replace(Regex("^```json?\\s*", RegexOption.MULTILINE), "")
            .replace(Regex("```\\s*$", RegexOption.MULTILINE), "")
            .trim()
        val map = gson.fromJson(cleaned, Map::class.java)
        @Suppress("UNCHECKED_CAST")
        SentenceFeedback(
            corrected = map["corrected"] as? String ?: "",
            reading = map["reading"] as? String ?: "",
            meaning = map["meaning"] as? String ?: "",
            explanation = map["explanation"] as? String ?: "",
            examples = (map["examples"] as? List<*>)?.map { it.toString() } ?: emptyList(),
        )
    }
}
