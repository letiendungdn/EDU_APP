import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class KanjiService {
  constructor(private prisma: PrismaService) {}

  findAllLessons() {
    return this.prisma.kanjiLesson.findMany({
      orderBy: { lessonNumber: 'asc' },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  }

  findEntries(lessonNumber?: number) {
    return this.prisma.kanjiEntry.findMany({
      where: lessonNumber ? { lesson: { lessonNumber } } : undefined,
      orderBy: [{ lesson: { lessonNumber: 'asc' } }, { sortOrder: 'asc' }],
      include: {
        lesson: {
          select: {
            lessonNumber: true,
            title: true,
            jlptLevel: true,
          },
        },
        vocabularies: {
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.kanjiEntry.findUnique({
      where: { id },
      include: {
        lesson: true,
        vocabularies: true,
      },
    });
  }
}
