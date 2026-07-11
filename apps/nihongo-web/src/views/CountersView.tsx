'use client';

import { useState } from 'react';
import { playAudio } from '../utils/speech';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useJapaneseCountersQuery } from '../hooks/queries';
import type { CounterItem } from '../types/reference';
import { counterHintBullets } from '../utils/counter-hint';
import './CountersView.css';

export default function CountersView() {
  const { data, isLoading } = useJapaneseCountersQuery();
  const counterCategories = data?.categories ?? [];
  const [activeId, setActiveId] = useState('');
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  const resolvedActiveId = activeId || counterCategories[0]?.id || '';
  const category =
    counterCategories.find((c) => c.id === resolvedActiveId) ?? counterCategories[0];

  if (isLoading || !category) {
    return (
      <div className="container counters-view">
        <p className="counters-empty">Đang tải dữ liệu đếm số...</p>
      </div>
    );
  }

  const hintBullets = counterHintBullets(category.hint);

  const handlePlayAll = () => {
    startPlayAll(category.items.map((item) => item.kana));
  };

  const playItem = (kana: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    playAudio(kana);
  };

  return (
    <div className="container counters-view">
      <div className="counters-header">
        <h2 className="view-title counters-view-title">Đếm số & thứ tự</h2>
        <p className="counters-subtitle">
          Tiếng Nhật dùng nhiều chất đếm khác nhau tùy loại sự vật. Chọn chủ đề bên dưới để học.
        </p>

        <div className="counters-tabs">
          {counterCategories.map((cat) => (
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
      </div>

      <div className="counters-panel">
        <div className="counters-hint-box">
          <ul className="counters-hint-list">
            {hintBullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="counters-play-top">
          <PlayAllButton
            isPlaying={isPlayingAll}
            onPlay={handlePlayAll}
            onStop={stopPlayAll}
            label="Phát tất cả"
          />
        </div>

        <div className="counters-grid">
          {(category.items as CounterItem[]).map((item) => (
            <div
              key={`${category.id}-${item.n}-${item.kana}`}
              className="counter-card"
              role="button"
              tabIndex={0}
              onClick={() => playAudio(item.kana)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  playAudio(item.kana);
                }
              }}
            >
              <span className="counter-num">{item.n}</span>
              <button
                type="button"
                className="counter-audio-btn"
                title="Nghe phát âm"
                aria-label="Nghe phát âm"
                onClick={(e) => playItem(item.kana, e)}
              >
                🔊
              </button>
              {item.kanji ? (
                <span className="counter-kanji japanese-text">{item.kanji}</span>
              ) : null}
              <span className="counter-kana japanese-text">{item.kana}</span>
              <span className="counter-romaji">{item.romaji}</span>
              <span className="counter-vi">{item.vi}</span>
            </div>
          ))}
        </div>

        <div className="counters-play-bottom">
          <PlayAllButton
            isPlaying={isPlayingAll}
            onPlay={handlePlayAll}
            onStop={stopPlayAll}
            label="Phát toàn bộ bài học"
          />
        </div>
      </div>
    </div>
  );
}
