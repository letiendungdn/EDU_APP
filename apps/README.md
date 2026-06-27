# Micro Frontends

Frontend apps độc lập, deploy riêng, liên kết qua nav switcher.

| App | Folder | Port | Stack |
|-----|--------|------|-------|
| **nihongo-web** | `nihongo-web/` | 5173 | Next.js 15 — học tiếng Nhật |
| **english-web** | `english-web/` | 3001 | Next.js 16 — học tiếng Anh |

## Chạy dev

```bash
npm run dev:nihongo-web   # :5173
npm run dev:english-web   # :3001
```

## Cross-link

- `nihongo-web`: `NEXT_PUBLIC_ENGLISH_APP_URL=http://localhost:3001`
- `english-web`: `NEXT_PUBLIC_NIHONGO_APP_URL=http://localhost:5173`

## Shared packages

- `@edu/vocab-images` — OpenMoji picture dictionary (dùng chung cả 2 app)
