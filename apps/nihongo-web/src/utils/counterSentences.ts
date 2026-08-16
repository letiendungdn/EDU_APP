import type { CounterItem } from '../types/reference';

export type CounterSentenceQ = {
  jpPrompt: string;
  filledJa: string;
  speakJa: string;
  vi: string;
  answer: string;
  options: string[];
};

const TEMPLATES: Array<(item: CounterItem) => { jp: string; filled: string; spoken: string; vi: string }> = [
  (item) => {
    const form = item.kanji || item.kana;
    return {
      jp: `これを ___ ください。`,
      filled: `これを${form}ください。`,
      spoken: `これを${item.kana}ください。`,
      vi: `Cho tôi ${item.vi}.`,
    };
  },
  (item) => {
    const form = item.kanji || item.kana;
    return {
      jp: `___ あります。`,
      filled: `${form}あります。`,
      spoken: `${item.kana}あります。`,
      vi: `Có ${item.vi}.`,
    };
  },
  (item) => {
    const form = item.kanji || item.kana;
    return {
      jp: `___ ください。`,
      filled: `${form}ください。`,
      spoken: `${item.kana}ください。`,
      vi: `Làm ơn cho ${item.vi}.`,
    };
  },
];

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function buildCounterSentenceQuestions(items: CounterItem[]): CounterSentenceQ[] {
  const usable = items.filter((item) => item.kana);
  return shuffle(usable).slice(0, 12).map((item, index) => {
    const template = TEMPLATES[index % TEMPLATES.length](item);
    const answer = item.kanji || item.kana;
    const distractors = shuffle(usable.filter((row) => row.kana !== item.kana))
      .slice(0, 3)
      .map((row) => row.kanji || row.kana);
    const options = shuffle([answer, ...distractors]).slice(0, 4);
    return {
      jpPrompt: template.jp,
      filledJa: template.filled,
      speakJa: template.spoken,
      vi: template.vi,
      answer,
      options,
    };
  });
}
