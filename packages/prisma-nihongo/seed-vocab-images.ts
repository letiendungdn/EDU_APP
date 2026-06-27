import { PrismaClient } from '@prisma/client';
import { resolveVocabImage } from '@edu/vocab-images';

type VocabImageRow = {
  id: number;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning: string;
  imageUrl: string | null;
};

export async function seedVocabImages(prisma: PrismaClient) {
  const vocabList = await prisma.$queryRaw<VocabImageRow[]>`
    SELECT id, kana, kanji, romaji, meaning, "imageUrl"
    FROM "Vocabulary"
  `;

  let updated = 0;
  let cleared = 0;
  for (const vocab of vocabList) {
    const imageUrl = resolveVocabImage({
      word: vocab.romaji,
      meaning: vocab.meaning,
      kana: vocab.kana,
      kanji: vocab.kanji,
    });

    if (imageUrl === vocab.imageUrl) continue;

    await prisma.$executeRaw`
      UPDATE "Vocabulary" SET "imageUrl" = ${imageUrl} WHERE id = ${vocab.id}
    `;
    if (imageUrl) updated++;
    else cleared++;
  }

  console.log(`✅ Cập nhật ${updated} từ có ảnh, xóa ${cleared} URL cũ/sai`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedVocabImages(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
