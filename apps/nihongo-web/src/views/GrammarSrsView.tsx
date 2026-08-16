'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  dueGrammarCards,
  loadGrammarSrs,
  reviewGrammar,
  unpinGrammar,
  type GrammarSrsCard,
} from '../utils/grammarSrs';
import './DrillView.css';

const RATINGS = [
  { quality: 1, label: 'Lại' },
  { quality: 2, label: 'Khó' },
  { quality: 3, label: 'Ổn' },
  { quality: 4, label: 'Dễ' },
] as const;

export default function GrammarSrsView() {
  const [cards, setCards] = useState<GrammarSrsCard[]>(() =>
    typeof window === 'undefined' ? [] : loadGrammarSrs(),
  );
  const due = useMemo(() => cards.filter((c) => c.due <= Date.now()), [cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const current = due[index];

  function rate(quality: number) {
    if (!current) return;
    const next = reviewGrammar(current.id, quality);
    setCards(next);
    setFlipped(false);
    setIndex((i) => {
      const remaining = dueGrammarCards();
      if (!remaining.length) return 0;
      return i >= remaining.length ? 0 : i;
    });
  }

  return (
    <div className="container drill-view">
      <header className="drill-header">
        <h2 className="view-title">SRS ngữ pháp</h2>
        <p className="drill-subtitle">
          Ghim mẫu trên trang Ngữ pháp, rồi ôn theo SM-2 trên máy này.{' '}
          <Link href="/grammar">Mở ngữ pháp</Link>
        </p>
      </header>
      <p className="drill-score">
        Đã ghim {cards.length} · đến hạn {due.length}
      </p>
      {!current && (
        <p>
          {cards.length
            ? 'Hết thẻ đến hạn hôm nay. Quay lại trang ngữ pháp để ghim thêm mẫu.'
            : 'Chưa ghim mẫu nào. Mở một bài ngữ pháp và bấm Ghim ôn.'}
        </p>
      )}
      {current && (
        <div className="drill-card" onClick={() => !flipped && setFlipped(true)} role="button" tabIndex={0}>
          <p className="drill-meta">Bài {current.lessonNumber}</p>
          <p className="drill-prompt japanese-text">{current.pattern}</p>
          {flipped ? (
            <>
              <p className="drill-meta">{current.meaning}</p>
              <div className="drill-options">
                {RATINGS.map((r) => (
                  <button
                    key={r.quality}
                    type="button"
                    className="drill-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      rate(r.quality);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ marginTop: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCards(unpinGrammar(current.id));
                  setFlipped(false);
                }}
              >
                Bỏ ghim
              </button>
            </>
          ) : (
            <p className="drill-meta">Nhấn để xem nghĩa</p>
          )}
        </div>
      )}
    </div>
  );
}
