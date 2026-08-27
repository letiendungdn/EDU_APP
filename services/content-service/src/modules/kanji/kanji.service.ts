import { Injectable, NotFoundException } from "@nestjs/common";
import { JlptLevel, type Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma";
import type { CreateKanjiVocabDto, UpdateKanjiVocabDto } from "@app/contracts";

function parseJlptLevel(value?: string): JlptLevel | undefined {
  if (!value) return undefined;
  return (Object.values(JlptLevel) as string[]).includes(value)
    ? (value as JlptLevel)
    : undefined;
}

const entryInclude = {
  lesson: {
    select: {
      lessonNumber: true,
      title: true,
      jlptLevel: true,
    },
  },
  vocabularies: {
    orderBy: { sortOrder: "asc" as const },
  },
} satisfies Prisma.KanjiEntryInclude;

@Injectable()
export class KanjiService {
  constructor(private prisma: PrismaService) {}

  findAllLessons() {
    return this.prisma.kanjiLesson.findMany({
      orderBy: { lessonNumber: "asc" },
      include: {
        _count: {
          select: { entries: true },
        },
      },
    });
  }

  findEntries(lessonNumber?: number, query?: string, jlptLevel?: string) {
    const q = query?.trim();
    const level = parseJlptLevel(jlptLevel);
    const where: Prisma.KanjiEntryWhereInput = {};

    if (lessonNumber || level) {
      where.lesson = {
        ...(lessonNumber ? { lessonNumber } : {}),
        ...(level ? { jlptLevel: level } : {}),
      };
    }

    if (q) {
      where.OR = [
        { character: { contains: q } },
        { hanViet: { contains: q, mode: "insensitive" } },
        { onyomi: { contains: q, mode: "insensitive" } },
        { kunyomi: { contains: q, mode: "insensitive" } },
        { meaningVi: { contains: q, mode: "insensitive" } },
        { meaningEn: { contains: q, mode: "insensitive" } },
        { mnemonicVi: { contains: q, mode: "insensitive" } },
        {
          vocabularies: {
            some: {
              OR: [
                { word: { contains: q } },
                { reading: { contains: q } },
                { meaningVi: { contains: q, mode: "insensitive" } },
                { exampleJa: { contains: q } },
                { exampleVi: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    return this.prisma.kanjiEntry.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ lesson: { lessonNumber: "asc" } }, { sortOrder: "asc" }],
      include: entryInclude,
    });
  }

  findOne(id: number) {
    return this.prisma.kanjiEntry.findUnique({
      where: { id },
      include: {
        lesson: true,
        vocabularies: { orderBy: { sortOrder: "asc" } },
      },
    });
  }

  async createVocab(kanjiEntryId: number, dto: CreateKanjiVocabDto) {
    const entry = await this.prisma.kanjiEntry.findUnique({
      where: { id: kanjiEntryId },
      select: { id: true },
    });
    if (!entry)
      throw new NotFoundException(`Kanji entry ${kanjiEntryId} not found`);

    let sortOrder = dto.sortOrder;
    if (sortOrder == null) {
      const agg = await this.prisma.kanjiVocab.aggregate({
        where: { kanjiEntryId },
        _max: { sortOrder: true },
      });
      sortOrder = (agg._max.sortOrder ?? -1) + 1;
    }

    return this.prisma.kanjiVocab.create({
      data: {
        word: dto.word.trim(),
        reading: dto.reading.trim(),
        meaningVi: dto.meaningVi.trim(),
        exampleJa: dto.exampleJa?.trim() || null,
        exampleKana: dto.exampleKana?.trim() || null,
        exampleVi: dto.exampleVi?.trim() || null,
        sortOrder,
        kanjiEntryId,
      },
    });
  }

  async updateVocab(id: number, dto: UpdateKanjiVocabDto) {
    const existing = await this.prisma.kanjiVocab.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Kanji vocab ${id} not found`);

    return this.prisma.kanjiVocab.update({
      where: { id },
      data: {
        ...(dto.word != null ? { word: dto.word.trim() } : {}),
        ...(dto.reading != null ? { reading: dto.reading.trim() } : {}),
        ...(dto.meaningVi != null ? { meaningVi: dto.meaningVi.trim() } : {}),
        ...(dto.exampleJa !== undefined
          ? { exampleJa: dto.exampleJa?.trim() || null }
          : {}),
        ...(dto.exampleKana !== undefined
          ? { exampleKana: dto.exampleKana?.trim() || null }
          : {}),
        ...(dto.exampleVi !== undefined
          ? { exampleVi: dto.exampleVi?.trim() || null }
          : {}),
        ...(dto.sortOrder != null ? { sortOrder: dto.sortOrder } : {}),
      },
    });
  }

  async removeVocab(id: number) {
    const existing = await this.prisma.kanjiVocab.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Kanji vocab ${id} not found`);
    await this.prisma.kanjiVocab.delete({ where: { id } });
    return { ok: true, id };
  }

  async reorderVocab(kanjiEntryId: number, orderedIds: number[]) {
    const entry = await this.prisma.kanjiEntry.findUnique({
      where: { id: kanjiEntryId },
      select: { id: true },
    });
    if (!entry)
      throw new NotFoundException(`Kanji entry ${kanjiEntryId} not found`);

    const existing = await this.prisma.kanjiVocab.findMany({
      where: { kanjiEntryId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((v) => v.id));
    if (
      orderedIds.length !== existingIds.size ||
      orderedIds.some((id) => !existingIds.has(id))
    ) {
      throw new NotFoundException(
        "orderedIds must include every vocabulary for this kanji entry",
      );
    }

    await this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.kanjiVocab.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    return this.prisma.kanjiVocab.findMany({
      where: { kanjiEntryId },
      orderBy: { sortOrder: "asc" },
    });
  }
}
