'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KanjiView from '@/views/KanjiView';

function KanjiPageInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('lesson');
  const lesson = raw ? Number(raw) : NaN;
  const initialLessonNumber = Number.isFinite(lesson) && lesson > 0 ? Math.floor(lesson) : undefined;

  return <KanjiView initialLessonNumber={initialLessonNumber} />;
}

export default function KanjiPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <KanjiPageInner />
    </Suspense>
  );
}
