import { Injectable } from '@nestjs/common';
import { JlptLevel } from '@prisma/client';
import { PrismaService } from '@app/prisma';

function parseJlptLevel(value?: string): JlptLevel | undefined {
  if (!value) return undefined;
  return (Object.values(JlptLevel) as string[]).includes(value)
    ? (value as JlptLevel)
    : undefined;
}

@Injectable()
export class ReadingService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(jlptLevel?: string) {
    const level = parseJlptLevel(jlptLevel);
    return this.prisma.readingPassage.findMany({
      where: level ? { jlptLevel: level } : undefined,
      select: {
        id: true,
        title: true,
        jlptLevel: true,
        estimatedMin: true,
        sortOrder: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ jlptLevel: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  findOne(id: number) {
    return this.prisma.readingPassage.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            options: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
  }

  async submit(
    passageId: number,
    answers: Record<string, string>,
    userId?: number,
  ) {
    const passage = await this.prisma.readingPassage.findUnique({
      where: { id: passageId },
      include: { questions: true },
    });
    if (!passage) throw new Error('Passage not found');

    let correct = 0;
    const results = passage.questions.map((q) => {
      const isCorrect = answers[q.id] === q.answer;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        correct: isCorrect,
        correctAnswer: q.answer,
        explanation: q.explanation,
      };
    });

    const total = passage.questions.length;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    await this.prisma.readingAttempt.create({
      data: { passageId, userId: userId ?? null, correct, total, percent },
    });

    return { correct, total, percent, results };
  }
}
