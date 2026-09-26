'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMindMapData, type MindMapKindApi } from '../api';
import type { JlptMindMapLevel } from '../data/jlpt-mind-map-shared';

const UNIT: Record<MindMapKindApi, string> = { VOCAB: 'từ', GRAMMAR: 'mẫu ngữ pháp', KANJI: 'chữ kanji' };

/**
 * Sơ đồ sinh từ toàn bộ dữ liệu trong DB (GET /mind-maps/data).
 * Lấy tiêu đề + màu của từng cấp từ sơ đồ chủ đề để hai chế độ trông thống nhất.
 */
export function useMindMapData(kind: MindMapKindApi, enabled: boolean, themed: JlptMindMapLevel[]) {
  const query = useQuery({
    queryKey: ['mind-map-data', kind],
    queryFn: () => fetchMindMapData(kind),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Phải giữ nguyên tham chiếu giữa các lần render: shell reset ô tìm kiếm mỗi khi sơ đồ đổi.
  const maps = useMemo<JlptMindMapLevel[] | null>(() => {
    if (!query.data) return null;
    return query.data.map((row) => {
      const theme = themed.find((m) => m.level === row.level);
      const by = row.groupedBy === 'partOfSpeech' ? 'từ loại' : 'dải bài';
      return {
        kind,
        level: row.level,
        title: theme?.title ?? row.level,
        accent: theme?.accent ?? '#3b82f6',
        summary: `${row.total} ${UNIT[kind]} trong app · chia nhánh theo ${by}.`,
        branches: row.branches,
      };
    });
  }, [query.data, themed, kind]);

  return { maps, loading: query.isLoading, error: query.isError };
}
