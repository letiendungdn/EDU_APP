# Alertmanager — gửi cảnh báo qua email

Prometheus ([`infra/prometheus/alerts.yml`](../prometheus/alerts.yml)) đánh giá alert → gửi sang Alertmanager → Alertmanager gửi
**email tới letiendungdt@gmail.com** (gom theo tên alert, có mail "RESOLVED" khi hết sự cố, nhắc lại mỗi 4 giờ).

| File | Dùng khi | Gửi tới |
|------|----------|---------|
| `alertmanager.local.yml` (mặc định) | dev / thử | **Mailpit** — xem mail ở http://localhost:8025, không ra Internet |
| `alertmanager.smtp.yml` | gửi thật | SMTP relay Brevo → hộp thư Gmail |

## Bật gửi mail thật

1. Brevo → **SMTP & API → SMTP**: lấy *SMTP login* và tạo *SMTP key* (khác `BREVO_API_KEY`).
2. Sửa `smtp_from` (sender đã xác minh trong Brevo) và `smtp_auth_username` trong `alertmanager.smtp.yml`.
3. Lưu SMTP key vào file (không commit — `infra/alertmanager/secrets/` nằm trong `.gitignore`):
   ```powershell
   New-Item -ItemType Directory -Force infra/alertmanager/secrets
   Set-Content -NoNewline infra/alertmanager/secrets/smtp_password "<SMTP key>"
   ```
4. Thêm vào `.env`: `ALERTMANAGER_CONFIG=./infra/alertmanager/alertmanager.smtp.yml`, rồi `docker compose up -d alertmanager`.

## Thử

```powershell
docker compose up -d prometheus alertmanager mailpit
docker stop edu-gateway          # sau ~2,5 phút ApiGatewayTargetDown firing → mail
start http://localhost:8025      # Mailpit: mail "[FIRING ×1] EDU APP — ApiGatewayTargetDown"
docker start edu-gateway         # vài phút sau: mail "[RESOLVED] …"
```

Kiểm tra cú pháp: `docker exec edu-alertmanager amtool check-config /etc/alertmanager/alertmanager.yml`
