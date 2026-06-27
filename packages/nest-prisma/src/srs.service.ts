import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const MIN_EASE = 1.3;

@Injectable()
export class SrsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * SM-2 review: quality 0-5
   * 0-2: lapse; 3-5: success
   */
  async reviewCard(userId: number, cardId: number, quality: number) {
    const card = await this.prisma.srsCard.findFirstOrThrow({
      where: { id: cardId, userId },
    });

    let { easeFactor, interval, repetitions } = card;

    if (quality < 3) {
      repetitions = 0;
      interval = 0;
    } else {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      easeFactor = Math.max(
        MIN_EASE,
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      );
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    const mastered = interval >= 21;

    return this.prisma.srsCard.update({
      where: { id: cardId },
      data: {
        easeFactor,
        interval,
        repetitions,
        nextReviewAt,
        mastered,
        lastReviewedAt: new Date(),
        correctCount: quality >= 3 ? { increment: 1 } : undefined,
        wrongCount: quality < 3 ? { increment: 1 } : undefined,
        reviewStreak: quality >= 3 ? { increment: 1 } : 0,
      },
    });
  }
}
