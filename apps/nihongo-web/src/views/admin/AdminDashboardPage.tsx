'use client';

import Link from 'next/link';
import { useAdminStatsQuery } from '../../hooks/queries';
import { getAdminResourceMeta } from '../../config/adminResources';
import './AdminPages.css';

const QUICK_ACTIONS = [
  { href: '/admin/mind-maps', icon: '🗺', label: 'Sơ đồ tư duy', desc: 'Thêm / sửa / xoá / kéo thả nhánh N5–N1' },
  { href: '/admin/flashcard-editor', icon: '🃏', label: 'Flashcard Editor', desc: 'Thiết kế flashcard trực quan' },
  { href: '/admin/worksheet', icon: '📄', label: 'Worksheet Generator', desc: 'Tạo bài tập in ấn A4' },
  { href: '/admin/certificate', icon: '🏆', label: 'Certificate Generator', desc: 'Cấp chứng chỉ hàng loạt' },
  { href: '/admin/import', icon: '📥', label: 'Import từ vựng', desc: 'Nhập dữ liệu bài học' },
  { href: '/admin/messages', icon: '💬', label: 'Hỗ trợ học viên', desc: 'Xử lý tin nhắn hỗ trợ' },
  { href: '/admin/email-templates', icon: '✉️', label: 'Email Templates', desc: 'Quản lý mẫu email' },
];

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useAdminStatsQuery();

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
            Cập nhật: {data?.generatedAt ?? '—'} · Click từng ô để thêm / sửa / xoá
          </p>
        </div>
        <button
          onClick={() => refetch()}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          {isFetching ? 'Đang tải...' : '↻ Làm mới'}
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '24px 0' }}>Đang tải thống kê...</div>
      ) : isError ? (
        <div
          style={{
            color: '#f87171',
            padding: '12px 16px',
            background: 'rgba(248,113,113,0.08)',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          Không tải được dữ liệu. Kiểm tra token / quyền.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 36,
          }}
        >
          {Object.entries(data?.counts ?? {}).map(([key, value]) => {
            const resourceMeta = getAdminResourceMeta(key);
            const meta = resourceMeta
              ? { icon: resourceMeta.icon, href: resourceMeta.href, label: resourceMeta.title }
              : { icon: '📌', href: `/admin/content/${key}`, label: key };
            return (
              <Link key={key} href={meta.href} className="admin-stat-card glass-panel" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{meta.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {String(value)}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 4,
                    textTransform: 'capitalize',
                  }}
                >
                  {meta.label}
                </div>
                <div className="admin-stat-card__cta">Quản lý →</div>
              </Link>
            );
          })}
        </div>
      )}

      <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
        Truy cập nhanh
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
          marginBottom: 36,
        }}
      >
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div
              className="glass-panel"
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '1';
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {a.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data?.recentLessons && data.recentLessons.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 22px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Bài học gần đây
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bài</th>
                  <th>Tiêu đề</th>
                  <th>Từ vựng</th>
                  <th>Ngữ pháp</th>
                  <th>Bài tập</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.recentLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td style={{ fontWeight: 600 }}>#{lesson.lessonNumber}</td>
                    <td>{lesson.title ?? '—'}</td>
                    <td>{lesson._count.vocabularies}</td>
                    <td>{lesson._count.grammars}</td>
                    <td>{lesson._count.exercises}</td>
                    <td>
                      <Link href="/admin/content/lessons" style={{ fontSize: 12 }}>
                        Sửa →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
