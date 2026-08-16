'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useKanjiByJlptQuery } from '../hooks/queries';
import { collectKanjiWords, readingChoices } from '../utils/kanjiInWord';
import { playAudio } from '../utils/speech';
import './DrillView.css';

export default function KanjiInWordView() {
  const [level, setLevel] = useState<'N5' | 'N4'>('N5');
  const { data: entries = [], isLoading } = useKanjiByJlptQuery(level);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });

  const bank = useMemo(() => collectKanjiWords(entries), [entries]);
  const current = bank[index];
  const options = useMemo(
    () => (current ? readingChoices(current, bank) : []),
    [current, bank],
  );

  function grade(opt: string) {
    if (!current || picked) return;
    const answer = current.reading.replace(/-/g, '');
    setPicked(opt);
    setScore((s) => ({ ok: s.ok + (opt === answer ? 1 : 0), n: s.n + 1 }));
  }

  function next() {
    setPicked(null);
    setIndex((i) => (i + 1) % Math.max(bank.length, 1));
  }

  const answer = current?.reading.replace(/-/g, '') ?? '';

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">Kanji đọc trong từ</h2>
        <p className="drill-subtitle">
          Chọn cách đọc đúng của chữ trong từ đó.{' '}
          <Link href="/practice">Tất cả bài luyện</Link>
        </p>
      </header>
      <div className="drill-toolbar">
        {(['N5', 'N4'] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            className={`tab-btn ${level === lv ? 'active' : ''}`}
            onClick={() => { setLevel(lv); setIndex(0); setPicked(null); }}
          >
            {lv}
          </button>
        ))}
      </div>
      {isLoading && <p>Đang tải kanji...</p>}
      {!isLoading && !current && <p>Chưa có từ vựng gắn kanji. Thêm từ liên quan trong trang Kanji.</p>}
      {current && (
        <>
          <p className="drill-score">{index + 1}/{bank.length} · đúng {score.ok}/{score.n || 0}</p>
          <div className="drill-card">
            <p className="drill-meta">{current.meaningVi}</p>
            <p className="drill-prompt japanese-text">
              {current.word.split(current.character).map((chunk, i, arr) => (
                <span key={i}>
                  {chunk}
                  {i < arr.length - 1 && (
                    <span style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                      {current.character}
                    </span>
                  )}
                </span>
              ))}
            </p>
            <p className="drill-meta">Chữ {current.character} trong từ này đọc thế nào?</p>
            <div className="drill-options">
              {options.map((opt) => {
                const cls =
                  picked == null ? '' : opt === answer ? ' is-correct' : opt === picked ? ' is-wrong' : '';
                return (
                  <button
                    key={opt}
                    type="button"
                    className={`drill-option japanese-text${cls}`}
                    disabled={picked != null}
                    onClick={() => grade(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {picked && (
              <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => playAudio(answer)}>
                Nghe
              </button>
            )}
          </div>
          <button type="button" className="btn btn-nav" onClick={next}>Câu tiếp</button>
        </>
      )}
    </div>
  );
}
