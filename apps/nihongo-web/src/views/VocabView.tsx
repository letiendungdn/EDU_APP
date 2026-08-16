'use client';

import { useState, useEffect } from 'react';
import { playAudio } from '../utils/speech';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import VocabWordList from '../components/VocabWordList';
import { usePlayAll } from '../hooks/usePlayAll';
import { useAuth } from '../hooks/useAuth';
import { useLessonsQuery, useVocabulariesQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import VocabPicture from '../components/VocabPicture';
import {
  getStrokeText,
  parseOptionalBracketSegments,
  parseReadingVariants,
  shouldShowKanaStroke,
  flashcardTextTier,
  hasOptionalBracketParts,
} from '../utils/japanese';
import FlashcardJapaneseText from '../components/FlashcardJapaneseText';
import './VocabView.css';

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

function flashcardPhraseStrokeScale(totalChars: number): number {
  if (totalChars <= 6) return 1;
  if (totalChars <= 10) return 0.76;
  if (totalChars <= 14) return 0.62;
  return 0.52;
}

function flashcardSegmentStrokeSize(
  charCount: number,
  optional: boolean,
  totalChars: number,
): number {
  const base = strokeBoxSize(charCount, true);
  const scaled = Math.round(base * flashcardPhraseStrokeScale(totalChars));
  return optional ? Math.max(30, Math.round(scaled * 0.52)) : Math.max(36, scaled);
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
  const hasOptional = hasOptionalBracketParts(text);

  if (hasOptional) {
    const segments = parseOptionalBracketSegments(text);
    const totalChars = segments.reduce(
      (sum, segment) => sum + [...getStrokeText(segment.text)].length,
      0,
    );

    return (
      <div
        className="flashcard-stroke-block flashcard-stroke-block--optional-mix"
        onClick={(e) => e.stopPropagation()}
      >
        {label ? <p className="flashcard-stroke-label">{label}</p> : null}
        <div className="flashcard-stroke-segments">
          {segments.map((segment, index) => {
            const strokeText = getStrokeText(segment.text);
            if (!strokeText) {
              if (!segment.text.trim()) return null;
              return (
                <span key={index} className="flashcard-stroke-punct">
                  {segment.text}
                </span>
              );
            }

            const size = flashcardSegmentStrokeSize(
              [...strokeText].length,
              segment.optional,
              totalChars,
            );

            if (segment.optional) {
              return (
                <span key={index} className="flashcard-stroke-optional-wrap">
                  <span className="flashcard-jp-bracket">{segment.openBracket ?? '['}</span>
                  <StrokeOrder
                    text={segment.text}
                    width={size}
                    height={size}
                    compact
                    onCharClick={onCharClick}
                  />
                  <span className="flashcard-jp-bracket">{segment.closeBracket ?? ']'}</span>
                </span>
              );
            }

            return (
              <span key={index} className="flashcard-stroke-core-wrap">
                <StrokeOrder
                  text={segment.text}
                  width={size}
                  height={size}
                  compact
                  onCharClick={onCharClick}
                />
              </span>
            );
          })}
        </div>
      </div>
    );
  }

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
  const hasOptionalStrokes =
    hasOptionalBracketParts(kanji) || hasOptionalBracketParts(kana);
  const showDualOnBack = showDual && !hasOptionalStrokes;
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

  if (showDualOnBack) {
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

  if (hasOptionalStrokes) {
    return (
      <FlashcardStroke
        text={kanji || kana}
        onCharClick={onCharClick}
      />
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
  const { isAdmin } = useAuth();
  const { data: lessons = [] } = useLessonsQuery();
  const { data: lessonVocab = [], isLoading: loading } = useVocabulariesQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  const currentLessonMeta = lessons.find((l) => l.lessonNumber === currentLesson);
  const lessonId = currentLessonMeta?.id ?? null;
  const expectedCount = currentLessonMeta?._count?.vocabularies ?? null;

  useEffect(() => {
    stopPlayAll();
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentLesson, stopPlayAll]);

  useEffect(() => {
    if (lessonVocab.length === 0) {
      setCurrentIndex(0);
      return;
    }
    if (currentIndex >= lessonVocab.length) {
      setCurrentIndex(lessonVocab.length - 1);
    }
  }, [lessonVocab.length, currentIndex]);

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
    frontTextTier === 'sm' ? '' : ` flashcard-text-dual--tier-${frontTextTier}`,
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

  const vocabHeader = (
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
  );

  const showBody = Boolean(currentVocab) || isAdmin;

  return (
    <div className="container vocab-view">
      {loading ? (
        <>
          {vocabHeader}
          <div className="empty-state">
            <p>Đang tải dữ liệu...</p>
          </div>
        </>
      ) : showBody ? (
        <div className="vocab-body-layout">
          <VocabWordList
            lessonNumber={currentLesson}
            lessonId={lessonId}
            vocabularies={lessonVocab}
            currentIndex={currentIndex}
            expectedCount={expectedCount}
            onSelectWord={handleSelectWord}
          />

          <div className="vocab-main-layout">
          {vocabHeader}
          {currentVocab ? (
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
                    {currentVocab.pitchAccent ? (
                      <span className="vocab-pitch">Cao điệu {currentVocab.pitchAccent}</span>
                    ) : null}
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
                <div
                  className={`flashcard-back-body${
                    hasOptionalBrackets ? ' flashcard-back-body--optional-brackets' : ''
                  }`}
                >
                  <FlashcardReadingStrokes
                    kanji={currentVocab.kanji}
                    kana={currentVocab.kana}
                    romaji={currentVocab.romaji}
                    onCharClick={handleStrokeCharClick}
                  />
                  <div className="flashcard-back-meta">
                    <FlashcardJapaneseText
                      text={currentVocab.kana}
                      className="vocab-kana japanese-text"
                    />
                    <FlashcardJapaneseText text={currentVocab.romaji} className="vocab-romaji" />
                    <div className="divider"></div>
                    <span className="vocab-meaning">{currentVocab.meaning}</span>
                    {currentVocab.pitchAccent ? (
                      <span className="vocab-pitch">Cao điệu {currentVocab.pitchAccent}</span>
                    ) : null}
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
          ) : (
            <div className="empty-state">
              <p>Chưa có từ trong bài này. Bấm Sửa → + Thêm để tạo từ mới.</p>
            </div>
          )}
          </div>
        </div>
      ) : (
        <>
          {vocabHeader}
          <div className="empty-state">
            <p>
              Dữ liệu từ vựng cho Bài {currentLesson} chưa có sẵn. Hãy chọn bài khác
              nhé!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
