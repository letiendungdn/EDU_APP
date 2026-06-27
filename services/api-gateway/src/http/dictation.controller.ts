import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '@app/prisma';
import { Public, type AuthUserPayload } from '@app/common';

@ApiTags('dictation')
@Controller('api/dictation')
export class DictationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('vocab')
  @Public()
  @ApiOperation({ summary: 'Get vocabulary list for dictation practice' })
  async getVocab(
    @Query('lessonNumber') lessonNumber?: string,
    @Query('limit') limit?: string,
  ) {
    const lessonId = lessonNumber
      ? (
          await this.prisma.lesson.findUnique({
            where: { lessonNumber: +lessonNumber },
            select: { id: true },
          })
        )?.id
      : undefined;

    return this.prisma.vocabulary.findMany({
      where: lessonId ? { lessonId } : undefined,
      select: {
        id: true,
        kanji: true,
        kana: true,
        romaji: true,
        meaning: true,
        lessonId: true,
      },
      orderBy: { id: 'asc' },
      take: limit ? +limit : 30,
    });
  }

  @Post('attempt')
  @Public()
  @ApiOperation({ summary: 'Record a dictation attempt' })
  recordAttempt(
    @Body() body: { vocabId: number; userInput: string; correct: boolean },
    @Req() req: { user?: AuthUserPayload | null },
  ) {
    return this.prisma.dictationAttempt.create({
      data: {
        vocabId: body.vocabId,
        userInput: body.userInput,
        correct: body.correct,
        userId: req.user?.id ?? null,
      },
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dictation stats for current user' })
  async getStats(@Req() req: { user: AuthUserPayload }) {
    const userId = req.user.id;
    const [total, correct] = await Promise.all([
      this.prisma.dictationAttempt.count({ where: { userId } }),
      this.prisma.dictationAttempt.count({ where: { userId, correct: true } }),
    ]);
    return {
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }
}
