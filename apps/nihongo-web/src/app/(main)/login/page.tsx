import { Suspense } from 'react';
import LoginPage from '@/views/auth/LoginPage';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <LoginPage />
    </Suspense>
  );
}
