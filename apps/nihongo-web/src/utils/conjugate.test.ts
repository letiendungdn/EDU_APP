import { describe, expect, it } from 'vitest';
import { classifyVerbGroup, conjugateIAdj, conjugateVerb } from './conjugate';
import { buildParticleQuestions, findParticles } from './particles';

describe('conjugateVerb', () => {
  it('ichidan 食べます', () => {
    expect(classifyVerbGroup('たべます', '食べます')).toBe('ichidan');
    expect(conjugateVerb('たべます', '食べます')).toEqual({
      masu: 'たべます',
      te: 'たべて',
      ta: 'たべた',
      nai: 'たべない',
      dict: 'たべる',
    });
  });

  it('godan 行きます / 書きます / 飲みます', () => {
    expect(conjugateVerb('いきます', '行きます')).toEqual({
      masu: 'いきます',
      te: 'いって',
      ta: 'いった',
      nai: 'いかない',
      dict: 'いく',
    });
    expect(conjugateVerb('かきます', '書きます')?.te).toBe('かいて');
    expect(conjugateVerb('のみます', '飲みます')?.te).toBe('のんで');
    expect(conjugateVerb('かいます', '買います')?.nai).toBe('かわない');
  });

  it('する / 来る', () => {
    expect(conjugateVerb('します')?.dict).toBe('する');
    expect(conjugateVerb('べんきょうします', '勉強します')?.te).toBe('べんきょうして');
    expect(conjugateVerb('きます', '来ます')?.nai).toBe('こない');
    expect(conjugateVerb('はなします', '話します')?.dict).toBe('はなす');
  });

  it('tính từ い / いい', () => {
    expect(conjugateIAdj('たかい')).toEqual({
      masu: 'たかいです',
      te: 'たかくて',
      ta: 'たかかった',
      nai: 'たかくない',
      dict: 'たかい',
    });
    expect(conjugateIAdj('いい')?.te).toBe('よくて');
  });
});

describe('findParticles', () => {
  it('bắt は/を trong câu có khoảng trắng', () => {
    const hits = findParticles('わたしは コーヒーを のみます');
    expect(hits.map((h) => h.particle)).toEqual(['は', 'を']);
  });

  it('không bắt で trong です', () => {
    const hits = findParticles('わたしは学生です');
    expect(hits.map((h) => h.particle)).toEqual(['は']);
  });

  it('tạo câu hỏi điền trợ từ', () => {
    const qs = buildParticleQuestions([{ id: 1, jp: '駅に行きます', vi: 'Đi nhà ga' }]);
    expect(qs[0].answer).toBe('に');
    expect(qs[0].options).toContain('に');
  });
});
