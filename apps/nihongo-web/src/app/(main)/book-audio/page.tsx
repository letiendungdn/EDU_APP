'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookAudioView from '@/views/BookAudioView';

function BookAudioPageInner() {
  const searchParams = useSearchParams();
  const level = searchParams.get('level')?.toUpperCase() || undefined;
  const item = searchParams.get('item') || undefined;

  return <BookAudioView initialLevel={level} focusItemId={item} />;
}

export default function BookAudioPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <BookAudioPageInner />
    </Suspense>
  );
}
