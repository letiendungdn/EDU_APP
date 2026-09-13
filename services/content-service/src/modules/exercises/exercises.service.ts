import { Injectable } from "@nestjs/common";
import { PrismaService } from "@app/prisma";
import { CreateExerciseDto, UpdateExerciseDto } from "@app/contracts";

type PrismaExerciseType = "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "LISTENING";

const PRISMA_EXERCISE_TYPE: Record<string, PrismaExerciseType> = {
  multiple_choice: "MULTIPLE_CHOICE",
  fill_in_blank: "FILL_IN_BLANK",
  listening: "LISTENING",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  FILL_IN_BLANK: "FILL_IN_BLANK",
  LISTENING: "LISTENING",
};

function toPrismaExerciseType(type: string): PrismaExerciseType {
  const mapped = PRISMA_EXERCISE_TYPE[type];
  if (!mapped) {
    throw new Error(`Unknown exercise type: ${type}`);
  }
  return mapped;
}

function parseOptionsInput(options?: string | string[]): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  try {
    const parsed = JSON.parse(options) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function mapExercise<T extends { options: { text: string }[] }>(row: T) {
  const { options: optionRows, ...rest } = row;
  return {
    ...rest,
    options: optionRows.map((o) => o.text),
  };
}

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateExerciseDto) {
    const optionTexts = parseOptionsInput(dto.options);
    const created = await this.prisma.exercise.create({
      data: {
        type: toPrismaExerciseType(dto.type),
        question: dto.question,
        answer: dto.answer,
        lessonId: dto.lessonId,
        options: optionTexts.length
          ? {
              create: optionTexts.map((text, sortOrder) => ({
                text,
                sortOrder,
              })),
            }
          : undefined,
      },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    return mapExercise(created);
  }

  async findAll(params?: {
    lessonNumber?: number;
    jlptLevel?: string;
    query?: string;
    page?: number;
    limit?: number;
  }) {
    const { lessonNumber, jlptLevel, query, page, limit } = params ?? {};

    let lessonId: number | undefined;
    if (lessonNumber) {
      const lesson = await this.prisma.lesson.findUnique({
        where: { lessonNumber },
        select: { id: true },
      });
      if (!lesson) return [];
      lessonId = lesson.id;
    }

    // Không truyền jlptLevel/query/page → giữ nguyên hành vi cũ (mảng phẳng),
    // dùng bởi AdminLessonPicker (xem theo từng lesson, số lượng nhỏ).
    if (!jlptLevel && !query && page === undefined) {
      const rows = await this.prisma.exercise.findMany({
        where: lessonId ? { lessonId } : undefined,
        include: { options: { orderBy: { sortOrder: "asc" } } },
        orderBy: { id: "asc" },
      });
      return rows.map(mapExercise);
    }

    const where: Record<string, unknown> = {};
    if (lessonId) where.lessonId = lessonId;
    if (jlptLevel) where.lesson = { jlptLevel };
    if (query) where.question = { contains: query, mode: "insensitive" };

    const p = page ?? 1;
    const l = limit ?? 50;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.exercise.findMany({
        where,
        include: { options: { orderBy: { sortOrder: "asc" } } },
        orderBy: { id: "asc" },
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.exercise.count({ where }),
    ]);
    return { data: rows.map(mapExercise), total, page: p, limit: l };
  }

  async findOne(id: number) {
    const row = await this.prisma.exercise.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    });
    return row ? mapExercise(row) : null;
  }

  async update(id: number, dto: UpdateExerciseDto) {
    const { type, options, ...rest } = dto;
    const optionTexts =
      options !== undefined ? parseOptionsInput(options) : undefined;

    await this.prisma.$transaction(async (tx) => {
      if (optionTexts !== undefined) {
        await tx.exerciseOption.deleteMany({ where: { exerciseId: id } });
        if (optionTexts.length) {
          await tx.exerciseOption.createMany({
            data: optionTexts.map((text, sortOrder) => ({
              exerciseId: id,
              text,
              sortOrder,
            })),
          });
        }
      }

      await tx.exercise.update({
        where: { id },
        data: {
          ...rest,
          ...(type !== undefined && { type: toPrismaExerciseType(type) }),
        },
      });
    });

    return this.findOne(id);
  }

  remove(id: number) {
    return this.prisma.exercise.delete({ where: { id } });
  }
}
