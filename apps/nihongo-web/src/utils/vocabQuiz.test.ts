import { describe, expect, it } from 'vitest';
import { buildVocabQuiz, japaneseLabel } from './vocabQuiz';

const SAMPLE = [
  { id: 1, kanji: '本', kana: 'ほん', romaji: 'hon', meaning: 'sách', lessonNumber: 1 },
  { id: 2, kanji: '車', kana: 'くるま', romaji: 'kuruma', meaning: 'xe hơi', lessonNumber: 1 },
  { id: 3, kanji: null, kana: 'みず', romaji: 'mizu', meaning: 'nước', lessonNumber: 2 },
  { id: 4, kanji: '人', kana: 'ひと', romaji: 'hito', meaning: 'người', lessonNumber: 2 },
  { id: 5, kanji: '犬', kana: 'いぬ', romaji: 'inu', meaning: 'chó', lessonNumber: 2 },
];

describe('vocabQuiz', () => {
  it('formats japanese labels with furigana when kanji differs', () => {
    expect(japaneseLabel(SAMPLE[0])).toBe('本（ほん）');
    expect(japaneseLabel(SAMPLE[2])).toBe('みず');
  });

  it('builds jp→vi options with reverse reveals', () => {
    const questions = buildVocabQuiz(SAMPLE, 'jp-to-vi', { optionCount: 4 });
    expect(questions).toHaveLength(5);
    for (const q of questions) {
      expect(q.options.map((o) => o.text)).toContain(q.answer);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const option of q.options) {
        expect(option.reveal.trim().length).toBeGreaterThan(0);
        expect(option.speak?.length).toBeGreaterThan(0);
      }
      const correct = q.options.find((o) => o.text === q.answer);
      expect(correct?.reveal).toBe(q.prompt);
    }
  });

  it('builds vi→jp options with vietnamese reveals', () => {
    const questions = buildVocabQuiz(SAMPLE, 'vi-to-jp', { optionCount: 4 });
    expect(questions.length).toBe(5);
    for (const q of questions) {
      expect(q.prompt).toBe(q.meaning);
      const correct = q.options.find((o) => o.text === q.answer);
      expect(correct?.reveal).toBe(q.meaning);
      expect(q.answer).toMatch(/[\u3040-\u30ff\u4e00-\u9faf]/);
    }
  });
});
