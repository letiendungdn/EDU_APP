# Shared Packages

Thư viện dùng chung giữa các services và apps.

| Package | Mô tả |
|---------|--------|
| `@edu/vocab-images` | OpenMoji picture dictionary map |
| `@edu/nest-common` | Guards, filters, gRPC utils, config NestJS |
| `@edu/nest-contracts` | gRPC proto, message patterns, DTOs |
| `@edu/nest-prisma` | PrismaService, SRS repository |
| `@edu/prisma-nihongo` | Schema, migrations, seeds DB tiếng Nhật |

## Prisma (nihongo)

```bash
cd packages/prisma-nihongo
npx prisma migrate dev
npx prisma studio

# Hoặc từ root
npm run seed:vocab-images -w @edu/nihongo-services
```
