'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';
import './AdminPages.css';

export default function AdminLoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@nihongo.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace('/admin');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && isAdmin) {
    return (
      <div className="admin-login-page">
        <div className="empty-state glass-panel">
          <p>Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card glass-panel" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p className="admin-login-sub">JWT auth — dùng Swagger để test API</p>

        {error && <p className="admin-error">{error}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="admin-login-links">
          <Link href="/">← Về app học</Link>
          <a href="/api/docs" target="_blank" rel="noreferrer">
            Swagger ↗
          </a>
        </p>
      </form>
    </div>
  );
}
