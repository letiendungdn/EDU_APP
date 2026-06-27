# Hướng dẫn chạy EDU APP (local)

Tài liệu chạy monorepo `edu_app` trên **Windows** — Docker, backend NestJS, frontend Next.js, đăng nhập Gmail, Stripe webhook qua **Stripe CLI**.

---

## Yêu cầu

| Công cụ | Ghi chú |
|---------|---------|
| **Node.js** | >= 22 |
| **Docker Desktop** | Bật trước khi chạy backend |
| **Stripe CLI** | Có sẵn trong repo (`infra/stripe-cli/`, gọi qua `stripe.cmd`) |

---

## Cấu hình (config trong repo)

Project **track config trên git**. Các file chính:

| File | Nội dung |
|------|----------|
| `services/.env` | DB, Redis, Kafka, JWT, **Stripe**, **Google OAuth** |
| `apps/nihongo-web/.env` | `API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` |
| `apps/english-web/.env` | `API_URL` |
| `infra/google-oauth/client_secret_*.json` | OAuth JSON từ Google Cloud |
| `stripe.cmd` / `stripe.ps1` | Wrapper gọi Stripe CLI |

Lần đầu clone (nếu thiếu file):

```powershell
cd C:\Users\dungle\Desktop\edu_app
npm install
copy services\.env.example services\.env
copy apps\nihongo-web\.env.example apps\nihongo-web\.env
copy apps\english-web\.env.example apps\english-web\.env
```

### Database trống

```powershell
docker compose up -d postgres
npm run db:push -w @edu/prisma-nihongo
npm run db:push -w @edu/prisma-english
```

---

## Chạy nhanh (mỗi lần mở máy)

### 1. Infrastructure

**Terminal 1:**

```powershell
cd C:\Users\dungle\Desktop\edu_app
docker compose up -d postgres redis mongodb kafka zookeeper
```

| Container | Port |
|-----------|------|
| PostgreSQL | `5433` |
| Redis | `6379` |
| MongoDB | `27017` |
| Kafka | `9092` |

Kiểm tra: `docker ps --filter "name=edu-"`

### 2. Backend (ts-node)

Mỗi lệnh **một terminal**, từ thư mục `edu_app`:

| Terminal | Lệnh | Port |
|----------|------|------|
| 2 | `npm run dev:gateway` | HTTP **3000** |
| 3 | `npm run dev:content` | gRPC **50051** |
| 4 | `npm run dev:exam` | gRPC **50052** |

Swagger: http://localhost:3000/api/docs

### 3. Frontend

| Terminal | Lệnh | URL |
|----------|------|-----|
| 5 | `npm run dev:nihongo-web` | http://localhost:5173 |
| 6 | `npm run dev:english-web` | http://localhost:3001 |

Frontend là **thin client**: `/api/*` → rewrite sang gateway `:3000`.

### 4. Mở trình duyệt

```powershell
start http://localhost:5173
```

---

## Restart toàn bộ (khi port bị kẹt)

```powershell
cd C:\Users\dungle\Desktop\edu_app

$ports = 3000,3001,50051,50052,5173
foreach ($p in $ports) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

docker compose up -d postgres redis mongodb kafka zookeeper
# Chạy lại dev:gateway, dev:content, dev:exam, dev:nihongo-web, dev:english-web
```

---

## Đăng nhập / đăng ký

| Cách | URL |
|------|-----|
| Đăng nhập / đăng ký | http://localhost:5173/login |
| **Gmail (Google)** | Nút Google trên trang login |
| **Admin** | http://localhost:5173/admin/login |
| Admin dev | `admin@nihongo.local` / `admin123` |

Chi tiết: [google-oauth-setup.md](./google-oauth-setup.md)

---

## Stripe webhook (Stripe CLI)

**Terminal riêng** — giữ chạy khi test thanh toán:

```powershell
cd C:\Users\dungle\Desktop\edu_app
npm run stripe:login    # một lần
npm run stripe:listen   # → localhost:3000/api/webhooks/stripe
```

CLI in `whsec_...` → cập nhật `STRIPE_WEBHOOK_SECRET` trong `services/.env` → **restart gateway**.

```powershell
.\stripe.cmd trigger payment_intent.succeeded
```

Keys trong `services/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Sơ đồ terminal

```
┌─────────────────────────────────────────────────────────────┐
│  T1: docker compose up -d postgres redis mongodb kafka...   │
│  T2: npm run dev:gateway                    → :3000           │
│  T3: npm run dev:content                    → :50051          │
│  T4: npm run dev:exam                       → :50052          │
│  T5: npm run dev:nihongo-web                → :5173           │
│  T6: npm run dev:english-web                → :3001           │
│  T7: npm run stripe:listen                  (khi test Stripe) │
└─────────────────────────────────────────────────────────────┘
```

---

## NPM scripts

| Script | Mô tả |
|--------|--------|
| `npm run dev:gateway` | API gateway |
| `npm run dev:content` | Content gRPC |
| `npm run dev:exam` | Exam gRPC |
| `npm run dev:nihongo-web` | Frontend tiếng Nhật |
| `npm run dev:english-web` | Frontend tiếng Anh |
| `npm run docker:up` | `docker compose up -d` |
| `npm run docker:down` | Dừng Docker |
| `npm run stripe:login` | Đăng nhập Stripe CLI |
| `npm run stripe:listen` | Forward webhook → local |

---

## Checklist

- [ ] Docker: `edu-postgres` + `edu-redis` healthy
- [ ] http://localhost:3000/api/docs → **200**
- [ ] http://localhost:5173 → **200**
- [ ] Content `:50051` + Exam `:50052` đang listen
- [ ] `npm run stripe:listen` chạy + `STRIPE_WEBHOOK_SECRET` khớp `whsec` từ CLI

---

## Xử lý lỗi

| Triệu chứng | Cách xử lý |
|-------------|------------|
| `stripe` không nhận lệnh | `.\stripe.cmd` hoặc `npm run stripe:...` |
| Gateway `[ioredis] Unhandled error` | `docker compose up -d redis` → restart gateway |
| Kafka error lúc start | `docker compose up -d kafka zookeeper` |
| Port `5433` conflict | Dùng stack `edu-app`, tắt postgres container cũ |
| Stripe `Invalid signature` | `whsec` phải từ terminal `stripe:listen` đang chạy |
| Google login lỗi | Thêm `http://localhost:5173` vào Authorized origins |

---

## Dừng hệ thống

```powershell
# Ctrl+C từng terminal dev

docker compose down          # giữ data
docker compose down -v       # xóa volume — mất DB
```

---

## Tham chiếu

| Tài liệu | Nội dung |
|----------|----------|
| [README.md](../README.md) | Kiến trúc tổng quan |
| [system-design.md](./system-design.md) | Request flows |
| [google-oauth-setup.md](./google-oauth-setup.md) | Gmail / Google Sign-In |
