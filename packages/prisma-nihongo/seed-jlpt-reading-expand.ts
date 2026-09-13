import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { JLPT_READING_PASSAGES_EXPAND } from './jlpt-reading-expand.data';

/**
 * Bổ sung bài đọc hiểu N3/N2/N1 (đợt 2) — độc lập với seed-jlpt-content.ts
 * (không dùng chung guard "Lesson.lessonNumber >= 300", vì guard đó sẽ bỏ qua
 * luôn phần reading mới mỗi khi nội dung N3+ đã tồn tại).
 *
 * Idempotent theo sortOrder: xoá đúng các passage có sortOrder nằm trong tập
 * đã định nghĩa ở jlpt-reading-expand.data.ts rồi tạo lại — an toàn khi chạy
 * lại nhiều lần, không đụng 9 bài gốc (sortOrder 110-330).
 */
export async function seedJlptReadingExpand(prisma: PrismaClientType) {
  const sortOrders = JLPT_READING_PASSAGES_EXPAND.map((p) => p.sortOrder);

  await prisma.readingPassage.deleteMany({
    where: { sortOrder: { in: sortOrders } },
  });

  let passageCount = 0;
  let questionCount = 0;
  for (const p of JLPT_READING_PASSAGES_EXPAND) {
    await prisma.readingPassage.create({
      data: {
        title: p.title,
        content: p.content,
        jlptLevel: p.jlptLevel,
        source: 'nihongo-app/jlpt-expand',
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
    `JLPT reading (đợt 2): +${passageCount} bài đọc (+${questionCount} câu hỏi).`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedJlptReadingExpand(prisma);
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
