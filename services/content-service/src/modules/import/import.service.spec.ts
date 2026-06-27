import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ImportService } from './import.service';
import { PrismaService } from '@app/prisma';

describe('ImportService', () => {
  let service: ImportService;

  const mockPrisma = {
    lesson: {
      upsert: jest.fn().mockResolvedValue({ id: 1, lessonNumber: 1 }),
    },
    vocabulary: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(),
  };

  mockPrisma.$transaction.mockImplementation(
    (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
  );

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ImportService);
    jest.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(
      (fn: (tx: typeof mockPrisma) => Promise<unknown>) => fn(mockPrisma),
    );
  });

  describe('importVocabFromText()', () => {
    it('parses 4-column tab-separated lines correctly', async () => {
      const text = '食べる\tたべる\ttaberu\tăn';
      const result = await service.importVocabFromText(1, text);

      expect(result.count).toBe(1);
      expect(mockPrisma.vocabulary.create).toHaveBeenCalledWith({
        data: {
          kanji: '食べる',
          kana: 'たべる',
          romaji: 'taberu',
          meaning: 'ăn',
          lessonId: 1,
        },
      });
    });

    it('parses 3-column lines (no kanji) correctly', async () => {
      const text = 'たべる\ttaberu\tăn';
      const result = await service.importVocabFromText(2, text);

      expect(result.count).toBe(1);
      expect(mockPrisma.vocabulary.create).toHaveBeenCalledWith({
        data: {
          kanji: null,
          kana: 'たべる',
          romaji: 'taberu',
          meaning: 'ăn',
          lessonId: 1,
        },
      });
    });

    it('skips malformed lines without throwing', async () => {
      const text = 'only-one-column\nたべる\ttaberu\tăn';
      const result = await service.importVocabFromText(1, text);

      expect(result.count).toBe(1);
      expect(result.skipped).toBe(1);
    });

    it('returns correct count of imported words', async () => {
      const text = 'a\tb\tc\td\ne\tf\tg';
      const result = await service.importVocabFromText(1, text);
      expect(result.count).toBe(2);
    });
  });
});
