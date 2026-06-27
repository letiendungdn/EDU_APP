'use client';

import { useState, useEffect } from 'react';
import { playAudio, speechTextFromJapanese } from '../utils/speech';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useGrammarsQuery } from '../hooks/queries';
import './GrammarView.css';

export default function GrammarView() {
  const [currentLesson, setCurrentLesson] = useState(1);
  const { data: lessonGrammar = [], isLoading: loading } = useGrammarsQuery(currentLesson);
  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();

  useEffect(() => {
    stopPlayAll();
  }, [currentLesson, stopPlayAll]);

  const allExamples = lessonGrammar.flatMap((g) =>
    (g.examples || []).map((ex) => speechTextFromJapanese(ex.jp)).filter(Boolean),
  );

  const handlePlayAll = () => {
    startPlayAll(allExamples);
  };

  return (
    <div className="container grammar-view">
      <div className="grammar-header">
        <h2 className="view-title">Ngữ pháp Minna no Nihongo</h2>

        <LessonSelector
          id="grammar-lesson-select"
          value={currentLesson}
          onChange={setCurrentLesson}
        />

        {!loading && allExamples.length > 0 && (
          <PlayAllButton
            isPlaying={isPlayingAll}
            onPlay={handlePlayAll}
            onStop={stopPlayAll}
            label="Phát tất cả ví dụ"
          />
        )}
      </div>

      <div className="grammar-content">
        {loading ? (
          <div className="empty-state glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : lessonGrammar.length > 0 ? (
          lessonGrammar.map((grammar, index) => (
            <div key={grammar.id || index} className="grammar-card glass-panel">
              <div className="grammar-pattern-header">
                <span className="grammar-index">{index + 1}</span>
                <h3 className="grammar-pattern japanese-text">{grammar.pattern}</h3>
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
                    {(grammar.examples || []).map((ex, exIndex) => (
                      <li key={exIndex} className="example-item">
                        <div className="example-jp">
                          <span className="japanese-text">{ex.jp}</span>
                          <button
                            className="btn-audio-small"
                            onClick={() => playAudio(speechTextFromJapanese(ex.jp))}
                            title="Nghe phát âm"
                          >
                            🔊
                          </button>
                        </div>
                        {ex.romaji && <div className="example-romaji">{ex.romaji}</div>}
                        {(ex.vi || ex.en) && (
                          <div className="example-vi">{ex.vi || ex.en}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
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
