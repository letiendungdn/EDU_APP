# Lộ trình Angular — `apps/nihongo-angular`

> **Lộ trình học** (Angular 19 + TypeScript + RxJS), không phải bảng status feature.  
> App thật: `apps/nihongo-angular` — port **5174**, proxy `/api` → gateway.  
> Chạy: [run-local.md](./run-local.md) · Docker: [docker.md](./docker.md) · Auth: [keycloak-setup.md](./keycloak-setup.md).

---

## Mục tiêu sau lộ trình

Đọc / sửa được app Angular trong monorepo này: routing lazy, auth JWT + Keycloak OIDC, gọi API envelope `{ success, data }`, Stripe checkout, feature pages (vocab / SRS / admin), build Docker qua nginx `nihongo-angular.localhost:8080`.

| Công cụ trong repo | Ghi chú |
|--------------------|---------|
| Angular **19** | Standalone components, `loadComponent` |
| TypeScript ~5.7 | Strict app tsconfig |
| RxJS ~7.8 | `zone.js` còn dùng |
| `oidc-client-ts` | Keycloak OIDC |
| `@stripe/stripe-js` | Pricing / payment |
| `apiFetch` / localStorage token | `core/http/api-client.ts` |

---

## GIAI ĐOẠN 1 — TypeScript + RxJS (tuần 1–3)

### TypeScript cần nắm

```typescript
// Union / narrowing — hay gặp khi unwrap API
type ApiResult<T> = { success: true; data: T } | { success: false; message: string };

function unwrap<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'success' in json) {
    return (json as { success: true; data: T }).data;
  }
  return json as T;
}

// Generics — apiFetch<T>
async function apiFetch<T>(path: string): Promise<T> { /* … */ }

// Interface models — xem core/models/
interface Vocabulary {
  id: number;
  kana: string;
  meaning: string;
  lessonNumber: number;
}
```

### RxJS tối thiểu

```typescript
import { Observable, of, catchError, map, switchMap } from 'rxjs';

// Angular HttpClient trả Observable — biết subscribe / async pipe
of(1).pipe(
  map((n) => n * 2),
  switchMap((n) => of(`id-${n}`)),
  catchError(() => of('fallback')),
);
```

**Trong app này:** nhiều chỗ dùng `fetch` + `async`/`await` (`api-client.ts`) thay vì `HttpClient` thuần — vẫn nên biết Observable vì DI services / forms / router events dùng RxJS.

**Tài liệu:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) · [RxJS overview](https://rxjs.dev/guide/overview)

**Checkpoint:** giải thích được `unwrap`, refresh token single-flight (`refreshInFlight`), và vì sao `credentials: 'include'` trên `/api/auth/refresh`.

---

## Angular primitives cần học (bắt buộc — đừng bỏ qua)

Giai đoạn 2 ở dưới **không đủ** nếu chỉ nhớ `@Component` + route. App `nihongo-angular` (Angular 19) lấy **signals + `inject()` + service root** làm xương sống — tương đương section Hooks trong [roadmap-reactjs.md](./roadmap-reactjs.md).

### A. Built-in / framework (Angular 19)

| API | Khi nào dùng | Chỗ xem trong repo |
|-----|--------------|-------------------|
| `inject()` | Lấy DI trong field / guard / factory (thay constructor dài) | Mọi page; `auth.guard.ts` |
| `signal` / `set` / `update` | State UI reactive (lesson, index, loading, error) | `vocab-page`, `srs-page`, `dictation-page`, hầu hết features |
| `computed` | Derive từ signal (current card, filtered list, progress %) | `vocab-page` (`current`, `filteredVocab`, `progressWidth`); `AuthService.isAuthenticated` |
| `effect` | Side effect khi signal đổi (reload khi `lesson` đổi) | `vocab-page`, `dictation-page` — **cleanup / tránh loop** |
| `asReadonly()` | Expose signal ra ngoài mà không cho set | `AuthService.token` / `user` / `authReady` |
| `@if` / `@for` / `@switch` | Control flow mới (ưu tiên hơn `*ngIf` / `*ngFor`) | Templates feature pages |
| `FormsModule` + `[(ngModel)]` | Form đơn giản / two-way | Login, vocab search, community, notes |
| Reactive forms (`FormBuilder`) | Form phức tạp / validate nhiều field — interview hay hỏi; repo nghiêng template-driven | Học theory; so với login/admin import |
| `DestroyRef` + `takeUntilDestroyed` | Hủy subscription / `clearInterval` khi destroy component | `community-page` (poll chat) |
| Functional guards `CanActivateFn` | `authGuard` / `adminGuard` | `core/guards/auth.guard.ts` |
| `loadComponent` lazy | Code-split từng page | `app.routes.ts` |
| `providedIn: 'root'` | Singleton service | `AuthService`, `ApiService`, `ThemeService`, `PageBannerService` |

**Zone.js:** app vẫn `provideZoneChangeDetection` trong `app.config.ts`. Biết zone kích hoạt CD; **không** cần OnPush sâu trừ khi optimize. Signals giảm phụ thuộc zone cho UI state.

**Input/Output hiện đại (biết tên):** `input()`, `output()`, `model()`, `viewChild()` — phỏng vấn Angular 17+ hay hỏi. Shared components trong repo có thể vẫn props cổ điển — đọc `lesson-selector`, `stroke-order`.

**NgRx:** **không dùng** trong app này. State = service + signals. Chỉ học NgRx nếu JD bắt.

### B. “Custom layer” trong repo (học bằng cách đọc — như custom hooks React)

| Tầng | File | Học được gì |
|------|------|-------------|
| `apiFetch` + refresh single-flight | `core/http/api-client.ts` | Fetch wrapper, envelope, 401→refresh→retry (`refreshInFlight`) |
| `ApiService` | `core/services/api.service.ts` | Injectable facade: mọi endpoint typed `Promise<T>` |
| `AuthService` | `core/services/auth.service.ts` | Signals auth + `computed` role (`isAdmin` / `isTeacher`) |
| `ThemeService` | `core/services/theme.service.ts` | Theme preference |
| `PageBannerService` | `core/services/page-banner.service.ts` | Banner UI state |
| `authGuard` / `adminGuard` | `core/guards/auth.guard.ts` | Redirect + `createUrlTree` + query `redirect` |
| Keycloak util | `core/utils/keycloak.util.ts` | OIDC (`oidc-client-ts`) ngoài Angular DI |
| Speech / stroke / japanese utils | `core/utils/*.ts` | Logic thuần — dễ unit test nhất |
| Shared UI | `shared/lesson-selector`, `stroke-order`, `payment-methods`, `sidebar-auth`, `google-sign-in-button` | Component composition |

### C. Map nhanh Angular ↔ React (đừng học nhầm chỗ)

| React (`nihongo-web`) | Angular (`nihongo-angular`) |
|-----------------------|----------------------------|
| `useState` | `signal` |
| `useMemo` | `computed` |
| `useEffect` | `effect` (+ cẩn thận dependency/loop) |
| `useRef` | field thường / `ElementRef` / `viewChild` |
| `useContext` + `useAuth` | `inject(AuthService)` + readonly signals |
| `useQuery` / React Query | `ApiService` + `async` trong `effect` / method (app **không** có TanStack Query) |
| Custom hook `useXxx` | Service injectable hoặc helper function |

### D. RxJS — học đủ, đừng overkill trên app này

App **gọi API bằng `fetch`/`async`**, không phải `HttpClient` Observable là chính.

Vẫn cần:
- `subscribe` / unsubscribe hoặc `async` pipe (nếu đụng Observable)
- Operators: `map`, `switchMap`, `catchError`, `tap`
- Router events / form `valueChanges` (khi đụng)

Không cần thuộc hết marble diagram trước khi sửa được vocab/SRS.

### E. Bài tập primitives (làm đủ 3)

1. Trên một page: đổi `lesson` bằng `signal` → `effect` load vocab → `computed` ra `current` card (bám `vocab-page`).
2. Viết guard nhỏ: chưa login → `/login?redirect=…` (copy pattern `authGuard`).
3. Poll giả (setInterval) + `DestroyRef.onDestroy` clear — so với `community-page`.

**Checkpoint primitives:** giải thích `signal` vs `computed` vs `effect`; vì sao `AuthService` expose `asReadonly()`; vì sao app không dùng `HttpClient` + React Query mà dùng `ApiService` + `apiFetch`.

---

## GIAI ĐOẠN 2 — Angular fundamentals (tuần 4–6)

### Standalone + DI

```typescript
// Angular 19: component standalone (mặc định trong app này)
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  // inject() thay constructor dài
  private readonly theme = inject(ThemeService);
}
```

Đọc: `app.config.ts`, `main.ts`, `layout/main-layout.component.ts`.

### Routing + lazy load

```typescript
// app.routes.ts — pattern trong repo
{
  path: 'vocab',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/vocab/vocab-page.component').then((m) => m.VocabPageComponent),
}
```

| Khái niệm | File / chỗ xem |
|-----------|----------------|
| Layout shell | `MainLayoutComponent` + children |
| Auth / admin guard | `core/guards/auth.guard.ts` |
| Nav groups | `core/config/nav-groups.ts` |

### Template & signals

> Chi tiết bắt buộc: section **Angular primitives cần học** ở trên.

- `@if` / `@for` (ưu tiên); biết `*ngIf` / `*ngFor` legacy
- `signal` / `computed` / `effect` — pattern chính trong features
- Two-way: `FormsModule` + `[(ngModel)]`
- Services root: `AuthService`, `ApiService`, `ThemeService`, `PageBannerService`

**Checkpoint:** thêm một route lazy `coming-soon` (đã có pattern) và gắn vào `nav-groups` — chạy `npm run dev:nihongo-angular`.

---

## GIAI ĐOẠN 3 — HTTP, auth, OIDC (tuần 7–9)

### API client

```
Browser :5174  --proxy-->  /api/*  →  gateway :3000
Docker: nihongo-angular.localhost:8080 → nginx → cùng API
```

Đọc kỹ `core/http/api-client.ts`:

1. Bearer từ `localStorage` (`nihongo_auth_token`)
2. 401 → `POST /api/auth/refresh` (cookie) → retry một lần
3. Envelope `{ success, data }`

### Login flows trong app

| Flow | Điểm vào |
|------|----------|
| Email/password | `features/auth/login-page.component.ts` → `/api/auth/login` |
| Google | cùng trang login (cần `GOOGLE_CLIENT_ID`) |
| Keycloak OIDC | `core/utils/keycloak.util.ts` + `oidc-client-ts` |

### Guards

```typescript
// authGuard — chưa login → /login
// adminGuard — role admin → admin layout
```

**Checkpoint:** login local → mở `/srs` → DevTools thấy `Authorization: Bearer`. Logout xóa token + redirect.

---

## GIAI ĐOẠN 4 — Feature map theo repo (tuần 10–14)

Học bằng cách **đọc từng feature folder**, không viết lại từ đầu.

| Feature | Path | API / ghi chú |
|---------|------|----------------|
| Home | `features/home/` | Dashboard entry |
| Vocab | `features/vocab/` | `/api/vocabularies` |
| Grammar / Kanji / Kana | `features/grammar|kanji|kana/` | content-service qua gateway |
| SRS | `features/srs/` | progress / review |
| Mock exam / Quiz | `features/mock-exam|quiz/` | exam-service |
| Reading / Listening | `features/reading|listening/` | |
| Pronunciation | `features/pronunciation*` | Web Speech utils |
| Pricing / Stripe | `features/pricing/` + `shared/payment-methods/` | `@stripe/stripe-js` |
| Support chat | `features/support/` | REST poll — [cursor-chat.md](./cursor-chat.md) |
| Admin | `features/admin/` | `adminGuard` |
| Profile | `features/auth/profile-page*` | |

Shared UI hữu ích: `lesson-selector`, `stroke-order`, `flashcard-japanese-text`, `sidebar-auth`.

**Bài tập nhỏ (chọn 2):**

1. Thêm filter lesson trên một page vocab (reuse `LessonSelector`).
2. Hiển thị error `ApiError.status` trên một màn (toast hoặc banner).
3. Viết unit test util (Jasmine/Karma đã có trong `package.json` scripts `test`) cho một hàm trong `core/utils/`.

---

## GIAI ĐOẠN 5 — Forms, state, UX (tuần 15–18)

| Chủ đề | Áp dụng trong app |
|--------|-------------------|
| Template-driven / Reactive forms | Login, admin import, notes |
| Theme | `ThemeService` — light/dark |
| Page banner | `PageBannerService` + control component |
| Speech / STT | `speech.util.ts`, `speech-recognition.util.ts` |
| Japanese text helpers | `japanese.util.ts`, stroke-order |

Tránh over-engineer state: app này **không** dùng NgRx — service + signals/`BehaviorSubject` đủ. Chỉ học NgRx nếu apply job bắt buộc.

---

## GIAI ĐOẠN 6 — Build, Docker, parity Next (tuần 19–22)

```powershell
# Dev
npm run dev:nihongo-angular   # :5174

# Production build (trong workspace app)
npm run build -w @edu/nihongo-angular

# Full Docker (Angular + nginx host)
npm run docker:up:nihongo
# → http://nihongo-angular.localhost:8080
```

| So sánh | Next (`nihongo-web`) | Angular |
|---------|----------------------|---------|
| Port dev | 5173 | 5174 |
| Auth storage | tương tự JWT + cookie refresh | `api-client` + OIDC |
| Data fetching | React Query hay fetch | `apiFetch` / async |
| Livestream UI | có trên web/mobile | kiểm tra nav — có thể coming-soon |

**Checkpoint senior nhẹ:** giải thích được vì sao proxy chỉ cần khi `ng serve`, còn Docker thì nginx route hostname.

---

## Lịch gợi ý (tóm tắt)

| Giai đoạn | Thời gian | Kết quả |
|-----------|-----------|---------|
| 1 TS + RxJS | 2–3 tuần | Đọc được `api-client` |
| 1b **Signals + inject + services** | song song tuần 3–5 | Section primitives + đọc `AuthService` / `vocab-page` |
| 2 Angular core | 3 tuần | Thêm route + guard |
| 3 Auth/OIDC | 3 tuần | Login 3 cách ổn định |
| 4 Features | 4–5 tuần | Sửa được 1–2 feature thật |
| 5 Forms/UX | 3–4 tuần | Form + theme + util test |
| 6 Docker/parity | 3–4 tuần | Build + so sánh Next |

---

## Thứ tự đọc file trong repo

1. `apps/nihongo-angular/package.json` — dependency thật  
2. Section **Angular primitives** ở trên  
3. `src/app/app.config.ts` + `app.routes.ts`  
4. `src/app/core/http/api-client.ts` + `core/services/api.service.ts`  
5. `src/app/core/services/auth.service.ts` + `core/guards/auth.guard.ts` + `core/utils/keycloak.util.ts`  
6. Feature mẫu signals: `features/vocab/vocab-page.component.ts` rồi `features/srs/`  
7. Poll + DestroyRef: `features/community/community-page.component.ts`  
8. `proxy.conf.json` + [run-local.md](./run-local.md)  
9. [system-design.md](./system-design.md) (gateway / Keycloak) · so sánh [roadmap-reactjs.md](./roadmap-reactjs.md) 

---

## Câu hỏi tự kiểm tra

1. `loadComponent` khác `loadChildren` (NgModule) thế nào? App này dùng gì?  
2. Refresh token: cookie HttpOnly hay localStorage? Access token ở đâu?  
3. Guard chạy trước hay sau `resolve`?  
4. Vì sao Angular Docker host khác `localhost:5174`?  
5. Envelope API fail — `ApiError` được throw ở đâu?  
6. `signal` vs `computed` vs `effect` — ví dụ từ `vocab-page`?  
7. Vì sao `AuthService` dùng `asReadonly()` thay vì expose `signal` writable?  
8. App này data fetching gần với React Query hay `useEffect+fetch` hơn? Trade-off?  
9. `DestroyRef` giải quyết vấn đề gì so với quên `unsubscribe`?  
10. Khi nào học NgRx — và vì sao repo **không** dùng? 

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [run-local.md](./run-local.md) | `dev:nihongo-angular`, ports |
| [docker.md](./docker.md) | Container Angular + nginx |
| [keycloak-setup.md](./keycloak-setup.md) | Client OIDC Angular |
| [accounts.md](./accounts.md) | User demo |
| [system-design.md](./system-design.md) | Gateway + clients |
| [learn-edu-app.md](./learn-edu-app.md) | Lộ trình monorepo tổng |
| [roadmap-reactjs.md](./roadmap-reactjs.md) | App Next/React song song (:5173) |
| Roadmap mobile | [roadmap-android.md](./roadmap-android.md) · [roadmap-swift.md](./roadmap-swift.md) · … |
| [Angular docs](https://angular.dev/) | Official |
