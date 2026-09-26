import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JlptLevel, MindMapKind, Prisma } from "@prisma/client";
import { PrismaService } from "@app/prisma";

const KINDS = new Set(Object.values(MindMapKind));
const LEVELS = new Set(Object.values(JlptLevel));

export type MindMapBranchInput = {
  id: string;
  label: string;
  labelJa?: string;
  hint?: string;
  posX?: number;
  posY?: number;
  patterns: Array<{
    pattern: string;
    meaning: string;
    href?: string;
    lessonNumber?: number;
    linkLabel?: string;
  }>;
};

export type MindMapLevelInput = {
  kind: MindMapKind | string;
  level: JlptLevel | string;
  title: string;
  summary: string;
  accent?: string;
  sortOrder?: number;
  branches: MindMapBranchInput[];
};

function parseKind(value: string): MindMapKind {
  const upper = value.toUpperCase();
  if (!KINDS.has(upper as MindMapKind)) {
    throw new BadRequestException(`kind không hợp lệ: ${value}`);
  }
  return upper as MindMapKind;
}

function parseLevel(value: string): JlptLevel {
  const upper = value.toUpperCase();
  if (!LEVELS.has(upper as JlptLevel)) {
    throw new BadRequestException(`level không hợp lệ: ${value}`);
  }
  return upper as JlptLevel;
}

function sanitizeBranches(branches: MindMapBranchInput[]): Prisma.InputJsonValue {
  if (!Array.isArray(branches)) {
    throw new BadRequestException("branches phải là mảng");
  }
  return branches.map((b, i) => {
    if (!b?.id?.trim() || !b?.label?.trim()) {
      throw new BadRequestException(`Nhánh #${i + 1}: thiếu id hoặc label`);
    }
    if (!Array.isArray(b.patterns)) {
      throw new BadRequestException(`Nhánh ${b.id}: patterns phải là mảng`);
    }
    return {
      id: b.id.trim(),
      label: b.label.trim(),
      labelJa: b.labelJa?.trim() || undefined,
      hint: b.hint?.trim() || undefined,
      posX: typeof b.posX === "number" ? b.posX : undefined,
      posY: typeof b.posY === "number" ? b.posY : undefined,
      patterns: b.patterns.map((p) => ({
        pattern: String(p.pattern ?? "").trim(),
        meaning: String(p.meaning ?? "").trim(),
        href: p.href?.trim() || undefined,
        lessonNumber:
          typeof p.lessonNumber === "number" ? p.lessonNumber : undefined,
        linkLabel: p.linkLabel?.trim() || undefined,
      })),
    };
  }) as unknown as Prisma.InputJsonValue;
}

@Injectable()
export class MindMapsService {
  constructor(private readonly prisma: PrismaService) {}

  list(kind?: string) {
    return this.prisma.mindMapLevel.findMany({
      where: kind ? { kind: parseKind(kind) } : undefined,
      orderBy: [{ kind: "asc" }, { sortOrder: "asc" }, { level: "asc" }],
    });
  }

  async findOne(id: number) {
    const row = await this.prisma.mindMapLevel.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Không tìm thấy sơ đồ");
    return row;
  }

  async findByKindLevel(kind: string, level: string) {
    const row = await this.prisma.mindMapLevel.findUnique({
      where: {
        kind_level: { kind: parseKind(kind), level: parseLevel(level) },
      },
    });
    if (!row) throw new NotFoundException("Không tìm thấy sơ đồ");
    return row;
  }

  create(dto: MindMapLevelInput) {
    const kind = parseKind(String(dto.kind));
    const level = parseLevel(String(dto.level));
    return this.prisma.mindMapLevel.create({
      data: {
        kind,
        level,
        title: dto.title.trim(),
        summary: dto.summary.trim(),
        accent: dto.accent?.trim() || "#3b82f6",
        sortOrder: dto.sortOrder ?? LEVELS_ORDER[level],
        branches: sanitizeBranches(dto.branches ?? []),
      },
    });
  }

  async update(id: number, dto: Partial<MindMapLevelInput>) {
    await this.findOne(id);
    return this.prisma.mindMapLevel.update({
      where: { id },
      data: {
        ...(dto.kind !== undefined ? { kind: parseKind(String(dto.kind)) } : {}),
        ...(dto.level !== undefined
          ? { level: parseLevel(String(dto.level)) }
          : {}),
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.summary !== undefined ? { summary: dto.summary.trim() } : {}),
        ...(dto.accent !== undefined
          ? { accent: dto.accent.trim() || "#3b82f6" }
          : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.branches !== undefined
          ? { branches: sanitizeBranches(dto.branches) }
          : {}),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.mindMapLevel.delete({ where: { id } });
    return { ok: true };
  }

  /** Upsert hàng loạt (seed / import defaults từ admin). */
  async upsertMany(levels: MindMapLevelInput[], replaceKind?: string) {
    if (!Array.isArray(levels) || levels.length === 0) {
      throw new BadRequestException("Thiếu danh sách sơ đồ");
    }
    if (replaceKind) {
      await this.prisma.mindMapLevel.deleteMany({
        where: { kind: parseKind(replaceKind) },
      });
    }
    const results = [];
    for (const dto of levels) {
      const kind = parseKind(String(dto.kind));
      const level = parseLevel(String(dto.level));
      const row = await this.prisma.mindMapLevel.upsert({
        where: { kind_level: { kind, level } },
        create: {
          kind,
          level,
          title: dto.title.trim(),
          summary: dto.summary.trim(),
          accent: dto.accent?.trim() || "#3b82f6",
          sortOrder: dto.sortOrder ?? LEVELS_ORDER[level],
          branches: sanitizeBranches(dto.branches ?? []),
        },
        update: {
          title: dto.title.trim(),
          summary: dto.summary.trim(),
          accent: dto.accent?.trim() || "#3b82f6",
          sortOrder: dto.sortOrder ?? LEVELS_ORDER[level],
          branches: sanitizeBranches(dto.branches ?? []),
        },
      });
      results.push(row);
    }
    return results;
  }
}

const LEVELS_ORDER: Record<JlptLevel, number> = {
  N5: 0,
  N4: 1,
  N3: 2,
  N2: 3,
  N1: 4,
};
