'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { VocabSuffixItem } from '../types/reference';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useJapaneseVocabSuffixesQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import { groupsFromPayload, setSetsubigoCatalog } from '../utils/setsubigo';
import './SuffixesView.css';

function matchesSuffix(item: VocabSuffixItem, query: string): boolean {
  const haystack = [
    item.suffix,
    ...(item.forms ?? []),
    item.kana,
    item.romaji,
    item.meaning,
    item.attachesTo,
    item.exampleJa,
    item.exampleVi,
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function itemKey(categoryId: string, item: VocabSuffixItem): string {
  return `${categoryId}-${item.suffix}-${item.kana}`;
}

export default function SuffixesView() {
  const { data, isLoading } = useJapaneseVocabSuffixesQuery();
  const groups = data?.groups ?? [];
  const [activeId, setActiveId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  useEffect(() => {
    if (data) setSetsubigoCatalog(groupsFromPayload(data));
  }, [data]);

  const resolvedActiveId = activeId || groups[0]?.id || '';
  const category = groups.find((g) => g.id === resolvedActiveId) ?? groups[0];

  const items = useMemo(() => {
    const source = category?.items ?? [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item) => matchesSuffix(item, q));
  }, [category, searchQuery]);

  const handlePlayAll = () => {
    startPlayAll(items.map((item) => item.kana));
  };

  const selectAndSpeak = (key: string, text: string) => {
    setSelectedKey(key);
    void playAudio(text);
  };

  if (isLoading || !category) {
    return (
      <div className="container suffixes-view">
        <p className="suffixes-empty">Đang tải hậu tố từ vựng...</p>
      </div>
    );
  }

  return (
    <div className="container suffixes-view">
      <div className="suffixes-header">
        <h2 className="view-title suffixes-view-title">Hậu tố từ vựng</h2>
        <p className="suffixes-subtitle">
          Học <strong>接尾語（せつびご）</strong> — mảnh gắn sau từ để đổi nghĩa:{' '}
          さん・的・中・たち・やすい… Bấm thẻ để nghe. Từ vựng Minna theo danh / tính / động từ
          xem tại <Link href="/word-classes">Loại từ</Link>.
        </p>

        <div className="suffixes-tabs">
          {groups.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`tab-btn ${resolvedActiveId === cat.id ? 'active' : ''}`}
              onClick={() => {
                stopPlayAll();
                setActiveId(cat.id);
                setSelectedKey(null);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <label className="suffixes-search">
          <span className="sr-only">Tìm hậu tố</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm: さん, teki, quá, người…"
            autoComplete="off"
          />
        </label>
      </div>

      <div className="suffixes-panel">
        <div className="suffixes-hint-box">
          <p className="suffixes-hint-text">{category.hint}</p>
        </div>

        <div className="suffixes-toolbar">
          <span className="suffixes-count">{items.length} mục</span>
          <PlayAllButton
            isPlaying={isPlayingAll}
            onPlay={handlePlayAll}
            onStop={stopPlayAll}
            label="Phát tất cả"
            disabled={items.length === 0}
          />
        </div>

        {items.length === 0 ? (
          <p className="suffixes-empty">Không tìm thấy hậu tố phù hợp.</p>
        ) : (
          <div className="suffixes-grid">
            {items.map((item) => {
              const key = itemKey(category.id, item);
              const selected = selectedKey === key;
              return (
                <article
                  key={key}
                  className={`suffix-card${selected ? ' is-selected' : ''}`}
                >
                  <button
                    type="button"
                    className="suffix-card-main"
                    aria-pressed={selected}
                    onClick={() => selectAndSpeak(key, item.kana)}
                  >
                    <span className="suffix-ja japanese-text">{item.suffix}</span>
                    <span className="suffix-kana">{item.kana}</span>
                    <span className="suffix-romaji">{item.romaji}</span>
                    <span className="suffix-vi">{item.meaning}</span>
                    <span className="suffix-attach">Gắn: {item.attachesTo}</span>
                  </button>
                  {(item.exampleJa || item.exampleVi) && (
                    <div className="suffix-example" aria-label="Ví dụ">
                      <div className="suffix-example-head">
                        <span className="suffix-example-label">Ví dụ</span>
                        {item.exampleJa ? (
                          <button
                            type="button"
                            className="btn-audio-small"
                            aria-label="Nghe ví dụ"
                            onClick={() => selectAndSpeak(key, item.exampleJa!)}
                          >
                            🔊
                          </button>
                        ) : null}
                      </div>
                      {item.exampleJa ? (
                        <button
                          type="button"
                          className="suffix-example-ja japanese-text"
                          onClick={() => selectAndSpeak(key, item.exampleJa!)}
                        >
                          {item.exampleJa}
                        </button>
                      ) : null}
                      {item.exampleVi ? (
                        <span className="suffix-example-vi">{item.exampleVi}</span>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
