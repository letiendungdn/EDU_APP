'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KanjiListView from '@/views/KanjiListView';

const JLPT_LEVELS = new Set(['N5', 'N4', 'N3', 'N2', 'N1', 'ALL']);

function KanjiListPageInner() {
  const searchParams = useSearchParams();
  const raw = (searchParams.get('level') ?? '').toUpperCase();
  const initialLevel = JLPT_LEVELS.has(raw)
    ? (raw as 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'ALL')
    : undefined;

  return <KanjiListView initialLevel={initialLevel} />;
}

export default function KanjiListPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <KanjiListPageInner />
    </Suspense>
  );
}
