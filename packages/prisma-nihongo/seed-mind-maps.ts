import { PrismaClient, type PrismaClient as PrismaClientType, type MindMapKind } from './generated/client';
import { GRAMMAR_MIND_MAP } from './mind-maps/grammar.data';
import { VOCAB_MIND_MAP } from './mind-maps/vocab.data';
import { KANJI_MIND_MAP } from './mind-maps/kanji.data';
import type { MindMapLevelData } from './mind-maps/types';

/**
 * Sơ đồ tư duy "chủ đề" mặc định (bảng MindMapLevel) cho 3 loại × 5 cấp.
 * - Chỉ thêm (loại, cấp) còn thiếu → không đè chỉnh sửa của admin.
 * - FORCE_MIND_MAP_SEED=1 → ghi đè toàn bộ bằng dữ liệu mặc định.
 *
 *   npm run seed:mind-maps -w @edu/prisma-nihongo
 */

const SOURCES: Array<{ kind: MindMapKind; maps: MindMapLevelData[] }> = [
  { kind: 'GRAMMAR', maps: GRAMMAR_MIND_MAP },
  { kind: 'VOCAB', maps: VOCAB_MIND_MAP },
  { kind: 'KANJI', maps: KANJI_MIND_MAP },
];

export async function seedMindMaps(prisma: PrismaClientType) {
  const force = process.env.FORCE_MIND_MAP_SEED === '1';
  let created = 0;
  let updated = 0;
  for (const { kind, maps } of SOURCES) {
    for (const [i, m] of maps.entries()) {
      const data = {
        title: m.title,
        summary: m.summary,
        accent: m.accent,
        sortOrder: i,
        branches: m.branches as unknown as object,
      };
      const existing = await prisma.mindMapLevel.findUnique({
        where: { kind_level: { kind, level: m.level } },
        select: { id: true },
      });
      if (!existing) {
        await prisma.mindMapLevel.create({ data: { kind, level: m.level, ...data } });
        created += 1;
      } else if (force) {
        await prisma.mindMapLevel.update({ where: { id: existing.id }, data });
        updated += 1;
      }
    }
  }
  console.log(`Mind maps: thêm ${created}, ghi đè ${updated}${force ? '' : ' (FORCE_MIND_MAP_SEED=1 để ghi đè)'}.`);
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedMindMaps(prisma)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
