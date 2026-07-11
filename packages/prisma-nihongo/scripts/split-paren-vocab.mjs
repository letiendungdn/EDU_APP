import { PrismaClient } from '../generated/client/index.js';

const prisma = new PrismaClient();

function splitRomajiVariants(romaji) {
  const trimmed = romaji.trim();
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+?)\)\s*$/);
  if (!parenMatch) return [trimmed];

  const inner = parenMatch[2].trim();
  const alternates =
    inner.includes('、') || inner.includes(',')
      ? inner.split(/[,、]/).map((part) => part.trim())
      : [inner];

  return [parenMatch[1].trim(), ...alternates];
}

function parseReadingVariants(text, romaji) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const romajiLabels = romaji ? splitRomajiVariants(romaji) : [];
  const parenMatch =
    trimmed.match(/^(.+?)（(.+?)）$/) ?? trimmed.match(/^(.+?)\((.+?)\)$/);

  if (parenMatch) {
    const primary = parenMatch[1].trim();
    const inner = parenMatch[2].trim();
    const alternates =
      inner.includes('、') || inner.includes(',')
        ? inner.split(/[,、]/).map((part) => part.trim())
        : [inner];

    return [primary, ...alternates].map((variantText, index) => ({
      text: variantText,
      label: romajiLabels[index],
    }));
  }

  return [{ text: trimmed, label: romajiLabels[0] }];
}

function alternateMeaning(primary, index, label) {
  if (index === 0) return primary;
  const polite = ['donata', 'oikutsu', 'otearai'];
  if (label && polite.includes(label.toLowerCase())) {
    return `${primary.replace(/\.$/, '')} (kính ngữ)`;
  }
  if (label && /^-/.test(label)) {
    return `${primary.replace(/\.$/, '')} (biến âm: ${label})`;
  }
  return `${primary.replace(/\.$/, '')} (cách đọc khác${label ? `: ${label}` : ''})`;
}

function buildSplits(row) {
  const kanaVariants = parseReadingVariants(row.kana, row.romaji);
  const kanjiVariants = row.kanji
    ? parseReadingVariants(row.kanji, row.romaji)
    : [{ text: row.kanji ?? '', label: splitRomajiVariants(row.romaji)[0] }];

  if (kanaVariants.length <= 1 && kanjiVariants.length <= 1) return null;

  const count = Math.max(kanaVariants.length, kanjiVariants.length);
  const splits = [];

  for (let i = 0; i < count; i += 1) {
    const kanaVariant = kanaVariants[i] ?? kanaVariants[kanaVariants.length - 1];
    const kanjiVariant = kanjiVariants[i] ?? kanjiVariants[kanjiVariants.length - 1];
    const kanjiText =
      kanjiVariants.length > 1
        ? kanjiVariant?.text?.trim() || null
        : i === 0
          ? row.kanji?.trim() || null
          : null;
    const kanaText = kanaVariant.text.trim();
    const romajiText = kanaVariant.label ?? kanjiVariant?.label ?? row.romaji;

    splits.push({
      kanji: kanjiText || null,
      kana: kanaText,
      romaji: romajiText,
      meaning: alternateMeaning(row.meaning, i, romajiText),
      sortOrder: row.sortOrder + i,
    });
  }

  return splits;
}

const candidates = await prisma.vocabulary.findMany({
  where: {
    OR: [
      { kana: { contains: '（' } },
      { kana: { contains: '(' } },
      { kanji: { contains: '（' } },
      { kanji: { contains: '(' } },
    ],
  },
  orderBy: [{ lessonId: 'asc' }, { sortOrder: 'desc' }],
});

const plan = candidates
  .map((row) => ({ row, splits: buildSplits(row) }))
  .filter((item) => item.splits && item.splits.length > 1);

if (!plan.length) {
  console.log('No parenthetical vocabulary entries to split.');
  await prisma.$disconnect();
  process.exit(0);
}

await prisma.$transaction(async (tx) => {
  for (const { row, splits } of plan) {
    const extra = splits.length - 1;

    await tx.$executeRaw`
      UPDATE "Vocabulary"
      SET "sortOrder" = "sortOrder" + ${extra}
      WHERE "lessonId" = ${row.lessonId}
        AND "sortOrder" > ${row.sortOrder}
        AND id <> ${row.id}
    `;

    const [first, ...rest] = splits;

    await tx.vocabulary.update({
      where: { id: row.id },
      data: {
        kanji: first.kanji,
        kana: first.kana,
        romaji: first.romaji,
        meaning: first.meaning,
        sortOrder: first.sortOrder,
      },
    });

    for (const split of rest) {
      await tx.vocabulary.create({
        data: {
          kanji: split.kanji,
          kana: split.kana,
          romaji: split.romaji,
          meaning: split.meaning,
          meaningEn: row.meaningEn,
          partOfSpeech: row.partOfSpeech,
          jlptLevel: row.jlptLevel,
          pitchAccent: row.pitchAccent,
          audioUrl: row.audioUrl,
          imageUrl: row.imageUrl,
          frequencyRank: row.frequencyRank,
          sortOrder: split.sortOrder,
          lessonId: row.lessonId,
        },
      });
    }
  }
});

console.log(`Split ${plan.length} vocabulary entries.`);
await prisma.$disconnect();
