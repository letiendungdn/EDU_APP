import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export const VOCABULARY_CONTENT_TYPE = 'VOCABULARY' as const;

export type ReviewBankItem = {
  kana: string;
  kanji: string | null;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  reviewStreak: number;
  mastered: boolean;
  lastReviewedAt: string | null;
};

export type ReviewBankSyncItem = {
  kana: string;
  kanji?: string | null;
  meaning: string;
  lessonNumber: number;
  wrongCount: number;
  reviewStreak: number;
  mastered: boolean;
};

@Injectable()
export class SrsCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertVocabularyReviewCard(
    userId: number,
    contentId: number,
    item: ReviewBankSyncItem,
    lastReviewedAt: Date | null,
  ): Promise<void> {
    await this.prisma.srsCard.upsert({
      where: {
        userId_contentType_contentId: {
          userId,
          contentType: VOCABULARY_CONTENT_TYPE,
          contentId,
        },
      },
      create: {
        userId,
        contentType: VOCABULARY_CONTENT_TYPE,
        contentId,
        wrongCount: item.wrongCount,
        reviewStreak: item.reviewStreak,
        mastered: item.mastered,
        lastReviewedAt,
      },
      update: {
        wrongCount: item.wrongCount,
        reviewStreak: item.reviewStreak,
        mastered: item.mastered,
        lastReviewedAt,
      },
    });
  }

  async findVocabularyReviewBank(userId: number): Promise<ReviewBankItem[]> {
    const cards = await this.prisma.srsCard.findMany({
      where: { userId, contentType: VOCABULARY_CONTENT_TYPE },
      orderBy: [{ mastered: 'asc' }, { wrongCount: 'desc' }],
    });

    if (!cards.length) return [];

    const vocabIds = cards.map((c) => c.contentId);
    const vocabularies = await this.prisma.vocabulary.findMany({
      where: { id: { in: vocabIds } },
      include: { lesson: { select: { lessonNumber: true } } },
    });
    const vocabById = new Map(vocabularies.map((v) => [v.id, v]));

    return cards
      .map((card) => {
        const vocab = vocabById.get(card.contentId);
        if (!vocab) return null;
        return {
          kana: vocab.kana,
          kanji: vocab.kanji,
          meaning: vocab.meaning,
          lessonNumber: vocab.lesson.lessonNumber,
          wrongCount: card.wrongCount,
          reviewStreak: card.reviewStreak,
          mastered: card.mastered,
          lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
        };
      })
      .filter((item): item is ReviewBankItem => item !== null);
  }
}
