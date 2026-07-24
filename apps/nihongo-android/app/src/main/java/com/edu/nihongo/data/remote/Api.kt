package com.edu.nihongo.data.remote

import com.google.gson.annotations.SerializedName
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

data class VocabDto(
    val id: Long,
    val kana: String?,
    val kanji: String?,
    val meaning: String?,
    val romaji: String?,
    @SerializedName("lessonNumber") val lessonNumber: Int? = null,
    @SerializedName("lessonId") val lessonId: Int? = null,
)

data class LoginRequest(val email: String, val password: String)

data class OidcRequest(
    val accessToken: String,
    val idToken: String? = null,
)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String?,
)

/** Gateway wraps payloads as `{ success, data }`. */
data class ApiEnvelope<T>(
    val success: Boolean? = null,
    val data: T? = null,
)

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): ApiEnvelope<LoginResponse>

    @POST("auth/oidc")
    suspend fun loginOidc(@Body body: OidcRequest): ApiEnvelope<LoginResponse>

    @POST("auth/logout")
    suspend fun logout()
}

data class TranslateRequest(
    val text: String,
    val sourceLang: String = "ja",
    val targetLang: String = "vi",
)

data class TranslateResponse(
    val translation: String?,
)

interface VocabularyApi {
    @GET("vocabularies")
    suspend fun list(
        @Query("lessonNumber") lessonNumber: Int,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 100,
    ): ApiEnvelope<VocabPageDto>
}

/** Paginated list nested under envelope.data */
data class VocabPageDto(
    val data: List<VocabDto>? = null,
    val total: Int? = null,
    val page: Int? = null,
    val limit: Int? = null,
)

interface TranslateApi {
    @POST("translate")
    suspend fun translate(@Body body: TranslateRequest): TranslateResponse
}

data class LessonDto(
    val id: Long,
    @SerializedName("lessonNumber") val lessonNumber: Int,
    val title: String? = null,
    val description: String? = null,
    @SerializedName("_count") val count: LessonCountDto? = null,
)

data class LessonCountDto(
    val vocabularies: Int? = null,
    val grammars: Int? = null,
    val exercises: Int? = null,
)

interface LessonsApi {
    @GET("lessons")
    suspend fun list(): ApiEnvelope<List<LessonDto>>
}
