# Hướng dẫn chạy EDU APP (local)

Monorepo `edu_app` — **Windows / PowerShell**. Chạy frontend Next.js + backend NestJS qua Docker (PostgreSQL, Redis, MongoDB, Kafka).

---

## Yêu cầu

| Công cụ | Phiên bản / ghi chú |
|---------|---------------------|
| **Node.js** | >= 22 |
| **Docker Desktop** | Bật trước khi chạy backend |
| **Git** | Clone repo |

Tùy chọn: **Stripe CLI** (`infra/stripe-cli/`, gọi qua `npm run stripe:...`) khi test thanh toán.

---

## Lần đầu setup (sau khi clone)

### 1. Cài dependency

```powershell
cd C:\Users\dungle\Desktop\edu_app
npm install
```

### 2. File môi trường

```powershell
copy services\.env.example services\.env
copy services\signaling-service\.env.example services\signaling-service\.env
copy apps\nihongo-web\.env.example apps\nihongo-web\.env
copy apps\english-web\.env.example apps\english-web\.env
```

Chỉnh `services/.env` nếu cần: `JWT_SECRET`, Stripe, Google OAuth (xem [google-oauth-setup.md](./google-oauth-setup.md)). Copy cùng `JWT_SECRET` sang `services/signaling-service/.env`. Thêm `NEXT_PUBLIC_SIGNALING_URL=http://localhost:3002` vào `apps/nihongo-web/.env`.

### 3. Khởi động infrastructure

```powershell
docker compose up -d postgres redis mongodb kafka zookeeper
```

| Container | Port host |
|-----------|-----------|
| PostgreSQL (`edu-postgres`) | **5433** |
| Redis | 6379 |
| MongoDB | 27017 |
| Kafka | 9092 |

Kiểm tra: `docker ps --filter "name=edu-"`

### 4. Database

**Cách A — Restore backup có sẵn trong repo (khuyên dùng)**

Đã có snapshot full trong `infra/backups/` (user, vocab, payment, …):

```powershell
Get-Content "infra\backups\nihongo_20260627_235641.sql" | docker exec -i edu-postgres psql -U nihongo nihongo
Get-Content "infra\backups\english_learning_20260627_235641.sql" | docker exec -i edu-postgres psql -U nihongo english_learning
```

**Cách B — DB trống: migrate + seed nội dung**

```powershell
npm run prisma:generate
npm run migrate:deploy -w @edu/prisma-nihongo
npm run db:push -w @edu/prisma-english
npm run seed -w @edu/prisma-nihongo          # import infra/postgres/nihongo-content-seed.sql + plans
npm run seed -w @edu/prisma-english
```

### 5. Prisma client (nếu chưa chạy bước 4B)

```powershell
npm run prisma:generate
```

### 6. Media stroke order & ảnh từ vựng (tùy chọn, lần đầu)

Cần Docker + DB đã có dữ liệu. Tải KanjiVG/OpenMoji local; nếu thiếu file vẫn fallback CDN.

```powershell
npm run media:setup
```

---

## Chạy hàng ngày (dev)

Mỗi lệnh **một terminal**, thư mục gốc `edu_app`:

### Bước 1 — Docker

```powershell
docker compose up -d postgres redis mongodb kafka zookeeper
```

### Bước 2 — Backend (3–4 terminal)

| Terminal | Lệnh | URL / port |
|----------|------|------------|
| 1 | `npm run dev:gateway` | http://localhost:3000 — Swagger: `/api/docs` |
| 2 | `npm run dev:content` | gRPC **50051** |
| 3 | `npm run dev:exam` | gRPC **50052** |
| 4 *(video call)* | `npm run dev:signaling` | WebSocket **3002** — namespace `/signal` |

### Bước 3 — Frontend (1–2 terminal)

| Terminal | Lệnh | URL |
|----------|------|-----|
| 5 | `npm run dev:nihongo-web` | http://localhost:5173 |
| 6 | `npm run dev:english-web` | http://localhost:3001 *(nếu cần)* |

Frontend gọi API qua rewrite `/api/*` → gateway `:3000`.

### Mở trình duyệt

```powershell
start http://localhost:5173
```

---

## Sơ đồ terminal

```
┌──────────────────────────────────────────────────────────────┐
│  Docker: postgres + redis + mongodb + kafka + zookeeper     │
├──────────────────────────────────────────────────────────────┤
│  T1: npm run dev:gateway      → http://localhost:3000        │
│  T2: npm run dev:content      → gRPC :50051                  │
│  T3: npm run dev:exam         → gRPC :50052                  │
│  T4: npm run dev:signaling    → WebSocket :3002 (video call) │
│  T5: npm run dev:nihongo-web  → http://localhost:5173        │
│  T6: npm run dev:english-web  → http://localhost:3001        │
│  T7: npm run stripe:listen    → (chỉ khi test Stripe)        │
└──────────────────────────────────────────────────────────────┘
```

---

## Đăng nhập

| Mục | URL / tài khoản |
|-----|-----------------|
| Login học viên | http://localhost:5173/login |
| Google Sign-In | Nút Google (cần `GOOGLE_CLIENT_ID`) |
| Admin | http://localhost:5173/admin/login |
| Admin dev mặc định | `admin@nihongo.local` / `admin123` |

---

## Stripe webhook (khi test thanh toán)

Terminal riêng — giữ chạy:

```powershell
npm run stripe:login    # một lần
npm run stripe:listen   # forward → localhost:3000/api/webhooks/stripe
```

Copy `whsec_...` từ output → `STRIPE_WEBHOOK_SECRET` trong `services/.env` → **restart gateway**.

---

## NPM scripts thường dùng

| Script | Mô tả |
|--------|--------|
| `npm run dev:gateway` | API gateway :3000 |
| `npm run dev:content` | Content service gRPC |
| `npm run dev:exam` | Exam service gRPC |
| `npm run dev:signaling` | WebRTC signaling :3002 |
| `npm run dev:nihongo-web` | Frontend tiếng Nhật :5173 |
| `npm run dev:english-web` | Frontend tiếng Anh :3001 |
| `npm run docker:up` | `docker compose up -d` (tất cả service) |
| `npm run docker:down` | Dừng containers |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run db:backup` | Dump DB → `infra/backups/` |
| `npm run db:export-content` | Export nội dung học → `nihongo-content-seed.sql` |
| `npm run media:setup` | Tải + sync media + cập nhật URL ảnh trong DB |

---

## Restart khi port bị kẹt

```powershell
cd C:\Users\dungle\Desktop\edu_app

$ports = 3000, 3001, 3002, 50051, 50052, 5173
foreach ($p in $ports) {
  Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

docker compose up -d postgres redis mongodb kafka zookeeper
# Chạy lại dev:gateway, dev:content, dev:exam, dev:nihongo-web
```

---

## Xử lý lỗi

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `Cannot find module '@prisma/client'` | `npm run prisma:generate` |
| Gateway `[ioredis] Unhandled error` | `docker compose up -d redis` → restart gateway |
| Content `EADDRINUSE :50051` | Kill process cũ trên 50051 hoặc dùng script restart ở trên |
| Vocab/kanji không có stroke order | `npm run media:setup` hoặc refresh (CDN fallback) |
| API 401 / không load bài học | Kiểm tra postgres :5433, restore backup hoặc seed lại |
| Next.js lỗi `.next` cache | Xóa `apps/nihongo-web/.next` → chạy lại `dev:nihongo-web` |
| Stripe `Invalid signature` | `whsec` phải khớp terminal `stripe:listen` đang chạy |
| Google login lỗi | Thêm `http://localhost:5173` vào Authorized origins |

---

## Dừng hệ thống

```powershell
# Ctrl+C từng terminal dev

docker compose down          # giữ data volume
docker compose down -v       # xóa volume — mất DB
```

---

## Backup & restore

```powershell
npm run db:backup
```

Restore:

```powershell
Get-Content "infra\backups\nihongo_YYYYMMDD_HHMMSS.sql" | docker exec -i edu-postgres psql -U nihongo nihongo
```

Chi tiết: [infra/backups/README.md](../infra/backups/README.md)

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [README.md](../README.md) | Kiến trúc tổng quan |
| [infra/postgres/README.md](../infra/postgres/README.md) | Content seed SQL |
| [google-oauth-setup.md](./google-oauth-setup.md) | Google Sign-In |
| [system-design.md](./system-design.md) | Request flows |
