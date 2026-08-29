import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { JLPT_GRAMMAR_UNITS } from './jlpt-grammar.data';
import { JLPT_VOCAB_UNITS } from './jlpt-vocab.data';
import { JLPT_KANJI_LESSONS } from './jlpt-kanji.data';
import { JLPT_READING_PASSAGES } from './jlpt-reading.data';

/**
 * Nội dung JLPT N3/N2/N1 (ngữ pháp, từ vựng, kanji, đọc hiểu).
 *
 * - Idempotent: bỏ qua nếu đã có Lesson lessonNumber >= 300.
 *   Đặt FORCE_JLPT_CONTENT_SEED=1 để xoá và nạp lại từ *.data.ts.
 * - Grammar + Vocab dùng chung Lesson (lessonNumber 3xx/4xx/5xx).
 * - Kanji dùng KanjiLesson riêng (lessonNumber 4xx/5xx, không đụng 1–32).
 * - Reading dùng ReadingPassage với sortOrder >= 100.
 */

const READING_SORT_ORDER_MIN = 100;

/** Chọn tối đa `n` phần tử khác `answer` từ `pool` (ngẫu nhiên, không lặp). */
function pickDistractors(pool: string[], answer: string, n: number): string[] {
  const uniq = [...new Set(pool)].filter((x) => x && x !== answer);
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return uniq.slice(0, n);
}

/** Xáo trộn mảng chuỗi (bản sao). */
function shuffleStrings(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function seedJlptContent(prisma: PrismaClientType) {
  const force = process.env.FORCE_JLPT_CONTENT_SEED === '1';
  const existing = await prisma.lesson.count({
    where: { lessonNumber: { gte: 300 } },
  });

  if (existing > 0 && !force) {
    console.log(
      `Nội dung JLPT N3/N2/N1 đã có (${existing} bài lessonNumber >= 300). Bỏ qua.`,
    );
    console.log('  FORCE_JLPT_CONTENT_SEED=1 để nạp lại từ *.data.ts.');
    return;
  }

  let grammarCount = 0;
  let exampleCount = 0;
  let vocabCount = 0;
  let exerciseCount = 0;

  // ─── Grammar + Vocab (chung Lesson) ───────────────────────────────
  const vocabByLesson = new Map(
    JLPT_VOCAB_UNITS.map((unit) => [unit.lessonNumber, unit]),
  );
  const lessonNumbers = new Set<number>([
    ...JLPT_GRAMMAR_UNITS.map((u) => u.lessonNumber),
    ...JLPT_VOCAB_UNITS.map((u) => u.lessonNumber),
  ]);

  for (const lessonNumber of [...lessonNumbers].sort((a, b) => a - b)) {
    const grammarUnit = JLPT_GRAMMAR_UNITS.find(
      (u) => u.lessonNumber === lessonNumber,
    );
    const vocabUnit = vocabByLesson.get(lessonNumber);
    const jlptLevel = (grammarUnit?.jlptLevel ??
      vocabUnit?.jlptLevel) as 'N3' | 'N2' | 'N1';
    const title =
      grammarUnit?.title ?? `${jlptLevel} · Từ vựng (bài ${lessonNumber})`;
    const sortOrder = grammarUnit?.sortOrder ?? lessonNumber * 10;

    const lesson = await prisma.lesson.upsert({
      where: { lessonNumber },
      update: { title, jlptLevel, sortOrder },
      create: { lessonNumber, title, jlptLevel, sortOrder },
    });

    // Dọn nội dung cũ của bài này
    await prisma.example.deleteMany({
      where: { grammar: { lessonId: lesson.id } },
    });
    await prisma.grammar.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.vocabulary.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.exerciseOption.deleteMany({
      where: { exercise: { lessonId: lesson.id } },
    });
    await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } });

    if (grammarUnit) {
      for (let i = 0; i < grammarUnit.items.length; i++) {
        const item = grammarUnit.items[i];
        await prisma.grammar.create({
          data: {
            pattern: item.pattern,
            meaning: item.meaning,
            explanation: item.explanation ?? null,
            formalityLevel: item.formalityLevel ?? null,
            jlptLevel,
            sortOrder: i,
            lessonId: lesson.id,
            examples: {
              create: item.examples.map((ex, sortOrder) => ({
                jp: ex.jp,
                romaji: ex.romaji,
                vi: ex.vi,
                sortOrder,
              })),
            },
          },
        });
        grammarCount += 1;
        exampleCount += item.examples.length;
      }
    }

    if (vocabUnit) {
      for (let i = 0; i < vocabUnit.words.length; i++) {
        const w = vocabUnit.words[i];
        await prisma.vocabulary.create({
          data: {
            kanji: w.kanji ?? null,
            kana: w.kana,
            romaji: w.romaji,
            meaning: w.meaning,
            partOfSpeech: w.partOfSpeech ?? null,
            jlptLevel,
            exampleJa: w.exampleJa ?? null,
            exampleKana: w.exampleKana ?? null,
            exampleVi: w.exampleVi ?? null,
            sortOrder: i,
            lessonId: lesson.id,
          },
        });
        vocabCount += 1;
      }
    }

    // ── Bài tập trắc nghiệm (cho đề thi thử JLPT) ──────────────────
    let exOrder = 0;
    const mkExercise = async (
      question: string,
      answer: string,
      optionTexts: string[],
    ) => {
      if (optionTexts.length < 2) return;
      await prisma.exercise.create({
        data: {
          type: 'MULTIPLE_CHOICE',
          question,
          answer,
          difficulty: jlptLevel === 'N3' ? 2 : jlptLevel === 'N2' ? 3 : 4,
          sortOrder: exOrder++,
          lessonId: lesson.id,
          options: {
            create: optionTexts.map((text, oi) => ({
              text,
              isCorrect: text === answer,
              sortOrder: oi,
            })),
          },
        },
      });
      exerciseCount += 1;
    };

    if (vocabUnit) {
      const meaningPool = vocabUnit.words.map((w) => w.meaning);
      for (const w of vocabUnit.words) {
        const head = w.kanji ? `${w.kanji}（${w.kana}）` : w.kana;
        const opts = [w.meaning, ...pickDistractors(meaningPool, w.meaning, 3)];
        await mkExercise(`「${head}」 nghĩa là gì?`, w.meaning, shuffleStrings(opts));
      }
    }

    if (grammarUnit) {
      const viPool = grammarUnit.items.flatMap((it) =>
        it.examples.map((ex) => ex.vi),
      );
      for (const item of grammarUnit.items) {
        const ex = item.examples[0];
        if (!ex) continue;
        const opts = [ex.vi, ...pickDistractors(viPool, ex.vi, 3)];
        await mkExercise(
          `Câu 「${ex.jp}」 có nghĩa là gì?`,
          ex.vi,
          shuffleStrings(opts),
        );
      }
    }
  }

  // ─── Kanji (KanjiLesson riêng) ────────────────────────────────────
  let kanjiEntryCount = 0;
  for (const kl of JLPT_KANJI_LESSONS) {
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

    await prisma.kanjiVocab.deleteMany({
      where: { kanjiEntry: { lessonId: lesson.id } },
    });
    await prisma.kanjiEntry.deleteMany({ where: { lessonId: lesson.id } });

    for (let i = 0; i < kl.entries.length; i++) {
      const e = kl.entries[i];
      await prisma.kanjiEntry.create({
        data: {
          character: e.character,
          hanViet: e.hanViet ?? null,
          onyomi: e.onyomi ?? null,
          kunyomi: e.kunyomi ?? null,
          meaningVi: e.meaningVi,
          jlptLevel: kl.jlptLevel,
          strokeCount: e.strokeCount ?? null,
          sortOrder: i,
          lessonId: lesson.id,
        },
      });
      kanjiEntryCount += 1;
    }
  }

  // ─── Reading (ReadingPassage sortOrder >= 100) ────────────────────
  await prisma.readingPassage.deleteMany({
    where: { sortOrder: { gte: READING_SORT_ORDER_MIN } },
  });
  let passageCount = 0;
  let questionCount = 0;
  for (const p of JLPT_READING_PASSAGES) {
    await prisma.readingPassage.create({
      data: {
        title: p.title,
        content: p.content,
        jlptLevel: p.jlptLevel,
        source: 'nihongo-app/jlpt',
        estimatedMin: p.estimatedMin,
        sortOrder: p.sortOrder,
        questions: {
          create: p.questions.map((q, qi) => ({
            question: q.question,
            answer: q.answer,
            explanation: q.explanation ?? null,
            sortOrder: qi + 1,
            options: {
              create: q.options.map((text, oi) => ({
                text,
                sortOrder: oi + 1,
              })),
            },
          })),
        },
      },
    });
    passageCount += 1;
    questionCount += p.questions.length;
  }

  console.log(
    `JLPT N3/N2/N1: ${grammarCount} ngữ pháp (+${exampleCount} ví dụ), ` +
      `${vocabCount} từ vựng, ${exerciseCount} bài tập, ${kanjiEntryCount} kanji, ` +
      `${passageCount} bài đọc (+${questionCount} câu hỏi).`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedJlptContent(prisma);
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
