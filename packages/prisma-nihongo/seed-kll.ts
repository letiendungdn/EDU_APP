import { PrismaClient, JlptLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const kllBundlePath = path.join(__dirname, 'data', 'kll-bundle.json');

type KanjiVocabItem = {
  word: string;
  reading: string;
  meaningVi: string;
};

type KanjiEntryItem = {
  character: string;
  hanViet: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  meaningVi: string;
  mnemonicJp: string | null;
  mnemonicVi: string | null;
  imageUrl: string | null;
  sortOrder: number;
  vocabularies: KanjiVocabItem[];
};

type KanjiLessonItem = {
  lessonNumber: number;
  title: string;
  jlptLevel: string;
  entries: KanjiEntryItem[];
};

type KllBundle = {
  lessons: KanjiLessonItem[];
};

export async function seedKll(prisma: PrismaClient) {
  if (!fs.existsSync(kllBundlePath)) {
    console.log(
      'Skipping KLL (missing kll-bundle.json). Run: npm run build:kll',
    );
    return;
  }

  const kllBundle = JSON.parse(
    fs.readFileSync(kllBundlePath, 'utf8'),
  ) as KllBundle;

  console.log('Clearing existing KLL data...');
  await prisma.kanjiVocab.deleteMany();
  await prisma.kanjiEntry.deleteMany();
  await prisma.kanjiLesson.deleteMany();

  let totalKanji = 0;
  let totalKanjiVocab = 0;

  for (const lessonData of kllBundle.lessons) {
    const lesson = await prisma.kanjiLesson.create({
      data: {
        lessonNumber: lessonData.lessonNumber,
        title: lessonData.title,
        jlptLevel: lessonData.jlptLevel as JlptLevel,
      },
    });

    for (const entry of lessonData.entries) {
      const kanjiEntry = await prisma.kanjiEntry.create({
        data: {
          lessonId: lesson.id,
          character: entry.character,
          hanViet: entry.hanViet,
          onyomi: entry.onyomi,
          kunyomi: entry.kunyomi,
          meaningVi: entry.meaningVi,
          mnemonicJp: entry.mnemonicJp,
          mnemonicVi: entry.mnemonicVi,
          imageUrl: entry.imageUrl,
          sortOrder: entry.sortOrder,
        },
      });
      totalKanji++;

      for (const vocab of entry.vocabularies) {
        await prisma.kanjiVocab.create({
          data: {
            kanjiEntryId: kanjiEntry.id,
            word: vocab.word,
            reading: vocab.reading,
            meaningVi: vocab.meaningVi,
          },
        });
        totalKanjiVocab++;
      }
    }

    console.log(
      `KLL Bài ${lessonData.lessonNumber}: ${lessonData.entries.length} kanji`,
    );
  }

  console.log(
    `\nKLL tổng: ${totalKanji} kanji, ${totalKanjiVocab} từ vựng liên quan.`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedKll(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
