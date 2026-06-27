import { describe, it, expect, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

import {
  addMistakeWord,
  recordReviewResult,
  getAllMistakeWords,
  getMistakeStats,
  getTodayReviewBatch,
  DAILY_REVIEW_LIMIT,
} from './mistakeVocab';

describe('mistakeVocab', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('addMistakeWord adds a new word', () => {
    addMistakeWord({ kana: 'たべる', kanji: '食べる', meaning: 'ăn', lessonNumber: 1 });
    const words = getAllMistakeWords();
    expect(words).toHaveLength(1);
    expect(words[0].kana).toBe('たべる');
    expect(words[0].wrongCount).toBe(1);
  });

  it('addMistakeWord increments wrongCount for existing word', () => {
    const word = { kana: 'たべる', kanji: null, meaning: 'ăn', lessonNumber: 1 };
    addMistakeWord(word);
    addMistakeWord(word);
    const words = getAllMistakeWords();
    expect(words[0].wrongCount).toBe(2);
  });

  it('recordReviewResult increments reviewStreak on remembered', () => {
    addMistakeWord({ kana: 'いく', kanji: '行く', meaning: 'đi', lessonNumber: 2 });
    const key = getAllMistakeWords()[0].key;
    recordReviewResult(key, true);
    expect(getAllMistakeWords()[0].reviewStreak).toBe(1);
  });

  it('recordReviewResult resets streak on forgotten', () => {
    addMistakeWord({ kana: 'いく', kanji: null, meaning: 'đi', lessonNumber: 2 });
    const key = getAllMistakeWords()[0].key;
    recordReviewResult(key, true);
    recordReviewResult(key, false);
    expect(getAllMistakeWords()[0].reviewStreak).toBe(0);
  });

  it('word becomes mastered after 3 consecutive correct answers', () => {
    addMistakeWord({ kana: 'みる', kanji: '見る', meaning: 'xem', lessonNumber: 3 });
    const key = getAllMistakeWords()[0].key;
    recordReviewResult(key, true);
    recordReviewResult(key, true);
    recordReviewResult(key, true);
    expect(getAllMistakeWords()).toHaveLength(0);
  });

  it('getMistakeStats counts correctly', () => {
    addMistakeWord({ kana: 'ある', kanji: null, meaning: 'có', lessonNumber: 1 });
    addMistakeWord({ kana: 'いる', kanji: null, meaning: 'có (người/thú)', lessonNumber: 1 });
    const stats = getMistakeStats();
    expect(stats.total).toBe(2);
    expect(stats.mastered).toBe(0);
  });

  it('getTodayReviewBatch respects DAILY_REVIEW_LIMIT', () => {
    for (let i = 0; i < DAILY_REVIEW_LIMIT + 5; i++) {
      addMistakeWord({ kana: `あ${i}`, kanji: null, meaning: `nghĩa ${i}`, lessonNumber: 1 });
    }
    const batch = getTodayReviewBatch();
    expect(batch.length).toBeLessThanOrEqual(DAILY_REVIEW_LIMIT);
  });
});
