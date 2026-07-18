package com.edu.nihongo.data.remote

import android.content.Context
import android.content.Intent
import android.net.Uri
import com.edu.nihongo.BuildConfig
import net.openid.appauth.AuthorizationRequest
import net.openid.appauth.AuthorizationService
import net.openid.appauth.AuthorizationServiceConfiguration
import net.openid.appauth.ResponseTypeValues
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

object KeycloakConfig {
    val discoveryUri: Uri =
        Uri.parse(
            "${BuildConfig.KEYCLOAK_URL.trimEnd('/')}/realms/${BuildConfig.KEYCLOAK_REALM}" +
                "/.well-known/openid-configuration",
        )
    val redirectUri: Uri = Uri.parse(BuildConfig.KEYCLOAK_REDIRECT_URI)
    val clientId: String = BuildConfig.KEYCLOAK_CLIENT_ID
}

data class KeycloakTokens(
    val accessToken: String,
    val idToken: String?,
)

class KeycloakAuth(context: Context) {
    private val authService = AuthorizationService(context.applicationContext)

    fun dispose() = authService.dispose()

    suspend fun fetchServiceConfig(): AuthorizationServiceConfiguration =
        suspendCoroutine { cont ->
            AuthorizationServiceConfiguration.fetchFromUrl(KeycloakConfig.discoveryUri) { config, ex ->
                when {
                    config != null -> cont.resume(config)
                    ex != null -> cont.resumeWithException(ex)
                    else -> cont.resumeWithException(IllegalStateException("Không tải được OIDC discovery"))
                }
            }
        }

    fun createAuthIntent(config: AuthorizationServiceConfiguration): Intent {
        val request = AuthorizationRequest.Builder(
            config,
            KeycloakConfig.clientId,
            ResponseTypeValues.CODE,
            KeycloakConfig.redirectUri,
        )
            .setScopes("openid", "profile", "email")
            .setPrompt("login")
            .build()
        return authService.getAuthorizationRequestIntent(request)
    }

    suspend fun exchangeCode(intent: Intent?): KeycloakTokens =
        suspendCoroutine { cont ->
            val response = net.openid.appauth.AuthorizationResponse.fromIntent(intent ?: Intent())
            val ex = net.openid.appauth.AuthorizationException.fromIntent(intent)
            if (response == null) {
                cont.resumeWithException(ex ?: IllegalStateException("Keycloak auth bị hủy"))
                return@suspendCoroutine
            }
            authService.performTokenRequest(response.createTokenExchangeRequest()) { tokenResponse, tokenEx ->
                val access = tokenResponse?.accessToken
                if (access.isNullOrBlank()) {
                    cont.resumeWithException(tokenEx ?: IllegalStateException("Không nhận access_token"))
                } else {
                    cont.resume(KeycloakTokens(access, tokenResponse.idToken))
                }
            }
        }
}
