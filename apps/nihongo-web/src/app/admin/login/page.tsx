import { Suspense } from 'react';
import AdminLoginPage from '@/views/admin/AdminLoginPage';

export default function AdminLoginRoute() {
  return (
    <Suspense fallback={<div className="page-loading">Đang tải...</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
