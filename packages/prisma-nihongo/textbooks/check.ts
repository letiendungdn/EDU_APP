/**
 * Kiểm tra kho nội dung giáo trình trước khi seed.
 *   npx tsx textbooks/check.ts
 */
import assert from 'node:assert/strict';
import { TEXTBOOK_CATALOGS } from './catalog';
import { buildUnits, lessonNumberFor, SERIES_LEVELS } from './build-units';
import { kanaToRomaji } from './kana-romaji';
import type { TbSeries } from './types';

// ── romaji ──
const romajiCases: Record<string, string> = {
  がっこう: 'gakkou', きょう: 'kyou', コーヒー: 'koohii', きんえん: "kin'en", ちょっと: 'chotto',
  ほんや: "hon'ya", しんぶん: 'shinbun', まっちゃ: 'matcha', ジュース: 'juusu', '〜さい': '~sai',
};
for (const [kana, want] of Object.entries(romajiCases)) assert.equal(kanaToRomaji(kana), want, kana);

const errors: string[] = [];
const kanaRe = /^[\u3040-\u30ff〜ー・]+$/;

for (const cat of TEXTBOOK_CATALOGS) {
  const L = cat.level;
  if (cat.topics.length !== 6) errors.push(`${L}: cần đúng 6 chủ đề (có ${cat.topics.length})`);

  const seenWords = new Map<string, string>();
  for (const t of cat.topics) {
    for (const w of t.words) {
      const [word, kana, meaning, pos] = w;
      if (!word || !kana || !meaning || !pos) errors.push(`${L}/${t.key}: thiếu trường ${JSON.stringify(w)}`);
      if (!kanaRe.test(kana)) errors.push(`${L}/${t.key}: cách đọc không phải kana: ${word} → ${kana}`);
      const key = `${word}|${kana}`;
      if (seenWords.has(key)) errors.push(`${L}: từ trùng ${word}（${kana}） ở ${seenWords.get(key)} và ${t.key}`);
      seenWords.set(key, t.key);
    }
  }

  const seenPatterns = new Set<string>();
  for (const g of cat.grammar) {
    if (!cat.categories[g.c]) errors.push(`${L}: mẫu "${g.p}" có nhóm lạ "${g.c}"`);
    if (seenPatterns.has(g.p)) errors.push(`${L}: mẫu trùng "${g.p}"`);
    seenPatterns.add(g.p);
    for (const [jp, romaji, vi] of g.ex) {
      if (!jp || !romaji || !vi) errors.push(`${L}: ví dụ thiếu trường ở "${g.p}"`);
      if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(romaji)) errors.push(`${L}: romaji có chữ Nhật ở "${g.p}": ${romaji}`);
    }
  }
  for (const key of Object.keys(cat.categories)) {
    if (!cat.grammar.some((g) => g.c === key)) errors.push(`${L}: nhóm "${key}" không có mẫu nào`);
  }

  const seenKanji = new Set<string>();
  for (const k of cat.kanji) {
    if (k[0].length !== 1) errors.push(`${L}: kanji không phải 1 chữ: ${k[0]}`);
    if (!k[1] || !k[4] || (!k[2] && !k[3])) errors.push(`${L}: kanji thiếu trường ${k[0]}`);
    if (seenKanji.has(k[0])) errors.push(`${L}: kanji trùng ${k[0]}`);
    seenKanji.add(k[0]);
  }

  for (const series of Object.keys(SERIES_LEVELS) as TbSeries[]) {
    const units = buildUnits(series, cat);
    if (!SERIES_LEVELS[series].includes(L)) continue;
    const numbers = units.map((u) => lessonNumberFor(u.series, u.level, u.section, u.unit));
    if (new Set(numbers).size !== numbers.length) errors.push(`${series} ${L}: số bài trùng`);
    const g = units.reduce((s, u) => s + u.grammar.length, 0);
    const v = units.reduce((s, u) => s + u.vocab.length, 0);
    const k = units.reduce((s, u) => s + u.kanji.length, 0);
    if (g !== cat.grammar.length) errors.push(`${series} ${L}: mất mẫu ngữ pháp khi dựng bài`);
    if (v !== seenWords.size) errors.push(`${series} ${L}: mất từ khi dựng bài`);
    if (series !== 'TRY' && k !== cat.kanji.length) errors.push(`${series} ${L}: mất kanji khi dựng bài`);
    console.log(`${series.padEnd(10)} ${L}: ${units.length} bài · ${g} ngữ pháp · ${v} từ · ${k} kanji`);
  }
  console.log(`${L}: kho ${cat.grammar.length} mẫu · ${seenWords.size} từ · ${cat.kanji.length} kanji`);
}

// ── Trùng giữa các cấp (mỗi từ / chữ / mẫu chỉ thuộc một cấp) ──
const owner = { word: new Map<string, string>(), kanji: new Map<string, string>(), pattern: new Map<string, string>() };
for (const cat of TEXTBOOK_CATALOGS) {
  const mark = (kind: keyof typeof owner, key: string) => {
    const prev = owner[kind].get(key);
    if (prev && prev !== cat.level) errors.push(`${kind} "${key}" có ở cả ${prev} và ${cat.level}`);
    owner[kind].set(key, cat.level);
  };
  cat.topics.forEach((t) => t.words.forEach((w) => mark('word', `${w[0]}（${w[1]}）`)));
  cat.kanji.forEach((k) => mark('kanji', k[0]));
  cat.grammar.forEach((g) => mark('pattern', g.p));
}

if (errors.length) {
  console.error(`\n${errors.length} lỗi:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('OK');
