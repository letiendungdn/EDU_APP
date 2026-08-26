import { Suspense } from 'react';
import KanjiQuizView from '@/views/KanjiQuizView';

export default function KanjiQuizPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <KanjiQuizView />
    </Suspense>
  );
}
