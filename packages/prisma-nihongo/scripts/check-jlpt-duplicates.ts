/**
 * Kiểm tra trùng từ vựng / ngữ pháp / kanji trong DB.
 * Run: npx tsx scripts/check-jlpt-duplicates.ts
 */
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

type DupRow = { key: string; count: bigint; ids: string };

async function main() {
  console.log('\n=== KIỂM TRA TRÙNG LẶP JLPT ===\n');

  // ─── Từ vựng: trùng kana (toàn DB) ───
  const vocabByKana = await prisma.$queryRaw<DupRow[]>`
    SELECT kana AS key, COUNT(*)::bigint AS count,
           string_agg(id::text, ',' ORDER BY id) AS ids
    FROM "Vocabulary"
    GROUP BY kana
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, kana
    LIMIT 50
  `;
  const vocabKanaTotal = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM (
      SELECT kana FROM "Vocabulary" GROUP BY kana HAVING COUNT(*) > 1
    ) t
  `;
  const vocabDupRows = await prisma.$queryRaw<{ extra: bigint }[]>`
    SELECT (SUM(cnt) - COUNT(*))::bigint AS extra FROM (
      SELECT COUNT(*)::bigint AS cnt FROM "Vocabulary" GROUP BY kana HAVING COUNT(*) > 1
    ) t
  `;

  console.log('── Từ vựng (trùng kana toàn DB) ──');
  console.log(`  Nhóm kana trùng: ${vocabKanaTotal[0]?.n ?? 0}`);
  console.log(`  Bản ghi thừa (có thể gộp): ${vocabDupRows[0]?.extra ?? 0}`);
  if (vocabByKana.length) {
    console.log('  Top trùng:');
    for (const r of vocabByKana.slice(0, 15)) {
      console.log(`    ${r.key} × ${r.count}  [ids: ${r.ids}]`);
    }
    if (vocabByKana.length > 15) console.log(`    ... và ${Number(vocabKanaTotal[0]?.n ?? 0) - 15} nhóm khác`);
  } else {
    console.log('  ✅ Không trùng kana.');
  }

  // ─── Từ vựng: trùng kana trong cùng lesson ───
  const vocabSameLesson = await prisma.$queryRaw<DupRow[]>`
    SELECT "lessonId"::text || '|' || kana AS key, COUNT(*)::bigint AS count,
           string_agg(id::text, ',' ORDER BY id) AS ids
    FROM "Vocabulary"
    GROUP BY "lessonId", kana
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 20
  `;
  console.log('\n── Từ vựng (trùng kana trong cùng bài) ──');
  if (vocabSameLesson.length) {
    console.log(`  ⚠ ${vocabSameLesson.length}+ nhóm (hiển thị tối đa 20):`);
    for (const r of vocabSameLesson) {
      console.log(`    lesson|kana=${r.key} × ${r.count}`);
    }
  } else {
    console.log('  ✅ Không trùng trong cùng bài.');
  }

  // ─── Ngữ pháp: trùng pattern toàn DB ───
  const grammarByPattern = await prisma.$queryRaw<DupRow[]>`
    SELECT pattern AS key, COUNT(*)::bigint AS count,
           string_agg(id::text, ',' ORDER BY id) AS ids
    FROM "Grammar"
    GROUP BY pattern
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, pattern
    LIMIT 30
  `;
  const grammarPatternGroups = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM (
      SELECT pattern FROM "Grammar" GROUP BY pattern HAVING COUNT(*) > 1
    ) t
  `;

  console.log('\n── Ngữ pháp (trùng pattern toàn DB) ──');
  console.log(`  Nhóm pattern trùng: ${grammarPatternGroups[0]?.n ?? 0}`);
  if (grammarByPattern.length) {
    console.log('  (Cùng pattern ở nhiều bài có thể là chủ đích — xem chi tiết)');
    for (const r of grammarByPattern.slice(0, 12)) {
      const preview = r.key.length > 60 ? r.key.slice(0, 57) + '...' : r.key;
      console.log(`    "${preview}" × ${r.count}`);
    }
  } else {
    console.log('  ✅ Không trùng pattern.');
  }

  // ─── Ngữ pháp: trùng pattern trong cùng lesson ───
  const grammarSameLesson = await prisma.$queryRaw<DupRow[]>`
    SELECT "lessonId"::text || '|' || LEFT(pattern, 40) AS key, COUNT(*)::bigint AS count
    FROM "Grammar"
    GROUP BY "lessonId", pattern
    HAVING COUNT(*) > 1
    LIMIT 20
  `;
  console.log('\n── Ngữ pháp (trùng pattern trong cùng bài) ──');
  if (grammarSameLesson.length) {
    console.log(`  ⚠ ${grammarSameLesson.length} nhóm — nên xoá bản sao:`);
    for (const r of grammarSameLesson) console.log(`    ${r.key} × ${r.count}`);
  } else {
    console.log('  ✅ Không trùng trong cùng bài.');
  }

  // ─── Kanji: trùng character toàn DB ───
  const kanjiByChar = await prisma.$queryRaw<DupRow[]>`
    SELECT character AS key, COUNT(*)::bigint AS count,
           string_agg(id::text, ',' ORDER BY id) AS ids
    FROM "KanjiEntry"
    GROUP BY character
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 30
  `;
  const kanjiCharGroups = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM (
      SELECT character FROM "KanjiEntry" GROUP BY character HAVING COUNT(*) > 1
    ) t
  `;
  const kanjiExtra = await prisma.$queryRaw<{ extra: bigint }[]>`
    SELECT (SUM(cnt) - COUNT(*))::bigint AS extra FROM (
      SELECT COUNT(*)::bigint AS cnt FROM "KanjiEntry" GROUP BY character HAVING COUNT(*) > 1
    ) t
  `;

  console.log('\n── Kanji (trùng character toàn DB) ──');
  console.log(`  Nhóm chữ trùng: ${kanjiCharGroups[0]?.n ?? 0}`);
  console.log(`  Bản ghi thừa: ${kanjiExtra[0]?.extra ?? 0}`);
  if (kanjiByChar.length) {
    for (const r of kanjiByChar.slice(0, 20)) {
      console.log(`    ${r.key} × ${r.count}  [ids: ${r.ids}]`);
    }
  } else {
    console.log('  ✅ Không trùng character.');
  }

  // ─── Kanji: trùng character trong cùng KanjiLesson ───
  const kanjiSameLesson = await prisma.$queryRaw<DupRow[]>`
    SELECT "lessonId"::text || '|' || character AS key, COUNT(*)::bigint AS count
    FROM "KanjiEntry"
    GROUP BY "lessonId", character
    HAVING COUNT(*) > 1
    LIMIT 20
  `;
  console.log('\n── Kanji (trùng character trong cùng bài kanji) ──');
  if (kanjiSameLesson.length) {
    for (const r of kanjiSameLesson) console.log(`    ${r.key} × ${r.count}`);
  } else {
    console.log('  ✅ Không trùng trong cùng bài kanji.');
  }

  // ─── Tổng kết ───
  const totals = {
    vocab: await prisma.vocabulary.count(),
    grammar: await prisma.grammar.count(),
    kanji: await prisma.kanjiEntry.count(),
  };
  console.log('\n── Tổng bản ghi ──');
  console.log(`  Từ vựng: ${totals.vocab} | Ngữ pháp: ${totals.grammar} | Kanji: ${totals.kanji}`);

  // ─── Phân loại trùng ───
  const exactVocabGroups = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM (
      SELECT kana, kanji, meaning FROM "Vocabulary"
      GROUP BY kana, kanji, meaning HAVING COUNT(*) > 1
    ) t
  `;
  const exactVocabExtra = await prisma.$queryRaw<{ extra: bigint }[]>`
    SELECT (SUM(cnt) - COUNT(*))::bigint AS extra FROM (
      SELECT COUNT(*)::bigint AS cnt FROM "Vocabulary"
      GROUP BY kana, kanji, meaning HAVING COUNT(*) > 1
    ) t
  `;

  const kanjiExactGroups = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT COUNT(*)::bigint AS n FROM (
      SELECT character, "meaningVi" FROM "KanjiEntry"
      GROUP BY character, "meaningVi" HAVING COUNT(*) > 1
    ) t
  `;

  const grammarCrossLesson = await prisma.$queryRaw<
    { pattern: string; lesson_ids: string; cnt: bigint }[]
  >`
    SELECT pattern, string_agg(DISTINCT "lessonId"::text, ',') AS lesson_ids,
           COUNT(*)::bigint AS cnt
    FROM "Grammar"
    GROUP BY pattern HAVING COUNT(*) > 1
    ORDER BY cnt DESC
  `;

  console.log('\n── Phân loại ──');
  console.log(
    `  Từ vựng trùng y hệt (kana+kanji+nghĩa): ${exactVocabGroups[0]?.n ?? 0} nhóm, ${exactVocabExtra[0]?.extra ?? 0} bản ghi thừa`,
  );
  console.log(
    `  Từ vựng trùng kana khác nghĩa/bài: ${Number(vocabKanaTotal[0]?.n ?? 0) - Number(exactVocabGroups[0]?.n ?? 0)} nhóm`,
  );
  console.log(`  Kanji trùng character + nghĩa giống: ${kanjiExactGroups[0]?.n ?? 0} nhóm`);
  console.log(
    `  Kanji trùng character (khác bài Minna/JLPT): ${kanjiCharGroups[0]?.n ?? 0} nhóm — thường do Minna + bổ sung JLPT`,
  );
  if (grammarCrossLesson.length) {
    console.log('  Ngữ pháp pattern xuất hiện ở nhiều bài:');
    for (const g of grammarCrossLesson) {
      const p = g.pattern.length > 50 ? g.pattern.slice(0, 47) + '...' : g.pattern;
      console.log(`    "${p}" → bài ${g.lesson_ids}`);
    }
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
