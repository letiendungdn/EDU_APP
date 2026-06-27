'use client';

import { useState, useEffect } from 'react';
import { playAudio } from '../utils/speech';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useKanjiLessonsQuery, useKanjiEntriesQuery } from '../hooks/queries';
import StrokeOrder from '../components/StrokeOrder';
import { getStrokeText } from '../utils/japanese';
import type { KanjiEntry, KanjiLesson } from '../types/api';
import './VocabView.css';

export default function KanjiView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const { data: lessons = [] } = useKanjiLessonsQuery();
  const { data: lessonKanji = [], isLoading: loading } = useKanjiEntriesQuery(currentLesson);
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

  const currentKanji = lessonKanji[currentIndex];
  const currentLessonMeta = lessons.find((l) => l.lessonNumber === currentLesson);

  const getKanjiReading = (kanji: KanjiEntry): string => {
    const raw = kanji?.onyomi || kanji?.kunyomi || kanji?.character || '';
    return raw.split(/[,、]/)[0].replace(/-.*/, '').trim();
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
        <div className="vocab-main-layout">
          <div className="flashcard-container">
            <div
              className={`flashcard ${isFlipped ? 'flipped' : ''}`}
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
                <span className="vocab-kanji japanese-text">{currentKanji.character}</span>
                {currentKanji.hanViet && (
                  <span className="vocab-romaji">{currentKanji.hanViet}</span>
                )}
              </div>

              <div className="flashcard-face flashcard-back">
                <button
                  className="btn-audio"
                  onClick={(e) => handlePronounce(e)}
                  title="Nghe phát âm"
                >
                  🔊
                </button>
                {readings && <span className="vocab-kana japanese-text">{readings}</span>}
                <div className="divider"></div>
                <span className="vocab-meaning">{currentKanji.meaningVi}</span>
                {currentKanji.mnemonicVi && (
                  <p className="kanji-mnemonic">{currentKanji.mnemonicVi}</p>
                )}
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

            {currentKanji.vocabularies && currentKanji.vocabularies.length > 0 && (
              <div className="kanji-vocab-list glass-panel">
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
              </div>
            )}
          </div>

          <div className="stroke-order-sidepanel glass-panel">
            {currentKanji.imageUrl && (
              <div className="kanji-illustration">
                <img src={currentKanji.imageUrl} alt={currentKanji.character} />
              </div>
            )}
            {currentKanji.mnemonicJp && (
              <p className="kanji-mnemonic-jp japanese-text">{currentKanji.mnemonicJp}</p>
            )}
            <h3>Cách viết chữ:</h3>
            <p className="stroke-kanji">{getStrokeText(currentKanji.character)}</p>
            <div className="stroke-drawing-box">
              <StrokeOrder text={currentKanji.character} />
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <p>
            Dữ liệu kanji cho Bài {currentLesson} chưa có. Chạy{' '}
            <code>npm run build:kll</code> rồi <code>npx prisma db seed</code> nhé!
          </p>
        </div>
      )}
    </div>
  );
}
