# Nihongo Learn — Angular

Phiên bản Angular học song song với `nihongo-web` (React/Next.js).

## Chạy dev

```bash
# Từ root monorepo — cần api-gateway đang chạy (port 3000)
npm run dev:nihongo-angular
```

Mở **http://localhost:5174** — proxy `/api` → `http://localhost:3000`.

## Đã port

| Route | Trang |
|-------|--------|
| `/` | Home |
| `/vocab` | Flashcard từ vựng |
| `/grammar` | Ngữ pháp + ví dụ |
| `/kanji/list` | Bảng kanji JLPT |
| `/vocab/picture` | Từ điển tranh (1 bài / nhiều bài) |

Các route khác hiện là placeholder — migrate dần từ React.

## Cấu trúc (học Angular)

```
src/app/
  core/          → models, ApiService, utils
  layout/        → shell + nav
  shared/        → LessonSelector, ComingSoon
  features/      → page components (standalone)
  app.routes.ts  → lazy load từng feature
```

**Patterns dùng:** standalone components, signals, `inject()`, `toSignal` + RxJS, lazy routes.

## So với React app

| React | Angular |
|-------|---------|
| `useQuery` | `toSignal(http.get(...))` |
| `useState` | `signal()` |
| `useMemo` | `computed()` |
| Next.js page | `app.routes.ts` + component |
| `fetchKanjiByJlpt` | `ApiService.getKanjiByJlpt()` |
