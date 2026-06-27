import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "@app/prisma";
import { SrsCardRepository } from "@app/prisma/srs-card.repository";
import { ProgressService } from "./progress.service";

describe("ProgressService", () => {
  let service: ProgressService;
  let prisma: {
    vocabulary: { findFirst: jest.Mock };
    listeningLog: { upsert: jest.Mock; findMany: jest.Mock };
    studySession: { findMany: jest.Mock };
    examResult: { findMany: jest.Mock };
    srsCard: { aggregate: jest.Mock; count: jest.Mock };
    dailyNote: { upsert: jest.Mock; findMany: jest.Mock };
    dailyGoal: { upsert: jest.Mock; findMany: jest.Mock };
  };
  let srsCards: {
    upsertVocabularyReviewCard: jest.Mock;
    findVocabularyReviewBank: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      vocabulary: { findFirst: jest.fn() },
      listeningLog: {
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      studySession: { findMany: jest.fn().mockResolvedValue([]) },
      examResult: { findMany: jest.fn().mockResolvedValue([]) },
      srsCard: {
        aggregate: jest.fn().mockResolvedValue({
          _count: { id: 0 },
          _sum: { correctCount: 0, wrongCount: 0 },
        }),
        count: jest.fn().mockResolvedValue(0),
      },
      dailyNote: {
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      dailyGoal: {
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    srsCards = {
      upsertVocabularyReviewCard: jest.fn().mockResolvedValue(undefined),
      findVocabularyReviewBank: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
        { provide: SrsCardRepository, useValue: srsCards },
      ],
    }).compile();

    service = module.get(ProgressService);
  });

  describe("syncReviewBank", () => {
    it("upserts cards for each item", async () => {
      prisma.vocabulary.findFirst.mockResolvedValue({ id: 42 });
      const dto = {
        items: [
          {
            kana: "あ",
            lessonNumber: 1,
            kanji: null,
            meaning: "a",
            lastReviewedAt: null,
          },
        ],
      };

      const result = await service.syncReviewBank(1, dto);

      expect(result.synced).toBe(1);
      expect(srsCards.upsertVocabularyReviewCard).toHaveBeenCalled();
    });
  });

  describe("getReviewBank", () => {
    it("delegates to srs repository", async () => {
      srsCards.findVocabularyReviewBank.mockResolvedValue([{ kana: "い" }]);
      const result = await service.getReviewBank(1);
      expect(result).toHaveLength(1);
    });
  });

  describe("logListening", () => {
    it("upserts listening log", async () => {
      prisma.listeningLog.upsert.mockResolvedValue({
        userId: 1,
        date: "2026-06-27",
        seconds: 120,
      });
      const result = await service.logListening(1, {
        date: "2026-06-27",
        seconds: 120,
      });
      expect(result.seconds).toBe(120);
    });
  });
});
