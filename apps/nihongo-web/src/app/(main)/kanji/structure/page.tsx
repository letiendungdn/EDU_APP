'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KanjiStructureView from '@/views/KanjiStructureView';

function KanjiStructurePageInner() {
  const searchParams = useSearchParams();
  return <KanjiStructureView initialText={searchParams.get('c') ?? undefined} />;
}

export default function KanjiStructurePage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <KanjiStructurePageInner />
    </Suspense>
  );
}
