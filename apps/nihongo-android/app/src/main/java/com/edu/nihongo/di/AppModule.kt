package com.edu.nihongo.di

import android.content.Context
import com.edu.nihongo.BuildConfig
import com.edu.nihongo.data.local.AppDatabase
import com.edu.nihongo.data.local.TokenStore
import com.edu.nihongo.data.local.dao.SrsCardDao
import com.edu.nihongo.data.local.dao.SyncQueueDao
import com.edu.nihongo.data.local.dao.VocabularyDao
import com.edu.nihongo.data.remote.AuthApi
import com.edu.nihongo.data.remote.AuthInterceptor
import com.edu.nihongo.data.remote.LessonsApi
import com.edu.nihongo.data.remote.LiveApi
import com.edu.nihongo.data.remote.TranslateApi
import com.edu.nihongo.data.remote.VocabularyApi
import com.edu.nihongo.data.repository.AuthRepositoryImpl
import com.edu.nihongo.data.repository.TranslateRepositoryImpl
import com.edu.nihongo.data.repository.VocabularyRepositoryImpl
import com.edu.nihongo.domain.repository.AuthRepository
import com.edu.nihongo.domain.repository.TranslateRepository
import com.edu.nihongo.domain.repository.VocabularyRepository
import com.google.gson.Gson
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    @Provides
    @Singleton
    fun provideGson(): Gson = Gson()

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        androidx.room.Room.databaseBuilder(context, AppDatabase::class.java, AppDatabase.DB_NAME)
            .fallbackToDestructiveMigration()
            .build()

    @Provides fun provideVocabDao(db: AppDatabase): VocabularyDao = db.vocabDao()
    @Provides fun provideSrsDao(db: AppDatabase): SrsCardDao = db.srsDao()
    @Provides fun provideSyncQueueDao(db: AppDatabase): SyncQueueDao = db.syncQueueDao()

    @Provides
    @Singleton
    fun provideOkHttp(tokenStore: TokenStore): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        return OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenStore))
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides fun provideVocabApi(retrofit: Retrofit): VocabularyApi =
        retrofit.create(VocabularyApi::class.java)

    @Provides fun provideLessonsApi(retrofit: Retrofit): LessonsApi =
        retrofit.create(LessonsApi::class.java)

    @Provides fun provideAuthApi(retrofit: Retrofit): AuthApi =
        retrofit.create(AuthApi::class.java)

    @Provides fun provideTranslateApi(retrofit: Retrofit): TranslateApi =
        retrofit.create(TranslateApi::class.java)

    @Provides fun provideLiveApi(retrofit: Retrofit): LiveApi =
        retrofit.create(LiveApi::class.java)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindVocabRepo(impl: VocabularyRepositoryImpl): VocabularyRepository

    @Binds
    abstract fun bindAuthRepo(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    abstract fun bindTranslateRepo(impl: TranslateRepositoryImpl): TranslateRepository
}
