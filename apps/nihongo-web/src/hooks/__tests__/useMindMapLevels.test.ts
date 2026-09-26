import { describe, expect, it } from 'vitest';
import { apiToView } from '../useMindMapLevels';
import type { MindMapLevelApi } from '../../api';

const row = (level: MindMapLevelApi['level']): MindMapLevelApi => ({
  id: 1,
  kind: 'GRAMMAR',
  level,
  title: `t ${level}`,
  summary: '',
  accent: '#000',
  sortOrder: 0,
  branches: [{ id: 'b', label: 'B', patterns: [{ pattern: 'p', meaning: 'm', lessonNumber: 3 }] }],
});

describe('apiToView', () => {
  it('orders levels N5 → N1 and keeps branch items', () => {
    const view = apiToView([row('N1'), row('N5'), row('N3')]);
    expect(view.map((m) => m.level)).toEqual(['N5', 'N3', 'N1']);
    expect(view[0].branches[0].patterns[0]).toEqual(
      expect.objectContaining({ pattern: 'p', meaning: 'm', lessonNumber: 3 }),
    );
  });
});
