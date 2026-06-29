import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "@app/prisma";
import { CacheKeys, CacheTTL } from "@app/common";
import { CreateGrammarDto, UpdateGrammarDto } from "@app/contracts";

@Injectable()
export class GrammarsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateGrammarDto) {
    const grammar = await this.prisma.grammar.create({
      data: {
        pattern: dto.pattern,
        meaning: dto.meaning,
        explanation: dto.explanation ?? null,
        lessonId: dto.lessonId,
      },
    });
    await this.invalidateLessonCaches(dto.lessonId);
    return grammar;
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

      const cacheKey = CacheKeys.grammarByLesson(lessonId);
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
      this.prisma.grammar.findMany({
        where,
        include: { examples: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.grammar.count({ where }),
    ]);

    const result = { data, total, page, limit };
    if (lessonId) {
      await this.cacheManager.set(
        CacheKeys.grammarByLesson(lessonId),
        result,
        CacheTTL.medium * 1000,
      );
    }
    return result;
  }

  findOne(id: number) {
    return this.prisma.grammar.findUnique({
      where: { id },
      include: { examples: true },
    });
  }

  async update(id: number, dto: UpdateGrammarDto) {
    const { examples: _examples, ...data } = dto;
    const grammar = await this.prisma.grammar.update({ where: { id }, data });
    await this.invalidateLessonCaches(grammar.lessonId);
    return grammar;
  }

  async remove(id: number) {
    const grammar = await this.prisma.grammar.delete({ where: { id } });
    await this.invalidateLessonCaches(grammar.lessonId);
    return grammar;
  }

  private async invalidateLessonCaches(lessonId: number) {
    await this.cacheManager.del(CacheKeys.grammarByLesson(lessonId));
    await this.cacheManager.del(CacheKeys.lessonList());
  }
}
