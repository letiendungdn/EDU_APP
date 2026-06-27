'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLessons, fetchDictationVocab, recordDictationAttempt, type DictationVocab } from '@/api';

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, '');
}

function speak(text: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

export default function DictationPage() {
  const [lessonNumber, setLessonNumber] = useState<number | undefined>();
  const [queue, setQueue] = useState<DictationVocab[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: lessons = [] } = useQuery({ queryKey: ['lessons'], queryFn: fetchLessons });

  const { data: _vocab = [], isLoading, refetch } = useQuery({
    queryKey: ['dictation-vocab', lessonNumber],
    queryFn: () => fetchDictationVocab(lessonNumber, 20),
    enabled: false,
  });

  function startSession() {
    refetch().then(({ data }) => {
      if (!data?.length) return;
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      setIndex(0);
      setScore({ correct: 0, total: 0 });
      setInput('');
      setFeedback(null);
      setRevealed(false);
      setTimeout(() => speak(shuffled[0].kana), 300);
    });
  }

  const current = queue[index];

  useEffect(() => {
    if (feedback === null && current) inputRef.current?.focus();
  }, [feedback, current, index]);

  function check() {
    if (!current || feedback) return;
    const answer = normalize(input);
    const correct =
      answer === normalize(current.kana) ||
      (current.kanji && answer === normalize(current.kanji)) ||
      answer === normalize(current.romaji);

    setFeedback(correct ? 'correct' : 'wrong');
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    recordDictationAttempt(current.id, input, !!correct).catch(() => {});
  }

  function next() {
    if (index + 1 >= queue.length) {
      setIndex(queue.length); // done
    } else {
      setIndex((i) => i + 1);
      setInput('');
      setFeedback(null);
      setRevealed(false);
      setTimeout(() => speak(queue[index + 1].kana), 100);
    }
  }

  const isDone = queue.length > 0 && index >= queue.length;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: 600 }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Nghe chép chính tả</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Nghe âm thanh → gõ lại từ bằng kana, kanji hoặc romaji
      </p>

      {queue.length === 0 && (
        <div className="card">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            Chọn bài học
          </label>
          <select
            value={lessonNumber ?? ''}
            onChange={(e) => setLessonNumber(e.target.value ? +e.target.value : undefined)}
            style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value="">Tất cả bài học</option>
            {lessons.map((l: any) => (
              <option key={l.lessonNumber} value={l.lessonNumber}>
                Bài {l.lessonNumber}{l.title ? ` — ${l.title}` : ''}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={startSession} disabled={isLoading}>
            Bắt đầu luyện tập
          </button>
        </div>
      )}

      {isDone && (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 800 }}>
            {Math.round((score.correct / score.total) * 100)}%
          </div>
          <div style={{ margin: '0.5rem 0 1.5rem', color: 'var(--text-muted)' }}>
            {score.correct}/{score.total} từ đúng
          </div>
          <button className="btn btn-primary" onClick={() => setQueue([])}>
            Luyện lại
          </button>
        </div>
      )}

      {current && !isDone && (
        <div>
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>{index + 1} / {queue.length}</span>
            <span>✅ {score.correct} · ❌ {score.total - score.correct}</span>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem', marginBottom: '1rem' }}>
            {/* Play button */}
            <button
              onClick={() => speak(current.kana)}
              style={{
                fontSize: '2.5rem', background: 'none', border: 'none',
                cursor: 'pointer', marginBottom: '0.5rem', lineHeight: 1,
              }}
              title="Nghe lại"
            >
              🔊
            </button>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nhấn để nghe · nghĩa: <strong>{current.meaning}</strong>
            </div>

            {revealed && (
              <div style={{ marginTop: '0.75rem', fontSize: '1.4rem' }}>
                {current.kanji && <span>{current.kanji} · </span>}
                <span>{current.kana}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> ({current.romaji})</span>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (feedback) next();
                else check();
              }
            }}
            placeholder="Gõ kana, kanji hoặc romaji..."
            disabled={!!feedback}
            style={{
              width: '100%', padding: '0.75rem 1rem', fontSize: '1.1rem',
              borderRadius: 10, border: `2px solid ${feedback === 'correct' ? '#4ade80' : feedback === 'wrong' ? '#f87171' : 'var(--border)'}`,
              background: 'var(--bg)', color: 'var(--text)', boxSizing: 'border-box',
              outline: 'none', marginBottom: '0.75rem',
            }}
          />

          {feedback && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '0.75rem',
              background: feedback === 'correct' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
              color: feedback === 'correct' ? '#4ade80' : '#f87171', fontWeight: 600,
            }}>
              {feedback === 'correct' ? '✅ Chính xác!' : `❌ Sai — đáp án: ${current.kanji ? current.kanji + ' / ' : ''}${current.kana}`}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!feedback && (
              <>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={check} disabled={!input.trim()}>
                  Kiểm tra
                </button>
                <button className="btn" onClick={() => setRevealed(true)} disabled={revealed}>
                  Gợi ý
                </button>
              </>
            )}
            {feedback && (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={next}>
                {index + 1 >= queue.length ? 'Xem kết quả' : 'Từ tiếp theo →'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
