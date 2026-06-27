'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { fetchAnalytics } from '@/api';
import { useAuth } from '@/hooks/useAuth';

function fmtSeconds(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}g ${m}p` : `${m} phút`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// GitHub-style heatmap (52 tuần × 7 ngày)
function Heatmap({ data }: { data: { date: string; seconds: number }[] }) {
  const map = new Map(data.map((d) => [d.date.slice(0, 10), d.seconds]));
  const today = new Date();
  const cells: { date: string; seconds: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, seconds: map.get(key) ?? 0 });
  }

  function color(s: number) {
    if (s === 0) return 'var(--border)';
    if (s < 300) return '#166534';
    if (s < 900) return '#16a34a';
    if (s < 1800) return '#4ade80';
    return '#86efac';
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 600 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${fmtSeconds(cell.seconds)}`}
                style={{ width: 12, height: 12, borderRadius: 2, background: color(cell.seconds), cursor: 'default' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Ít
        {[0, 300, 900, 1800, 3600].map((s) => (
          <div key={s} style={{ width: 12, height: 12, borderRadius: 2, background: color(s) }} />
        ))}
        Nhiều
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchAnalytics(token!),
    enabled: !!token,
  });

  if (!token) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Tiến độ học</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Đăng nhập để xem tiến độ học của bạn.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Đang tải...</div>;
  if (error || !data) return <div className="container" style={{ padding: '2rem' }}>Không thể tải dữ liệu.</div>;

  const { overview, studySessions, examHistory, listeningHistory } = data;

  // Chuẩn bị data cho charts — last 30 days
  const last30Study = studySessions.slice(-30).map((s) => ({
    date: fmtDate(s.date as unknown as string),
    'Phút học': Math.round(s.seconds / 60),
  }));

  const last30Listening = listeningHistory.slice(-30).map((s) => ({
    date: fmtDate(s.date as unknown as string),
    'Phút nghe': Math.round(s.seconds / 60),
  }));

  const examChartData = examHistory.map((e) => ({
    date: fmtDate(e.submittedAt),
    Điểm: Math.round(e.percent),
    level: e.level.toUpperCase(),
  }));

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Tiến độ học</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>Thống kê toàn bộ quá trình học</p>

      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <StatCard label="Tổng thời gian học" value={fmtSeconds(overview.totalStudySeconds)} />
        <StatCard label="Tổng thời gian nghe" value={fmtSeconds(overview.totalListeningSeconds)} />
        <StatCard label="Từ đã thuộc" value={String(overview.masteredVocab)} />
        <StatCard label="Bài thi đã làm" value={String(overview.totalExams)} sub={`${overview.passedExams} lần đạt`} />
      </div>

      {/* Heatmap thời gian học */}
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Lịch học (365 ngày qua)</h2>
        <Heatmap data={studySessions.map((s) => ({ date: s.date as unknown as string, seconds: s.seconds }))} />
      </section>

      {/* Chart thời gian học 30 ngày */}
      {last30Study.length > 0 && (
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Thời gian học (30 ngày)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last30Study}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="p" />
              <Tooltip formatter={(v) => [`${v} phút`, 'Học']} />
              <Bar dataKey="Phút học" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Chart nghe */}
      {last30Listening.length > 0 && (
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Thời gian nghe (30 ngày)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last30Listening}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="p" />
              <Tooltip formatter={(v) => [`${v} phút`, 'Nghe']} />
              <Bar dataKey="Phút nghe" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Lịch sử thi */}
      {examChartData.length > 0 && (
        <section className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Lịch sử thi mock exam</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={examChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, 'Điểm']} />
              <Legend />
              <Line type="monotone" dataKey="Điểm" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          {/* Pass line */}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Ngưỡng đạt: N5 ≥ 60% · N4 ≥ 65%
          </p>
        </section>
      )}

      {examChartData.length === 0 && last30Study.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          Chưa có dữ liệu. Học và luyện tập để xem thống kê ở đây!
        </div>
      )}
    </div>
  );
}
