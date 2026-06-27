import { describe, it, expect } from 'vitest';
import { getStrokeText, shouldShowKanaStroke } from './japanese';

describe('getStrokeText', () => {
  it('giữ lại hiragana', () => {
    expect(getStrokeText('たべる')).toBe('たべる');
  });

  it('giữ lại katakana', () => {
    expect(getStrokeText('テレビ')).toBe('テレビ');
  });

  it('giữ lại kanji', () => {
    expect(getStrokeText('食べる')).toBe('食べる');
  });

  it('bỏ romaji và dấu câu', () => {
    expect(getStrokeText('taberu')).toBe('');
    expect(getStrokeText('～、。')).toBe('');
  });

  it('xử lý chuỗi rỗng', () => {
    expect(getStrokeText('')).toBe('');
  });

  it('xử lý mixed text', () => {
    expect(getStrokeText('食べる (taberu)')).toBe('食べる');
  });
});

describe('shouldShowKanaStroke', () => {
  it('true khi kanji và kana khác nhau', () => {
    expect(shouldShowKanaStroke('私', 'わたし')).toBe(true);
  });

  it('false khi chỉ có kana', () => {
    expect(shouldShowKanaStroke(null, 'わたし')).toBe(false);
  });

  it('false khi kanji và kana cùng nội dung viết', () => {
    expect(shouldShowKanaStroke('先生', 'せんせい')).toBe(true);
    expect(shouldShowKanaStroke('食べる', '食べる')).toBe(false);
  });
});
