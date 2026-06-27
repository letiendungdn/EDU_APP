'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LessonSelector from '../components/LessonSelector';
import { useExercisesQuery } from '../hooks/queries';
import { addMistakeWord, extractVocabFromExercise } from '../utils/mistakeVocab';
import type { Exercise } from '../types/api';
import './QuizView.css';

function parseOptions(options: Exercise['options']): string[] {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  try {
    const parsed = JSON.parse(options) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

type QuizResult = 'correct' | 'wrong' | null;

interface QuizScore {
  correct: number;
  total: number;
}

export default function QuizView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [fillAnswer, setFillAnswer] = useState('');
  const [result, setResult] = useState<QuizResult>(null);
  const [score, setScore] = useState<QuizScore>({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const { data: exercises = [], isLoading: loading } = useExercisesQuery(currentLesson);

  useEffect(() => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setFillAnswer('');
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  }, [currentLesson]);

  const currentExercise = exercises[currentIndex];

  const normalizeAnswer = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, '');

  const checkAnswer = (userAnswer: string): boolean => {
    if (!currentExercise) return false;
    const correct = normalizeAnswer(currentExercise.answer);
    const given = normalizeAnswer(userAnswer);
    return correct === given;
  };

  const handleSubmit = () => {
    if (!currentExercise || result !== null) return;

    const userAnswer =
      currentExercise.type === 'fill_in_blank' ? fillAnswer : selectedAnswer;

    if (!userAnswer.trim()) return;

    const isCorrect = checkAnswer(userAnswer);
    setResult(isCorrect ? 'correct' : 'wrong');
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!isCorrect) {
      const vocab = extractVocabFromExercise(currentExercise, currentLesson);
      if (vocab) addMistakeWord(vocab);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= exercises.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setFillAnswer('');
    setResult(null);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setFillAnswer('');
    setResult(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  };

  const options = currentExercise ? parseOptions(currentExercise.options) : [];

  return (
    <div className="container quiz-view">
      <div className="quiz-header">
        <h2 className="view-title">Luyện tập & Quiz</h2>
        <LessonSelector
          id="quiz-lesson-select"
          value={currentLesson}
          onChange={setCurrentLesson}
          filterWithContent={false}
        />
        {exercises.length > 0 && !finished && (
          <p className="quiz-progress">
            Câu {currentIndex + 1} / {exercises.length}
            {score.total > 0 && (
              <span className="quiz-score">
                {' '}
                · Đúng {score.correct}/{score.total}
              </span>
            )}
          </p>
        )}
      </div>

      {loading ? (
        <div className="empty-state glass-panel">
          <p>Đang tải câu hỏi...</p>
        </div>
      ) : exercises.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>
            Chưa có bài tập cho Bài {currentLesson}. Hãy thử chọn bài khác nhé!
          </p>
        </div>
      ) : finished ? (
        <div className="quiz-result glass-panel">
          <div className="result-icon">
            {score.correct === exercises.length ? '🎉' : '📚'}
          </div>
          <h3>Hoàn thành!</h3>
          <p className="result-score">
            Bạn trả lời đúng <strong>{score.correct}</strong> /{' '}
            <strong>{exercises.length}</strong> câu
          </p>
          <p className="result-percent">
            {Math.round((score.correct / exercises.length) * 100)}%
          </p>
          <div className="quiz-actions">
            <button className="btn btn-primary" onClick={handleRetry}>
              Làm lại
            </button>
            {score.correct < exercises.length && (
              <Link href="/vocab-review" className="btn btn-outline quiz-review-link">
                Ôn từ sai →
              </Link>
            )}
          </div>
        </div>
      ) : currentExercise ? (
        <div className="quiz-card glass-panel">
          <span className="quiz-type-badge">
            {currentExercise.type === 'multiple_choice'
              ? 'Trắc nghiệm'
              : 'Điền từ'}
          </span>

          <h3 className="quiz-question">{currentExercise.question}</h3>

          {currentExercise.type === 'multiple_choice' ? (
            <div className="quiz-options">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`quiz-option ${
                    selectedAnswer === option ? 'selected' : ''
                  } ${
                    result !== null && option === currentExercise.answer
                      ? 'correct-answer'
                      : ''
                  } ${
                    result === 'wrong' && selectedAnswer === option
                      ? 'wrong-answer'
                      : ''
                  }`}
                  onClick={() => result === null && setSelectedAnswer(option)}
                  disabled={result !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="quiz-fill">
              <input
                type="text"
                className={`fill-input ${
                  result === 'correct'
                    ? 'input-correct'
                    : result === 'wrong'
                      ? 'input-wrong'
                      : ''
                }`}
                placeholder="Nhập đáp án..."
                value={fillAnswer}
                onChange={(e) => setFillAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                disabled={result !== null}
              />
              {result === 'wrong' && (
                <p className="correct-hint">
                  Đáp án đúng: <strong>{currentExercise.answer}</strong>
                </p>
              )}
            </div>
          )}

          {result !== null && (
            <div className={`feedback ${result}`}>
              {result === 'correct' ? '✅ Chính xác!' : '❌ Chưa đúng rồi!'}
            </div>
          )}

          <div className="quiz-actions">
            {result === null ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={
                  currentExercise.type === 'fill_in_blank'
                    ? !fillAnswer.trim()
                    : !selectedAnswer
                }
              >
                Kiểm tra
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                {currentIndex + 1 >= exercises.length ? 'Xem kết quả' : 'Câu tiếp →'}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
