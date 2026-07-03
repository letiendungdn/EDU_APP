# Nihongo Flutter — offline-first

App mobile học tiếng Nhật (EDU APP), kiến trúc Clean Architecture + Drift + Riverpod.

## Chạy

```bash
cd apps/nihongo_flutter
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

## API base URL

Mặc định Android emulator: `http://10.0.2.2:8080/api` (nginx Docker).

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
