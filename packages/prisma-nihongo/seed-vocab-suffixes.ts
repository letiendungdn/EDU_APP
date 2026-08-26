import fs from 'fs';
import path from 'path';
import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';

const SEED_SQL = path.join(
  __dirname,
  'migrations',
  '20260815120000_vocab_suffixes',
  'seed.sql',
);

export async function seedVocabSuffixes(prisma: PrismaClientType) {
  const groupCount = await prisma.vocabSuffixGroup.count();
  const force = process.env.FORCE_VOCAB_SUFFIXES_SEED === '1';

  if (groupCount > 0 && !force) {
    console.log(`Hậu tố từ vựng đã có trong DB (${groupCount} nhóm). Bỏ qua seed.`);
    console.log('  FORCE_VOCAB_SUFFIXES_SEED=1 để ghi đè từ seed.sql.');
    return;
  }

  const sql = fs.readFileSync(SEED_SQL, 'utf8');
  const statements = sql
    .split(/;\s*\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  const [groups, items] = await Promise.all([
    prisma.vocabSuffixGroup.count(),
    prisma.vocabSuffixItem.count(),
  ]);
  console.log(`Hậu tố từ vựng: ${groups} nhóm, ${items} mục (từ seed.sql).`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedVocabSuffixes(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
