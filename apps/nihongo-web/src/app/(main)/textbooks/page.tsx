'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TextbookPlanView from '@/views/TextbookPlanView';
import { JLPT_MIND_LEVELS, type JlptMindLevel } from '@/data/jlpt-mind-map-shared';
import type { JlptTextbookSeries } from '@/data/jlpt-textbooks';

const SERIES: JlptTextbookSeries[] = ['MINNA', 'SOUMATOME', 'SHINKANZEN', 'TRY', 'KLL'];

function TextbooksPageInner() {
  const searchParams = useSearchParams();
  const rawSeries = searchParams.get('series')?.toUpperCase();
  const rawLevel = searchParams.get('level')?.toUpperCase();
  const series = SERIES.find((s) => s === rawSeries);
  const level = JLPT_MIND_LEVELS.find((lv) => lv === rawLevel) as JlptMindLevel | undefined;

  return <TextbookPlanView initialSeries={series} initialLevel={level} />;
}

export default function TextbooksPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <TextbooksPageInner />
    </Suspense>
  );
}
