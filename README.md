# Edu Platform — Monorepo

Hệ sinh thái học tiếng Nhật & tiếng Anh: **micro frontends** + **microservices** + **shared packages**.

## Cấu trúc

```
edu_app/
├── apps/                      # Micro Frontends
│   ├── nihongo-web/           # Next.js — tiếng Nhật (:5173)
│   └── english-web/           # Next.js — tiếng Anh (:3001)
├── services/                  # Micro Backends (gRPC)
│   ├── api-gateway/           # HTTP :3000
│   ├── content-service/       # gRPC :50051
│   ├── exam-service/          # gRPC :50052
│   └── english-api/           # BFF docs (API trong english-web)
├── packages/                  # Shared libraries
│   ├── vocab-images/          # OpenMoji map
│   ├── nest-common/           # NestJS guards, gRPC utils
│   ├── nest-contracts/        # Proto, DTOs, patterns
│   ├── nest-prisma/           # Prisma module
│   └── prisma-nihongo/        # DB schema + migrations + seeds
├── infra/
│   └── backups/               # SQL dumps
├── docs/
├── docker-compose.yml
└── package.json
```

## Chạy dev

```bash
npm install

docker compose up -d postgres redis

npm run dev:gateway      # :3000
npm run dev:content      # gRPC :50051
npm run dev:exam         # gRPC :50052
npm run dev:nihongo-web  # :5173
npm run dev:english-web  # :3001
```

## Docker

```bash
docker compose up -d
```

## Database backup

```bash
docker exec nihongo-postgres pg_dump -U nihongo nihongo > infra/backups/nihongo_$(date +%Y%m%d_%H%M%S).sql
```
