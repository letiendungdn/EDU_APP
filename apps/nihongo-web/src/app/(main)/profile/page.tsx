import { Suspense } from 'react';
import ProfilePage from '@/views/auth/ProfilePage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <ProfilePage />
    </Suspense>
  );
}
