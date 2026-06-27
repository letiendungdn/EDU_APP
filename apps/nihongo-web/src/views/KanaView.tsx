'use client';

import { useState, useEffect, useMemo } from 'react';
import { playAudio } from '../utils/speech';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useKanaChartsQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import './KanaView.css';

export default function KanaView() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [playAudioEnabled, setPlayAudioEnabled] = useState(true);
  const [selectedKana, setSelectedKana] = useState<string | null>(null);
  const [playingKana, setPlayingKana] = useState<string | null>(null);
  const { data: kanaCharts, isLoading } = useKanaChartsQuery();
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  const currentSections = useMemo(
    () =>
      activeTab === 'hiragana'
        ? (kanaCharts?.hiraganaSections ?? [])
        : (kanaCharts?.katakanaSections ?? []),
    [activeTab, kanaCharts],
  );

  const kanaList = useMemo(
    () =>
      currentSections
        .flatMap((section) => section.rows.flat())
        .filter((item) => item.kana)
        .map((item) => item.kana),
    [currentSections],
  );

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

  const handleTabChange = (tab: 'hiragana' | 'katakana') => {
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
        <div className="tab-buttons">
          <button 
            className={`btn tab-btn ${activeTab === 'hiragana' ? 'active' : ''}`}
            onClick={() => handleTabChange('hiragana')}
          >
            Hiragana
          </button>
          <button 
            className={`btn tab-btn ${activeTab === 'katakana' ? 'active' : ''}`}
            onClick={() => handleTabChange('katakana')}
          >
            Katakana
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
        </div>

        {selectedKana && (
          <div className="kana-detail-panel glass-panel">
            <h3>Cách viết chữ: {selectedKana}</h3>
            <div className="stroke-drawing-box">
              <StrokeOrder text={selectedKana} />
            </div>
            <button className="btn btn-primary" onClick={() => playAudio(selectedKana)}>🔊 Nghe phát âm</button>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
