'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { fetchDailyGoals, fetchDailyNotes, upsertDailyGoals, upsertDailyNote } from '../api';
import { useDailyListeningConfigQuery } from '../hooks/queries';
import { getStoredToken } from '../lib/api-client';
import {
  addCustomGoalLocal,
  countDone,
  goalProgressLabel,
  goalsToSyncPayload,
  mergeGoalsFromServer,
  removeGoalLocal,
  resolveGoalsForDate,
  saveGoalsLocal,
  toggleGoalLocal,
  type DailyGoalItem,
} from '../utils/dailyGoals';
import {
  formatNoteDate,
  loadAllNotes,
  mergeNotesFromServer,
  previewText,
  saveNoteLocal,
  shiftDate,
  todayKey,
  type DailyNotesStore,
} from '../utils/dailyNotes';
import { DEFAULT_GOAL_MINUTES } from '../utils/dailyListeningProgress';
import './DailyNotesView.css';

const PROMPTS = [
  'Hôm nay học được gì?',
  'Từ mới: ',
  'Ngữ pháp khó: ',
  'Cần ôn lại: ',
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function DailyNotesView() {
  const { data: listeningConfig } = useDailyListeningConfigQuery();
  const listeningTarget = listeningConfig?.goalMinutes ?? DEFAULT_GOAL_MINUTES;

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [store, setStore] = useState<DailyNotesStore>({});
  const [content, setContent] = useState('');
  const [goals, setGoals] = useState<DailyGoalItem[]>([]);
  const [customGoal, setCustomGoal] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isToday = selectedDate === todayKey();
  const goalStats = useMemo(() => countDone(goals), [goals]);

  const refreshGoals = useCallback(() => {
    setGoals(resolveGoalsForDate(selectedDate, listeningTarget));
  }, [selectedDate, listeningTarget]);

  const noteDates = useMemo(() => {
    const dates = new Set(
      Object.keys(store).filter((d) => store[d]?.content?.trim()),
    );
    dates.add(selectedDate);
    return [...dates].sort((a, b) => b.localeCompare(a));
  }, [store, selectedDate]);

  const syncGoals = useCallback(
    (date: string, items: DailyGoalItem[]) => {
      saveGoalsLocal(date, items);
      const token = getStoredToken();
      if (!token) return;
      upsertDailyGoals(token, date, goalsToSyncPayload(items)).catch(() => {
        /* local vẫn ok */
      });
    },
    [],
  );

  useEffect(() => {
    const local = loadAllNotes();
    setStore(local);
    setContent(local[todayKey()]?.content ?? '');
    refreshGoals();
    setHydrated(true);

    const token = getStoredToken();
    if (!token) return;

    Promise.all([fetchDailyNotes(token), fetchDailyGoals(token)])
      .then(([notes, goalRows]) => {
        const mergedNotes = mergeNotesFromServer(local, notes);
        setStore(mergedNotes);
        setContent(mergedNotes[selectedDate]?.content ?? mergedNotes[todayKey()]?.content ?? '');
        mergeGoalsFromServer(
          {},
          goalRows.map((r) => ({
            date: r.date,
            items: r.items as DailyGoalItem[],
            updatedAt: r.updatedAt,
          })),
        );
        refreshGoals();
      })
      .catch(() => {
        /* localStorage vẫn dùng được */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const entry = store[selectedDate];
    setContent(entry?.content ?? '');
    refreshGoals();
    setSaveState('idle');
  }, [selectedDate, hydrated, store, refreshGoals]);

  useEffect(() => {
    if (!isToday || !hydrated) return;
    const id = setInterval(refreshGoals, 8000);
    return () => clearInterval(id);
  }, [isToday, hydrated, refreshGoals]);

  const persist = useCallback(
    (date: string, text: string) => {
      saveNoteLocal(date, text);
      setStore(loadAllNotes());
      setSaveState('saving');

      const token = getStoredToken();
      const done = () => setSaveState('saved');

      if (!token || !text.trim()) {
        done();
        return;
      }

      upsertDailyNote(token, date, text)
        .then(done)
        .catch(() => setSaveState('error'));
    },
    [],
  );

  const handleContentChange = (text: string) => {
    setContent(text);
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persist(selectedDate, text), 500);
  };

  const appendPrompt = (prompt: string) => {
    const prefix = content.trim() ? `${content.trimEnd()}\n\n` : '';
    handleContentChange(`${prefix}${prompt}`);
  };

  const handleToggleGoal = (goalId: string) => {
    const next = toggleGoalLocal(selectedDate, goalId, listeningTarget);
    setGoals(next);
    syncGoals(selectedDate, next);
  };

  const handleAddCustomGoal = () => {
    const next = addCustomGoalLocal(selectedDate, customGoal, listeningTarget);
    setGoals(next);
    setCustomGoal('');
    syncGoals(selectedDate, next);
  };

  const handleRemoveGoal = (goalId: string) => {
    const next = removeGoalLocal(selectedDate, goalId, listeningTarget);
    setGoals(next);
    syncGoals(selectedDate, next);
  };

  const statusLabel =
    saveState === 'saving'
      ? 'Đang lưu…'
      : saveState === 'saved'
        ? 'Đã lưu'
        : saveState === 'error'
          ? 'Lỗi đồng bộ — vẫn lưu trên máy'
          : '';

  const goalLinks: Record<string, string> = {
    listening: '/daily-listening',
    vocab: '/vocab-review',
    grammar: '/grammar',
    reading: '/reading',
  };

  return (
    <div className="container" style={{ padding: '1.5rem 1rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Hằng ngày</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Mục tiêu và ghi chú học Nhật — tự lưu trên trình duyệt
        {getStoredToken() ? ', đồng bộ khi đăng nhập' : ''}.
      </p>

      <section className="daily-goals-panel card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="daily-goals-header">
          <div>
            <h2 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>
              Mục tiêu {isToday ? 'hôm nay' : formatNoteDate(selectedDate)}
            </h2>
            <p className="daily-goals-sub">
              {goalStats.done}/{goalStats.total} hoàn thành
              {isToday ? ' · Nghe & ôn từ tự cập nhật' : ''}
            </p>
          </div>
          <div
            className="daily-goals-ring"
            style={{ '--pct': goalStats.total ? (goalStats.done / goalStats.total) * 100 : 0 } as React.CSSProperties}
          >
            <span>{goalStats.total ? Math.round((goalStats.done / goalStats.total) * 100) : 0}%</span>
          </div>
        </div>

        <ul className="daily-goals-list">
          {goals.map((goal) => {
            const progress = isToday ? goalProgressLabel(goal) : null;
            const autoKind = goal.kind === 'listening' || goal.kind === 'vocab';
            const href = goalLinks[goal.kind];

            return (
              <li key={goal.id} className={`daily-goal-item${goal.done ? ' done' : ''}`}>
                <label className="daily-goal-check">
                  <input
                    type="checkbox"
                    checked={goal.done}
                    disabled={autoKind && isToday}
                    onChange={() => handleToggleGoal(goal.id)}
                  />
                  <span className="daily-goal-label">
                    {href ? (
                      <Link href={href} className="daily-goal-link">
                        {goal.label}
                      </Link>
                    ) : (
                      goal.label
                    )}
                    {progress && <small className="daily-goal-progress">{progress}</small>}
                  </span>
                </label>
                {goal.kind === 'custom' && (
                  <button
                    type="button"
                    className="daily-goal-remove"
                    onClick={() => handleRemoveGoal(goal.id)}
                    aria-label="Xóa mục tiêu"
                  >
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="daily-goals-add">
          <input
            type="text"
            placeholder="Thêm mục tiêu riêng…"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCustomGoal();
            }}
          />
          <button type="button" className="btn" onClick={handleAddCustomGoal}>
            Thêm
          </button>
        </div>
      </section>

      <div className="daily-notes-layout">
        <aside className="daily-notes-sidebar card" style={{ padding: '1rem' }}>
          <h2>Các ngày đã ghi</h2>
          <div className="daily-notes-date-list">
            {noteDates.map((date) => {
              const entry = store[date];
              const isTodayDate = date === todayKey();
              return (
                <button
                  key={date}
                  type="button"
                  className={`daily-notes-date-btn${date === selectedDate ? ' active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="date-label">
                    {isTodayDate ? 'Hôm nay · ' : ''}
                    {date.split('-').reverse().join('/')}
                  </span>
                  {entry?.content?.trim() ? (
                    <span className="date-preview">{previewText(entry.content)}</span>
                  ) : (
                    <span className="date-preview">Chưa có ghi chú</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="daily-notes-editor card" style={{ padding: '1.25rem' }}>
          <div className="daily-notes-toolbar">
            <div>
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                Ghi chú · {formatNoteDate(selectedDate)}
              </h2>
              <div className="daily-notes-nav">
                <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}>
                  ← Trước
                </button>
                <button type="button" onClick={() => setSelectedDate(todayKey())}>
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                  disabled={selectedDate >= todayKey()}
                >
                  Sau →
                </button>
              </div>
            </div>
            {statusLabel && <span className="daily-notes-status">{statusLabel}</span>}
          </div>

          <div className="daily-notes-prompts">
            {PROMPTS.map((p) => (
              <button key={p} type="button" onClick={() => appendPrompt(p)}>
                + {p}
              </button>
            ))}
          </div>

          <textarea
            className="daily-notes-textarea"
            placeholder="Viết ghi chú học Nhật…&#10;&#10;Ví dụ: từ mới, câu khó, lỗi thường gặp."
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
          />

          <p className="daily-notes-hint">
            Mẹo: hoàn thành mục tiêu ở trên rồi tổng kết lại trong ghi chú cuối ngày.
          </p>
        </section>
      </div>
    </div>
  );
}
