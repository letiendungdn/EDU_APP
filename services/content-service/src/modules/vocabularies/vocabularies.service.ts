import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "@app/prisma";
import { CacheKeys, CacheTTL } from "@app/common";
import { CreateVocabularyDto, UpdateVocabularyDto } from "@app/contracts";

@Injectable()
export class VocabulariesService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateVocabularyDto) {
    const vocab = await this.prisma.vocabulary.create({
      data: {
        kanji: dto.kanji ?? null,
        kana: dto.kana,
        romaji: dto.romaji,
        meaning: dto.meaning,
        lessonId: dto.lessonId,
      },
    });
    await this.invalidateLessonCaches(dto.lessonId);
    return vocab;
  }

  async findAll(lessonNumber?: number, page = 1, limit = 50) {
    let lessonId: number | undefined;
    if (lessonNumber) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { lessonNumber },
        select: { id: true },
      });
      if (!lesson) return { data: [], total: 0, page, limit };
      lessonId = lesson.id;

      const cacheKey = CacheKeys.vocabByLesson(lessonId);
      const cached = await this.cacheManager.get<{
        data: unknown[];
        total: number;
        page: number;
        limit: number;
      }>(cacheKey);
      if (cached && cached.page === page && cached.limit === limit) {
        return cached;
      }
    }

    const where = lessonId ? { lessonId } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.vocabulary.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vocabulary.count({ where }),
    ]);

    const result = { data, total, page, limit };
    if (lessonId) {
      await this.cacheManager.set(
        CacheKeys.vocabByLesson(lessonId),
        result,
        CacheTTL.medium * 1000,
      );
    }
    return result;
  }

  findOne(id: number) {
    return this.prisma.vocabulary.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateVocabularyDto) {
    const vocab = await this.prisma.vocabulary.update({
      where: { id },
      data: dto,
    });
    await this.invalidateLessonCaches(vocab.lessonId);
    return vocab;
  }

  async remove(id: number) {
    const vocab = await this.prisma.vocabulary.delete({ where: { id } });
    await this.invalidateLessonCaches(vocab.lessonId);
    return vocab;
  }

  private async invalidateLessonCaches(lessonId: number) {
    await this.cacheManager.del(CacheKeys.vocabByLesson(lessonId));
    await this.cacheManager.del(CacheKeys.lessonList());
  }
}
