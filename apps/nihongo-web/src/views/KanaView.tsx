'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { playAudio } from '../utils/speech';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useKanaChartsQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import type { KanaSection } from '../types/reference';
import './KanaView.css';

type KanaTab = 'hiragana' | 'katakana' | 'both';

type KanaPairCell = {
  hiragana: string;
  katakana: string;
  romaji: string;
};

type KanaPairSection = {
  id: string;
  title: string;
  subtitle?: string;
  columns?: number;
  rows: KanaPairCell[][];
};

function pairKanaSections(
  hiragana: KanaSection[],
  katakana: KanaSection[],
): KanaPairSection[] {
  return hiragana.map((hs, sectionIndex) => {
    const ks = katakana.find((s) => s.id === hs.id) ?? katakana[sectionIndex];
    return {
      id: hs.id,
      title: hs.title,
      subtitle: hs.subtitle,
      columns: hs.columns,
      rows: hs.rows.map((row, ri) =>
        row.map((cell, ci) => {
          const kata = ks?.rows[ri]?.[ci];
          return {
            hiragana: cell.kana ?? '',
            katakana: kata?.kana ?? '',
            romaji: cell.romaji || kata?.romaji || '',
          };
        }),
      ),
    };
  });
}

export default function KanaView() {
  const [activeTab, setActiveTab] = useState<KanaTab>('hiragana');
  const [playAudioEnabled, setPlayAudioEnabled] = useState(true);
  const [selectedKana, setSelectedKana] = useState<string | null>(null);
  const [playingKana, setPlayingKana] = useState<string | null>(null);
  const { data: kanaCharts, isLoading } = useKanaChartsQuery();
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  const currentSections = useMemo(
    () =>
      activeTab === 'hiragana'
        ? (kanaCharts?.hiraganaSections ?? [])
        : activeTab === 'katakana'
          ? (kanaCharts?.katakanaSections ?? [])
          : [],
    [activeTab, kanaCharts],
  );

  const pairedSections = useMemo(
    () =>
      pairKanaSections(
        kanaCharts?.hiraganaSections ?? [],
        kanaCharts?.katakanaSections ?? [],
      ),
    [kanaCharts],
  );

  const kanaList = useMemo(() => {
    if (activeTab === 'both') {
      return pairedSections
        .flatMap((section) => section.rows.flat())
        .flatMap((cell) => [cell.hiragana, cell.katakana].filter(Boolean));
    }
    return currentSections
      .flatMap((section) => section.rows.flat())
      .filter((item) => item.kana)
      .map((item) => item.kana);
  }, [activeTab, currentSections, pairedSections]);

  useEffect(() => {
    stopPlayAll();
    setPlayingKana(null);
  }, [activeTab, stopPlayAll]);

  useEffect(() => {
    if (!isPlayingAll) {
      setPlayingKana(null);
    }
  }, [isPlayingAll]);

  const handleCharClick = (kana: string) => {
    if (!kana) return;
    setSelectedKana(kana);
    if (playAudioEnabled) {
      playAudio(kana);
    }
  };

  const handlePlayAll = () => {
    startPlayAll(kanaList, {
      onItemIndex: (index) => {
        const kana = kanaList[index];
        setPlayingKana(kana);
        setSelectedKana(kana);
      },
    });
  };

  const handleTabChange = (tab: KanaTab) => {
    stopPlayAll();
    setActiveTab(tab);
    setSelectedKana(null);
    setPlayingKana(null);
  };

  return (
    <div className="container kana-view">
      {isLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Đang tải bảng kana...</p>
      ) : (
        <>
          <div className="kana-header">
            <h2 className="view-title">Kana Alphabet</h2>
            <div className="vocab-header-links" style={{ marginBottom: '0.75rem' }}>
              <Link href="/kana/quiz" className="btn btn-primary">
                Trắc nghiệm Kana
              </Link>
            </div>
            <div className="tab-buttons">
              <button
                type="button"
                className={`btn tab-btn ${activeTab === 'hiragana' ? 'active' : ''}`}
                onClick={() => handleTabChange('hiragana')}
              >
                Hiragana
              </button>
              <button
                type="button"
                className={`btn tab-btn ${activeTab === 'katakana' ? 'active' : ''}`}
                onClick={() => handleTabChange('katakana')}
              >
                Katakana
              </button>
              <button
                type="button"
                className={`btn tab-btn ${activeTab === 'both' ? 'active' : ''}`}
                onClick={() => handleTabChange('both')}
              >
                Cả hai
              </button>
            </div>
          </div>

          <div className="kana-main-layout">
            <div className="kana-grid-container">
              <div className="kana-controls">
                <PlayAllButton
                  isPlaying={isPlayingAll}
                  onPlay={handlePlayAll}
                  onStop={stopPlayAll}
                  disabled={!kanaList.length}
                />
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={playAudioEnabled}
                    onChange={(e) => setPlayAudioEnabled(e.target.checked)}
                  />
                  Phát âm khi nhấn
                </label>
              </div>

              {activeTab === 'both' ? (
                <div className="kana-sections">
                  {pairedSections.map((section) => (
                    <section key={section.id} className="kana-section">
                      <h3 className="kana-section-title">
                        <span className="kana-section-title-jp japanese-text">{section.title}</span>
                        {section.subtitle && (
                          <span className="kana-section-title-sub">{section.subtitle}</span>
                        )}
                      </h3>
                      <div
                        className="kana-grid kana-grid--pair"
                        style={{
                          gridTemplateColumns: `repeat(${section.columns ?? 5}, 1fr)`,
                        }}
                      >
                        {section.rows.flat().map((cell, index) => {
                          const hasAny = !!(cell.hiragana || cell.katakana);
                          const selected =
                            !!selectedKana &&
                            (selectedKana === cell.hiragana || selectedKana === cell.katakana);
                          const playing =
                            !!playingKana &&
                            (playingKana === cell.hiragana || playingKana === cell.katakana);
                          return (
                            <div
                              key={`${section.id}-${index}`}
                              className={`kana-card kana-card--pair ${
                                hasAny ? 'active-card' : 'empty-card'
                              }${selected || playing ? ' playing' : ''}`}
                            >
                              {cell.hiragana ? (
                                <button
                                  type="button"
                                  className={`kana-pair-char japanese-text${
                                    selectedKana === cell.hiragana || playingKana === cell.hiragana
                                      ? ' is-selected'
                                      : ''
                                  }`}
                                  aria-label={`Hiragana ${cell.romaji}`}
                                  onClick={() => handleCharClick(cell.hiragana)}
                                >
                                  {cell.hiragana}
                                </button>
                              ) : null}
                              {cell.katakana ? (
                                <button
                                  type="button"
                                  className={`kana-pair-char kana-pair-char--kata japanese-text${
                                    selectedKana === cell.katakana || playingKana === cell.katakana
                                      ? ' is-selected'
                                      : ''
                                  }`}
                                  aria-label={`Katakana ${cell.romaji}`}
                                  onClick={() => handleCharClick(cell.katakana)}
                                >
                                  {cell.katakana}
                                </button>
                              ) : null}
                              <span className="kana-romaji">{cell.romaji}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="kana-sections">
                  {currentSections.map((section) => (
                    <section key={section.id} className="kana-section">
                      <h3 className="kana-section-title">
                        <span className="kana-section-title-jp japanese-text">{section.title}</span>
                        {section.subtitle && (
                          <span className="kana-section-title-sub">{section.subtitle}</span>
                        )}
                      </h3>
                      <div
                        className="kana-grid"
                        style={{
                          gridTemplateColumns: `repeat(${section.columns ?? 5}, 1fr)`,
                        }}
                      >
                        {section.rows.flat().map((item, index) => (
                          <div
                            key={`${section.id}-${index}`}
                            className={`kana-card ${item.kana ? 'active-card' : 'empty-card'} ${
                              item.kana && playingKana === item.kana ? 'playing' : ''
                            }`}
                            onClick={() => handleCharClick(item.kana)}
                          >
                            <span className="kana-char japanese-text">{item.kana}</span>
                            <span className="kana-romaji">{item.romaji}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            {selectedKana && (
              <div className="kana-detail-panel glass-panel">
                <h3>Cách viết chữ: {selectedKana}</h3>
                <div className="stroke-drawing-box">
                  <StrokeOrder text={selectedKana} width={200} height={200} />
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => playAudio(selectedKana)}
                >
                  🔊 Hỗ trợ phát âm
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
