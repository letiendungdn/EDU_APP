'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VocabView from '@/views/VocabView';

function VocabPageInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('lesson');
  const lesson = raw ? Number(raw) : NaN;
  const initialLessonNumber = Number.isFinite(lesson) && lesson > 0 ? Math.floor(lesson) : undefined;

  return <VocabView initialLessonNumber={initialLessonNumber} />;
}

export default function VocabPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <VocabPageInner />
    </Suspense>
  );
}
