'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { completeKeycloakLogin } from '@/lib/keycloak';
import { resolvePostAuthRedirect } from '@/lib/auth-redirect';
import { ApiError } from '@/types/api';
import '@/views/auth/AuthPages.css';

export default function AuthCallbackPage() {
  const { loginWithOidc, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(resolvePostAuthRedirect(isAdmin ? 'ADMIN' : 'USER', null));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const user = await completeKeycloakLogin();
        const accessToken = user.access_token;
        if (!accessToken) throw new Error('Keycloak không trả access_token');
        const authUser = await loginWithOidc(accessToken, user.id_token);
        if (cancelled) return;
        const redirect = sessionStorage.getItem('kc_post_login_redirect');
        sessionStorage.removeItem('kc_post_login_redirect');
        router.replace(resolvePostAuthRedirect(authUser.role, redirect));
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Đăng nhập Keycloak thất bại',
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, loginWithOidc, router, searchParams]);

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Keycloak</h1>
        {error ? (
          <>
            <p className="auth-error">{error}</p>
            <p className="auth-footer-link">
              <a href="/login">← Quay lại đăng nhập</a>
            </p>
          </>
        ) : (
          <p className="auth-sub">Đang hoàn tất đăng nhập...</p>
        )}
      </div>
    </div>
  );
}
