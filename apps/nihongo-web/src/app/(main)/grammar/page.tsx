'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GrammarView from '@/views/GrammarView';

function GrammarPageInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('lesson');
  const lesson = raw ? Number(raw) : NaN;
  const initialLessonNumber = Number.isFinite(lesson) && lesson > 0 ? Math.floor(lesson) : undefined;

  return <GrammarView initialLessonNumber={initialLessonNumber} />;
}

export default function GrammarPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <GrammarPageInner />
    </Suspense>
  );
}
