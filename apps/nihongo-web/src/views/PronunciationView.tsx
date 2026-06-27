'use client';

import { useEffect, useMemo, useState } from 'react';
import { playAudio, stopAudio } from '../utils/speech';
import LessonSelector from '../components/LessonSelector';
import PlayAllButton from '../components/PlayAllButton';
import { usePlayAll } from '../hooks/usePlayAll';
import { useVocabulariesQuery, useKanaChartsQuery } from '../hooks/queries';
import { flattenKanaSections, kanaChartToItems } from '../utils/kana';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import './PronunciationView.css';

interface PronunciationItem {
  speakText: string;
  display: string;
  romaji?: string;
  hint?: string;
}

export default function PronunciationView() {
  const [source, setSource] = useState<'kana' | 'vocab'>('kana');
  const [kanaType, setKanaType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  const { data: lessonVocab = [], isLoading: vocabLoading } = useVocabulariesQuery(
    source === 'vocab' ? currentLesson : 0,
  );
  const loading = source === 'vocab' && vocabLoading;

  const { isPlayingAll, startPlayAll, stopPlayAll } = usePlayAll();
  const recorder = useAudioRecorder();

  const { data: kanaCharts } = useKanaChartsQuery();

  const kanaItems = useMemo(() => {
    const sections =
      kanaType === 'hiragana'
        ? (kanaCharts?.hiraganaSections ?? [])
        : (kanaCharts?.katakanaSections ?? []);
    return kanaChartToItems(flattenKanaSections(sections));
  }, [kanaType, kanaCharts]);

  const vocabItems = useMemo<PronunciationItem[]>(
    () =>
      lessonVocab.map((v) => ({
        speakText: v.kana,
        display: v.kanji || v.kana,
        romaji: v.romaji,
        hint: v.meaning,
      })),
    [lessonVocab],
  );

  const items: PronunciationItem[] = source === 'kana' ? kanaItems : vocabItems;
  const current = items[currentIndex];

  useEffect(() => {
    recorder.clearRecording();
    setIsFlipped(false);
    if (!current?.speakText) return undefined;

    if (autoPlay) {
      const timer = setTimeout(() => playAudio(current.speakText), 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentIndex, current?.speakText, autoPlay, source, kanaType, currentLesson, recorder]);

  useEffect(() => {
    stopPlayAll();
    recorder.clearRecording();
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [source, kanaType, currentLesson, stopPlayAll, recorder]);

  const goNext = () => {
    if (!items.length) return;
    stopAudio();
    recorder.clearRecording();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goPrev = () => {
    if (!items.length) return;
    stopAudio();
    recorder.clearRecording();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handlePlayModel = () => {
    if (current?.speakText) playAudio(current.speakText);
  };

  const handlePlayAll = () => {
    startPlayAll(
      items.map((item) => item.speakText),
      {
        onItemIndex: (index) => {
          recorder.clearRecording();
          setIsFlipped(false);
          setCurrentIndex(index);
        },
      },
    );
  };

  const handleRecordToggle = () => {
    stopAudio();
    if (recorder.isRecording) {
      recorder.stopRecording();
    } else {
      void recorder.startRecording();
    }
  };

  return (
    <div className="container pronunciation-view">
      <header className="pronunciation-header">
        <h2 className="view-title">Luyện phát âm</h2>
        <p className="pronunciation-subtitle">
          Nghe mẫu → ghi âm giọng bạn → nghe lại để so sánh. Không cần AI.
        </p>

        <div className="pronunciation-source-tabs">
          <button
            type="button"
            className={`btn tab-btn ${source === 'kana' ? 'active' : ''}`}
            onClick={() => setSource('kana')}
          >
            Kana
          </button>
          <button
            type="button"
            className={`btn tab-btn ${source === 'vocab' ? 'active' : ''}`}
            onClick={() => setSource('vocab')}
          >
            Từ vựng Minna
          </button>
        </div>

        {source === 'kana' ? (
          <div className="pronunciation-sub-tabs">
            <button
              type="button"
              className={`btn sub-tab ${kanaType === 'hiragana' ? 'active' : ''}`}
              onClick={() => setKanaType('hiragana')}
            >
              Hiragana
            </button>
            <button
              type="button"
              className={`btn sub-tab ${kanaType === 'katakana' ? 'active' : ''}`}
              onClick={() => setKanaType('katakana')}
            >
              Katakana
            </button>
          </div>
        ) : (
          <LessonSelector
            id="pronunciation-lesson"
            value={currentLesson}
            onChange={setCurrentLesson}
          />
        )}

        <label className="pronunciation-auto-play">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
          />
          Phát âm mẫu khi chuyển thẻ
        </label>

        {items.length > 0 && (
          <p className="pronunciation-progress">
            Thẻ {currentIndex + 1} / {items.length}
          </p>
        )}
      </header>

      {loading ? (
        <div className="empty-state glass-panel">
          <p>Đang tải...</p>
        </div>
      ) : !current ? (
        <div className="empty-state glass-panel">
          <p>Chưa có dữ liệu. Hãy chọn nguồn hoặc bài học khác.</p>
        </div>
      ) : (
        <div className="pronunciation-main">
          <div
            className={`pronunciation-flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="pronunciation-face front glass-panel">
              <span className="pronunciation-label">Đọc to phần này</span>
              <span className="pronunciation-display japanese-text">{current.display}</span>
              {current.romaji && (
                <span className="pronunciation-romaji">{current.romaji}</span>
              )}
            </div>
            <div className="pronunciation-face back glass-panel">
              <span className="pronunciation-label">Gợi ý</span>
              <span className="pronunciation-kana japanese-text">{current.speakText}</span>
              <p className="pronunciation-hint">{current.hint}</p>
            </div>
          </div>

          <div className="pronunciation-steps glass-panel">
            <div className="step-item">
              <span className="step-num">1</span>
              <button type="button" className="btn btn-outline" onClick={handlePlayModel}>
                🔊 Nghe mẫu
              </button>
            </div>
            <div className="step-item">
              <span className="step-num">2</span>
              <button
                type="button"
                className={`btn ${recorder.isRecording ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleRecordToggle}
              >
                {recorder.isRecording ? '⏹ Dừng ghi' : '🎤 Ghi âm'}
              </button>
              {recorder.isRecording && <span className="recording-dot">Đang ghi...</span>}
            </div>
            <div className="step-item">
              <span className="step-num">3</span>
              <button
                type="button"
                className="btn btn-outline"
                onClick={recorder.playRecording}
                disabled={!recorder.hasRecording}
              >
                ▶️ Nghe bản ghi
              </button>
            </div>
          </div>

          {recorder.error && <p className="pronunciation-error">{recorder.error}</p>}

          <div className="pronunciation-controls">
            <PlayAllButton
              isPlaying={isPlayingAll}
              onPlay={handlePlayAll}
              onStop={stopPlayAll}
              label="Phát tất cả mẫu"
            />
            <button type="button" className="btn btn-nav" onClick={goPrev}>
              ⬅️ Trước
            </button>
            <button type="button" className="btn btn-nav" onClick={goNext}>
              Sau ➡️
            </button>
          </div>

          <p className="pronunciation-tip">
            Mẹo: Nghe mẫu → ghi âm → nghe lại bản ghi → lật thẻ xem gợi ý → chuyển thẻ tiếp.
          </p>
        </div>
      )}
    </div>
  );
}
