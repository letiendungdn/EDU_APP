'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { playAudio } from '../utils/speech';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useLessonsQuery, useVocabulariesQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import VocabPicture from '../components/VocabPicture';
import { getStrokeText, parseReadingVariants, shouldShowKanaStroke, flashcardTextTier, hasOptionalBracketParts } from '../utils/japanese';
import FlashcardJapaneseText from '../components/FlashcardJapaneseText';
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

function strokeBoxSize(charCount: number, dense = false): number {
  if (dense) {
    if (charCount <= 1) return 165;
    if (charCount <= 2) return 135;
    if (charCount <= 4) return 112;
    return 92;
  }
  if (charCount <= 1) return 200;
  if (charCount <= 2) return 160;
  if (charCount <= 4) return 130;
  return 105;
}

function FlashcardStroke({
  text,
  label,
  dense = false,
  onCharClick,
}: {
  text: string;
  label?: string;
  dense?: boolean;
  onCharClick: (char: string) => void;
}) {
  const strokeText = getStrokeText(text);
  if (!strokeText) return null;
  const size = strokeBoxSize([...strokeText].length, dense);

  return (
    <div className="flashcard-stroke-block" onClick={(e) => e.stopPropagation()}>
      {label ? <p className="flashcard-stroke-label">{label}</p> : null}
      <StrokeOrder
        text={text}
        width={size}
        height={size}
        compact
        onCharClick={onCharClick}
      />
    </div>
  );
}

function FlashcardReadingStrokes({
  kanji,
  kana,
  romaji,
  onCharClick,
}: {
  kanji: string | null;
  kana: string;
  romaji: string;
  onCharClick: (char: string) => void;
}) {
  const showDual = shouldShowKanaStroke(kanji, kana);
  const kanaVariants = parseReadingVariants(kana, romaji);
  const kanjiVariants = kanji ? parseReadingVariants(kanji, romaji) : [];
  const pairCount = showDual
    ? Math.max(kanjiVariants.length, kanaVariants.length, 1)
    : kanaVariants.length;

  if (pairCount > 1) {
    return (
      <div className="flashcard-reading-pairs">
        {Array.from({ length: pairCount }, (_, index) => {
          const kanjiVariant = kanjiVariants[index];
          const kanaVariant = kanaVariants[index];
          const pairLabel = kanaVariant?.label ?? kanjiVariant?.label;

          return (
            <div key={index} className="flashcard-reading-pair">
              {pairLabel ? (
                <p className="flashcard-reading-pair-label">{pairLabel}</p>
              ) : null}
              <div className="flashcard-reading-pair-strokes">
                {showDual && kanjiVariant ? (
                  <FlashcardStroke
                    text={kanjiVariant.text}
                    label="Kanji"
                    dense
                    onCharClick={onCharClick}
                  />
                ) : null}
                {kanaVariant ? (
                  <FlashcardStroke
                    text={kanaVariant.text}
                    label={showDual ? 'Kana' : undefined}
                    dense
                    onCharClick={onCharClick}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (showDual) {
    return (
      <div className="flashcard-stroke-dual">
        <FlashcardStroke
          text={kanji!}
          label="Kanji"
          onCharClick={onCharClick}
        />
        <FlashcardStroke
          text={kana}
          label="Kana"
          onCharClick={onCharClick}
        />
      </div>
    );
  }

  return (
    <FlashcardStroke
      text={kanji || kana}
      onCharClick={onCharClick}
    />
  );
}

export default function VocabView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: lessons = [] } = useLessonsQuery();
  const { data: lessonVocab = [], isLoading: loading } = useVocabulariesQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();
  const listScrollRef = useRef<HTMLDivElement>(null);

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

  const rowVirtualizer = useVirtualizer({
    count: filteredVocab.length,
    getScrollElement: () => listScrollRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  useEffect(() => {
    stopPlayAll();
    setCurrentIndex(0);
    setIsFlipped(false);
    setSearchQuery('');
  }, [currentLesson, stopPlayAll]);

  useEffect(() => {
    const filteredIndex = filteredVocab.findIndex(({ index }) => index === currentIndex);
    if (filteredIndex >= 0) {
      rowVirtualizer.scrollToIndex(filteredIndex, { align: 'auto' });
    }
  }, [currentIndex, currentLesson, searchQuery, filteredVocab, rowVirtualizer]);

  const currentVocab = lessonVocab[currentIndex];
  const hasMultipleReadings =
    currentVocab != null &&
    parseReadingVariants(currentVocab.kana, currentVocab.romaji).length > 1;

  const frontTextTier =
    currentVocab != null
      ? flashcardTextTier(currentVocab.kanji, currentVocab.kana)
      : 'sm';
  const hasOptionalBrackets =
    currentVocab != null &&
    (hasOptionalBracketParts(currentVocab.kanji) ||
      hasOptionalBracketParts(currentVocab.kana) ||
      hasOptionalBracketParts(currentVocab.romaji));
  const frontTextTierClass = [
    frontTextTier === 'sm' ? '' : `flashcard-text-dual--tier-${frontTextTier}`,
    hasOptionalBrackets ? ' flashcard-text-dual--optional-brackets' : '',
  ].join('');

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

  const handleStrokeCharClick = () => {
    if (currentVocab) playAudio(currentVocab.kana);
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
          <div className="vocab-progress">
            <div className="vocab-progress__track">
              <div
                className="vocab-progress__fill"
                style={{ width: `${((currentIndex + 1) / lessonVocab.length) * 100}%` }}
              />
            </div>
            <span className="vocab-progress__text">
              {currentIndex + 1} / {lessonVocab.length}
            </span>
          </div>
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
              placeholder="Tìm kiếm từ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm từ vựng"
            />
            {isListIncomplete && (
              <p className="vocab-word-list-warning" role="status">
                Đang hiển thị {lessonVocab.length}/{expectedCount} từ — hãy refresh trang.
              </p>
            )}
            <div ref={listScrollRef} className="vocab-word-list-items">
              {filteredVocab.length === 0 ? (
                <p className="vocab-word-list-empty">Không tìm thấy từ phù hợp.</p>
              ) : (
                <div
                  className="vocab-word-list-virtual"
                  style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const { vocab, index } = filteredVocab[virtualRow.index];
                    return (
                      <div
                        key={vocab.id}
                        className="vocab-word-list-row"
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <button
                          type="button"
                          className={`vocab-word-list-item ${
                            index === currentIndex ? 'active' : ''
                          }`}
                          onClick={() => handleSelectWord(index)}
                          aria-current={index === currentIndex ? 'true' : undefined}
                        >
                          <span className="vocab-word-list-num">{index + 1}</span>
                          <span className="vocab-word-list-jp japanese-text">
                            {vocab.kanji || vocab.kana}
                          </span>
                          <span className="vocab-word-list-meaning">{vocab.meaning}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <div className="vocab-main-layout">
          <div className="flashcard-container">
            <div
              className={`flashcard ${isFlipped ? 'flipped' : ''}${
                hasMultipleReadings ? ' flashcard--multi-reading' : ''
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="flashcard-face flashcard-front">
                <div className="flashcard-front-body">
                  <div className={`flashcard-text-dual${frontTextTierClass}`}>
                    {currentVocab.kanji ? (
                      <div className="flashcard-text-col flashcard-text-col--kanji">
                        <span className="flashcard-char-label">Kanji</span>
                        <FlashcardJapaneseText text={currentVocab.kanji} className="vocab-kanji japanese-text" />
                        <button
                          type="button"
                          className="btn-audio btn-audio--card"
                          onClick={handlePronounce}
                          title="Nghe phát âm"
                        >
                          🔊
                        </button>
                      </div>
                    ) : null}
                    <div className="flashcard-text-col flashcard-text-col--kana">
                      <span className="flashcard-char-label">Kana</span>
                      <FlashcardJapaneseText text={currentVocab.kana} className="vocab-kana japanese-text" />
                      {!currentVocab.kanji ? (
                        <button
                          type="button"
                          className="btn-audio btn-audio--card"
                          onClick={handlePronounce}
                          title="Nghe phát âm"
                        >
                          🔊
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flashcard-front-meta">
                    <FlashcardJapaneseText text={currentVocab.romaji} className="vocab-romaji" />
                    <span className="vocab-meaning">{currentVocab.meaning}</span>
                  </div>
                </div>
              </div>

              <div className="flashcard-face flashcard-back">
                <button type="button" className="btn-audio" onClick={handlePronounce} title="Nghe phát âm">
                  🔊
                </button>
                <VocabPicture
                  word={currentVocab.romaji}
                  meaning={currentVocab.meaning}
                  kana={currentVocab.kana}
                  kanji={currentVocab.kanji}
                  imageUrl={currentVocab.imageUrl}
                  size="sm"
                  className="flashcard-vocab-picture flashcard-vocab-picture-corner"
                  alt={currentVocab.kana}
                />
                <div className="flashcard-back-body">
                  <FlashcardReadingStrokes
                    kanji={currentVocab.kanji}
                    kana={currentVocab.kana}
                    romaji={currentVocab.romaji}
                    onCharClick={handleStrokeCharClick}
                  />
                  <div className="flashcard-back-meta">
                    <span className="vocab-kana japanese-text">{currentVocab.kana}</span>
                    <span className="vocab-romaji">{currentVocab.romaji}</span>
                    <div className="divider"></div>
                    <span className="vocab-meaning">{currentVocab.meaning}</span>
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
              <button type="button" className="btn btn-nav" onClick={handlePrev}>
                ⬅️ Trước
              </button>
              <button type="button" className="btn btn-nav" onClick={handleNext}>
                Sau ➡️
              </button>
            </div>
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
