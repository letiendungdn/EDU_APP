export type McqOption = {
  text: string;
  reveal: string;
  speak?: string;
};

export type McqQuestionBase = {
  id: string | number;
  prompt: string;
  promptSub?: string;
  answer: string;
  options: McqOption[];
};

export function shuffleInPlace<T>(items: T[], random = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function uniqueByKey<T>(pool: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of pool) {
    const key = keyOf(item).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function pickDistractors<T extends { id: string | number }>(
  pool: T[],
  correct: T,
  answerOf: (item: T) => string,
  count: number,
  random: () => number,
): T[] {
  const correctAnswer = answerOf(correct).trim();
  const candidates = uniqueByKey(
    pool.filter((item) => item.id !== correct.id && answerOf(item).trim() !== correctAnswer),
    answerOf,
  );
  shuffleInPlace(candidates, random);
  return candidates.slice(0, count);
}

export function buildMcqQuestions<T extends { id: string | number }>(
  pool: T[],
  config: {
    answerOf: (item: T) => string;
    toOption: (item: T) => McqOption;
    toQuestion: (item: T, options: McqOption[], answer: string) => McqQuestionBase;
    optionCount?: number;
    random?: () => number;
  },
): McqQuestionBase[] {
  const optionCount = Math.max(2, config.optionCount ?? 4);
  const random = config.random ?? Math.random;
  if (pool.length === 0) return [];

  const questions = pool.map((item) => {
    const answerOption = config.toOption(item);
    const distractors = pickDistractors(pool, item, config.answerOf, optionCount - 1, random).map(
      config.toOption,
    );
    const options = shuffleInPlace([answerOption, ...distractors], random);
    return config.toQuestion(item, options, answerOption.text);
  });

  return shuffleInPlace(questions, random);
}
