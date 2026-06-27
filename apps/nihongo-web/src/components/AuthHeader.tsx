'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import '@/views/auth/AuthPages.css';

export default function AuthHeader() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  if (!isAuthenticated || !user) {
    if (pathname === '/login') {
      return null;
    }

    return (
      <div className="auth-header auth-header--guest">
        <Link href="/login" className="btn btn-primary btn-sm auth-header-cta">
          Đăng nhập / Đăng ký
        </Link>
      </div>
    );
  }

  const label = user.name?.trim() || user.email.split('@')[0];
  const initials = label.slice(0, 1).toUpperCase();

  return (
    <div className="auth-header">
      <Link href="/profile" className="auth-user-chip" title="Hồ sơ cá nhân">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="auth-avatar" />
        ) : (
          <span className="auth-avatar">{initials}</span>
        )}
        <span className="auth-user-name">{label}</span>
      </Link>
      {isAdmin && (
        <Link href="/admin" className="btn btn-outline btn-sm">
          Admin
        </Link>
      )}
      <Link href="/support" className="btn btn-outline btn-sm">
        Hỗ trợ
      </Link>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => void handleLogout()}>
        Đăng xuất
      </button>
    </div>
  );
}
