# Cursor Prompt — Android App (Offline-First, Senior Architecture)

> **Archival prompt.** Dùng để hiểu yêu cầu / kiến trúc mục tiêu. App `apps/nihongo-android` đã implement phần lớn offline + sync — status thật: [mobile-tech-stacks.md](./mobile-tech-stacks.md). Lộ trình học: [roadmap-android.md](./roadmap-android.md).

## Bối cảnh

Tạo Android app cho EDU APP (học tiếng Nhật) với:
- **Offline-first**: mọi thứ đọc từ SQLite local, sync background
- **Clean Architecture**: Data → Domain → Presentation
- **Room** (SQLite ORM) + **WorkManager** (background sync)
- **Kotlin Coroutines + Flow** cho reactive data
- **Hilt** cho dependency injection
- **MVVM** ở UI layer

---

## Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│  Fragment/Activity → ViewModel → StateFlow       │
│  Jetpack Compose UI                             │
└──────────────────┬──────────────────────────────┘
                   │ observe Flow
┌──────────────────▼──────────────────────────────┐
│                Domain Layer                      │
│  UseCase: GetVocabUseCase, SyncUseCase...       │
│  Repository Interface (abstraction)              │
│  Entity (pure Kotlin, no Android deps)          │
└──────────────────┬──────────────────────────────┘
                   │ implement
┌──────────────────▼──────────────────────────────┐
│                Data Layer                        │
│  RepositoryImpl                                 │
│    ├── LocalDataSource (Room/SQLite)            │
│    └── RemoteDataSource (Retrofit → API)        │
│  SyncManager (WorkManager)                      │
└─────────────────────────────────────────────────┘
```

---

## Phần 1 — Project Setup

### `build.gradle.kts` (app)

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")          // Room annotation processor
    id("com.google.dagger.hilt.android")
}

dependencies {
    // Room
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")       // coroutines support
    ksp("androidx.room:room-compiler:$roomVersion")

    // Hilt DI
    implementation("com.google.dagger:hilt-android:2.51")
    ksp("com.google.dagger:hilt-android-compiler:2.51")
    implementation("androidx.hilt:hilt-work:1.2.0")             // Hilt + WorkManager

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // Network
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines + Flow
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.2")

    // DataStore (thay SharedPreferences)
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // Gson
    implementation("com.google.code.gson:gson:2.10.1")
}
```

---

## Phần 2 — Domain Layer (pure Kotlin, zero Android)

### `domain/entity/Vocabulary.kt`

```kotlin
data class Vocabulary(
    val id: Long,
    val lessonNumber: Int,
    val kana: String,
    val kanji: String?,
    val meaning: String,
    val sortOrder: Int,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
)

data class SrsCard(
    val id: Long,
    val vocabularyId: Long,
    val easeFactor: Float,
    val interval: Int,
    val repetitions: Int,
    val nextReviewAt: Long,   // epoch millis
    val mastered: Boolean,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
)

// Trạng thái sync của mỗi record
enum class SyncStatus {
    SYNCED,      // đã sync với server
    PENDING,     // có thay đổi local, chờ sync
    CONFLICT,    // conflict với server, cần resolve
}
```

### `domain/repository/VocabularyRepository.kt`

```kotlin
// Interface — Domain không biết Room hay Retrofit
interface VocabularyRepository {
    fun getVocabByLesson(lessonNumber: Int): Flow<List<Vocabulary>>
    fun getSrsQueue(): Flow<List<SrsCard>>
    suspend fun updateSrsCard(card: SrsCard): Result<Unit>
    suspend fun sync(): Result<Unit>
}
```

### `domain/usecase/GetSrsQueueUseCase.kt`

```kotlin
class GetSrsQueueUseCase @Inject constructor(
    private val repo: VocabularyRepository,
) {
    // Flow — UI tự động cập nhật khi DB thay đổi
    operator fun invoke(): Flow<List<SrsCard>> =
        repo.getSrsQueue()
            .map { cards -> cards.filter { it.nextReviewAt <= System.currentTimeMillis() } }
            .flowOn(Dispatchers.Default)
}
```

---

## Phần 3 — Data Layer / Room

### `data/local/AppDatabase.kt`

```kotlin
@Database(
    entities = [
        VocabularyEntity::class,
        SrsCardEntity::class,
        SyncQueueEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun vocabDao(): VocabularyDao
    abstract fun srsDao(): SrsCardDao
    abstract fun syncQueueDao(): SyncQueueDao

    companion object {
        const val DB_NAME = "edu_app.db"
    }
}
```

### `data/local/entity/VocabularyEntity.kt`

```kotlin
@Entity(
    tableName = "vocabulary",
    indices = [
        Index("lesson_number"),              // query theo bài
        Index("sync_status"),                // tìm records cần sync
    ]
)
data class VocabularyEntity(
    @PrimaryKey val id: Long,
    @ColumnInfo(name = "lesson_number") val lessonNumber: Int,
    val kana: String,
    val kanji: String?,
    val meaning: String,
    @ColumnInfo(name = "sort_order") val sortOrder: Int,
    @ColumnInfo(name = "sync_status") val syncStatus: String = "SYNCED",
    @ColumnInfo(name = "updated_at") val updatedAt: Long = System.currentTimeMillis(),
)
```

### `data/local/entity/SrsCardEntity.kt`

```kotlin
@Entity(
    tableName = "srs_card",
    foreignKeys = [ForeignKey(
        entity = VocabularyEntity::class,
        parentColumns = ["id"],
        childColumns = ["vocabulary_id"],
        onDelete = ForeignKey.CASCADE,
    )],
    indices = [
        Index("vocabulary_id"),
        Index("next_review_at"),             // query review queue
        Index("sync_status"),
    ]
)
data class SrsCardEntity(
    @PrimaryKey val id: Long,
    @ColumnInfo(name = "vocabulary_id") val vocabularyId: Long,
    @ColumnInfo(name = "ease_factor") val easeFactor: Float = 2.5f,
    val interval: Int = 0,
    val repetitions: Int = 0,
    @ColumnInfo(name = "next_review_at") val nextReviewAt: Long = System.currentTimeMillis(),
    val mastered: Boolean = false,
    @ColumnInfo(name = "sync_status") val syncStatus: String = "SYNCED",
    @ColumnInfo(name = "updated_at") val updatedAt: Long = System.currentTimeMillis(),
)
```

### `data/local/entity/SyncQueueEntity.kt`

Hàng đợi các thay đổi local cần sync lên server:

```kotlin
@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val operation: String,         // "UPDATE_SRS", "CREATE_NOTE"
    val entityId: Long,
    val payload: String,           // JSON của thay đổi
    @ColumnInfo(name = "retry_count") val retryCount: Int = 0,
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis(),
)
```

### `data/local/dao/SrsCardDao.kt`

```kotlin
@Dao
interface SrsCardDao {
    // Flow → Room tự emit mỗi khi data thay đổi
    @Query("""
        SELECT * FROM srs_card
        WHERE next_review_at <= :now
        ORDER BY next_review_at ASC
        LIMIT :limit
    """)
    fun getReviewQueue(now: Long = System.currentTimeMillis(), limit: Int = 20): Flow<List<SrsCardEntity>>

    @Query("SELECT * FROM srs_card WHERE vocabulary_id = :vocabId")
    suspend fun getByVocabId(vocabId: Long): SrsCardEntity?

    // Upsert — INSERT or REPLACE
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(card: SrsCardEntity)

    @Query("""
        UPDATE srs_card
        SET ease_factor = :easeFactor,
            interval = :interval,
            repetitions = :repetitions,
            next_review_at = :nextReviewAt,
            mastered = :mastered,
            sync_status = 'PENDING',
            updated_at = :updatedAt
        WHERE id = :id
    """)
    suspend fun updateAfterReview(
        id: Long,
        easeFactor: Float,
        interval: Int,
        repetitions: Int,
        nextReviewAt: Long,
        mastered: Boolean,
        updatedAt: Long = System.currentTimeMillis(),
    )

    // Lấy tất cả records cần sync
    @Query("SELECT * FROM srs_card WHERE sync_status = 'PENDING'")
    suspend fun getPendingSync(): List<SrsCardEntity>

    // Mark đã sync
    @Query("UPDATE srs_card SET sync_status = 'SYNCED' WHERE id IN (:ids)")
    suspend fun markSynced(ids: List<Long>)
}
```

---

## Phần 4 — Offline-First Repository

### `data/repository/VocabularyRepositoryImpl.kt`

```kotlin
@Singleton
class VocabularyRepositoryImpl @Inject constructor(
    private val vocabDao: VocabularyDao,
    private val srsDao: SrsCardDao,
    private val syncQueueDao: SyncQueueDao,
    private val remoteSource: VocabularyRemoteDataSource,
    private val networkMonitor: NetworkMonitor,
) : VocabularyRepository {

    // ─── Read: luôn từ local DB ───────────────────────────────────────────
    override fun getVocabByLesson(lessonNumber: Int): Flow<List<Vocabulary>> =
        vocabDao.getByLesson(lessonNumber)
            .map { entities -> entities.map { it.toDomain() } }

    override fun getSrsQueue(): Flow<List<SrsCard>> =
        srsDao.getReviewQueue()
            .map { entities -> entities.map { it.toDomain() } }

    // ─── Write: local trước, queue sync ──────────────────────────────────
    override suspend fun updateSrsCard(card: SrsCard): Result<Unit> = runCatching {
        // 1. Update local ngay — user thấy result tức thì
        srsDao.updateAfterReview(
            id = card.id,
            easeFactor = card.easeFactor,
            interval = card.interval,
            repetitions = card.repetitions,
            nextReviewAt = card.nextReviewAt,
            mastered = card.mastered,
        )

        // 2. Queue để sync sau
        syncQueueDao.enqueue(
            SyncQueueEntity(
                operation = "UPDATE_SRS",
                entityId = card.id,
                payload = Gson().toJson(card),
            )
        )

        // 3. Nếu đang online → sync ngay
        if (networkMonitor.isOnline()) {
            syncSrsCard(card)
        }
        // Nếu offline → WorkManager sẽ sync khi có mạng
    }

    // ─── Sync từ server xuống local ──────────────────────────────────────
    override suspend fun sync(): Result<Unit> = runCatching {
        // 1. Upload pending changes trước
        flushSyncQueue()

        // 2. Download data mới từ server
        val remoteVocab = remoteSource.fetchVocab()
        vocabDao.upsertAll(remoteVocab.map { it.toEntity() })

        val remoteSrsCards = remoteSource.fetchSrsCards()
        remoteSrsCards.forEach { remote ->
            val local = srsDao.getByVocabId(remote.vocabularyId)
            // Server-wins: server data ghi đè local (trừ PENDING records)
            if (local == null || local.syncStatus != "PENDING") {
                srsDao.upsert(remote.toEntity(syncStatus = "SYNCED"))
            }
        }
    }

    private suspend fun flushSyncQueue() {
        val pending = syncQueueDao.getPending()
        for (item in pending) {
            try {
                when (item.operation) {
                    "UPDATE_SRS" -> {
                        val card = Gson().fromJson(item.payload, SrsCard::class.java)
                        remoteSource.updateSrsCard(card)
                        srsDao.markSynced(listOf(card.id))
                        syncQueueDao.delete(item.id)
                    }
                }
            } catch (e: Exception) {
                syncQueueDao.incrementRetry(item.id)
                if (item.retryCount >= 3) {
                    syncQueueDao.markFailed(item.id)
                }
            }
        }
    }

    private suspend fun syncSrsCard(card: SrsCard) {
        try {
            remoteSource.updateSrsCard(card)
            srsDao.markSynced(listOf(card.id))
            syncQueueDao.deleteByEntityId("UPDATE_SRS", card.id)
        } catch (e: Exception) {
            // Không throw — sync sẽ retry qua WorkManager
        }
    }
}
```

---

## Phần 5 — Conflict Resolution

```kotlin
// Chiến lược giải quyết conflict
sealed class ConflictStrategy {
    object ServerWins : ConflictStrategy()   // server ghi đè local
    object ClientWins : ConflictStrategy()   // local ghi đè server
    object LastWriteWins : ConflictStrategy() // so sánh updatedAt
    data class Manual(val resolver: (local: SrsCard, remote: SrsCard) -> SrsCard) : ConflictStrategy()
}

// Trong Repository — Last Write Wins cho SRS cards
private fun resolveConflict(local: SrsCardEntity, remote: SrsCardEntity): SrsCardEntity {
    return when {
        // Local có thay đổi chưa sync + remote mới hơn → CONFLICT, cần user quyết
        local.syncStatus == "PENDING" && remote.updatedAt > local.updatedAt -> {
            local.copy(syncStatus = "CONFLICT")
            // Lưu remote vào bảng conflict_queue để user review
        }

        // Local mới hơn (offline review) → giữ local
        local.updatedAt > remote.updatedAt -> local

        // Remote mới hơn → dùng remote
        else -> remote.copy(syncStatus = "SYNCED")
    }
}
```

---

## Phần 6 — WorkManager Sync

```kotlin
// Tự động sync khi có mạng
@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val vocabRepo: VocabularyRepository,
    private val authRepo: AuthRepository,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        // Không sync nếu chưa đăng nhập
        if (!authRepo.isLoggedIn()) return Result.success()

        return try {
            vocabRepo.sync().fold(
                onSuccess = { Result.success() },
                onFailure = {
                    if (runAttemptCount < 3) Result.retry()
                    else Result.failure()
                }
            )
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME = "SyncWorker"

        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            // Periodic sync mỗi 15 phút khi có mạng
            val periodicRequest = PeriodicWorkRequestBuilder<SyncWorker>(
                repeatInterval = 15,
                repeatIntervalTimeUnit = TimeUnit.MINUTES,
            )
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                periodicRequest,
            )
        }

        fun syncNow(context: Context) {
            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                "$WORK_NAME-immediate",
                ExistingWorkPolicy.REPLACE,
                request,
            )
        }
    }
}
```

---

## Phần 7 — Network Monitor

```kotlin
// Detect online/offline và trigger sync
@Singleton
class NetworkMonitor @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    fun isOnline(): Boolean {
        val network = connectivityManager.activeNetwork ?: return false
        val caps = connectivityManager.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    // Flow emit true/false khi network thay đổi
    val isOnlineFlow: Flow<Boolean> = callbackFlow {
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                trySend(true)
            }
            override fun onLost(network: Network) {
                trySend(false)
            }
        }

        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        connectivityManager.registerNetworkCallback(request, callback)
        trySend(isOnline())  // emit initial state

        awaitClose { connectivityManager.unregisterNetworkCallback(callback) }
    }.distinctUntilChanged()
}
```

---

## Phần 8 — ViewModel (Presentation Layer)

```kotlin
@HiltViewModel
class SrsViewModel @Inject constructor(
    private val getSrsQueue: GetSrsQueueUseCase,
    private val vocabRepo: VocabularyRepository,
    private val networkMonitor: NetworkMonitor,
) : ViewModel() {

    // UI state
    data class UiState(
        val cards: List<SrsCard> = emptyList(),
        val isLoading: Boolean = false,
        val isOnline: Boolean = true,
        val syncStatus: SyncStatus = SyncStatus.SYNCED,
        val error: String? = null,
    )

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        // Observe review queue từ Room — tự cập nhật khi DB thay đổi
        viewModelScope.launch {
            getSrsQueue().collect { cards ->
                _uiState.update { it.copy(cards = cards, isLoading = false) }
            }
        }

        // Observe network status
        viewModelScope.launch {
            networkMonitor.isOnlineFlow.collect { online ->
                _uiState.update { it.copy(isOnline = online) }
                if (online) {
                    // Vừa có mạng → sync ngay
                    vocabRepo.sync()
                }
            }
        }
    }

    fun onCardReviewed(card: SrsCard, quality: Int) {
        viewModelScope.launch {
            // Calculate next review (SM-2)
            val updated = calculateNextReview(card, quality)

            // Optimistic update — ViewModel đã thấy result từ Flow
            // Room emit mới ngay sau khi update
            vocabRepo.updateSrsCard(updated).onFailure { error ->
                _uiState.update { it.copy(error = error.message) }
            }
        }
    }

    fun onRetrySync() {
        viewModelScope.launch {
            _uiState.update { it.copy(syncStatus = SyncStatus.PENDING) }
            vocabRepo.sync()
                .onSuccess { _uiState.update { it.copy(syncStatus = SyncStatus.SYNCED) } }
                .onFailure { _uiState.update { it.copy(syncStatus = SyncStatus.PENDING) } }
        }
    }
}
```

---

## Phần 9 — UI (Jetpack Compose)

```kotlin
@Composable
fun SrsScreen(viewModel: SrsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ôn tập") },
                actions = {
                    // Offline indicator
                    if (!uiState.isOnline) {
                        Row(
                            modifier = Modifier.padding(end = 16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Icon(
                                Icons.Default.CloudOff,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(16.dp),
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(
                                "Offline",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.error,
                            )
                        }
                    }
                }
            )
        }
    ) { padding ->
        when {
            uiState.isLoading -> LoadingIndicator()

            uiState.cards.isEmpty() -> EmptyState(
                message = "Không có thẻ cần ôn hôm nay 🎉"
            )

            else -> SrsCardStack(
                cards = uiState.cards,
                onReviewed = { card, quality ->
                    viewModel.onCardReviewed(card, quality)
                },
                modifier = Modifier.padding(padding),
            )
        }

        // Error snackbar
        uiState.error?.let { error ->
            LaunchedEffect(error) {
                // Show snackbar
            }
        }
    }
}

@Composable
fun SrsCardStack(
    cards: List<SrsCard>,
    onReviewed: (SrsCard, Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    val currentCard = cards.firstOrNull() ?: return

    Column(modifier = modifier.fillMaxSize().padding(16.dp)) {
        // Progress
        LinearProgressIndicator(
            progress = { 1f - cards.size.toFloat() / (cards.size + 1) },
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(16.dp))

        // Card
        var showAnswer by remember { mutableStateOf(false) }

        Card(
            modifier = Modifier.fillMaxWidth().weight(1f),
            elevation = CardDefaults.cardElevation(4.dp),
        ) {
            Column(
                modifier = Modifier.fillMaxSize().padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    text = currentCard.kana,  // cần map từ vocabId
                    style = MaterialTheme.typography.displayMedium,
                )
                if (showAnswer) {
                    Spacer(Modifier.height(16.dp))
                    Text(
                        text = currentCard.meaning,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // Actions
        if (!showAnswer) {
            Button(
                onClick = { showAnswer = true },
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Xem đáp án") }
        } else {
            // Quality buttons 0-5
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("Quên" to 0, "Khó" to 2, "OK" to 3, "Dễ" to 5).forEach { (label, quality) ->
                    OutlinedButton(
                        onClick = {
                            onReviewed(currentCard, quality)
                            showAnswer = false
                        },
                        modifier = Modifier.weight(1f),
                    ) { Text(label) }
                }
            }
        }
    }
}
```

---

## Phần 10 — DI Module

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, AppDatabase.DB_NAME)
            .fallbackToDestructiveMigration()  // dev only; production dùng Migration class
            .build()

    @Provides fun provideVocabDao(db: AppDatabase) = db.vocabDao()
    @Provides fun provideSrsDao(db: AppDatabase) = db.srsDao()
    @Provides fun provideSyncQueueDao(db: AppDatabase) = db.syncQueueDao()
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideOkHttp(): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor())           // attach JWT token
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                    else HttpLoggingInterceptor.Level.NONE
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(okHttp: OkHttpClient): Retrofit = Retrofit.Builder()
        .baseUrl("http://10.0.2.2:3000/api/")  // localhost của máy host từ emulator
        .client(okHttp)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    @Provides
    fun provideVocabApi(retrofit: Retrofit): VocabularyApi =
        retrofit.create(VocabularyApi::class.java)
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindVocabRepo(impl: VocabularyRepositoryImpl): VocabularyRepository
}
```

---

## Phần 11 — Auth Interceptor

```kotlin
class AuthInterceptor @Inject constructor(
    private val tokenStore: TokenStore,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = tokenStore.getAccessToken() ?: return chain.proceed(chain.request())

        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        val response = chain.proceed(request)

        // Token expired → refresh
        if (response.code == 401) {
            response.close()
            val refreshed = runBlocking { tokenStore.refresh() }
            if (refreshed != null) {
                val retryRequest = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $refreshed")
                    .build()
                return chain.proceed(retryRequest)
            }
        }

        return response
    }
}
```

---

## Phần 12 — Application class

```kotlin
@HiltAndroidApp
class EduApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Schedule background sync
        SyncWorker.schedule(this)
    }
}
```

---

## File structure

```
app/src/main/java/com/edu/nihongo/
├── domain/
│   ├── entity/
│   │   ├── Vocabulary.kt
│   │   ├── SrsCard.kt
│   │   └── SyncStatus.kt
│   ├── repository/
│   │   └── VocabularyRepository.kt
│   └── usecase/
│       ├── GetSrsQueueUseCase.kt
│       └── GetVocabByLessonUseCase.kt
│
├── data/
│   ├── local/
│   │   ├── AppDatabase.kt
│   │   ├── entity/
│   │   │   ├── VocabularyEntity.kt
│   │   │   ├── SrsCardEntity.kt
│   │   │   └── SyncQueueEntity.kt
│   │   ├── dao/
│   │   │   ├── VocabularyDao.kt
│   │   │   ├── SrsCardDao.kt
│   │   │   └── SyncQueueDao.kt
│   │   └── Converters.kt
│   ├── remote/
│   │   ├── VocabularyApi.kt
│   │   └── VocabularyRemoteDataSource.kt
│   ├── repository/
│   │   └── VocabularyRepositoryImpl.kt
│   └── sync/
│       └── SyncWorker.kt
│
├── presentation/
│   ├── srs/
│   │   ├── SrsViewModel.kt
│   │   └── SrsScreen.kt
│   ├── vocab/
│   │   ├── VocabViewModel.kt
│   │   └── VocabScreen.kt
│   └── navigation/
│       └── AppNavigation.kt
│
├── di/
│   ├── DatabaseModule.kt
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
│
├── util/
│   ├── NetworkMonitor.kt
│   └── SrsAlgorithm.kt
│
└── EduApp.kt
```

---

## Nguyên tắc senior cho offline-first

```
1. Single source of truth: Room là nguồn duy nhất UI đọc
   → Không đọc từ API response trực tiếp vào UI

2. Optimistic updates: ghi local trước, sync sau
   → User không đợi network

3. Sync queue: mọi write đều qua queue
   → Không mất data khi mất kết nối giữa chừng

4. Conflict strategy rõ ràng trước khi code:
   → SRS reviews: Last Write Wins (updatedAt)
   → Vocab content: Server Wins (admin data)
   → User notes: Client Wins (personal data)

5. Idempotent sync: gửi cùng operation nhiều lần → OK
   → SRS update dùng PUT /srs/:id (idempotent)
   → Không dùng POST /srs/:id/review (tạo event mới mỗi lần)

6. Exponential backoff retry:
   → Retry 1: 1 phút
   → Retry 2: 2 phút
   → Retry 3: 4 phút → mark FAILED, alert user

7. Migration Room database:
   → Production KHÔNG dùng fallbackToDestructiveMigration()
   → Viết Migration class cho mỗi version bump
```
