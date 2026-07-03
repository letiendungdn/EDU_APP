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
)

data class LoginRequest(val email: String, val password: String)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String?,
)

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
    ): Any
}

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @POST("auth/logout")
    suspend fun logout()
}

interface TranslateApi {
    @POST("translate")
    suspend fun translate(@Body body: TranslateRequest): TranslateResponse
}
