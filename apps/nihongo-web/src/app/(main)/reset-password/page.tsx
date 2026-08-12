import { Suspense } from 'react';
import ResetPasswordPage from '@/views/auth/ResetPasswordPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="auth-page">Đang tải...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
