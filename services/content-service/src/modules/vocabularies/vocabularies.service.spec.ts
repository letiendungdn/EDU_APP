import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { PrismaService } from "@app/prisma";
import { VocabulariesService } from "./vocabularies.service";

describe("VocabulariesService", () => {
  let service: VocabulariesService;
  let prisma: {
    lesson: { findUnique: jest.Mock };
    vocabulary: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      lesson: { findUnique: jest.fn() },
      vocabulary: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    mockCache.get.mockResolvedValue(null);
    mockCache.set.mockResolvedValue(undefined);
    mockCache.del.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VocabulariesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get(VocabulariesService);
  });

  it("findAll returns empty when lesson not found", async () => {
    prisma.lesson.findUnique.mockResolvedValue(null);
    const result = await service.findAll(99);
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 50 });
  });

  it("findAll paginates by lesson", async () => {
    prisma.lesson.findUnique.mockResolvedValue({ id: 10 });
    prisma.$transaction.mockResolvedValue([[{ id: 1, kana: "あ" }], 1]);

    const result = await service.findAll(1, 1, 50);

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("findOne returns vocabulary by id", async () => {
    prisma.vocabulary.findUnique.mockResolvedValue({ id: 5, kana: "い" });
    const result = await service.findOne(5);
    expect(result?.kana).toBe("い");
  });

  it("create maps dto to prisma data", async () => {
    const dto = {
      kana: "う",
      romaji: "u",
      meaning: "test",
      lessonId: 1,
    };
    prisma.vocabulary.create.mockResolvedValue({ id: 1, ...dto });
    await service.create(dto);
    expect(prisma.vocabulary.create).toHaveBeenCalled();
  });
});
