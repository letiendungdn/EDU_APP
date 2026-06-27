import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { SrsService } from './srs.service';

describe('SrsService', () => {
  let service: SrsService;
  let prisma: {
    srsCard: {
      findFirstOrThrow: jest.Mock;
      update: jest.Mock;
    };
  };

  const userId = 1;
  const cardId = 100;

  const baseCard = {
    id: cardId,
    userId,
    easeFactor: 2.5,
    interval: 6,
    repetitions: 2,
  };

  beforeEach(async () => {
    prisma = {
      srsCard: {
        findFirstOrThrow: jest.fn(),
        update: jest.fn().mockImplementation(({ data }) => ({ id: cardId, ...data })),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SrsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(SrsService);
    jest.clearAllMocks();
  });

  describe('reviewCard', () => {
    it('resets interval and repetitions when quality is 0-2 (lapse)', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({ ...baseCard });

      await service.reviewCard(userId, cardId, 1);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interval: 0,
            repetitions: 0,
            reviewStreak: 0,
          }),
        }),
      );
    });

    it('increases interval using SM-2 formula when quality is 3-5', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      });

      await service.reviewCard(userId, cardId, 4);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            repetitions: 3,
            interval: 15,
          }),
        }),
      );
    });

    it('never sets easeFactor below 1.3', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        easeFactor: 1.3,
        repetitions: 1,
        interval: 1,
      });

      await service.reviewCard(userId, cardId, 3);

      const updateCall = prisma.srsCard.update.mock.calls[0][0];
      expect(updateCall.data.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('sets interval to 1 after first successful repetition', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
      });

      await service.reviewCard(userId, cardId, 4);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interval: 1,
            repetitions: 1,
          }),
        }),
      );
    });

    it('sets interval to 6 after second successful repetition', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
      });

      await service.reviewCard(userId, cardId, 4);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interval: 6,
            repetitions: 2,
          }),
        }),
      );
    });

    it('sets nextReviewAt to now plus interval days', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-27T12:00:00.000Z'));

      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        repetitions: 1,
        interval: 1,
        easeFactor: 2.5,
      });

      await service.reviewCard(userId, cardId, 4);

      const expectedDate = new Date('2026-06-27T12:00:00.000Z');
      expectedDate.setDate(expectedDate.getDate() + 6);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nextReviewAt: expectedDate,
          }),
        }),
      );

      jest.useRealTimers();
    });

    it('sets mastered to true when interval is at least 21', async () => {
      prisma.srsCard.findFirstOrThrow.mockResolvedValue({
        ...baseCard,
        repetitions: 3,
        interval: 15,
        easeFactor: 2.5,
      });

      await service.reviewCard(userId, cardId, 5);

      expect(prisma.srsCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            interval: 38,
            mastered: true,
          }),
        }),
      );
    });
  });
});
