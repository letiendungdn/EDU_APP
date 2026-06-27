# Microservices

Backend gRPC microservices.

| Service | Folder | Port | Mô tả |
|---------|--------|------|--------|
| **api-gateway** | `api-gateway/` | 3000 | HTTP entry, JWT auth |
| **content-service** | `content-service/` | 50051 | Lessons, vocab, grammar, kanji… |
| **exam-service** | `exam-service/` | 50052 | Mock exam, progress, SRS |
| **english-api** | `english-api/` | 3001 | BFF tiếng Anh (trong `apps/english-web`) |

Shared libs nằm trong `packages/` — xem `packages/README.md`.

## Chạy local

```bash
npm run dev:gateway
npm run dev:content
npm run dev:exam
```

## gRPC

Proto: `packages/nest-contracts/proto/`
