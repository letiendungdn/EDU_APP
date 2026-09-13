import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

/**
 * Sinh Exercise (trắc nghiệm) cho MỌI Lesson N3/N2/N1 đã tồn tại trong DB —
 * kể cả các lesson đến từ những file "boost/expand" (seed-jlpt-expand.ts),
 * vốn không bao giờ tạo Exercise. Đây là nguồn câu hỏi chính cho mock exam
 * ở sourceMode=GENERATED (xem mock-exams.service.ts).
 *
 * Idempotent: bỏ qua lesson đã có Exercise, trừ khi FORCE_JLPT_EXERCISES_SEED=1
 * (khi đó xoá Exercise cũ của đúng những lesson đang xử lý rồi tạo lại).
 */

const DIFFICULTY: Record<'N3' | 'N2' | 'N1', number> = { N3: 2, N2: 3, N1: 4 };

function pickDistractors(pool: string[], answer: string, n: number): string[] {
  const uniq = [...new Set(pool)].filter((x) => x && x !== answer);
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return uniq.slice(0, n);
}

function shuffleStrings(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function seedJlptExercises(prisma: PrismaClientType) {
  const force = process.env.FORCE_JLPT_EXERCISES_SEED === '1';
  const levels = ['N3', 'N2', 'N1'] as const;
  let totalCreated = 0;
  let lessonsTouched = 0;
  let lessonsSkipped = 0;

  for (const level of levels) {
    const lessons = await prisma.lesson.findMany({
      where: { jlptLevel: level },
      select: { id: true, lessonNumber: true },
    });
    if (lessons.length === 0) continue;
    const lessonIds = lessons.map((l) => l.id);

    // Pool nhiễu (distractor) dùng chung cho cả cấp độ, để lesson nhỏ vẫn đủ 4 lựa chọn.
    const allVocab = await prisma.vocabulary.findMany({
      where: { lessonId: { in: lessonIds } },
      select: { id: true, lessonId: true, kanji: true, kana: true, meaning: true },
    });
    const meaningPool = allVocab.map((w) => w.meaning).filter((m): m is string => !!m?.trim());

    const allGrammar = await prisma.grammar.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { examples: true },
    });
    const viPool = allGrammar.flatMap((g) =>
      g.examples.map((e) => e.vi).filter((v): v is string => !!v?.trim()),
    );

    for (const lesson of lessons) {
      const existingCount = await prisma.exercise.count({ where: { lessonId: lesson.id } });
      if (existingCount > 0 && !force) {
        lessonsSkipped += 1;
        continue;
      }
      if (force && existingCount > 0) {
        await prisma.exerciseOption.deleteMany({ where: { exercise: { lessonId: lesson.id } } });
        await prisma.exercise.deleteMany({ where: { lessonId: lesson.id } });
      }

      let exOrder = 0;
      const mkExercise = async (question: string, answer: string, optionTexts: string[]) => {
        if (optionTexts.length < 2) return;
        await prisma.exercise.create({
          data: {
            type: 'MULTIPLE_CHOICE',
            question,
            answer,
            difficulty: DIFFICULTY[level],
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
        totalCreated += 1;
      };

      const lessonVocab = allVocab.filter((w) => w.lessonId === lesson.id);
      for (const w of lessonVocab) {
        if (!w.meaning?.trim()) continue;
        const head = w.kanji ? `${w.kanji}（${w.kana}）` : w.kana;
        const opts = [w.meaning, ...pickDistractors(meaningPool, w.meaning, 3)];
        await mkExercise(`「${head}」 nghĩa là gì?`, w.meaning, shuffleStrings(opts));
      }

      const lessonGrammar = allGrammar.filter((g) => g.lessonId === lesson.id);
      for (const g of lessonGrammar) {
        const ex = g.examples[0];
        if (!ex?.vi?.trim() || !ex.jp?.trim()) continue;
        const opts = [ex.vi, ...pickDistractors(viPool, ex.vi, 3)];
        await mkExercise(`Câu 「${ex.jp}」 có nghĩa là gì?`, ex.vi, shuffleStrings(opts));
      }

      lessonsTouched += 1;
    }
  }

  console.log(
    `JLPT exercises: +${totalCreated} câu hỏi trắc nghiệm trên ${lessonsTouched} lesson ` +
      `(${lessonsSkipped} lesson đã có Exercise, bỏ qua).`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedJlptExercises(prisma);
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
