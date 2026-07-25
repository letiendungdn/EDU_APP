# Nginx dùng để làm gì?

Trong EDU APP, **nginx** (`edu-nginx`, port host **8080**) là **reverse proxy / cổng vào duy nhất** khi chạy full stack bằng Docker. Client (trình duyệt, Android emulator) không cần nhớ từng port của web, API, Keycloak — chỉ gọi `:8080`, nginx phân luồng theo **hostname** + **path**.

Config: [`infra/nginx/nginx.conf`](../infra/nginx/nginx.conf)  
Container: `docker-compose.yml` → service `nginx` (`${NGINX_HTTP_PORT:-8080}:80`)

---

## Vai trò chính

| Việc | Giải thích |
|------|------------|
| **Một cổng vào** | Host chỉ mở `8080` → container port `80`. Không bind cổng 80 host (tránh conflict). |
| **Route theo domain** | `nihongo.localhost` / `localhost` → app Nhật; `auth.localhost` → Keycloak; `english.localhost` → app Anh; `nihongo-angular.localhost` → Angular. |
| **Route theo path** | `/api/*`, `/health` → `api-gateway:3000`; `/` → frontend tương ứng. |
| **Ẩn service nội bộ** | `nihongo-web`, `keycloak`, … không cần publish hết ra host; nginx gọi qua Docker network. |
| **Hỗ trợ mobile emulator** | Host `10.0.2.2` cũng vào server Nihongo — emulator Android gọi `http://10.0.2.2:8080` để tới API + Keycloak. |

---

## Sơ đồ routing

```
Browser / Emulator
        │
        ▼
   edu-nginx :8080
        │
        ├── Host: auth.localhost
        │         └──► keycloak:8080
        │
        ├── Host: nihongo.localhost | localhost | 10.0.2.2
        │         ├── /api/*, /health  → api-gateway:3000
        │         ├── /realms|resources|js… → keycloak (cho emulator, không cần DNS auth.localhost)
        │         └── /                → nihongo-web:5173
        │
        ├── Host: nihongo-angular.localhost
        │         ├── /api/*, /health  → api-gateway:3000
        │         ├── /media/          → nihongo-web:5173
        │         └── /                → nihongo-angular:80
        │
        └── Host: english.localhost
                  └── /                → english-web:3001  (profile `english`)
```

---

## URL thường dùng

| Mục | URL |
|-----|-----|
| Nihongo web | http://localhost:8080 hoặc http://nihongo.localhost:8080 |
| API qua nginx | http://localhost:8080/api/... |
| Health | http://localhost:8080/health |
| Keycloak | http://auth.localhost:8080 |
| English web | http://english.localhost:8080 *(cần profile `english`)* |
| Angular | http://nihongo-angular.localhost:8080 |

Vẫn có thể gọi gateway thẳng: http://localhost:3000/api/... (dev local không qua nginx).

---

## Vì sao mobile (Android) hay dùng `:8080`?

- Emulator: `10.0.2.2` = máy host. App native (`nihongo-android`) mặc định `http://10.0.2.2:8080/api/` → **nginx → api-gateway**.
- Cùng host `10.0.2.2:8080` còn proxy path Keycloak (`/realms`, …) nên OIDC trên emulator **không cần** resolve `auth.localhost`.
- Expo / Flutter mặc định có thể trỏ thẳng `:3000` (gateway) — xem [run-mobile.md](./run-mobile.md). Qua nginx (`:8080`) tiện hơn nếu muốn **một base URL** cho cả API + auth.

---

## Không làm gì?

- **Không** thay api-gateway (auth JWT, business logic vẫn ở Nest).
- **Không** thay load balancer production (K8s dùng Ingress tương đương — [`infra/k8s/ingress.yaml`](../infra/k8s/ingress.yaml)).
- **Không** bắt buộc khi chỉ chạy `npm run dev:*` local — lúc đó frontend rewrite `/api` → `:3000` trực tiếp.

---

## Lệnh nhanh

```powershell
docker compose up -d nginx          # hoặc full stack: docker compose up -d
curl.exe http://localhost:8080/health
curl.exe http://localhost:8080/api/lessons
```

Đổi port host: `NGINX_HTTP_PORT=8888` trong `.env` rồi `docker compose up -d nginx`.

---

## Tài liệu liên quan

| File | Nội dung |
|------|----------|
| [docker.md](./docker.md) | Checklist container, URL, troubleshooting 502 |
| [run-mobile.md](./run-mobile.md) | App mobile gọi API qua nginx hay gateway |
| [keycloak-setup.md](./keycloak-setup.md) | Auth qua `auth.localhost` |
| [`infra/nginx/nginx.conf`](../infra/nginx/nginx.conf) | Config chi tiết |
