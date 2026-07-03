# Nihongo Mobile (React Native / Expo)

App React Native (Expo) cho EDU APP — offline-first + dịch camera trực tiếp.

## Stack

- **Expo SDK 57** + **expo-router**
- **expo-sqlite** (SQLite local)
- **expo-secure-store** (JWT)
- **axios** → api-gateway
- **expo-camera** + **@react-native-ml-kit/text-recognition** (OCR tiếng Nhật)

## Tính năng

| Màn hình | Mô tả |
|----------|--------|
| Home | Điều hướng + online/offline |
| Từ vựng | SQLite + sync `GET /api/vocabularies` |
| SRS | SM-2, queue sync local |
| Đăng nhập | `POST /api/auth/login` |
| **Dịch camera** | Quét frame tự động (~1s) → OCR → `/api/translate` → overlay |

## API mặc định

Emulator Android: `http://10.0.2.2:8080/api` (cấu hình trong `app.json` → `extra.apiBaseUrl`).

Máy thật: đổi IP LAN của máy host.

## Chạy

> **Lưu ý:** Camera + ML Kit cần **development build** (`expo run:android`), không chạy đủ trên Expo Go.

```bash
# Backend
docker compose up -d

# Cài dependencies (từ root monorepo hoặc trong app)
cd apps/nihongo-mobile
npm install

# Android dev build
npx expo prebuild --platform android
npm run android
```

## Scripts

```bash
npm start          # Metro bundler
npm run android    # Build & chạy Android
npm run typecheck  # TypeScript
```

## Cấu trúc

```
app/                 # expo-router screens
src/
  config/            # API base URL
  data/              # SQLite, axios, repository
  domain/            # entities
  utils/             # SRS, overlay mapping
  components/
  hooks/
```

## So sánh 3 app mobile

| | Flutter | Android native | React Native |
|--|---------|----------------|--------------|
| Path | `nihongo_flutter` | `nihongo-android` | `nihongo-mobile` |
| DB | Drift | Room | expo-sqlite |
| State | Riverpod | ViewModel + Flow | React hooks |
| Camera | camera + ML Kit | CameraX + ML Kit | expo-camera + ML Kit |
