'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useVocabRangeQuery } from '../hooks/queries';
import { buildHomophoneGroups } from '../utils/homophones';
import { playAudio } from '../utils/speech';
import './DrillView.css';

export default function HomophonesView() {
  const { data = [], isLoading } = useVocabRangeQuery(1, 50);
  const groups = useMemo(() => buildHomophoneGroups(data), [data]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const group = groups[index];
  const target = group?.items.find((i) => i.id === targetId) ?? group?.items[0];

  function grade(id: number) {
    if (picked != null || !target) return;
    setPicked(id);
  }

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">同音異義 — Đồng âm</h2>
        <p className="drill-subtitle">
          Cùng cách đọc, khác chữ/nghĩa. Chọn chữ đúng với nghĩa tiếng Việt.{' '}
          <Link href="/practice">Tất cả bài luyện</Link>
        </p>
      </header>
      {isLoading && <p>Đang tải...</p>}
      {!isLoading && !group && <p>Chưa gom được cặp đồng âm trong Minna 1–50.</p>}
      {group && target && (
        <>
          <p className="drill-score">{index + 1}/{groups.length}</p>
          <div className="drill-card">
            <p className="drill-meta">Đọc: {group.kana}</p>
            <p className="drill-prompt">{target.meaning}</p>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => playAudio(group.kana)}>Nghe</button>
            <div className="drill-options" style={{ marginTop: '1rem' }}>
              {group.items.map((item) => {
                const cls =
                  picked == null
                    ? ''
                    : item.id === target.id
                      ? ' is-correct'
                      : item.id === picked
                        ? ' is-wrong'
                        : '';
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`drill-option japanese-text${cls}`}
                    disabled={picked != null}
                    onClick={() => grade(item.id)}
                  >
                    {item.kanji || group.kana}
                    {picked != null && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 400 }}>{item.meaning}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-nav"
            onClick={() => {
              setPicked(null);
              const next = (index + 1) % groups.length;
              setIndex(next);
              const g = groups[next];
              setTargetId(g?.items[Math.floor(Math.random() * g.items.length)]?.id ?? null);
            }}
          >
            Câu tiếp
          </button>
        </>
      )}
    </div>
  );
}
