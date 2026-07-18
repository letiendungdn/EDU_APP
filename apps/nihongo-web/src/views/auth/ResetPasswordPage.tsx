'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/api';
import { ApiError } from '@/types/api';
import '@/views/auth/AuthPages.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Thiếu token đặt lại mật khẩu');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      router.replace('/login?reset=1');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Không đặt lại được mật khẩu',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Đặt lại mật khẩu</h1>
        <p className="auth-sub">Nhập mật khẩu mới (tối thiểu 8 ký tự).</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error ? <p className="auth-error">{error}</p> : null}
          {!token ? (
            <p className="auth-error">Link không hợp lệ. Hãy yêu cầu lại từ trang quên mật khẩu.</p>
          ) : null}
          <div className="auth-field">
            <label>
              Mật khẩu mới
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>
          <div className="auth-field">
            <label>
              Xác nhận mật khẩu
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading || !token}
          >
            {loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
        <p className="auth-footer-link">
          <Link href="/login">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
