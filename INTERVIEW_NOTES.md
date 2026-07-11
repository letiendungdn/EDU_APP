# Interview Notes — Nihongo Edu Platform

> Tài liệu nội bộ — không commit/publish.

---

## 1. Tổng quan dự án

Một nền tảng học tiếng Nhật full-stack theo kiến trúc **Monorepo + Microservices**.

```
edu_app/
├── apps/
│   ├── nihongo-web/          # Next.js 15 (App Router) — người dùng cuối
│   └── english-web/          # Ứng dụng học tiếng Anh (riêng)
├── services/
│   ├── api-gateway/          # NestJS — HTTP vào → gRPC ra
│   ├── exam-service/         # NestJS — SRS, quiz, mock exam
│   ├── content-service/      # NestJS — bài học, từ vựng
│   ├── english-service/      # NestJS — phần tiếng Anh
│   └── signaling-service/    # WebSocket — call video/audio
└── packages/
    ├── nest-contracts/        # DTOs + message patterns (shared)
    ├── nest-common/           # Guards, decorators, gRPC utils
    ├── nest-prisma/           # Prisma client + repositories (nihongo DB)
    └── prisma-nihongo/        # Schema Prisma chính
```

**Stack chính:**
| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 6 |
| Backend | NestJS 11, TypeScript |
| Transport nội bộ | gRPC (protobuf) |
| ORM | Prisma 6 |
| DB | PostgreSQL |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT (access + refresh token) |
| Monorepo | npm workspaces |

---

## 2. Kiến trúc Microservices + gRPC Dispatch

### Vấn đề cần giải quyết
HTTP request từ client vào `api-gateway`, gateway cần forward sang `exam-service`. Dùng gRPC thay REST nội bộ để type-safe, hiệu suất cao, schema rõ ràng.

### Pattern: Single Dispatch Method

Thay vì định nghĩa 1 gRPC method cho mỗi route, toàn bộ exam-service dùng **1 method duy nhất** `Dispatch` nhận `pattern` + `payload` (JSON string):

```proto
// Proto đơn giản hóa
service ExamService {
  rpc Dispatch(DispatchRequest) returns (DispatchResponse);
}
message DispatchRequest {
  string pattern = 1;
  string payload = 2;
}
message DispatchResponse {
  string result = 1;
  string error  = 2;
}
```

**Bên gateway** — gửi như TCP message thông thường:
```typescript
// api-gateway/progress.controller.ts
this.examClient.send(PROGRESS_PATTERNS.SRS_GET_DUE, { userId, limit })
// RxJS Observable → firstValueFrom() → HTTP response
```

**Bên exam-service** — dispatch table:
```typescript
// exam.ms.controller.ts
@GrpcMethod("ExamService", "Dispatch")
dispatch(data: { pattern: string; payload: string }) {
  return handleGrpcDispatch(this.routes, data);
}

onModuleInit() {
  this.routes = {
    [PROGRESS_PATTERNS.SRS_GET_DUE]:       (d) => this.getSrsDue(d),
    [PROGRESS_PATTERNS.SRS_SUBMIT_REVIEW]: (d) => this.submitSrsReview(d),
    [PROGRESS_PATTERNS.SRS_GET_STATS]:     (d) => this.getSrsStats(d),
    [PROGRESS_PATTERNS.SRS_ADD_LESSON]:    (d) => this.addLessonToSrs(d),
    // ... thêm route không cần sửa proto
  };
}
```

**`handleGrpcDispatch` utility** (`packages/nest-common`):
```typescript
export async function handleGrpcDispatch(
  routes: Record<string, PatternHandler>,
  data: { pattern: string; payload: string },
): Promise<{ result: string; error: string }> {
  const handler = routes[data.pattern];
  if (!handler) return { result: '', error: `Unknown pattern: ${data.pattern}` };
  const payload = data.payload ? JSON.parse(data.payload) : {};
  const result = await handler(payload);
  return { result: JSON.stringify(result ?? null), error: '' };
}
```

**Lợi ích của pattern này:**
- Thêm endpoint mới: chỉ thêm 1 dòng vào `routes` + 1 HTTP controller method
- Không cần cập nhật `.proto` file
- Error handling tập trung (serialize HTTP + RPC exceptions về JSON)

### Câu hỏi phỏng vấn có thể hỏi:
> *"Tại sao dùng gRPC thay REST cho nội bộ?"*
- Type-safe bằng protobuf, tự generate client/server types
- Binary protocol (HTTP/2) nhanh hơn JSON/HTTP 1.1
- Streaming sẵn có nếu cần sau này
- Schema contract rõ ràng giữa services

> *"Pattern dispatch table có nhược điểm gì?"*
- Debug khó hơn (stack trace qua JSON serialization)
- Mất type-safety ở payload (phải cast thủ công)
- Không dễ generate OpenAPI docs cho internal calls

---

## 3. Spaced Repetition System (SRS) — SM-2 Algorithm

### Vấn đề
Người dùng cần ôn từ vựng theo lịch thông minh — từ khó ôn sớm hơn, từ dễ ôn thưa hơn. Giải pháp: thuật toán **SM-2** (SuperMemo 2), nền tảng của Anki.

### Prisma Schema
```prisma
model SrsCard {
  userId      Int
  contentType ContentType   // "VOCABULARY"
  contentId   Int           // FK → Vocabulary.id

  // SM-2 fields
  easeFactor     Float    @default(2.5)  // độ dễ (1.3–2.5+)
  interval       Int      @default(0)   // ngày đến lần ôn tiếp
  repetitions    Int      @default(0)   // số lần ôn thành công liên tiếp
  nextReviewAt   DateTime?              // null = ôn ngay
  lastReviewedAt DateTime?

  // Stats
  correctCount Int     @default(0)
  wrongCount   Int     @default(0)
  mastered     Boolean @default(false)
}
```

### SM-2 Algorithm
```typescript
function sm2(quality: number, ef: number, interval: number, reps: number) {
  // quality: 1=Again, 2=Hard, 3=Good, 4=Easy (map từ 0-5 của SM-2 gốc)
  const q = Math.max(0, Math.min(5, quality));

  // Cập nhật ease factor
  const newEf = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  let newInterval: number;
  let newReps: number;

  if (q < 3) {
    // Không nhớ → reset về đầu
    newInterval = 1;
    newReps = 0;
  } else {
    newReps = reps + 1;
    if (reps === 0) newInterval = 1;       // lần 1: ôn ngày hôm sau
    else if (reps === 1) newInterval = 6;  // lần 2: ôn sau 6 ngày
    else newInterval = Math.round(interval * newEf); // lần 3+: nhân hệ số
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);
  return { easeFactor: newEf, interval: newInterval, repetitions: newReps, nextReviewAt };
}
```

**Ví dụ thực tế:**
| Lần | Quality | Interval | EaseFactor |
|---|---|---|---|
| 1 | Good (3) | 1 ngày | 2.5 |
| 2 | Good (3) | 6 ngày | 2.5 |
| 3 | Good (3) | 15 ngày | 2.5 |
| 4 | Easy (4) | 40 ngày | 2.6 |
| 5 | Hard (2) | 1 ngày | 2.36 (reset) |

**Mastery condition:** `repetitions >= 5 && interval >= 21 ngày`

### Query lấy thẻ đến hạn
```typescript
// Lấy thẻ chưa mastered và đến hạn hôm nay (hoặc chưa ôn lần nào)
prisma.srsCard.findMany({
  where: {
    userId,
    mastered: false,
    OR: [
      { nextReviewAt: null },         // chưa ôn lần nào
      { nextReviewAt: { lte: now } }, // đã đến hạn
    ],
  },
  orderBy: [{ nextReviewAt: 'asc' }],
  take: limit,
})
// Sau đó JOIN vocabulary để lấy kana/kanji/meaning
```

### Câu hỏi phỏng vấn:
> *"Tại sao không dùng simple streak counter mà dùng SM-2?"*
- SM-2 thích ứng theo từng từ: từ khó có EF thấp → interval ngắn hơn
- Có evidence khoa học (nghiên cứu từ 1987, Anki dùng biến thể này)
- EaseFactor encode "độ khó cá nhân hóa" của từng từ với từng người học

> *"N+1 query problem trong getSrsDueCards?"*
- Ban đầu có: query cards, rồi loop query vocabulary từng cái
- Fix: query tất cả vocabIds cùng lúc → Map lookup → O(1) per card

---

## 4. Dark/Light Mode System

### Vấn đề: Theme Flash
Khi trang load, React chưa hydrate → HTML render mặc định (dark) → sau đó đọc localStorage → chuyển sang light → **người dùng thấy nhấp nháy**.

### Giải pháp: Anti-flash inline script
```html
<!-- layout.tsx — chạy TRƯỚC khi React parse, TRƯỚC khi paint -->
<script dangerouslySetInnerHTML={{ __html: `
  try {
    var t = localStorage.getItem('nihongo-theme') ||
      (window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {}
` }} />
```

Script này chạy synchronously trong `<head>` → set `data-theme` trước browser paint → không có flash.

### CSS Token System
```css
/* Mặc định: dark mode */
:root {
  --bg-color:       #0f172a;
  --surface-color:  #1e293b;
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color:   #2d3f55;
  --primary-color:  #ef4444;
  --color-success:  #4ade80;
  --color-warning:  #fbbf24;
  --color-error:    #f87171;
  --color-info:     #60a5fa;
}

/* Light mode overrides */
[data-theme="light"] {
  --bg-color:       #f1f5f9;
  --surface-color:  #ffffff;
  --text-primary:   #0f172a;
  --text-secondary: #475569;
  --border-color:   #e2e8f0;
  /* success/warning/error/info cũng override cho đủ contrast */
}
```

Component chỉ dùng `var(--text-primary)` — không bao giờ hardcode màu.

### ThemeProvider (React Context)
```typescript
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Đồng bộ với inline script
    const saved = localStorage.getItem('nihongo-theme') as Theme | null;
    const sys = window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
    const initial = saved ?? sys;
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nihongo-theme', next);
      return next;
    });
  }, []);
  // ...
}
```

**Design decision:** Sidebar luôn dark dù ở cả 2 mode — intentional, dùng màu cứng thay token.

### Câu hỏi phỏng vấn:
> *"Ngoài localStorage còn có cách nào persist theme?"*
- Cookie → đọc được trên server → SSR render đúng theme ngay → không cần inline script
- Nhưng cần set cookie khi toggle (JS) và đọc trong middleware/layout server component

> *"Tại sao dùng `data-theme` attribute thay vì class?"*
- Semantic hơn (attribute mô tả trạng thái)
- CSS specificity bằng class → không cần `!important` khi override
- Dễ query từ JS: `document.documentElement.dataset.theme`

---

## 5. AI Sentence Practice — Gemini Integration

### Architecture
```
Browser → POST /api/sentence-practice (Next.js Route Handler)
        → Google Gemini 2.0 Flash API
        → JSON response → Browser
```

Dùng **Next.js Route Handler** thay vì gọi Gemini trực tiếp từ browser vì:
1. Giấu `GEMINI_API_KEY` — không bị lộ ra client
2. Có thể add rate limiting, auth check sau
3. Xử lý response parsing/cleaning ở server

### Route Handler
```typescript
// app/api/sentence-practice/route.ts
export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY; // server-only
  const { sentence } = await req.json();

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: sentence }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
    }),
  });

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Gemini đôi khi wrap JSON bằng ```json ... ``` → strip ra
  const cleaned = raw.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
  return NextResponse.json(JSON.parse(cleaned));
}
```

### System Prompt Engineering
```
Bạn là gia sư tiếng Nhật. Phản hồi theo cấu trúc JSON sau (KHÔNG thêm markdown):
{
  "corrected": "câu đã sửa (bỏ trống nếu đúng)",
  "reading": "furigana/romaji",
  "meaning": "nghĩa tiếng Việt",
  "explanation": "giải thích ngắn tiếng Việt — chỉ ra lỗi, cấu trúc ngữ pháp",
  "examples": ["ví dụ 1", "ví dụ 2"]
}
```

**Kỹ thuật prompt:**
- `temperature: 0.3` — output ổn định, ít hallucination
- Yêu cầu JSON thuần (không markdown) nhưng vẫn có fallback strip ````json`
- Explicit hướng dẫn ngôn ngữ output (tiếng Việt) để không trả lời tiếng Anh

### Câu hỏi phỏng vấn:
> *"Làm sao handle khi Gemini trả về format không đúng?"*
- Strip markdown fences
- `JSON.parse` trong try/catch
- Nếu fail: trả về `{ error: "...", raw }` để debug
- Có thể thêm: retry với prompt nghiêm hơn, hoặc regex extract JSON từ text

> *"Làm sao tránh user spam API và tốn tiền?"*
- Rate limit ở Next.js middleware (by IP hoặc userId)
- Require auth trước khi gọi endpoint
- Debounce ở frontend (đã có: button disabled khi loading)

---

## 6. Frontend Patterns

### React State Machine (SrsView)
Dùng `phase` state thay if/else lồng nhau:
```typescript
type Phase = 'loading' | 'needs-auth' | 'stats' | 'review' | 'done';
```
Mỗi phase render một UI khác nhau — dễ đọc, không thể có invalid state combination.

### 3D CSS Flip Card
```css
.srs-card {
  perspective: 1000px; /* tạo không gian 3D */
}
.srs-card__inner {
  transform-style: preserve-3d;
  transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}
.srs-card--flipped .srs-card__inner {
  transform: rotateY(180deg);
}
.srs-card__front, .srs-card__back {
  backface-visibility: hidden; /* ẩn mặt sau khi chưa lật */
}
.srs-card__back {
  transform: rotateY(180deg); /* back bắt đầu ở trạng thái lật */
}
```

### Client-side SM-2 Preview
Để hiển thị "X ngày" trên mỗi nút rating *trước khi* submit, chạy lại SM-2 ở client:
```typescript
function previewInterval(quality, ef, interval, reps): string {
  // Chạy SM-2 locally → trả về "3 ngày", "2 tuần", "1 tháng"
}
```
Không cần round-trip API chỉ để preview.

### Auto-resize Textarea
```typescript
useEffect(() => {
  const el = textareaRef.current;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}, [sentence]); // chạy lại mỗi khi text thay đổi
```

---

## 7. Shared Contracts Package

`packages/nest-contracts` — DTOs và message patterns được import bởi cả gateway lẫn service.

```typescript
// message-patterns.ts
export const PROGRESS_PATTERNS = {
  SYNC_REVIEW:       'progress.sync-review',
  GET_REVIEW_BANK:   'progress.get-review-bank',
  SRS_GET_DUE:       'progress.srs.due',
  SRS_SUBMIT_REVIEW: 'progress.srs.review',
  SRS_GET_STATS:     'progress.srs.stats',
  SRS_ADD_LESSON:    'progress.srs.add-lesson',
} as const;

// DTOs với class-validator
export class SrsReviewDto {
  @IsInt() vocabId: number;
  @IsInt() @Min(1) quality: number; // 1=Again 2=Hard 3=Good 4=Easy
}
```

**Lợi ích:** Nếu đổi tên pattern, sửa 1 chỗ → compile error ở tất cả nơi dùng.

---

## 8. Các câu hỏi phỏng vấn tổng hợp

### System Design
**Q: Tại sao dùng monorepo?**
- Shared packages (contracts, prisma) không cần publish npm riêng
- Atomic commit khi thay đổi cross-package (vd: thêm field DTO → update controller → update frontend cùng 1 commit)
- Đánh đổi: build time lâu hơn, CI phức tạp hơn

**Q: Nếu scale lên 10x user, bottleneck ở đâu?**
- PostgreSQL — cần read replica hoặc caching layer (Redis) cho SRS stats
- Gemini API — rate limit, cost — cần queue + caching phản hồi
- gRPC service → có thể deploy nhiều instance, gateway load balance

**Q: Làm sao test SRS algorithm?**
- Unit test `sm2()` function với bảng test cases (known input → known output)
- Integration test: gọi `submitSrsReview` nhiều lần → kiểm tra `nextReviewAt` tăng đúng
- Property-based test: `easeFactor` không bao giờ < 1.3, `interval` > 0 sau quality >= 3

### Frontend
**Q: Tại sao dùng Next.js App Router thay Pages Router?**
- Server Components: data fetching không cần useEffect, không client JS bundle
- Layout nesting: sidebar persist mà không re-render
- Route Handlers thay API Routes: cleaner, support streaming

**Q: `useCallback` trong ThemeProvider có cần thiết không?**
- `toggle` được truyền xuống context → mọi consumer re-render khi ThemeProvider re-render
- `useCallback` giữ stable reference → consumer dùng `React.memo` không re-render không cần thiết

### NestJS
**Q: `firstValueFrom` vs `toPromise()`?**
- `toPromise()` deprecated từ RxJS 7
- `firstValueFrom()` reject nếu Observable complete mà không emit (lỗi rõ ràng hơn)
- `lastValueFrom()` dùng khi cần giá trị cuối cùng từ stream

**Q: `@IsInt()` decorator hoạt động như thế nào?**
- `class-validator` + `class-transformer` + `ValidationPipe` global trong NestJS
- `class-transformer` deserialize plain object → class instance
- `class-validator` chạy decorators → throw `BadRequestException` nếu invalid

---

## 9. Keywords để nói chuyện với interviewer

- **Monorepo với npm workspaces** — package sharing, atomic commits
- **Microservices với gRPC** — protobuf, binary transport, type-safe contracts
- **Dispatch table pattern** — single gRPC method, extensible routing
- **SM-2 SRS algorithm** — spaced repetition, ease factor, interval scheduling
- **CSS custom properties / token system** — theme switching không cần JS re-render
- **Anti-flash technique** — inline script trong `<head>` trước browser paint
- **Next.js Route Handlers** — server-side proxy cho API keys
- **React state machine** — `phase` enum thay nested boolean state
- **N+1 query problem** — batch query + Map lookup
- **LLM prompt engineering** — structured output, temperature, fallback parsing
