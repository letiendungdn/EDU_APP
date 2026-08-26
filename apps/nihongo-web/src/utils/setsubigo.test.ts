import { beforeAll, describe, expect, it } from 'vitest';
import {
  analyzeSetsubigo,
  classifySetsubigo,
  groupsFromPayload,
  hasValidSuffix,
  setSetsubigoCatalog,
} from './setsubigo';
import type { JapaneseVocabSuffixesPayload } from '../types/reference';

/** Fixture tối thiểu (cùng shape API) — source of truth là DB */
const FIXTURE: JapaneseVocabSuffixesPayload = {
  groups: [
    {
      id: 'honorifics',
      label: 'Hậu tố xưng hô',
      labelJa: '呼びかけ',
      hint: '',
      items: [
        {
          suffix: 'さん',
          forms: ['さん'],
          kana: 'さん',
          romaji: 'san',
          meaning: 'anh/chị',
          attachesTo: 'tên',
          pos: ['noun'],
          exampleJa: '田中さんは先生です。',
          exampleVi: 'Anh/chị Tanaka là giáo viên.',
        },
        {
          suffix: 'さま',
          forms: ['さま', '様'],
          kana: 'さま',
          romaji: 'sama',
          meaning: 'ngài',
          attachesTo: 'tên',
          pos: ['noun'],
          exampleJa: 'お客様、どうぞ。',
          exampleVi: 'Quý khách, xin mời.',
        },
      ],
    },
    {
      id: 'quality',
      label: 'Tính chất',
      labelJa: '性質',
      hint: '',
      items: [
        {
          suffix: '的',
          forms: ['的'],
          kana: 'てき',
          romaji: 'teki',
          meaning: 'mang tính…',
          attachesTo: 'danh từ',
          pos: ['noun'],
          exampleJa: '科学的な方法です。',
          exampleVi: 'Phương pháp khoa học.',
        },
      ],
    },
    {
      id: 'verb-adj',
      label: 'Động từ / tính từ',
      labelJa: '動詞・形容詞',
      hint: '',
      items: [
        {
          suffix: 'やすい',
          forms: ['やすい'],
          kana: 'やすい',
          romaji: 'yasui',
          meaning: 'dễ…',
          attachesTo: 'gốc ます',
          pos: ['verb'],
          exampleJa: '分かりやすいです。',
          exampleVi: 'Dễ hiểu.',
        },
        {
          suffix: 'にくい',
          forms: ['にくい'],
          kana: 'にくい',
          romaji: 'nikui',
          meaning: 'khó…',
          attachesTo: 'gốc ます',
          pos: ['verb'],
          exampleJa: '読みにくいです。',
          exampleVi: 'Khó đọc.',
        },
        {
          suffix: 'すぎる',
          forms: ['すぎる', '過ぎる'],
          kana: 'すぎる',
          romaji: 'sugiru',
          meaning: 'quá…',
          attachesTo: 'gốc',
          pos: ['verb', 'i-adj', 'na-adj'],
          exampleJa: '高すぎます。',
          exampleVi: 'Đắt quá.',
        },
      ],
    },
    {
      id: 'person',
      label: 'Người',
      labelJa: '人',
      hint: '',
      items: [
        {
          suffix: '人',
          forms: ['人'],
          kana: 'じん',
          romaji: 'jin',
          meaning: 'người',
          attachesTo: 'tên nước',
          pos: ['noun'],
          exampleJa: 'ベトナム人です。',
          exampleVi: 'Người Việt.',
        },
      ],
    },
  ],
};

describe('setsubigo', () => {
  beforeAll(() => {
    setSetsubigoCatalog(groupsFromPayload(FIXTURE));
  });

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
