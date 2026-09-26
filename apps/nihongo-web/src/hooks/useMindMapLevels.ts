'use client';

import { useEffect, useState } from 'react';
import { fetchMindMaps, type MindMapKindApi, type MindMapLevelApi } from '../api';
import type { JlptMindMapLevel } from '../data/jlpt-mind-map-shared';

/** Cấp nào DB đã có thì dùng bản DB, cấp nào chưa lưu thì giữ bản mặc định trong code. */
export function mergeWithFallback(
  fromApi: JlptMindMapLevel[],
  fallback: JlptMindMapLevel[],
): JlptMindMapLevel[] {
  const byLevel = new Map(fromApi.map((m) => [m.level, m]));
  const merged = fallback.map((m) => byLevel.get(m.level) ?? m);
  const extra = fromApi.filter((m) => !fallback.some((f) => f.level === m.level));
  return [...merged, ...extra];
}

function apiToView(rows: MindMapLevelApi[]): JlptMindMapLevel[] {
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    level: row.level,
    title: row.title,
    summary: row.summary,
    accent: row.accent,
    sortOrder: row.sortOrder,
    branches: (Array.isArray(row.branches) ? row.branches : []).map((b) => ({
      id: b.id,
      label: b.label,
      labelJa: b.labelJa,
      hint: b.hint,
      posX: b.posX,
      posY: b.posY,
      patterns: (b.patterns ?? []).map((p) => ({
        pattern: p.pattern,
        meaning: p.meaning,
        href: p.href,
        lessonNumber: p.lessonNumber,
        linkLabel: p.linkLabel,
      })),
    })),
  }));
}

export function useMindMapLevels(kind: MindMapKindApi, fallback: JlptMindMapLevel[]) {
  const [maps, setMaps] = useState<JlptMindMapLevel[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMindMaps(kind)
      .then((rows) => {
        if (cancelled) return;
        if (rows.length > 0) {
          setMaps(mergeWithFallback(apiToView(rows), fallback));
          setFromApi(true);
        } else {
          setMaps(fallback);
          setFromApi(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setMaps(fallback);
        setFromApi(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // fallback is stable module const
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  return { maps, loading, fromApi };
}
