import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CONTENT_PATTERNS } from '@app/contracts';
import { PrismaService } from '@app/prisma';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  async getDashboardStats() {
    const [
      lessons,
      vocabularies,
      grammars,
      exercises,
      kanjiLessons,
      kanjiEntries,
      users,
      examResults,
    ] = await Promise.all([
      this.prisma.lesson.count(),
      this.prisma.vocabulary.count(),
      this.prisma.grammar.count(),
      this.prisma.exercise.count(),
      this.prisma.kanjiLesson.count(),
      this.prisma.kanjiEntry.count(),
      this.prisma.user.count(),
      this.prisma.examResult.count(),
    ]);

    const recentLessons = await this.prisma.lesson.findMany({
      take: 5,
      orderBy: { lessonNumber: 'desc' },
      select: {
        id: true,
        lessonNumber: true,
        title: true,
        _count: {
          select: { vocabularies: true, grammars: true, exercises: true },
        },
      },
    });

    return {
      counts: {
        lessons,
        vocabularies,
        grammars,
        exercises,
        kanjiLessons,
        kanjiEntries,
        users,
        examResults,
      },
      recentLessons,
      generatedAt: new Date().toISOString(),
    };
  }

  listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        createdAt: true,
        _count: { select: { examResults: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  importVocab(lessonNumber: number, text: string) {
    return firstValueFrom(
      this.contentClient.send(CONTENT_PATTERNS.IMPORT_VOCAB, {
        lessonNumber,
        text,
      }),
    );
  }
}
