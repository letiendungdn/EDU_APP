package com.edu.nihongo.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.tokenDataStore: DataStore<Preferences> by preferencesDataStore("auth")

@Singleton
class TokenStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val key = stringPreferencesKey("access_token")

    suspend fun save(token: String) {
        context.tokenDataStore.edit { it[key] = token }
    }

    suspend fun clear() {
        context.tokenDataStore.edit { it.remove(key) }
    }

    suspend fun get(): String? =
        context.tokenDataStore.data.map { it[key] }.first()

    suspend fun isLoggedIn(): Boolean = !get().isNullOrBlank()
}
