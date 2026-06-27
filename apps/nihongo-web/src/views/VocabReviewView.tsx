'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { playAudio } from '../utils/speech';
import {
  DAILY_REVIEW_LIMIT,
  getAllMistakeWords,
  getMistakeStats,
  getTodayReviewBatch,
  recordReviewResult,
  syncToServer,
  removeMistakeWord,
} from '../utils/mistakeVocab';
import type { MistakeWord, MistakeStats } from '../utils/mistakeVocab';
import './VocabReviewView.css';

export default function VocabReviewView() {
  const [tab, setTab] = useState<'review' | 'bank'>('review');
  const [stats, setStats] = useState<MistakeStats>(getMistakeStats);
  const [bank, setBank] = useState<MistakeWord[]>(() => getAllMistakeWords());
  const [sessionActive, setSessionActive] = useState(false);
  const [queue, setQueue] = useState<MistakeWord[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);

  const refresh = useCallback(() => {
    setStats(getMistakeStats());
    setBank(getAllMistakeWords());
  }, []);

  const current = queue[index];

  const startReview = () => {
    const batch = getTodayReviewBatch(DAILY_REVIEW_LIMIT);
    if (!batch.length) return;
    setQueue(batch);
    setIndex(0);
    setRevealed(false);
    setSessionDone(false);
    setRememberedCount(0);
    setSessionActive(true);
  };

  const finishCard = (remembered: boolean): void => {
    if (!current) return;
    recordReviewResult(current.key, remembered);
    void syncToServer();
    if (remembered) setRememberedCount((n) => n + 1);

    if (index + 1 >= queue.length) {
      setSessionActive(false);
      setSessionDone(true);
      refresh();
      return;
    }

    setIndex((i) => i + 1);
    setRevealed(false);
  };

  const handlePlay = (e?: React.MouseEvent): void => {
    e?.stopPropagation?.();
    if (current?.kana) playAudio(current.kana);
  };

  const progressLabel = useMemo(() => {
    if (!sessionActive || !queue.length) return '';
    return `Từ ${index + 1} / ${queue.length}`;
  }, [sessionActive, queue.length, index]);

  return (
    <div className="container vocab-review-view">
      <header className="vr-header">
        <h2 className="view-title">Bảng từ vựng sai</h2>
        <p className="vr-subtitle">
          Tự động lưu từ làm sai trong Quiz &amp; thi thử. Ôn {DAILY_REVIEW_LIMIT} từ mỗi ngày.
        </p>
      </header>

      <section className="vr-stats glass-panel">
        <div>
          <strong>Trong bảng</strong>
          <span>{stats.total} từ</span>
        </div>
        <div>
          <strong>Đã thuộc</strong>
          <span>{stats.mastered} từ</span>
        </div>
        <div>
          <strong>Hôm nay</strong>
          <span>
            {stats.reviewedToday}/{stats.dailyGoal} từ
          </span>
        </div>
      </section>

      <div className="vr-tabs">
        <button
          type="button"
          className={`vr-tab ${tab === 'review' ? 'active' : ''}`}
          onClick={() => setTab('review')}
        >
          Ôn hôm nay
        </button>
        <button
          type="button"
          className={`vr-tab ${tab === 'bank' ? 'active' : ''}`}
          onClick={() => {
            setTab('bank');
            refresh();
          }}
        >
          Bảng từ sai ({stats.total})
        </button>
      </div>

      {tab === 'review' ? (
        <div className="vr-review">
          {!sessionActive && !sessionDone && (
            <div className="vr-start glass-panel">
              {stats.total === 0 ? (
                <>
                  <p>Chưa có từ nào trong bảng sai.</p>
                  <p className="vr-hint">
                    Làm <Link href="/quiz">Quiz</Link> hoặc{' '}
                    <Link href="/mock-exam">thi thử</Link> — từ trả lời sai sẽ được lưu tự động.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Hôm nay ôn <strong>{Math.min(DAILY_REVIEW_LIMIT, stats.total)}</strong> từ
                    ưu tiên lâu chưa ôn / sai nhiều lần.
                  </p>
                  <button type="button" className="btn btn-primary" onClick={startReview}>
                    Bắt đầu ôn {Math.min(DAILY_REVIEW_LIMIT, stats.total)} từ
                  </button>
                </>
              )}
            </div>
          )}

          {sessionActive && current && (
            <>
              <p className="vr-progress">{progressLabel}</p>
              <div
                className={`vr-card glass-panel ${revealed ? 'revealed' : ''}`}
                onClick={() => !revealed && setRevealed(true)}
              >
                <button type="button" className="btn-audio vr-audio" onClick={handlePlay}>
                  🔊
                </button>
                <span className="vr-display japanese-text">
                  {current.kanji || current.kana}
                </span>
                {!revealed ? (
                  <p className="vr-tap-hint">Chạm để xem nghĩa</p>
                ) : (
                  <>
                    <span className="vr-kana japanese-text">{current.kana}</span>
                    {current.romaji && <span className="vr-romaji">{current.romaji}</span>}
                    <p className="vr-meaning">{current.meaning}</p>
                    <p className="vr-meta">
                      Bài {current.lessonNumber} · Sai {current.wrongCount} lần
                    </p>
                  </>
                )}
              </div>

              {revealed && (
                <div className="vr-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => finishCard(false)}
                  >
                    😅 Chưa nhớ
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => finishCard(true)}
                  >
                    ✅ Nhớ rồi
                  </button>
                </div>
              )}
            </>
          )}

          {sessionDone && (
            <div className="vr-done glass-panel">
              <h3>🎉 Xong phiên ôn hôm nay!</h3>
              <p>
                Nhớ: <strong>{rememberedCount}</strong> / {queue.length} từ
              </p>
              <p className="vr-hint">
                Từ «Nhớ rồi» liên tiếp 3 lần sẽ được đánh dấu đã thuộc và ra khỏi bảng ôn.
              </p>
              <button type="button" className="btn btn-primary" onClick={startReview}>
                Ôn thêm (nếu còn từ)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="vr-bank">
          {bank.length === 0 ? (
            <div className="empty-state glass-panel">
              <p>Bảng trống — hãy làm quiz và trả lời sai để tích lũy từ cần ôn.</p>
            </div>
          ) : (
            <div className="vr-table-wrap glass-panel">
              <table className="vr-table">
                <thead>
                  <tr>
                    <th>Từ</th>
                    <th>Nghĩa</th>
                    <th>Bài</th>
                    <th>Sai</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bank.map((word) => (
                    <tr key={word.key}>
                      <td>
                        <span className="japanese-text">{word.kanji || word.kana}</span>
                        <small className="vr-table-kana">{word.kana}</small>
                      </td>
                      <td>{word.meaning}</td>
                      <td>
                        <Link href="/vocab">#{word.lessonNumber}</Link>
                      </td>
                      <td>{word.wrongCount}</td>
                      <td>
                        <button
                          type="button"
                          className="vr-remove-btn"
                          onClick={() => {
                            removeMistakeWord(word.key);
                            refresh();
                          }}
                          title="Xóa khỏi bảng"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
