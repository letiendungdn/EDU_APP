import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

export async function seedEnglishKatakana(prisma: PrismaClientType) {
  const sectionCount = await prisma.englishKatakanaSection.count();
  console.log(
    `English–Katakana data file đã xóa khỏi repo. Giữ nguyên dữ liệu DB hiện tại (${sectionCount} mục).`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedEnglishKatakana(prisma);
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
