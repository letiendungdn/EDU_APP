import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { VOCAB_SUFFIX_GROUPS } from './vocab-suffixes.data';

export async function seedVocabSuffixes(prisma: PrismaClientType) {
  const groupCount = await prisma.vocabSuffixGroup.count();
  const force = process.env.FORCE_VOCAB_SUFFIXES_SEED === '1';

  if (groupCount > 0 && !force) {
    console.log(`Hậu tố từ vựng đã có trong DB (${groupCount} nhóm). Bỏ qua seed.`);
    console.log('  FORCE_VOCAB_SUFFIXES_SEED=1 để ghi đè.');
    return;
  }

  if (groupCount > 0) {
    await prisma.vocabSuffixItem.deleteMany();
    await prisma.vocabSuffixGroup.deleteMany();
  }

  let itemTotal = 0;
  for (let i = 0; i < VOCAB_SUFFIX_GROUPS.length; i++) {
    const group = VOCAB_SUFFIX_GROUPS[i];
    await prisma.vocabSuffixGroup.create({
      data: {
        slug: group.slug,
        label: group.label,
        hint: group.hint,
        sortOrder: i,
        items: {
          create: group.items.map((item, sortOrder) => ({
            suffix: item.suffix,
            kana: item.kana,
            romaji: item.romaji,
            meaningVi: item.meaningVi,
            attachesTo: item.attachesTo,
            exampleJa: item.exampleJa,
            exampleVi: item.exampleVi,
            sortOrder,
          })),
        },
      },
    });
    itemTotal += group.items.length;
  }

  console.log(
    `Hậu tố từ vựng: ${VOCAB_SUFFIX_GROUPS.length} nhóm, ${itemTotal} mục.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedVocabSuffixes(prisma);
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
