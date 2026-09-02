import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

const DEFAULT_TEMPLATES = [
  {
    slug: 'n5',
    level: 'n5',
    title: 'Đề thi thử JLPT N5',
    durationMinutes: 50,
    lessonFrom: 1,
    lessonTo: 25,
    kanjiLessonFrom: 1,
    kanjiLessonTo: 10,
    vocabCount: 12,
    grammarCount: 8,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 60,
    scope: 'Minna Bài 1–25',
    description: 'Từ vựng, ngữ pháp, kanji & nghe (Minna I + KLL N5)',
    sortOrder: 0,
  },
  {
    slug: 'n4',
    level: 'n4',
    title: 'Đề thi thử JLPT N4',
    durationMinutes: 65,
    lessonFrom: 26,
    lessonTo: 50,
    kanjiLessonFrom: 11,
    kanjiLessonTo: 20,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 65,
    scope: 'Minna Bài 26–50',
    description: 'Từ vựng, ngữ pháp, kanji & nghe (Minna II + KLL N4)',
    sortOrder: 1,
  },
  {
    slug: 'n3',
    level: 'n3',
    title: 'Đề thi thử JLPT N3',
    durationMinutes: 70,
    lessonFrom: 301,
    lessonTo: 399,
    kanjiLessonFrom: 21,
    kanjiLessonTo: 32,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 65,
    scope: 'Bộ N3 trong app',
    description: 'Từ vựng, ngữ pháp, kanji & nghe (bộ N3 trong app)',
    sortOrder: 2,
  },
  {
    slug: 'n2',
    level: 'n2',
    title: 'Đề thi thử JLPT N2',
    durationMinutes: 75,
    lessonFrom: 401,
    lessonTo: 499,
    kanjiLessonFrom: 401,
    kanjiLessonTo: 499,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 65,
    scope: 'Bộ N2 trong app',
    description: 'Từ vựng, ngữ pháp, kanji & nghe (bộ N2 trong app)',
    sortOrder: 3,
  },
  {
    slug: 'n1',
    level: 'n1',
    title: 'Đề thi thử JLPT N1',
    durationMinutes: 80,
    lessonFrom: 501,
    lessonTo: 599,
    kanjiLessonFrom: 501,
    kanjiLessonTo: 599,
    vocabCount: 12,
    grammarCount: 10,
    kanjiCount: 5,
    listeningWordCount: 4,
    listeningSentenceCount: 4,
    passThreshold: 65,
    scope: 'Bộ N1 trong app',
    description: 'Từ vựng, ngữ pháp, kanji & nghe (bộ N1 trong app)',
    sortOrder: 4,
  },
] as const;

export async function seedMockExamTemplates(prisma: PrismaClientType) {
  const count = await prisma.mockExamTemplate.count();
  if (count > 0) {
    console.log(`Mock exam templates đã có (${count}). Bỏ qua seed.`);
    return;
  }

  for (const tpl of DEFAULT_TEMPLATES) {
    await prisma.mockExamTemplate.create({ data: { ...tpl } });
  }

  console.log(`Mock exam: ${DEFAULT_TEMPLATES.length} đề mặc định (N5–N1).`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedMockExamTemplates(prisma);
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
