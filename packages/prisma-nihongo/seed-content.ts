import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SQL_PATH = path.join(
  __dirname,
  '../../infra/postgres/nihongo-content-seed.sql',
);

async function clearContentTables(prisma: PrismaClient) {
  await prisma.example.deleteMany();
  await prisma.exerciseOption.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.grammar.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.kanjiVocab.deleteMany();
  await prisma.kanjiEntry.deleteMany();
  await prisma.kanjiLesson.deleteMany();
  await prisma.readingQuestionOption.deleteMany();
  await prisma.readingQuestion.deleteMany();
  await prisma.readingPassage.deleteMany();
  await prisma.jlptRoadmapTask.deleteMany();
  await prisma.jlptRoadmapPhase.deleteMany();
  await prisma.jlptRoadmapMaterial.deleteMany();
  await prisma.jlptRoadmapExamSection.deleteMany();
  await prisma.jlptRoadmapLevel.deleteMany();
  await prisma.studyTip.deleteMany();
  await prisma.jlptRoadmapMeta.deleteMany();
  await prisma.jlptExamDaySlot.deleteMany();
  await prisma.jlptExamVenue.deleteMany();
  await prisma.jlptExamSession.deleteMany();
  await prisma.jlptExamBriefing.deleteMany();
  await prisma.jlptExamFeeInfo.deleteMany();
  await prisma.jlptOrganizer.deleteMany();
  await prisma.listeningPreset.deleteMany();
  await prisma.podcastResource.deleteMany();
  await prisma.listeningConfig.deleteMany();
  await prisma.counterItem.deleteMany();
  await prisma.counterCategory.deleteMany();
  await prisma.kanaCell.deleteMany();
  await prisma.kanaSection.deleteMany();
  await prisma.lesson.deleteMany();
}

function runSqlFile(filePath: string) {
  const container = process.env.POSTGRES_CONTAINER ?? 'edu-postgres';
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    execSync(`docker exec -i ${container} psql -U nihongo nihongo -v ON_ERROR_STOP=1`, {
      input: sql,
      stdio: ['pipe', 'inherit', 'inherit'],
      maxBuffer: 64 * 1024 * 1024,
    });
    return;
  } catch {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('Không chạy được docker psql và thiếu DATABASE_URL');
    execSync('psql -v ON_ERROR_STOP=1', {
      input: sql,
      env: { ...process.env, PGDATABASE: url },
      stdio: ['pipe', 'inherit', 'inherit'],
      maxBuffer: 64 * 1024 * 1024,
    });
  }
}

export async function seedContent(prisma: PrismaClient) {
  const lessonCount = await prisma.lesson.count();
  const force = process.env.FORCE_CONTENT_SEED === '1';

  if (lessonCount > 0 && !force) {
    console.log(
      `Nội dung học đã có trong DB (${lessonCount} bài). Bỏ qua import SQL.`,
    );
    console.log('  FORCE_CONTENT_SEED=1 để ghi đè từ infra/postgres/nihongo-content-seed.sql');
    return;
  }

  if (!fs.existsSync(SQL_PATH)) {
    throw new Error(
      `Thiếu ${SQL_PATH}. Chạy: npm run db:export-content (cần Docker postgres đang chạy)`,
    );
  }

  if (lessonCount > 0) {
    console.log('FORCE_CONTENT_SEED: xóa nội dung học cũ...');
    await clearContentTables(prisma);
  }

  console.log('Import nội dung học từ SQL...');
  runSqlFile(SQL_PATH);

  const [lessons, vocab, kanji] = await Promise.all([
    prisma.lesson.count(),
    prisma.vocabulary.count(),
    prisma.kanjiEntry.count(),
  ]);
  console.log(`Nội dung: ${lessons} bài, ${vocab} từ vựng, ${kanji} kanji.`);
}
