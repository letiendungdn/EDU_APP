export type VocabQuizMode = 'jp-to-vi' | 'vi-to-jp';

export type VocabQuizSource = {
  id: number;
  kanji?: string | null;
  kana: string;
  romaji?: string;
  meaning: string;
  lessonNumber?: number;
  exampleJa?: string | null;
  exampleKana?: string | null;
  exampleVi?: string | null;
};

export type VocabQuizOption = {
  text: string;
  /** Đối chiếu ngôn ngữ kia — hiện sau khi kiểm tra */
  reveal: string;
  speak?: string;
};

export type VocabQuizQuestion = {
  id: number;
  mode: VocabQuizMode;
  prompt: string;
  promptSub?: string;
  answer: string;
  options: VocabQuizOption[];
  lessonNumber?: number;
  kana: string;
  kanji: string | null;
  romaji: string;
  meaning: string;
  exampleJa?: string | null;
  exampleKana?: string | null;
  exampleVi?: string | null;
};

function shuffleInPlace<T>(items: T[], random = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function japaneseLabel(vocab: VocabQuizSource): string {
  if (vocab.kanji?.trim() && vocab.kanji.trim() !== vocab.kana.trim()) {
    return `${vocab.kanji.trim()}（${vocab.kana.trim()}）`;
  }
  return vocab.kana.trim();
}

function toOption(vocab: VocabQuizSource, mode: VocabQuizMode): VocabQuizOption {
  if (mode === 'jp-to-vi') {
    return {
      text: vocab.meaning.trim(),
      reveal: japaneseLabel(vocab),
      speak: vocab.kana.trim(),
    };
  }
  return {
    text: japaneseLabel(vocab),
    reveal: vocab.meaning.trim(),
    speak: vocab.kana.trim(),
  };
}

function uniqueByKey(pool: VocabQuizSource[], keyOf: (v: VocabQuizSource) => string): VocabQuizSource[] {
  const seen = new Set<string>();
  const out: VocabQuizSource[] = [];
  for (const item of pool) {
    const key = keyOf(item).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function pickDistractorVocabs(
  pool: VocabQuizSource[],
  correct: VocabQuizSource,
  answerOf: (v: VocabQuizSource) => string,
  count: number,
  random: () => number,
): VocabQuizSource[] {
  const correctAnswer = answerOf(correct).trim();
  const candidates = uniqueByKey(
    pool.filter((item) => item.id !== correct.id && answerOf(item).trim() !== correctAnswer),
    answerOf,
  );
  shuffleInPlace(candidates, random);
  return candidates.slice(0, count);
}

export function buildVocabQuiz(
  source: VocabQuizSource[],
  mode: VocabQuizMode,
  options: { optionCount?: number; random?: () => number } = {},
): VocabQuizQuestion[] {
  const optionCount = Math.max(2, options.optionCount ?? 4);
  const random = options.random ?? Math.random;
  const pool = source.filter((item) => item.kana?.trim() && item.meaning?.trim());
  if (pool.length === 0) return [];

  const answerOf = mode === 'jp-to-vi' ? (v: VocabQuizSource) => v.meaning : japaneseLabel;
  const questions = pool.map((item) => {
    const answerOption = toOption(item, mode);
    const distractors = pickDistractorVocabs(pool, item, answerOf, optionCount - 1, random).map(
      (vocab) => toOption(vocab, mode),
    );
    const choices = shuffleInPlace([answerOption, ...distractors], random);
    return {
      id: item.id,
      mode,
      prompt: mode === 'jp-to-vi' ? japaneseLabel(item) : item.meaning.trim(),
      promptSub: mode === 'jp-to-vi' ? item.romaji?.trim() || undefined : undefined,
      answer: answerOption.text,
      options: choices,
      lessonNumber: item.lessonNumber,
      kana: item.kana,
      kanji: item.kanji ?? null,
      romaji: item.romaji ?? '',
      meaning: item.meaning,
      exampleJa: item.exampleJa ?? null,
      exampleKana: item.exampleKana ?? null,
      exampleVi: item.exampleVi ?? null,
    } satisfies VocabQuizQuestion;
  });

  return shuffleInPlace(questions, random);
}
