import { buildMcqQuestions, type McqOption, type McqQuestionBase } from './mcq-quiz';

export type KanaQuizMode = 'char-to-romaji' | 'romaji-to-char';
export type KanaScriptFilter = 'hiragana' | 'katakana' | 'both';

export type KanaQuizSource = {
  id: string;
  kana: string;
  romaji: string;
  script: 'hiragana' | 'katakana';
  sectionId: string;
};

export type KanaQuizQuestion = McqQuestionBase & {
  mode: KanaQuizMode;
  kana: string;
  romaji: string;
  script: 'hiragana' | 'katakana';
};

function toOption(item: KanaQuizSource, mode: KanaQuizMode): McqOption {
  if (mode === 'char-to-romaji') {
    return { text: item.romaji, reveal: item.kana, speak: item.kana };
  }
  return { text: item.kana, reveal: item.romaji, speak: item.kana };
}

export function buildKanaQuiz(
  source: KanaQuizSource[],
  mode: KanaQuizMode,
  options: { optionCount?: number; random?: () => number } = {},
): KanaQuizQuestion[] {
  const pool = uniqueKanaPool(source);
  return buildMcqQuestions(pool, {
    ...options,
    answerOf: (item) => (mode === 'char-to-romaji' ? item.romaji : item.kana),
    toOption: (item) => toOption(item, mode),
    toQuestion: (item, choices, answer) => ({
      id: item.id,
      mode,
      prompt: mode === 'char-to-romaji' ? item.kana : item.romaji,
      promptSub: mode === 'char-to-romaji' ? undefined : `Chọn chữ ${item.script === 'hiragana' ? 'hiragana' : 'katakana'}`,
      answer,
      options: choices,
      kana: item.kana,
      romaji: item.romaji,
      script: item.script,
    }),
  }) as KanaQuizQuestion[];
}

function uniqueKanaPool(source: KanaQuizSource[]): KanaQuizSource[] {
  const seen = new Set<string>();
  const out: KanaQuizSource[] = [];
  for (const item of source) {
    if (!item.kana?.trim() || !item.romaji?.trim()) continue;
    const key = `${item.script}:${item.kana}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function kanaSourcesFromCharts(
  charts: {
    hiraganaSections?: Array<{ id: string; rows: Array<Array<{ kana: string; romaji: string }>> }>;
    katakanaSections?: Array<{ id: string; rows: Array<Array<{ kana: string; romaji: string }>> }>;
  } | null | undefined,
  script: KanaScriptFilter,
  sectionIds: string[] | 'all',
): KanaQuizSource[] {
  const out: KanaQuizSource[] = [];

  const pushSections = (
    sections: Array<{ id: string; rows: Array<Array<{ kana: string; romaji: string }>> }> | undefined,
    scriptName: 'hiragana' | 'katakana',
  ) => {
    if (!sections) return;
    for (const section of sections) {
      if (sectionIds !== 'all' && !sectionIds.includes(section.id)) continue;
      for (const row of section.rows) {
        for (const cell of row) {
          if (!cell.kana?.trim()) continue;
          out.push({
            id: `${scriptName}:${section.id}:${cell.kana}`,
            kana: cell.kana.trim(),
            romaji: cell.romaji.trim(),
            script: scriptName,
            sectionId: section.id,
          });
        }
      }
    }
  };

  if (script === 'hiragana' || script === 'both') {
    pushSections(charts?.hiraganaSections, 'hiragana');
  }
  if (script === 'katakana' || script === 'both') {
    pushSections(charts?.katakanaSections, 'katakana');
  }

  return out;
}
