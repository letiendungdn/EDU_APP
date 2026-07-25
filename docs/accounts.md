# Tài khoản dev đang dùng (local)

> ⚠️ Toàn bộ là **mật khẩu mặc định cho local/dev** — production phải đổi qua `.env` / secrets (`change-me-in-production` trong `infra/k8s/secret.yaml`).

## App (đăng nhập web / mobile)

| Tài khoản | Password | Vai trò | Ghi chú |
|-----------|----------|---------|---------|
| `admin@nihongo.local` | `admin123` | ADMIN | Admin dev — gateway tự tạo từ env `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Login: http://localhost:8080/admin/login (hoặc `:5173` khi dev) |

## Keycloak — demo users (realm `edu-app`)

Login qua nút Keycloak trên `/login` (web + mobile đều dùng được):

| Username / email | Password | Realm roles | App Role |
|------------------|----------|-------------|----------|
| `demo` / `demo@nihongo.local` | `demo123` | `user` | USER |
| `coach` / `coach@nihongo.local` | `coach123` | `teacher`, `user` | TEACHER |
| `admin-kc` / `admin-kc@nihongo.local` | `admin123` | `admin`, `user` | ADMIN |

## Admin console / monitoring

| Dịch vụ | URL | User / Password |
|---------|-----|-----------------|
| Keycloak Admin Console | http://auth.localhost:8080 | `admin` / `admin` (env `KEYCLOAK_ADMIN*`) |
| Grafana | http://localhost:4000 | `admin` / `admin` |

## Database

| DB | Host (từ máy host) | User / Password | Database |
|----|--------------------|-----------------|----------|
| PostgreSQL Nihongo | `localhost:5433` | `nihongo` / `nihongo` | `nihongo` |
| PostgreSQL English | `localhost:5434` | `english` / `english` | `english_learning` |
| PostgreSQL Keycloak | (nội bộ Docker) | `keycloak` / `keycloak` | `keycloak` |
| MongoDB (audit log) | `localhost:27017` | *không auth* | `nihongo_audit` |
| Redis | `localhost:6379` | *không auth* | — |

Kết nối nhanh:

```powershell
docker exec -it edu-postgres-nihongo psql -U nihongo nihongo
docker exec -it edu-mongodb mongosh nihongo_audit
docker exec -it edu-redis redis-cli
```

## Dịch vụ ngoài (key trong `services/.env`, không commit)

| Dịch vụ | Env | Ghi chú |
|---------|-----|---------|
| Stripe (test mode) | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `whsec_...` lấy từ `npm run stripe:listen` |
| Google OAuth | `GOOGLE_CLIENT_ID` | Xem [google-oauth-setup.md](./google-oauth-setup.md) |
| Brevo (email) | `BREVO_API_KEY` | Xem [brevo-mail.md](./brevo-mail.md) |
| LiveKit (livestream SFU, dev) | `LIVEKIT_API_KEY=devkey` / `LIVEKIT_API_SECRET=devsecret` | Mặc định trong `docker-compose.yml`. Call 1-1 ≈ `signaling-service` |

## Đổi mật khẩu ở đâu?

Tất cả default đọc từ `.env` (root, cho Docker) — xem `.env.docker.example`:

```bash
ADMIN_EMAIL / ADMIN_PASSWORD          # admin app
KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD
POSTGRES_PASSWORD / ENGLISH_POSTGRES_PASSWORD / KEYCLOAK_DB_PASSWORD
```

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [keycloak-setup.md](./keycloak-setup.md) | Realm, clients, demo users |
| [run-local.md](./run-local.md) | URL đăng nhập khi dev |
| [docker.md](./docker.md) | Env vars của từng container |
