'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const englishAppUrl = process.env.NEXT_PUBLIC_ENGLISH_APP_URL ?? 'http://localhost:3001';

const navItems = [
  { href: '/', label: 'Home', end: true },
  { href: '/kana', label: 'Kana' },
  { href: '/pronunciation', label: 'Phát âm' },
  { href: '/daily-listening', label: 'Nghe' },
  { href: '/notes', label: 'Hằng ngày' },
  { href: '/vocab', label: 'Vocabulary' },
  { href: '/vocab/picture', label: 'Từ điển tranh' },
  { href: '/vocab-review', label: 'Từ sai' },
  { href: '/grammar', label: 'Grammar' },
  { href: '/kanji', label: 'Kanji' },
  { href: '/counters', label: 'Đếm số' },
  { href: '/jlpt', label: 'JLPT' },
  { href: '/mock-exam', label: 'Thi thử' },
  { href: '/quiz', label: 'Quiz' },
  { href: '/reading', label: 'Đọc hiểu' },
  { href: '/dictation', label: 'Nghe chép' },
  { href: '/analytics', label: 'Tiến độ' },
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

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="container header-content">
          <Link href="/" className="logo">
            <span className="logo-icon">🇯🇵</span>
            Nihongo Learn
          </Link>
          <nav className="nav-links">
            {navItems.map(({ href, label, end }) => (
              <NavItem key={href} href={href} label={label} end={end} />
            ))}
            <a href={englishAppUrl} className="nav-link app-switcher">
              🇬🇧 English
            </a>
          </nav>
        </div>
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
