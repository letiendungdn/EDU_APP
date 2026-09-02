/**
 * Xoá Lesson rỗng (0 từ, 0 ngữ pháp, 0 bài tập).
 * Run: npx tsx scripts/cleanup-empty-lessons.ts
 * Dry-run: npx tsx scripts/cleanup-empty-lessons.ts --dry-run
 */
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const empty = await prisma.lesson.findMany({
    where: {
      vocabularies: { none: {} },
      grammars: { none: {} },
      exercises: { none: {} },
    },
    orderBy: { lessonNumber: 'asc' },
    select: { id: true, lessonNumber: true, title: true },
  });

  console.log(`\n=== CLEANUP EMPTY LESSONS${dryRun ? ' (dry-run)' : ''} ===\n`);
  console.log(`Tìm thấy ${empty.length} bài rỗng:`);
  for (const l of empty.slice(0, 30)) {
    console.log(`  #${l.lessonNumber}  ${l.title ?? '(no title)'}  [id=${l.id}]`);
  }
  if (empty.length > 30) console.log(`  ... và ${empty.length - 30} bài khác`);

  if (!empty.length) {
    console.log('\nKhông có gì để xoá.\n');
    return;
  }

  if (!dryRun) {
    const ids = empty.map((l) => l.id);
    const result = await prisma.lesson.deleteMany({ where: { id: { in: ids } } });
    console.log(`\nĐã xoá ${result.count} bài.\n`);
  } else {
    console.log(`\nDry-run: sẽ xoá ${empty.length} bài.\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
