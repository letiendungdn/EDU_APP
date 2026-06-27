'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchReadingPassage, submitReading, type ReadingResult } from '@/api';

export default function ReadingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: passage, isLoading } = useQuery({
    queryKey: ['reading-passage', id],
    queryFn: () => fetchReadingPassage(+id),
  });

  if (isLoading) return <div className="container" style={{ padding: '2rem' }}>Đang tải...</div>;
  if (!passage) return <div className="container" style={{ padding: '2rem' }}>Không tìm thấy bài đọc.</div>;

  const allAnswered = passage.questions.every((q) => answers[q.id] !== undefined);

  async function handleSubmit() {
    if (!allAnswered || !passage) return;
    setSubmitting(true);
    try {
      const res = await submitReading(passage.id, answers);
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: 760 }}>
      <Link href="/reading" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        ← Danh sách bài đọc
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1rem 0 0.25rem' }}>
        {passage.jlptLevel && (
          <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
            {passage.jlptLevel}
          </span>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>~{passage.estimatedMin} phút</span>
      </div>

      <h1 style={{ marginBottom: '1.25rem' }}>{passage.title}</h1>

      {/* Nội dung bài đọc */}
      <div className="card" style={{ marginBottom: '2rem', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
        {passage.content}
        {passage.source && (
          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Nguồn: {passage.source}
          </p>
        )}
      </div>

      {/* Câu hỏi */}
      {!result ? (
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Câu hỏi ({passage.questions.length})</h2>
          {passage.questions.map((q, idx) => (
            <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                {idx + 1}. {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {q.options.map((opt) => (
                  <label key={opt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                    background: answers[q.id] === opt.text ? 'var(--accent-soft)' : 'transparent',
                    border: `1px solid ${answers[q.id] === opt.text ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.text}
                      checked={answers[q.id] === opt.text}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.text }))}
                    />
                    {opt.text}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn btn-primary"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? 'Đang chấm...' : 'Nộp bài'}
          </button>
        </div>
      ) : (
        /* Kết quả */
        <div>
          <div className="card" style={{
            textAlign: 'center', marginBottom: '1.5rem', padding: '2rem',
            background: result.percent >= 60 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 800 }}>{result.percent}%</div>
            <div style={{ fontSize: '1.1rem', marginTop: '0.25rem' }}>
              {result.correct}/{result.total} câu đúng
            </div>
            <div style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
              {result.percent >= 60 ? '✅ Đạt' : '❌ Chưa đạt'}
            </div>
          </div>

          {passage.questions.map((q, idx) => {
            const r = result.results.find((x) => x.questionId === q.id);
            return (
              <div key={q.id} className="card" style={{
                marginBottom: '0.75rem',
                borderLeft: `4px solid ${r?.correct ? '#4ade80' : '#f87171'}`,
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{idx + 1}. {q.question}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Đáp án: <strong>{r?.correctAnswer}</strong>
                  {!r?.correct && <span style={{ color: '#f87171' }}> · Bạn chọn: {answers[q.id]}</span>}
                </p>
                {r?.explanation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    💡 {r.explanation}
                  </p>
                )}
              </div>
            );
          })}

          <button className="btn" onClick={reset} style={{ marginTop: '0.5rem' }}>
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}
