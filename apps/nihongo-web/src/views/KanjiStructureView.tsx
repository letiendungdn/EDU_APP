'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import KanjiStructurePanel from '../components/KanjiStructurePanel';
import { isKanji } from '../utils/kanji-structure';

const EXAMPLES = ['語', '休', '明', '森', '好', '聞', '道', '病', '働', '漢', '想', '銀'] as const;

export default function KanjiStructureView({ initialText }: { initialText?: string }) {
  const [input, setInput] = useState(initialText?.trim() || '語');
  const [selected, setSelected] = useState<string | null>(null);

  const chars = useMemo(() => [...new Set([...input].filter(isKanji))], [input]);
  const current = selected && chars.includes(selected) ? selected : (chars[0] ?? null);

  // Giữ chữ đang xem trên URL để chia sẻ được (?c=語)
  useEffect(() => {
    if (!current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('c', current);
    window.history.replaceState(null, '', url);
  }, [current]);

  const pick = (char: string) => {
    setInput(char);
    setSelected(char);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container ks-view">
      <header className="ks-header">
        <h2 className="view-title">Phân tích cấu tạo Kanji</h2>
        <p className="ks-subtitle">
          Tách chữ Hán thành các bộ phận: bộ thủ, phần gợi âm đọc, vị trí trái/phải/trên/dưới. Rê chuột
          vào từng thành phần để tô sáng nét trên chữ. Ở trang từ vựng và kanji, bấm nút{' '}
          <span className="japanese-text">構</span> để xem nhanh. Xem thêm <Link href="/radicals">bộ thủ</Link> ·{' '}
          <Link href="/strokes">tra nét viết</Link>.
        </p>
      </header>

      <section className="ks-panel glass-panel">
        <label className="ks-label" htmlFor="ks-input">
          Chữ / từ cần phân tích
        </label>
        <input
          id="ks-input"
          className="ks-input japanese-text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelected(null);
          }}
          placeholder="Ví dụ: 語, 病院, 勉強…"
          autoComplete="off"
          spellCheck={false}
        />
        <div className="ks-chips">
          <span className="ks-chips-label">Gợi ý:</span>
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="ks-chip japanese-text" onClick={() => pick(ex)}>
              {ex}
            </button>
          ))}
        </div>
        {chars.length > 1 && (
          <div className="ks-tabs" role="tablist" aria-label="Chọn chữ">
            {chars.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={c === current}
                className={`ks-tab japanese-text${c === current ? ' is-active' : ''}`}
                onClick={() => setSelected(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      {current ? (
        <KanjiStructurePanel char={current} onPickChar={pick} />
      ) : (
        <p className="ks-empty">Nhập ít nhất một chữ kanji để phân tích.</p>
      )}

      <p className="ks-credit">
        Dữ liệu nét và cấu tạo:{' '}
        <a href="https://kanjivg.tagaini.net" target="_blank" rel="noreferrer">
          KanjiVG
        </a>{' '}
        (CC BY-SA 3.0).
      </p>
    </div>
  );
}
