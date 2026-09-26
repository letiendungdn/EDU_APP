import { describe, expect, it } from 'vitest';
import { mergeWithFallback } from '../useMindMapLevels';
import type { JlptMindMapLevel } from '../../data/jlpt-mind-map-shared';

const lv = (level: JlptMindMapLevel['level'], title: string): JlptMindMapLevel => ({
  level,
  title,
  summary: '',
  accent: '#000',
  branches: [],
});

describe('mergeWithFallback', () => {
  it('keeps built-in levels the DB has not saved yet', () => {
    const fallback = (['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((l) => lv(l, `default ${l}`));
    const merged = mergeWithFallback([lv('N5', 'from db')], fallback);
    expect(merged.map((m) => m.title)).toEqual(['from db', 'default N4', 'default N3', 'default N2', 'default N1']);
  });
});
