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
        kana: item.kana,
        kanji: item.kanji ?? null,
        meaning: item.meaning,
        lessonNumber: item.lessonNumber,
        wrongCount: item.wrongCount,
        reviewStreak: item.reviewStreak,
        mastered: item.mastered,
        lastReviewedAt,
      },
      update: {
        kana: item.kana,
        kanji: item.kanji ?? null,
        meaning: item.meaning,
        lessonNumber: item.lessonNumber,
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

    return cards.map((card: (typeof cards)[number]) => ({
      kana: card.kana,
      kanji: card.kanji,
      meaning: card.meaning,
      lessonNumber: card.lessonNumber,
      wrongCount: card.wrongCount,
      reviewStreak: card.reviewStreak,
      mastered: card.mastered,
      lastReviewedAt: card.lastReviewedAt?.toISOString() ?? null,
    }));
  }
}
