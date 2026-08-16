'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { RADICALS } from '../data/radicals';
import './DrillView.css';

export default function RadicalsView() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const current = RADICALS[index];
  const options = useMemo(() => {
    const rest = RADICALS.filter((r) => r.radical !== current.radical)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((r) => r.vi);
    return [current.vi, ...rest].sort(() => Math.random() - 0.5);
  }, [current]);

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">部首 — Bộ thủ</h2>
        <p className="drill-subtitle">
          Nhóm kanji theo bộ để nhớ nhanh hơn. Làm quiz, rồi xem bảng.{' '}
          <Link href="/practice">Tất cả bài luyện</Link>
        </p>
      </header>
      <div className="drill-card">
        <p className="drill-prompt japanese-text">{current.radical}</p>
        <p className="drill-meta japanese-text">{current.reading} · ví dụ {current.examples.join(' ')}</p>
        <p className="drill-meta">Bộ này nghĩa là gì?</p>
        <div className="drill-options">
          {options.map((opt) => {
            const cls =
              picked == null ? '' : opt === current.vi ? ' is-correct' : opt === picked ? ' is-wrong' : '';
            return (
              <button
                key={opt}
                type="button"
                className={`drill-option${cls}`}
                disabled={picked != null}
                onClick={() => setPicked(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <button type="button" className="btn btn-nav" onClick={() => { setPicked(null); setIndex((i) => (i + 1) % RADICALS.length); }}>
        Câu tiếp
      </button>
      <div className="radical-grid">
        {RADICALS.map((r) => (
          <div key={r.radical} className="radical-card">
            <div className="jp japanese-text">{r.radical}</div>
            <div className="japanese-text">{r.reading}</div>
            <div>{r.vi}</div>
            <div className="japanese-text" style={{ marginTop: 6 }}>{r.examples.join(' ')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
