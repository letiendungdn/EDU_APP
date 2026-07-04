package com.edu.nihongo.data.remote

import com.google.gson.annotations.SerializedName
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

data class LiveSessionDto(
    val id: Int,
    val title: String,
    val roomName: String,
    val status: String,
    val coach: CoachSummaryDto? = null,
)

data class CoachSummaryDto(
    val id: Int,
    val name: String?,
    @SerializedName("avatarUrl") val avatarUrl: String? = null,
)

data class CreateLiveSessionRequest(val title: String)

data class LiveJoinDto(
    val sessionId: Int,
    val token: String,
    val wsUrl: String,
    val roomName: String,
    val title: String? = null,
)

interface LiveApi {
    @GET("live/sessions")
    suspend fun listSessions(): List<LiveSessionDto>

    @POST("live/sessions")
    suspend fun createSession(@Body body: CreateLiveSessionRequest): LiveJoinDto

    @POST("live/sessions/{id}/join")
    suspend fun joinSession(@Path("id") sessionId: Int): LiveJoinDto

    @DELETE("live/sessions/{id}")
    suspend fun endSession(@Path("id") sessionId: Int)
}
