import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { ENGLISH_KATAKANA } from './english-katakana.data';

export async function seedEnglishKatakana(prisma: PrismaClientType) {
  const sectionCount = await prisma.englishKatakanaSection.count();
  const force = process.env.FORCE_ENGLISH_KATAKANA_SEED === '1';

  if (sectionCount > 0 && !force) {
    console.log(
      `English–Katakana đã có trong DB (${sectionCount} mục). Bỏ qua seed.`,
    );
    console.log('  FORCE_ENGLISH_KATAKANA_SEED=1 để ghi đè.');
    return;
  }

  if (sectionCount > 0) {
    await prisma.englishKatakanaExample.deleteMany();
    await prisma.englishKatakanaMapping.deleteMany();
    await prisma.englishKatakanaPoint.deleteMany();
    await prisma.englishKatakanaSection.deleteMany();
    await prisma.englishKatakanaTip.deleteMany();
  }

  const data = ENGLISH_KATAKANA;

  await prisma.englishKatakanaMeta.upsert({
    where: { id: 1 },
    create: { id: 1, intro: data.intro },
    update: { intro: data.intro },
  });

  if (data.tipsForVietnamese.length > 0) {
    await prisma.englishKatakanaTip.createMany({
      data: data.tipsForVietnamese.map((text, sortOrder) => ({ text, sortOrder })),
    });
  }

  for (let i = 0; i < data.sections.length; i++) {
    const section = data.sections[i];
    await prisma.englishKatakanaSection.create({
      data: {
        slug: section.id,
        title: section.title,
        summary: section.summary,
        sortOrder: i,
        ...(section.points?.length
          ? {
              points: {
                create: section.points.map((point, sortOrder) => ({
                  explanation: point.explanation,
                  english: point.english ?? null,
                  katakana: point.katakana ?? null,
                  romaji: point.romaji ?? null,
                  sortOrder,
                })),
              },
            }
          : {}),
        ...(section.mappings?.length
          ? {
              mappings: {
                create: section.mappings.map((mapping, sortOrder) => ({
                  english: mapping.english,
                  katakana: mapping.katakana,
                  romaji: mapping.romaji,
                  note: mapping.note ?? null,
                  sortOrder,
                })),
              },
            }
          : {}),
        ...(section.examples?.length
          ? {
              examples: {
                create: section.examples.map((example, sortOrder) => ({
                  english: example.english,
                  katakana: example.katakana,
                  romaji: example.romaji,
                  meaningVi: example.meaningVi,
                  note: example.note ?? null,
                  sortOrder,
                })),
              },
            }
          : {}),
      },
    });
  }

  console.log(
    `English–Katakana: ${data.sections.length} mục, ${data.tipsForVietnamese.length} lưu ý.`,
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
