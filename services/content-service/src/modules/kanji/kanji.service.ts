import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma";

const entryInclude = {
  lesson: {
    select: {
      lessonNumber: true,
      title: true,
      jlptLevel: true,
    },
  },
  vocabularies: {
    orderBy: { id: "asc" as const },
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

  findEntries(lessonNumber?: number, query?: string) {
    const q = query?.trim();
    const where: Prisma.KanjiEntryWhereInput = {};

    if (lessonNumber) {
      where.lesson = { lessonNumber };
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
        vocabularies: true,
      },
    });
  }
}
