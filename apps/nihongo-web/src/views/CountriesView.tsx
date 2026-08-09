'use client';

import { useMemo, useState } from 'react';
import type { CountryNameItem } from '../types/reference';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useJapaneseCountryNamesQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import { countryFlagEmoji } from '../utils/countryFlag';
import './CountriesView.css';

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
              <button
                key={`${item.code}-${item.nameJa}`}
                type="button"
                className="country-card"
                onClick={() => playAudio(item.kana)}
              >
                <span className="country-flag" aria-hidden>
                  {countryFlagEmoji(item.code)}
                </span>
                <span className="country-ja">{item.nameJa}</span>
                <span className="country-kana">{item.kana}</span>
                <span className="country-romaji">{item.romaji}</span>
                <span className="country-vi">{item.meaning}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
