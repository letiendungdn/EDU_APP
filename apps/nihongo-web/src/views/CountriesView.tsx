'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CountryNameItem } from '../types/reference';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useJapaneseCountryNamesQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import { countryFlagEmoji } from '../utils/countryFlag';
import StrokeOrder from '../components/StrokeOrder';
import './CountriesView.css';

function CountryPopup({
  item,
  onClose,
}: {
  item: CountryNameItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="country-popup-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="country-popup" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="country-popup-close" onClick={onClose} aria-label="Đóng">✕</button>

        <div className="country-popup-header">
          <span className="country-popup-flag" aria-hidden>{countryFlagEmoji(item.code)}</span>
          <div className="country-popup-meta">
            <span className="country-popup-ja japanese-text">{item.nameJa}</span>
            <span className="country-popup-kana japanese-text">{item.kana}</span>
            <span className="country-popup-romaji">{item.romaji}</span>
          </div>
        </div>

        <div className="country-popup-stroke">
          <StrokeOrder text={item.nameJa} width={220} height={220} />
          <p className="country-popup-stroke-hint">Nhấn vào chữ để xem lại nét</p>
        </div>

        <p className="country-popup-vi">{item.meaning}</p>

        <button
          type="button"
          className="btn btn-outline country-popup-audio"
          onClick={() => playAudio(item.kana)}
        >
          🔊 Nghe đọc
        </button>
      </div>
    </div>
  );
}

function matchesCountry(item: CountryNameItem, query: string): boolean {
  const haystack = [item.nameJa, item.kana, item.romaji, item.meaning, item.code]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function CountriesView() {
  const { data, isLoading } = useJapaneseCountryNamesQuery();
  const regions = data?.regions ?? [];
  const [activeId, setActiveId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [popupItem, setPopupItem] = useState<CountryNameItem | null>(null);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  const resolvedActiveId = activeId || regions[0]?.id || '';
  const category = regions.find((c) => c.id === resolvedActiveId) ?? regions[0];

  const items = useMemo(() => {
    const source = category?.items ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item) => matchesCountry(item, q));
  }, [category, searchQuery]);

  const handlePlayAll = () => {
    startPlayAll(items.map((item) => item.kana));
  };

  if (isLoading || !category) {
    return (
      <div className="container countries-view">
        <p className="countries-empty">Đang tải tên quốc gia...</p>
      </div>
    );
  }

  return (
    <div className="container countries-view">
      <div className="countries-header">
        <h2 className="view-title countries-view-title">Tên quốc gia</h2>
        <p className="countries-subtitle">
          Học tên quốc gia bằng tiếng Nhật — hầu hết viết bằng <strong>カタカナ</strong>,
          một số nước gần Nhật dùng <strong>漢字</strong> (日本・中国・韓国…). Bấm thẻ để nghe.
        </p>

        <div className="countries-tabs">
          {regions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tab-btn ${resolvedActiveId === cat.id ? 'active' : ''}`}
              onClick={() => {
                stopPlayAll();
                setActiveId(cat.id);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="countries-search">
          <span className="sr-only">Tìm quốc gia</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm: ベトナム, Vietnam, betonamu…"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="countries-panel">
        <div className="countries-hint-box">
          <ul className="countries-hint-list">
            <li>
              Người Nhật thường nói 「〜の人」 cho dân tộc (例: ベトナムの人 = người Việt).
            </li>
            <li>
              Ngôn ngữ: thêm 「語」 — 日本語・ベトナム語・英語…
            </li>
            <li>
              Quốc gia mình: 「私はベトナム人です」 / 「ベトナムから来ました」.
            </li>
          </ul>
        </div>

        <div className="countries-toolbar">
          <span className="countries-count">{items.length} mục</span>
          <PlayAllButton
            isPlaying={isPlayingAll}
            onPlay={handlePlayAll}
            onStop={stopPlayAll}
            label="Phát tất cả"
            disabled={items.length === 0}
          />
        </div>

        {items.length === 0 ? (
          <p className="countries-empty">Không tìm thấy quốc gia phù hợp.</p>
        ) : (
          <div className="countries-grid">
            {items.map((item) => (
              <div
                key={`${item.code}-${item.nameJa}`}
                className="country-card"
                role="button"
                tabIndex={0}
                onClick={() => setPopupItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPopupItem(item); }
                }}
              >
                <button
                  type="button"
                  className="country-audio-btn"
                  title="Nghe phát âm"
                  aria-label="Nghe phát âm"
                  onClick={(e) => { e.stopPropagation(); playAudio(item.kana); }}
                >
                  🔊
                </button>
                <span className="country-flag" aria-hidden>
                  {countryFlagEmoji(item.code)}
                </span>
                <span className="country-ja japanese-text">{item.nameJa}</span>
                <span className="country-kana japanese-text">{item.kana}</span>
                <span className="country-romaji">{item.romaji}</span>
                <span className="country-vi">{item.meaning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {popupItem && (
        <CountryPopup item={popupItem} onClose={() => setPopupItem(null)} />
      )}
    </div>
  );
}
