'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuizView from '@/views/QuizView';

function QuizPageInner() {
  const searchParams = useSearchParams();
  const raw = searchParams.get('lesson');
  const lesson = raw ? Number(raw) : NaN;
  const initialLessonNumber = Number.isFinite(lesson) && lesson > 0 ? Math.floor(lesson) : undefined;

  return <QuizView key={initialLessonNumber ?? 'default'} initialLessonNumber={initialLessonNumber} />;
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <QuizPageInner />
    </Suspense>
  );
}
