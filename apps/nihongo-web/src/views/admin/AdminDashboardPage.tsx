'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { useAdminStatsQuery } from '../../hooks/queries';
import './AdminPages.css';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useAdminStatsQuery();

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar glass-panel">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Xin chào, {user?.name ?? user?.email} ·{' '}
            <a href="/api/docs" target="_blank" rel="noreferrer">
              Swagger API ↗
            </a>
          </p>
        </div>
        <div className="admin-topbar-actions">
          <Link href="/admin/import" className="btn btn-outline">
            Import từ vựng
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => refetch()}>
            {isFetching ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Đăng xuất
          </button>
          <Link href="/" className="btn btn-primary">
            App học
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="empty-state glass-panel">
          <p>Đang tải thống kê...</p>
        </div>
      ) : isError ? (
        <div className="empty-state glass-panel">
          <p>Không tải được dữ liệu admin. Kiểm tra token / quyền.</p>
        </div>
      ) : (
        <>
          <section className="admin-stats-grid">
            {Object.entries(data?.counts ?? {}).map(([key, value]) => (
              <div key={key} className="admin-stat-card glass-panel">
                <span className="admin-stat-label">{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>

          <section className="glass-panel admin-recent">
            <h2>Bài học gần đây</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Bài</th>
                  <th>Tiêu đề</th>
                  <th>Từ vựng</th>
                  <th>Ngữ pháp</th>
                  <th>Bài tập</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentLessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.lessonNumber}</td>
                    <td>{lesson.title ?? '—'}</td>
                    <td>{lesson._count.vocabularies}</td>
                    <td>{lesson._count.grammars}</td>
                    <td>{lesson._count.exercises}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="admin-meta">Cập nhật: {data?.generatedAt}</p>
          </section>
        </>
      )}
    </div>
  );
}
