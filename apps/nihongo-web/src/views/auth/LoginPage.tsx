'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAuth } from '@/hooks/useAuth';
import { resolvePostAuthRedirect } from '@/lib/auth-redirect';
import { ApiError } from '@/types/api';
import './AuthPages.css';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const { login, register, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'login',
  );

  const switchMode = (next: AuthMode) => {
    setMode(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'register') {
      params.set('mode', 'register');
    } else {
      params.delete('mode');
    }
    const qs = params.toString();
    router.replace(qs ? `/login?${qs}` : '/login', { scroll: false });
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    router.replace(resolvePostAuthRedirect(isAdmin ? 'ADMIN' : 'USER', redirectTo));
  }, [isAuthenticated, isAdmin, redirectTo, router]);

  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'login');
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const authUser =
        mode === 'register'
          ? await register(email, password)
          : await login(email, password);
      router.push(resolvePostAuthRedirect(authUser.role, redirectTo));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Thất bại',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (role: string) => {
    router.push(resolvePostAuthRedirect(role, redirectTo));
  };

  if (isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="empty-state glass-panel">Đang chuyển hướng...</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>{mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
        <p className="auth-sub">
          {mode === 'register'
            ? 'Dùng Gmail để đăng ký nhanh, hoặc email + mật khẩu bên dưới'
            : 'Đăng nhập bằng Gmail hoặc email để đồng bộ tiến độ học'}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab${mode === 'register' ? ' active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Đăng ký
          </button>
        </div>

        <GoogleSignInButton mode={mode} onError={setError} onSuccess={handleGoogleSuccess} />

        <div className="auth-divider">hoặc dùng email{mode === 'register' ? ' & mật khẩu' : ''}</div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <div className="auth-field">
            <label>
              Mật khẩu
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                placeholder="Tối thiểu 8 ký tự"
                minLength={8}
                required
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading
              ? 'Đang xử lý...'
              : mode === 'register'
                ? 'Tạo tài khoản'
                : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footer-link">
          <Link href="/">← Về trang chủ</Link>
        </p>
      </div>
    </div>
  );
}
