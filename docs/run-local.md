# Hướng dẫn chạy EDU APP (local)

Monorepo `edu_app` — **Windows / PowerShell**. Chạy frontend (Next / Angular) + backend NestJS; hạ tầng qua Docker (PostgreSQL, Redis, MongoDB, Kafka).

> **Chạy full stack trong Docker / chuyển máy:** [docker.md](./docker.md) (~14 container Nihongo, gồm Keycloak + LiveKit).  
> **Mobile:** [run-mobile.md](./run-mobile.md). **Tài khoản:** [accounts.md](./accounts.md).

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
copy .env.docker.example .env   # nếu chạy Docker full / Keycloak public URL
```

Chỉnh `services/.env` nếu cần: `JWT_SECRET`, Stripe, Google OAuth (xem [google-oauth-setup.md](./google-oauth-setup.md)). Copy cùng `JWT_SECRET` sang `services/signaling-service/.env`. Thêm các biến sau vào `apps/nihongo-web/.env`:

```
NEXT_PUBLIC_SIGNALING_URL=http://localhost:3002
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...   # tùy chọn — cần để dùng tính năng Bản đồ Nhật Bản
```

`NEXT_PUBLIC_MAPBOX_TOKEN`: lấy token tại [mapbox.com](https://account.mapbox.com) (free tier). Nếu bỏ trống, trang `/japan-map` hiện thông báo hướng dẫn, các tính năng khác không ảnh hưởng.

### 3. Khởi động infrastructure

**Tối thiểu (DB/cache/Kafka):**

```powershell
npm run docker:up:infra
# = postgres-nihongo redis mongodb zookeeper kafka
```

**Hybrid đầy đủ hơn** (OIDC + livestream + English DB):

```powershell
docker compose up -d postgres-nihongo postgres-english redis mongodb zookeeper kafka `
  postgres-keycloak keycloak livekit
```

| Container | Port host |
|-----------|-----------|
| PostgreSQL Nihongo (`edu-postgres-nihongo`) | **5433** |
| PostgreSQL English (`edu-postgres-english`) | **5434** *(tùy chọn)* |
| Redis | 6379 |
| MongoDB | 27017 |
| Kafka | 9092 |
| Keycloak | qua nginx `:8080` hoặc nội bộ — [keycloak-setup.md](./keycloak-setup.md) |
| LiveKit | **7880** |

Lần đầu cần volume: `docker volume create nihongo-app_postgres_data`.

Hosts (Keycloak / Angular):

```
127.0.0.1 nihongo.localhost auth.localhost nihongo-angular.localhost english.localhost
```

Kiểm tra: `docker ps --filter "name=edu-"`

### 4. Database

**Cách A — Restore backup có sẵn trong repo (khuyên dùng)**

```powershell
Get-Content "infra\backups\nihongo_20260725_144146.sql" | docker exec -i edu-postgres-nihongo psql -U nihongo nihongo
```

**Cách B — DB trống: migrate + seed**

```powershell
npm run prisma:generate
npm run migrate:deploy -w @edu/prisma-nihongo
npm run db:push -w @edu/prisma-english
npm run seed -w @edu/prisma-nihongo
npm run seed -w @edu/prisma-english
```

### 5. Prisma client (nếu chưa chạy bước 4B)

```powershell
npm run prisma:generate
```

### 6. Media (tùy chọn)

```powershell
npm run media:setup
```

---

## Chạy hàng ngày (dev hybrid)

> **Docker full Nihongo (không cần `npm run dev:*`):**  
> `npm run docker:up:nihongo` → http://localhost:8080  
> Danh sách **~14 container** (có Keycloak + LiveKit qua `depends_on`): [docker.md](./docker.md).

Mỗi lệnh **một terminal**, thư mục gốc `edu_app`:

### Bước 1 — Docker infra

```powershell
npm run docker:up:infra
# OIDC / live: thêm postgres-keycloak keycloak livekit như mục 3
```

### Bước 2 — Backend (3–4 terminal)

| Terminal | Lệnh | URL / port |
|----------|------|------------|
| 1 | `npm run dev:gateway` | http://localhost:3000 — Swagger `/api/docs` |
| 2 | `npm run dev:content` | gRPC **50051** |
| 3 | `npm run dev:exam` | gRPC **50052** |
| 4 *(video call 1-1)* | `npm run dev:signaling` | WebSocket **3002** — `/signal` |

### Bước 3 — Frontend (1–3 terminal)

| Terminal | Lệnh | URL |
|----------|------|-----|
| 5 | `npm run dev:nihongo-web` | http://localhost:5173 |
| 6 | `npm run dev:nihongo-angular` | http://localhost:5174 |
| 7 | `npm run dev:english-web` | http://localhost:3001 *(nếu cần)* |

Frontend gọi API qua rewrite/proxy `/api/*` → gateway `:3000`.

### Mở trình duyệt

```powershell
start http://localhost:5173
# Angular: start http://localhost:5174
# Keycloak (nếu đã up): start http://auth.localhost:8080
```

---

## Sơ đồ terminal

```
┌──────────────────────────────────────────────────────────────────┐
│  Docker: postgres-nihongo + redis + mongodb + kafka + zookeeper │
│  (+ keycloak / livekit / postgres-english khi cần)              │
├──────────────────────────────────────────────────────────────────┤
│  T1: npm run dev:gateway         → :3000                        │
│  T2: npm run dev:content         → gRPC :50051                  │
│  T3: npm run dev:exam            → gRPC :50052                  │
│  T4: npm run dev:signaling       → WS :3002 (1-1 call, tùy chọn)│
│  T5: npm run dev:nihongo-web     → :5173                        │
│  T6: npm run dev:nihongo-angular → :5174                        │
│  T7: npm run stripe:listen       → (chỉ khi test Stripe)        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Đăng nhập

| Mục | URL / tài khoản |
|-----|-----------------|
| Login học viên (Next) | http://localhost:5173/login |
| Login (Angular) | http://localhost:5174/login |
| Keycloak OIDC | Nút Keycloak — demo users [accounts.md](./accounts.md) |
| Google Sign-In | Nút Google (cần `GOOGLE_CLIENT_ID`) |
| Admin | http://localhost:5173/admin/login |
| Admin dev mặc định | `admin@nihongo.local` / `admin123` |

---

## Stripe webhook (khi test thanh toán)

```powershell
npm run stripe:login    # một lần
npm run stripe:listen   # → localhost:3000/api/webhooks/stripe
```

Copy `whsec_...` → `STRIPE_WEBHOOK_SECRET` trong `services/.env` → **restart gateway**.

---

## NPM scripts thường dùng

| Script | Mô tả |
|--------|--------|
| `npm run dev:gateway` | API gateway :3000 |
| `npm run dev:content` | Content service gRPC |
| `npm run dev:exam` | Exam service gRPC |
| `npm run dev:signaling` | WebRTC signaling :3002 (1-1) |
| `npm run dev:nihongo-web` | Next.js tiếng Nhật :5173 |
| `npm run dev:nihongo-angular` | Angular :5174 |
| `npm run dev:english-web` | Next.js tiếng Anh :3001 |
| `npm run docker:up:infra` | Chỉ infra Nihongo (DB/cache/Kafka) |
| `npm run docker:up:nihongo` | Full Docker Nihongo (~14 container) |
| `npm run docker:up` | `docker compose --profile english up -d` |
| `npm run docker:down` | Dừng containers |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run db:backup` | Dump DB → `infra/backups/` (snapshot được commit) |
| `npm run media:setup` | Tải + sync media |

---

## Restart khi port bị kẹt

```powershell
cd C:\Users\dungle\Desktop\edu_app

$ports = 3000, 3001, 3002, 50051, 50052, 5173, 5174
foreach ($p in $ports) {
  Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

npm run docker:up:infra
# Chạy lại gateway / content / exam / nihongo-web / nihongo-angular
```

---

## Xử lý lỗi

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `Cannot find module '@prisma/client'` | `npm run prisma:generate` |
| Gateway `[ioredis] Unhandled error` | `docker compose up -d redis` → restart gateway |
| Content `EADDRINUSE :50051` | Kill process trên 50051 |
| API 401 / không load bài | Postgres :5433, restore backup hoặc seed |
| Keycloak / OIDC lỗi | Up `keycloak` + hosts `auth.localhost` — [keycloak-setup.md](./keycloak-setup.md) |
| LiveKit / livestream lỗi | `docker compose up -d livekit` — port 7880 |
| Next.js lỗi `.next` | Xóa `apps/nihongo-web/.next` → `dev:nihongo-web` |
| Stripe `Invalid signature` | `whsec` khớp `stripe:listen` đang chạy |
| Google login lỗi | Thêm `http://localhost:5173` (và `:5174`) vào Authorized origins |

---

## Dừng hệ thống

```powershell
# Ctrl+C từng terminal dev
docker compose down          # giữ data volume
docker compose down -v       # xóa volume non-external — mất DB
```

---

## Backup & restore

```powershell
npm run db:backup
Get-Content "infra\backups\nihongo_YYYYMMDD_HHMMSS.sql" |
  docker exec -i edu-postgres-nihongo psql -U nihongo nihongo
```

Chi tiết: [infra/backups/README.md](../infra/backups/README.md)

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [docker.md](./docker.md) | Full stack Docker, Keycloak, LiveKit, Angular |
| [run-mobile.md](./run-mobile.md) | 4 app mobile |
| [nginx.md](./nginx.md) | Routing `:8080` |
| [accounts.md](./accounts.md) | User/password |
| [roadmap-angular.md](./roadmap-angular.md) | Lộ trình học Angular |
| [roadmap-reactjs.md](./roadmap-reactjs.md) | Lộ trình học ReactJS/Next |
| [google-oauth-setup.md](./google-oauth-setup.md) | Google Sign-In |
| [system-design.md](./system-design.md) | Kiến trúc / flows |
