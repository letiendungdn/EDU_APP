# Học Docker — áp vào EDU APP

Tài liệu học Docker **bằng stack thật** của project này, không phải lý thuyết chung chung.  
Khi cần lệnh chạy full stack, xem thêm [docker.md](./docker.md).

---

## 1. Docker giải quyết gì?

Máy bạn cài Windows, Postgres, Node… mỗi người một phiên bản khác nhau → “chạy được trên máy tôi”.

Docker đóng **cả môi trường** (OS nhỏ + app + thư viện) thành **image**, rồi chạy thành **container**.  
Cùng một `docker-compose.yml` → máy khác chạy gần như giống hệt.

Trong EDU APP: không cần cài Postgres/Redis/Kafka tay. Compose kéo image và chạy hộ.

---

## 2. Ba khái niệm bắt buộc nhớ

| Khái niệm | Ví dụ trong project | Sống ở đâu |
|-----------|---------------------|------------|
| **Image** | `edu-app-nihongo-web:latest`, `postgres:16-alpine` | Đĩa máy (hoặc USB nếu chuyển data Docker) |
| **Container** | `edu-nihongo-web`, `edu-postgres-nihongo` | Process đang chạy, tạo từ image |
| **Volume** | `nihongo-app_postgres_data` | Data bền: DB, ảnh vocab trong Postgres |

Công thức:

```text
Dockerfile  →  docker build  →  Image
Image       →  docker run / compose up  →  Container
Volume      →  gắn vào container  →  data không mất khi xóa container
```

**Image ≠ file `.tar` đang chạy.** File `.tar` trên USB chỉ là **backup**. Phải `docker load` mới thành image trên máy, rồi mới `compose up`.

---

## 3. Lệnh tối thiểu (PowerShell)

Chạy trong thư mục repo (`edu_app`), nơi có `docker-compose.yml`.

### Xem

```powershell
docker ps                          # container đang chạy
docker ps -a                       # cả container đã tắt
docker images                      # danh sách image
docker compose ps                  # stack theo compose
docker logs -f edu-nihongo-web     # log realtime (Ctrl+C để thoát)
```

### Chạy / dừng

```powershell
docker compose up -d                          # chạy nền theo compose
docker compose up -d nihongo-web              # chỉ một service (+ dependency)
docker compose stop                           # dừng, giữ container
docker compose down                           # dừng + xóa container (volume mặc định còn)
```

`-d` = detached (chạy nền, trả lại cửa sổ lệnh).

### Build lại sau khi sửa code frontend / service

Sửa `apps/nihongo-web` **không** tự vào container đang chạy. Phải **build image mới**:

```powershell
docker compose up -d --build nihongo-web
```

`--build` = nấu lại image từ `Dockerfile`, rồi tạo container mới.

Chỉ sửa data trong Postgres (seed) thì **không** cần build web — restart service đọc DB là đủ:

```powershell
docker compose restart content-service
```

---

## 4. Compose: bản nhạc của cả dàn

`docker-compose.yml` khai báo:

- **image** có sẵn (`postgres:16-alpine`) → kéo từ Docker Hub
- **build** từ Dockerfile (`nihongo-web`, `content-service`…) → tự build
- **ports** `8080:80` → máy bạn `:8080` vào cổng `80` trong nginx
- **volumes** → giữ DB
- **depends_on** + **healthcheck** → Postgres healthy rồi mới start API
- **container_name** `edu-...` → tên cố định, dễ `docker logs`

Tên service trong lệnh compose là **tên YAML** (`nihongo-web`), không phải tên container (`edu-nihongo-web`):

```powershell
docker compose up -d nihongo-web     # đúng (service)
docker compose up -d edu-nihongo-web # sai
```

---

## 5. Request đi đâu khi mở app?

```text
Trình duyệt
    → http://localhost:8080
        → container edu-nginx
            → trang web: edu-nihongo-web (Next.js)
            → /api/... : edu-gateway (NestJS :3000)
                → gRPC: edu-content, edu-exam
                    → Postgres: edu-postgres-nihongo :5432
                      (máy host map 5433:5432)
```

Trong Docker, service gọi nhau bằng **tên service**, không dùng `localhost`:

| Ai gọi | Đúng | Sai |
|--------|------|-----|
| nihongo-web → API | `http://api-gateway:3000` | `http://localhost:3000` |
| Máy bạn → API | `http://localhost:3000` hoặc `http://localhost:8080/api/` | `http://api-gateway:3000` |

`localhost` trong container = chính container đó, không phải máy Windows.

---

## 6. Image có sẵn vs image tự build

| Loại | Ví dụ | Khi nào rebuild |
|------|--------|-----------------|
| Hub | `postgres`, `redis`, `mongo`, `kafka` | Hầu như không — chỉ `pull` khi muốn bản mới |
| App | `edu-app-nihongo-web`, `edu-app-content-service` | Mỗi lần đổi code cần chạy trong Docker |

Dockerfile `nihongo-web` (rút gọn):

1. Stage **builder**: `npm ci` + `next build`
2. Stage **runner**: copy bản build, `node server.js`

Hai stage để image chạy **nhỏ hơn** (không nhét hết `node_modules` dev).

---

## 7. Volume — chỗ DB và ảnh vocab sống

Ảnh upload local đang nằm trong cột `Vocabulary.imageUrl` trên **Postgres**, volume:

`nihongo-app_postgres_data`

```powershell
docker volume ls
docker volume inspect nihongo-app_postgres_data
```

`docker compose down` **không** xóa volume.  
`docker compose down -v` **xóa data** — đừng dùng trừ khi cố tình reset DB.

Backup SQL (đã làm trên USB):

```powershell
docker exec edu-postgres-nihongo pg_dump -U nihongo -d nihongo -Fc -f /tmp/nihongo.dump
docker cp edu-postgres-nihongo:/tmp/nihongo.dump D:\edu-app-docker-export\db\nihongo.dump
```

---

## 8. Mang image sang máy khác (USB)

Không chạy app “trực tiếp từ USB”. Quy trình:

**Máy A (xuất)**

```powershell
docker save -o D:\edu-app-docker-export\edu-app-images.tar edu-app-nihongo-web:latest edu-app-api-gateway:latest
```

**Máy B (nạp rồi chạy)**

```powershell
docker load -i D:\edu-app-docker-export\edu-app-images.tar
cd C:\path\to\edu_app
docker compose up -d
```

Vẫn cần **source** (`docker-compose.yml`) trên máy B. Image chỉ thay phần “đĩa cài app”.

---

## 9. Giải phóng ổ C

`docker rmi` / `docker builder prune` xóa **bên trong** đĩa ảo Docker (file `docker_data.vhdx`). Windows không tự thu file đó.

Sau khi xóa image:

1. Tắt Docker Desktop
2. Compact VHDX (cần quyền Admin) — xem script từng dùng trên USB nếu còn
3. Bật Docker lại

Chuyển cả data Docker sang USB = junction/`CustomWslDistroDir`. **Phải cắm USB** khi bật Docker. Rút USB lúc Docker chạy dễ hỏng volume.

---

## 10. Debug khi “không lên”

| Triệu chứng | Làm gì |
|-------------|--------|
| `failed to connect to the docker API` | Bật Docker Desktop, đợi engine xanh |
| Trang 8080 trắng / 502 | `docker logs edu-nginx`, `docker logs edu-nihongo-web` |
| Vocab “Đang tải…” mãi | `docker logs edu-gateway`, `docker logs edu-content`; thử `http://localhost:3000/api/lessons` |
| `port is already allocated` | Port 8080/3000/5433 bị chiếm — tắt app cũ hoặc đổi port |
| Sửa code rồi không thấy | Quên `--build`; hoặc đang xem cache trình duyệt |
| Keycloak fail mount file | Thiếu file trong `infra/keycloak/` — học vẫn chạy được phần nội dung |

Vào shell trong container:

```powershell
docker exec -it edu-postgres-nihongo psql -U nihongo -d nihongo
docker exec -it edu-nihongo-web sh
```

---

## 11. Bài tập trên stack này

Làm lần lượt, ghi lại lệnh đã gõ:

1. `docker ps` — kể tên 3 container và việc của chúng.
2. Mở `http://localhost:8080` rồi `docker logs --tail 20 edu-nginx`.
3. Sửa một chữ trên UI (ví dụ subtitle trang `/suffixes`), chạy `docker compose up -d --build nihongo-web`, F5 xem đổi.
4. `docker exec edu-postgres-nihongo psql -U nihongo -d nihongo -c "SELECT COUNT(*) FROM \"Vocabulary\";"`
5. `docker compose stop nihongo-web` rồi `docker compose start nihongo-web` — phân biệt stop/start với down/up.

---

## 12. Cheat sheet in ra dán bàn

```powershell
# Chạy app tiếng Nhật
npm run docker:up:nihongo
# Mở: http://localhost:8080

# Sửa code web → nấu lại
docker compose up -d --build nihongo-web

# Log
docker logs -f edu-gateway
docker logs -f edu-content

# Tắt
docker compose down
```

Image / container / volume / `--build` / `localhost` vs tên service: nắm 5 ý này là dùng Docker cho EDU APP đủ việc hàng ngày.
