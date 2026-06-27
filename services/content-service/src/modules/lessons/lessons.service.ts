import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { CreateLessonDto, UpdateLessonDto } from '@app/contracts';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: dto });
  }

  findAll() {
    return this.prisma.lesson.findMany({
      orderBy: { lessonNumber: 'asc' },
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
  }

  findOne(lessonNumber: number) {
    return this.prisma.lesson.findUnique({
      where: { lessonNumber },
    });
  }

  update(id: number, dto: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}
