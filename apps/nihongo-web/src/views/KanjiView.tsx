'use client';

import { useState, useEffect } from 'react';
import { playAudio } from '../utils/speech';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import {
  useKanjiLessonsQuery,
  useKanjiEntriesQuery,
  useKanjiSearchQuery,
} from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import { toLocalImageUrl } from '@edu/vocab-images';
import type { KanjiEntry, KanjiLesson } from '../types/api';
import './VocabView.css';

export default function KanjiView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingKanjiId, setPendingKanjiId] = useState<number | null>(null);

  const { data: lessons = [] } = useKanjiLessonsQuery();
  const { data: lessonKanji = [], isLoading: loading } = useKanjiEntriesQuery(currentLesson);
  const { data: searchResults = [], isFetching: searching } = useKanjiSearchQuery(searchQuery);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  useEffect(() => {
    if (lessons.length > 0 && !lessons.some((l) => l.lessonNumber === currentLesson)) {
      setCurrentLesson(lessons[0].lessonNumber);
    }
  }, [lessons, currentLesson]);

  useEffect(() => {
    stopPlayAll();
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentLesson, stopPlayAll]);

  useEffect(() => {
    if (pendingKanjiId == null || !lessonKanji.length) return;
    const idx = lessonKanji.findIndex((k) => k.id === pendingKanjiId);
    if (idx >= 0) {
      setCurrentIndex(idx);
      setIsFlipped(false);
      setPendingKanjiId(null);
    }
  }, [pendingKanjiId, lessonKanji]);

  const currentKanji = lessonKanji[currentIndex];
  const currentLessonMeta = lessons.find((l) => l.lessonNumber === currentLesson);
  const isSearchActive = searchQuery.trim().length > 0;

  const getKanjiReading = (kanji: KanjiEntry): string => {
    const raw = kanji?.onyomi || kanji?.kunyomi || kanji?.character || '';
    return raw.split(/[,、]/)[0].replace(/-.*/, '').trim();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleSelectSearchResult = (entry: KanjiEntry) => {
    const lessonNumber = entry.lesson?.lessonNumber;
    if (!lessonNumber) return;
    setPendingKanjiId(entry.id);
    setCurrentLesson(lessonNumber);
    handleClearSearch();
  };

  const handleNext = () => {
    if (!lessonKanji.length) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % lessonKanji.length);
    }, 150);
  };

  const handlePrev = () => {
    if (!lessonKanji.length) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + lessonKanji.length) % lessonKanji.length);
    }, 150);
  };

  const handlePronounce = (e: React.MouseEvent, text?: string) => {
    e.stopPropagation();
    if (!currentKanji) return;
    const reading = text || getKanjiReading(currentKanji);
    playAudio(reading);
  };

  const handlePlayAll = () => {
    startPlayAll(lessonKanji.map(getKanjiReading), {
      onItemIndex: (index) => {
        setIsFlipped(false);
        setCurrentIndex(index);
      },
    });
  };

  const readings = [currentKanji?.onyomi, currentKanji?.kunyomi].filter(Boolean).join(' · ');

  return (
    <div className="container vocab-view">
      <div className="vocab-header">
        <h2 className="view-title">Kanji Look and Learn</h2>

        <form className="kanji-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="search"
            className="vocab-word-list-search kanji-search-input"
            placeholder="Tìm kanji, Hán Việt, âm đọc, nghĩa..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Tìm kanji"
          />
          <button type="submit" className="btn btn-primary kanji-search-btn" disabled={searching}>
            {searching ? 'Đang tìm...' : 'Tìm'}
          </button>
          {isSearchActive && (
            <button type="button" className="btn btn-nav kanji-search-clear" onClick={handleClearSearch}>
              Xóa
            </button>
          )}
        </form>

        {isSearchActive && (
          <div className="kanji-search-results glass-panel" role="region" aria-label="Kết quả tìm kanji">
            {searching ? (
              <p className="kanji-search-status">Đang tìm...</p>
            ) : searchResults.length === 0 ? (
              <p className="kanji-search-status">Không tìm thấy kanji phù hợp.</p>
            ) : (
              <>
                <p className="kanji-search-status">{searchResults.length} kết quả</p>
                <ul className="kanji-search-list">
                  {searchResults.map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className="kanji-search-item"
                        onClick={() => handleSelectSearchResult(entry)}
                      >
                        <span className="kanji-search-char japanese-text">{entry.character}</span>
                        <span className="kanji-search-meta">
                          {entry.hanViet ? `${entry.hanViet} · ` : ''}
                          {entry.meaningVi}
                        </span>
                        <span className="kanji-search-lesson">
                          Bài {entry.lesson?.lessonNumber ?? '?'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="lesson-selector">
          <label htmlFor="kanji-lesson-select">Chọn bài học: </label>
          <select
            id="kanji-lesson-select"
            value={currentLesson}
            onChange={(e) => setCurrentLesson(Number(e.target.value))}
            className="select-input"
          >
            {(lessons.length
              ? lessons
              : Array.from({ length: 32 }, (_, i) => ({ lessonNumber: i + 1 } as KanjiLesson))
            ).map((lesson) => (
                <option key={lesson.lessonNumber} value={lesson.lessonNumber}>
                  Bài {lesson.lessonNumber}
                  {lesson.jlptLevel ? ` (${lesson.jlptLevel})` : ''}
                  {lesson._count ? ` — ${lesson._count.entries} kanji` : ''}
                </option>
              ),
            )}
          </select>
        </div>

        {currentLessonMeta?.jlptLevel && (
          <p className="vocab-subtitle">JLPT {currentLessonMeta.jlptLevel}</p>
        )}

        {lessonKanji.length > 0 && (
          <p className="vocab-subtitle">
            Kanji {currentIndex + 1} / {lessonKanji.length}
          </p>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : lessonKanji.length > 0 && currentKanji ? (
        <div className="vocab-main-layout vocab-main-layout--kanji">
          <div className="flashcard-container">
            <div
              className={`flashcard flashcard--kanji ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-face flashcard-front">
                <button
                  className="btn-audio"
                  onClick={(e) => handlePronounce(e)}
                  title="Nghe phát âm"
                >
                  🔊
                </button>
                <div className="flashcard-front-body">
                  <div className="kanji-flashcard-hero">
                    {!currentKanji.imageUrl ? (
                      <span className="vocab-kanji japanese-text kanji-flashcard-char">
                        {currentKanji.character}
                      </span>
                    ) : (
                      <div className="kanji-flashcard-illustration">
                        <img
                          src={toLocalImageUrl(currentKanji.imageUrl) ?? currentKanji.imageUrl}
                          alt={currentKanji.character}
                        />
                      </div>
                    )}
                  </div>
                  {currentKanji.hanViet && (
                    <span className="vocab-romaji">{currentKanji.hanViet}</span>
                  )}
                  <div
                    className="flashcard-stroke-block kanji-flashcard-stroke"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flashcard-stroke-label">Cách viết chữ</span>
                    <div className="stroke-drawing-box">
                      <StrokeOrder text={currentKanji.character} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flashcard-face flashcard-back">
                <button
                  className="btn-audio"
                  onClick={(e) => handlePronounce(e)}
                  title="Nghe phát âm"
                >
                  🔊
                </button>
                <div className="kanji-flashcard-back-body">
                  {readings && <span className="vocab-kana japanese-text">{readings}</span>}
                  <div className="divider"></div>
                  <span className="vocab-meaning">{currentKanji.meaningVi}</span>
                  {currentKanji.mnemonicJp && (
                    <p className="kanji-mnemonic-jp japanese-text">{currentKanji.mnemonicJp}</p>
                  )}
                  {currentKanji.mnemonicVi && (
                    <p className="kanji-mnemonic">{currentKanji.mnemonicVi}</p>
                  )}
                  <div
                    className="flashcard-stroke-block kanji-flashcard-stroke kanji-flashcard-stroke--back"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="flashcard-stroke-label">Cách viết chữ</span>
                    <div className="stroke-drawing-box">
                      <StrokeOrder text={currentKanji.character} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="vocab-controls">
              <PlayAllButton
                isPlaying={isPlayingAll}
                onPlay={handlePlayAll}
                onStop={stopPlayAll}
              />
              <button className="btn btn-nav" onClick={handlePrev}>
                ⬅️ Trước
              </button>
              <button className="btn btn-nav" onClick={handleNext}>
                Sau ➡️
              </button>
            </div>
          </div>

          {currentKanji.vocabularies && currentKanji.vocabularies.length > 0 && (
            <aside className="kanji-vocab-sidepanel glass-panel kanji-vocab-list">
              <h3>Từ vựng liên quan</h3>
              <ul>
                {currentKanji.vocabularies.map((v) => (
                  <li key={`${v.word}-${v.reading}`}>
                    <button
                      className="kanji-vocab-audio"
                      onClick={(e) => handlePronounce(e, v.reading)}
                      title="Nghe"
                    >
                      🔊
                    </button>
                    <span className="japanese-text">{v.word}</span>
                    <span className="kanji-vocab-reading">（{v.reading}）</span>
                    <span className="kanji-vocab-meaning">— {v.meaningVi}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <p>
            Dữ liệu kanji cho Bài {currentLesson} chưa có. Chạy{' '}
            <code>npm run seed -w @edu/prisma-nihongo</code> (DB trống) hoặc restore backup.
          </p>
        </div>
      )}
    </div>
  );
}
