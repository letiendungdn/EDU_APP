import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private prisma: PrismaService) {}

  async importVocabFromText(lessonNumber: number, text: string) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);

    let count = 0;
    let skipped = 0;

    await this.prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.upsert({
        where: { lessonNumber },
        update: {},
        create: { lessonNumber, title: `Bài ${lessonNumber}` },
      });

      for (const line of lines) {
        const parts = line.split('\t').map((p) => p.trim());
        if (parts.length < 3) {
          this.logger.warn(`Skipping malformed line: ${line}`);
          skipped += 1;
          continue;
        }

        let kanji: string | null = null;
        let kana: string;
        let romaji: string;
        let meaning: string;

        if (parts.length >= 4) {
          kanji = parts[0] || null;
          kana = parts[1];
          romaji = parts[2];
          meaning = parts[3];
        } else {
          kana = parts[0];
          romaji = parts[1];
          meaning = parts[2];
        }

        if (!kana || !romaji || !meaning) {
          this.logger.warn(`Skipping incomplete line: ${line}`);
          skipped += 1;
          continue;
        }

        await tx.vocabulary.create({
          data: {
            kanji,
            kana,
            romaji,
            meaning,
            lessonId: lesson.id,
          },
        });
        count += 1;
      }
    });

    return { success: true, count, skipped, lessonNumber };
  }
}
