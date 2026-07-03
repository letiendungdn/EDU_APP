# Nihongo Android (Native)

App Android native Kotlin cho EDU APP — offline-first + dịch camera trực tiếp.

## Stack

- **Kotlin** + **Jetpack Compose**
- **Room** (SQLite), **Hilt**, **Retrofit**
- **CameraX** + **ML Kit** (OCR tiếng Nhật on-device)
- **Coroutines / Flow**

## Tính năng

| Màn hình | Mô tả |
|----------|--------|
| Home | Điều hướng chính, trạng thái online/offline |
| Từ vựng | Đọc từ SQLite, sync `GET /api/vocabularies` khi có mạng |
| SRS | Ôn tập SM-2, ghi local + queue sync |
| Đăng nhập | `POST /api/auth/login` |
| **Dịch camera** | Stream camera live → OCR → `POST /api/translate` → overlay tiếng Việt |

## API mặc định

Emulator: `http://10.0.2.2:8080/api/` (nginx Docker trên máy host).

Máy thật — sửa trong `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.x.x:8080/api/\"")
```

## Chạy

```bash
# Backend
docker compose up -d

# Build & cài APK debug
cd apps/nihongo-android
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

Mở project bằng **Android Studio** → Run trên emulator hoặc thiết bị thật.

## Kiến trúc

```
presentation/   → Compose UI + ViewModel
domain/         → Entity, Repository interface, UseCase
data/           → Room, Retrofit, RepositoryImpl
di/             → Hilt modules
```

## Dịch camera

- Không chụp ảnh — dùng `ImageAnalysis` stream (~1 frame/giây)
- OCR: ML Kit Japanese
- Dịch: backend MyMemory qua `/api/translate` (cần mạng)
