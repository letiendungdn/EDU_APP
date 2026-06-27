import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateVocabularyDto, UpdateVocabularyDto } from '@app/contracts';

@Injectable()
export class VocabulariesService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateVocabularyDto) {
    return this.prisma.vocabulary.create({
      data: {
        kanji: dto.kanji ?? null,
        kana: dto.kana,
        romaji: dto.romaji,
        meaning: dto.meaning,
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
      this.prisma.vocabulary.findMany({
        where,
        orderBy: { id: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vocabulary.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findOne(id: number) {
    return this.prisma.vocabulary.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateVocabularyDto) {
    return this.prisma.vocabulary.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.vocabulary.delete({ where: { id } });
  }
}
