import { Suspense } from 'react';
import SrsView from '@/views/SrsView';

export const metadata = { title: 'Luyện SRS – Nihongo' };

export default function SrsPage() {
  return (
    <Suspense>
      <SrsView />
    </Suspense>
  );
}
