'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthMeQuery } from '@/hooks/queries';
import { getStoredToken } from '@/lib/api-client';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = getStoredToken();
  const { data: user, isLoading, isError } = useAuthMeQuery(!!token);

  useEffect(() => {
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    if (!isLoading && (isError || !user)) {
      router.replace('/admin/login');
      return;
    }
    if (!isLoading && user && user.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [token, isLoading, isError, user, router]);

  if (!token || isLoading) {
    return (
      <div className="container">
        <div className="empty-state glass-panel">
          <p>Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (isError || !user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
