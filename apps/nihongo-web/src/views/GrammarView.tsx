'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  grammarExplanationSpeechText,
  grammarSpeechSegments,
  playAudioSequence,
  speechTextFromJapanese,
  stopAudio,
} from '../utils/speech';
import type { Grammar } from '../types/api';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useGrammarsQuery } from '../hooks/queries';
import './GrammarView.css';

const AUTO_READ_KEY = 'nihongo-grammar-auto-read';

type SpeechFocus = {
  grammarIndex: number;
  exampleIndex?: number | null;
};

function readAutoReadPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTO_READ_KEY) === '1';
}

function allLessonExplanationTexts(grammars: Grammar[]): string[] {
  return grammars
    .map((g) => grammarExplanationSpeechText(g))
    .filter(Boolean);
}

function grammarCardId(grammar: Grammar, index: number): string {
  return String(grammar.id ?? index);
}

export default function GrammarView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [autoRead, setAutoRead] = useState(false);
  const [speechFocus, setSpeechFocus] = useState<SpeechFocus | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const exampleRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const { data: lessonGrammar = [], isLoading: loading } = useGrammarsQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  useEffect(() => {
    setAutoRead(readAutoReadPreference());
  }, []);

  useEffect(() => {
    stopPlayAll();
    setSpeechFocus(null);
  }, [currentLesson, stopPlayAll]);

  useEffect(() => {
    if (!speechFocus) return;

    const { grammarIndex, exampleIndex } = speechFocus;
    const target =
      exampleIndex != null && exampleIndex >= 0
        ? exampleRefs.current[`${grammarIndex}-${exampleIndex}`]
        : cardRefs.current[grammarIndex];

    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [speechFocus]);

  const focusGrammar = useCallback((grammarIndex: number, exampleIndex?: number | null) => {
    setSpeechFocus({ grammarIndex, exampleIndex: exampleIndex ?? null });
  }, []);

  const clearFocus = useCallback(() => setSpeechFocus(null), []);

  const toggleAutoRead = useCallback(() => {
    setAutoRead((prev) => {
      const next = !prev;
      localStorage.setItem(AUTO_READ_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  const playGrammarExplanation = useCallback(async (grammar: Grammar, index: number) => {
    const text = grammarExplanationSpeechText(grammar);
    if (!text) return;

    stopPlayAll();
    focusGrammar(index);

    await playAudioSequence([text], {
      lang: 'vi-VN',
      rate: 1,
      onEnd: clearFocus,
      onStop: clearFocus,
    });
  }, [stopPlayAll, focusGrammar, clearFocus]);

  const playGrammarCard = useCallback(async (grammar: Grammar, index: number) => {
    const viText = grammarExplanationSpeechText(grammar);
    const jpSegments = grammarSpeechSegments(grammar.pattern, grammar.examples ?? []);
    if (!viText && !jpSegments.length) return;

    stopPlayAll();
    focusGrammar(index);

    if (viText) {
      await playAudioSequence([viText], {
        lang: 'vi-VN',
        rate: 1,
      });
    }

    if (jpSegments.length) {
      await playAudioSequence(jpSegments, {
        lang: 'ja-JP',
        onItem: (itemIndex) => {
          // 0 = mẫu ngữ pháp; 1+ = ví dụ
          focusGrammar(index, itemIndex > 0 ? itemIndex - 1 : null);
        },
      });
    }

    clearFocus();
  }, [stopPlayAll, focusGrammar, clearFocus]);

  useEffect(() => {
    if (!autoRead || loading || lessonGrammar.length === 0) return;

    const segments = allLessonExplanationTexts(lessonGrammar);
    if (!segments.length) return;

    let cancelled = false;

    const run = async () => {
      stopPlayAll();
      await playAudioSequence(segments, {
        lang: 'vi-VN',
        rate: 1,
        pauseMs: 600,
        onItem: (index) => {
          if (!cancelled) focusGrammar(index);
        },
        onEnd: () => {
          if (!cancelled) clearFocus();
        },
        onStop: () => {
          if (!cancelled) clearFocus();
        },
      });
    };

    const timer = setTimeout(() => {
      void run();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      stopAudio();
    };
  }, [autoRead, loading, currentLesson, lessonGrammar, stopPlayAll, focusGrammar, clearFocus]);

  const allSegments = allLessonExplanationTexts(lessonGrammar);

  const handlePlayAll = () => {
    startPlayAll(allSegments, {
      lang: 'vi-VN',
      rate: 1,
      pauseMs: 600,
      onItemIndex: (index) => focusGrammar(index),
    }).finally(clearFocus);
  };

  const handleStopAll = () => {
    stopPlayAll();
    clearFocus();
  };

  const playExample = (grammarIndex: number, exampleIndex: number, jp: string) => {
    stopPlayAll();
    focusGrammar(grammarIndex, exampleIndex);
    void playAudioSequence([speechTextFromJapanese(jp)], {
      lang: 'ja-JP',
      onEnd: clearFocus,
      onStop: clearFocus,
    });
  };

  return (
    <div className="container grammar-view">
      <div className="grammar-header">
        <h2 className="view-title">Ngữ pháp Minna no Nihongo</h2>

        <LessonSelector
          id="grammar-lesson-select"
          value={currentLesson}
          onChange={setCurrentLesson}
          countKind="grammar"
        />

        {!loading && lessonGrammar.length > 0 && (
          <p className="grammar-lesson-summary">
            Bài {currentLesson} gồm {lessonGrammar.length} mục ngữ pháp
          </p>
        )}

        <div className="grammar-audio-controls">
          <label className="grammar-auto-read">
            <input
              type="checkbox"
              checked={autoRead}
              onChange={toggleAutoRead}
            />
            <span>Tự đọc khi chọn bài</span>
          </label>

          {!loading && allSegments.length > 0 && (
            <PlayAllButton
              isPlaying={isPlayingAll}
              onPlay={handlePlayAll}
              onStop={handleStopAll}
              label="Đọc cả bài (giải thích)"
            />
          )}
        </div>
      </div>

      <div className="grammar-content">
        {loading ? (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : lessonGrammar.length > 0 ? (
          lessonGrammar.map((grammar, index) => {
            const isCardActive = speechFocus?.grammarIndex === index;
            const activeExampleIndex = isCardActive ? speechFocus?.exampleIndex : null;

            return (
              <div
                key={grammarCardId(grammar, index)}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`grammar-card glass-panel${isCardActive ? ' grammar-card--speaking' : ''}`}
                data-grammar-index={index}
                aria-current={isCardActive ? 'true' : undefined}
              >
                <div className="grammar-pattern-header">
                  <span className={`grammar-index${isCardActive ? ' grammar-index--speaking' : ''}`}>
                    {index + 1}
                  </span>
                  <h3 className="grammar-pattern japanese-text">{grammar.pattern}</h3>
                  <button
                    type="button"
                    className="btn-audio-small"
                    onClick={() => void playGrammarExplanation(grammar, index)}
                    title="Đọc giải thích tiếng Việt"
                    aria-label="Đọc giải thích tiếng Việt"
                  >
                    🔊
                  </button>
                  <button
                    type="button"
                    className="btn-grammar-read-card"
                    onClick={() => void playGrammarCard(grammar, index)}
                    title="Đọc giải thích tiếng Việt rồi mẫu và ví dụ tiếng Nhật"
                  >
                    Đọc mục này
                  </button>
                </div>

                <div className="grammar-meaning">
                  <strong>Ý nghĩa:</strong> {grammar.meaning}
                </div>

                {grammar.explanation && (
                  <div className="grammar-explanation" style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Giải thích:</strong> {grammar.explanation}
                  </div>
                )}

                {(grammar.examples || []).length > 0 && (
                  <div className="grammar-examples">
                    <h4>Ví dụ:</h4>
                    <ul className="example-list">
                      {(grammar.examples || []).map((ex, exIndex) => {
                        const isExActive = isCardActive && activeExampleIndex === exIndex;

                        return (
                          <li
                            key={exIndex}
                            ref={(el) => {
                              exampleRefs.current[`${index}-${exIndex}`] = el;
                            }}
                            className={`example-item${isExActive ? ' example-item--speaking' : ''}`}
                          >
                            <div className="example-jp">
                              <span className="japanese-text">{ex.jp}</span>
                              <button
                                type="button"
                                className="btn-audio-small"
                                onClick={() => playExample(index, exIndex, ex.jp)}
                                title="Nghe phát âm"
                                aria-label="Nghe phát âm ví dụ"
                              >
                                🔊
                              </button>
                            </div>
                            {ex.romaji && <div className="example-romaji">{ex.romaji}</div>}
                            {(ex.vi || ex.en) && (
                              <div className="example-vi">{ex.vi || ex.en}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>
              Dữ liệu ngữ pháp cho Bài {currentLesson} chưa có sẵn. Hãy chọn bài khác
              nhé!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
