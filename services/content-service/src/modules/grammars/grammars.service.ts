import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateGrammarDto, UpdateGrammarDto } from '@app/contracts';

@Injectable()
export class GrammarsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGrammarDto) {
    return this.prisma.grammar.create({
      data: {
        pattern: dto.pattern,
        meaning: dto.meaning,
        explanation: dto.explanation ?? null,
        lessonId: dto.lessonId,
      },
    });
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
    }

    const where = lessonId ? { lessonId } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.grammar.findMany({
        where,
        include: { examples: true },
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.grammar.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findOne(id: number) {
    return this.prisma.grammar.findUnique({
      where: { id },
      include: { examples: true },
    });
  }

  update(id: number, dto: UpdateGrammarDto) {
    const { examples: _examples, ...data } = dto;
    return this.prisma.grammar.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.grammar.delete({ where: { id } });
  }
}
