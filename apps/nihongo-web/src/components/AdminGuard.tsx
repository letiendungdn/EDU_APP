'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthMeQuery } from '@/hooks/queries';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, user: sessionUser, isAdmin, isAuthenticated } = useAuth();
  const needsFetch = isAuthenticated && !!token && !sessionUser;
  const { data: fetchedUser, isLoading, isError } = useAuthMeQuery(needsFetch);

  const user = sessionUser ?? fetchedUser;

  useEffect(() => {
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    if (needsFetch && isLoading) {
      return;
    }
    if (isError || !user) {
      router.replace('/admin/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.replace('/admin/login?reason=forbidden');
    }
  }, [token, needsFetch, isLoading, isError, user, router]);

  if (!token || (needsFetch && isLoading)) {
    return (
      <div className="container">
        <div className="empty-state glass-panel">
          <p>Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (isError || !user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
