import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { resolveVocabImage } from '@edu/vocab-images';

const bundlePath = path.join(__dirname, 'data', 'minna-bundle.json');

type VocabItem = {
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning: string;
};

type GrammarItem = {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: { jp: string; romaji: string; vi: string }[];
};

type ExerciseItem = {
  type: string;
  question: string;
  options: string[] | null;
  answer: string;
};

type Bundle = {
  vocab: Record<string, VocabItem[]>;
  grammar: Record<string, GrammarItem[]>;
  exercises: Record<string, ExerciseItem[]>;
};

type PrismaExerciseType = 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'LISTENING';

const PRISMA_EXERCISE_TYPE: Record<string, PrismaExerciseType> = {
  multiple_choice: 'MULTIPLE_CHOICE',
  fill_in_blank: 'FILL_IN_BLANK',
  listening: 'LISTENING',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
  LISTENING: 'LISTENING',
};

function toPrismaExerciseType(type: string): PrismaExerciseType {
  const mapped = PRISMA_EXERCISE_TYPE[type];
  if (!mapped) {
    throw new Error(`Unknown exercise type: ${type}`);
  }
  return mapped;
}

export async function seedMinna(prisma: PrismaClient) {
  if (!fs.existsSync(bundlePath)) {
    throw new Error('Missing minna-bundle.json. Run: npm run build:data');
  }

  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as Bundle;

  console.log('Clearing existing Minna data...');
  await prisma.example.deleteMany();
  await prisma.grammar.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.exercise.deleteMany();

  let totalVocab = 0;
  let totalGrammar = 0;
  let totalExercises = 0;

  for (let i = 1; i <= 50; i++) {
    const lesson = await prisma.lesson.upsert({
      where: { lessonNumber: i },
      update: { title: `Bài ${i}` },
      create: { lessonNumber: i, title: `Bài ${i}` },
    });

    const vocabList = bundle.vocab[String(i)] || [];
    for (const vocab of vocabList) {
      const imageUrl = resolveVocabImage({
        word: vocab.romaji,
        meaning: vocab.meaning,
        kana: vocab.kana,
        kanji: vocab.kanji,
      });
      await prisma.vocabulary.create({
        data: {
          lessonId: lesson.id,
          kanji: vocab.kanji,
          kana: vocab.kana,
          romaji: vocab.romaji,
          meaning: vocab.meaning,
          imageUrl,
        },
      });
      totalVocab++;
    }

    const grammarList = bundle.grammar[String(i)] || [];
    for (const grammar of grammarList) {
      const g = await prisma.grammar.create({
        data: {
          lessonId: lesson.id,
          pattern: grammar.pattern,
          meaning: grammar.meaning,
          explanation: grammar.explanation || null,
        },
      });

      for (const ex of grammar.examples || []) {
        await prisma.example.create({
          data: {
            grammarId: g.id,
            jp: ex.jp,
            romaji: ex.romaji || '',
            vi: ex.vi || null,
          },
        });
      }
      totalGrammar++;
    }

    const exerciseList = bundle.exercises[String(i)] || [];
    for (const exercise of exerciseList) {
      await prisma.exercise.create({
        data: {
          lessonId: lesson.id,
          type: toPrismaExerciseType(exercise.type),
          question: exercise.question,
          answer: exercise.answer,
          optionsList: exercise.options?.length
            ? {
                create: exercise.options.map((text, sortOrder) => ({
                  text,
                  sortOrder,
                })),
              }
            : undefined,
        },
      });
      totalExercises++;
    }

    console.log(
      `Bài ${i}: ${vocabList.length} từ | ${grammarList.length} ngữ pháp | ${exerciseList.length} bài tập`,
    );
  }

  console.log(
    `\nMinna tổng: ${totalVocab} từ vựng, ${totalGrammar} mẫu ngữ pháp, ${totalExercises} bài tập`,
  );
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedMinna(prisma);
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
