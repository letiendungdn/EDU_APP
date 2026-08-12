import { Suspense } from 'react';
import SentencePracticeView from '@/views/SentencePracticeView';

export const metadata = { title: 'Luyện câu AI – Nihongo' };

export default function SentencePracticePage() {
  return (
    <Suspense>
      <SentencePracticeView />
    </Suspense>
  );
}
