'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/api';
import { ApiError } from '@/types/api';
import '@/views/auth/AuthPages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Không gửi được yêu cầu',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <h1>Quên mật khẩu</h1>
        <p className="auth-sub">
          Nhập email đăng ký bằng mật khẩu. Nếu tài khoản hợp lệ, bạn sẽ nhận link đặt lại
          (Brevo).
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error ? <p className="auth-error">{error}</p> : null}
          {message ? <p className="auth-sub">{message}</p> : null}
          <div className="auth-field">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
          </button>
        </form>
        <p className="auth-footer-link">
          <Link href="/login">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
