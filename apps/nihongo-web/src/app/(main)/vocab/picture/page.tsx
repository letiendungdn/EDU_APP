import { Suspense } from 'react';
import PictureDictionaryView from '@/views/PictureDictionaryView';

export default function PictureDictionaryPage() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <PictureDictionaryView />
    </Suspense>
  );
}
