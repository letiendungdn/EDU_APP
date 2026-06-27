'use client';

import { useEffect, useState } from 'react';
import {
  loadListeningStats,
  useMinnaListeningPlayer,
  usePodcastTimer,
} from '../hooks/useDailyListeningSession';
import { useDailyListeningConfigQuery, useListeningPlaylistQuery } from '../hooks/queries';
import { DEFAULT_GOAL_MINUTES } from '../utils/dailyListeningProgress';
import type { ListeningPlaylistItem } from '../types/api';
import './DailyListeningView.css';

export default function DailyListeningView() {
  const { data: listeningConfig, isLoading: configLoading } = useDailyListeningConfigQuery();
  const goalMinutes = listeningConfig?.goalMinutes ?? DEFAULT_GOAL_MINUTES;
  const minnaListeningPresets = listeningConfig?.presets ?? [];
  const n5Podcasts = listeningConfig?.podcasts ?? [];

  const [tab, setTab] = useState<'minna' | 'podcast'>('minna');
  const [presetId, setPresetId] = useState('');
  const [showMeaning, setShowMeaning] = useState(true);
  const [stats, setStats] = useState(loadListeningStats);

  const resolvedPresetId = presetId || minnaListeningPresets[2]?.id || minnaListeningPresets[0]?.id || '';
  const preset =
    minnaListeningPresets.find((p) => p.id === resolvedPresetId) ?? minnaListeningPresets[0];

  const { data: playlistData, isLoading: loading } = useListeningPlaylistQuery(
    preset?.lessonFrom ?? 1,
    preset?.lessonTo ?? 25,
  );
  const playlist: ListeningPlaylistItem[] = playlistData?.items ?? [];

  const minna = useMinnaListeningPlayer(playlist);
  const podcast = usePodcastTimer();

  const refreshStats = () => setStats(loadListeningStats());

  useEffect(() => {
    if (minna.goalReached || podcast.goalReached) {
      refreshStats();
    }
  }, [minna.goalReached, podcast.goalReached]);

  const current = playlist[minna.currentIndex];
  const activeElapsed = tab === 'minna' ? minna.elapsed : podcast.elapsed;
  const activeProgress = tab === 'minna' ? minna.progressPct : podcast.progressPct;
  const activeGoalReached = tab === 'minna' ? minna.goalReached : podcast.goalReached;

  if (configLoading) {
    return (
      <div className="container daily-listening-view">
        <p style={{ textAlign: 'center', padding: '2rem' }}>Đang tải cấu hình nghe...</p>
      </div>
    );
  }

  return (
    <div className="container daily-listening-view">
      <header className="dl-header">
        <h2 className="view-title">Nghe mỗi ngày · N5</h2>
        <p className="dl-subtitle">
          Mục tiêu {goalMinutes} phút/ngày — audio Minna trong app hoặc podcast N5 bên ngoài.
        </p>
      </header>

      <section className="dl-stats glass-panel">
        <div className="dl-stat">
          <strong>Hôm nay</strong>
          <span>{stats.minutesToday}/{goalMinutes} phút</span>
        </div>
        <div className="dl-stat">
          <strong>Streak</strong>
          <span>{stats.streak} ngày 🔥</span>
        </div>
        <div className="dl-progress-ring" style={{ '--pct': activeProgress } as React.CSSProperties}>
          <span>{minna.formatTime(activeElapsed)}</span>
          <small>/ {goalMinutes}:00</small>
        </div>
      </section>

      {activeGoalReached && (
        <div className="dl-celebration glass-panel">
          🎉 Đủ {goalMinutes} phút hôm nay! Tiếp tục nghe hoặc quay lại mai nhé.
        </div>
      )}

      <div className="dl-tabs">
        <button
          type="button"
          className={`dl-tab ${tab === 'minna' ? 'active' : ''}`}
          onClick={() => setTab('minna')}
        >
          🎧 Audio Minna
        </button>
        <button
          type="button"
          className={`dl-tab ${tab === 'podcast' ? 'active' : ''}`}
          onClick={() => setTab('podcast')}
        >
          📻 Podcast N5
        </button>
      </div>

      {tab === 'minna' ? (
        <div className="dl-minna">
          <div className="dl-controls glass-panel">
            <label>
              Chọn phạm vi:
              <select
                value={resolvedPresetId}
                onChange={(e) => setPresetId(e.target.value)}
                disabled={minna.isRunning}
                className="select-input"
              >
                {minnaListeningPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="dl-checkbox">
              <input
                type="checkbox"
                checked={showMeaning}
                onChange={(e) => setShowMeaning(e.target.checked)}
              />
              Hiện nghĩa tiếng Việt khi nghe
            </label>
          </div>

          {loading ? (
            <div className="empty-state glass-panel">
              <p>Đang tạo playlist...</p>
            </div>
          ) : !playlist.length ? (
            <div className="empty-state glass-panel">
              <p>Chưa có dữ liệu audio. Hãy seed Minna trước.</p>
            </div>
          ) : (
            <>
              <div className="dl-now-playing glass-panel">
                <span className="dl-now-label">
                  {current?.type === 'sentence' ? 'Câu mẫu' : 'Từ vựng'} · Bài{' '}
                  {current?.lessonNumber}
                </span>
                <p className="dl-now-jp japanese-text">{current?.display}</p>
                {showMeaning && (
                  <p className="dl-now-meaning">{current?.meaning}</p>
                )}
                <p className="dl-queue-meta">
                  Playlist {playlist.length} mục · đang phát #{minna.currentIndex + 1}
                </p>
              </div>

              <div className="dl-player-actions">
                {!minna.isRunning && !minna.isPaused && (
                  <button type="button" className="btn btn-primary" onClick={minna.startSession}>
                    ▶️ Bắt đầu nghe
                  </button>
                )}
                {minna.isRunning && (
                  <button type="button" className="btn btn-outline" onClick={minna.pauseSession}>
                    ⏸ Tạm dừng
                  </button>
                )}
                {minna.isPaused && (
                  <button type="button" className="btn btn-primary" onClick={minna.resumeSession}>
                    ▶️ Tiếp tục
                  </button>
                )}
                {(minna.isRunning || minna.isPaused) && (
                  <button type="button" className="btn btn-outline" onClick={minna.stopSession}>
                    ⏹ Dừng hẳn
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="dl-podcast">
          <p className="dl-podcast-intro glass-panel">
            Mở podcast bên dưới (tab mới), bật bộ đếm {goalMinutes} phút và nghe. App ghi nhận
            thời gian khi đủ mục tiêu.
          </p>

          <div className="dl-player-actions">
            {!podcast.isRunning && (
              <button type="button" className="btn btn-primary" onClick={podcast.start}>
                ▶️ Bắt đầu đếm {goalMinutes} phút
              </button>
            )}
            {podcast.isRunning && (
              <button type="button" className="btn btn-outline" onClick={podcast.pause}>
                ⏸ Tạm dừng đếm
              </button>
            )}
            {!podcast.isRunning && podcast.elapsed > 0 && (
              <button type="button" className="btn btn-primary" onClick={podcast.start}>
                ▶️ Tiếp tục
              </button>
            )}
            <button type="button" className="btn btn-outline" onClick={podcast.reset}>
              ↺ Reset
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                podcast.complete();
                refreshStats();
              }}
            >
              ✓ Đánh dấu xong
            </button>
          </div>

          <div className="dl-podcast-list">
            {n5Podcasts.map((pod) => (
              <article key={pod.id} className="dl-podcast-card glass-panel">
                <div className="dl-podcast-head">
                  <h3>{pod.title}</h3>
                  <span className="dl-podcast-level">{pod.level}</span>
                </div>
                <p>{pod.desc}</p>
                <a
                  href={pod.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary dl-podcast-link"
                >
                  Mở podcast ↗
                </a>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
