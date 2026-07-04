import type { PrismaClient } from './generated/client';
import { KANA_ROMAJI_ENTRIES } from './kana-romaji.data';

export async function seedKanaRomaji(prisma: PrismaClient) {
  const count = await prisma.kanaRomaji.count();
  const force = process.env.FORCE_KANA_ROMAJI_SEED === '1';

  if (count > 0 && !force) {
    console.log(`KanaRomaji đã có trong DB (${count} mục). Bỏ qua seed.`);
    console.log('  FORCE_KANA_ROMAJI_SEED=1 để ghi đè.');
    return;
  }

  if (count > 0) {
    await prisma.kanaRomaji.deleteMany();
  }

  await prisma.kanaRomaji.createMany({
    data: KANA_ROMAJI_ENTRIES.map((entry, sortOrder) => ({
      kana: entry.kana,
      romaji: entry.romaji,
      sortOrder,
    })),
  });

  console.log(`KanaRomaji: ${KANA_ROMAJI_ENTRIES.length} mục.`);
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
