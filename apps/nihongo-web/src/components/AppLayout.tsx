'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import AuthHeader from '@/components/AuthHeader';
import EnglishAppSwitcher from '@/components/EnglishAppSwitcher';
import PageBannerControl from '@/components/PageBannerControl';
import { useTheme } from '@/lib/theme';
import { bannerBackgroundStyle } from '@/utils/pageBanner';
import { usePageBanner } from '@/hooks/usePageBanner';

// ── Nav structure ──────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Học',
    items: [
      { href: '/kana',      icon: 'あ',  label: 'Kana' },
      { href: '/vocab',     icon: '単',  label: 'Từ vựng' },
      { href: '/grammar',   icon: '文',  label: 'Ngữ pháp' },
      { href: '/kanji',     icon: '漢',  label: 'Kanji' },
      { href: '/strokes',   icon: '筆',  label: 'Tra nét viết' },
      { href: '/counters',  icon: '①',  label: 'Đếm số' },
    ],
  },
  {
    label: 'Phát âm',
    items: [
      { href: '/pronunciation',       icon: '🎤', label: 'Luyện phát âm' },
      { href: '/pronunciation-rules', icon: '📖', label: 'Quy tắc phát âm' },
      { href: '/tts',                 icon: '🔊', label: 'Đọc văn bản' },
      { href: '/stt',                 icon: '🎙️', label: 'Ghi âm → chữ' },
      { href: '/english-katakana',    icon: 'EN', label: 'EN ↔ カナ' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { href: '/daily-listening', icon: '🎧', label: 'Nghe mỗi ngày' },
      { href: '/book-audio',      icon: '📻', label: 'File nghe sách' },
      { href: '/reading',         icon: '📰', label: 'Đọc hiểu' },
      { href: '/dictation',       icon: '✍️', label: 'Nghe chép' },
      { href: '/notes',           icon: '📝', label: 'Ghi chú ngày' },
    ],
  },
  {
    label: 'Luyện tập',
    items: [
      { href: '/srs',              icon: '🧠', label: 'SRS — Thẻ ghi nhớ' },
      { href: '/sentence-practice',icon: '✍️', label: 'Luyện câu AI' },
      { href: '/vocab/picture',    icon: '🖼️', label: 'Từ điển tranh' },
      { href: '/vocab-review',     icon: '🔄', label: 'Từ sai' },
      { href: '/quiz',             icon: '✏️', label: 'Quiz' },
      { href: '/mock-exam',        icon: '📋', label: 'Thi thử JLPT' },
      { href: '/jlpt',             icon: '🎯', label: 'Lộ trình JLPT' },
      { href: '/analytics',        icon: '📊', label: 'Tiến độ' },
    ],
  },
  {
    label: 'Công cụ',
    items: [
      { href: '/tools',          icon: '🎨', label: 'Canvas Tools' },
      { href: '/kanji-practice', icon: '✏️', label: 'Luyện viết Kanji' },
      { href: '/whiteboard',     icon: '🖊',  label: 'Bảng trắng' },
      { href: '/worksheet',      icon: '📄', label: 'Tạo bài tập' },
      { href: '/japan-map',      icon: '🗾', label: 'Bản đồ Nhật Bản' },
    ],
  },
  {
    label: 'Khác',
    items: [
      { href: '/community', icon: '👥', label: 'Cộng đồng' },
      { href: '/support',   icon: '💬', label: 'Hỗ trợ' },
      { href: '/pricing',   icon: '⚡', label: 'Nâng cấp' },
    ],
  },
] as const;

// ── Nav item ───────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  exact,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname() ?? '';
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`nav-item${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      <span className="nav-item__icon">{icon}</span>
      {label}
    </Link>
  );
}

// ── Theme toggle ───────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Đổi chủ đề">
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span>{isDark ? 'Chế độ sáng' : 'Chế độ tối'}</span>
    </button>
  );
}

// ── Hamburger icon ─────────────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="7"  x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname  = usePathname() ?? '';
  const isAuth    = pathname === '/login' || pathname === '/profile';
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const { bannerUrl } = usePageBanner();

  const close = useCallback(() => setOpen(false), []);

  // Close on route change
  useEffect(() => { close(); }, [pathname, close]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  if (isAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile hamburger */}
      <button
        className="sidebar-toggle"
        onClick={() => setOpen((p) => !p)}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
      >
        <HamburgerIcon open={open} />
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay${open ? ' open' : ''}`}
        onClick={close}
        aria-hidden
      />

      {/* Sidebar */}
      <aside ref={sidebarRef} className={`app-sidebar${open ? ' open' : ''}`}>
        {/* Logo */}
        <Link href="/" className="app-sidebar__logo">
          <div className="app-sidebar__logo-icon">🇯🇵</div>
          <div>
            <div className="app-sidebar__logo-text">Nihongo</div>
            <div className="app-sidebar__logo-sub">Learn Japanese</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="app-sidebar__nav" aria-label="Main navigation">
          {/* Home */}
          <NavItem href="/" icon="🏠" label="Trang chủ" exact onClick={close} />

          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-group__label">{group.label}</div>
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClick={close}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom: theme toggle + app switcher + auth */}
        <div className="app-sidebar__bottom">
          <ThemeToggle />
          <EnglishAppSwitcher />
          <AuthHeader />
        </div>
      </aside>

      {/* Main content */}
      <div
        className={`app-content${bannerUrl ? ' app-content--custom-banner' : ''}`}
        style={bannerUrl ? bannerBackgroundStyle(bannerUrl, theme) : undefined}
      >
        <main className="app-main">{children}</main>
        <footer className="app-footer">
          <div className="container">
            <p>
              © {new Date().getFullYear()} Nihongo Learn ·{' '}
              <Link href="/admin/login">Admin</Link> ·{' '}
              <a href="/api/docs" target="_blank" rel="noreferrer">API</a>
            </p>
          </div>
        </footer>
        <PageBannerControl />
      </div>
    </div>
  );
}
