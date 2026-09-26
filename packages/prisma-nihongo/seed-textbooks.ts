import { PrismaClient, type PrismaClient as PrismaClientType, type Textbook } from './generated/client';
import { TEXTBOOK_CATALOGS } from './textbooks/catalog';
import { SERIES_LEVELS, SERIES_NAME, buildUnits, lessonNumberFor } from './textbooks/build-units';
import { kanaToRomaji } from './textbooks/kana-romaji';
import type { TbLevelCatalog, TbSeries, TbUnit } from './textbooks/types';

/**
 * Bài học soạn riêng theo khung Sou Matome / Shinkanzen / TRY! (Lesson.textbook).
 *
 * - Mỗi (sách, cấp) seed độc lập; đã có bài thì bỏ qua.
 * - FORCE_TEXTBOOK_SEED=1 → xóa bài của các (sách, cấp) có trong kho rồi nạp lại.
 *   Lưu ý: xóa từ vựng sẽ xóa theo lịch sử nghe chép (DictationAttempt) của các từ đó.
 * - Không tính vào kho theo cấp (xem packages/nest-prisma/src/level-pool.ts).
 *
 *   npm run seed:textbooks -w @edu/prisma-nihongo
 */

const SERIES: TbSeries[] = ['SOUMATOME', 'SHINKANZEN', 'TRY'];

function pickDistractors(pool: string[], answer: string, n: number): string[] {
  const uniq = [...new Set(pool)].filter((x) => x && x !== answer);
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return uniq.slice(0, n);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function clearSeriesLevel(prisma: PrismaClientType, series: TbSeries, level: TbLevelCatalog['level']) {
  const where = { textbook: series as Textbook, jlptLevel: level };
  const lessons = await prisma.lesson.findMany({ where, select: { id: true } });
  const ids = lessons.map((l) => l.id);
  if (ids.length) {
    await prisma.exercise.deleteMany({ where: { lessonId: { in: ids } } });
    await prisma.grammar.deleteMany({ where: { lessonId: { in: ids } } });
    await prisma.vocabulary.deleteMany({ where: { lessonId: { in: ids } } });
    await prisma.lesson.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.kanjiLesson.deleteMany({ where });
}

async function seedUnit(
  prisma: PrismaClientType,
  unit: TbUnit,
  pools: { meanings: string[]; sentences: string[]; kanjiMeanings: string[] },
  sortBase: number,
): Promise<{ vocab: number; grammar: number; kanji: number; exercises: number }> {
  const lessonNumber = lessonNumberFor(unit.series, unit.level, unit.section, unit.unit);
  const textbook = unit.series as Textbook;
  const title = `${SERIES_NAME[unit.series]} ${unit.level} · ${unit.sectionTitle.split(' · ')[0]} · ${
    unit.series === 'SOUMATOME' ? `Ngày ${unit.unit}` : `Phần ${unit.unit}`
  } — ${unit.title}`;
  let exercises = 0;

  if (unit.grammar.length || unit.vocab.length) {
    const lesson = await prisma.lesson.create({
      data: {
        lessonNumber,
        title,
        description: unit.sectionTitle,
        jlptLevel: unit.level,
        textbook,
        sortOrder: sortBase + unit.section * 100 + unit.unit,
      },
    });

    if (unit.vocab.length) {
      await prisma.vocabulary.createMany({
        data: unit.vocab.map(([word, kana, meaning, pos], i) => ({
          kanji: word !== kana ? word : null,
          kana,
          romaji: kanaToRomaji(kana),
          meaning,
          partOfSpeech: pos,
          jlptLevel: unit.level,
          sortOrder: i,
          lessonId: lesson.id,
        })),
      });
    }

    for (let i = 0; i < unit.grammar.length; i++) {
      const g = unit.grammar[i];
      await prisma.grammar.create({
        data: {
          pattern: g.p,
          meaning: g.m,
          explanation: g.e ?? null,
          jlptLevel: unit.level,
          sortOrder: i,
          lessonId: lesson.id,
          examples: {
            create: g.ex.map(([jp, romaji, vi], ei) => ({ jp, romaji, vi, sortOrder: ei })),
          },
        },
      });
    }

    // Bài tập trắc nghiệm cho phần ôn tập / thi thử theo sách
    let order = 0;
    const mk = async (question: string, answer: string, distractors: string[]) => {
      if (distractors.length < 2) return;
      const options = shuffle([answer, ...distractors]);
      await prisma.exercise.create({
        data: {
          type: 'MULTIPLE_CHOICE',
          question,
          answer,
          difficulty: 6 - Number(unit.level.slice(1)),
          sortOrder: order++,
          lessonId: lesson.id,
          options: { create: options.map((text, oi) => ({ text, isCorrect: text === answer, sortOrder: oi })) },
        },
      });
      exercises += 1;
    };
    for (const [word, kana, meaning] of unit.vocab) {
      const head = word !== kana ? `${word}（${kana}）` : kana;
      await mk(`「${head}」 nghĩa là gì?`, meaning, pickDistractors(pools.meanings, meaning, 3));
    }
    for (const g of unit.grammar) {
      const [jp, , vi] = g.ex[0];
      await mk(`Câu 「${jp}」 có nghĩa là gì?`, vi, pickDistractors(pools.sentences, vi, 3));
    }
  }

  if (unit.kanji.length) {
    await prisma.kanjiLesson.create({
      data: {
        lessonNumber,
        title,
        jlptLevel: unit.level,
        textbook,
        sortOrder: sortBase + unit.section * 100 + unit.unit,
        entries: {
          create: unit.kanji.map(([character, hanViet, on, kun, meaningVi], i) => ({
            character,
            hanViet: hanViet || null,
            onyomi: on || null,
            kunyomi: kun || null,
            meaningVi,
            jlptLevel: unit.level,
            sortOrder: i,
          })),
        },
      },
    });
  }

  return { vocab: unit.vocab.length, grammar: unit.grammar.length, kanji: unit.kanji.length, exercises };
}

export async function seedTextbooks(prisma: PrismaClientType) {
  const force = process.env.FORCE_TEXTBOOK_SEED === '1';
  const total = { units: 0, vocab: 0, grammar: 0, kanji: 0, exercises: 0 };

  for (const cat of TEXTBOOK_CATALOGS) {
    const pools = {
      meanings: cat.topics.flatMap((t) => t.words.map((w) => w[2])),
      sentences: cat.grammar.map((g) => g.ex[0][2]),
      kanjiMeanings: cat.kanji.map((k) => k[4]),
    };
    for (const series of SERIES) {
      if (!SERIES_LEVELS[series].includes(cat.level)) continue;
      const existing = await prisma.lesson.count({ where: { textbook: series as Textbook, jlptLevel: cat.level } });
      const existingKanji = await prisma.kanjiLesson.count({ where: { textbook: series as Textbook, jlptLevel: cat.level } });
      if ((existing || existingKanji) && !force) {
        console.log(`${SERIES_NAME[series]} ${cat.level}: đã có ${existing} bài — bỏ qua (FORCE_TEXTBOOK_SEED=1 để nạp lại).`);
        continue;
      }
      if (existing || existingKanji) await clearSeriesLevel(prisma, series, cat.level);

      const units = buildUnits(series, cat);
      const sums = { vocab: 0, grammar: 0, kanji: 0, exercises: 0 };
      for (const unit of units) {
        const r = await seedUnit(prisma, unit, pools, 0);
        sums.vocab += r.vocab;
        sums.grammar += r.grammar;
        sums.kanji += r.kanji;
        sums.exercises += r.exercises;
      }
      console.log(
        `${SERIES_NAME[series]} ${cat.level}: ${units.length} bài · ${sums.grammar} ngữ pháp · ${sums.vocab} từ · ${sums.kanji} kanji · ${sums.exercises} bài tập.`,
      );
      total.units += units.length;
      total.vocab += sums.vocab;
      total.grammar += sums.grammar;
      total.kanji += sums.kanji;
      total.exercises += sums.exercises;
    }
  }
  console.log(
    `Giáo trình: ${total.units} bài mới · ${total.grammar} ngữ pháp · ${total.vocab} từ · ${total.kanji} kanji · ${total.exercises} bài tập.`,
  );
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTextbooks(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
