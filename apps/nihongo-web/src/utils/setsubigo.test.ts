import { describe, expect, it } from 'vitest';
import {
  analyzeSetsubigo,
  classifySetsubigo,
  hasValidSuffix,
} from './setsubigo';

describe('setsubigo', () => {
  it('phân loại theo nhóm chức năng', () => {
    const groups = classifySetsubigo();
    expect(Object.keys(groups)).toEqual(
      expect.arrayContaining(['honorifics', 'quality', 'verb-adj', 'person']),
    );
    expect(groups.honorifics.some((s) => s.suffix === 'さん')).toBe(true);
    expect(groups['verb-adj'].some((s) => s.suffix === 'やすい')).toBe(true);
  });

  it('nhận hậu tố xưng hô sau danh từ', () => {
    expect(hasValidSuffix('田中さん', 'noun')).toBe(true);
    expect(hasValidSuffix('お客様', 'noun')).toBe(true);
    expect(hasValidSuffix('田中さん', 'verb')).toBe(false);
  });

  it('nhận hậu tố sau động từ / tính từ', () => {
    expect(hasValidSuffix('分かりやすい', 'verb')).toBe(true);
    expect(hasValidSuffix('読みにくい', 'verb')).toBe(true);
    expect(hasValidSuffix('高すぎる', 'i-adj')).toBe(true);
    expect(hasValidSuffix('高すぎる', 'noun')).toBe(false);
  });

  it('trả stem + quy tắc khi phân tích', () => {
    const hit = analyzeSetsubigo('科学的', 'noun');
    expect(hit.valid).toBe(true);
    if (hit.valid) {
      expect(hit.stem).toBe('科学');
      expect(hit.item.romaji).toBe('teki');
    }
  });
});
