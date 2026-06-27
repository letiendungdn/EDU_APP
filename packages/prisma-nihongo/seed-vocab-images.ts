import { PrismaClient } from '@prisma/client';
import { resolveVocabImage, toLocalImageUrl } from '@edu/vocab-images';

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
    const resolved =
      toLocalImageUrl(
        resolveVocabImage({
          word: vocab.romaji,
          meaning: vocab.meaning,
          kana: vocab.kana,
          kanji: vocab.kanji,
          imageUrl: vocab.imageUrl,
        }),
      ) ?? null;

    if (resolved === vocab.imageUrl) continue;

    await prisma.$executeRaw`
      UPDATE "Vocabulary" SET "imageUrl" = ${resolved} WHERE id = ${vocab.id}
    `;
    if (resolved) updated++;
    else cleared++;
  }

  const kanjiRows = await prisma.$queryRaw<{ id: number; imageUrl: string | null }[]>`
    SELECT id, "imageUrl" FROM "KanjiEntry" WHERE "imageUrl" IS NOT NULL
  `;
  let kanjiUpdated = 0;
  for (const row of kanjiRows) {
    const local = toLocalImageUrl(row.imageUrl);
    if (!local || local === row.imageUrl) continue;
    await prisma.$executeRaw`
      UPDATE "KanjiEntry" SET "imageUrl" = ${local} WHERE id = ${row.id}
    `;
    kanjiUpdated++;
  }

  console.log(
    `✅ Vocab: ${updated} ảnh local, ${cleared} xóa URL cũ. Kanji: ${kanjiUpdated} ảnh local.`,
  );
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
