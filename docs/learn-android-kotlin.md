# Học Android Kotlin — Từ Project Nihongo

> **Tài liệu học có lộ trình tuần + bài tập gắn code thật** trong monorepo.  
> Roadmap kỹ thuật chi tiết (Room, Compose, Hilt…): [roadmap-android.md](./roadmap-android.md).  
> Chạy app: [run-mobile.md](./run-mobile.md) · Stack so sánh: [mobile-tech-stacks.md](./mobile-tech-stacks.md) · Phỏng vấn: [interview-backend-android-rn-swift.md](./interview-backend-android-rn-swift.md).

---

## Mục tiêu

Sau **8–10 tuần** (≈ 2 giờ/ngày, 5 ngày/tuần), bạn có thể:

- Đọc và sửa `apps/nihongo-android` (Kotlin + Jetpack Compose + Hilt + Room).
- Giải thích luồng **UI → ViewModel → UseCase → Repository → Room/Retrofit**.
- Debug trên emulator, Logcat, Layout Inspector.
- Viết unit test ViewModel và chạy `.\gradlew.bat testDebugUnitTest`.

**Nguyên tắc:** Học Kotlin song song Android — mỗi khái niệm mở file tương ứng trong repo, không học lý thuyết tách rời.

---

## Chuẩn bị môi trường

| Công cụ | Phiên bản trong repo | Ghi chú |
|---------|----------------------|---------|
| JDK | **17** | Android Gradle Plugin yêu cầu |
| Android Studio | Ladybug trở lên | SDK **35**, minSdk **24** |
| Kotlin | theo AGP trong `apps/nihongo-android` | Compose compiler plugin |
| Emulator | API 34–35 | API qua `10.0.2.2:8080` — xem [nginx.md](./nginx.md) |

```powershell
# Backend + nginx (API cho app)
cd C:\Users\dungle\Desktop\edu_app
npm run docker:up:nihongo

# Build & cài app
cd apps\nihongo-android
.\gradlew.bat installDebug
```

Mở **Android Studio** → Open `apps/nihongo-android` → Run trên emulator.

**Checkpoint:** App mở được màn Home, vào Từ vựng thấy danh sách (cần Docker postgres + content-service đang chạy).

---

## Bản đồ thư mục `nihongo-android`

```
app/src/main/java/com/edu/nihongo/
├── MainActivity.kt              Entry Compose
├── EduApp.kt                    @HiltAndroidApp
├── presentation/                UI + ViewModel (Compose)
│   ├── vocab/VocabScreen.kt
│   ├── vocab/VocabViewModel.kt
│   ├── srs/SrsViewModel.kt
│   └── ...
├── domain/                      Business thuần (không Android SDK)
│   ├── entity/Entities.kt
│   ├── repository/Repositories.kt   (interface)
│   └── usecase/UseCases.kt
├── data/
│   ├── local/                   Room DB, DAO, TokenStore
│   ├── remote/                  Retrofit Api, AuthInterceptor
│   └── repository/              RepositoryImpl
├── di/AppModule.kt              Hilt @Provides / @Binds
└── utils/                       SRS, TTS, thuật toán thuần
```

Luồng dữ liệu chuẩn:

```
Compose Screen
    ↓ collectAsStateWithLifecycle()
ViewModel (StateFlow)
    ↓ UseCase
Repository (interface)
    ↓
RepositoryImpl → Room (Flow) + Retrofit (suspend)
```

---

# Phần A — Kotlin cần thuộc (tuần 1–2)

## 1. Null safety

```kotlin
var s: String = "N5"      // không null
var s2: String? = null    // nullable
val len = s2?.length      // Int?
val safe = s2 ?: 0        // elvis — default khi null
// s2!!  — tránh trong production
```

**Tự kiểm tra:** `String?` khác `String` thế nào? Khi nào dùng `?.` vs `?:`?

**Đọc trong repo:** `domain/entity/Entities.kt` — field nullable vs non-null.

---

## 2. Data class, copy, destructuring

```kotlin
data class VocabUiState(
    val items: List<Vocabulary> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

_uiState.update { it.copy(isLoading = false, error = null) }
```

**Đọc:** `presentation/vocab/VocabViewModel.kt` — pattern `VocabUiState` + `MutableStateFlow.update`.

---

## 3. Sealed class / interface — UI state & kết quả API

```kotlin
sealed interface LoadState<out T> {
    data object Loading : LoadState<Nothing>
    data class Success<T>(val data: T) : LoadState<T>
    data class Error(val message: String) : LoadState<Nothing>
}
```

Dùng với `when` exhaustive — compiler bắt xử lý hết nhánh.

**So sánh Flutter:** `sealed class` ≈ union type / Freezed.

---

## 4. Extension function

```kotlin
fun String.isKana(): Boolean =
    any { it.code in 0x3040..0x30FF || it.code in 0x30A0..0x30FF }
```

Thêm hành vi mà không sửa class gốc — hay dùng cho mapper, formatter.

---

## 5. Coroutines & Flow

| Khái niệm | Ý nghĩa | Android dùng ở đâu |
|-----------|---------|-------------------|
| `suspend fun` | Hàm có thể tạm dừng, không block thread | Retrofit, Room `@Insert` |
| `launch` | Fire-and-forget trong scope | `viewModelScope.launch` |
| `Flow<T>` | Stream nhiều giá trị | Room `@Query` trả `Flow` |
| `StateFlow` | Flow giữ **1** giá trị hiện tại | UI state trong ViewModel |
| `collect` | Lắng nghe Flow | Trong `viewModelScope` |

```kotlin
// VocabViewModel — collect Flow từ UseCase
viewModelScope.launch {
    getVocabByLesson(lessonNumber).collect { list ->
        _uiState.update { it.copy(items = list, isLoading = false) }
    }
}
```

**Tự kiểm tra:**

1. `viewModelScope` hủy coroutine khi nào? → Khi ViewModel cleared (màn hình bị pop).
2. `Dispatchers.Main` vs `Dispatchers.IO` — Repository nên `withContext(IO)` khi đọc file nặng.
3. `Flow` vs `LiveData` — project này dùng **Flow + StateFlow** (LiveData legacy).

**Tài liệu:** [Kotlin coroutines guide](https://kotlinlang.org/docs/coroutines-guide.html) · [Flow](https://kotlinlang.org/docs/flow.html).

---

## 6. Scope functions: `let`, `run`, `apply`, `also`, `with`

Hay gặp nhất:

```kotlin
token?.let { bearer ->
    request.newBuilder().header("Authorization", "Bearer $bearer").build()
}
```

**Đọc:** `data/remote/AuthInterceptor.kt`.

---

### Bài tập tuần 1–2

1. Làm [Kotlin Koans](https://play.kotlinlang.org/koans/overview) (Null safety + Classes, ~2 giờ).
2. Mở `utils/SrsAlgorithm.kt` — đọc hết, chạy `SrsAlgorithmTest`.
3. Viết thêm 1 test case trong `app/src/test/.../SrsAlgorithmTest.kt`.

---

# Phần B — Android core (tuần 3–4)

## 7. Activity, lifecycle, Compose entry

```kotlin
// MainActivity.kt — setContent { NihongoApp() }
```

Compose **không** dùng XML layout cho màn chính. `Activity` chỉ host `setContent`.

**Lifecycle:** `collectAsStateWithLifecycle()` — ngừng collect khi app background → tiết kiệm pin.

---

## 8. Jetpack Compose cơ bản

| Compose | Flutter tương đương |
|---------|---------------------|
| `@Composable fun` | `Widget build()` |
| `remember { mutableStateOf() }` | `useState` |
| `LazyColumn` | `ListView.builder` |
| `Modifier.padding()` | `Padding` |
| `MaterialTheme` | `ThemeData` |

**Đọc theo thứ tự:**

1. `presentation/home/HomeScreen.kt`
2. `presentation/vocab/VocabScreen.kt`
3. `presentation/theme/Theme.kt`

**Quy tắc state hoisting:** State sống ở ViewModel (`StateFlow`); Composable chỉ `collect` và gọi callback.

---

## 9. ViewModel + UiState

Pattern chuẩn trong repo:

```kotlin
@HiltViewModel
class VocabViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    getVocabByLesson: GetVocabByLessonUseCase,
    private val syncLesson: SyncLessonUseCase,
) : ViewModel() {
    private val _uiState = MutableStateFlow(VocabUiState())
    val uiState: StateFlow<VocabUiState> = _uiState.asStateFlow()
    // ...
}
```

**Không** giữ `Context` trong ViewModel. **Không** gọi Retrofit trực tiếp từ Composable.

---

## 10. Navigation Compose

**Đọc:** `presentation/NihongoApp.kt` — `NavHost`, routes, arguments (`lesson` cho Vocab).

```kotlin
// Ví dụ pattern
composable("vocab/{lesson}") { backStackEntry ->
    val lesson = backStackEntry.arguments?.getString("lesson")?.toIntOrNull() ?: 1
    VocabScreen(lesson = lesson)
}
```

---

### Bài tập tuần 3–4

1. Thêm label debug vào `VocabScreen` (ví dụ hiển thị `lessonNumber`).
2. Trace Logcat filter `VocabViewModel` khi đổi bài.
3. Vẽ sơ đồ 1 màn hình: Screen → ViewModel → UseCase → Repository.

---

# Phần C — Data layer (tuần 5–6)

## 11. Room — SQLite offline-first

**Đọc:**

- `data/local/AppDatabase.kt`
- `data/local/dao/Daos.kt`
- `data/local/entity/Entities.kt`
- `data/local/Mappers.kt` — Entity ↔ Domain

Pattern:

```kotlin
@Query("SELECT * FROM vocabulary WHERE lesson_number = :lesson")
fun watchByLesson(lesson: Int): Flow<List<VocabularyEntity>>
```

Flow tự emit lại khi bảng thay đổi — UI cập nhật không cần refresh tay.

---

## 12. Retrofit + OkHttp

**Đọc:**

- `data/remote/Api.kt`, `VocabularyApi`
- `di/AppModule.kt` — `Retrofit.Builder`, `OkHttpClient`
- `data/remote/AuthInterceptor.kt` — gắn JWT
- `data/local/TokenStore.kt` — lưu token

Base URL emulator: `http://10.0.2.2:8080/api/` (nginx → gateway). **Không** dùng `localhost` trên emulator.

---

## 13. Repository pattern

```kotlin
// domain/repository/Repositories.kt — interface
interface VocabularyRepository {
    fun watchByLesson(lesson: Int): Flow<List<Vocabulary>>
    suspend fun syncLesson(lesson: Int): Result<Unit>
}

// data/repository/RepositoriesImpl.kt — triển khai
```

UseCase gọi Repository; ViewModel gọi UseCase — giữ domain không phụ thuộc Android.

**Đọc:** `domain/usecase/UseCases.kt`, `data/repository/RepositoriesImpl.kt`.

---

## 14. Hilt — Dependency Injection

```kotlin
@HiltAndroidApp
class EduApp : Application()

@HiltViewModel
class VocabViewModel @Inject constructor(...)

@Module @InstallIn(SingletonComponent::class)
object AppModule {
    @Provides @Singleton
    fun provideDatabase(...): AppDatabase = ...
}
```

**Tự kiểm tra:** `@Inject constructor` vs `@Provides` — khi nào dùng `@Binds`?

---

### Bài tập tuần 5–6

1. Bật `HttpLoggingInterceptor` (DEBUG) — xem request `/api/vocabularies` trong Logcat.
2. Airplane mode → mở Vocab → vẫn thấy data cache Room?
3. Đọc `NetworkMonitor.kt` — app xử lý offline thế nào.

---

# Phần D — Feature nâng cao (tuần 7–8)

## 15. Auth — Keycloak / AppAuth

**Đọc:** `data/remote/KeycloakAuth.kt`, `presentation/login/LoginScreen.kt`, `LoginViewModel.kt`.

Redirect URI: `com.edu.nihongo:/oauth2redirect` — khớp `AndroidManifest` + Keycloak client.

Chi tiết server: [keycloak-setup.md](./keycloak-setup.md).

---

## 16. Camera + ML Kit OCR

**Đọc:** `presentation/camera/CameraTranslateScreen.kt`, `CameraTranslateViewModel.kt`.

Quyền runtime: `CAMERA` — xin trước khi bind CameraX.

---

## 17. LiveKit livestream

**Đọc:** `presentation/live/` — `LiveListScreen`, `LiveViewerScreen`, `LiveApi.kt`.

Dependency: `livekit-android` — tương đương LiveKit trên web/Flutter.

---

## 18. WorkManager & sync queue (nếu mở rộng)

Roadmap chi tiết: [roadmap-android.md](./roadmap-android.md) — mục WorkManager.  
Repo có `SyncQueueDao` — đọc schema sync pending.

---

## 19. Testing

```powershell
cd apps\nihongo-android
.\gradlew.bat testDebugUnitTest
```

**Đọc mẫu:** `app/src/test/java/com/edu/nihongo/utils/SrsAlgorithmTest.kt`

ViewModel test: MockK + `kotlinx-coroutines-test` + `runTest { }`.

Học thêm: [learn-testing.md](./learn-testing.md).

---

### Bài tập tuần 7–8

1. Viết 1 unit test cho hàm pure trong `utils/`.
2. Chạy login Keycloak trên emulator (backend + Keycloak Docker).
3. (Tuỳ chọn) Thêm màn Compose đơn giản và route trong `NihongoApp.kt`.

---

# Phần E — Senior & ship (tuần 9–10)

Checklist từ [learn-mobile-senior.md](./learn-mobile-senior.md):

- [ ] FCM push token gửi lên backend
- [ ] Deep link `https://nihongo.app/...`
- [ ] ProGuard / R8 khi release
- [ ] Baseline Profile (khởi động nhanh)
- [ ] `targetSdk 35` trước khi lên Play Store

Phỏng vấn ôn: [interview-mobile.md](./interview-mobile.md), mục Android trong [interview-backend-android-rn-swift.md](./interview-backend-android-rn-swift.md).

---

## Lộ trình 10 tuần (tóm tắt)

| Tuần | Trọng tâm | File / việc |
|------|-----------|-------------|
| 1 | Kotlin syntax, null, data class | Koans + `SrsAlgorithm.kt` |
| 2 | Coroutines, Flow, sealed class | `VocabViewModel.kt` |
| 3 | Compose layout, theme | `HomeScreen`, `VocabScreen` |
| 4 | ViewModel, Navigation | `NihongoApp.kt` |
| 5 | Room, mapper | `AppDatabase`, `Daos.kt` |
| 6 | Retrofit, Hilt, Repository | `AppModule.kt`, `RepositoriesImpl.kt` |
| 7 | Auth Keycloak | `LoginScreen`, `KeycloakAuth.kt` |
| 8 | Camera / Live (đọc) | `camera/`, `live/` |
| 9 | Test + debug | `SrsAlgorithmTest`, Logcat |
| 10 | Senior checklist + MR nhỏ | Sửa 1 bug/feature nhỏ, mở MR |

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| API connection refused | Dùng `localhost` trên emulator | Đổi `10.0.2.2:8080` |
| 401 mọi request | Token hết hạn / chưa login | Login lại, check `TokenStore` |
| UI không cập nhật | Collect Flow sai scope | Dùng `collectAsStateWithLifecycle` |
| Hilt crash startup | Thiếu `@HiltAndroidApp` | Check `EduApp.kt`, rebuild |
| Gradle SDK not found | Thiếu `local.properties` | `sdk.dir=...` — xem [run-mobile.md](./run-mobile.md) |
| Compose recompose vô hạn | Tạo state mới mỗi frame | `remember`, hoist state lên VM |

---

## Tài liệu bên ngoài (chọn lọc)

| Loại | Link |
|------|------|
| Kotlin chính thức | [kotlinlang.org/docs](https://kotlinlang.org/docs/home.html) |
| Android Compose | [developer.android.com/jetpack/compose](https://developer.android.com/jetpack/compose) |
| Codelabs miễn phí | [Android Basics in Kotlin](https://developer.android.com/courses/android-basics-compose/course) |
| Sample production | [Now in Android](https://github.com/android/nowinandroid) |
| Coroutines sách | *Kotlin Coroutines Deep Dive* — Ignatian Bermejo |
| Video | Philipp Lackner (YouTube) |

---

## Doc liên quan trong repo

| Doc | Khi nào đọc |
|-----|-------------|
| [roadmap-android.md](./roadmap-android.md) | Code mẫu đầy đủ từng Jetpack |
| [run-mobile.md](./run-mobile.md) | Chạy emulator, Gradle, API URL |
| [mobile-tech-stacks.md](./mobile-tech-stacks.md) | So sánh Kotlin vs Flutter/RN |
| [learn-edu-app.md](./learn-edu-app.md) | Học cả monorepo (backend + mobile) |
| [learn-mobile-senior.md](./learn-mobile-senior.md) | Push, deep link, ship store |
| [nginx.md](./nginx.md) | Vì sao Android dùng `:8080` |

---

## Câu hỏi tự ôn (trước phỏng vấn)

1. Giải thích vòng đời request: user tap → Compose → ViewModel → Repository → API → Room → UI update.
2. `StateFlow` vs `SharedFlow` — project dùng cái nào cho UI state?
3. Vì sao Repository trả `Flow` thay vì `suspend fun` list một lần?
4. `@HiltViewModel` inject được gì? Scope sống bao lâu?
5. Emulator truy cập Postgres/API trên máy host thế nào?
6. So sánh Clean Architecture folder `presentation/domain/data` với Flutter app trong cùng monorepo.

Trả lời được 6 câu → đủ tự tin sửa feature mới trên `nihongo-android`.
