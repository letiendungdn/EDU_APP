/**
 * Dựng bài của từng sách từ kho nội dung một cấp.
 *
 * Số bài (Lesson.lessonNumber, KanjiLesson dùng cùng số):
 *   base[sách] + mã cấp × 1000 + phần × 100 + bài
 *   base: SOUMATOME 20000, SHINKANZEN 30000, TRY 40000; mã cấp: N5=5 … N1=1
 *   vd Sou Matome N3 tuần 2 ngày 4 = 23204; Shinkanzen N2 語彙 phần 3 = 32203.
 */
import type { TbGrammar, TbKanji, TbLevel, TbLevelCatalog, TbSeries, TbUnit, TbVocab } from './types';

export const SERIES_BASE: Record<TbSeries, number> = { SOUMATOME: 20000, SHINKANZEN: 30000, TRY: 40000 };
export const LEVEL_CODE: Record<TbLevel, number> = { N5: 5, N4: 4, N3: 3, N2: 2, N1: 1 };
export const SERIES_LEVELS: Record<TbSeries, TbLevel[]> = {
  SOUMATOME: ['N5', 'N4', 'N3', 'N2', 'N1'],
  SHINKANZEN: ['N4', 'N3', 'N2', 'N1'],
  TRY: ['N5', 'N4', 'N3', 'N2', 'N1'],
};
export const SERIES_NAME: Record<TbSeries, string> = {
  SOUMATOME: 'Sou Matome',
  SHINKANZEN: 'Shinkanzen',
  TRY: 'TRY!',
};

export const SOUMATOME_WEEKS = 6;
export const SOUMATOME_DAYS = 6;
const SHINKANZEN_MAX_GRAMMAR_PER_PART = 10;
const SHINKANZEN_MAX_WORDS_PER_PART = 40;
const SHINKANZEN_KANJI_PER_PART = 12;
const TRY_CHAPTERS: Record<TbLevel, number> = { N5: 8, N4: 12, N3: 12, N2: 12, N1: 12 };

export function lessonNumberFor(series: TbSeries, level: TbLevel, section: number, unit: number): number {
  if (section < 1 || section > 9 || unit < 1 || unit > 99) {
    throw new Error(`section/unit ngoài phạm vi: ${section}/${unit}`);
  }
  return SERIES_BASE[series] + LEVEL_CODE[level] * 1000 + section * 100 + unit;
}

/** Tách số bài ngược lại (dùng ở web để nhóm theo phần). */
export function parseLessonNumber(n: number): { section: number; unit: number } {
  return { section: Math.floor((n % 1000) / 100), unit: n % 100 };
}

/** Chia `items` thành `n` phần liên tiếp gần đều nhau (giữ thứ tự). */
export function splitEvenly<T>(items: T[], n: number): T[][] {
  const out: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => out[Math.floor((i * n) / items.length)].push(item));
  return out;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Tên ngắn cho bài: mẫu ngữ pháp đầu (bỏ phần giải thích trong ngoặc). */
function grammarHeadline(g: TbGrammar[]): string {
  return g.length ? g.slice(0, 2).map((x) => x.p).join(' · ') : '';
}

// ── Sou Matome: 6 tuần × 6 ngày, mỗi tuần một chủ đề từ vựng ────────
export function buildSoumatome(cat: TbLevelCatalog): TbUnit[] {
  const days = SOUMATOME_WEEKS * SOUMATOME_DAYS;
  const grammarByDay = splitEvenly(cat.grammar, days);
  const kanjiByDay = splitEvenly(cat.kanji, days);
  const units: TbUnit[] = [];
  cat.topics.slice(0, SOUMATOME_WEEKS).forEach((topic, w) => {
    const wordsByDay = splitEvenly(topic.words, SOUMATOME_DAYS);
    for (let d = 0; d < SOUMATOME_DAYS; d++) {
      const i = w * SOUMATOME_DAYS + d;
      units.push({
        series: 'SOUMATOME',
        level: cat.level,
        section: w + 1,
        sectionTitle: `Tuần ${w + 1} · ${topic.name}（${topic.nameJa}）`,
        unit: d + 1,
        title: grammarHeadline(grammarByDay[i]) || topic.name,
        grammar: grammarByDay[i],
        vocab: wordsByDay[d],
        kanji: kanjiByDay[i],
      });
    }
  });
  return units;
}

// ── Shinkanzen: 文法 theo nhóm chức năng · 語彙 theo chủ đề · 漢字 theo buổi ──
export function buildShinkanzen(cat: TbLevelCatalog): TbUnit[] {
  const units: TbUnit[] = [];
  const base = { series: 'SHINKANZEN' as const, level: cat.level, vocab: [] as TbVocab[], kanji: [] as TbKanji[] };

  let u = 0;
  for (const [key, label] of Object.entries(cat.categories)) {
    const items = cat.grammar.filter((g) => g.c === key);
    const parts = chunk(items, SHINKANZEN_MAX_GRAMMAR_PER_PART);
    parts.forEach((part, pi) => {
      u += 1;
      units.push({
        ...base,
        section: 1,
        sectionTitle: '文法 · Ngữ pháp',
        unit: u,
        title: parts.length > 1 ? `${label} (${pi + 1})` : label,
        grammar: part,
      });
    });
  }

  u = 0;
  for (const topic of cat.topics) {
    const parts = chunk(topic.words, SHINKANZEN_MAX_WORDS_PER_PART);
    parts.forEach((part, pi) => {
      u += 1;
      units.push({
        ...base,
        grammar: [],
        section: 2,
        sectionTitle: '語彙 · Từ vựng',
        unit: u,
        title: `${topic.name}（${topic.nameJa}）${parts.length > 1 ? ` (${pi + 1})` : ''}`,
        vocab: part,
      });
    });
  }

  chunk(cat.kanji, SHINKANZEN_KANJI_PER_PART).forEach((part, pi) => {
    units.push({
      ...base,
      grammar: [],
      section: 3,
      sectionTitle: '漢字 · Kanji',
      unit: pi + 1,
      title: `Buổi ${pi + 1}: ${part.map((k) => k[0]).join('')}`,
      kanji: part,
    });
  });
  return units;
}

// ── TRY!: ngữ pháp là trục chính, mỗi chương kèm từ vựng ────────────
export function buildTry(cat: TbLevelCatalog): TbUnit[] {
  const n = Math.min(TRY_CHAPTERS[cat.level], cat.grammar.length);
  const grammar = splitEvenly(cat.grammar, n);
  const words = splitEvenly(
    cat.topics.flatMap((t) => t.words),
    n,
  );
  return grammar.map((g, i) => {
    // Tên chương = nhóm chức năng chiếm nhiều mẫu nhất trong chương
    const counts = new Map<string, number>();
    g.forEach((x) => counts.set(x.c, (counts.get(x.c) ?? 0) + 1));
    const topCat = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      series: 'TRY' as const,
      level: cat.level,
      section: 1,
      sectionTitle: 'Các chương · 文法から伸ばす',
      unit: i + 1,
      title: `Chương ${i + 1}: ${topCat ? cat.categories[topCat] : grammarHeadline(g)}`,
      grammar: g,
      vocab: words[i],
      kanji: [],
    };
  });
}

export function buildUnits(series: TbSeries, cat: TbLevelCatalog): TbUnit[] {
  if (!SERIES_LEVELS[series].includes(cat.level)) return [];
  if (series === 'SOUMATOME') return buildSoumatome(cat);
  if (series === 'SHINKANZEN') return buildShinkanzen(cat);
  return buildTry(cat);
}
