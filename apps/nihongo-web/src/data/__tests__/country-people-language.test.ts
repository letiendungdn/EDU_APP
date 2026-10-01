import { describe, expect, it } from 'vitest';
import {
  COUNTRY_PEOPLE_LANGUAGES,
  isIrregularLanguage,
  matchesCountryPeople,
  personOf,
} from '../country-people-language';

const byCode = (code: string) => COUNTRY_PEOPLE_LANGUAGES.find((c) => c.code === code)!;

describe('country-people-language', () => {
  it('mỗi nước có mã riêng và ít nhất một ngôn ngữ', () => {
    const codes = COUNTRY_PEOPLE_LANGUAGES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const c of COUNTRY_PEOPLE_LANGUAGES) expect(c.languages.length).toBeGreaterThan(0);
  });

  it('ngôn ngữ: chữ 語 đọc ご', () => {
    for (const c of COUNTRY_PEOPLE_LANGUAGES) {
      for (const l of c.languages) {
        expect(l.ja.endsWith('語')).toBe(true);
        expect(l.kana.endsWith('ご')).toBe(true);
        expect(l.romaji.endsWith('go')).toBe(true);
      }
    }
  });

  it('người = tên nước + 人（じん）', () => {
    expect(personOf(byCode('JP'))).toMatchObject({ ja: '日本人', kana: 'にほんじん', romaji: 'nihonjin' });
    expect(personOf(byCode('VN'))).toMatchObject({ ja: 'ベトナム人', kana: 'ベトナムじん' });
  });

  it('đánh dấu nước không theo quy tắc tên nước + 語', () => {
    expect(isIrregularLanguage(byCode('US'), byCode('US').languages[0])).toBe(true);
    expect(isIrregularLanguage(byCode('BR'), byCode('BR').languages[0])).toBe(true);
    expect(isIrregularLanguage(byCode('FR'), byCode('FR').languages[0])).toBe(false);
    expect(isIrregularLanguage(byCode('JP'), byCode('JP').languages[0])).toBe(false);
  });

  it('tìm theo tiếng Việt, kana, romaji, tên người và ngôn ngữ', () => {
    const find = (q: string) => COUNTRY_PEOPLE_LANGUAGES.filter((c) => matchesCountryPeople(c, q)).map((c) => c.code);
    expect(find('việt')).toContain('VN');
    expect(find('アメリカ人')).toEqual(['US']);
    expect(find('えいご')).toEqual(expect.arrayContaining(['US', 'GB', 'AU', 'CA', 'PH', 'IN']));
    expect(find('porutogarugo')).toEqual(['PT', 'BR']);
  });
});
