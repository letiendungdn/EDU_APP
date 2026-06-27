/**
 * Dọn grammar.meaning (bỏ prefix "Bài N: M.") — chỉ DB.
 * Usage: npx ts-node prisma/clean-grammar-meaning-db.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const HAS_JP = /[\u3040-\u9faf\u4e00-\u9fff]/;
const BAI_PREFIX = /^Bài\s+\d+:\s*(?:\d+\.\s*)?/i;

function extractViMeaning(meaning: string, pattern: string): string {
  let m = meaning.replace(BAI_PREFIX, '').trim();
  if (!m) return '';

  if (m === pattern.trim()) return '';

  // Bỏ phần trùng đầu pattern (JP + VI dính chung)
  if (pattern && m.startsWith(pattern.trim())) {
    m = m.slice(pattern.trim().length).trim();
  }

  // Nếu còn cả JP lẫn VI: lấy phần sau câu Nhật đầu tiên
  if (HAS_JP.test(m)) {
    const afterJp = m.replace(
      /^[\u3040-\u9faf\u4e00-\u9fff々〜（）()「」、？！。・ー0-9０-９\s]+[。．？！]\s*/,
      '',
    );
    if (afterJp && afterJp !== m) m = afterJp.trim();
  }

  return m;
}

async function main() {
  const grammars = await prisma.grammar.findMany({
    select: { id: true, pattern: true, meaning: true },
  });

  let updated = 0;
  for (const g of grammars) {
    let cleaned = extractViMeaning(g.meaning, g.pattern);

    if (!cleaned && /Bạn|Tôi|muốn|là\s|để\s/i.test(g.pattern)) {
      const idx = g.pattern.search(/Bạn|Tôi|muốn|là\s|để\s|\(Tôi\)/);
      if (idx >= 0) cleaned = g.pattern.slice(idx).trim();
    }

    if (cleaned === g.meaning) continue;
    await prisma.grammar.update({
      where: { id: g.id },
      data: { meaning: cleaned },
    });
    updated += 1;
  }

  console.log(`Đã dọn meaning: ${updated} grammar.`);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
