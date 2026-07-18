# Nihongo Flutter — offline-first

App mobile học tiếng Nhật (EDU APP), kiến trúc Clean Architecture + Drift + Riverpod.

## Chạy

```bash
cd apps/nihongo_flutter
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run                 # Android / iOS device
flutter run -d chrome       # Web (Drift WASM trong web/)
```

Chrome cần file `web/sqlite3.wasm` + `web/drift_worker.js` (đã có sẵn).  
Màn **Dịch camera** trên web chỉ hiện stub (ML Kit không chạy browser).

## API base URL

- Android emulator: `http://10.0.2.2:8080/api`
- Chrome / web: `http://localhost:8080/api` (Docker nginx)

Máy thật / iOS simulator:

```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8080/api
```

## Tính năng MVP

- **Từ vựng**: tải theo bài từ `GET /api/vocabularies`, lưu SQLite, đọc offline
- **SRS**: ôn flashcard local (SM-2), sync queue khi đăng nhập + có mạng (`POST /api/progress/review`)
- **Đăng nhập**: JWT lưu secure storage

## Cấu trúc

```
lib/
├── domain/     # entity, repository interface, use case
├── data/       # Drift, Dio, repository impl
├── presentation/
├── providers.dart
└── utils/
```

Chi tiết kiến trúc: [docs/cursor-flutter-offline.md](../../docs/cursor-flutter-offline.md)
