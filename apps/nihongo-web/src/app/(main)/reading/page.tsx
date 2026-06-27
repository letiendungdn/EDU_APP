'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchReadingPassages, type ReadingPassageSummary } from '@/api';

const LEVEL_COLOR: Record<string, string> = {
  N5: '#4ade80', N4: '#60a5fa', N3: '#f59e0b', N2: '#f87171', N1: '#a78bfa',
};

function PassageCard({ p }: { p: ReadingPassageSummary }) {
  return (
    <Link href={`/reading/${p.id}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        {p.jlptLevel && (
          <span style={{
            background: LEVEL_COLOR[p.jlptLevel] ?? '#888',
            color: '#111', borderRadius: 6, padding: '2px 10px',
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            {p.jlptLevel}
          </span>
        )}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          ~{p.estimatedMin} phút · {p._count.questions} câu hỏi
        </span>
      </div>
      <h3 style={{ margin: 0, fontSize: '1rem' }}>{p.title}</h3>
    </Link>
  );
}

export default function ReadingPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['reading-passages'],
    queryFn: () => fetchReadingPassages(),
  });

  const byLevel = data.reduce<Record<string, ReadingPassageSummary[]>>((acc, p) => {
    const key = p.jlptLevel ?? 'Khác';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Đang tải...</div>;

  if (data.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Đọc hiểu</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          Chưa có bài đọc nào. Thêm bài đọc qua Admin hoặc import trực tiếp vào DB.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Đọc hiểu</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Luyện đọc và trả lời câu hỏi theo trình độ JLPT
      </p>
      {Object.entries(byLevel).map(([level, passages]) => (
        <section key={level} style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: LEVEL_COLOR[level] ?? 'inherit' }}>
            {level}
          </h2>
          <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {passages.map((p) => <PassageCard key={p.id} p={p} />)}
          </div>
        </section>
      ))}
    </div>
  );
}
