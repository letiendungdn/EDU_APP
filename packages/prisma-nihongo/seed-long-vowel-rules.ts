import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import {
  LONG_VOWEL_SECTION,
  SIX_CORE_RULE3_MAPPING,
  SIX_CORE_RULE3_POINT,
} from './long-vowel-rules.data';

/**
 * Upsert mục Trường âm ー vào bảng EnglishKatakana*.
 * Idempotent — luôn ghi đè nội dung section `long-vowel`.
 */
export async function seedLongVowelRules(prisma: PrismaClientType) {
  const data = LONG_VOWEL_SECTION;

  let section = await prisma.englishKatakanaSection.findUnique({
    where: { slug: data.slug },
  });

  if (!section) {
    const maxOrder = await prisma.englishKatakanaSection.aggregate({
      _max: { sortOrder: true },
    });
    section = await prisma.englishKatakanaSection.create({
      data: {
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });
  } else {
    await prisma.englishKatakanaPoint.deleteMany({ where: { sectionId: section.id } });
    await prisma.englishKatakanaMapping.deleteMany({ where: { sectionId: section.id } });
    await prisma.englishKatakanaExample.deleteMany({ where: { sectionId: section.id } });

    section = await prisma.englishKatakanaSection.update({
      where: { id: section.id },
      data: {
        title: data.title,
        summary: data.summary,
      },
    });
  }

  await prisma.englishKatakanaPoint.createMany({
    data: data.points.map((point, sortOrder) => ({
      sectionId: section!.id,
      explanation: point.explanation,
      english: point.english ?? null,
      katakana: point.katakana ?? null,
      romaji: point.romaji ?? null,
      sortOrder,
    })),
  });

  await prisma.englishKatakanaMapping.createMany({
    data: data.mappings.map((m, sortOrder) => ({
      sectionId: section!.id,
      english: m.english,
      katakana: m.katakana,
      romaji: m.romaji,
      note: m.note ?? null,
      sortOrder,
    })),
  });

  await prisma.englishKatakanaExample.createMany({
    data: data.examples.map((e, sortOrder) => ({
      sectionId: section!.id,
      english: e.english,
      katakana: e.katakana,
      romaji: e.romaji,
      meaningVi: e.meaningVi,
      note: e.note ?? null,
      sortOrder,
    })),
  });

  // Đồng bộ tóm tắt quy luật 3 trong mục 6 quy luật (nếu có)
  const six = await prisma.englishKatakanaSection.findUnique({
    where: { slug: 'six-core-rules' },
    include: { points: { orderBy: { sortOrder: 'asc' } } },
  });

  if (six) {
    const rule3 = six.points.find((p) => p.explanation.includes('Quy luật 3'));
    if (rule3) {
      await prisma.englishKatakanaPoint.update({
        where: { id: rule3.id },
        data: {
          explanation: SIX_CORE_RULE3_POINT.explanation,
          english: SIX_CORE_RULE3_POINT.english,
          katakana: SIX_CORE_RULE3_POINT.katakana,
          romaji: SIX_CORE_RULE3_POINT.romaji,
        },
      });
    }

    const map3 = await prisma.englishKatakanaMapping.findFirst({
      where: {
        sectionId: six.id,
        OR: [
          { english: { contains: 'Trường âm' } },
          { english: { contains: '3.' } },
          { note: { contains: 'car→カー' } },
        ],
      },
    });
    if (map3) {
      await prisma.englishKatakanaMapping.update({
        where: { id: map3.id },
        data: SIX_CORE_RULE3_MAPPING,
      });
    }
  }

  console.log(
    `Trường âm ー (DB): ${data.points.length} points, ${data.mappings.length} mappings, ${data.examples.length} examples.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedLongVowelRules(prisma);
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
