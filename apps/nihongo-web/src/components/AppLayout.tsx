'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import AuthHeader from '@/components/AuthHeader';
import EnglishAppSwitcher from '@/components/EnglishAppSwitcher';
import { useAutoHideHeader } from '@/hooks/useAutoHideHeader';

const HEADER_COLLAPSED_KEY = 'nihongo-header-collapsed';

const navItems = [
  { href: '/', label: 'Home', end: true },
  { href: '/kana', label: 'Kana' },
  { href: '/pronunciation', label: 'Phát âm' },
  { href: '/pronunciation-rules', label: 'Quy tắc' },
  { href: '/english-katakana', label: 'EN↔カナ' },
  { href: '/daily-listening', label: 'Nghe' },
  { href: '/book-audio', label: 'File nghe' },
  { href: '/notes', label: 'Hằng ngày' },
  { href: '/vocab', label: 'Vocabulary' },
  { href: '/vocab/picture', label: 'Từ điển tranh' },
  { href: '/vocab-review', label: 'Từ sai' },
  { href: '/grammar', label: 'Grammar' },
  { href: '/kanji', label: 'Kanji' },
  { href: '/kanji/list', label: 'Bảng kanji' },
  { href: '/counters', label: 'Đếm số' },
  { href: '/jlpt', label: 'JLPT' },
  { href: '/mock-exam', label: 'Thi thử' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/reading', label: 'Đọc hiểu' },
  { href: '/dictation', label: 'Nghe chép' },
  { href: '/analytics', label: 'Tiến độ' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/community', label: 'Cộng đồng' },
  { href: '/support', label: 'Hỗ trợ' },
];

function NavItem({ href, label, end }: { href: string; label: string; end?: boolean }) {
  const pathname = usePathname() ?? '';
  const isActive = end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={`nav-link${isActive ? ' active' : ''}`}>
      {label}
    </Link>
  );
}

function HeaderToggleIcon({ up }: { up: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  const isAuthScreen = pathname === '/login' || pathname === '/profile';
  const headerRef = useRef<HTMLElement>(null);
  const [manualCollapsed, setManualCollapsed] = useState(false);

  useEffect(() => {
    setManualCollapsed(localStorage.getItem(HEADER_COLLAPSED_KEY) === '1');
  }, []);

  const autoHidden = useAutoHideHeader(!isAuthScreen && !manualCollapsed);
  const headerHidden = !manualCollapsed && autoHidden;

  const toggleCollapsed = () => {
    setManualCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(HEADER_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  };

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${el.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(el);
    window.addEventListener('resize', syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncHeaderHeight);
    };
  }, [isAuthScreen, manualCollapsed]);

  return (
    <div className="app-container">
      <header
        ref={headerRef}
        className={`app-header${isAuthScreen ? ' app-header--compact' : ''}${
          headerHidden ? ' app-header--hidden' : ''
        }${manualCollapsed && !isAuthScreen ? ' app-header--collapsed' : ''}`}
      >
        {manualCollapsed && !isAuthScreen ? (
          <div className="container header-mini">
            <Link href="/" className="logo logo--mini">
              <span className="logo-icon">🇯🇵</span>
              Nihongo Learn
            </Link>
            <button
              type="button"
              className="header-toggle-btn"
              onClick={toggleCollapsed}
              aria-expanded={false}
              aria-label="Mở menu điều hướng"
            >
              <HeaderToggleIcon up={false} />
              <span>Menu</span>
            </button>
          </div>
        ) : (
          <>
            <div className="container header-content">
              <Link href="/" className="logo">
                <span className="logo-icon">🇯🇵</span>
                Nihongo Learn
              </Link>
              <nav className="nav-links">
                {!isAuthScreen &&
                  navItems.map(({ href, label, end }) => (
                    <NavItem key={href} href={href} label={label} end={end} />
                  ))}
                <EnglishAppSwitcher />
                <AuthHeader />
              </nav>
            </div>
            {!isAuthScreen && (
              <button
                type="button"
                className="header-toggle-btn header-toggle-btn--collapse"
                onClick={toggleCollapsed}
                aria-expanded
                aria-label="Thu gọn menu điều hướng"
                title="Thu gọn menu"
              >
                <HeaderToggleIcon up />
              </button>
            )}
          </>
        )}
      </header>

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <div className="container">
          <p>
            © {new Date().getFullYear()} Nihongo Learn. Built for Japanese mastery. ·{' '}
            <Link href="/admin/login">Admin</Link> ·{' '}
            <a href="/api/docs" target="_blank" rel="noreferrer">
              Swagger
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
