'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { playAudio } from '../utils/speech';
import {
  JLPT_LISTENING_ITEMS,
  JLPT_LISTENING_TYPES,
  type JlptListeningType,
} from '../data/jlpt-listening';
import './DrillView.css';

export default function ListeningTypesView() {
  const [kind, setKind] = useState<JlptListeningType | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState({ ok: 0, n: 0 });

  const bank = useMemo(
    () => (kind === 'all' ? JLPT_LISTENING_ITEMS : JLPT_LISTENING_ITEMS.filter((i) => i.type === kind)),
    [kind],
  );
  const current = bank[index];

  function grade(opt: string) {
    if (!current || picked) return;
    setPicked(opt);
    setScore((s) => ({ ok: s.ok + (opt === current.answer ? 1 : 0), n: s.n + 1 }));
  }

  function next() {
    setPicked(null);
    setIndex((i) => (i + 1) % Math.max(bank.length, 1));
  }

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">聴解 — Dạng nghe JLPT</h2>
        <p className="drill-subtitle">
          即時応答・課題理解・ポイント理解・発話表現. Audio dùng TTS.{' '}
          <Link href="/practice">Hub luyện tập</Link>
        </p>
      </header>
      <div className="drill-toolbar">
        <button type="button" className={`tab-btn ${kind === 'all' ? 'active' : ''}`} onClick={() => { setKind('all'); setIndex(0); setPicked(null); }}>
          Tất cả
        </button>
        {JLPT_LISTENING_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${kind === t.id ? 'active' : ''}`}
            onClick={() => { setKind(t.id); setIndex(0); setPicked(null); }}
          >
            {t.ja}
          </button>
        ))}
      </div>
      {current && (
        <>
          <p className="drill-score">{index + 1}/{bank.length} · đúng {score.ok}/{score.n || 0} · {current.typeLabel}</p>
          <div className="drill-card">
            <p className="drill-meta">{current.promptVi}</p>
            <button type="button" className="btn btn-primary" onClick={() => playAudio(current.promptJa)}>
              🔊 Nghe đề
            </button>
            {picked && <p className="drill-prompt japanese-text" style={{ fontSize: '1.15rem' }}>{current.promptJa}</p>}
            <div className="drill-options" style={{ marginTop: '1rem' }}>
              {current.options.map((opt) => {
                const cls =
                  picked == null ? '' : opt === current.answer ? ' is-correct' : opt === picked ? ' is-wrong' : '';
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
          </div>
          <button type="button" className="btn btn-nav" onClick={next} disabled={!picked}>Câu tiếp</button>
        </>
      )}
    </div>
  );
}
