'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  grammarExampleRomaji,
  grammarExampleSpeechText,
} from '../utils/grammarExample';
import {
  grammarExplanationSpeechText,
  grammarSpeechSegments,
  loadSpeechVoices,
  playAudioSequence,
  SPEECH_LANG,
  stopAudio,
} from '../utils/speech';
import type { Grammar } from '../types/api';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useAuth } from '../hooks/useAuth';
import { useGrammarsQuery, useLessonsQuery } from '../hooks/queries';
import { queryKeys } from '../api/query-keys';
import { createGrammar, deleteGrammar, updateGrammar } from '../api';
import {
  grammarQuickAnalysis,
  grammarUsageBullets,
  parseGrammarExplanation,
} from '../utils/grammar';
import FuriganaText from '../components/FuriganaText';
import {
  isGrammarPinned,
  pinGrammar,
  unpinGrammar,
} from '../utils/grammarSrs';
import './GrammarView.css';

const AUTO_READ_KEY = 'nihongo-grammar-auto-read';

type ExampleDraft = {
  jp: string;
  romaji: string;
  vi: string;
};

type GrammarDraft = {
  pattern: string;
  meaning: string;
  explanation: string;
  examples: ExampleDraft[];
};

const emptyExample = (): ExampleDraft => ({ jp: '', romaji: '', vi: '' });

const emptyGrammarDraft = (): GrammarDraft => ({
  pattern: '',
  meaning: '',
  explanation: '',
  examples: [emptyExample()],
});

function draftFromGrammar(grammar: Grammar): GrammarDraft {
  const examples = (grammar.examples ?? []).map((example) => ({
    jp: example.jp,
    romaji: example.romaji ?? '',
    vi: example.vi ?? example.en ?? '',
  }));
  return {
    pattern: grammar.pattern,
    meaning: grammar.meaning,
    explanation: grammar.explanation ?? '',
    examples: examples.length ? examples : [emptyExample()],
  };
}

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
  const { isAdmin, token } = useAuth();
  const queryClient = useQueryClient();
  const { data: lessons = [] } = useLessonsQuery();
  const { data: lessonGrammar = [], isLoading: loading } = useGrammarsQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<GrammarDraft>(emptyGrammarDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFuri, setShowFuri] = useState(true);
  const [pinTick, setPinTick] = useState(0);

  const canEdit = isAdmin && editMode;
  const currentLessonMeta = lessons.find((lesson) => lesson.lessonNumber === currentLesson);
  const lessonId = currentLessonMeta?.id ?? null;
  const currentJlptLevel = currentLessonMeta?.jlptLevel ?? null;
  const viewTitle =
    currentJlptLevel && ['N3', 'N2', 'N1'].includes(currentJlptLevel)
      ? `Ngữ pháp JLPT ${currentJlptLevel}`
      : 'Ngữ pháp Minna no Nihongo';

  useEffect(() => {
    setAutoRead(readAutoReadPreference());
    void loadSpeechVoices();
  }, []);

  useEffect(() => {
    stopPlayAll();
    setSpeechFocus(null);
    setAdding(false);
    setEditingId(null);
    setError(null);
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
      lang: SPEECH_LANG.vi,
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
        lang: SPEECH_LANG.vi,
        rate: 1,
      });
    }

    if (jpSegments.length) {
      await playAudioSequence(jpSegments, {
        lang: SPEECH_LANG.ja,
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
        lang: SPEECH_LANG.vi,
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
      lang: SPEECH_LANG.vi,
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
    void playAudioSequence([grammarExampleSpeechText(jp)], {
      lang: SPEECH_LANG.ja,
      onEnd: clearFocus,
      onStop: clearFocus,
    });
  };

  async function invalidateGrammar() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.grammar.byLesson(currentLesson) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all }),
    ]);
  }

  function toggleEditMode() {
    stopPlayAll();
    setEditMode((on) => {
      if (on) {
        setAdding(false);
        setEditingId(null);
        setError(null);
      }
      return !on;
    });
  }

  function startAdd() {
    setEditingId(null);
    setAdding((on) => {
      if (on) return false;
      setDraft(emptyGrammarDraft());
      setError(null);
      return true;
    });
  }

  function startEdit(grammar: Grammar) {
    setAdding(false);
    setEditingId(grammar.id);
    setDraft(draftFromGrammar(grammar));
    setError(null);
  }

  function patchExample(index: number, partial: Partial<ExampleDraft>) {
    setDraft((current) => ({
      ...current,
      examples: current.examples.map((example, i) =>
        i === index ? { ...example, ...partial } : example,
      ),
    }));
  }

  function addExampleRow() {
    setDraft((current) => ({ ...current, examples: [...current.examples, emptyExample()] }));
  }

  function removeExampleRow(index: number) {
    setDraft((current) => ({
      ...current,
      examples: current.examples.length <= 1
        ? [emptyExample()]
        : current.examples.filter((_, i) => i !== index),
    }));
  }

  function payloadFromDraft() {
    const pattern = draft.pattern.trim();
    const meaning = draft.meaning.trim();
    const explanation = draft.explanation.trim();
    if (!pattern || !meaning) {
      setError('Điền đủ mẫu ngữ pháp và ý nghĩa');
      return null;
    }
    if (lessonId == null) {
      setError('Không xác định được bài học');
      return null;
    }
    return {
      lessonId,
      pattern,
      meaning,
      explanation: explanation || null,
      examples: draft.examples
        .map((example) => ({
          jp: example.jp.trim(),
          romaji: example.romaji.trim(),
          vi: example.vi.trim() || null,
        }))
        .filter((example) => example.jp),
    };
  }

  async function saveEdit() {
    if (!token || editingId == null) return;
    const payload = payloadFromDraft();
    if (!payload) return;
    setBusy(true);
    setError(null);
    try {
      await updateGrammar(editingId, payload, token);
      setEditingId(null);
      await invalidateGrammar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không lưu được');
    } finally {
      setBusy(false);
    }
  }

  async function handleAdd() {
    if (!token) return;
    const payload = payloadFromDraft();
    if (!payload) return;
    setBusy(true);
    setError(null);
    try {
      await createGrammar(payload, token);
      setAdding(false);
      await invalidateGrammar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thêm được');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    if (!window.confirm('Xóa mục ngữ pháp này?')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteGrammar(id, token);
      if (editingId === id) setEditingId(null);
      await invalidateGrammar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không xóa được');
    } finally {
      setBusy(false);
    }
  }

  function renderAdminForm(onSave: () => void, onCancel: () => void, saveLabel: string) {
    return (
      <div className="grammar-admin-form">
        <input
          className="japanese-text"
          placeholder="Mẫu ngữ pháp *  例: ～は～です"
          value={draft.pattern}
          disabled={busy}
          onChange={(e) => setDraft({ ...draft, pattern: e.target.value })}
        />
        <input
          placeholder="Ý nghĩa *"
          value={draft.meaning}
          disabled={busy}
          onChange={(e) => setDraft({ ...draft, meaning: e.target.value })}
        />
        <textarea
          placeholder="Giải thích / cách dùng (tuỳ chọn). Có thể thêm dòng: Chú ý: ..."
          rows={4}
          value={draft.explanation}
          disabled={busy}
          onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
        />
        <div className="grammar-admin-examples">
          <strong>Ví dụ</strong>
          {draft.examples.map((example, index) => (
            <div key={index} className="grammar-admin-example-row">
              <input
                className="japanese-text"
                placeholder="Câu tiếng Nhật"
                value={example.jp}
                disabled={busy}
                onChange={(e) => patchExample(index, { jp: e.target.value })}
              />
              <input
                placeholder="Romaji"
                value={example.romaji}
                disabled={busy}
                onChange={(e) => patchExample(index, { romaji: e.target.value })}
              />
              <input
                placeholder="Nghĩa tiếng Việt"
                value={example.vi}
                disabled={busy}
                onChange={(e) => patchExample(index, { vi: e.target.value })}
              />
              <button
                type="button"
                className="grammar-admin-example-remove"
                disabled={busy}
                onClick={() => removeExampleRow(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="grammar-admin-example-add" disabled={busy} onClick={addExampleRow}>
            + Thêm ví dụ
          </button>
        </div>
        <div className="grammar-admin-form-actions">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={onSave}>
            {saveLabel}
          </button>
          <button type="button" className="btn btn-nav" disabled={busy} onClick={onCancel}>
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container grammar-view">
      <div className="grammar-header">
        <h2 className="view-title grammar-view-title">{viewTitle}</h2>
        <p className="grammar-lesson-summary">
          <Link href="/grammar-srs">Ôn mẫu đã ghim</Link>
        </p>

        <LessonSelector
          id="grammar-lesson-select"
          value={currentLesson}
          onChange={setCurrentLesson}
          countKind="grammar"
        />

        {!loading && lessonGrammar.length > 0 && (
          <p className="grammar-lesson-summary">
            {currentLessonMeta?.title ?? `Bài ${currentLesson}`} gồm{' '}
            {lessonGrammar.length} mục ngữ pháp
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
          <label className="grammar-auto-read">
            <input
              type="checkbox"
              checked={showFuri}
              onChange={() => setShowFuri((v) => !v)}
            />
            <span>Hiện furigana</span>
          </label>

          {!loading && allSegments.length > 0 && (
            <PlayAllButton
              isPlaying={isPlayingAll}
              onPlay={handlePlayAll}
              onStop={handleStopAll}
              label="Đọc cả bài (giải thích)"
            />
          )}

          {isAdmin && (
            <div className="grammar-admin-toolbar">
              <button
                type="button"
                className={`grammar-admin-toggle${editMode ? ' grammar-admin-toggle--on' : ''}`}
                disabled={busy}
                onClick={toggleEditMode}
              >
                {editMode ? 'Xong' : 'Sửa'}
              </button>
              {canEdit && (
                <button
                  type="button"
                  className="grammar-admin-add"
                  disabled={busy || lessonId == null}
                  onClick={startAdd}
                >
                  {adding ? 'Hủy thêm' : '+ Thêm'}
                </button>
              )}
            </div>
          )}
        </div>
        {error ? <p className="grammar-admin-error">{error}</p> : null}
      </div>

      <div className="grammar-content">
        {loading ? (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {canEdit && adding
              ? (
                <div className="grammar-card glass-panel grammar-card--editing">
                  {renderAdminForm(
                    () => void handleAdd(),
                    () => setAdding(false),
                    'Lưu mục mới',
                  )}
                </div>
              )
              : null}
            {lessonGrammar.length > 0 ? (
              lessonGrammar.map((grammar, index) => {
            const isCardActive = speechFocus?.grammarIndex === index;
            const activeExampleIndex = isCardActive ? speechFocus?.exampleIndex : null;
            const parsedExplanation = parseGrammarExplanation(grammar.explanation);
            const usageBullets = grammarUsageBullets(parsedExplanation.usage);

            if (canEdit && editingId === grammar.id) {
              return (
                <div
                  key={grammarCardId(grammar, index)}
                  className="grammar-card glass-panel grammar-card--editing"
                >
                  {renderAdminForm(
                    () => void saveEdit(),
                    () => setEditingId(null),
                    'Lưu',
                  )}
                </div>
              );
            }

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
                  {grammar.id != null && (
                    <button
                      type="button"
                      className="btn-grammar-read-card"
                      onClick={() => {
                        if (isGrammarPinned(grammar.id)) unpinGrammar(grammar.id);
                        else pinGrammar({
                          id: grammar.id,
                          pattern: grammar.pattern,
                          meaning: grammar.meaning,
                          lessonNumber: currentLesson,
                        });
                        setPinTick((n) => n + 1);
                      }}
                    >
                      {pinTick >= 0 && isGrammarPinned(grammar.id) ? 'Đã ghim' : 'Ghim ôn'}
                    </button>
                  )}
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
                  {canEdit && (
                    <div className="grammar-admin-row-actions">
                      <button type="button" disabled={busy} onClick={() => startEdit(grammar)}>
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="grammar-admin-delete"
                        disabled={busy}
                        onClick={() => void handleDelete(grammar.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>

                <div className="grammar-meaning">
                  <strong>Ý nghĩa:</strong> {grammar.meaning}
                </div>

                {usageBullets.length > 0 && (
                  <div className="grammar-explanation">
                    <strong>Giải thích:</strong>
                    <ul className="grammar-bullet-list">
                      {usageBullets.map((line, lineIndex) => (
                        <li key={lineIndex}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedExplanation.note && (
                  <div className="grammar-note">
                    <strong>Chú ý:</strong> {parsedExplanation.note}
                  </div>
                )}

                {!usageBullets.length && !parsedExplanation.note && grammar.explanation && (
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
                        const quickAnalysis = grammarQuickAnalysis(grammar.pattern, ex.jp);

                        return (
                          <li
                            key={exIndex}
                            ref={(el) => {
                              exampleRefs.current[`${index}-${exIndex}`] = el;
                            }}
                            className={`example-item${isExActive ? ' example-item--speaking' : ''}`}
                          >
                            <div className="example-jp">
                              <FuriganaText className="japanese-text" text={ex.jp} show={showFuri} />
                              {grammarExampleRomaji(ex.romaji) && (
                                <span className="example-romaji-inline">
                                  {grammarExampleRomaji(ex.romaji)}
                                </span>
                              )}
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
                            {(ex.vi || ex.en) && (
                              <div className="example-vi">{ex.vi || ex.en}</div>
                            )}
                            {quickAnalysis && (
                              <div className="example-analysis">{quickAnalysis}</div>
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
            ) : canEdit && adding ? null : (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>
              Dữ liệu ngữ pháp cho Bài {currentLesson} chưa có sẵn. Hãy chọn bài khác
              nhé!
            </p>
          </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
