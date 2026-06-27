'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { playAudio } from '../utils/speech';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useLessonsQuery, useVocabulariesQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import VocabPicture from '../components/VocabPicture';
import { getStrokeText, shouldShowKanaStroke } from '../utils/japanese';
import './VocabView.css';

function matchesVocabSearch(
  vocab: { kanji: string | null; kana: string; romaji: string; meaning: string },
  query: string,
): boolean {
  const haystack = [vocab.kanji, vocab.kana, vocab.romaji, vocab.meaning]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function VocabView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: lessons = [] } = useLessonsQuery();
  const { data: lessonVocab = [], isLoading: loading } = useVocabulariesQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();
  const listItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const expectedCount =
    lessons.find((l) => l.lessonNumber === currentLesson)?._count?.vocabularies ?? null;
  const isListIncomplete =
    expectedCount != null && lessonVocab.length > 0 && lessonVocab.length < expectedCount;

  const filteredVocab = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return lessonVocab
      .map((vocab, index) => ({ vocab, index }))
      .filter(({ vocab }) => !q || matchesVocabSearch(vocab, q));
  }, [lessonVocab, searchQuery]);

  useEffect(() => {
    stopPlayAll();
    setCurrentIndex(0);
    setIsFlipped(false);
    setSearchQuery('');
  }, [currentLesson, stopPlayAll]);

  useEffect(() => {
    listItemRefs.current[currentIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [currentIndex, currentLesson, searchQuery]);

  const currentVocab = lessonVocab[currentIndex];

  useEffect(() => {
    if (isPlayingAll || !currentVocab?.kana) return undefined;
    const timer = setTimeout(() => playAudio(currentVocab.kana), 200);
    return () => clearTimeout(timer);
  }, [currentIndex, currentLesson, currentVocab?.kana, isPlayingAll]);

  const handleNext = () => {
    if (!lessonVocab.length) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % lessonVocab.length);
    }, 150);
  };

  const handlePrev = () => {
    if (!lessonVocab.length) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + lessonVocab.length) % lessonVocab.length);
    }, 150);
  };

  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentVocab) playAudio(currentVocab.kana);
  };

  const handleStrokeCharClick = (char: string) => {
    playAudio(char);
  };

  const handleStrokeTextClick = (text: string) => {
    const strokeText = getStrokeText(text);
    if (strokeText) playAudio(strokeText);
  };

  const handlePlayAll = () => {
    startPlayAll(
      lessonVocab.map((v) => v.kana),
      {
        onItemIndex: (index) => {
          setIsFlipped(false);
          setCurrentIndex(index);
        },
      },
    );
  };

  const handleSelectWord = (index: number) => {
    if (index === currentIndex) return;
    stopPlayAll();
    setIsFlipped(false);
    setCurrentIndex(index);
  };

  return (
    <div className="container vocab-view">
      <div className="vocab-header">
        <h2 className="view-title">Minna no Nihongo Vocabulary</h2>

        <LessonSelector
          id="lesson-select"
          value={currentLesson}
          onChange={setCurrentLesson}
        />

        {lessonVocab.length > 0 && (
          <p className="vocab-subtitle">
            Từ {currentIndex + 1} / {lessonVocab.length}
          </p>
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : lessonVocab.length > 0 && currentVocab ? (
        <div className="vocab-body-layout">
          <aside className="vocab-word-list glass-panel">
            <h3 className="vocab-word-list-title">
              Danh sách từ
              {searchQuery.trim()
                ? ` (${filteredVocab.length}/${lessonVocab.length})`
                : ` (${lessonVocab.length})`}
            </h3>
            <input
              type="search"
              className="vocab-word-list-search"
              placeholder="Tìm kanji, kana, romaji, nghĩa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm từ vựng"
            />
            {isListIncomplete && (
              <p className="vocab-word-list-warning" role="status">
                Đang hiển thị {lessonVocab.length}/{expectedCount} từ — hãy refresh trang.
              </p>
            )}
            <ul className="vocab-word-list-items">
              {filteredVocab.length === 0 ? (
                <li className="vocab-word-list-empty">Không tìm thấy từ phù hợp.</li>
              ) : (
                filteredVocab.map(({ vocab, index }) => (
                  <li key={vocab.id}>
                    <button
                      ref={(el) => {
                        listItemRefs.current[index] = el;
                      }}
                      type="button"
                      className={`vocab-word-list-item ${
                        index === currentIndex ? 'active' : ''
                      }`}
                      onClick={() => handleSelectWord(index)}
                      aria-current={index === currentIndex ? 'true' : undefined}
                    >
                      <span className="vocab-word-list-num">{index + 1}</span>
                      <VocabPicture
                        word={vocab.romaji}
                        meaning={vocab.meaning}
                        kana={vocab.kana}
                        kanji={vocab.kanji}
                        imageUrl={vocab.imageUrl}
                        size="xs"
                        className="vocab-word-list-thumb"
                        alt={vocab.kana}
                      />
                      <span className="vocab-word-list-jp japanese-text">
                        {vocab.kanji || vocab.kana}
                      </span>
                      <span className="vocab-word-list-meaning">{vocab.meaning}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </aside>

          <div className="vocab-main-layout">
          <div className="flashcard-container">
            <div
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-face flashcard-front">
                <button className="btn-audio" onClick={handlePronounce} title="Nghe phát âm">
                  🔊
                </button>
                <VocabPicture
                  word={currentVocab.romaji}
                  meaning={currentVocab.meaning}
                  kana={currentVocab.kana}
                  kanji={currentVocab.kanji}
                  imageUrl={currentVocab.imageUrl}
                  size="lg"
                  className="flashcard-vocab-picture"
                  alt={currentVocab.kana}
                />
                <span className="vocab-kanji japanese-text">
                  {currentVocab.kanji || currentVocab.kana}
                </span>
              </div>

              <div className="flashcard-face flashcard-back">
                <button className="btn-audio" onClick={handlePronounce} title="Nghe phát âm">
                  🔊
                </button>
                <VocabPicture
                  word={currentVocab.romaji}
                  meaning={currentVocab.meaning}
                  kana={currentVocab.kana}
                  kanji={currentVocab.kanji}
                  imageUrl={currentVocab.imageUrl}
                  size="md"
                  className="flashcard-vocab-picture"
                  alt={currentVocab.kana}
                />
                <span className="vocab-kana japanese-text">{currentVocab.kana}</span>
                <span className="vocab-romaji">{currentVocab.romaji}</span>
                <div className="divider"></div>
                <span className="vocab-meaning">{currentVocab.meaning}</span>
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

          <div className="stroke-order-sidepanel glass-panel">
            <VocabPicture
              word={currentVocab.romaji}
              meaning={currentVocab.meaning}
              kana={currentVocab.kana}
              kanji={currentVocab.kanji}
              imageUrl={currentVocab.imageUrl}
              size="md"
              className="stroke-panel-picture"
              alt={currentVocab.kana}
            />
            <h3>Cách viết chữ:</h3>
            {shouldShowKanaStroke(currentVocab.kanji, currentVocab.kana) ? (
              <>
                <div className="stroke-section">
                  <p className="stroke-section-label">Kanji</p>
                  <button
                    type="button"
                    className="stroke-kanji stroke-kanji-btn"
                    onClick={() => handleStrokeTextClick(currentVocab.kanji!)}
                  >
                    {getStrokeText(currentVocab.kanji!)}
                  </button>
                  <div className="stroke-drawing-box">
                    <StrokeOrder
                      text={currentVocab.kanji!}
                      onCharClick={handleStrokeCharClick}
                    />
                  </div>
                </div>
                <div className="stroke-section">
                  <p className="stroke-section-label">Kana</p>
                  <button
                    type="button"
                    className="stroke-kanji stroke-kanji-btn"
                    onClick={() => handleStrokeTextClick(currentVocab.kana)}
                  >
                    {getStrokeText(currentVocab.kana)}
                  </button>
                  <div className="stroke-drawing-box">
                    <StrokeOrder
                      text={currentVocab.kana}
                      width={80}
                      height={80}
                      onCharClick={handleStrokeCharClick}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="stroke-kanji stroke-kanji-btn"
                  onClick={() =>
                    handleStrokeTextClick(currentVocab.kanji || currentVocab.kana)
                  }
                >
                  {getStrokeText(currentVocab.kanji || currentVocab.kana) ||
                    currentVocab.kana}
                </button>
                <div className="stroke-drawing-box">
                  <StrokeOrder
                    text={currentVocab.kanji || currentVocab.kana}
                    onCharClick={handleStrokeCharClick}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            Dữ liệu từ vựng cho Bài {currentLesson} chưa có sẵn. Hãy chọn bài khác
            nhé!
          </p>
        </div>
      )}
    </div>
  );
}
