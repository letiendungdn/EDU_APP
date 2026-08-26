'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useKanaChartsQuery } from '../hooks/queries';
import { playAudio } from '../utils/speech';
import {
  buildKanaQuiz,
  kanaSourcesFromCharts,
  type KanaQuizMode,
  type KanaQuizQuestion,
  type KanaScriptFilter,
} from '../utils/kanaQuiz';
import './QuizView.css';
import './VocabQuizView.css';

type QuizResult = 'correct' | 'wrong' | null;

const SECTION_OPTIONS = [
  { id: 'gojuon', label: '清音' },
  { id: 'dakuon', label: '濁音' },
  { id: 'handakuon', label: '半濁音' },
  { id: 'yoon', label: '拗音' },
] as const;

export default function KanaQuizView() {
  const { data: charts, isLoading } = useKanaChartsQuery();

  const [phase, setPhase] = useState<'setup' | 'quiz'>('setup');
  const [mode, setMode] = useState<KanaQuizMode>('char-to-romaji');
  const [script, setScript] = useState<KanaScriptFilter>('hiragana');
  const [sectionIds, setSectionIds] = useState<string[]>(['gojuon']);
  const [questions, setQuestions] = useState<KanaQuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState<QuizResult>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const pool = useMemo(
    () => kanaSourcesFromCharts(charts, script, sectionIds.length ? sectionIds : 'all'),
    [charts, script, sectionIds],
  );

  const scopeLabel = useMemo(() => {
    const scriptLabel =
      script === 'both' ? 'Hira + Kata' : script === 'hiragana' ? 'Hiragana' : 'Katakana';
    const sectionLabel =
      sectionIds.length === SECTION_OPTIONS.length || sectionIds.length === 0
        ? 'tất cả'
        : sectionIds
            .map((id) => SECTION_OPTIONS.find((s) => s.id === id)?.label ?? id)
            .join(', ');
    return `${scriptLabel} · ${sectionLabel}`;
  }, [script, sectionIds]);

  useEffect(() => {
    setPhase('setup');
    setQuestions([]);
    setIndex(0);
    setSelectedAnswer('');
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  }, [mode, script, sectionIds]);

  const current = questions[index];

  const toggleSection = (id: string) => {
    setSectionIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((item) => item !== id);
        return next.length ? next : prev;
      }
      return [...prev, id];
    });
  };

  const startQuiz = () => {
    const built = buildKanaQuiz(pool, mode, { optionCount: 4 });
    setQuestions(built);
    setIndex(0);
    setSelectedAnswer('');
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
    setPhase('quiz');
  };

  const handleSubmit = () => {
    if (!current || result !== null || !selectedAnswer) return;
    const isCorrect = selectedAnswer === current.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setResult(null);
  };

  const speakCurrent = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!current?.kana) return;
    playAudio(current.kana);
  };

  const speakOption = (e: React.MouseEvent, speak?: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (speak) playAudio(speak);
  };

  return (
    <div className="container quiz-view vocab-quiz-view">
      <div className="quiz-header">
        <h2 className="view-title">Trắc nghiệm Kana</h2>
        <p className="vocab-quiz-subtitle">
          Hiragana / Katakana · {scopeLabel} · {pool.length} chữ
        </p>
        <div className="vocab-quiz-links">
          <Link href="/kana" className="btn btn-outline">
            Bảng kana
          </Link>
          <Link href="/vocab/quiz" className="btn btn-outline">
            TN từ vựng
          </Link>
        </div>
      </div>

      {phase === 'setup' && (
        <div className="vocab-quiz-setup glass-panel">
          <div className="vocab-quiz-mode-tabs" role="tablist" aria-label="Hướng hỏi">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'char-to-romaji'}
              className={`btn tab-btn ${mode === 'char-to-romaji' ? 'active' : ''}`}
              onClick={() => setMode('char-to-romaji')}
            >
              Chữ → Romaji
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'romaji-to-char'}
              className={`btn tab-btn ${mode === 'romaji-to-char' ? 'active' : ''}`}
              onClick={() => setMode('romaji-to-char')}
            >
              Romaji → Chữ
            </button>
          </div>
          <p className="vocab-quiz-mode-hint">
            {mode === 'char-to-romaji'
              ? 'Xem hiragana/katakana, chọn romaji đúng.'
              : 'Xem romaji, chọn chữ kana đúng.'}
          </p>

          <div className="vocab-quiz-scope-tabs" role="tablist" aria-label="Loại chữ">
            {(
              [
                ['hiragana', 'Hiragana'],
                ['katakana', 'Katakana'],
                ['both', 'Cả hai'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={script === value}
                className={`btn tab-btn ${script === value ? 'active' : ''}`}
                onClick={() => setScript(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="vocab-quiz-presets" role="group" aria-label="Nhóm âm">
            {SECTION_OPTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`btn btn-outline vocab-quiz-preset-btn ${
                  sectionIds.includes(section.id) ? 'active' : ''
                }`}
                onClick={() => toggleSection(section.id)}
              >
                {section.label}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-outline vocab-quiz-preset-btn"
              onClick={() => setSectionIds(SECTION_OPTIONS.map((s) => s.id))}
            >
              Tất cả
            </button>
          </div>

          <div className="quiz-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={startQuiz}
              disabled={isLoading || pool.length < 2}
            >
              {isLoading ? 'Đang tải...' : `Bắt đầu · ${pool.length} câu (random)`}
            </button>
          </div>
          {!isLoading && pool.length < 2 && (
            <p className="vocab-quiz-empty-hint">Cần ít nhất 2 chữ để tạo trắc nghiệm.</p>
          )}
        </div>
      )}

      {phase === 'quiz' && finished && (
        <div className="quiz-result glass-panel">
          <div className="result-icon">{score.correct === questions.length ? '🎉' : '📚'}</div>
          <h3>Hoàn thành!</h3>
          <p className="result-score">
            Bạn trả lời đúng <strong>{score.correct}</strong> / <strong>{questions.length}</strong>{' '}
            câu
          </p>
          <p className="result-percent">
            {questions.length ? Math.round((score.correct / questions.length) * 100) : 0}%
          </p>
          <div className="quiz-actions">
            <button type="button" className="btn btn-primary" onClick={startQuiz}>
              Làm lại (random mới)
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setPhase('setup')}>
              Đổi chế độ
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && !finished && current && (
        <>
          <p className="quiz-progress">
            Câu {index + 1} / {questions.length}
            {score.total > 0 && (
              <span className="quiz-score">
                {' '}
                · Đúng {score.correct}/{score.total}
              </span>
            )}
          </p>

          <div className="quiz-card glass-panel">
            <span className="quiz-type-badge">
              {mode === 'char-to-romaji' ? 'Chữ → Romaji' : 'Romaji → Chữ'}
              {` · ${current.script === 'hiragana' ? 'ひらがな' : 'カタカナ'}`}
            </span>

            <div className="vocab-quiz-prompt-row">
              <h3
                className={`quiz-question ${
                  mode === 'char-to-romaji' ? 'japanese-text vocab-quiz-prompt-jp' : ''
                }`}
              >
                {current.prompt}
              </h3>
              <button
                type="button"
                className="btn-audio vocab-quiz-audio"
                onClick={speakCurrent}
                title="Nghe phát âm"
                aria-label="Nghe phát âm"
              >
                🔊
              </button>
            </div>
            {current.promptSub && <p className="vocab-quiz-prompt-sub">{current.promptSub}</p>}

            <div className="quiz-options">
              {current.options.map((option) => (
                <div key={option.text} className="vocab-quiz-option-wrap">
                  <button
                    type="button"
                    className={`quiz-option ${mode === 'romaji-to-char' ? 'japanese-text' : ''} ${
                      selectedAnswer === option.text ? 'selected' : ''
                    } ${result !== null && option.text === current.answer ? 'correct-answer' : ''} ${
                      result === 'wrong' && selectedAnswer === option.text ? 'wrong-answer' : ''
                    }`}
                    onClick={() => result === null && setSelectedAnswer(option.text)}
                    disabled={result !== null}
                  >
                    <span className="quiz-option-main">{option.text}</span>
                    {result !== null && (
                      <span
                        className={`quiz-option-reveal ${
                          mode === 'char-to-romaji' ? 'japanese-text' : ''
                        }`}
                      >
                        {option.reveal}
                      </span>
                    )}
                  </button>
                  {(mode === 'romaji-to-char' || result !== null) && option.speak && (
                    <button
                      type="button"
                      className="btn-audio-small vocab-quiz-option-audio"
                      onClick={(e) => speakOption(e, option.speak)}
                      title={`Nghe ${option.speak}`}
                      aria-label={`Nghe ${option.speak}`}
                    >
                      🔊
                    </button>
                  )}
                </div>
              ))}
            </div>

            {result && (
              <div className={`feedback ${result}`}>
                {result === 'correct' ? 'Đúng rồi!' : `Sai rồi. Đáp án: ${current.answer}`}
              </div>
            )}

            <div className="quiz-actions">
              {result === null ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                >
                  Kiểm tra
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  {index + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
