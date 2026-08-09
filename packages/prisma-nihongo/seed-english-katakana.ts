import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { seedLongVowelRules } from './seed-long-vowel-rules';

export async function seedEnglishKatakana(prisma: PrismaClientType) {
  const sectionCount = await prisma.englishKatakanaSection.count();
  console.log(
    `English–Katakana: giữ dữ liệu DB hiện tại (${sectionCount} mục), cập nhật mục Trường âm ー.`,
  );
  await seedLongVowelRules(prisma);
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
