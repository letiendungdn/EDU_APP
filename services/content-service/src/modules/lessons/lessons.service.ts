import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { PrismaService } from "@app/prisma";
import { CacheKeys, CacheTTL } from "@app/common";
import { CreateLessonDto, UpdateLessonDto } from "@app/contracts";

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateLessonDto) {
    const lesson = await this.prisma.lesson.create({ data: dto });
    await this.invalidateLessonLists();
    return lesson;
  }

  async findAll(options?: { has?: "grammar" | "vocab" }) {
    const cacheKey = CacheKeys.lessonList(options?.has);
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const where =
      options?.has === "grammar"
        ? { grammars: { some: {} } }
        : options?.has === "vocab"
          ? { vocabularies: { some: {} } }
          : undefined;

    const lessons = await this.prisma.lesson.findMany({
      where,
      orderBy: { lessonNumber: "asc" },
      include: {
        _count: {
          select: {
            vocabularies: true,
            grammars: true,
            exercises: true,
          },
        },
      },
    });

    await this.cacheManager.set(cacheKey, lessons, CacheTTL.medium * 1000);
    return lessons;
  }

  findOne(lessonNumber: number) {
    return this.prisma.lesson.findUnique({
      where: { lessonNumber },
    });
  }

  async update(id: number, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: dto,
    });
    await this.invalidateLessonLists();
    return lesson;
  }

  async remove(id: number) {
    const lesson = await this.prisma.lesson.delete({
      where: { id },
    });
    await this.invalidateLessonLists();
    return lesson;
  }

  private async invalidateLessonLists() {
    await Promise.all(
      CacheKeys.lessonListAll().map((key) => this.cacheManager.del(key)),
    );
  }
}
