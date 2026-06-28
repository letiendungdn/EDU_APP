import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "@app/prisma";
import { KanjiService } from "./kanji.service";

describe("KanjiService", () => {
  let service: KanjiService;
  let prisma: {
    kanjiLesson: { findMany: jest.Mock };
    kanjiEntry: { findMany: jest.Mock; findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      kanjiLesson: { findMany: jest.fn() },
      kanjiEntry: { findMany: jest.fn(), findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [KanjiService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(KanjiService);
  });

  it("findAllLessons returns ordered lessons", async () => {
    prisma.kanjiLesson.findMany.mockResolvedValue([{ lessonNumber: 1 }]);
    const result = await service.findAllLessons();
    expect(result).toHaveLength(1);
    expect(prisma.kanjiLesson.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { lessonNumber: "asc" } }),
    );
  });

  it("findEntries filters by lessonNumber", async () => {
    prisma.kanjiEntry.findMany.mockResolvedValue([]);
    await service.findEntries(5);
    expect(prisma.kanjiEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { lesson: { lessonNumber: 5 } },
      }),
    );
  });

  it("findEntries filters by search query", async () => {
    prisma.kanjiEntry.findMany.mockResolvedValue([]);
    await service.findEntries(undefined, "日");
    expect(prisma.kanjiEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ character: { contains: "日" } }),
          ]),
        }),
      }),
    );
  });

  it("findOne returns entry with relations", async () => {
    prisma.kanjiEntry.findUnique.mockResolvedValue({
      id: 1,
      character: "日",
      lesson: {},
      vocabularies: [],
    });
    const result = await service.findOne(1);
    expect(result?.character).toBe("日");
  });
});
