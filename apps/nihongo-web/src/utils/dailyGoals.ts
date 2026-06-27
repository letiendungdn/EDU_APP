import { DAILY_REVIEW_LIMIT, getMistakeStats } from './mistakeVocab';
import { DEFAULT_GOAL_MINUTES, loadListeningStats } from './dailyListeningProgress';
import { todayKey } from './dailyNotes';

const STORAGE_KEY = 'nihongo-daily-goals';

export type GoalKind = 'listening' | 'vocab' | 'grammar' | 'reading' | 'custom';

export interface DailyGoalItem {
  id: string;
  kind: GoalKind;
  label: string;
  done: boolean;
  target?: number;
}

export interface DailyGoalsDay {
  items: DailyGoalItem[];
  updatedAt: string;
}

export type DailyGoalsStore = Record<string, DailyGoalsDay>;

function defaultItems(listeningTarget: number, vocabTarget: number): DailyGoalItem[] {
  return [
    {
      id: 'listening',
      kind: 'listening',
      label: 'Nghe đủ phút mục tiêu',
      done: false,
      target: listeningTarget,
    },
    {
      id: 'vocab',
      kind: 'vocab',
      label: 'Ôn từ sai',
      done: false,
      target: vocabTarget,
    },
    {
      id: 'grammar',
      kind: 'grammar',
      label: 'Học 1 bài ngữ pháp',
      done: false,
    },
    {
      id: 'reading',
      kind: 'reading',
      label: 'Làm 1 bài đọc hiểu',
      done: false,
    },
  ];
}

export function loadAllGoals(): DailyGoalsStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as DailyGoalsStore;
  } catch {
    return {};
  }
}

function autoProgress(kind: GoalKind, target?: number): { done: boolean; progress?: string } {
  if (kind === 'listening') {
    const mins = loadListeningStats().minutesToday;
    const goal = target ?? DEFAULT_GOAL_MINUTES;
    return { done: mins >= goal, progress: `${mins}/${goal} phút` };
  }
  if (kind === 'vocab') {
    const stats = getMistakeStats();
    const goal = target ?? Math.min(10, DAILY_REVIEW_LIMIT);
    return { done: stats.reviewedToday >= goal, progress: `${stats.reviewedToday}/${goal} từ` };
  }
  return { done: false };
}

export function resolveGoalsForDate(
  date: string,
  listeningTarget = DEFAULT_GOAL_MINUTES,
  vocabTarget = Math.min(10, DAILY_REVIEW_LIMIT),
): DailyGoalItem[] {
  const store = loadAllGoals();
  const saved = store[date];
  const base = saved?.items?.length
    ? saved.items
    : defaultItems(listeningTarget, vocabTarget);

  const merged = base.map((item) => {
    if (date !== todayKey() || (item.kind !== 'listening' && item.kind !== 'vocab')) {
      return item;
    }
    const auto = autoProgress(item.kind, item.target);
    return { ...item, done: auto.done };
  });

  return merged;
}

export function saveGoalsLocal(date: string, items: DailyGoalItem[]): DailyGoalsDay {
  const store = loadAllGoals();
  const entry: DailyGoalsDay = {
    items,
    updatedAt: new Date().toISOString(),
  };
  store[date] = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  return entry;
}

export function toggleGoalLocal(
  date: string,
  goalId: string,
  listeningTarget = DEFAULT_GOAL_MINUTES,
  vocabTarget = Math.min(10, DAILY_REVIEW_LIMIT),
): DailyGoalItem[] {
  const items = resolveGoalsForDate(date, listeningTarget, vocabTarget);
  const next = items.map((g) => {
    if (g.id !== goalId) return g;
    if (g.kind === 'listening' || g.kind === 'vocab') return g;
    return { ...g, done: !g.done };
  });
  saveGoalsLocal(date, next);
  return next;
}

export function addCustomGoalLocal(
  date: string,
  label: string,
  listeningTarget = DEFAULT_GOAL_MINUTES,
  vocabTarget = Math.min(10, DAILY_REVIEW_LIMIT),
): DailyGoalItem[] {
  const trimmed = label.trim();
  if (!trimmed) return resolveGoalsForDate(date, listeningTarget, vocabTarget);

  const items = resolveGoalsForDate(date, listeningTarget, vocabTarget);
  const next = [
    ...items,
    {
      id: `custom-${Date.now()}`,
      kind: 'custom' as const,
      label: trimmed,
      done: false,
    },
  ];
  saveGoalsLocal(date, next);
  return next;
}

export function removeGoalLocal(
  date: string,
  goalId: string,
  listeningTarget = DEFAULT_GOAL_MINUTES,
  vocabTarget = Math.min(10, DAILY_REVIEW_LIMIT),
): DailyGoalItem[] {
  const items = resolveGoalsForDate(date, listeningTarget, vocabTarget).filter(
    (g) => g.id !== goalId || g.kind !== 'custom',
  );
  saveGoalsLocal(date, items);
  return items;
}

export function goalProgressLabel(item: DailyGoalItem): string | null {
  if (item.kind === 'listening') {
    const mins = loadListeningStats().minutesToday;
    return `${mins}/${item.target ?? DEFAULT_GOAL_MINUTES} phút`;
  }
  if (item.kind === 'vocab') {
    const stats = getMistakeStats();
    const goal = item.target ?? Math.min(10, DAILY_REVIEW_LIMIT);
    return `${stats.reviewedToday}/${goal} từ`;
  }
  return null;
}

export function countDone(items: DailyGoalItem[]): { done: number; total: number } {
  const total = items.length;
  const done = items.filter((g) => g.done).length;
  return { done, total };
}

export function mergeGoalsFromServer(
  local: DailyGoalsStore,
  server: Array<{ date: string; items: DailyGoalItem[]; updatedAt: string }>,
): DailyGoalsStore {
  const merged = { ...local };
  for (const row of server) {
    const localEntry = merged[row.date];
    const serverTime = new Date(row.updatedAt).getTime();
    const localTime = localEntry ? new Date(localEntry.updatedAt).getTime() : 0;
    if (!localEntry || serverTime >= localTime) {
      merged[row.date] = {
        items: row.items as DailyGoalItem[],
        updatedAt: row.updatedAt,
      };
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function goalsToSyncPayload(items: DailyGoalItem[]): DailyGoalItem[] {
  return items.map(({ id, kind, label, done, target }) => ({
    id,
    kind,
    label,
    done,
    ...(target !== undefined ? { target } : {}),
  }));
}
