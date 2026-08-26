'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { KEIGO_ITEMS, KEIGO_LEVELS } from '../data/keigo';
import { playAudio } from '../utils/speech';
import './DrillView.css';

type Kind = 'sonkei' | 'kenjō';

export default function KeigoView() {
  const [kind, setKind] = useState<Kind>('sonkei');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const item = KEIGO_ITEMS[index];
  const answer = item[kind];

  const options = useMemo(() => {
    const pool = [...new Set(KEIGO_ITEMS.flatMap((row) => [row.sonkei, row.kenjō, row.plain]))];
    const rest = pool.filter((p) => p !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
    return [answer, ...rest].sort(() => Math.random() - 0.5);
  }, [answer]);

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">敬語 — Kính ngữ</h2>
        <p className="drill-subtitle">
          丁寧語 (です・ます), 尊敬語 (tôn người khác), 謙譲語 (hạ mình).{' '}
          <Link href="/practice">Tất cả bài luyện</Link>
        </p>
      </header>
      <div className="practice-grid">
        {KEIGO_LEVELS.map((lv) => (
          <div key={lv.id} className="practice-card">
            <strong>{lv.label}</strong>
            <span className="japanese-text">{lv.example}</span>
            <span>{lv.vi}</span>
          </div>
        ))}
      </div>
      <div className="drill-toolbar">
        <button type="button" className={`tab-btn ${kind === 'sonkei' ? 'active' : ''}`} onClick={() => { setKind('sonkei'); setPicked(null); }}>
          尊敬語
        </button>
        <button type="button" className={`tab-btn ${kind === 'kenjō' ? 'active' : ''}`} onClick={() => { setKind('kenjō'); setPicked(null); }}>
          謙譲語
        </button>
      </div>
      <div className="drill-card">
        <p className="drill-meta">{item.vi}</p>
        <p className="drill-prompt japanese-text">{item.plain}</p>
        <p className="drill-meta">Chọn dạng {kind === 'sonkei' ? 'tôn kính' : 'khiêm nhường'}</p>
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
                onClick={() => setPicked(opt)}
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
      <button
        type="button"
        className="btn btn-nav"
        onClick={() => { setPicked(null); setIndex((i) => (i + 1) % KEIGO_ITEMS.length); }}
      >
        Câu tiếp
      </button>
    </div>
  );
}
