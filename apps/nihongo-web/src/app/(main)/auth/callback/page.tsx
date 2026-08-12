import { Suspense } from 'react';
import AuthCallbackPage from '@/views/auth/AuthCallbackPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <AuthCallbackPage />
    </Suspense>
  );
}
