import { Injectable } from '@nestjs/common';
import { shuffle, speechTextFromJapanese } from '@app/common';
import { PrismaService } from '@app/prisma';

export interface ListeningPlaylistItem {
  id: string;
  type: 'vocab' | 'sentence';
  speakText: string;
  display: string;
  meaning: string;
  lessonNumber: number;
}

@Injectable()
export class ListeningService {
  constructor(private prisma: PrismaService) {}

  async getPlaylist(lessonFrom: number, lessonTo: number, limit = 120) {
    const lessons = await this.prisma.lesson.findMany({
      where: { lessonNumber: { gte: lessonFrom, lte: lessonTo } },
      select: { id: true, lessonNumber: true },
      orderBy: { lessonNumber: 'asc' },
    });

    const lessonIds = lessons.map((l) => l.id);
    const lessonById = new Map(lessons.map((l) => [l.id, l.lessonNumber]));

    if (!lessonIds.length) {
      return { goalMinutes: 15, lessonFrom, lessonTo, items: [] };
    }

    const [vocabularies, grammars] = await Promise.all([
      this.prisma.vocabulary.findMany({
        where: { lessonId: { in: lessonIds } },
      }),
      this.prisma.grammar.findMany({
        where: { lessonId: { in: lessonIds } },
        include: { examples: true },
      }),
    ]);

    const items: ListeningPlaylistItem[] = [];

    for (const vocab of vocabularies) {
      if (!vocab.kana?.trim()) continue;
      const lessonNumber = lessonById.get(vocab.lessonId) ?? 0;
      items.push({
        id: `v-${vocab.id}`,
        type: 'vocab',
        speakText: vocab.kana,
        display: vocab.kanji || vocab.kana,
        meaning: vocab.meaning,
        lessonNumber,
      });
    }

    for (const grammar of grammars) {
      const lessonNumber = lessonById.get(grammar.lessonId) ?? 0;
      for (const example of grammar.examples) {
        if (!example.jp?.trim()) continue;
        const meaning =
          example.vi?.trim() || example.en?.trim() || grammar.meaning;
        items.push({
          id: `s-${example.id}`,
          type: 'sentence',
          speakText: speechTextFromJapanese(example.jp),
          display: example.jp.trim(),
          meaning,
          lessonNumber,
        });
      }
    }

    return {
      goalMinutes: 15,
      lessonFrom,
      lessonTo,
      totalAvailable: items.length,
      items: shuffle(items).slice(0, Math.min(limit, items.length)),
    };
  }
}
