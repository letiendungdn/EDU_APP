package com.edu.nihongo.data.remote

import android.content.Context
import android.provider.Settings
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

private val Context.pushStore by preferencesDataStore("push_prefs")

@Singleton
class PushService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val pushApi: PushApi,
) {
    private val tokenKey = stringPreferencesKey("device_token")

    suspend fun registerAfterLogin() {
        val token = ensureToken()
        runCatching {
            pushApi.register(PushRegisterRequest(token = token, platform = "android"))
        }
    }

    suspend fun unregisterOnLogout() {
        val token = context.pushStore.data.map { it[tokenKey] }.first() ?: return
        runCatching { pushApi.unregister(PushUnregisterRequest(token)) }
        context.pushStore.edit { it.remove(tokenKey) }
    }

    private suspend fun ensureToken(): String {
        val existing = context.pushStore.data.map { it[tokenKey] }.first()
        if (!existing.isNullOrBlank()) return existing
        val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        val token = "android-${androidId ?: UUID.randomUUID()}"
        context.pushStore.edit { it[tokenKey] = token }
        return token
    }
}
