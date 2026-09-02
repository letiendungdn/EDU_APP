/**
 * Bổ sung JLPT N2/N1 (kanji, từ vựng, ngữ pháp) — upsert idempotent, không xoá nội dung cũ.
 * Đồng thời gắn jlptLevel cho Minna (bài 1–50).
 *
 *   npm run seed:jlpt-expand -w @edu/prisma-nihongo
 */
import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { JLPT_KANJI_EXPAND } from './jlpt-kanji-expand.data';
import { JLPT_KANJI_GAP_FILL } from './jlpt-kanji-gap-fill.data';
import { JLPT_VOCAB_EXPAND } from './jlpt-vocab-expand.data';
import { JLPT_VOCAB_GAP_FILL } from './jlpt-vocab-gap-fill.data';
import { JLPT_VOCAB_GAP_TOPUP } from './jlpt-vocab-gap-topup.data';
import { JLPT_GRAMMAR_EXPAND } from './jlpt-grammar-expand.data';
import { JLPT_GRAMMAR_GAP_FILL } from './jlpt-grammar-gap-fill.data';
import { JLPT_VOCAB_UNITS } from './jlpt-vocab.data';
import { JLPT_GRAMMAR_UNITS, type JlptGrammarUnit } from './jlpt-grammar.data';
import { seedJlptTags } from './seed-jlpt-tags';

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function findGrammarUnit(lessonNumber: number): JlptGrammarUnit | undefined {
  return (
    JLPT_GRAMMAR_UNITS.find((g) => g.lessonNumber === lessonNumber) ??
    JLPT_GRAMMAR_EXPAND.find((g) => g.lessonNumber === lessonNumber) ??
    JLPT_GRAMMAR_GAP_FILL.find((g) => g.lessonNumber === lessonNumber)
  );
}

function normPattern(p: string): string {
  return p.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function seedGrammarForLesson(
  prisma: PrismaClientType,
  unit: JlptGrammarUnit,
  globalGrammarPatterns: Set<string>,
): Promise<number> {
  const items = dedupeBy(unit.items, (i) => i.pattern);
  const lesson = await prisma.lesson.upsert({
    where: { lessonNumber: unit.lessonNumber },
    update: { title: unit.title, jlptLevel: unit.jlptLevel, sortOrder: unit.sortOrder },
    create: {
      lessonNumber: unit.lessonNumber,
      title: unit.title,
      jlptLevel: unit.jlptLevel,
      sortOrder: unit.sortOrder,
    },
  });

  const existing = await prisma.grammar.findMany({
    where: { lessonId: lesson.id },
    select: { pattern: true, sortOrder: true },
  });
  const existingPatterns = new Set(existing.map((g) => g.pattern));
  let sortOrder = existing.reduce((max, g) => Math.max(max, g.sortOrder), -1) + 1;
  let added = 0;

  for (const item of items) {
    if (existingPatterns.has(item.pattern)) continue;
    if (globalGrammarPatterns.has(normPattern(item.pattern))) continue;
    await prisma.grammar.create({
      data: {
        pattern: item.pattern,
        meaning: item.meaning,
        explanation: item.explanation ?? null,
        formalityLevel: item.formalityLevel ?? null,
        jlptLevel: unit.jlptLevel,
        sortOrder: sortOrder++,
        lessonId: lesson.id,
        examples: {
          create: item.examples.map((ex, i) => ({
            jp: ex.jp,
            romaji: ex.romaji,
            vi: ex.vi,
            sortOrder: i,
          })),
        },
      },
    });
    globalGrammarPatterns.add(normPattern(item.pattern));
    added++;
  }

  return added;
}

export async function seedJlptExpand(prisma: PrismaClientType) {
  await seedJlptTags(prisma);

  let kanjiAdded = 0;
  let vocabAdded = 0;
  let grammarAdded = 0;
  let lessonCreated = 0;

  const globalKanjiChars = new Set(
    (await prisma.kanjiEntry.findMany({ select: { character: true } })).map((e) => e.character),
  );
  const globalGrammarPatterns = new Set(
    (await prisma.grammar.findMany({ select: { pattern: true } })).map((g) => normPattern(g.pattern)),
  );

  // ─── Kanji (KanjiLesson) ───────────────────────────────────────────
  for (const kl of [...JLPT_KANJI_EXPAND, ...JLPT_KANJI_GAP_FILL]) {
    const entries = dedupeBy(kl.entries, (e) => e.character);
    const lesson = await prisma.kanjiLesson.upsert({
      where: { lessonNumber: kl.lessonNumber },
      update: { title: kl.title, jlptLevel: kl.jlptLevel, sortOrder: kl.sortOrder },
      create: {
        lessonNumber: kl.lessonNumber,
        title: kl.title,
        jlptLevel: kl.jlptLevel,
        sortOrder: kl.sortOrder,
      },
    });

    const existing = await prisma.kanjiEntry.findMany({
      where: { lessonId: lesson.id },
      select: { character: true, sortOrder: true },
    });
    const existingChars = new Set(existing.map((e) => e.character));
    let sortOrder = existing.reduce((max, e) => Math.max(max, e.sortOrder), -1) + 1;

    for (const e of entries) {
      if (existingChars.has(e.character)) continue;
      if (globalKanjiChars.has(e.character)) continue;
      await prisma.kanjiEntry.create({
        data: {
          character: e.character,
          hanViet: e.hanViet ?? null,
          onyomi: e.onyomi ?? null,
          kunyomi: e.kunyomi ?? null,
          meaningVi: e.meaningVi,
          jlptLevel: kl.jlptLevel,
          strokeCount: e.strokeCount ?? null,
          sortOrder: sortOrder++,
          lessonId: lesson.id,
        },
      });
      globalKanjiChars.add(e.character);
      kanjiAdded++;
    }
  }

  // ─── Grammar expand ────────────────────────────────────────────────
  for (const unit of [...JLPT_GRAMMAR_EXPAND, ...JLPT_GRAMMAR_GAP_FILL]) {
    grammarAdded += await seedGrammarForLesson(prisma, unit, globalGrammarPatterns);
  }

  // ─── Vocab expand units ────────────────────────────────────────────
  const globalVocabKana = new Set(
    (await prisma.vocabulary.findMany({ select: { kana: true } })).map((v) => v.kana),
  );

  for (const unit of [...JLPT_VOCAB_EXPAND, ...JLPT_VOCAB_GAP_FILL, ...JLPT_VOCAB_GAP_TOPUP]) {
    const words = dedupeBy(unit.words, (w) => w.kana);
    const grammarUnit = findGrammarUnit(unit.lessonNumber);
    const title =
      grammarUnit?.title ?? `${unit.jlptLevel} · Từ vựng bổ sung (bài ${unit.lessonNumber})`;
    const sortOrder = grammarUnit?.sortOrder ?? unit.lessonNumber * 10;

    const lesson = await prisma.lesson.upsert({
      where: { lessonNumber: unit.lessonNumber },
      update: { title, jlptLevel: unit.jlptLevel, sortOrder },
      create: { lessonNumber: unit.lessonNumber, title, jlptLevel: unit.jlptLevel, sortOrder },
    });
    if (lesson.createdAt.getTime() === lesson.updatedAt.getTime()) lessonCreated++;

    const existing = await prisma.vocabulary.findMany({
      where: { lessonId: lesson.id },
      select: { kana: true, sortOrder: true },
    });
    const existingKana = new Set(existing.map((v) => v.kana));
    let wordOrder = existing.reduce((max, v) => Math.max(max, v.sortOrder), -1) + 1;

    for (const w of words) {
      if (existingKana.has(w.kana)) continue;
      if (globalVocabKana.has(w.kana)) continue;
      await prisma.vocabulary.create({
        data: {
          kanji: w.kanji ?? null,
          kana: w.kana,
          romaji: w.romaji,
          meaning: w.meaning,
          partOfSpeech: w.partOfSpeech ?? null,
          jlptLevel: unit.jlptLevel,
          exampleJa: w.exampleJa ?? null,
          exampleKana: w.exampleKana ?? null,
          exampleVi: w.exampleVi ?? null,
          sortOrder: wordOrder++,
          lessonId: lesson.id,
        },
      });
      vocabAdded++;
      globalVocabKana.add(w.kana);
    }
  }

  // ─── Bài 405 (vocab + grammar có thể chưa đủ trong DB) ───────────
  const lesson405Grammar = JLPT_GRAMMAR_UNITS.find((g) => g.lessonNumber === 405);
  if (lesson405Grammar) {
    grammarAdded += await seedGrammarForLesson(prisma, lesson405Grammar, globalGrammarPatterns);
  }

  const lesson405Vocab = JLPT_VOCAB_UNITS.find((u) => u.lessonNumber === 405);
  if (lesson405Vocab) {
    const title = lesson405Grammar?.title ?? `${lesson405Vocab.jlptLevel} · Từ vựng (bài 405)`;
    const lesson = await prisma.lesson.upsert({
      where: { lessonNumber: 405 },
      update: { title, jlptLevel: 'N2', sortOrder: 4050 },
      create: { lessonNumber: 405, title, jlptLevel: 'N2', sortOrder: 4050 },
    });
    const existing = await prisma.vocabulary.findMany({
      where: { lessonId: lesson.id },
      select: { kana: true, sortOrder: true },
    });
    const existingKana = new Set(existing.map((v) => v.kana));
    let wordOrder = existing.reduce((max, v) => Math.max(max, v.sortOrder), -1) + 1;
    for (const w of dedupeBy(lesson405Vocab.words, (x) => x.kana)) {
      if (existingKana.has(w.kana)) continue;
      if (globalVocabKana.has(w.kana)) continue;
      await prisma.vocabulary.create({
        data: {
          kanji: w.kanji ?? null,
          kana: w.kana,
          romaji: w.romaji,
          meaning: w.meaning,
          partOfSpeech: w.partOfSpeech ?? null,
          jlptLevel: 'N2',
          exampleJa: w.exampleJa ?? null,
          exampleKana: w.exampleKana ?? null,
          exampleVi: w.exampleVi ?? null,
          sortOrder: wordOrder++,
          lessonId: lesson.id,
        },
      });
      vocabAdded++;
      globalVocabKana.add(w.kana);
    }
  }

  console.log(
    `JLPT expand: +${kanjiAdded} kanji, +${vocabAdded} từ vựng, +${grammarAdded} ngữ pháp (${lessonCreated} lesson mới).`,
  );
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedJlptExpand(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
