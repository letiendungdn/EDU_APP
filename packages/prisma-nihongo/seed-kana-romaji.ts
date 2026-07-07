import type { PrismaClient } from './generated/client';

export async function seedKanaRomaji(prisma: PrismaClient) {
  const count = await prisma.kanaRomaji.count();
  console.log(
    `KanaRomaji data file đã xóa khỏi repo. Giữ nguyên dữ liệu DB hiện tại (${count} mục).`,
  );
}

async function main() {
  const { PrismaClient } = await import('./generated/client');
  const prisma = new PrismaClient();
  try {
    await seedKanaRomaji(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
