import { PrismaClient, type PrismaClient as PrismaClientType } from './generated/client';
import { TEXTBOOK_BOOKS, TEXTBOOK_SERIES } from './textbooks/series.data';

/**
 * Danh mục giáo trình tham khảo (TextbookSeries + TextbookBook).
 * - Chỉ thêm bộ sách còn thiếu → không đè chỉnh sửa trực tiếp trong DB.
 * - FORCE_TEXTBOOK_CATALOG_SEED=1 → cập nhật thông tin bộ sách và nạp lại danh sách sách.
 *
 *   npm run seed:textbook-catalog -w @edu/prisma-nihongo
 */
export async function seedTextbookCatalog(prisma: PrismaClientType) {
  const force = process.env.FORCE_TEXTBOOK_CATALOG_SEED === '1';
  let created = 0;
  let updated = 0;
  for (const [i, s] of TEXTBOOK_SERIES.entries()) {
    const data = {
      name: s.name,
      nameJa: s.nameJa,
      publisher: s.publisher,
      url: s.url,
      blurb: s.blurb,
      icon: s.icon,
      planLevels: s.planLevels,
      audioMatch: s.audioMatch,
      sortOrder: i,
    };
    const books = TEXTBOOK_BOOKS.filter((b) => b.series === s.code).map((b, bi) => ({
      level: b.level,
      title: b.title,
      note: b.note ?? null,
      url: b.url ?? null,
      kinds: b.kinds,
      sortOrder: bi,
    }));
    const existing = await prisma.textbookSeries.findUnique({ where: { code: s.code }, select: { id: true } });
    if (!existing) {
      await prisma.textbookSeries.create({ data: { code: s.code, ...data, books: { create: books } } });
      created += 1;
    } else if (force) {
      await prisma.$transaction([
        prisma.textbookBook.deleteMany({ where: { seriesId: existing.id } }),
        prisma.textbookSeries.update({ where: { id: existing.id }, data: { ...data, books: { create: books } } }),
      ]);
      updated += 1;
    }
  }
  console.log(
    `Danh mục giáo trình: thêm ${created}, nạp lại ${updated} bộ${force ? '' : ' (FORCE_TEXTBOOK_CATALOG_SEED=1 để nạp lại)'}.`,
  );
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTextbookCatalog(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
