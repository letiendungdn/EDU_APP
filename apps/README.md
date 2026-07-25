# Micro Frontends

Frontend apps độc lập, deploy riêng, liên kết qua nav switcher.

| App | Folder | Port | Stack |
|-----|--------|------|-------|
| **nihongo-web** | `nihongo-web/` | 5173 | Next.js — học tiếng Nhật |
| **nihongo-angular** | `nihongo-angular/` | 5174 | Angular 19 — gần parity web |
| **english-web** | `english-web/` | 3001 | Next.js — học tiếng Anh *(Compose profile `english`)* |

## Chạy dev

```bash
npm run dev:nihongo-web       # :5173
npm run dev:nihongo-angular   # :5174
npm run dev:english-web       # :3001
```

Hướng dẫn đầy đủ: [docs/run-local.md](../docs/run-local.md) · Lộ trình Angular: [docs/roadmap-angular.md](../docs/roadmap-angular.md) · Lộ trình ReactJS: [docs/roadmap-reactjs.md](../docs/roadmap-reactjs.md)

## Cross-link

- `nihongo-web`: `NEXT_PUBLIC_ENGLISH_APP_URL=http://localhost:3001`
- `english-web`: `NEXT_PUBLIC_NIHONGO_APP_URL=http://localhost:5173`
- Docker: `nihongo.localhost` / `nihongo-angular.localhost` / `english.localhost` qua nginx `:8080` — [docs/docker.md](../docs/docker.md)

## Shared packages

- `@edu/vocab-images` — OpenMoji picture dictionary (Next + Angular)

## App mobile

| App | Folder | Stack |
|-----|--------|-------|
| **nihongo-mobile** | `nihongo-mobile/` | Expo / React Native |
| **nihongo-android** | `nihongo-android/` | Kotlin + Compose |
| **nihongo_flutter** | `nihongo_flutter/` | Flutter + Drift |
| **nihongo-ios** | `nihongo-ios/` | SwiftUI *(macOS)* |

Cách chạy từng app: [docs/run-mobile.md](../docs/run-mobile.md) · Tech inventory: [docs/mobile-tech-stacks.md](../docs/mobile-tech-stacks.md)
