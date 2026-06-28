import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { JAPANESE_PRONUNCIATION_RULES } from './pronunciation-rules.data';

export async function seedPronunciationRules(prisma: PrismaClientType) {
  const sectionCount = await prisma.pronunciationRuleSection.count();
  const force = process.env.FORCE_PRONUNCIATION_RULES_SEED === '1';

  if (sectionCount > 0 && !force) {
    console.log(
      `Quy tắc phát âm đã có trong DB (${sectionCount} mục). Bỏ qua seed.`,
    );
    console.log('  FORCE_PRONUNCIATION_RULES_SEED=1 để ghi đè.');
    return;
  }

  if (sectionCount > 0) {
    await prisma.pronunciationRuleExample.deleteMany();
    await prisma.pronunciationRulePoint.deleteMany();
    await prisma.pronunciationRuleSection.deleteMany();
    await prisma.pronunciationRuleTip.deleteMany();
  }

  const data = JAPANESE_PRONUNCIATION_RULES;

  await prisma.pronunciationRulesMeta.upsert({
    where: { id: 1 },
    create: { id: 1, intro: data.intro },
    update: { intro: data.intro },
  });

  if (data.tipsForVietnamese.length > 0) {
    await prisma.pronunciationRuleTip.createMany({
      data: data.tipsForVietnamese.map((text, sortOrder) => ({ text, sortOrder })),
    });
  }

  for (let i = 0; i < data.sections.length; i++) {
    const section = data.sections[i];
    await prisma.pronunciationRuleSection.create({
      data: {
        slug: section.id,
        title: section.title,
        summary: section.summary,
        sortOrder: i,
        points: {
          create: section.points.map((point, sortOrder) => ({
            label: point.label ?? null,
            japanese: point.japanese ?? null,
            romaji: point.romaji ?? null,
            explanation: point.explanation,
            sortOrder,
          })),
        },
        ...(section.examples?.length
          ? {
              examples: {
                create: section.examples.map((example, sortOrder) => ({
                  japanese: example.japanese,
                  romaji: example.romaji,
                  meaning: example.meaning,
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
    `Quy tắc phát âm: ${data.sections.length} mục, ${data.tipsForVietnamese.length} lưu ý.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedPronunciationRules(prisma);
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
