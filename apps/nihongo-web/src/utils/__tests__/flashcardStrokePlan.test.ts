import { describe, expect, it } from 'vitest';
import { flashcardStrokePlan, uniqueKanji } from '../japanese';

describe('uniqueKanji', () => {
  it('keeps kanji only, once each, in order', () => {
    expect(uniqueKanji('さくら大学／富士大学')).toBe('大学富士');
    expect(uniqueKanji('わたし')).toBe('');
  });
});

describe('flashcardStrokePlan', () => {
  it('draws kanji and a short kana reading side by side', () => {
    const plan = flashcardStrokePlan('私', 'わたし');
    expect(plan.rows).toEqual([
      { label: 'Kanji', text: '私' },
      { label: 'Kana', text: 'わたし' },
    ]);
    expect(plan.size).toBe(108); // 540 / (1 + 3 + 1)
  });

  it('draws only the kanji of a long word so it stays on one row', () => {
    const plan = flashcardStrokePlan('さくら大学／富士大学', 'さくらだいがく／ふじだいがく');
    expect(plan.rows).toEqual([{ label: 'Kanji', text: '大学富士' }]);
    expect(plan.size).toBe(135);
  });

  it('draws kana when the word has no kanji', () => {
    expect(flashcardStrokePlan(null, 'エンジニア').rows).toEqual([{ text: 'エンジニア' }]);
  });

  it('never goes below the minimum box size', () => {
    expect(flashcardStrokePlan(null, 'こちらこそよろしくおねがいします', { width: 300 }).size).toBe(56);
  });
});
