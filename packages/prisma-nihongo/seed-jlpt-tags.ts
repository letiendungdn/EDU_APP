/**
 * Gắn jlptLevel cho nội dung Minna (bài 1–50) và đồng bộ Vocabulary / KanjiEntry.
 * Idempotent — chạy lại an toàn.
 *
 *   npm run seed:jlpt-tags -w @edu/prisma-nihongo
 */
import { PrismaClient } from './generated/client';
import { minnaJlptForLesson } from './jlpt-targets';

export async function seedJlptTags(prisma: PrismaClient) {
  let lessonUpdates = 0;
  let vocabUpdates = 0;
  let grammarUpdates = 0;
  let kanjiLessonUpdates = 0;
  let kanjiEntryUpdates = 0;

  const minnaLessons = await prisma.lesson.findMany({
    where: { lessonNumber: { lte: 50 } },
    select: { id: true, lessonNumber: true, jlptLevel: true },
  });

  for (const lesson of minnaLessons) {
    const level = minnaJlptForLesson(lesson.lessonNumber);
    if (!level) continue;

    if (lesson.jlptLevel !== level) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { jlptLevel: level },
      });
      lessonUpdates++;
    }

    const vocabResult = await prisma.vocabulary.updateMany({
      where: { lessonId: lesson.id, OR: [{ jlptLevel: null }, { jlptLevel: { not: level } }] },
      data: { jlptLevel: level },
    });
    vocabUpdates += vocabResult.count;

    const grammarResult = await prisma.grammar.updateMany({
      where: { lessonId: lesson.id, OR: [{ jlptLevel: null }, { jlptLevel: { not: level } }] },
      data: { jlptLevel: level },
    });
    grammarUpdates += grammarResult.count;
  }

  const kanjiLessons = await prisma.kanjiLesson.findMany({
    where: { lessonNumber: { lte: 32 } },
    select: { id: true, lessonNumber: true, jlptLevel: true },
  });

  for (const kl of kanjiLessons) {
    const level = minnaJlptForLesson(kl.lessonNumber);
    if (!level) continue;

    if (kl.jlptLevel !== level) {
      await prisma.kanjiLesson.update({
        where: { id: kl.id },
        data: { jlptLevel: level },
      });
      kanjiLessonUpdates++;
    }

    const entryResult = await prisma.kanjiEntry.updateMany({
      where: { lessonId: kl.id, OR: [{ jlptLevel: null }, { jlptLevel: { not: level } }] },
      data: { jlptLevel: level },
    });
    kanjiEntryUpdates += entryResult.count;
  }

  console.log(
    `JLPT tags: ${lessonUpdates} lessons, ${vocabUpdates} vocab, ${grammarUpdates} grammar, ${kanjiLessonUpdates} kanji lessons, ${kanjiEntryUpdates} kanji entries.`,
  );
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedJlptTags(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
